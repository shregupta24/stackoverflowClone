import { create } from "zustand"; // create is a main function that is used to create a store in zustand
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware"; // middleware automatically store the store state in localstorage
//appwrirte exception used to handle the error from appwrite APIs and ID is used to generate unique ID
import { AppwriteException ,ID , Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs { //defines a custom prefrence object for users.In appwrite every user has a prefernce field
    reputation : number
}

interface IAuthStore { // defines the shape of our zustand store (Define what we need)
    session : Models.Session | null;
    jwt : string | null
    user : Models.User<UserPrefs> | null;
    hydrated : boolean

//declare store actions (functions that change state or call appwrite)
    setHydrated() : void; //hydration :- restoring state after refresh
    verifySession() : Promise<void>;
    login (
        email : string,
        password : string
    ) : Promise <{
        success:boolean;
        error ?: AppwriteException | null
    }>
    createAccount (
        name : string,
        email : string,
        password : string
    ) : Promise <{
        success:boolean;
        error ?: AppwriteException | null
    }>
    logout() : Promise<void>

}

export const useAuthStore = create <IAuthStore>()(
        persist( 
            immer((set) => ({
                session : null,
                jwt : null,
                user : null,
                hydrated : false,

                setHydrated(){
                    set({hydrated : true})
                },

                async verifySession(){ //check if the user already have a active appwrite session
                    try {
                     const session = await account.getSession("current")
                     set({session})   
                    } catch (error) {
                        console.log(error)
                    }
                },

                async login(email:string, password : string) {
                    try {
                        const session = await account.createEmailPasswordSession(email,password)
                        const [user , {jwt}] = await Promise.all([
                            account.get<UserPrefs>(), 
                            account.createJWT() //we don't need to do anything appwrite will automatically give a JWT token
                        ])
                        
                        if(!user.prefs?.reputation) await account.updatePrefs<UserPrefs>({
                            reputation : 0
                        })
                        set({ session, user, jwt });
                        return { success: true };
                        
                    } catch (error) {
                        console.log(error)
                        return {
                            success : false,
                            error:error instanceof AppwriteException ? 
                            error:null
                        }
                    }
                },
                async createAccount(name, email, password) {
                    try {
                        await account.create(ID.unique(10),email,password,name)
                        return {success : true}
                    } catch (error) {
                        console.log(error)
                        return {
                            success : false,
                            error:error instanceof AppwriteException ? 
                            error:null
                        }
                    }
                },
                async logout(){
                    try {
                       await account.deleteSessions()
                       set({session:null,jwt : null,user:null}) 
                    } catch (error) {
                        console.log(error)
                    }
                }
            })),
            {
                name : "auth",
                onRehydrateStorage(){
                    return(state,error) =>{
                        if(!error) state?.setHydrated()
                    }
                }
            }
        )
    )
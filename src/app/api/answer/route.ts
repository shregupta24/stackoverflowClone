import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/Store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request : NextRequest){
    try {
        const {questionId,answer,authorId} = await request.json();
        const response = await databases.createDocument(db,answerCollection,ID.unique(),{
            content : answer,
            questionId : questionId,
            authorId : authorId
        })

        // increase author prefernces

        //first grab the preference
        const pref = await users.getPrefs<UserPrefs>(authorId)
        //then increase the value by one
        await users.updatePrefs(authorId,{
            reputation : Number(pref.reputation) + 1
        })

        return NextResponse.json({response} , {status : 201})

    } catch (error : any) {
        return NextResponse.json(
            {
                message: error?.message || "Error in creating answer"
            },{
                status : 500
            }
        )
    }
}

export async function DELETE(request : NextRequest){
    try {
        const {answerId} = await request.json()
        const answer = await databases.getDocument(db,answerCollection,answerId);
        const response = await databases.deleteDocument(db,answerCollection,answerId);

        //decrease the user preference

        const pref = await users.getPrefs<UserPrefs>(answer.authorId)
        await users.updatePrefs(answer.authorId , {
            reputation : Number(pref.reputation) - 1
        })

        return NextResponse.json(response,{status : 200})
    } catch (error : any) {
       return NextResponse.json({message:error?.message},{status : 500}) 
    }
}
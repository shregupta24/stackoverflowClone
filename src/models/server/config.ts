//single file for creating all the app write services at one file and then exporting it from here

import env from "@/env";
import {Client,Avatars,Databases,Storage,Users} from "node-appwrite"
// connection to app write
let client = new Client();

client
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.projectId) // Your project ID
    .setKey(env.appwrite.apikey) // Your secret API key
;
// as we are doing this and then exporting the below helper we don't need to call client in all the files again and agian this is an example of DRY
const users = new Users(client); //helper for all user operations(create user, get user, list user details etc)
const databases = new Databases(client);// helper for all database operations(createCollection,createDocument,Listdocuments etc)
const storage = new Storage(client); // helper for file uploads and downloads
const avatars = new Avatars(client); // helper for user avatar(user profile images)

export {users,databases,storage,avatars,client}

import env from "@/env";
import {Client,Avatars,Databases,Storage,Users} from "node-appwrite"

let client = new Client();

client
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.projectId) // Your project ID
    .setKey(env.appwrite.apikey) // Your secret API key
;

const users = new Users(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export {users,databases,storage,avatars,client}

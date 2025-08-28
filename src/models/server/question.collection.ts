import { IndexType, Permission } from "node-appwrite"
import {db,questionCollection} from "../name"
import { databases } from "./config"

export default async function createQuestionCollection(){
    await databases.createCollection(db,questionCollection,questionCollection,[
        Permission.read("any"),// giving the permissions that who can read and write into the database so the can be read by anyone but only the logged in users can create it delete it and update it
        Permission.create("users"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users")
    ])
    console.log("Question collection is created")

    //create attributes 
    await Promise.all([
        databases.createStringAttribute(db,questionCollection,"Title",100,true),
        databases.createStringAttribute(db,questionCollection,"content",1000,true),
        databases.createStringAttribute(db,questionCollection,"authorId",50,true),
        databases.createStringAttribute(db,questionCollection,"tags",50,true,undefined,true),
        databases.createStringAttribute(db,questionCollection,"attachments",50,false),
    ])

    console.log("questions attributes created")

    // create indexes

    await Promise.all([
        databases.createIndex(db,questionCollection,"title",IndexType.Fulltext,["title"],['asc']),
        databases.createIndex(db,questionCollection,"content",IndexType.Fulltext,["content"],['asc'])
    ])
}
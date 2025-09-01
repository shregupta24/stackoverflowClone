import { Permission } from "node-appwrite"
import {answerCollection,db} from "../name"
import { databases } from "./config"

export default async function createAnswerCollection(){
    await databases.createCollection(db,answerCollection,answerCollection,[
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.delete("users"),
        Permission.update("users")
    ])

    console.log("Answer collection created")

    //creating attributes
    await Promise.all([
        databases.createStringAttribute(db,answerCollection,"content",1000,true),
        databases.createStringAttribute(db,answerCollection,"questionId",50,true),// for which ques the answer is given
        databases.createStringAttribute(db,answerCollection,"authorId",50,true), // who is giving the answer
    ])
    console.log("attributes created")

}
import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";   
import { databases } from "./config";

export default async function createOrGetDb(){
    try {
        await databases.get(db)
        console.log("database connection")
    } catch (error) {
        try {
            await databases.create(db,db)
            console.log("database created")

            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection()
            ])
            console.log("collection has being created successfully")
        } catch (error) {
            console.log("Error while creating database",error)
        }
    }

    return databases
}
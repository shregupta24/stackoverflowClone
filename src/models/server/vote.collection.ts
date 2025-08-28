import { Permission } from "node-appwrite"
import { voteCollection ,db} from "../name"
import { databases } from "./config"

export default async function createVoteCollection(){
    await databases.createCollection(db,voteCollection,voteCollection,[
        Permission.read("any"),
        Permission.create("users"),
        Permission.delete("users"),
        Permission.read("users"),
        Permission.update("users")
    ])

    console.log("Vote collection created")

    //creating attributes
    await Promise.all([
        databases.createEnumAttribute(db,voteCollection,"type",["question","answer"],true),
        databases.createStringAttribute(db,voteCollection,"typeId",50,true),
        databases.createEnumAttribute(db,voteCollection,"voteStatus",["upvoted","downvoted"],true),
        databases.createStringAttribute(db,voteCollection,"votedById",50,true)
    ]);
    console.log("attributes created")
}
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/Store/Auth";
import { Query } from "appwrite";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request : NextRequest){
    try {
        //grab the data
        const {type,typeId,voteStatus,votedById} = await request.json();
        const response = await databases.listDocuments(db,voteCollection,[
            Query.equal("type",type),
            Query.equal("typeId" , typeId),
            Query.equal("votedById" , votedById)
        ])
        //means now user has clicked the upvoted or downvoted button means 
        // if user has clicked let suppose upvote button for the first time that we have to increase the upvote 
        // of that ans/ques but if user has again clicked that it means now he wants to take his vote back 
        // so we have to decrease the upvote by one so the second time clicking we are handling it 
        // document already exist means someone has already upvoted or downvoted it
        if(response.documents.length > 0){
            //document exist

            await databases.deleteDocument(db,voteCollection,response.documents[0]?.$id)
            //decrease the reputation of the ans/ques of the author

            const QuestionOrAnswer = await databases.getDocument(db,type === "question" ? questionCollection : answerCollection,typeId)

            const authorPrefernce = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId)

            await users.updatePrefs(QuestionOrAnswer.authorId,{
                reputation : response.documents[0]?.voteStatus === "upvoted" ? Number(authorPrefernce.reputation) - 1 : Number(authorPrefernce.reputation) + 1
            })


        }
        //means the prev vote doesn't exist or vote status change means user has done upvote but now he wants to do 
        // downvote so this condition will match
        if(response.documents[0]?.voteStatus !== voteStatus){
            const response = await databases.createDocument(db,voteCollection,ID.unique(),{
                type,
                typeId,
                voteStatus,
                votedById
            })
            //increase or decrease the reputation

            const QuestionOrAnswer = await databases.getDocument(db,type === "question" ? questionCollection: answerCollection,typeId)
            const authorPrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId);

            //as this is a fresh document we can't directly update user prefernce

            //if vote was present
            if(response.documents[0]){
                //these means previous vote was upvoted and now its downvoted so we have to decrease the reputation
                await users.updatePrefs <UserPrefs>(QuestionOrAnswer.authorId , {
                    reputation : response.documents[0].voteStatus === "upvoted" 
                    ? Number(authorPrefs.reputation) - 1 
                    : Number(authorPrefs.reputation) + 1
                }) 
            }else{
                await users.updatePrefs(QuestionOrAnswer.authorId , {
                    reputation : response.documents[0] .voteStatus === "upvoted" 
                    ? Number(authorPrefs.reputation) + 1
                    : Number(authorPrefs.reputation) - 1
                })
            }
        }
        //now we have to grab total number of upvotes and downvotes that 
        // particular document has so that we can send it to the frontend to reflect it in UI
        const[upvotes,downvotes] = await Promise.all(
           [
                databases.listDocuments(db,voteCollection,[
                Query.equal("type",type),
                Query.equal("typeId" , typeId),
                Query.equal("voteStatus" , "upvoted"),
                Query.equal("votedById",votedById),
                Query.limit(1)
            ]),
                databases.listDocuments(db,voteCollection,[
                Query.equal("type",type),
                Query.equal("typeId" , typeId),
                Query.equal("voteStatus" , "downvoted"),
                Query.equal("votedById",votedById),
                Query.limit(1)
            ]),
           ]
        )

        return NextResponse.json({
            data:{
                document : null,
                voteResult : upvotes.total = downvotes.total
            },
            message:"votes calculated"
        },{
            status:200
        })
    } catch (error : any) {
       return NextResponse.json( {message : error?.message || "error in deleting vote"} , {status : 500}) 
    }
}
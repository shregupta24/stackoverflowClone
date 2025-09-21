import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/Store/Auth";
import { Query } from "appwrite";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    //  Grab request data
    const { type, typeId, voteStatus, votedById } = await request.json();

    // Check if this user has already voted on this doc
    const prevVotes = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedById", votedById),
    ]);

    const prevVote = prevVotes.documents[0]; // might be undefined

    // Get the question/answer doc + author info
    const QuestionOrAnswer = await databases.getDocument(
      db,
      type === "question" ? questionCollection : answerCollection,
      typeId
    );
    const authorPrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId);

    // If user clicked same vote again → remove vote
    if (prevVote && prevVote.voteStatus === voteStatus) {
      await databases.deleteDocument(db, voteCollection, prevVote.$id);

      await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
        reputation:
          voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) - 1 //if someone has upvoted the question 
            // and now he has again clicked that it means we are removing the upvote so the prefernce of 
            // user will get decrease by one or we can say it will return to it previous state
            : Number(authorPrefs.reputation) + 1,
            // and if it is downvote then we are increasing the prefernce / reputation of user
      });
    } else {
      // Otherwise, create/update vote
      if (prevVote) {
        // delete old vote first (switching upvote ↔ downvote)
        await databases.deleteDocument(db, voteCollection, prevVote.$id);
        // taking the reputation back to its original state
        await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
          reputation:
            prevVote.voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1 // remove old upvote
              : Number(authorPrefs.reputation) + 1, // remove old downvote
        });
      }

      // add new vote
      await databases.createDocument(db, voteCollection, ID.unique(), {
        type,
        typeId,
        voteStatus,
        votedById,
      });

      await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
        reputation:
          voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) + 1
            : Number(authorPrefs.reputation) - 1,
      });
    }

    // Get total votes (for all users, not just one)
    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [ //it will return a object with { "total" : no. of documents that matched the query , "documents" : first page of documents }
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "upvoted"),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "downvoted"),
      ]),
    ]);

    // Send result
    return NextResponse.json(
      {
        data: {
          upvotes: upvotes.total,
          downvotes: downvotes.total,
          total : upvotes.total + downvotes.total,
          document : prevVote
        },
        message: "votes calculated",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "error in processing vote" },
      { status: 500 }
    );
  }
}

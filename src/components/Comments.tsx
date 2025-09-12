"use client";

import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { useAuthStore } from "@/Store/Auth"
import { cn } from "@/lib/utils"
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "slugify";
import { IconTrash } from "@tabler/icons-react";
import { ID, Models } from "appwrite";
import Link from "next/link";
import React from "react";
//this ensure Typescript knows what fields exist 
interface CommentDocument extends Models.Document{
    content:string,
    authorId:string,
    authorName : string,
    type:"question" | "answer",
    typeId: string //id of that question/answer
}
const Comments = ({ //props being passed
    comments: _comments, //initial lists of comments from the server
    type, 
    typeId,
    className, //extra styling if needed
}: {
    comments: Models.DocumentList<CommentDocument>;
    type: "question" | "answer";
    typeId: string;
    className?: string;
}) => {
    const [comments, setComments] = React.useState(_comments); //local state to store the comments list
    const [newComment, setNewComment] = React.useState(""); //tracks what the user is typing in the comment text area
    const { user } = useAuthStore(); //logged in user info(from global auth store)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); //stops page reload
        if (!newComment || !user) return; //if no comment text or no logged in user exit

        try {
            const response = await databases.createDocument<CommentDocument>(db, commentCollection, ID.unique(), {
                content: newComment,
                authorId: user.$id,
                authorName : user.name,
                type: type,
                typeId: typeId,
            });

            setNewComment(() => "");
            setComments(prev => ({
                ...prev,
                total: prev.total + 1,
                documents: [response, ...prev.documents]
            }));
        } catch (error: any) {
            window.alert(error?.message || "Error creating comment");
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await databases.deleteDocument(db, commentCollection, commentId);
            //update local state by filtering out deleted comment
            setComments(prev => ({
                total: prev.total - 1,
                documents: prev.documents.filter(comment => comment.$id !== commentId),
            }));
        } catch (error: any) {
            window.alert(error?.message || "Error deleting comment");
        }
    };

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {comments.documents.map(comment => (
                <React.Fragment key={comment.$id}>
                    <hr className="border-white/40" />
                    <div className="flex gap-2">
                        <p className="text-sm">
                            {comment.content} -{" "}
                            <Link
                                href={`/users/${comment.authorId}/${slugify(comment.authorName)}`} //on clicking this link ths will take you to user profile page
                                className="text-orange-500 hover:text-orange-600"
                            >
                                {comment.authorName}
                            </Link>{" "}
                            <span className="opacity-60">
                                {convertDateToRelativeTime(new Date(comment.$createdAt))}
                            </span>
                        </p>
                        {/*if current user is the author of the comment then show the trash icon -> conditional rendering */}
                        {user?.$id === comment.authorId ? (
                            <button
                                onClick={() => deleteComment(comment.$id)}
                                className="shrink-0 text-red-500 hover:text-red-600"
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </React.Fragment>
            ))}
            <hr className="border-white/40" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
                    rows={1}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(() => e.target.value)}
                />
                <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Add Comment
                </button>
            </form>
        </div>
    );
};

export default Comments;
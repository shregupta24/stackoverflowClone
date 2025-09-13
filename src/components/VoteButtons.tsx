"use client";
// in front end we are checking that whether user has already voted in the document or 
// not if yes then hightlight the upvote button / downvote button and if haven't voted then no highlight
import { databases } from "@/models/client/config"; // it is used to call appwrite SDK method (eg. databases.listDcouments)
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/Store/Auth"; //custom hook to access auth state.
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react"; //visuals up/down arrow icons for upvote downvote buttons.
import { ID, Models, Query } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
interface VoteDocument extends Models.Document{
    voteStatus : string
}
const VoteButtons = ({
    type,
    id,
    upvotes,
    downvotes,
    className,
}: {
    type: "question" | "answer";
    id: string;
    upvotes: Models.DocumentList<Models.Document>; //total upvotes and downvotes
    downvotes: Models.DocumentList<Models.Document>;
    className?: string;
}) => {
    //we track whether the current user has already voted on this type/id.
    const [votedDocument, setVotedDocument] = React.useState<VoteDocument | null>(); // undefined means not fetched yet
    const [voteResult, setVoteResult] = React.useState<number>(upvotes.total - downvotes.total);

    const { user } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        (async () => {
            if (user) {
                const response  = await databases.listDocuments<VoteDocument>(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", id),
                    Query.equal("votedById", user.$id),
                ]);
                setVotedDocument(() => response.documents[0] || null); // if document exist 
            }
        })();
    }, [user, id, type]); //if either user, id or type changes re-render it

    const toggleUpvote = async () => {
        if (!user) return router.push("/login"); // if user is not logged in then redirect it to login page

        if (votedDocument === undefined) return;

        try {
            const response = await fetch(`/api/vote`, {
                method: "POST",
                headers :{
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "upvoted",
                    type,
                    typeId: id,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setVoteResult(() => data.data.voteResult);
            setVotedDocument(() => data.data.document);
        } catch (error: any) {
            window.alert(error?.message || "Something went wrong");
        }
    };

    const toggleDownvote = async () => {
        if (!user) return router.push("/login");

        if (votedDocument === undefined) return;

        try {
            const response = await fetch(`/api/vote`, {
                method: "POST",
                headers :{
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "downvoted",
                    type,
                    typeId: id,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setVoteResult(() => data.data.voteResult);
            setVotedDocument(() => data.data.document);
        } catch (error: any) {
            window.alert(error?.message || "Something went wrong");
        }
    };

    return (
        <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-4", className)}>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument.voteStatus === "upvoted"
                        ? "border-orange-500 text-orange-500" //adds an orange border with a text 
                        : "border-white/30"
                )}
                onClick={toggleUpvote}
            >
                <IconCaretUpFilled /> {/*this is the content of the button*/}
            </button>
            <span>{voteResult}</span>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument.voteStatus === "downvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={toggleDownvote}
            >
                <IconCaretDownFilled />
            </button>
        </div>
    );
};

export default VoteButtons;
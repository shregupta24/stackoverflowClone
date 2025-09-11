"use client";

import React from "react";
import { BorderBeam } from "./magicui/border-beam";
import Link from "next/link"; //does client side navigation in next.js
import { Models } from "appwrite";
import slugify from "slugify";
//import { avatars } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";//convert date into relative time like "3 hours ago"

interface quesDocument{
    $id : string,
    total : number,
    totalAnswers  : number,
    title : string,
    tags : string[],
    authorId : string,
    authorName : string,
    authorReputation? : number,
    $createdAt : string
}

const avatars = {
  getRandom(seed: string, width: number, height: number) {
    return {
      href: `https://avatars.dicebear.com/api/avataaars/${encodeURIComponent(seed)}.svg?width=${width}&height=${height}`
    };
  }
};

//question card component used to wrap the question with the no. of votes,answer,title,asked X time ago
const QuestionCard = ({ ques }: { ques: quesDocument }) => {
    const [height, setHeight] = React.useState(0);//height is used to pass size into borderbeam so the beam can match card height
    const ref = React.useRef<HTMLDivElement>(null);


    React.useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    }, [ref]);

    return (
        <div
            ref={ref}
            className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4 duration-200 hover:bg-white/10 sm:flex-row"
        >
            <BorderBeam size={height} duration={12} delay={9} />
            <div className="relative shrink-0 text-sm sm:text-right">
                <p>{ques.total ?? 0}  votes</p>
                <p>{ques.totalAnswers ?? 0} answers</p>
            </div>
            <div className="relative w-full">
                <Link
                    href={`/questions/${ques.$id}/${slugify(ques.title)}`}
                    className="text-orange-500 duration-200 hover:text-orange-600"
                >
                    <h2 className="text-xl">{ques.title}</h2>
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {ques.tags.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/questions?tag=${tag}`}
                            className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                        >
                            {tag}
                        </Link>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                        <picture>
                            <img
                                src={avatars.getRandom(ques.authorName,24,24).href}
                                alt={ques.authorName}
                                className="rounded-lg"
                            />
                        </picture>
                        <Link
                            href={`/users/${ques.authorId}/${slugify(ques.authorName)}`}
                            className="text-orange-500 hover:text-orange-600"
                        >
                            {ques.authorName}
                        </Link>
                        <strong>&quot;{ques.authorReputation}&quot;</strong>
                    </div>
                    <span>asked {convertDateToRelativeTime(new Date(ques.$createdAt))}</span>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
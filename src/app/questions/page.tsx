import { databases, users } from "@/models/server/config";
import { answerCollection, db, voteCollection, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import React from "react";
import Link from "next/link";
import ShimmerButton from "@/components/magicui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/Store/Auth";
import Pagination from "@/components/Pagination"; // a component to move between pages of questions
//we can't load thousands of questions at once -> bad performance
import Search from "./Search";
//a search bar component to filter questions

const Page = async ({
    searchParams,
}: {
    searchParams: { page?: string; tag?: string; search?: string };
    //getting serachParam obj we are parsing the value from that obj
}) => {
    searchParams.page ||= "1";
    //if page value is not present then its by default is 1 means by default we are at first page(pagination)

    const queries = [
        Query.orderDesc("$createdAt"), //sort the question from newest -> oldest
        Query.offset((+searchParams.page - 1) * 25), //offset to skip some no. of questions
        Query.limit(25),//only show 25 questions max at one page
    ];
    //for instance
    //queries = [Query.orderDesc("$createdAt"),Query.offset(1-1)*25 == 0 means 
    //we are at first page so need to skip any question , Query.limit(25) == show only 25 questions max]

    if (searchParams.tag) queries.push(Query.equal("tags", searchParams.tag));
    //if tag is present then add it as a query condition in the 
    //query array that we have created above like Query.equal("tags","javascript")
    if (searchParams.search)
        queries.push(
            Query.or([
                Query.search("title", searchParams.search),
                Query.search("content", searchParams.search),
            ])
        );
    // if serachParams contains search parameter then search 
    // it if any question title or content contains that word then return that doc 
    //all the queries will anded together
    const questions = await databases.listDocuments(db, questionCollection, queries);
    //return a response having documents and total that matches the all the condition in the queries array
    console.log("Questions", questions)

    questions.documents = await Promise.all(
        questions.documents.map(async ques => { //takes each question and adds extra info in it.
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId), //fetches user info
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1), // for optimization means if there are 100 answers it will fetch only the first answer document 
                    // but the total value will still 100 and as here we are here using only total value 
                    // to get the total no. of answers
                ]), //how many answers
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1), // for optimization
                ]),//how many votes
            ]);

            return {
                ...ques, //this is the original question document fetched from appwrite
                totalAnswers: answers.total,
                totalVotes: votes.total,
                authorId : author.$id,
                authorName : author.name,
                authorReputation : author.prefs.reputation
            };
        })
    );
//creates a new enriched question object
    return (
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Questions</h1>
                <Link href="/questions/ask">
                    <ShimmerButton className="shadow-2xl">
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                            Ask a question
                        </span>
                    </ShimmerButton>
                </Link>
            </div>
            <div className="mb-4">
                <Search />
            </div>
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {questions.documents.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;
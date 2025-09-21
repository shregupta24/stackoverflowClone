//custom wrapper component for questions
//we can't import editor directly because it uses browser things(window,document) and 
// server doesn't have this so it will give us error so that is why we are wrapping it inside dynamic 
// this says don't load it on server only load it when we are on browser
"use client";
import dynamic from "next/dynamic";
import Editor from "@uiw/react-md-editor";

// for more information, see https://mdxeditor.dev/editor/docs/getting-started

// This is the only place InitializedMDXEditor is imported directly.
const RTE = dynamic(
    () =>
        import("@uiw/react-md-editor").then(mod => {
            return mod.default;
        }),
    { ssr: false } //means does not load it on browser
);

export const MarkdownPreview = Editor.Markdown;

export default RTE;
//it is used to let user write formatted content in their question
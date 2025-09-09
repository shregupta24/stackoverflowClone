//custom wrapper component for questions
"use client"
//we can't import editor directly because it uses browser things(window,document) and 
// server doesn't have this so it will give us error so that is why we are wrapping it inside dynamic 
// this says don't load it on server only load it when we are on browser
import dynamic from "next/dynamic"

const RTE = dynamic(
    ()=>
        import ("@uiw/react-md-editor").then(mod => {
            return mod.default;
        }),
        {ssr : false}//meaning it will only loaded on the browser , not during server build
);

export default RTE
//it is used to let user write formatted content in their question
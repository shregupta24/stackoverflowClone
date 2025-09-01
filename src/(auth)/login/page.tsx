"use client"
import { useAuthStore } from "@/Store/Auth"
import React, { useState } from "react";

const LoginPage = () =>{
    const {login} = useAuthStore();
    const [isLoading,setIsLoading] = useState(false);
    const [error,setError] = useState("")

    const handleSumbit = async (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

        //collect the data
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email")
        const password = formData.get("password")

        //validate

        if(!email || !password){
            setError (() => "Please fill all the fields")
            return
        }

        //login => store

        setIsLoading(() => true)
        setError("")

        const loginResponse = await login(email.toString(),password.toString());
        if(loginResponse.error){
            setError(() => loginResponse.error!.message)
        }
        setIsLoading(() => true)
    }
}
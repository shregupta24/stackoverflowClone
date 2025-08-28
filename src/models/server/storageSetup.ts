import { Permission } from "node-appwrite"
import { questionAttachmentBucket } from "../name"
import { storage } from "./config"

export default async function getOrCreateStorage(){
    try {
        await storage.getBucket(questionAttachmentBucket);
        console.log("Storage Connected")
    } catch (error) {
        try {
           await storage.createBucket(
            questionAttachmentBucket,
            questionAttachmentBucket,
            [
                Permission.create("users"),
                Permission.read("users"),
                Permission.update("users"),
                Permission.delete("users"),
                Permission.read("any")
            ],
            false,
            undefined,
            undefined,
            ["jpg","png","gif","jpeg","webp","heic"]
           ) ;
           console.log("Storage created")
           console.log("Storage connected")
        } catch (error) {
            console.log("error connecting storage :",error)
        }
    }
}
import { Permission } from "node-appwrite"
import { questionAttachmentBucket } from "../name"
import { storage } from "./config"

export default async function getOrCreateStorage(){
    try {
        // if the bucket is already collected then no need to create another bucket just connect with that 
        // bucket is used here to store the images that the user will post with the question like screeshot or any other image
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
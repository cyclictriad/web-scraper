import FlashcardSet from "../models/FlashcardSet"

export default defineEventHandler(async(event)=>{
    try{

        return await FlashcardSet.find({})
    }catch(error){
        console.log("Error fetching quizes...", error.message)
    }
})
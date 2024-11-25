import { connectDB } from "../../db/mongoose"
import Chat from "../../models/Chat"

export default defineEventHandler(async (event) => {

    const userId = getCookie(event, '_id');
    const userChats = await Chat.find({ userId });

    return userChats;
})
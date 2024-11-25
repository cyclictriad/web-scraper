import { connectDB } from "../db/mongoose";
import User from "../models/User";

export default defineEventHandler(async (event) => {
    try {

        const userId = getCookie(event, '_id')
        const user = await User.findById(userId)
        if (!user) createError({ statusText: 'User not Found', status: 404 });
       
        return {
            courses:user.courses,
            subjects:user.subjects,
            ...user.preferences
        }
    } catch (error) {
        console.log(error)
    }
})
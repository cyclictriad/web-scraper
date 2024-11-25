import { connectDB } from "../db/mongoose";
import User from "../models/User";

export default defineEventHandler(async (event) => {

    const userId = getCookie(event, '_id');
    
    // Fetch the user and populate courses and subjects in the cover_page images field
    const user = await User.findById(userId)
        .populate('preferences.upload.document.cover_page.images.courses.id', 'name')  // Populate Course references
        .populate('preferences.upload.document.cover_page.images.subjects.id', 'name'); // Populate Subject references

    if (!user) {
        throw new Error('User not found');
    }

    // Map the courses and subjects to the desired structure
    const coverImages = {
        courses: user.preferences.upload.document.cover_page.images?.courses.map(course => ({
            _id: course.id._id,
            url: course.url,
            name: course.id.name,
        })) || [],
        subjects: user.preferences.upload.document.cover_page.images?.subjects.map(subject => ({
            _id: subject.id._id,
            url: subject.url,
            name: subject.id.name,
        })) || [],
    };

    return coverImages;
});

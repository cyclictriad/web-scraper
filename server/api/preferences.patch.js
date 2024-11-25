
import User from "../models/User";
import { convertAndSaveImage } from "../utils/uni";

export default defineEventHandler(async (event) => {

   const userId = getCookie(event, '_id')
   const user = await User.findById(userId)
   if (!user) return;
   const { upload, meta, courses, subjects, backup } = await readBody(event)


   if (upload) {
      await updateImageUrls(user, upload)
      user.preferences.upload = {
         ...user.preferences.upload,
         ...upload
      }

   }
   if (meta) {
      user.preferences.upload.meta = {
         ...user.preferences.upload.meta,
         ...meta
      }
   }

   if (subjects) {
      user.subjects = subjects
   }
   if (courses) {
      user.courses = courses
   }

   if (backup) {
      user.preferences.backup = backup
   }


   await user.save()

   const { courses: userCourses, subjects: userSubjects } = await user.getFilteredCoursesAndSubjects()


   if (user.preferences.upload.dir && userSubjects.length && user.preferences.upload.meta.streams.length > 0) {
      setCookie(event, 'setup-required', '', {
         maxAge: -1, // Set maxAge to -1 to expire the cookie
         path: '/',  // Specify the path, ensure it's the same as when it was created
      });
   } else {

      setCookie(event, 'setup-required', true, {
         maxAge: 30 * 24 * 60 * 60,
      });

      throw createError({
         message: "Missing required info",
         statusCode: 400,
         data: {
            error: {
               dir: user.preferences.upload.dir ? null : "Missing",
               subjects: userSubjects.length > 0 ? null : "Missing",
               courses: userCourses.length > 0 ? null : "Missing",
               streams: user.preferences.upload.meta.streams.length > 0 ? null : "Missing"
            }
         }
      })
   }
   return "Success"


});


async function updateImageUrls(user, upload) {
   const newCourseImages = upload.document.cover_page.images.courses;
   const newSubjectImages = upload.document.cover_page.images.subjects

   // Iterate through each course
   for (const newCourseImage of newCourseImages) {
      const currCourseImageUrl = user.preferences.upload.document.cover_page.images.courses.find(c => c.id === newCourseImage.id)?.url;

      if (newCourseImage.url && currCourseImageUrl !== newCourseImage.url) {
         // Update the URL by converting and saving the image
         newCourseImage.url = await convertAndSaveImage(user.preferences.upload.dir, newCourseImage.url);
      }
   }

   // Iterate through each subject
   for (const newSubjectImage of newSubjectImages) {
      const currSubjectUrl = user.preferences.upload.document.cover_page.images.subjects.find(s => s.id === newSubjectImage.id)?.url;

      if (newSubjectImage.url && currSubjectUrl !== newSubjectImage.url) {
         // Update the URL by converting and saving the image
         newSubjectImage.url = await convertAndSaveImage(user.preferences.upload.dir, newSubjectImage.url);
      }
   }
}

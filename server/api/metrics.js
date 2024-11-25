import User from "../models/User"

export default defineEventHandler(async (event) => {

   const userId = getCookie(event, '_id')
   const user = await User.findById(userId)
   const {courses, subjects} = await user.getFilteredCoursesAndSubjects();
   const subjectIds = subjects.map(s => s.name)
   const flashcardSets = (await $fetch('/api/flashcards'))
   return {
      courses,
      subjects,
      flashcardSets,
   }
})
import User from "../models/User";


export default defineEventHandler(async(event)=>{
    const userId = getCookie(event, '_id');
    const user = await User.findById(userId)
    const data = await user.getFilteredCoursesAndSubjects();
    const links =  getTerminalNodesFromJSON('brainscape')
    const relevantLinks = getLinksByMatchingCoursesAndSubjects(links, data.courses, data.subjects)
    const flashcards = await fetchBrainScapeFlashcardSets(relevantLinks)

    return {status: "success", count:flashcards.length};
    
})
import User from "../models/User";
import { getLinksByMatchingCoursesAndSubjects, getTerminalNodesFromJSON } from "../utils/uni";
import { updateStudyStackFlashcardSets } from "../utils/studystack";

export default defineEventHandler(async (event) => {
    const userId = getCookie(event, '_id');
    const user = await User.findById(userId)
    const data = await user.getFilteredCoursesAndSubjects();


    const links =  getTerminalNodesFromJSON('studystack')



    const relevantLinks = getLinksByMatchingCoursesAndSubjects(links, data.courses, data.subjects)
    await updateStudyStackFlashcardSets(relevantLinks)
    return relevantLinks;


})




  







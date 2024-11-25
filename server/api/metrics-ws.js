import User from "../models/User";
import { updateBrainScapeCoursesAndSubjects, updateBrainScapeFlashcardSets } from "../utils/brainscape";
import { updateCramCoursesAndSubjects, updateCramFlashcardSets } from "../utils/cram";
import updateStudyStackCoursesAndSubjects, { updateStudyStackFlashcardSets } from "../utils/studystack";

export default defineWebSocketHandler({
  async open() {

  },

  async message(peer, message) {
    try {
      const { userId } = JSON.parse(message)
      const user = await User.findById(userId)
      if (!user) {
        peer.send(JSON.stringify({ error: 'User not found' }));
        return;
      }
      const { courses, subjects } = await user.getFilteredCoursesAndSubjects()
      peer.send(JSON.stringify({ message: 'Connected Successfully' }));

      const streams = user.preferences.upload.meta.streams;
      for (const streamSource of streams) {
        let data = await getTerminalNodesFromJSON(streamSource);
        const links = await getLinksByMatchingCoursesAndSubjects(data, courses, subjects)
        switch (streamSource) {
          case 'studystack':
            await updateStudyStackCoursesAndSubjects()
            await updateStudyStackFlashcardSets(links)
            break;
          case 'cram':
            await updateCramCoursesAndSubjects()
            await updateCramFlashcardSets(links)
            break;
          case 'brainscape':
            await updateBrainScapeCoursesAndSubjects()
            await updateBrainScapeFlashcardSets(links)
            break;
          default: console.log('Cant be empty!')
        }
      }


      closeConnection(peer, "Done")
    } catch (error) {
      console.error('Error processing message:', error);
      closeConnection(peer, 'Invalid message format')
    }
  },

  close(peer) {
    clearTimeout(peer.inactivityTimeout);
  },
});

function closeConnection(peer, reason) {
  console.log(`Signaling connection close for peer ${peer.id}. Reason: ${reason}`);
  peer.send(JSON.stringify({ type: 'close', reason: reason }));

}



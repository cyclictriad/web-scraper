
export default defineEventHandler(async (event) => {
   
    return {
        questions: await fetchCramFlashcardSet("https://www.cram.com/flashcards/export/2462715")
    }

})



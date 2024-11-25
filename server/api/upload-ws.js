import { createPDF, formatConfig, getMeta, sendMessage } from "../utils/upload";


export default defineWebSocketHandler({
    async open(peer) {

    },
    async message(peer, config) {
        try {
            config = await formatConfig(config)

            console.log("Hello simon")

            const {  flashcardSets } = config

            for (let flashcardSet of flashcardSets) {
             
                try {
                    const {questions} = await createPDF(peer,flashcardSet, config )
                    //continue;
                    await getMeta(peer, flashcardSet, { questions, config, retries: 2 })

                    sendMessage({
                        peer,
                        event: 'UPLOAD',
                        flashcardSet,
                    });
                    // console.log({...config.stuvia})

                    await $fetch('/api/stuvia', {
                        method: 'POST',
                        body: {
                            ...config.stuvia.toObject(),
                            quiz:flashcardSet,
                        },
                    });
                    sendMessage({
                        status: 'COMPLETE',
                        peer,
                        event: 'UPLOAD',
                        flashcardSet,

                    });
                    flashcardSet.statusHistory = [...flashcardSet.statusHistory, { status: 'UPLOADED' }]


                } catch (error) {
                    sendMessage({
                        status:'Error',
                        event:error.message,
                        peer
                    })
                    console.log('Error uploading quiz ', flashcardSet.title, error.message)
                } finally {
                    await flashcardSet.save()
                }
            }
            peer.send(JSON.stringify({ type: 'close' }))

        } catch (error) {
            console.error('Error in SSE handler:', error);
        } finally {
            await logout()

        }
    },
    close(peer) {
        console.log('Connection closed')
    }
})


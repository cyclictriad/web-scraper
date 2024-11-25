import Chat from "../../models/Chat"

export default defineEventHandler(async (event) => {

    const userId = getCookie(event, '_id')
    const id = getRouterParam(event, 'id')
    const query = await getQuery(event)

    let chat = await Chat.findOne({ id })
    if (!chat) {
        await Chat.deleteMany({
            $or: [
                { messages: { $exists: true, $size: 0 } }, // Array with 0 elements
                { messages: { $exists: true, $size: 1 } }  // Array with 1 element
            ]
        });

        
        chat = await Chat.create({
            id,
            userId
        })

    }

    if (query.title) {
        return chat.title;
    }


    return chat

})
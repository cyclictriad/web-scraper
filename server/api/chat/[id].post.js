
// server/api/chat.ts
import { sendStream } from 'h3'
import Chat from '../../models/Chat';
import User from '../../models/User';

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const query = getQuery(event)
    const id = getRouterParam(event, 'id')

    try {
        const userId = getCookie(event, '_id')
        const user = await User.findById(userId)
        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'unauthorized', message: "Unauthorized" })
        }

        const chat = await Chat.findOne({ id });
        if (!chat) {
            throw createError({ statusCode: 404, statusMessage: 'chat_not_found', message: "Chat not found" })
        }

        chat.metadata = {
            creativity: query.creativity || 'low',
            longResponses: query.long === 'true'
        }
        const userMessage = body.message
        await chat.addMessage(userMessage.role, userMessage.content, query.model)
        // Ensure full URL with protocol and host
        const protocol = event.node.req.headers['x-forwarded-proto'] || 'http'; // Infer protocol (e.g., behind a proxy)
        const queryString = new URLSearchParams(query).toString();
      
        // Construct the new URL, replacing the path and maintaining the query string
        const llmUrl = `${protocol}://${event.node.req.headers.host}/api/chat-completion${queryString ? '?' + queryString : ''}`;
        // Forward the request to `/ask-ai`
        const response = await fetch(llmUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: chat.messages
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        if (query.stream === 'true') {
            let assistantMessage = ''

            // Create a readable stream from the response
            const reader = response.body.getReader()
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        while (true) {
                            const { done, value } = await reader.read()

                            if (done) {
                                // Save the complete assistant message when stream ends
                                if (assistantMessage) {
                                    await chat.addMessage('assistant', assistantMessage, query.model)
                                }
                                controller.close()
                                break
                            }

                            // Forward the chunk
                            controller.enqueue(value)

                            // Try to parse and accumulate assistant message
                            try {
                                const text = new TextDecoder().decode(value)

                                const lines = text.split('\n')
                                //.filter(line => line.trim() !== '')

                                for (const line of lines) {
                                    assistantMessage += line
                                }
                            } catch (e) {
                                // Ignore parsing errors for incomplete chunks
                                console.error('Error parsing chunk:', e)
                            }
                        }
                    } catch (error) {
                        controller.error(error)
                    }
                }
            })

            await sendStream(event, stream)

            if (chat.title.startsWith('Chat')) {
                const title = await $fetch(`/api/chat-completion?model=${query.model}`, {
                    method: 'POST',
                    body: {
                        instructions: 'You are an AI that gives brief title for a conversation in less than 5 words',
                        question: `Hey generate a concise title for this chat
                        ${chat.messages.map(msg => `${msg.role} : ${msg.content}`).join('\n\n')}
                        `
                    }

                })

                await chat.updateTitle(title)
            }

        } else {
            const data = await response.json()
            await chat.addMessage('assistant', data.choices[0].message.content)
            return data
        }
    } catch (error) {
        console.error('Error in chat API:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to process chat request'
        })
    }
})
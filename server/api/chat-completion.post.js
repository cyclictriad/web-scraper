import Groq from "groq-sdk";
import { ReadableStream } from "stream/web";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const query = getQuery(event);
    let messages;


    if (body.messages) {
        messages = body.messages.map(({ role, content }) => ({ role, content }))
    } else {

        if (!body.question) {
            throw createError({ statusCode: 400, statusMessage: "question_required", message: "Missing Question" })
        }
        else {
            const customMessage = [];
            if (body.instructions) {
                customMessage.push(
                    {
                        role: "system",
                        content: body.instructions
                    }
                )

            }
            customMessage.push(
                {
                    role: "user",
                    content: body.question
                }
            )
            messages = customMessage;
        }
    }

    // console.log(messages)
    const completion = await groq.chat.completions.create({
        messages,
        model: query.model || "llama3-8b-8192",

        /*
        Optional parameters include 
    
                Controls randomness: lowering results in less random completions.
                As the temperature approaches zero, the model will become deterministic
                and repetitive.
                temperature: 0.5,

                The maximum number of tokens to generate. Requests can use up to
                2048 tokens shared between prompt and completion.
                max_tokens: 1024,

                Controls diversity via nucleus sampling: 0.5 means half of all
                likelihood-weighted options are considered.
                top_p: 1,

                A stop sequence is a predefined or user-specified text string that
                signals an AI to stop generating content, ensuring its responses
                remain focused and concise. Examples include punctuation marks and
                markers like "[end]".
                stop: null,

                If set, partial message deltas will be sent.
                stream: false,

        */
        stream: query.stream === 'true' ? true : false,
        stop: null,
    });

    if (query.stream === 'true') {

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Assuming 'completion' is an async iterable (async generator)
                    for await (const chunk of completion) {
                        
                        console.log(typeof chunk, chunk.length)
                        // Directly forward the raw chunk
                        if(chunk.choices[0].delta.content){
                            controller.enqueue(chunk.choices[0].delta.content);

                        }
        
                        // Optionally, log the chunk for debugging purposes
                        // console.log(chunk);
                    }
        
                    // Close the stream when all chunks have been processed
                    controller.close();
                } catch (error) {
                    console.error('Error during streaming:', error);
                    controller.error(error); // Terminate the stream in case of an error
                }
            }
        });
        
        
        // Send the stream to the client
        return await sendStream(event, stream);
        
    } else {
        console.log('It was not a stream')
        return completion.choices[0]?.message.content || " ";
    }



})
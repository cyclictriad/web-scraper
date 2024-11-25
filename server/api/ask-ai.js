import { sendStream } from 'h3'

const API_KEY = process.env.ARLIAI_API_KEY
const BASE_URL = "https://api.arliai.com/v1/chat/completions"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const query = getQuery(event)

    const model = query.model ||
        'Mistral-Nemo-12B-Instruct-2407'

    const options = {
        model,
        messages: body.messages || [
            { role: "system", content: body.instructions || "" },
            { role: "user", content: body.question || "" },
        ],
        stream: query.stream === 'true',
        max_tokens: query.long === 'true' ? 2048 : 1024,
    }

    // Set creativity parameters based on the query
    if (query.creativity === 'high') {
        Object.assign(options, {
            repetition_penalty: 1.0,
            temperature: 0.7,
            top_p: 1,
            top_k: 40,
        })
    } else {
        // Low creativity / deterministic case
        Object.assign(options, {
            repetition_penalty: 1.0,
            temperature: 0,
            top_p: 1,
            top_k: 1,
        })
    }
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        if (options.stream) {
            console.log(typeof response.body)
            console.log({stream: response.body})

            return sendStream(event, response.body)
        } else {
            const data = await response.json()
            return data.choices[0].message.content.replace(/[\[\]\"]/g, '').trim()
        }


    } catch (error) {
        console.error('Error fetching data from AIML API:', error)
        return { error: 'Failed to fetch data from AIML API' }
    }


})
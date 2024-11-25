import Groq from 'groq-sdk';

const groq = new Groq({apiKey:process.env.GROQ_API_KEY})

export default defineEventHandler(async(event)=>{
    //get all available models
    const activeModels = (await groq.models.list()).data.filter(model => model.active);;

    return  activeModels;
})
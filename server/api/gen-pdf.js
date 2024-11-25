import { producePDF } from "../utils/gen-pdf"


export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const pages =  await producePDF(body)
    return pages
})
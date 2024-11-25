import uploadToStuvia from "../utils/stuvia"

export default defineEventHandler(async(event)=>{
    try{
        const data = await readBody(event)
        await uploadToStuvia({...data})
    }catch(error){
        console.log('Error logging to stuvia ' + error.message)
    }
})
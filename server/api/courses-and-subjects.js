import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
    try {
        const currentWorkingDirectory = process.cwd();  // Get the current working directory (project root)
        const dbPath = path.resolve(currentWorkingDirectory, 'server/db/unified.json');  // Resolve to the absolute path
    
        // Read the JSON file
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
        
        return data;
    } catch (error) {
        console.log("Error fetching courses", error.message)
    }
})
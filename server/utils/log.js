// /server/utils/logger.js
import fs from 'fs';
import path from 'path';
import { writeFile } from './uni';



export const logEvent = ({ root, folder, file }, eventDetails) => {
    const filePath = path.join(root, folder, file + '.json');
    // Create a log entry
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...eventDetails,
    };

    // Read existing logs
    let logs = [];
    if (fs.existsSync(filePath)) {
        const existingLogs = fs.readFileSync(filePath, 'utf-8');
        logs = existingLogs ? JSON.parse(existingLogs) : [];
    }


    // Add the new log entry
    logs.push(logEntry);

    // Write logs back to file
    writeFile({
        filePath,
        data: JSON.stringify(logs, null, 2)
    })

};

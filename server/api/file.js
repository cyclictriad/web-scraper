import { defineEventHandler, readBody, sendError } from 'h3';
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { filePath } = body; // Expecting an absolute file path

  if (!filePath) {
    return sendError(event, { statusCode: 400, message: 'No file path provided' });
  }

  try {
    // Ensure the file path is valid and absolute
    const absolutePath = path.resolve(filePath); 

    // Read the image file
    const imageBuffer = fs.readFileSync(absolutePath);
    
    // Determine the content type
    const ext = path.extname(absolutePath).toLowerCase();
    let contentType;
    
   // Check for supported image formats
  switch (ext) {
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.bmp':
      contentType = 'image/bmp';
      break;
    case '.webp':
      contentType = 'image/webp';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    default:
      return sendError(event, { statusCode: 415, message: 'Unsupported file type' });
  }

    // Set the response headers
    event.res.setHeader('Content-Type', contentType);
    event.res.setHeader('Content-Length', imageBuffer.length);
    
    // Send the image buffer back
    return imageBuffer;
  } catch (error) {
    console.error('Error reading image:', error);
    return sendError(event, { statusCode: 500, message: 'Error reading image file' });
  }
});

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Fuse from "fuse.js";


export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function writeFile({ filePath, data }) {
  // Get the directory path (i.e., /desktop/docs)
  const dirPath = path.dirname(filePath);

  try {
    // Create the folder (if it doesn't exist)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the file synchronously
    fs.writeFileSync(filePath, data);



  } catch (err) {
    // Handle errors
    console.error('Error writing file:', err);
  }
}

/**
 * Writes an object to a JSON file.
 * @param {Object} data - The object to be written to the JSON file.
 * @param {string} filePath - The path to the JSON file where data should be saved.
 */
export function writeToJsonFile(data, partialFilePath) {
  // Convert the object to a JSON string with indentation for readability
  const jsonData = JSON.stringify(data, null, 2);
  const currentWorkingDirectory = process.cwd();  // Get the current working directory (project root)
  const dbPath = path.resolve(currentWorkingDirectory, `server/db/${partialFilePath}.json`);  // Resolve to the absolute path


  // Write the JSON string to the file asynchronously
  fs.writeFile(dbPath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data successfully written to file:', dbPath);
    }
  });
}

/**
 * Converts an image to a high-quality PNG and saves it in the specified directory.
 * 
 * @param {string} rootDir - The root directory where the new image will be saved.
 * @param {string} imagePath - The absolute path of the original image.
 * @returns {Promise<string>} - The path of the saved image or an error message.
 */
export async function convertAndSaveImage(rootDir, imagePath) {
  try {
    // Check if the input file exists
    await fs.promises.access(imagePath);
    console.log(`Input image found: ${imagePath}`);

    // Get the file extension
    const fileExtension = path.extname(imagePath).toLowerCase();
    const imageName = path.basename(imagePath, fileExtension); // Get the image name without extension

    // Define the output directory and ensure it exists
    const outputDir = path.join(rootDir, 'assets', 'images');
    await fs.promises.mkdir(outputDir, { recursive: true }); // Create the directory if it doesn't exist
    console.log(`Output directory ensured: ${outputDir}`);

    // Define the output file path
    const outputFilePath = path.join(outputDir, `${imageName}.png`); // Save as PNG
    console.log(`Output file path: ${outputFilePath}`);

    // Check the file format
    if (fileExtension !== '.png' && fileExtension !== '.jpeg' && fileExtension !== '.jpg') {
      // If not PNG or JPEG, convert to PNG
      const fileBuffer = await fs.promises.readFile(imagePath);
      await sharp(fileBuffer)
        .toFile(outputFilePath); // Save the converted image
      return outputFilePath; // Return the output file path
    } else {
      // If it's already PNG or JPEG, save a duplicate as PNG
      const originalBuffer = await fs.promises.readFile(imagePath);
      await sharp(originalBuffer)
        .toFile(outputFilePath); // Save as PNG
      return outputFilePath; // Return the output file path
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return 'Error: Unable to process image.';
  }
}

export function parseDataFromJSON(partialFilePath) {
  const currentWorkingDirectory = process.cwd();  // Get the current working directory (project root)
  const dbPath = path.resolve(currentWorkingDirectory, `server/db/${partialFilePath}.json`);  // Resolve to the absolute path

  // Read the JSON file
  const parsedData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

  return parsedData;
}

export function getTerminalNodesFromJSON(fileName) {
  const parsedData = parseDataFromJSON(`courses_and_subjects/${fileName}`)

  const data = getTerminalNodes(parsedData)

  return data
}


export function getTerminalNodes(objs, level = 2) {

  let terminalNodes = [];

  // Define the next level to check (l2, l3, l4, etc.)
  const nextLevel = `l${level}`;

  for (const obj of objs) {
    // If the current object has no child nodes at the current level, it's a terminal node
    if (!obj[nextLevel]) {
      terminalNodes.push(obj); // Add the terminal node
    } else {
      // Otherwise, recurse deeper into the next level if there are child nodes
      if (Array.isArray(obj[nextLevel])) {
        // Recurse into each child at this level
        terminalNodes = terminalNodes.concat(getTerminalNodes(obj[nextLevel], level + 1)); // Flatten the result
      }
    }
  }

  return terminalNodes;
}

export function getLinksByMatchingCoursesAndSubjects(links, courses, subjects) {
  // Combine courses and subjects into one searchable array
  const searchData = [
    ...courses.map(course => ({
      type: 'course',
      name: course.name,
      keywords: course.keywords || []
    })),
    ...subjects.map(subject => ({
      type: 'subject',
      name: subject.name,
      keywords: subject.keywords || []
    }))
  ];

  // Fuse.js configuration
  const fuseOptions = {
    keys: ['name', 'keywords'], // Search in both the name and keywords fields
    threshold: 0.3, // Allow some flexibility in matching (0 = exact, 1 = very loose)
    includeScore: true, // Include score in the results for sorting
  };

  // Create a Fuse instance with the combined data
  const fuse = new Fuse(searchData, fuseOptions);

  // Create a function to calculate match score for each link
  const scoreLink = (link) => {
    // Search for the best matching course/subject based on the link's name
    const result = fuse.search(link.name);

    if (result.length === 0) return { link, score: 1 }; // No match found, return worst score

    // Return the best match (lowest score = best match in Fuse.js)
    const bestMatch = result[0];

    return {
      link,
      score: bestMatch.score // Score from Fuse.js (lower is better)
    };
  };

  // Define the threshold for a "good match"
  const goodMatchThreshold = 0.3; // Only accept results with a score of 0.3 or lower

  // Score and filter the links based on the match
  const scoredLinks = links
    .map(scoreLink) // Score the links based on the search
    .filter(item => item.score <= goodMatchThreshold); // Only keep links with a good match (score <= threshold)

  // Sort the links by their score (lowest score = best match)
  scoredLinks.sort((a, b) => a.score - b.score);

  // Return sorted links
  return scoredLinks.map(item => item.link);
};
import fs from "node:fs"
import FlashcardSet from "../models/FlashcardSet";
import User from "../models/User";
import Fuse from 'fuse.js';
import { parseDataFromJSON } from "./uni";
import { fetchCramFlashcardSet } from "./cram";



export function sendMessage({ peer, status = "START", event, flashcardSet, date = Date.now() }) {
    let message = {
        status,
        event,
        date
    }
    if (flashcardSet) {
        message.quiz_name = flashcardSet.title
    }
    peer.send(JSON.stringify(message))
}





export async function formatConfig(config) {
    const { userId, ...meta } = JSON.parse(config)
    const user = await User.findById(userId)
    let { courses, subjects} = await user.getFilteredCoursesAndSubjects()

    meta.subjects = subjects
    const links = getLinksForStream(user.preferences.upload.meta.streams)

    const notUploadedFlashcards = (await FlashcardSet.find({})).filter(set => !set.statusHistory.some(history => history.status == "UPLOADED"))
    const flashcardSets =  getSortedFlashcardsBySubjectSubset(parseDataFromJSON('unified'), subjects, links, notUploadedFlashcards).slice(0, meta.batch);

    return {
        author: user.name,
        stuvia: user.stuvia,
        ...meta,
        allCourses: courses,
        subjects,
        flashcardSets,
        preferences: user.preferences
    }
}


export const hasMeta = (flashcardSet) => flashcardSet.description && flashcardSet.price && flashcardSet.keywords.length > 0

export async function getMeta(peer, flashcardSet, {
    retries = 3,
    config,
    questions
}) {
    sendMessage({
        peer,
        event: "META",
        flashcardSet,

    });

    let meta;
    if (!hasMeta(flashcardSet)) {
        const fetchMeta = async () => {
            // console.log({ questions })
            meta = await $fetch(`/api/chat-completion?model=${config.ai_model}`, {
                method: 'POST',
                body: {
                    instructions: "You are an AI that recommends a book, SEO keywords, a creative description, and pricing (based on number of pages) for my Stuvia quizzes. Format your response strictly as follows: book: [book], SEO: [keywords], description: [description], price: [price].",
                    question: `Recommend a relevant book, summary, ${config.keywords} SEO keywords, and a competitive price for a Stuvia quiz titled ${flashcardSet.name}.It is a PDF of ${flashcardSet.pages} pages with a minimum price of $${config.min_price}. Below is a random selection of questions from the quiz  With sample questions\n\n${questions}\n\n."`
                }
            })
            meta = formatMeta(meta)
        }

        for (let i = 0; i < retries; i++) {

            await fetchMeta()
            if (hasMeta(meta)) break;
        }
    } else {
        meta = {
            keywords: flashcardSet.keywords,
            price: flashcardSet.price,
            book: flashcardSet.book,
            description: flashcardSet.description,
        }
    }

    flashcardSet.statusHistory = [...flashcardSet.statusHistory, { status: 'META' }]
    flashcardSet.keywords = meta.keywords.split(',').slice(0, 8)
    flashcardSet.description = meta.description
    flashcardSet.price = meta.price
    flashcardSet.book = meta.book

    sendMessage({
        flashcardSet,
        peer,
        event: 'META',
        status: 'COMPLETE',

    });
}

export function fileExists(flashcardSet) {
    return flashcardSet.urls?.local ? fs.existsSync(flashcardSet.urls.local) : false
}


export async function createPDF(peer, flashcardSet, config ) {
    let questions;

    if (!fileExists(flashcardSet)) {
        const fetchedSet = await fetchFlashcardSet(peer, flashcardSet)
        questions = fetchedSet.questions
      
        sendMessage({
            flashcardSet,
            peer,
            event: 'PDF',
        });

        const pdfDetails = await $fetch('/api/gen-pdf', {
            method: 'POST',
            body: {
                quiz: fetchedSet.text,
                heading: flashcardSet.title || flashcardSet.name,
                preferences: {
                    ...config.preferences.upload.document,
                    root: config.preferences.upload.dir,
                    author: config.author,
                    course:{name:flashcardSet.courseName},
                    subject:{name:flashcardSet.subjectName},
                    keywords: ['2024', flashcardSet.courseName, flashcardSet.subjectName, 'pdf']
                },
            },
        });

        flashcardSet.statusHistory = [...flashcardSet.statusHistory, { status: 'PDF' }]
        flashcardSet.urls.local = pdfDetails.filePath
        flashcardSet.pages = pdfDetails.pages;

        sendMessage({
            peer,
            event: 'PDF',
            flashcardSet,
            status: 'COMPLETE',

        });



    } else {

        if (!hasMeta(flashcardSet)) {
            const fetchedSet = await fetchFlashcardSet(peer, flashcardSet)
            questions = fetchedSet.questions
        }
    }

    return {
        questions
    };

}


async function fetchFlashcardSet(peer, flashcardSet) {
    sendMessage({
        peer,
        event: "FETCH",
        flashcardSet,
    });

    let flashcardSetText;
    if(flashcardSet.urls.remote.self.includes('brainscape')){
        flashcardSetText = await fetchBrainScapeFlashcardSet(flashcardSet.urls.remote.self)
    }else if(flashcardSet.urls.remote.self.includes('studystack')){
        const {title, body} = await fetchStudyStackFlashcardSet(flashcardSet.urls.remote.self)
        flashcardSetText = body
        flashcardSet.title = title
    }else if(flashcardSet.urls.remote.self.includes('cram')){
        flashcardSetText = await fetchCramFlashcardSet(flashcardSet.urls.remote.self)
    }else{
        console.log('There must be an issue')
    }
    sendMessage({
        peer,
        event: "FETCH",
        flashcardSet,
        status: 'COMPLETE'
    });
    function extractQuestions(inputString) {
        const regex = /<question>(.*?)<\/question>/g; // Matches text between <question> and </question>
        const matches = [];
        let match;
      
        while ((match = regex.exec(inputString)) !== null) {
          matches.push(match[1].trim()); // Push the captured content, trimmed of extra spaces
        }
        flashcardSet.questions = matches.length      
        return matches.sort(() => 0.5 - Math.random())
        .slice(0, 15)
        .join("\n");
      }


    return {
        text:flashcardSetText,
        questions:extractQuestions(flashcardSetText)
    }
}




/**
 * Get the most relevant flashcards sorted by relevance.
 * Determines the course based on the best-matching subject within a subset of subjects.
 * 
 * @param {Array} courses - List of courses with `name` and `subjects` (array of { name, keywords }).
 * @param {Array} subjects - Subset of all subjects to search within.
 * @param {Array} links - List of links with `name` and `url`.
 * @param {Array} flashcards - List of flashcards with `name` and `urls.remote.root`.
 * @returns {Array} Sorted flashcards with relevance scores.
 */
export function getSortedFlashcardsBySubjectSubset(courses, subjects, links, flashcards) {
  // Flatten subjects from the subset provided
  const validSubjects = subjects.map(subject => ({
    ...subject,
    courseName: courses.find(course => course.subjects.some(sub => sub.name === subject.name))?.name || null,
  }));

  // Step 1: Configure Fuse.js for fuzzy search on the provided subjects
  const fuseSubjects = new Fuse(validSubjects, { keys: ['name', 'keywords'], threshold: 0.4 });

  // Step 2: Match flashcards with links
  flashcards.forEach((flashcard) => {
    const matchingLink = links.find(link => link.url === flashcard.urls.remote.root);
    flashcard.matchedLink = matchingLink ? matchingLink.name : null;
  });

  // Step 3: Calculate relevance score for each flashcard
  const scoredFlashcards = flashcards.map((flashcard) => {
    const query = flashcard.matchedLink || flashcard.name;

    // Find the best subject match within the subset
    const bestSubjectMatch = fuseSubjects.search(query)?.[0];

    // Extract details from the best match
    const subjectRelevance = bestSubjectMatch ? bestSubjectMatch.score : 1; // Lower is better
    const matchedSubject = bestSubjectMatch?.item?.name || null;
    const matchedCourse = bestSubjectMatch?.item?.courseName || null;
    flashcard.subjectName = matchedSubject
    flashcard.courseName = matchedCourse
    flashcard.relevance = subjectRelevance
    
    return  flashcard;
  });

  // Step 4: Sort flashcards by relevance (ascending order)
  const sortedFlashcards = scoredFlashcards.sort((a, b) => a.relevance - b.relevance);

  return sortedFlashcards;
}


function getLinksForStream(streams) {
    return streams.flatMap(stream => getTerminalNodesFromJSON(stream))
}
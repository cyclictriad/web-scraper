import puppeteer from "puppeteer";
import FlashcardSet from "../models/FlashcardSet";
import { writeToJsonFile } from "./uni";

export default async function updateStudyStackCoursesAndSubjects() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Go to StudyStack
    await page.goto('https://www.studystack.com');

    // Wait for the element to appear
    await page.waitForSelector('#hp-subject-grid');

    // Extract all href attributes
    const data = await page.$$eval('#hp-subject-grid a', links => links.map(link => ({ name: link.textContent, url: link.href })));

    for (let course of data) {
        // Navigate to the page
        await page.goto(course.url, {
            waitUntil: 'domcontentloaded',
        });

        const subjects = await page.$$eval('.catItem a', links => links.map(link => ({ name: link.textContent.replace(/\n/g, '').trim(), url: link.href })))

        if (subjects.length) {
            course.l2 = subjects
        }


    }
    await browser.close()
    writeToJsonFile(data, 'courses_and_subjects/studystack')
}



export function formatStudyStackFlashCardSet(flashcardSetText) {

    const parts = flashcardSetText.split('Answer Key');

    const title = flashcardSetText.split('\n')[0].trim();

    let body = parts[0]
        .split('\n')
        .slice(1)
        .join('\n')
        .trim();
    let currentQuestion = null;


    const formattedLines = [];
    let answerKey = parts.length > 1 ? parts[1].trim() : '';
    answerKey = answerKey.split('\n')
        .map(line => {
            const match = line.match(/^(\d+)\.\s*([A-D])$/);
            if (match) {
                const [, number, choice] = match;
                return `<${number}>${choice}<${number}>`;
            }
            return line;
        })
        .join('')

    body = body.split('\n').map(line =>
        line.trim().startsWith('Circle')
            ? `<subheading>${line}</subheading>`
            : line
    ).forEach(line => {
        // Check if line starts with a number and period (question)
        if (/^\d+\./.test(line.trim())) {
            // Remove the number and period, trim, and wrap as question
            currentQuestion = `<question>${line.replace(/^\d+\.\s*/, '').trim()}</question>`;
            formattedLines.push(currentQuestion);
        }
        // Check if line starts with A., B., C., or D. (choice)
        else if (/^[A-D]\./.test(line.trim())) {
            // Remove the letter and period, trim, and wrap as choice
            formattedLines.push(`<choice>${line.replace(/^[A-D]\.\s*/, '').trim()}</choice>`);
        }
        // If it's a subheading or any other line, keep it as is
        else if (line.trim()) {
            formattedLines.push(line);
        }
    });

    body = formattedLines.join("\n")

    // Parse the answers string to get correct choices
    const correctChoices = answerKey.match(/<\d+>[A-D]<\d+>/g)
        .reduce((acc, match) => {
            const [, number, choice] = match.match(/<(\d+)>([A-D])<\1>/);
            acc[number] = choice;
            return acc;
        }, {});

    // Split questions into lines and process
    const lines = body.split('\n');
    const processedLines = [];
    let currentQuestionNumber = 0;
    let currentChoiceNumber = 0;

    lines.forEach(line => {
        if (line.startsWith('<question>')) {
            currentQuestionNumber++;
            currentChoiceNumber = 0;
        }

        if (line.startsWith('<choice>')) {
            currentChoiceNumber++;

            // Map choice number to letter (1 = A, 2 = B, 3 = C, 4 = D)
            const choiceLetter = String.fromCharCode('A'.charCodeAt(0) + currentChoiceNumber - 1);

            if (choiceLetter === correctChoices[currentQuestionNumber]) {
                line = line.replace('<choice>', '<correct>').replace('</choice>', '</correct>');
            }
        }

        processedLines.push(line);
    });

    body = processedLines.join("<br>")


    return {
        title,
        body
    };
}


export async function fetchStudyStackFlashcardSet(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Go to StudyStack
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    let flashcardSet = await page.evaluate(() => document.body.innerText.trim())
    flashcardSet = formatStudyStackFlashCardSet(flashcardSet)
    await browser.close()
    return flashcardSet;
}

export async function updateStudyStackFlashcardSets(links) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage()

        for (const link of links) {
            await page.goto(link.url, { waitUntil: 'domcontentloaded' })
            await scrapeFlashcards(page, link.url)
        };
        await browser.close()

    } catch (error) {
        console.log(`${error}`)
    }
}

async function scrapeFlashcards(page, url) {
    const currentFlashcardSets = await FlashcardSet.find({ "urls.remote.root": url })
    let hasNextPage = true;
    let foundDuplicates = false;
    const existingIds = currentFlashcardSets.sort((a, b) => b.creationDate - a.creationDate).map(set => set.id)
    const getLastUpdatedPage = () => {
        foundDuplicates = true
        return `${url}&sortOrder=date&page=${Math.trunc(existingIds.length / 100)}`
    }

    await page.goto(`${url}&sortOrder=date`, {
        waitUntil: 'domcontentloaded',
    })

    while (hasNextPage) {

        const flashcardSets = await page.$$eval('.stackItem:not(#listHeadings)', cards =>
            cards
                .map(card => {
                    const linkElement = card.querySelector('span.description a');
                    const creationDateElement = card.querySelector('span.creationDate');
                    const idMatch = card.getAttribute('onclick')?.match(/flashcard-(\d+)/);
                    const id = idMatch?.[1];

                    if (linkElement && creationDateElement) {
                        return {
                            id,
                            name: linkElement.textContent.trim(),
                            creationDate: creationDateElement.textContent.trim(),
                        };
                    }
                    return null; // Return null for any invalid card
                })
                .filter(Boolean) // Remove any null entries (cards that didn't meet the conditions)
        );

        // console.log(flashcardSets)


        const IdsInPage = flashcardSets.map(set => set.id)


        // Check if all ids in current page are in all quizzes of current subject
        const hasUniqueFlashcardSets = !IdsInPage.every(id => existingIds.includes(id));

        if (hasUniqueFlashcardSets || foundDuplicates) {
            // Save extracted flashcards to the database
            for (const { id, name, creationDate } of flashcardSets) {
                const selfUrl = `https://www.studystack.com/iquiz-${id}&printVersion&printAnswerKey&maxQuestions=2000`
                const exists = await FlashcardSet.exists({ "urls.remote.self": selfUrl });
                if (exists) continue;
                await FlashcardSet.create({
                    id,
                    name,
                    creationDate,
                    urls: {
                        remote: {
                            root: url,
                            self: selfUrl
                        }
                    }
                });
            }
        } else {
            // Navigate to the next page
            await Promise.all([
                page.goto(getLastUpdatedPage(), {
                    waitUntil: 'networkidle2',
                    timeout: 100000
                }),
            ]);
            continue;
        }

        const lastPageLinkHandle = await page.$('a[href*="page="]:last-of-type'); // Get the last link handle

        if (!lastPageLinkHandle) {
            // No pagination links found, set hasNextPage to false
            hasNextPage = false;
        } else {
            const lastPageLinkText = await page.evaluate(
                element => element.textContent,
                lastPageLinkHandle
            );

            // Check if the last link's text is "Next"
            if (lastPageLinkText.trim() === 'Next') {
                hasNextPage = true;
            } else {
                // Either there is no "Next" link or only one page exists
                hasNextPage = false;
            }
        }
        if (hasNextPage) {
            const nextPageUrl = await page.evaluate(el => el.getAttribute('href'), lastPageLinkHandle);

            // Navigate to the next page
            await Promise.all([
                page.goto(`https://www.studystack.com/${nextPageUrl}`, {
                    waitUntil: 'domcontentloaded',
                }),
            ]);
        }
    }
}
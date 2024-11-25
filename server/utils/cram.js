import puppeteer from "puppeteer";
import FlashcardSet from "../models/FlashcardSet";
import { writeToJsonFile } from "./uni";

export async function updateCramCoursesAndSubjects() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://cram.com/tags", {
        waitUntil: 'domcontentloaded'
    })
    // Extract data using a specific selector
    const categories = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[id^="linkCategory"]')); // Select only links with id starting with "linkCategory"
        return links.map(link => ({
            name: link.textContent.trim(),
            url: link.href
        }));
    });

    for (const l1 of categories) {
        await page.goto(l1.url, { waitUntil: 'domcontentloaded' })
        // Extract data using a specific selector
        const l2s = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[id^="linkSubcategory"]')); // Select only links with id starting with "linkCategory"
            return links.map(link => ({
                name: link.textContent.trim(),
                url: link.href
            }));
        });
        l1.l2 = l2s


    }
    await browser.close()
    writeToJsonFile(categories, 'courses_and_subjects/cram')
}

export async function fetchCramFlashcardSet(url) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    const flashcardSet = await page.evaluate(() => {
        const flashcardSet = document.querySelector('#exportText').value;
        return flashcardSet
    })

    await browser.close()
    console.log({formatted:formatFlashcardSet(flashcardSet)})


    return formatFlashcardSet(flashcardSet)
}

function formatFlashcardSet(flashcardSetText) {
    console.log({unformatted:flashcardSetText})
    return flashcardSetText.replace(/\\n/g, '<br>').split("\n").map(question => {
        return question.replace(/https?:\/\/[^\s]+(\.(jpg|jpeg|png|gif|bmp|tiff|svg))/gi, (match) => {
            return `<image><link>${match}</link></image>`;
        })
            .replace(/^([^\t]+)\t([^\t]+)(\t([^\t]+))?$/, (match, q, c, t, tip) => {
                // If there is a third part (tip), wrap it accordingly
                if (tip) {
                    return `<question>${q}</question> <correct>${c}</correct><tip>${tip}</tip>`;
                }
                // Otherwise, just wrap the question and correct
                return `<question>${q}</question> <correct>${c}</correct>`;
            });
    }).join("<br>");
}


export async function getCramFlashcardSets(leafs) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()

    for (node of leafs) {
        await page.goto(node.url)


    }

    await browser.close()
}


export async function updateCramFlashcardSets(links) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()


    for (const link of links) {
        await scrapeFlashcardsSets(page, link.url)
    }

}


async function scrapeFlashcardsSets(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const flashcards = await page.$$eval('ul.subCategory_results > li', (items) => {
        return items.map((item) => {
            const linkElement = item.querySelector('.info h3 a');
            const href = linkElement?.getAttribute('href');

            // Extract the numeric ID from the end of the href
            const idMatch = href ? href.match(/-(\d+)$/) : null;
            const id = idMatch ? idMatch[1] : null;

            const flashcardsCount = item.querySelector('.side .qty strong')?.textContent.trim();
            const title = linkElement?.textContent.trim();

            // Look for the "Created:" label and get its adjacent <dd>
            const creationDateLabel = Array.from(item.querySelectorAll('dl dt'))
                .find((dt) => dt.textContent.trim() === 'Created:');
            const creationDateText = creationDateLabel
                ? creationDateLabel.nextElementSibling?.textContent.trim() || ''
                : ''; // Fallback to empty string if not found
            // // Convert to actual Date object
            // function parseDate(dateString) {
            //     const parseDate = new Date(Date.parse(dateString));
            //     return parseDate
            // };
            const creationDate = creationDateText;

            return {
                id,
                url: id ? `https://www.cram.com/flashcards/export/${id}` : null,
                title,
                questions: flashcardsCount ? parseInt(flashcardsCount, 10) : null,
                creationDate,
            };
        });
    });

    for (const { id, url: selfUrl, title, questions, creationDate } of flashcards) {
        const exists = await FlashcardSet.exists({ "urls.remote.self": selfUrl })
        if (exists) continue;
        await FlashcardSet.create({
            id,
            title,
            questions,
            creationDate,
            urls: {
                remote: {
                    self: selfUrl,
                    root: url
                }
            }
        })
    }



}


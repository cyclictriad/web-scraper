import puppeteer from "puppeteer"
import FlashcardSet from "../models/FlashcardSet";
import { writeToJsonFile } from "./uni";

export async function updateBrainScapeCoursesAndSubjects() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const data = [];
    await page.goto("https://brainscape.com/subjects")
    const listings = await page.$$(".tag-listing > li")

    for (const listing of listings) {
        const classList = await listing.evaluate(el => [...el.classList])
        const details = await (await listing.$('a.tag-link')).evaluate(el => ({ name: el.textContent, url: el.href }))
        if (classList.includes("root-tag")) {
            data.push({ ...details, l2: [] })
        } else {
            if (classList.includes("leaf-tag")) {
                data.at(-1).l2.push(details)
            } else if (classList.includes("parent-tag")) {
                data.at(-1).l2.push({ ...details, l3: [] })
            }

        }

    }
    for (const l1 of data) {
        for (const l2 of l1.l2) {
            if (!Object.keys(l2).includes("l3")) continue;

            await page.goto(l2.url)
            const listings = await page.$$(".tag-listing > li")

            let gotToL4 = false;

            for (const listing of listings) {

                const classList = await listing.evaluate(el => [...el.classList])
                const details = await (await listing.$('a.tag-link')).evaluate(el => ({ name: el.textContent, url: el.href }))

                if (classList.includes("root-tag")) {

                    l2.l3.push({ ...details, l4: [] })
                    gotToL4 = true;
                } else {

                    if (gotToL4) {
                        console.log(gotToL4)
                        l2.l3.at(-1).l4.push(details)

                    } else {

                        l2.l3.push(details)
                    }
                }
            }
        }
    }
    await browser.close()
    writeToJsonFile(data, 'courses_and_subjects/brainscape');
}



export async function fetchBrainScapeFlashcardSet(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    const flashcards = await page.$$(".flashcard-row"); // Select all flashcards

    const flashcardSet = await formatFlashCardSet(flashcards)
    await browser.close()
    return flashcardSet;
}



async function formatFlashCardSet(flashcards) {

    let flashCardSet = [];

    for (const flashcard of flashcards) {
        // Extract question
        const question = await flashcard.$eval(
            ".question-contents .scf-face",
            (el) => {
                let text = el.textContent.trim();
                let formattedText;

                if (text.includes("\n")) {
                    // Split into <question> and <bold>
                    formattedText = text.replace(/^(.*?)\n(.*)$/, '<question>$1</question><bold>$2</bold>');
                } else {
                    // Wrap the entire text as <question>
                    formattedText = `<question>${text}</question>`;
                }

                // Check for images and format them
                const img = el.querySelector("img");
                if (img) {
                    const imgSrc = img.src;
                    const zoomSrc = img.getAttribute("data-zoom") || imgSrc; // Handle zoom link
                    const caption = el.querySelector("figcaption")?.textContent.trim() || "No Caption";
                    formattedText += `<br><image><link>${imgSrc}</link><zoom>${zoomSrc}</zoom><caption>${caption}</caption></image>`;
                }

                return formattedText;
            }
        );

        // Extract answer
        const answer = await flashcard.$eval(
            ".answer-contents .scf-face",
            (el) => {
                let text = el.textContent.trim();
                let formattedText = `<correct>${text}</correct>`;

                // Check for images and format them
                const img = el.querySelector("img");
                if (img) {
                    const imgSrc = img.src;
                    const zoomSrc = img.getAttribute("data-zoom") || imgSrc; // Handle zoom link
                    const caption = el.querySelector("figcaption")?.textContent.trim() || "No Caption";
                    formattedText += `<br><image><link>${imgSrc}</link><zoom>${zoomSrc}</zoom><caption>${caption}</caption></image>`;
                }

                return formattedText;
            }
        );

        // Push extracted data into flashCardSet array
        flashCardSet.push(`${question}<br>${answer}`.replace(/\n/g, '<br>'));
    }

    return flashCardSet.join("<br>")

}



export async function updateBrainScapeFlashcardSets(links) {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage();
    const flashcards = []

    for (const link of links) {
        await scrapeFlashcardsSets(page, link.url)
    }

    return flashcards;

}


async function scrapeFlashcardsSets(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const decks = await page.$$eval('.subject-bar', bars =>
        bars.map(bar => ({
            url: bar.querySelector('.subject-bar-link')?.href || null,
            count: parseInt(
                bar.querySelector('.stats-item .stat-title')?.previousElementSibling?.textContent.trim() || '0',
                10
            )
        }))
    );

    for (const deck of decks) {
        const existingCount = await FlashcardSet.countDocuments({ "urls.remote.parent": deck.url });
        const isUpdated = deck.count > existingCount;

        if (!isUpdated) continue;

        await page.goto(deck.url, { waitUntil: 'domcontentloaded' })
        const flashcards = await page.$$eval('.flashcard-dropdown-cards-container-link', links =>
            links.map(link => ({
                title: link.querySelector('.flashcard-dropdown-title')?.textContent.trim() || null,
                questions: parseInt(link.querySelector('.card-count')?.textContent.trim().split(' ')[0], 10) || 0,
                id: link.href.split('/').pop(), // Extract the ID from the URL
                url: link.href || null
            }))
        );

        for (const { title, id, questions, url: selfUrl } of flashcards) {
            const exists = await FlashcardSet.exists({ "urls.remote.self": selfUrl })
            if (exists) continue;
            await FlashcardSet.create({
                title,
                id,
                questions,
                urls: {
                    remote: {
                        self: selfUrl,
                        root: url,
                        parent: deck.url
                    }
                }

            })
        }
    }

}
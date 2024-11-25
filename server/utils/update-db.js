import puppeteer from "puppeteer";
import Subject from "../models/Subject"
import Quiz from "../models/FlashcardSet";
import Course from "../models/Course";

let browser;
let page;
export async function updateDatabase() {
    try {
        await getCourses();
        await getSubjects({});
        await getQuizzes({});
    } catch (error) {
        console.log(error.message);
    } finally {
        if (browser) await browser.close();  // Ensure browser is closed
    }
}

async function init() {

    // Launch Puppeteer if not already launched
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Needed for SSR environments
        });
    }

    // Open new page or reuse if not closed
    if (!page || page.isClosed()) {
        page = await browser.newPage();
    }
}


export async function getSubjects({ include = null, exclude = new Set() }) {
    try {
        let courses = []
        if (include && include.length) {
            for (let name of include) {
                courses.push(await Course.findOne({ name }))

            }
        } else {
            courses = await Course.find({});
        }
        courses = courses.filter((course) => !exclude.has(course.name));

        await init()
        for (let course of courses) {
            // Navigate to the page
            await page.goto(`https://www.studystack.com/${course.name}`, {
                waitUntil: 'domcontentloaded',
            });

            // Use page.evaluate() to extract Subject href attributes instead of text content
            var subjects = await page.evaluate((course) => {
                // Select all <a> elements inside #subCategories .catItem
                const items = document.querySelectorAll('#subCategories .catItem a');
                // Map through the NodeList and extract the href value (which contains the correct URL casing)
                return items.length ? Array.from(items).map(item => item.getAttribute('href').trim()) : [course.name];
                
            }, course);

           

            for (const name of subjects) {
                const record = await Subject.findOne({ name });
                if (record) continue;
                await Subject.create({
                    name,  // This now correctly uses the href as the name
                    course: course._id
                });

            }
        }
        return subjects

    } catch (error) {
        console.log("oops there was an error updating subjects..", error.message)
    }
}




export async function getCourses() {
    await init();
    // Go to StudyStack
    await page.goto('https://www.studystack.com');

    // Wait for the element to appear
    await page.waitForSelector('#hp-subject-grid');

    // Extract all href attributes
    const courses = await page.$$eval('#hp-subject-grid a', links => links.map(link => link.getAttribute('href')));
    for (const name of courses) {
        const record = await Course.findOne({ name })
        if (record) continue;
        await Course.create({
            name
        })

    }
    await page.close()
    return courses;
}


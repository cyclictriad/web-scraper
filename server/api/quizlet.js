import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const puppeteer = require("puppeteer-extra").default;
const stealthPlugin = require("puppeteer-extra-plugin-stealth")

puppeteer.use(stealthPlugin())

export default defineEventHandler(async (event) => {

    const browser = await puppeteer.launch({
        headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // Override the Error.stack property
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(Error.prototype, 'stack', {
            get() {
                return 'Random';
            },
        });
    });
    await page.setViewport({
        width: 1080,
        height: 1024,
        deviceScaleFactor: 1,
    });


    try {
        await page.goto('https://quizlet.com', {
            waitUntil: 'domcontentloaded',
        })

        await page.evaluate(() => {
            const subjectBtnSelector = "#__next > header > div > div > div.tv7yled > div.TopNavigation-menuItems > div.NavigationTabs > div:nth-child(2) > button"
            const subjectsButton = document.querySelector(subjectBtnSelector);
            if (subjectsButton) {
                subjectsButton.click();  // Click the button if it's found
            }
        });

        let categories = {};
        await page.waitForSelector('.L1Subjects');
        const courseElements = await page.$$('.L1Subjects');
        console.log(courseElements.length)
        for (const courseElement of courseElements) {
            // Hover over each course element
            await courseElement.hover();

            const l1 = await page.evaluate((el) =>
                el.querySelector('.snzmd5j')?.textContent.trim() || 'Unknown Course'
                , courseElement);


            const l2s = await page.evaluate(() => {
                const subjectElements = document.querySelectorAll('.sv0yvnj a');
                return Array.from(subjectElements, link => {
                    const subject = link.querySelector('.snzmd5j');
                    const href = link.href;  // Get the full href attribute
                    return subject ? { l2: subject.textContent.trim(), href } : null;
                }).filter(Boolean);  // Filter out any null values
            });

            categories[l1] = l2s;


            // for (const l2 of l2s) {

            //     await page.goto(`${l2.href}`, { waitUntil: 'domcontentloaded' })
            //     await page.evaluate(async () => {
            //         const viewAllBtn = await page.$('button.AssemblyLink--medium.AssemblyLink--primary')
            //         if (viewAllBtn) {
            //             viewAllBtn.click()
            //         }
            //     })

            //     // Extract texts and links from the div
            //     const l3s = await page.evaluate(() => {
            //         const elements = document.querySelectorAll('div.mx346xj a');
            //         return Array.from(elements).map(element => ({
            //             l3: element.textContent.trim(),
            //             href: element.href
            //         }));
            //     });

            //     // Assign subjects to the course
            //     coursesAndSubjects[l1][l2] = l3s;

            // }
        }

        await browser.close();

        return {
            categories,
        };


    } catch (error) {
        console.log(error)
    }
})
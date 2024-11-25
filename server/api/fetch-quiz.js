import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  const {id} = getQuery(event);  // Extract query parameters if needed
  const targetUrl = `https://www.studystack.com/iquiz-${id}&printVersion&printAnswerKey&maxQuestions=2000`;  // Default to a URL if none provided

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Needed for SSR environments
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Use document.body.innerText to get all the visible text on the page
    const extractedText = await page.evaluate(() => {
      return document.body.innerText.trim();
    });

    await browser.close();

    return extractedText;
  } catch (error) {
    console.error('Error scraping:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
});

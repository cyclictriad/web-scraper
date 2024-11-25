import puppeteer from 'puppeteer';

let browser, page, isLoggedIn;

async function loginToStuvia(username, password) {
    if (!page || !isLoggedIn) {

        if (!browser || !browser.connected) {
            // Launch Puppeteer in non-headless mode
            browser = await puppeteer.launch({
                headless: false,
            });

        }
        page = await browser.newPage();
        // Go to Stuvia login page
        await page.goto('https://www.stuvia.com/login', {
            waitUntil: 'networkidle2'
        });
        // Type the username
        await page.type('#username', username);

        // Type the password
        await page.type('#password', password);
        // Submit the login form
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation({
            waitUntil: 'domcontentloaded'
        });
        // Check if URL contains the error parameter indicating invalid credentials
        const currentUrl = page.url();
        if (currentUrl.includes('?error=invalid-credentials')) {
            console.log("Login failed: Invalid credentials.");
            await browser.close();  // Close the browser
            throw new Error('auth::invalid login credentials');
        }
        isLoggedIn = true;
    }
}




export default async function uploadToStuvia({ email, password, quiz }) {
    try {

        const title = getFileName(quiz.urls.local)
        await loginToStuvia(email, password)



        // Navigate to the upload page manually
        await page.goto('https://www.stuvia.com/upload', {
            waitUntil: 'domcontentloaded'
        });

        await selectUSA()

        await page.evaluate(() => {
            document.querySelector('ul.radio-listbox-group li.radio-listitem:nth-child(1) input[type="radio"]').click();
        });

        await fillInCourse(title)

        // Wait for the file upload section to appear
        const inputWrapperSelector = '.input-upload-wrapper';
        await page.waitForSelector(inputWrapperSelector, { visible: true });
        // Wait for the file input to be available
        const fileInputSelector = '#fsp-fileUpload';
        await page.waitForSelector(fileInputSelector, { visible: true });
        // Directly upload the specified file without clicking the drop area
        const fileInput = await page.$(fileInputSelector);
        await fileInput.uploadFile(quiz.urls.local);
        // Wait for the upload footer to appear
        await page.waitForSelector('.fsp-footer--appeared', { visible: true });
        // Click the "Upload" button in the footer
        await page.click('span[data-e2e="upload"]');

        // Wait for the upload progress bar to finish uploading "dissapear"
        await page.waitForSelector(
            '#drop-pane-1_root > div > div > div > div.fsp-modal__body > div.fsp-content > div > div.fsp-summary__body > div > div.fsp-summary__item > div.fsp-summary__item-name > span.fsp-summary__size',
            {
                timeout: 50000
            }
        );
        await page.waitForSelector(
            '#drop-pane-1_root > div > div > div > div.fsp-modal__body > div.fsp-content > div > div.fsp-summary__body > div > div.fsp-summary__item > div.fsp-summary__item-name > span.fsp-summary__size',
            {
                hidden: true,
                timeout: 50000
            }
        );
        // Navigate to the upload page 
        await page.goto('https://www.stuvia.com/upload/document-information', {
            waitUntil: 'domcontentloaded'
        });
        await page.select('#type-doc', '6'); // Assuming '6' is the value for Exam (elaborations)

        await page.waitForSelector('input[type="radio"][name="Q&A"][value="questions_and_answers"]', { visible: true });
         // Click the "Questions & answers" radio button
        await page.evaluate(() => {
            const radio = document.querySelector('input[type="radio"][name="Q&A"][value="questions_and_answers"]');
            if (radio) {
                radio.click(); // Use JavaScript to trigger the click event directly
            }
        });
        // Select the grade (A+)

        await page.select('#grade', 'UPLOAD_DESCRIPTION_GRADE_1');
        if (quiz.book && quiz.book.trim()) {
            try {
                await page.click('span[data-select-book="yes"]')
                // Link the book using the new variable
                await page.type('#linked-book', quiz.book, {
                }); // Use the variable bookTitle
                // Wait for the dropdown suggestions to appear
                await page.waitForSelector('.autocomplete-suggestions', { visible: true, timeout: 5000 });
                // Now that the dropdown is visible, you can interact with it
                // Click the first suggestion in the dropdown
                await page.click('.autocomplete-suggestion:first-child');

            } catch (error) {
                await page.click('span[data-select-book="no"]')
                console.log('Error  ', error.message)
            }
        } else {
            await page.click('span[data-select-book="no"]')

        }

        await clickSaveAndNext()

        await page.type('#topic-doc', quiz.keywords.join(',') + ',');
        await page.type('#catchy-title', title)
        await page.type('#describe-doc', quiz.description)
        await page.select('#lang-doc', 'en');
        //await page.click('.cta-submit-form.cta-next-step');
        await page.click('fieldset:nth-of-type(3) .cta-submit-form.cta-next-step');
        await page.type('#your-price', String(quiz.price));

        await page.click('.cta-submit-form.cta-finish-step');
        // Optionally wait for the next step to load or any specific confirmation
        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        });


    } catch (error) {
        console.log('Error uploading to stuvia\n', error, error.message)

        if (error.message.includes('net::ERR_INTERNET_DISCONNECTED')) {
            const url = error.message.split('at')[1].trim()
            throw Error('stuvia::net::internet disconnected')
        }

        if (error.message.split('::').length > 1) {
            throw Error(`stuvia::${error.message}`)
        }

        if (error.message) {
            throw Error(`stuvia::other::${error.message}`)
        }
    }
}

function getFileName(filePath) {
    const dirs = filePath.split('/').reverse()
    return dirs[1] + '-' + dirs[0].split('.pdf')[0]
}


async function selectUSA() {
    try {
        await closePopup()

        const countryCode = await getCountryCode()
        console.log({ countryCode })

        if (countryCode !== 'us') {
            await page.evaluate(() => {
                document.querySelector('#upload-country-select').click();
            });
            await page.evaluate(() => {
                document.querySelector('a[data-country="279"]').click();
            });


            await page.waitForNavigation({
                waitUntil: 'networkidle2'  // Wait until there are no more than 0 network connections for at least 500ms
            });
            await closePopup()
        }
    } catch (error) {
        throw Error('nav::selecting usa')
    }
}

async function closePopup() {
    try {
        const popup = await page.$('#kenyanPopup');
        if (popup) {
            console.log("I saw a popup");

            // Check if the close button exists
            const closeButton = await page.$('button[data-fancybox-close]');
            if (closeButton) {

                await page.evaluate(() => {
                    document.querySelector('button[data-fancybox-close]').click();
                });
                console.log("Clicked the close button");


            } else {
                console.log('Close button did not appear.');
            }
        } else {
            console.log('Popup did not appear.');
        }
    } catch (error) {
        console.log(error);
        throw new Error('nav::closing popup');
    }
}



async function getCountryCode() {
    // Extract the last part of the class name from the span element
    const countryCode = await page.evaluate(() => {
        // Select the span element (you can change this selector as needed)
        const spanElement = document.querySelector('span[class*="flag-icon-"]');

        // Check if the element exists to avoid null reference errors
        if (spanElement) {
            // Get the class list of the span element
            const classList = spanElement.className.split(' ');

            // Find the class that starts with "flag-icon-"
            const lastClass = classList.find(cls => cls.startsWith('flag-icon-'));

            // Return the part after "flag-icon-" (country code)
            return lastClass.split('-').pop(); // Extract country code
        }

        return null; // Return null if the element is not found
    });

    return countryCode; // Return the extracted country code
}


async function fillInCourse(title) {
    const courseSelector = '#studyEducation';
    const suggestionSelector = '.autocomplete-suggestion';
    const popupSelector = '.swal2-popup';
    const popupConfirmButton = 'button.swal2-confirm';
    const courseTitle = title.split('-')[0]

    async function waitForSuggestions() {

        try{
            await page.waitForSelector(suggestionSelector, { timeout: 10000 });
            return page.$$(suggestionSelector);
        }catch(error){
            return []
        }
        
    }

    async function closeErrorPopupIfVisible() {
        const popup = await page.$(popupSelector);
        if (popup) {
            console.log('Invalid course name alert detected. Closing the alert.');
            await page.click(popupConfirmButton);
            return true; // Popup was handled
        }
        return false; // No popup
    }

    async function enterCourseName(courseTitle) {
        // Clear and enter course name
        await page.evaluate((selector) => {
            document.querySelector(selector).value = '';
        }, courseSelector);
        await page.type(courseSelector, courseTitle);
    }

    try {
        await page.waitForSelector(courseSelector, { visible: true, timeout: 15000 });
        await enterCourseName(courseTitle);


        let suggestions = await waitForSuggestions();
        if (!suggestions.length) {
            console.log('No suggestions found, selecting via Enter key');
            await page.keyboard.press('Enter');
            return;
        }

        for (let index = 0; index < suggestions.length; index++) {
            console.log(`Attempting suggestion ${index + 1}`);
            await suggestions[index].click();

            if (await closeErrorPopupIfVisible()) {
                console.log('Retrying with next suggestion.');
                await enterCourseName(courseTitle);
                suggestions = await waitForSuggestions();
                continue;
            }

            console.log('Course selected successfully.');
            break;
        }

    } catch (error) {
        console.error('Error during course selection:', error);
        throw new Error('nav::selecting course');
    }
}



async function clickSaveAndNext() {
    try {
        // Try using page.click() first (preferred method)
        await page.click('fieldset:nth-of-type(1) .cta-submit-form.cta-next-step');
    } catch (error) {
        console.warn('page.click() failed, trying page.evaluate() as fallback:', error.message);

        try {
            // Use evaluate() as fallback to directly interact with the DOM
            await page.evaluate(() => {
                const button = document.querySelector('fieldset:nth-of-type(1) .cta-submit-form.cta-next-step');
                if (button) {
                    button.click();
                }
            });
        } catch (error) {
            throw Error('nav::clicking submit button')
        }
    }

    // Additional click, if necessary, for meta suggestions
    try {
        await page.click('.cta-submit-form.cta-next-step.build-meta-suggestions');
    } catch (error) {
        console.warn('page.click() failed on the meta suggestions button, trying page.evaluate() as fallback:', error.message);

        try {
            // Use evaluate() as fallback for meta suggestions button
            await page.evaluate(() => {
                const metaButton = document.querySelector('.cta-submit-form.cta-next-step.build-meta-suggestions');
                if (metaButton) {
                    metaButton.click();
                }
            });
        } catch (error) {
            throw Error('nav::clicking submit button')
        }
    }
}


export async function logout() {
    try {
        if (!page || !browser?.connected || !browser) return;
        await page.goto('https://www.stuvia.com/logout')
        await browser.close()
        isLoggedIn = false;
        
        return {
            message: 'Logout successful'
        }

    } catch (error) {
        console.log('Error logging out')
        throw Error('stuvia::auth::logging out')

    }
}
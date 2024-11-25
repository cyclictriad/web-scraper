import { grayscale, PageSizes, PDFDocument, rgb, StandardFonts, } from "pdf-lib";
import fs from "fs";
import { toTitleCase, writeFile } from "./uni";
import path from "path";
// import fetch from 'node-fetch'

let PDF;
// const ROMAN_NUMERALS = [
//     'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
//     'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI',
//     'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI',
//     'XXXVII', 'XXXVIII', 'XXXIX', 'XL', 'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV', 'XLVI', 'XLVII',
//     'XLVIII', 'XLIX', 'L', 'LI', 'LII', 'LIII', 'LIV', 'LV', 'LVI', 'LVII', 'LVIII', 'LIX',
//     'LX', 'LXI', 'LXII', 'LXIII', 'LXIV', 'LXV', 'LXVI', 'LXVII', 'LXVIII', 'LXIX', 'LXX',
//     'LXXI', 'LXXII', 'LXXIII', 'LXXIV', 'LXXV', 'LXXVI', 'LXXVII', 'LXXVIII', 'LXXIX', 'LXXX',
//     'LXXXI', 'LXXXII', 'LXXXIII', 'LXXXIV', 'LXXXV', 'LXXXVI', 'LXXXVII', 'LXXXVIII', 'LXXXIX',
//     'XC', 'XCI', 'XCII', 'XCIII', 'XCIV', 'XCV', 'XCVI', 'XCVII', 'XCVIII', 'XCIX', 'C'
// ];

function numberToRoman(num) {
    if (num <= 0 || num >= 4000) {
        throw new Error("Input must be between 1 and 3999");
    }

    const romanNumerals = [
        ["M", 1000],
        ["CM", 900],
        ["D", 500],
        ["CD", 400],
        ["C", 100],
        ["XC", 90],
        ["L", 50],
        ["XL", 40],
        ["X", 10],
        ["IX", 9],
        ["V", 5],
        ["IV", 4],
        ["I", 1]
    ];

    let result = "";

    for (const [roman, value] of romanNumerals) {
        while (num >= value) {
            result += roman;
            num -= value;
        }
    }

    return result;
}


export async function producePDF({ quiz, preferences: config, heading }) {
    try {
        await createNewPDF();

        const filePath = `${config.root}/${config.course.name}/${config.subject.name}/${heading.replace(/\//g, '_')}.pdf`;

        if (config.cover_page.consent) {
            await drawCoverPage(heading, config);
        }
        // await drawDocumentBody(quiz, config);
        await drawBody(quiz, config);
        await drawHeaderAndFooter(config)
        setDocMeta(heading, config)
        const pdfBytes = await PDF.save();
        writeFile({
            filePath,
            data: pdfBytes
        })

        return {
            pages: PDF.getPageCount(),
            filePath,
        }
    } catch (error) {
        console.log(error);
    }
}


function getColor(rgbString) {
    // Use a regular expression to validate and capture the RGB values
    const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
        // Extract the values and format the output
        const r = Number(match[1]) / 255;
        const g = Number(match[2]) / 255;
        const b = Number(match[3]) / 255;
        return rgb(r, g, b);
    } else {
        throw new Error('Invalid RGB string format');
    }
}


const createNewPDF = async () => {
    PDF = await PDFDocument.create();
}

async function getFont(fontName) {
    return (await PDF.embedFont(StandardFonts[fontName]));
}
function createNewPage() {
    return PDF.addPage(PageSizes.Letter);
}


// const page = (await PDFDocument.create()).addPage()
// page.drawImage


function getCoverImageUrl(config) {
    return ""
    // return config.cover_page.images.subjects.find(subjectImage => subjectImage.id.toString() === config.subject._id.toString())?.url || config.cover_page.images.courses.find(courseImage => courseImage.id.toString() === config.course._id.toString())?.url
}

function setDocMeta(heading, config) {
    PDF.setLanguage('en-us')
    PDF.setAuthor(toTitleCase(config.author))
    PDF.setCreator(toTitleCase(config.author))
    PDF.setProducer(toTitleCase(config.author))
    PDF.setTitle(toTitleCase(heading))
    PDF.setSubject(toTitleCase(config.subject.name))
    PDF.setKeywords(config.keywords)
    PDF.setCreationDate(new Date())
    PDF.setModificationDate(new Date())
}

async function drawCoverPage(heading, config) {
    let font, fontSize;

    const COVER_PAGE = createNewPage();
    const SUBJECT_NAME = toTitleCase(config.subject.name);
    const QUIZ_HEADING = toTitleCase(heading)
    const MARGIN_BOTTOM = 150;

    font = await getFont('TimesRomanBold')
    fontSize = 28 // Larger for main title

    const { width: COVER_PAGE_WIDTH, height: COVER_PAGE_HEIGHT } = COVER_PAGE.getSize()

    function getFittingDimensions({ imageWidth, imageHeight, COVER_PAGE_WIDTH = 612, maxImageHeight = 592 }) {
        // Use golden ratio (1.618) for pleasing image dimensions
        const targetWidth = COVER_PAGE_WIDTH * 0.75; // 75% of page width
        const targetHeight = maxImageHeight * 0.4; // 40% of page height

        const widthRatio = targetWidth / imageWidth;
        const heightRatio = targetHeight / imageHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        return {
            width: imageWidth * scaleRatio,
            height: imageHeight * scaleRatio
        };
    }

    // Start with a decorative top bar
    COVER_PAGE.drawRectangle({
        x: 0,
        y: COVER_PAGE_HEIGHT - 40,
        width: COVER_PAGE_WIDTH,
        height: 8,
        color: rgb(0, 0, 0.6), // Deep blue
    });

    // Process image
    const COVER_IMAGE_URL = getCoverImageUrl(config)
    let currentY = COVER_PAGE_HEIGHT - 60; // Default text position if no image

    if (COVER_IMAGE_URL) {
        const COVER_IMAGE_BYTES = fs.readFileSync(COVER_IMAGE_URL);

        const COVER_IMAGE_EXT = path.extname(COVER_IMAGE_URL)
        let coverImage;
        if (COVER_IMAGE_EXT === '.png') {
            coverImage = await PDF.embedPng(COVER_IMAGE_BYTES);
        } else if (COVER_IMAGE_EXT === '.jpg' || COVER_IMAGE_EXT === '.jpeg') {
            coverImage = await PDF.embedJpg(COVER_IMAGE_BYTES);
        } else throw Error('invalid Image format');

        const dimensions = getFittingDimensions({
            imageWidth: coverImage.width,
            imageHeight: coverImage.height,
            COVER_PAGE_WIDTH,
            maxImageHeight: COVER_PAGE_HEIGHT * 0.9
        });

        const { width: COVER_IMAGE_WIDTH, height: COVER_IMAGE_HEIGHT } = coverImage.scale(dimensions.width / coverImage.width);

        // Draw image below top bar
        COVER_PAGE.drawImage(coverImage, {
            x: (COVER_PAGE_WIDTH - COVER_IMAGE_WIDTH) / 2,
            y: COVER_PAGE_HEIGHT - COVER_IMAGE_HEIGHT - 80, // 80 units from top
            width: COVER_IMAGE_WIDTH,
            height: COVER_IMAGE_HEIGHT,
        });

        currentY = COVER_PAGE_HEIGHT - COVER_IMAGE_HEIGHT - 120; // Space for text below image
    }


    // Title section with larger font and better spacing
    COVER_PAGE.drawText(SUBJECT_NAME, {
        x: (COVER_PAGE_WIDTH - font.widthOfTextAtSize(SUBJECT_NAME, fontSize)) / 2,
        y: currentY - 40,
        font,
        size: fontSize,
        color: rgb(0, 0, 0.6), // Deep blue to match top bar
        lineHeight: 32,
    })

    // Subtitle with elegant styling
    font = await getFont('TimesRomanBoldItalic')
    fontSize = 20 // Larger subtitle
    COVER_PAGE.drawText(QUIZ_HEADING, {
        x: (COVER_PAGE_WIDTH - font.widthOfTextAtSize(QUIZ_HEADING, fontSize)) / 2,
        y: currentY - 100, // More spacing from title
        font,
        size: fontSize,
        color: grayscale(0.4),
        lineHeight: 24,
    })


    // Draw decorative elements
    COVER_PAGE.drawRectangle({
        x: COVER_PAGE_WIDTH * 0.1, // 10% margin
        y: MARGIN_BOTTOM + 40,
        width: COVER_PAGE_WIDTH * 0.8, // 80% width
        height: 1,
        color: grayscale(0.8), // Light gray line
    });

    // Author info with professional styling
    font = await getFont('TimesRomanBold')
    fontSize = 18
    COVER_PAGE.drawText(`Compiled By ${toTitleCase(config.author)}`, {
        x: (COVER_PAGE_WIDTH - font.widthOfTextAtSize(`Compiled By ${toTitleCase(config.author)}`, fontSize)) / 2,
        y: MARGIN_BOTTOM,
        font,
        size: fontSize,
        color: rgb(0, 0, 0.5), // Medium blue
        lineHeight: 24,
    })

    // Edition with matching style
    font = await getFont('TimesRomanBoldItalic')
    fontSize = 16

    const year = (new Date()).getFullYear()
    const EDITION = `Edition: ${year}/${(year + 1).toString().slice(-2)}`
    COVER_PAGE.drawText(EDITION, {
        x: (COVER_PAGE_WIDTH - font.widthOfTextAtSize(EDITION, fontSize)) / 2,
        y: MARGIN_BOTTOM - 30,
        font,
        size: fontSize,
        color: grayscale(0.5),
        lineHeight: 20,
    })

    // Bottom decorative bar
    COVER_PAGE.drawRectangle({
        x: 0,
        y: 40,
        width: COVER_PAGE_WIDTH,
        height: 4,
        color: rgb(0, 0, 0.6), // Match top bar
    });
}



function splitIntoTaggedLines(input) {
    const tags = [
        "subheading",
        "question",
        "choice",
        "correct",
        "bold",
        "image",
        "tip",
    ];

    // Create a regex to match all allowed tags, including nested content for <image>
    const tagPattern = new RegExp(
        `<(${tags.join("|")})>([\\s\\S]*?)</\\1>`,
        "g"
    );

    const result = [];
    let match;

    // Iterate over all matches and collect them
    while ((match = tagPattern.exec(input)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1];
        const content = match[2];

        // If the tag is not <image>, check for nested <image> tags
        if (tagName !== "image" && content.includes("<image>")) {
            // Extract and separate <image> tags
            const innerImagePattern = /<image>[\s\S]*?<\/image>/g;
            const innerImages = content.match(innerImagePattern) || [];

            // Add the tag content without <image> tags
            const contentWithoutImages = content.replace(innerImagePattern, "").trim();
            if (contentWithoutImages) {
                result.push(`<${tagName}>${contentWithoutImages}</${tagName}>`);
            }

            // Add extracted <image> tags separately
            result.push(...innerImages);
        } else {
            // Add the full match as is
            result.push(fullMatch);
        }
    }

    return result;
}



function analyzeTag(text) {
    // Match any tag and its content
    const match = text.match(/<(\w+)>(.*?)<\/\1>/);

    if (!match) {
        return null;
    }

    return {
        tag: match[1],      // The tag name
        content: match[2]   // The content between tags
    };
}


async function drawBody(quiz, config) {
    const LEFT_MARGIN = config.margin.left;
    const RIGHT_MARGIN = config.margin.right;
    const TOP_MARGIN = config.margin.top;
    const BOTTOM_MARGIN = config.margin.bottom;
    const [DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT] = PageSizes.Letter;
    const INNER_WIDTH = DEFAULT_PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    const HEADER_HEIGHT = config.header.font.line_height;
    const FOOTER_HEIGHT = config.footer.font.line_height;
    const HEADER_MARGIN = config.header.margin;
    const FOOTER_MARGIN = config.footer.margin;
    const BODY_TOP = DEFAULT_PAGE_HEIGHT - HEADER_MARGIN - HEADER_HEIGHT - TOP_MARGIN;
    const BODY_BOTTOM = FOOTER_MARGIN + FOOTER_HEIGHT + BOTTOM_MARGIN;
    const LINE_HEIGHT = config.font.line_height; // Line height for text

    let font, fontSize, fontColor;
    let currentY = BODY_TOP;  // Starting Y position
    let defaultPage = createNewPage();

    quiz = quiz
        // Replace unsupported characters with a space or other symbol
        .replace(/[^\x00-\xFF]/g, '')

    const lines = splitIntoTaggedLines(quiz);

    function extractUrlAndCaption(str) {
        let url;
        let caption = null;

        // Try to get zoom URL first, then fall back to link URL
        const zoomMatch = str.match(/<zoom>(.*?)<\/zoom>/);
        const linkMatch = str.match(/<link>(.*?)<\/link>/);
        url = zoomMatch ? zoomMatch[1] : linkMatch?.[1];

        // Get caption if it exists
        const captionMatch = str.match(/<caption>(.*?)<\/caption>/);
        if (captionMatch) {
            caption = captionMatch[1];
        }

        if (!url) {
            throw new Error('No valid URL found in zoom or link tags');
        }

        return { url, caption };
    }

    async function drawImage(imageUrl) {
        if (!imageUrl) return;

        const jpgImageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
        const jpgImage = await PDF.embedJpg(jpgImageBytes);

        // Original dimensions
        const { width: originalWidth, height: originalHeight } = jpgImage.scale(1);

        // Scale the image if its height exceeds 100
        let scaledWidth = originalWidth;
        let scaledHeight = originalHeight;

        const scaleFactor = 150 / originalHeight;
        scaledWidth = originalWidth * scaleFactor;
        scaledHeight = 150;

        // Check if the image fits the remaining space, create a new page if needed
        if ((currentY - scaledHeight) < BODY_BOTTOM) {
            defaultPage = createNewPage();
            currentY = BODY_TOP;
        }

        // Draw the image on the PDF
        defaultPage.drawImage(jpgImage, {
            x: LEFT_MARGIN,
            y: currentY - scaledHeight,
            width: scaledWidth, // Adjusted width
            height: scaledHeight, // Adjusted height
        });

        // Update the current Y position
        currentY -= (scaledHeight+5);
    }
    //text wrap
    function getSpanningLines(originalLine) {
        let lines = [];
        const multiLine = originalLine.split('<br>')

        for (const line of multiLine) {
            const textWidth = font.widthOfTextAtSize(line, fontSize)
            if (textWidth > INNER_WIDTH) {
                let words = line.split(' ')
                let phrase = ""
                for (const word of words) {

                    let phraseWidth = font.widthOfTextAtSize(phrase, fontSize)
                    if ((phraseWidth + font.widthOfTextAtSize(word, fontSize)) > INNER_WIDTH) {
                        lines.push(phrase)

                        phrase = ""
                    } else {
                        phrase += ` ${word}`

                    }
                }
            } else {
                lines.push(line)
            }
        }
        return lines
    }


    const choices = Array.from('ABCD');
    let currentQuestion = 1;
    let currentChoiceIndex = 0;
    const isMultipleChoice = quiz.includes('<choice>')

    for (const line of lines) {
        let { tag, content: lineContent } = analyzeTag(line)

        if (tag === 'subheading') {
            font = await getFont(config.sub_heading.family)
            fontSize = config.sub_heading.size;
            fontColor = getColor(config.sub_heading.color)

        }

        if (tag === 'question') {
            font = await getFont(config.font.family)
            fontSize = config.font.size
            fontColor = getColor(config.font.color)

            lineContent = `${currentQuestion}. ${lineContent}`
            currentQuestion += 1;
        }
        if (tag === 'choice') {
            font = await getFont(config.font.family);
            fontSize = config.font.size;
            fontColor = getColor(config.font.color)
            lineContent = `${choices[currentChoiceIndex]}. ${lineContent}`

            if (currentChoiceIndex < 3) {
                currentChoiceIndex += 1;
            } else {
                currentChoiceIndex = 0;
            }


        }
        

        if (tag === "correct") {
            font = await getFont(config.font.family);
            fontSize = config.font.size;
            fontColor = getColor(config.font.color)
            const highLightColor = isMultipleChoice ? rgb(0.8, 0.85, 0.95) : rgb(1, 1, 0)

            if (isMultipleChoice) {
                lineContent = `${choices[currentChoiceIndex]}. ${lineContent}`
                if (currentChoiceIndex < 3) {
                    currentChoiceIndex += 1;
                } else {
                    currentChoiceIndex = 0;
                }
            }

            let initialY = currentY
            for (const spannedLine of getSpanningLines(lineContent)) {
                defaultPage.drawRectangle({
                    x: LEFT_MARGIN - 5,
                    y: initialY - 3, // Adjust this to create space above and below the text
                    width: font.widthOfTextAtSize(spannedLine, fontSize) + 10,
                    height: LINE_HEIGHT - 2, // Reduce height for a thinner highlight
                    color: highLightColor  // 50% transparent yellow
                });
                initialY -= LINE_HEIGHT
            }

        }

        if (tag === 'image') {

            await drawImage(extractUrlAndCaption(lineContent).url)
        } else {

            for (const spannedLine of getSpanningLines(lineContent)) {

                defaultPage.drawText(spannedLine, {
                    x: LEFT_MARGIN,
                    y: currentY,
                    size: fontSize,
                    color: fontColor,
                    font,
                });
                currentY -= LINE_HEIGHT;
            }
        }

        if (currentY < BODY_BOTTOM) {
            currentY = BODY_TOP // Reset Y position for new page
            defaultPage = createNewPage(); // Create new page
        }
    }


}

async function drawHeaderAndFooter(config) {
    const LEFT_MARGIN = config.margin.left;
    const RIGHT_MARGIN = config.margin.right;
    const [DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT] = PageSizes.Letter;
    const INNER_WIDTH = DEFAULT_PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    const HEADER_HEIGHT = config.header.font.line_height;
    const FOOTER_HEIGHT = config.footer.font.line_height;
    const HEADER_MARGIN = config.header.margin;
    const FOOTER_MARGIN = config.footer.margin;
    const HEADER_TOP = DEFAULT_PAGE_HEIGHT - HEADER_MARGIN;
    const HEADER_BOTTOM = HEADER_TOP - HEADER_HEIGHT;
    const FOOTER_TOP = FOOTER_MARGIN + FOOTER_HEIGHT;

    const START_COLOR = { r: 0.0, g: 0.2, b: 0.6 }; // Dark blue
    const END_COLOR = { r: 0.0, g: 0.0, b: 0.0 };   // Black
    let font, fontSize;

    // Function to draw a horizontal gradient
    function drawHorizontalGradient(page, y) {
        const steps = 10; // Number of steps in the gradient
        const stepWidth = INNER_WIDTH / steps;

        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const color = {
                r: START_COLOR.r + ratio * (END_COLOR.r - START_COLOR.r),
                g: START_COLOR.g + ratio * (END_COLOR.g - START_COLOR.g),
                b: START_COLOR.b + ratio * (END_COLOR.b - START_COLOR.b),
            };

            page.drawRectangle({
                x: LEFT_MARGIN + i * stepWidth,
                y,
                width: stepWidth,
                height: HEADER_HEIGHT,
                color: rgb(color.r, color.g, color.b),
            });
        }
    }

    function drawAlignedText(textObj, section, page) {
        let x, y;
        if (textObj.alignment === 'Left') {
            x = LEFT_MARGIN + 10
        } else if (textObj.alignment === 'Right') {
            x = DEFAULT_PAGE_WIDTH - RIGHT_MARGIN - font.widthOfTextAtSize(textObj.text, fontSize) - 10
        } else if (textObj.alignment === 'Center') {
            x = LEFT_MARGIN + (INNER_WIDTH - font.widthOfTextAtSize(textObj.text, fontSize)) / 2
        }
        if (section === 'header') {
            y = HEADER_TOP - fontSize
        } else if (section === 'footer') {
            y = FOOTER_TOP - fontSize
        }

        page.drawText(textObj.text, {
            x, // Position to the right with margin
            y, // Adjust for vertical alignment
            size: fontSize,
            font,
            color: getColor(config[section].font.color), // White text
        });
    }

    for (const [index, page] of PDF.getPages().entries()) {
        if (index === 0) continue; // Skip the cover page

        // Draw the header gradient
        drawHorizontalGradient(page, HEADER_BOTTOM);

        fontSize = config.header.font.size
        font = await getFont(config.header.font.family)
        for (const textObj of parseHeaderFooterContent(config, 'header', index)) {
            drawAlignedText(textObj, 'header', page)
        }
        fontSize = config.footer.font.size
        font = await getFont(config.footer.font.family)
        page.drawRectangle({
            x: LEFT_MARGIN,
            y: FOOTER_TOP,
            width: INNER_WIDTH,
            height: 2,
            color: getColor('rgb(10,10,10)'),
        });

        for (const textObj of parseHeaderFooterContent(config, 'footer', index)) {
            drawAlignedText(textObj, 'footer', page)
        }

    };
}

function resolvePlaceHolder({ text = "", config, index }) {
    const year = (new Date()).getFullYear()
    // Calculate edition based on the year
    const edition = `${year}/${(year + 1).toString().slice(-2)} Edition`;

    // Draw the page number text
    const pageNumber = `${config.page.style === 'numeric' ? index : numberToRoman(index)} of ${config.page.style === 'numeric' ? PDF.getPageCount() - 1 : numberToRoman(PDF.getPageCount() - 1)} pages`

    // Replace placeholders with actual values
    return text
        .replace(/#s/g, config.subject.name)  // Replace #s with subject
        .replace(/#c/g, config.course.name)   // Replace #c with course
        .replace(/#e/g, edition) // Replace #e with edition
        .replace(/#y/g, year) // Replace #y with edition
        .replace(/#a/g, config.author) // Replace #a with author
        .replace(/#p/g, pageNumber); // Replace #p with page

}

function parseHeaderFooterContent(config, section, index) {
    // Retrieve the text and alignment from the configuration
    const sectionedTexts = config[section].text;
    const alignment = config[section].alignment;

    // Initialize the result array
    const result = [];

    // Check for the presence of ';'
    if (!sectionedTexts.includes(';')) {
        // Case 1: No delimiter present, return alignment as is
        result.push({
            alignment: alignment, // left, right, or center
            text: resolvePlaceHolder({ text: sectionedTexts.trim(), config, index })
        });
    } else {
        // Case 2: Single delimiter present
        const texts = sectionedTexts.split(';');
        if (texts.length === 2) {
            // Return two objects with 'Left' and 'Right' alignments
            result.push({
                alignment: 'Left',
                text: resolvePlaceHolder({ text: texts[0].trim(), config, index })
            });
            result.push({
                alignment: 'Right',
                text: resolvePlaceHolder({ text: texts[1].trim(), config, index })
            });
        }
    }

    return result;
}

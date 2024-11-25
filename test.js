async function _drawBSBody(quiz, config) {
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

    let font, fontSize;
    let currentY = BODY_TOP;  // Starting Y position
    let defaultPage = createNewPage();

    font = await getFont(config.font.family)
    fontSize = config.font.size

    const lines = quiz.split('\n');


    const getSpannedTextHeight = (line) => font.widthOfTextAtSize(line, fontSize) / INNER_WIDTH * LINE_HEIGHT

    function getBlockHeight(index) {
        const isSubHeading = lines[index].startsWith('#') && lines[index].endsWith('#')
        const isQuestion = /^\d+\.\s/.test(lines[index])

        if (isSubHeading) {
            return getSpannedTextHeight(lines.slice(index, index + 5).join(""))
        } else if (isQuestion) {
            return getSpannedTextHeight(lines.slice(index, index + 2).join(""))
        } else {
            return getSpannedTextHeight(lines[index])
        }
    }

    function circle(line) {
        line = line.trim()
        const firstLetter = line.slice(0, 1)
        if (/^[ABCD]/.test(line)) {
            defaultPage.drawEllipse({
                x: LEFT_MARGIN + font.widthOfTextAtSize(firstLetter, fontSize) - 4,
                y: currentY + fontSize / 2 - 2, // Adjust Y to account for baseline
                xScale: fontSize / 2 + 2,
                yScale: fontSize / 2 + 2,
                borderColor: rgb(1, 0, 0), // Red color for the circle
                borderWidth: 1.5,
            });
        }
    }



    for (let [index, line] of lines.entries()) {
        // Add extra space between questions
        line = line.trim()
        if (line === "") {
            currentY -= LINE_HEIGHT; // Add space for empty line
            continue; // Skip empty lines
        }

        // Check for title formatting
        if (line.startsWith('#') && line.endsWith('#')) {
            // Check if there's enough space for title and the following content
            if ((currentY - getBlockHeight(index)) < BODY_BOTTOM) {
                currentY = BODY_TOP; // Reset Y position for new page
                defaultPage = createNewPage(); // Create new page
            }
            const title = line.replace(/\#/g, '').replace(/Circle/g, config.mark).replace('the letter of ', config.mark == 'Higlight' ? '' : 'the letter of ');

            defaultPage.drawText(title, {
                x: LEFT_MARGIN,
                y: currentY,
                size: config.sub_heading.size,
                color: getColor(config.sub_heading.color),
                font: await getFont(config.sub_heading.family)
            });
            currentY -= LINE_HEIGHT; // Move down for the next line
        } else {
            // Handle highlighted answers
            const isCorrectAnswer = line.includes('*');
            line = isCorrectAnswer ? line.replace(/\*/g, '') : line;

            const isQuestion = /^\d+\.\s/.test(line)

            //text wrap
            function getSpanningLines(line) {
                const textWidth = font.widthOfTextAtSize(line, fontSize)
                if (textWidth > INNER_WIDTH) {
                    let words = line.split(' ')
                    let lines = [];
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
                    return lines
                } else return [line];
            }
            if (isQuestion) {
                if ((currentY - getBlockHeight(index)) < BODY_BOTTOM) {
                    currentY = BODY_TOP; // Reset Y position for new page
                    defaultPage = createNewPage(); // Create new page
                }
            }
            let initialY = currentY; // Track initial Y position for highlight

            for (let currentSpan of getSpanningLines(line)) {

                if (isCorrectAnswer) {
                    if (config.mark === 'Highlight') {
                        const highlightWidth = font.widthOfTextAtSize(currentSpan, fontSize);
                        defaultPage.drawRectangle({
                            x: LEFT_MARGIN - 5,
                            y: initialY - 3, // Adjust this to create space above and below the text
                            width: highlightWidth + 10,
                            height: LINE_HEIGHT - 2, // Reduce height for a thinner highlight
                            color: rgb(0.8, 0.85, 0.95), // Light highlight color #CCd9F1
                        });
                    } else if (config.mark === 'Circle') {
                        currentSpan = currentSpan.replace(/([A-D]):/g, '$1 ')
                        circle(currentSpan)
                    }
                }
                defaultPage.drawText(currentSpan.trim(), {
                    x: LEFT_MARGIN,
                    y: currentY,
                    size: fontSize,
                    color: getColor(config.font.color),
                    font,
                });
                currentY -= LINE_HEIGHT; // Move down for the next line
                initialY = currentY; // Update initialY for highlight
                if (currentY < BODY_BOTTOM) {
                    currentY = BODY_TOP // Reset Y position for new page
                    defaultPage = createNewPage(); // Create new page
                }
            }

        }
    }
}


async function drawCramBody(quiz, config) {
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

    let font, fontSize;
    let currentY = BODY_TOP;  // Starting Y position
    let defaultPage = createNewPage();

    font = await getFont(config.font.family);
    fontSize = config.font.size;

    // Step 1: Replace \\n and \n appropriately in the quiz content
    quiz = quiz.replace(/\\n/g, '\n');  // Replace \\n with a single line break
    quiz = quiz.replace(/\t/g, '\n');  // Replace \\n with a single line break
    quiz = quiz.replace(/\n/g, '\n\n');  // Replace \n with double line breaks

    // Step 2: Split the content by newlines to process each question-answer pair
    const lines = quiz.split('\n');

    console.log({ lines })


    //text wrap
    function getSpanningLines(line) {
        const textWidth = font.widthOfTextAtSize(line, fontSize)
        if (textWidth > INNER_WIDTH) {
            let words = line.split(' ')
            let lines = [];
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
            return lines
        } else return [line];
    }

    // Helper function to draw images
    async function drawImage(imageUrl) {
        if (!imageUrl) return;
        const jpgImageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer())
        const jpgImage = await PDF.embedJpg(jpgImageBytes)
        const { width: IMG_WIDTH, height: IMG_HEIGHT } = jpgImage.scale(1)
        if ((currentY - IMG_HEIGHT) < BODY_BOTTOM) {
            defaultPage = createNewPage()
            currentY = BODY_TOP
        }

        // Assuming image URL is correctly formatted and publicly accessible
        defaultPage.drawImage(jpgImage, {
            x: LEFT_MARGIN,
            y: currentY - IMG_HEIGHT,
            width: IMG_WIDTH,  // Adjust image size as needed
            height: IMG_HEIGHT,  // Adjust image size as needed
        });

        currentY -= IMG_HEIGHT

    }

    // console.log({ lines })

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines
        if (line === "") {
            currentY -= LINE_HEIGHT;
            continue;
        }

        // Check if the answer contains an image URL
        const imageUrlPattern = /https:\/\/images\.cram\.com\/.*\.jpg/;
        const isImage = imageUrlPattern.test(line.trim())

        if (isImage) {
            await drawImage(line, currentY)
        } else {
            // No image link, proceed to draw the question and answer as normal
            for (let currentSpan of getSpanningLines(line)) {

                defaultPage.drawText(currentSpan.trim(), {
                    x: LEFT_MARGIN,
                    y: currentY,
                    size: fontSize,
                    color: getColor(config.font.color),
                    font,
                });
                currentY -= LINE_HEIGHT; // Move down for the next line
                if (currentY < BODY_BOTTOM) {
                    currentY = BODY_TOP // Reset Y position for new page
                    defaultPage = createNewPage(); // Create new page
                }
            }
        }

        // Check if we need to add space before the next question or content
        if (currentY < BODY_BOTTOM) {
            currentY = BODY_TOP;  // Reset Y position for new page
            defaultPage = createNewPage();  // Create a new page
        }
    }
}



{
    "name": "Careers",
    "keywords": [
        "Job",
        "Profession",
        "Career Development"
    ],
    "subjects": [
        "Business",
        "Vocations",
        "Law Enforcement"
    ]
}




const emit = defineEmits(["update:modelValue"]);
const options = ref([]); // Array to store selected subjects
const dropdownOpen = ref(false); // Controls the visibility of the dropdown
const query = ref("");
const searchBox = ref(null);
const selected = ref(0);
const include = ref(true);

// Toggle mode between 'include' and 'except'
function toggleMode() {
  include.value = !include.value;
}

include.value = props.modelValue.include;

options.value = props.availableOptions.filter((option) =>
  props.modelValue.list.some(
    (selectedOption) => selectedOption === option.name.toString()
  )
);

watch(include, () => {
  emit("update:modelValue", { ...props.modelValue, include: include.value });
});

// Watch for changes in options
watch(
  options,
  (newList) => {
    console.log("new list", newList);
    emit("update:modelValue", {
      ...props.modelValue,
      list: newList.map((option) => option._id),
    });
  },
  { deep: true }
);

const add = (option) => {
  if (!option && query.value) {
    option = sortedOptions.value[selected.value];
  }
  if (option && !options.value.includes(option)) {
    options.value = [...options.value, option];
    dropdownOpen.value = false;
    query.value = "";
  }
};

const remove = (index) => {
  options.value = options.value.filter((_, i) => i !== index);
};

const sortedOptions = computed(() => {
  if (query.value) {
    selected.value = 0;
  }
  return props.availableOptions
    .filter(
      (option) =>
        !options.value.some(
          (selectedOption) => selectedOption.name === option.name
        )
    )
    .map((option) => {
      // Calculate how well the option matches the query using regex
      const matchScore = calculateMatchScoreWithRegex(option.name, query.value);
      return { option, matchScore };
    })
    .sort((a, b) => {
      // Sort by match score (higher score first)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // If scores are equal, sort alphabetically
      return a.option.name.localeCompare(b.option.name);
    })
    .map((item) => item.option); // Extract the sorted options
});

// Function to calculate the match score using regex
const calculateMatchScoreWithRegex = (option, query) => {
  if (!query) return 0; // If no query, score is 0
  const optionLower = option.toLowerCase();
  const queryLower = query.toLowerCase();
  const pattern = queryLower
    .split("")
    .map((char) => `${char}`)
    .join(".*");
  const regex = new RegExp(pattern, "i");
  return regex.test(optionLower) ? optionLower.match(regex)[0].length : 0;
};

// Handle arrow key navigation for the dropdown
const startSearching = (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (selected.value < sortedOptions.value.length - 1) {
      selected.value += 1;
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (selected.value > 0) {
      selected.value -= 1;
    }
  } else if (event.key === "Enter" && dropdownOpen.value) {
    event.preventDefault();
    add(props.availableOptions[selected.value]);
  } else {
    if (searchBox.value && document.activeElement !== searchBox.value) {
      searchBox.value.focus(); // Focus the input
    }
  }
};

// Mount the keyboard event listener
onMounted(() => {
  console.log(props.availableOptions)
  window.addEventListener("keydown", startSearching);
});

// Clean up the event listener on unmount
onBeforeUnmount(() => {
  window.removeEventListener("keydown", startSearching);
});


const flashCardSet = await fetchFlashCardSet("1209247")
const userId = getCookie(event, '_id')
const user = await User.findById(userId)
const course = {
    name: "Test Course"
}
const subject = {
    name: "Test subject"
}

const pdfDetails = await $fetch('/api/gen-pdf', {
    method: 'POST',
    body: {
        quiz: flashCardSet.body,
        heading: flashCardSet.title,
        preferences: {
            ...user.preferences.upload.document,
            root: user.preferences.upload.dir,
            author: user.name,
            course,
            subject,
            keywords: ['2024', course.name, subject.name, 'pdf']
        },
    },
});

return {
    pdfDetails
};
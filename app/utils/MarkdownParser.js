export function convertMarkdownToHtml(unformattedText) {
    let text = unformattedText;
    unformattedText = unformattedText.trim()
    // Initialize counts for open markers
    let inlineCount = 0;
    let blockCount = 0;

    // Loop through the unformattedText to count inline and block markers
    for (let i = 0; i < unformattedText.length; i++) {
        if (unformattedText.substr(i, 3) === '```') { // Check for block code
            blockCount++;
            i += 2; // Skip the next two characters since we found a block
        } else if (unformattedText[i] === '`') { // Check for inline code
            inlineCount++;
        }
    }

    // Determine the unclosed markers
    const unclosedInline = inlineCount % 2; // If odd, one inline is unclosed
    const unclosedBlock = blockCount % 2;   // If odd, one block is unclosed

    // Create a result that starts with the original unformattedText
    let completedText = unformattedText;

    // Add closing markers as needed
    if (unclosedInline) {
        completedText += '`'; // Close inline code
    }
    if (unclosedBlock) {
        completedText += '```'; // Close block code
    }

    const codes = []; // Array to store extracted code snippets

    // Regular expression to find block and inline code
    const blockCodeRegex = /```([\s\S]*?)```/g; // Matches triple backtick code blocks
    const inlineCodeRegex = /`([^`]+)`/g; // Matches inline code

     // Extract block codes first to avoid messing up inline replacements
     completedText = completedText.replace(blockCodeRegex, (match, code) => {
        // Store only multi-line codes
        const codePlaceholder = `code_${codes.length}`;
        codes.push({
            type: 'multi-line',
            code:  extractCode(code).pop().replaceAll("    ", "\n"), // Ensure there's no leading or trailing whitespace
            language: extractCode(code).shift() // Assuming first word is the language
        });
        return codePlaceholder;
    });


    // Extract inline codes next and replace them directly
    completedText = completedText.replace(inlineCodeRegex, (match, code) => {
        // Directly replace inline codes with styled HTML
        return `<code style="background-color: #282a36; color: #f8f8f2; padding: 2px 5px; border-radius: 3px;">${code.trim()}</code>`;
    });
    

    completedText = replaceMarkdownWithHtml(autoCompleteNormalMarkdown(completedText))
    codes.forEach(code => console.log(JSON.stringify(code.code)))
    return {html:completedText, codes};
}

function autoCompleteNormalMarkdown(text) {
    // Define paired markers
    const pairs = [
        { open: '***', close: '***' },  // bold-italic
        { open: '**', close: '**' },    // bold
        { open: '*', close: '*' },      // italic
        { open: '~~', close: '~~' },    // strikethrough
        { open: '==', close: '==' },    // highlight
    ];

    let stack = [];
    let processedText = text;
    let i = 0;

    while (i < processedText.length) {
        let foundMarker = false;

        for (const pair of pairs) {
            const currentSlice = processedText.slice(i, i + pair.open.length);

            if (currentSlice === pair.open) {
                // Check if this is a closing marker for the top of stack
                if (stack.length > 0 && stack[stack.length - 1].marker === pair.open) {
                    // Close marker, ensure it isn't prematurely closed
                    const lastOpen = stack[stack.length - 1];

                    // Ensure spacing between closing markers if they are the same or nested
                    if (lastOpen.marker.length === pair.open.length && i > lastOpen.position) {
                        stack.pop();
                    } else if (lastOpen.marker.length < pair.open.length) {
                        stack.push({
                            marker: pair.open,
                            position: i
                        });
                    }
                } else {
                    // This is an opening marker
                    stack.push({
                        marker: pair.open,
                        position: i
                    });
                }
                i += pair.open.length;
                foundMarker = true;
                break;
            }
        }

        if (!foundMarker) {
            i++;
        }
    }

    // Add closing markers in reverse order (LIFO)
    while (stack.length > 0) {
        const openMarker = stack.pop();
        const pair = pairs.find(p => p.open === openMarker.marker);
        processedText += pair.close;
    }

    return processedText;
}

function replaceMarkdownWithHtml(markdown) {
    // Style configurations
    const styles = {
        paragraph: 'style="line-height: 1.5; margin: 10px 0;"',
        heading: (level) => `style="color: #333; font-size: ${2 - (level - 1) * 0.2}em; margin-bottom: 0.5em;"`,
        hr: 'style="border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));"',
        list: 'style="margin-left: 20px;"'
    };

    // Handle block-level elements first
    const blocks = {
        // Headers (preserved styling from old function)
        headers: {
            regex: /^(#{1,3})\s+(.+)$/gm,
            replace: (match, hashes, content) => {
                const level = hashes.length;
                return `<h${level} ${styles.heading(level)}>${content}</h${level}>`;
            }
        },
        // Horizontal rules (both --- and *** variants with preserved styling)
        hr: {
            regex: /^(-{3,}|\*{3,})$/gm,
            replace: `<hr ${styles.hr}>`
        },
        // Lists with preserved styling
        unorderedList: {
            regex: /^-\s+(.+)$/gm,
            replace: `<ul ${styles.list}><li>$1</li></ul>`
        },
        orderedList: {
            regex: /^\d+\.\s+(.+)$/gm,
            replace: `<ol ${styles.list}><li>$1</li></ol>`
        },
        // New task lists
        taskListChecked: {
            regex: /^-\s+\[x\]\s+(.+)$/gm,
            replace: `<ul ${styles.list}><li><input type="checkbox" checked>$1</li></ul>`
        },
        taskListUnchecked: {
            regex: /^-\s+\[\s+\]\s+(.+)$/gm,
            replace: `<ul ${styles.list}><li><input type="checkbox">$1</li></ul>`
        },
        // Blockquotes
        blockquote: {
            regex: /^>\s*(.*)$/gm,
            replace: '<blockquote>$1</blockquote>'
        },
        // Paragraphs (preserve styling)
        paragraph: {
            regex: /^(?!<[a-z][\s\S]*>|#{1,3}\s+|\s*$)(.+)$/gm,
            replace: `<p ${styles.paragraph}>$1</p>`
        }
    };

    // Handle inline formatting
    const inline = [
        // Combined bold and italic (must come before individual bold/italic)
        { regex: /\*\*\*(.*?)\*\*\*/g, replace: '<strong><em>$1</em></strong>' },
        // Bold
        { regex: /\*\*(.*?)\*\*/g, replace: '<strong>$1</strong>' },
        // Italic (non-greedy and doesn't match spaces after asterisk)
        { regex: /\*((?!\s)(?:(?!\*).)+)\*/g, replace: '<em>$1</em>' },
        // Highlight (preserved styling)
        { regex: /==(.*?)==/g, replace: '<mark style="background-color: yellow; padding: 0 3px;">$1</mark>' },
        // Underline
        { regex: /__(.*?)__/g, replace: '<u>$1</u>' },
        // Strikethrough
        { regex: /~~(.*?)~~/g, replace: '<del>$1</del>' },
        // Small text (preserved from old function)
        { regex: /\*Small text\*/g, replace: '<small>Small text</small>' },
        // Links
        { regex: /\[(.*?)\]\((.*?)\)/g, replace: '<a href="$2">$1</a>' },
        // Images
        { regex: /!\[(.*?)\]\((.*?)\)/g, replace: '<img src="$2" alt="$1">' }
    ];

    // Process block-level elements
    for (const [_, block] of Object.entries(blocks)) {
        markdown = markdown.replace(block.regex, block.replace);
    }

    // Process inline elements
    for (const { regex, replace } of inline) {
        markdown = markdown.replace(regex, replace);
    }

    // Clean up any potential nested lists
    markdown = markdown.replace(/<\/[ou]l>\s*<[ou]l[^>]*>/g, '');

    return markdown;
}


function extractCode(code) {
    // Predefined list of common languages
    const languages = [
        'python', 'javascript', 'java', 'ruby', 'c', 'cpp', 'go', 'html', 'css', 'bash',
        'typescript', 'php', 'sql', 'json', 'markdown', 'shell', 'swift', 'kotlin', 'rust', 'vue', 'toml', 'haskel'
    ];

    // Trim the input text to remove any leading or trailing whitespace
    const trimmedText = code.trim();

    // Try to find the first word (language) that matches any language in the predefined list
    for (let lang of languages) {
        const regex = new RegExp(`^${lang}`); // Match the language name at the start
        if (regex.test(trimmedText)) {
            // If a match is found, return the language and the rest of the code
            return [lang, trimmedText.slice(lang.length).trim()];
        }
    }

    // If no match is found, return null for the language and the entire code
    return [null, trimmedText];
}



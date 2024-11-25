export function formatMeta(metaString) {
    // Clean up extra spaces and keep newlines to recognize line breaks in parsing
    const cleanedString = metaString.replace(/^\s*|[\n\r]\s*$|[^\S\r\n]+/g, ' ').trim();

    // Updated regex pattern for flexible matching and ignoring comments
    const regexPattern = /(?:book\s*[:=]\s*(["'])?(.*?)\1?\s*(?:,|\n|$))|(?:seo\s*[:=]\s*(["'])?(.*?)\1?\s*(?:,|\n|$))|(?:description\s*[:=]\s*(["'])?(.*?)\1?\s*(?:,|\n|$))|(?:price\s*[:=]\s*\$?([\d.]+))/gi;

    let matches = Array.from(cleanedString.matchAll(regexPattern));

    // Initialize an object to hold the formatted variables
    const formattedData = {
        book: '',
        keywords: '',
        description: '',
        price: 2.5 // Default price if not found
    };

    // Map the matched fields to corresponding keys
    matches.forEach(match => {
        if (match[2]) formattedData.book = match[2].trim();
        if (match[4]) formattedData.keywords = match[4].trim();
        if (match[6]) formattedData.description = match[6].trim();
        if (match[7]) formattedData.price = parseFloat(match[7]);
    });

    // Debug log to inspect formatting
    console.log({
        unformatted: JSON.stringify(metaString),
        formatted: formattedData
    });

    return formattedData;
}

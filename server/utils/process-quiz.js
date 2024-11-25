export const formatQuizWithAnswers = function (unformattedQuiz) {
  try {
    // Split the document into sections: questions and answer key
    const [questionsSection, answerKeySection] = unformattedQuiz.split("Answer Key");
    if (!answerKeySection) throw new Error("Missing answer key");

    // Parse the answer key into a map
    const answerKeyLines = answerKeySection.trim().split("\n");
    const answerKey = {};

    answerKeyLines.forEach((line) => {
      if (line.trim() === '') return; // Skip empty lines

      const [questionNumber, answer] = line.split(".");
      if (questionNumber && answer) {
        answerKey[questionNumber.trim()] = answer.trim(); // Save the answer
      }
    });
    // Extract the major heading (ends with the word 'quiz') and store it in a variable
    const majorHeadingMatch = questionsSection.match(/(.+quiz)\n/i);
    let majorHeading = "";
    let questionsWithoutMajorHeading = questionsSection;

    if (majorHeadingMatch) {
      majorHeading = majorHeadingMatch[1].trim(); // Store the heading
      // Remove the major heading from the questions section
      questionsWithoutMajorHeading = questionsSection
        .replace(majorHeadingMatch[0], "")
        .trim();
    }

    // Replace subheadings that contain the word 'circle' with # subheading #
    questionsWithoutMajorHeading = questionsWithoutMajorHeading.replace(
      /Circle(.+)\n/gi,
      (match) => {
        return `\n#${match.trim()}#\n\n`; // Wrap subheading with # symbols
      }
    );

    // Find and format the questions
    const formattedQuiz = questionsWithoutMajorHeading.replace(
      /(\d+)\.\s*(.+?)(?=\n\d+\.\s|$)/gs,
      (match, number, questionPart) => {
        const correctAnswer = answerKey[number] || ""; // Get the correct answer
        const formattedQuestion = questionPart.replace(
          /([ABCD])\.\s*(.+?)(?=(\n|$))/g,
          (choiceMatch, choice, answerText) => {
            if (choice === correctAnswer) {
              return `*${choice}: ${answerText.trim()}*`; // Mark the correct answer
            } else {
              return `${choice}: ${answerText.trim()}`; // Regular choice formatting
            }
          }
        );
        return `${number}. ${formattedQuestion.trim()}\n\n`; // Return formatted question
      }
    )
    //remove extra whitespace
    .trim()
    // Replace unsupported characters with a space or other symbol
    .replace(/[^\x00-\xFF]/g, '');
    return {
      quiz:formattedQuiz,
      heading:majorHeading
    }; // Return the formatted quiz
  } catch (error) {
    console.error("Error formatting quiz:", error.message);
    return ""; // Return an empty string in case of an error
  }
}

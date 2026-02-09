
import fs from 'fs';
import path from 'path';

const inputFile = 'Practice Test Questions.md';
const outputFile = 'public/practice_questions.json';

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    const questions = [];

    let currentQuestion = null;
    let currentHeadline = null;
    let captureRationale = false;

    // Helper to save the current question before starting a new one
    const saveCurrentQuestion = () => {
        if (currentQuestion) {
            // Clean up rationale
            if (currentQuestion.rationale) {
                currentQuestion.rationale = currentQuestion.rationale.trim();
            }
            questions.push(currentQuestion);
        }
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // 1. Detect Headline (### Headline)
        if (line.startsWith('### ')) {
            // If we were parsing a question, save it
            saveCurrentQuestion();
            currentQuestion = null; // Reset
            captureRationale = false;

            currentHeadline = line.replace('### ', '').trim();
            continue;
        }

        // 2. Detect Question Start (**1. Question**)
        // flexible regex for "**Number. Question**"
        const questionStartMatch = line.match(/^\*\*\d+\.\s*Question\*\*$/i);
        if (questionStartMatch) {
            saveCurrentQuestion();
            captureRationale = false;

            // Initialize new question
            currentQuestion = {
                id: questions.length + 1,
                headline: currentHeadline, // Store the headline but don't display it in the question text
                text: '',
                options: [],
                correctAnswer: null,
                rationale: ''
            };

            // The next lines until " * **A." are the question text
            continue;
        }

        if (!currentQuestion) continue;

        // 3. Detect Correct Answer (**Correct Answer: X**)
        const correctAnswerMatch = line.match(/^\*\*\s*Correct Answer:\s*([A-D])\s*\*\*$/i);
        if (correctAnswerMatch) {
            currentQuestion.correctAnswer = correctAnswerMatch[1].toUpperCase();
            captureRationale = false; // Just in case
            continue;
        }

        // 4. Detect Rationale Start (**Rationale:**)
        if (line.match(/^\*\*\s*Rationale:\s*\*\*$/i)) {
            captureRationale = true;
            continue;
        }

        // 5. Capture Rationale Content
        if (captureRationale) {
            if (line.length > 0) {
                currentQuestion.rationale += line + ' ';
            }
            continue;
        }

        // 6. Detect Options (* **A.** Option text)
        const optionMatch = line.match(/^\*\s+\*\*([A-D])\.\*\*\s+(.*)/);
        if (optionMatch) {
            currentQuestion.options.push({
                label: optionMatch[1],
                text: optionMatch[2].trim()
            });
            continue;
        }

        // 7. Capture Question Body Text
        // If we happen to be in the block between "Question" and "Options"
        if (!captureRationale && !currentQuestion.options.length && !currentQuestion.correctAnswer) {
            // It's part of the question text
            if (line.length > 0) {
                // If text is not empty, add space if needed
                if (currentQuestion.text.length > 0) currentQuestion.text += ' ';
                currentQuestion.text += line;
            }
        }
    }

    // Save the last question
    saveCurrentQuestion();

    // Ensure output directory exists
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2));
    console.log(`Successfully parsed ${questions.length} questions to ${outputFile}`);

} catch (err) {
    console.error('Error parsing questions:', err);
    process.exit(1);
}

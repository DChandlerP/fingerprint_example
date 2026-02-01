
import fs from 'fs';
import path from 'path';

const inputFile = 'Questions.md';
const outputFile = 'public/questions.json';

// Mapping of identifying keywords to Law Categories
// Order matters! Specific terms should come before general ones if needed.
const LAW_CATEGORIES = [
    { key: 'ADA', label: 'Americans with Disabilities Act (ADA)' },
    { key: 'BSA', label: 'Bank Secrecy Act (BSA)' },
    { key: 'Cable Communications Policy Act', label: 'Cable Communications Policy Act' }, // Full name often used
    { key: 'Cable Act', label: 'Cable Communications Policy Act' },
    { key: 'CCPA', label: 'CCPA / CPRA' },
    { key: 'CPRA', label: 'CCPA / CPRA' },
    { key: 'California Age-Appropriate Design Code', label: 'California Age-Appropriate Design Code' },
    { key: 'COPPA', label: 'COPPA' },
    { key: 'CALEA', label: 'CALEA' },
    { key: '42 C.F.R. Part 2', label: '42 C.F.R. Part 2 (Substance Use)' },
    { key: 'Substance Use Disorder', label: '42 C.F.R. Part 2 (Substance Use)' },
    { key: 'CAN-SPAM', label: 'CAN-SPAM Act' },
    { key: 'CISA', label: 'CISA' },
    { key: 'Dodd-Frank', label: 'Dodd-Frank Act' },
    { key: 'CFPB', label: 'Dodd-Frank Act' }, // CFPB is closely tied to Dodd-Frank Title X
    { key: 'DPPA', label: 'Driver\'s Privacy Protection Act (DPPA)' },
    { key: 'FCRA', label: 'Fair Credit Reporting Act (FCRA)' },
    { key: 'FACTA', label: 'Fair Credit Reporting Act (FCRA)' },
    { key: 'FERPA', label: 'FERPA' },
    { key: 'FISA', label: 'Foreign Intelligence Surveillance Act (FISA)' },
    { key: 'FTC', label: 'FTC Act Section 5' },
    { key: 'GINA', label: 'GINA' },
    { key: 'GLBA', label: 'Gramm-Leach-Bliley Act (GLBA)' },
    { key: 'HIPAA', label: 'HIPAA' },
    { key: 'HITECH', label: 'HIPAA' },
    { key: 'Junk Fax', label: 'Junk Fax Protection Act' },
    { key: 'Pen Register', label: 'Pen Register / Trap and Trace' },
    { key: 'Privacy Protection Act', label: 'Privacy Protection Act (PPA)' },
    { key: 'PPRA', label: 'PPRA' },
    { key: 'RFPA', label: 'Right to Financial Privacy Act (RFPA)' },
    { key: 'Right to Financial Privacy', label: 'Right to Financial Privacy Act (RFPA)' },
    { key: 'SCA', label: 'Stored Communications Act (SCA)' },
    { key: 'Stored Communications', label: 'Stored Communications Act (SCA)' },
    { key: 'CLOUD Act', label: 'Stored Communications Act (SCA)' }, // Related
    { key: 'CPNI', label: 'CPNI (Telecommunications Act)' },
    { key: 'Title VII', label: 'Title VII (Civil Rights Act)' },
    { key: 'Video Privacy Protection Act', label: 'Video Privacy Protection Act (VPPA)' },
    { key: 'VPPA', label: 'Video Privacy Protection Act (VPPA)' },
    { key: 'Wiretap Act', label: 'Wiretap Act' },
    { key: 'GDPR', label: 'GDPR' } // Just in case
];

function determineCategory(questionText, previousCategory) {
    for (const cat of LAW_CATEGORIES) {
        if (questionText.includes(cat.key)) {
            return cat.label;
        }
    }
    // Specific Fallbacks based on question content context if keyword is missing
    if (questionText.includes('Cable')) return 'Cable Communications Policy Act';
    if (questionText.includes('Biometric')) return 'Biometric Privacy'; // Fallback

    // If no keyword found, assume it belongs to the previous group
    return previousCategory || 'General Privacy';
}

const fileContent = fs.readFileSync(inputFile, 'utf-8');
const lines = fileContent.split('\n');

const questions = [];
let currentQuestion = null;
let definitions = {}; // Map ID to Question Object
let answers = {}; // Map ID to Answer Object

let mode = 'QUESTIONS'; // or 'ANSWERS'

// Simple heuristic: If we see "Answer:" or "Rationale:", we are likely in the answer section
// But we can detect the switch when we see a Question 1 again or high overlap.
// Actually, looking at the file, the Answers section repeats the question text.
// The best way is to parse linearly. If we encounter a duplicate ID that already has options, 
// we might be in the answer section. BUT the file structure shows "Answer: B..." 
// The File has 1-~200 questions, then repeats 1-~200 with answers.

lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return;

    // Detect Question Header: **1. Question Text**
    const questionMatch = line.match(/^\*\*(\d+)\.\s+(.+)\*\*$/);

    if (questionMatch) {
        const id = parseInt(questionMatch[1]);
        const text = questionMatch[2];

        // START IGNORING FIRST 20 QUESTIONS
        if (id <= 20) {
            currentQuestion = null;
            return;
        }

        // If we already have this ID in our list, we are probably in the Answer Key section
        // OR duplicate question.
        const existingQ = questions.find(q => q.id === id);

        if (existingQ) {
            mode = 'ANSWERS';
            currentQuestion = existingQ; // Link back to the existing question to add answer info
        } else {
            mode = 'QUESTIONS';
            currentQuestion = {
                id: id,
                text: text,
                options: [],
                answer: null,
                rationale: null,
                category: null
            };
            questions.push(currentQuestion);
        }
    } else if (currentQuestion) {
        // Parse Options (in Question Mode)
        if (mode === 'QUESTIONS') {
            // * A. Option Text -> Regex: ^\* ([A-Z])\. (.+)
            const optionMatch = line.match(/^\*\s+([A-Z])\.\s+(.+)$/);
            if (optionMatch) {
                currentQuestion.options.push({
                    label: optionMatch[1],
                    text: optionMatch[2]
                });
            }
        }
        // Parse Answers (in Answer Mode)
        else if (mode === 'ANSWERS') {
            // * **Answer: B. ...**  OR * Answer: B. ...
            // Regex needs to be flexible.
            const answerMatch = line.match(/^\*\s+\*\*Answer:\s+([A-Z])\./);
            if (answerMatch) {
                currentQuestion.answer = answerMatch[1];
            }

            // Capture Rationale
            if (line.includes('**Rationale:**')) {
                currentQuestion.rationale = ""; // Start capturing
            } else if (currentQuestion.rationale !== null && line.startsWith('*')) {
                // Formatting rationale lines
                // Remove bullets and bolding for cleaner text if executed simple
                let cleanLine = line.replace(/^\*\s+/, '').replace(/\*\*/g, '');
                currentQuestion.rationale += cleanLine + "\n";
            }
        }
    }
});

// Post-processing: Assign Categories and Clean up
let lastCategory = null;
// We need to sort questions by ID just in case
questions.sort((a, b) => a.id - b.id);

questions.forEach(q => {
    q.category = determineCategory(q.text, lastCategory);
    lastCategory = q.category;

    // Clean up rationale whitespace
    if (q.rationale) {
        q.rationale = q.rationale.trim();
    }
});

// Write to file
fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2));

console.log(`Successfully parsed ${questions.length} questions.`);
console.log(`Saved to ${outputFile}`);

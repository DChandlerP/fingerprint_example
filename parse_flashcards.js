
import fs from 'fs';
import path from 'path';

const inputDir = 'Flash Cards Anki';
const outputFile = 'public/flashcards.json';

// Simple CSV parser for lines like "front","back"
function parseLine(line) {
    line = line.trim();
    if (!line) return null;

    // Check if line matches "front","back" pattern
    // This regex looks for: Start, Quote, anything not quote, Quote, Comma, Quote, anything not quote, Quote, End
    const match = line.match(/^"((?:[^"]|"")*)"\s*,\s*"((?:[^"]|"")*)"$/);

    if (match) {
        // Unescape double quotes if any (though unlikely in this specific dataset based on sample)
        return {
            front: match[1].replace(/""/g, '"'),
            back: match[2].replace(/""/g, '"')
        };
    }

    // Fallback? Or log warning.
    // Some lines might not strictly follow if edited manually.
    // Try basic split if regex fails, assuming no internal commas in quotes (risky but fallback)
    return null;
}

function processFiles() {
    const flashcardsData = [];

    try {
        const files = fs.readdirSync(inputDir);

        files.forEach(file => {
            if (path.extname(file) !== '.csv') return;
            if (file === 'CIPP_US.csv') return; // Exclude concatenated file

            const filePath = path.join(inputDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Generate readable category name from filename
            // e.g. "Civil_Litigation.csv" -> "Civil Litigation"
            const categoryName = file
                .replace('.csv', '')
                .replace(/_/g, ' ');

            const cards = [];
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const card = parseLine(line);
                if (card) {
                    cards.push({
                        id: `${file}-${index}`, // Unique ID for state tracking
                        ...card
                    });
                }
            });

            if (cards.length > 0) {
                flashcardsData.push({
                    name: categoryName,
                    cards: cards
                });
            }
        });

        // Sort categories alphabetically
        flashcardsData.sort((a, b) => a.name.localeCompare(b.name));

        // Ensure output dir exists
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(flashcardsData, null, 2));
        console.log(`Successfully parsed ${flashcardsData.length} categories.`);
        console.log(`Total cards: ${flashcardsData.reduce((acc, cat) => acc + cat.cards.length, 0)}`);
        console.log(`Saved to ${outputFile}`);

    } catch (err) {
        console.error("Error processing files:", err);
        process.exit(1);
    }
}

processFiles();


import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const outputFile = 'public/kev_data.json';

// Ensure public directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Downloading CISA KEV data from ${url}...`);

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to download data. Status Code: ${res.statusCode}`);
        process.exit(1);
    }

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            // Validate JSON
            const json = JSON.parse(data);
            fs.writeFileSync(outputFile, JSON.stringify(json, null, 2));
            console.log(`Successfully saved KEV data to ${outputFile}`);
            console.log(`Total Vulnerabilities: ${json.count}`);
            console.log(`Last Updated: ${json.dateReleased}`);
        } catch (err) {
            console.error('Error parsing JSON:', err);
            process.exit(1);
        }
    });

}).on('error', (err) => {
    console.error('Network error:', err);
    process.exit(1);
});

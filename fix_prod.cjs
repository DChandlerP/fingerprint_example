const fs = require('fs');

const filesToFixXFrame = [
  'checklist.html', 'cloud.html', 'dashboard.html', 'encryption.html',
  'epssdemo.html', 'fair.html', 'fingerprint.html', 'jwt.html',
  'modcat.html', 'phishing.html', 'threatmodel.html'
];

const filesToFixCSP = [
  'encryption.html', 'risk_scoring.html', 'sast.html'
];

// Fix X-Frame-Options
filesToFixXFrame.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Remove the meta tag
    const regexXFrame = /[ \t]*<meta\s+http-equiv=["']X-Frame-Options["'][^>]*>\r?\n?/gi;
    if (regexXFrame.test(content)) {
      content = content.replace(regexXFrame, '');
      fs.writeFileSync(file, content);
      console.log(`[X-Frame-Options removed] -> ${file}`);
    }
  }
});

// Fix CSP (add img-src 'self' data:;)
filesToFixCSP.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Using an incredibly robust match for the CSP meta tag to avoid missing multiline configurations
    const regexCSP = /<meta\s+http-equiv=["']Content-Security-Policy["'][\s\S]*?content=["']([\s\S]*?)["']\s*\/?>/i;
    let match = regexCSP.exec(content);
    if (match) {
      let originalCsp = match[1];
      
      if (!originalCsp.includes("img-src")) {
        // Build the new CSP
        let newCsp = originalCsp.trim();
        if (!newCsp.endsWith(';')) newCsp += ';';
        newCsp += " img-src 'self' data:;";
        content = content.replace(originalCsp, newCsp);
        
        fs.writeFileSync(file, content);
        console.log(`[CSP img-src rule added] -> ${file}`);
      } else if (!originalCsp.includes("data:")) {
        // It has img-src but not data:
        let newCsp = originalCsp.replace(/img-src([^;]+)/, "img-src$1 data:");
        content = content.replace(originalCsp, newCsp);
        
        fs.writeFileSync(file, content);
        console.log(`[CSP data: rule appended] -> ${file}`);
      }
    }
  }
});

console.log('Fixes completed successfully!');

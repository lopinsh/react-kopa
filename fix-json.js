const fs = require('fs');

function fixJson(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Hardcode fix the broken git merge artifacts literally
  content = content.replace(/"handle": "@\{username\},\n\s*"/g, '"handle": "@{username}"');
  content = content.replace(/"memberSince": "Member since \{date\},\n\s*"/g, '"memberSince": "Member since {date}"');
  content = content.replace(/"memberSince": "Dalībnieks kopš \{date\},\n\s*"/g, '"memberSince": "Dalībnieks kopš {date}"');

  content = content.replace(/"allCategory": "All \{category\},\n\s*"/g, '"allCategory": "All {category}"');
  content = content.replace(/"allCategory": "Visi \{category\},\n\s*"/g, '"allCategory": "Visi {category}"');

  content = content.replace(/"anyCategory": "Any \{category\},\n\s*"/g, '"anyCategory": "Any {category}"');
  content = content.replace(/"anyCategory": "Jebkurš \{category\},\n\s*"/g, '"anyCategory": "Jebkurš {category}"');

  content = content.replace(/"createInterest": "Create new interest \\"\{label\}\\",\n\s*"/g, '"createInterest": "Create new interest \\"{label}\\""');
  content = content.replace(/"createInterest": "Izveidot jaunu interesi \\"\{label\}\\",\n\s*"/g, '"createInterest": "Izveidot jaunu interesi \\"{label}\\""');

  let lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    let currentLine = lines[i].trimEnd();
    let nextLine = '';

    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) nextLine = lines[j].trimStart();

    // Add commas between objects
    if (currentLine.endsWith('}') && nextLine.startsWith('"') && nextLine.includes('":')) {
        lines[i] = currentLine + ',';
    }

    // Add commas between key-value pairs
    if (currentLine.endsWith('"') && nextLine.startsWith('"') && nextLine.includes('":') && !currentLine.endsWith('",')) {
        if (currentLine.includes('": "') || currentLine.match(/": \d+$/)) {
            lines[i] = currentLine + ',';
        }
    }
  }

  lines = lines.filter(l => l.trim() !== '",' && l.trim() !== ',' && l.trim() !== '"');
  fs.writeFileSync(filepath, lines.join('\n'));
}

fixJson('messages/en.json');
fixJson('messages/lv.json');
console.log('Done!');

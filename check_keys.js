const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
    return Object.keys(obj).reduce((res, el) => {
        if (Array.isArray(obj[el])) {
            return res;
        } else if (typeof obj[el] === 'object' && obj[el] !== null) {
            return [...res, ...getKeys(obj[el], prefix + el + '.')];
        }
        return [...res, prefix + el];
    }, []);
}

const en = JSON.parse(fs.readFileSync('d:/WEB/ejam-kopa/messages/en.json', 'utf8'));
const flatEnKeys = new Set(getKeys(en));

function findKeysInReactFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findKeysInReactFiles(filePath, fileList);
        } else if (/\.tsx?$/.test(filePath)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allReactFiles = [
    ...findKeysInReactFiles('d:/WEB/ejam-kopa/components'),
    ...findKeysInReactFiles('d:/WEB/ejam-kopa/app')
];

const missingKeys = new Set();
const foundKeys = new Set();

const regex = /t\(['"]([^'"]+)['"]/g;
const nsRegex = /useTranslations\(['"]([^'"]+)['"]\)/g;

for (const file of allReactFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // Find namespace
    let namespace = '';
    const nsMatch = [...content.matchAll(nsRegex)];
    if (nsMatch.length > 0) {
        namespace = nsMatch[0][1] + '.';
    }

    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        const fullKey = namespace + key;
        foundKeys.add(fullKey);

        if (!flatEnKeys.has(fullKey)) {
            // Also check if they provide the full key directly (e.g., in a component that uses full keys)
            if (!flatEnKeys.has(key)) {
                missingKeys.add(`${fullKey} (or ${key}) in ${file}`);
            }
        }
    }
}

console.log("Missing keys:");
missingKeys.forEach(k => console.log(k));

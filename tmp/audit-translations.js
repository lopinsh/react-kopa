const fs = require('fs');
const path = require('path');

const enJsonPath = path.join(__dirname, '../messages/en.json');
const lvJsonPath = path.join(__dirname, '../messages/lv.json');

const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const lvJson = JSON.parse(fs.readFileSync(lvJsonPath, 'utf8'));

// Flatten json keys to check existence easily
function flattenObj(obj, parent = '', res = {}) {
    for (let key in obj) {
        let propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] == 'object' && obj[key] !== null) {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const enFlat = flattenObj(enJson);
const lvFlat = flattenObj(lvJson);

// Walk the directory and collect all files
function walk(dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let i = 0;
        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
}

function extractTranslations(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Match useTranslations('namespace') or getTranslations('namespace') 
    // and t('key') or t("key") or t(`key`)

    // Simplistic approach: just find t('...') or t("...")
    const keys = [];
    let match;
    const regex = /t\(['"]([^'"]+)['"]\)/g;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

// Map files to their translation results
walk(path.join(__dirname, '../app'), (err, appFiles) => {
    walk(path.join(__dirname, '../components'), (err, compFiles) => {
        const allFiles = [...appFiles, ...compFiles];
        const missing = new Set();

        allFiles.forEach(file => {
            const keys = extractTranslations(file);
            // Wait, we need the namespace to know the full key!
            // If we don't know the namespace, we can just check if the key exists ANYWHERE as a suffix in our flat keys, 
            // but that might yield false positive matches or misses. Let's do a loose check: 
            // does any flat key end with exactly the key we found?

            keys.forEach(k => {
                const isFoundInEn = Object.keys(enFlat).some(fk => fk === k || fk.endsWith('.' + k));
                if (!isFoundInEn) {
                    missing.add(`${k} (found in ${file.split('ejam-kopa')[1]})`);
                }
            });
        });

        console.log("Missing keys:");
        console.log(Array.from(missing).join('\n'));
    });
});

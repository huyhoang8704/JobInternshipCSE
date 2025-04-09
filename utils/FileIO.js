const fs = require("fs");
const path = require("path");
const jdFilePath = path.join(__dirname, "../data/jdIds.json");
function loadJDsFromFile() {
    if (fs.existsSync(jdFilePath)) {
        const data = fs.readFileSync(jdFilePath, "utf-8");
        return JSON.parse(data);
    }
    return [];
}

function saveJDsToFile(jdIds) {
    const dirPath = path.dirname(jdFilePath); // get ../data
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(jdFilePath, JSON.stringify(jdIds, null, 2), "utf-8");
}

module.exports = { saveJDsToFile, loadJDsFromFile }
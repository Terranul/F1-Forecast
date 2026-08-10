const fs = require("fs");

console.log("testing")

/* I'm going to try a shitty version of ssr
   The html files will be loaded into global scope when the server starts, so it only happens one time
   I've replaced all of the dynamic fields in the html file (like the username, and scores) with a ${} so we can use the http module to edit it
*/

const fileCache = new Map()

const PATH_ROOT = "private/siteFiles/"

// files that are expected to be accessed many times, so we'll load them directly into memory
const importantFiles = ["F1-info.html", "dashboard.js", "index.html", "login.js", "scripts.js"]

loadFiles()

function loadFiles() {
    for (file of importantFiles) {
        console.log("loading into memory contents of file with path: " + PATH_ROOT + file + " ex:: " + file)
        fileCache.set(file, fs.readFileSync(PATH_ROOT + file, "utf8"));
    }
}

function getFileReadingStream(file) {
    return fs.createReadStream(PATH_ROOT + file)
}

// the file param will not include the extension for html files
function isHtmlRequest(file) {
    return !file.includes(".")
}

// file must include extension
function setHeader(file, res) {
    console.log("input: " + file)
    if (/^.*\.js$/.test(file)) {
        return res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    } else if (/^.*\.css$/.test(file)) {
        return res.setHeader('Content-Type', 'text/css; charset=utf-8')
    } else {
        return res.setHeader('Content-Type', 'text/html; charset=utf-8')
    }
}

// a file path like /private/siteFiles/../fileRouter.js would be valid without sanatization
// we want the user to only find files within the siteFiles folder
function sanatizeInput(path) {
    return path.replaceAll("..", "")
}

function getFile(req, res) {
    const file = isHtmlRequest(req.params.file) ? sanatizeInput(req.params.file) + ".html" : sanatizeInput(req.params.file)
    console.log("received req for file: " + file)
    setHeader(file, res)
    if (fileCache.has(file)) {
        return res.send(fileCache.get(file))
    } else {
        const stream = getFileReadingStream(file)
        stream.on("error", () => {
            res.status(404).send()
        })
        stream.pipe(res)
    }
}

function getLandingPage(req, res) {
    if (fileCache.has("index.html")) {
        return res.send(fileCache.get("index.html"))
    } else {
        return res.status(500).send()
    }
}

module.exports = {
    getLandingPage,
    getFile
}






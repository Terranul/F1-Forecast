const http = require("http")
const fs = require("fs");

console.log("testing")

/* I'm going to try a shitty version of ssr
   The html files will be loaded into global scope when the server starts, so it only happens one time
   I've replaced all of the dynamic fields in the html file (like the username, and scores) with a ${} so we can use the http module to edit it
*/

const fileCache = new Map()

const PATH_ROOT = "private/siteFiles/"

// files that are expected to be accessed many times, so we'll load them directly into memory
const importantFiles = ["F1-info.html", "dashboard.js"]

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

///^\/dashboard\/.*$/

function getFile(req, res) {
    const file = isHtmlRequest(req.params.file) ? req.params.file + "html" : req.params.file
    console.log("received req for file: " + file)
    setHeader(file, res)
    if (fileCache.has(file)) {
        return res.send(fileCache.get(file))
    } else {
        return getFileReadingStream(file).pipe(res)
    }
}

module.exports = {
    getFile
}






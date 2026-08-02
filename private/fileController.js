const http = require("http")
const fs = require("fs");

console.log("testing")

/* I'm going to try a shitty version of ssr
   The html files will be loaded into global scope when the server starts, so it only happens one time
   I've replaced all of the dynamic fields in the html file (like the username, and scores) with a ${} so we can use the http module to edit it
*/

const fileCache = Map()

const PATH_ROOT = "private/siteFiles/"

// files that are expected to be accessed many times, so we'll load them directly into memory
const importantFiles = ["F1-info.html"]

loadFiles()

function loadFiles() {
    for (file in importantFiles) {
        fileCache[file] = [fs.readFileSync(PATH_ROOT + file + ".html", "utf8")]
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
    switch(file) {
        case /^.*\.js$/.test(file):
            return res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        case /^.*\.css$/.test(file):
            return res.setHeader('Content-Type', 'css/javascript; charset=utf-8')
    }
}

///^\/dashboard\/.*$/

function getFile(req, res) {
    const file = isHtmlRequest(req.params.file) ? req.params.file + "html" : req.params.file
    if (fileCache.has(file)) {
        return res.send(fileCache.get(file))
    } else {
        return res.pipe(getFileReadingStream(file))
    }
}

// file mustn't contain the .html 
function getReadingStreams(file) {
    var result = [fs.createReadStream(PATH_ROOT + file + ".html")]
    if (pairMap.has(file)) {
        for (reqFile in pairMap.get(file)) {
            result.append(fs.createReadStream(PATH_ROOT + reqFile))
        }
    } else {
        // throw
    }
    return result
}

function getDashBoardFile(req, res) {
    const file = req.params.file
    
}



function getF1Info(req, res) {
    res.send(f1_info_html)
}

module.exports = {
    getF1Info
}






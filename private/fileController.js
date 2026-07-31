const http = require("http")
const fs = require("fs");

console.log("testing")

/* I'm going to try a shitty version of ssr
   The html files will be loaded into global scope when the server starts, so it only happens one time
   I've replaced all of the dynamic fields in the html file (like the username, and scores) with a ${} so we can use the http module to edit it
*/

const f1_info_html = fs.readFileSync("private/F1-info.html", "utf8")
console.log("F1-info.html loaded")

function getF1Info(req, res) {
    res.send(f1_info_html)
}

module.exports = {
    getF1Info
}






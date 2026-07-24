const express = require('express');
const authService = require('../authorization')

export function authenticateSession(req, res, next) {
    const cookies = req.headers.cookies
    const sessionInfo = parseSession(cookies)
    if (authService.authorizeUser(sessionInfo[0], sessionInfo[1])) {
        next()
    } else {
        res.status(403) // forbidden
    }
}

// since we cannot access cookie-parser, we need to parse the cookie output manully
// the cookie output will look like: "id: [id-numbers]; user_name: [username]" as a single string
function parseSession(str) {
    const separator = "; user_name=";

    const i = str.indexOf(separator);
    if (i === -1) {
        throw new Error("Invalid session format.");
    }

    const id = str.slice("id=".length, i);
    const userName = str.slice(i + separator.length);

    return [userName, id];
}

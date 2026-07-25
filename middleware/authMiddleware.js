const express = require('express');
const authService = require('../authorization')

async function authenticateSession(req, res, next) {
    console.log("string:" + req.path)
    ///users/:user/login
    if (isAcceptedEndpoint(req.path, req.method)) {
        next() // only allow the login endpoint to be accessed unauthenticated
        return
    }
    console.log("ran the middleware")
    const cookies = req.headers.cookies
    if (cookies == undefined) {
        return res.status(403).send()
    }
    const sessionInfo = parseSession(cookies)
    if (await authService.authorizeUser(sessionInfo[0], sessionInfo[1])) {
        next()
    } else {
        res.status(403).send() // forbidden
    }
}

// since we cannot access cookie-parser, we need to parse the cookie output manully
// the cookie output will look like: "id: [id-numbers]; user_name: [username]" as a single string
function parseSession(str) {
    const separator = "; user_name=";
    console.log("string from parse session:" + str)

    const i = str.indexOf(separator);
    if (i === -1) {
        throw new Error("Invalid session format.");
    }

    const id = str.slice("id=".length, i);
    const userName = str.slice(i + separator.length);

    return [userName, id];
}

// determines whether the endpoint does not need to be authenticated
// path is the string representation of the endpoint address
// method is the REST protocol (PUT, GET..ect) in string form (all caps)
function isAcceptedEndpoint(path, method) {
    return /^\/users\/.*\/login$/.test(path) || (/^\/users\/.*$/.test(path) && method === "PUT")
}

module.exports = {
    authenticateSession
}

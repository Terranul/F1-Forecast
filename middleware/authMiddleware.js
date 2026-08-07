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
    const cookies = req.get("Cookie")
    if (cookies == undefined) {
        console.log("cookies was undefined")
        return res.status(403).send()
    }
    const sessionInfo = parseCookie(cookies)
    if (await authService.authorizeUser(sessionInfo.user_name, sessionInfo.id)) {
        next()
    } else {
        res.status(403).send() // forbidden
    }
}

// returns an object representing the cookie string
const parseCookie = str =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

// determines whether the endpoint does not need to be authenticated
// path is the string representation of the endpoint address
// method is the REST protocol (PUT, GET..ect) in string form (all caps)
function isAcceptedEndpoint(path, method) {
    return /^\/users\/.*\/login$/.test(path) || (/^\/users\/.*$/.test(path) && method === "POST")
           || (/^\/dashboard\/.*$/.test(path)) || path == "/" || path == "/file/login.js" // uncomment for debugging (allows the server to serve all html files without doing auth (for 403 issues))
}

// in the future maybe each user could have a clearance status 
function isPrivilegedUser(userId) {
    return userId == "admin!userid"
}

// for endpoints that access or modify user information (/user) we need to also make sure that the current session matches
async function authTailoredUser(req, res, next) {
    const cookies = req.get("Cookie")
    if (cookies == undefined) {
        return next()
    }
    const sessionInfo = parseCookie(cookies)
    const userHeader = sessionInfo.user_name
    if (isAcceptedEndpoint(req.originalUrl, req.method) || isPrivilegedUser(userHeader)) {
        console.log("accepted endpoint")
        res.locals.isSignedIn = true
        next()
        return
    }
    // will  always run after authenticate session has run so we can make assumptions
    // - we know that the username and the session id in the cookies matches the db 
    // - if the path username matches the cookies username we know the path username and cookies sessionId matches the db
    const userPath = parseRawUrl(req.originalUrl)
    console.log("test userHeader=" + userHeader + "and path user id = " + userPath + "path is " + req.originalUrl)
    if (userHeader == userPath + "!userid") {
        res.locals.isSignedIn = true
        next()
        return
    } else {
        // since this request is asking for information from another user, we will set a flag to tell the handler that they must remove sensitive information
        res.locals.isSignedIn = false
        next()
    }
}

// for middleware, express has not matched the params yet, so we need to parse the entire url to get the username that was provided
function parseRawUrl(url) {
    // url form: /users/[userid]...
    let postUserBranch =  url.slice(7, url.length) // form [userid]...
    console.log("postuser is " + postUserBranch)
    const endUserId = postUserBranch.indexOf("/")
    console.log("end user id is " + endUserId)
    if (endUserId == -1) {
        console.log("hit return normal with:" + postUserBranch)
        return postUserBranch
    } else {
        console.log("hit slice normal")
        return postUserBranch.slice(0, endUserId)
    }
}

function fileRedirect(req, res, next) {
    console.log("entered with:" + req.originalUrl)
    // the interesting thing here is that we will still have the regular middelware that checks if the session matches
    // to determine if the user is logged in, all we need to do is check if the cookies are not undefined and that they include a username and sessionid
    if (!isacceptedFile(req.originalUrl) && req.get("Cookie") === undefined) {
        console.log("redirected")
        res.setHeader("Location", "/"); // tells the browser to redirect
        res.status(302).send()
    } else {
        console.log("passed the file redirect")
        next()
    }
}

function isacceptedFile(path) {
    return path == "/file/login.js" || path == "/file/scripts.js" || path == "/file/index.html"
}

module.exports = {
    authenticateSession,
    authTailoredUser,
    fileRedirect
}

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
    return /^\/users\/.*\/login$/.test(path) || 
           (/^\/users\/.*$/.test(path) && method === "PUT")
}

// for endpoints that access or modify user information (/user) we need to also make sure that the current session matches
async function authTailoredUser(req, res, next) {
    if (isAcceptedEndpoint(req.originalUrl, req.method)) {
        next()
        return
    }
    // will  always run after authenticate session has run so we can make assumptions
    // - we know that the username and the session id in the cookies matches the db 
    // - if the path username matches the cookies username we know the path username and cookies sessionId matches the db
    const sessionInfo = parseCookie(req.get("Cookie"))
    const userHeader = sessionInfo.user_name
    const userPath = parseRawUrl(req.originalUrl)
    console.log("test userHeader=" + userHeader + "and path user id = " + userPath + "path is " + req.originalUrl)
    if (userHeader == userPath + "!userid") {
        next()
        return
    } else {
        return res.status(403).send()
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

module.exports = {
    authenticateSession,
    authTailoredUser
}

const userService = require('./services/userService')
const appService = require('./appService')

/*
    session tokens to ensure that only users that are signed in can access specific endpoints
    Token is generated once when the user logs in and saved in the database under the acc field

    We never need to delete the session token when the user logs out, becuase the user automatically loses the token they 
    have on the frontend, and the one on the backend is rendered useless. We will only ever override it.
*/

// return true: authorized, return false: invalid session
async function authorizeUser(username, sessionToken) {
    const session = await appService.executeSql(`SELECT * FROM APP_SESSION WHERE app_userid='${username}'`)
    return session.rows.length != 0 && session.rows.length[0].ID == sessionToken
}

async function generateSession(userid) {
    const sessionToken = Date.now().toString() // should be using crypto module, but the ubc remote doesn't allow external dependancies
    appService.insertToTable("APP_SESSION", {id: sessionToken, app_userid: userid})
    return sessionToken
}

module.exports = {
    authorizeUser,
    generateSession
}



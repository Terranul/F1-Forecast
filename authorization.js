const userService = require('./services/userService')

/*
    session tokens to ensure that only users that are signed in can access specific endpoints
    Token is generated once when the user logs in and saved in the database under the acc field

    We never need to delete the session token when the user logs out, becuase the user automatically loses the token they 
    have on the frontend, and the one on the backend is rendered useless. We will only ever override it.
*/

async function authorizeUser(username, sessionToken) {
    const user = await userService.getUser(username, null)
    return user.ACC == sessionToken 
}

async function generateSession(username) {
    const sessionToken = crypto.randomUUID
    await userService.updateUser({"ACC": sessionToken}, username)
    return sessionToken
}

module.exports = {
    authorizeUser,
    generateSession
}



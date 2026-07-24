const appService = require('../appService');


// password is an optional addition, username is the sole primary key
// username cannot be null while password can
async function getUser(username, password) {
    if (password != null ) {
        const user = await appService.executeSql(`SELECT *
                                                  FROM APP_USER NATURAL JOIN SCORE
                                                  WHERE USER_NAME='${username}' AND PASSWORD='${password}'`)
        return user.rows[0]
    } else {
        const user = await appService.executeSql(`SELECT *
                                                  FROM APP_USER NATURAL JOIN SCORE
                                                  WHERE USER_NAME='${username}'`)
        return user.rows[0]
    }
}
 
// mapping is an object containing key value pairs corresponding to each attribute and what you want to update it to
async function updateUser(mapping, username) {
    await appService.updateTable("APP_USER", mapping, {"USER_NAME": username})
}

module.exports = {
    getUser,
    updateUser
}
const { get } = require('../appController');
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

// takes the current amount the user has and adds the amount given to it
async function updateUserAmount(amount, username) {
    const user = await getUser(username, null)
    const newValue = user.AMOUNT + amount
    await updateUser({amount: newValue}, username)
}

function convertAppUserIdToUsername(app_userid) {
   // ".*!userid"
   return app_userid.slice(0, -7)
}

module.exports = {
    getUser,
    updateUser,
    updateUserAmount,
    convertAppUserIdToUsername
}
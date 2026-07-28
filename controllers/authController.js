const appService = require('../appService');

async function endSession(req, res) {
    console.log("hit end session")
    // there are some security conerns here. If you are just able to end anyone's session if you know their username there would be issues
    // since the url will contain /users we can avoid this becuase we have the extra user security layer
    let userName = req.params.user
    await appService.executeSql(`DELETE FROM APP_SESSION WHERE APP_USERID='${userName + "!userid"}'`)
    res.status(204).send()
}

module.exports = {
    endSession
}
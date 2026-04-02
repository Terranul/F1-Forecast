const appService = require('../appService');

async function getUser(req, res) {
    const user = await appService.executeSql(`SELECT * FROM APP_USER WHERE USER_NAME='${req.params.user}'`)
    delete user.rows[0].PASSWORD
    res.status(200).json(user.rows[0]);
}

async function putUser(req, res) {
    const user_name = req.params.user;
    const password = req.body.password;
    const dateoffirstprediction = new Date(); // by default will represent the time of the code being executed
    const app_userid = user_name + "!userid"
    const acc = user_name + "acc"; // only ever used internally, so no reason to make it any different
    try {
        // since the app_userid is the primary key, if a duplicate username will occur, the insertToTable will throw and we catch it here
        await uploadDefaultScore(acc)
        await appService.insertToTable("APP_USER", {
            user_name: user_name,
            app_userid: app_userid,
            dateoffirstprediction: dateoffirstprediction,
            streak: 0,
            acc: acc,
            password: password
        })
        res.status(200).json({message: "No one's going to be reading this, but well done, you just created a user!"})
    } catch (err) {
        console.log("Issue creating user: " + user_name)
        res.status(422).json({error: `username: ${user_name} already exists`})
    }
}

async function uploadDefaultScore(acc) {
    // since the user just created an account they have no friends and as such are ranked 1st
    await appService.insertToTable("SCORE", {
        acc: acc,
        amount: 0,
        deductions: 0,
        ranking: 0
    })
}

async function getUserFriends(req, res) {
    const user_name = req.params.user;
    const sql = `SELECT * 
                 FROM FRIEND f
                 JOIN APP_USER a ON f.USER2ID = a.APP_USERID
                 WHERE f.USER1ID='${user_name + "!userid"}'`
    try {
        const friends = await appService.executeSql(sql);
        // we need to remove all of the password attributes from each entry
        friends.rows.map((value) => {
            delete value.PASSWORD
        })
        res.status(200).json(friends.rows)
    } catch (err) {
        console.log("Issue getting user friends: " + user_name)
        res.status(500).json({error: "internal server error"})
    }
}

async function putFriend(req, res) {
    console.log("entered friend")
    const friendUsername = req.params.friend
    const username = req.params.user
    try {
        await appService.insertToTable("FRIEND", {
            user1id: username + "!userid",
            user2id: friendUsername + "!userid"
        })
        res.status(202).json({user1id: username, user2id: friendUsername})
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}

async function getUsers(req, res) {
    // we will never have an crazy number of users so we can kind of cheat and send them all, but normally we would have pagination
    const allUsers = await appService.executeSql(`SELECT * FROM APP_USER`);
    // remove the password
    allUsers.rows.map((value) => {
        delete value.PASSWORD
    })
    res.status(200).json(allUsers.rows);
}

async function loginUser(req, res) {
    const user = await appService.executeSql(`SELECT * FROM APP_USER WHERE USER_NAME='${req.params.user}'`)
    if (user.rows[0].PASSWORD === req.body.password) {
        res.status(200).send();
    } else {
        res.status(404).send();
    }
}

module.exports = {
    putFriend,
    putUser,
    getUser,
    getUserFriends,
    getUsers,
    loginUser
}
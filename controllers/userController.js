const appService = require('../appService');
const userService = require('../services/userService')

async function getUser(req, res) {
    const user = await userService.getUser(req.params.user, null)
    console.log("getting user")
    console.log(JSON.stringify(user))
    delete user.PASSWORD
    res.status(200).json(user);
}

async function putUser(req, res) {
    const user_name = req.params.user;
    const password = req.body.password;
    console.log(user_name + password)
    const dateoffirstprediction = new Date(); // by default will represent the time of the code being executed
    const app_userid = user_name + "!userid"
    const acc = user_name + "acc"; // only ever used internally, so no reason to make it any different
    try {
        // since the app_userid is the primary key, if a duplicate username will occur, the insertToTable will throw and we catch it here
        await uploadDefaultScore(acc)
        const result = await appService.insertToTable("APP_USER", {
            user_name: user_name,
            app_userid: app_userid,
            dateoffirstprediction: dateoffirstprediction,
            streak: 0,
            acc: acc,
            password: password
        })
        if (result === null) {
            res.status(422).json({error: `username: ${user_name} already exists`})
            return;
        }
        res.status(200).json({message: "No one's going to be reading this, but well done, you just created a user!"}) // Yaaaaaaayyyy Benfaaar did it!!!!!!
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
                 JOIN APP_USER a ON f.USER1ID = a.APP_USERID
                 NATURAL JOIN SCORE
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
        // create another to represent the inverse relationship
        await appService.insertToTable("FRIEND", {
            user2id: username + "!userid",
            user1id: friendUsername + "!userid"
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
    console.log(req.params.user)
    console.log(req.body.password)
    const user = await appService.executeSql(`SELECT * FROM APP_USER WHERE USER_NAME='${req.params.user}'`)
    console.log(JSON.stringify(user))
    console.log(user.rows[0].PASSWORD)
    if (!user.rows || user.rows.length === 0) {
        return res.status(404).send("User not found");
    }
    else if (user.rows[0].PASSWORD == req.body.password) {
        res.status(200).send();
    
    } else {
        return res.status(422).send("User or password is not correct...");
    }

}

async function updateUserScores(req, res) {
    const acc = req.params.username + "acc";
    const body = req.body;
    for (const key of Object.keys(body)) {
        const sql = `UPDATE SCORE
                     SET ${key} = ${body[key]}
                     WHERE ACC=${acc}`
        await appService.executeSql(sql);                 
    }
    res.status(204).send()
}

async function getUserArbitrary(req, res) {
    console.log("entered use arb")
    const restriction = req.params.restriction;
    const sql = `SELECT *
                 FROM APP_USER NATURAL JOIN SCORE
                 WHERE ${restriction}`
    const result = await appService.executeSql(sql);
    console.log(JSON.stringify(result))
    res.status(200).json(result.rows);
}

// at this point I don't care about making this look presentable
async function updateProfile(req, res) {
    console.log("entered update profile")
    const values = req.body;
    console.log(JSON.stringify(values))
    for (const key of Object.keys(values)) {
        const value = Number(values[key]);
        let sql = ""
        if (!isNaN(value)) {
            if (key == "amount") {
                await updateUserAmount(req.params.user, value)
                res.status(204).send();
                return;
            } else if (key == "user_name") {
                sql = `UPDATE APP_USER
                       SET ${key} = '${value}'
                       WHERE USER_NAME='${req.params.user}'`
            } else if (key === "acc") {
                sql = `UPDATE APP_USER
                       SET ${key} = ${value}
                       WHERE USER_NAME='${req.params.user}'`
            }
        } else {
            sql = `UPDATE APP_USER
                  SET ${key} = '${values[key]}'
                  WHERE USER_NAME='${req.params.user}'`
        }
        const result = await appService.executeSql(sql);  
        if (result === null) {
            res.status(404).send();
            return;
        }
    }
    res.status(204).send();
}

async function updateUserAmount(username, amount) {
    const sql =  `SELECT ACC
                  FROM APP_USER
                  WHERE USER_NAME='${username}'`
    const result = await appService.executeSql(sql);
    const acc = result.rows[0].ACC;
    const asql =  `UPDATE SCORE
            SET AMOUNT = ${amount}
            WHERE ACC='${acc}'`
    await appService.executeSql(asql);  
}

async function removeFriend(req, res) {
    const user1id = req.params.user
    const user2id = req.params.friend;
    const sql = `DELETE FROM FRIEND
                 WHERE USER1ID='${user1id}!userid' AND USER2ID='${user2id}!userid'`
    const result = await appService.executeSql(sql);
    if (result === null) {
        res.status(500).send();
        return;
    }
    res.status(200).send();
}


module.exports = {
    putFriend,
    putUser,
    getUser,
    getUserFriends,
    getUsers,
    loginUser,
    updateUserScores,
    getUserArbitrary,
    updateProfile,
    removeFriend
}
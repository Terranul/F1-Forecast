document.getElementById("login-button").addEventListener("click", loginUser);
document.getElementById("create-button").addEventListener("click", createAccount);
document.getElementById("update-prediction").addEventListener("click", validatePredictions)

async function createAccount() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = await fetch(`/users/${username}`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: password
        })
    })
     if (result.ok) {
        console.log("ok result on creating acount")
        // we have created a user
        alert("You have created an acount (inserted a tuple)")
        await populateSessionCookies(result)
        localStorage.setItem("userid", username);
        window.location.href = "file/dashboard";

    } else {
        document.getElementById("error-msg").innerText = "Username already taken"
    }
}

async function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = await fetch(`/users/${username}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password
            })
        })
    if (result.ok) {
            // user has login
            await populateSessionCookies(result)
            localStorage.setItem("userid", username);
            window.location.href = "/file/dashboard";
        } else {
             document.getElementById("error-msg").innerText = "Invalid password, try again"
        }
}

// data is the raw result of calling fetch 
async function populateSessionCookies(data) {
    let result = await data.json()
    let sessionId = result.sessionToken
    let userId = result.userId
    const cookieString = `id=${sessionId}; user_name=${userId}; Path=/`
    console.log("cookie string:" + cookieString)
    document.cookie = `id=${sessionId}; Path=/`
    document.cookie = `user_name=${userId}; Path=/`
}

async function validatePredictions() {
    const result = await fetch(`/predictions/validate`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        }
    })
    if (result.ok) {
        document.getElementById("update-prediction").textContent = "Updated Predictions"
    }
}


document.getElementById("login-button").addEventListener("click", loginUser);
document.getElementById("create-button").addEventListener("click", createAccount);

async function createAccount() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = await fetch(`/users/${username}`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: password
        })
    })
     if (result.ok) {
        // we have created a user
        alert("You have created an acount (inserted a tuple)")
        populateSessionCookies(result)
        localStorage.setItem("userid", username);
        window.location.href = "/dashboard.html";

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
            populateSessionCookies(result)
            localStorage.setItem("userid", username);
            window.location.href = "/dashboard.html";
        } else {
             document.getElementById("error-msg").innerText = "Invalid password, try again"
        }
}

// data is the raw result of calling fetch 
function populateSessionCookies(data) {
    let sessionId = data.headers.get("sessionId")
    let username = data.headers.get("username")
    const cookieString = `id=${sessionId}; user_name=${username}; Path=/`
    document.cookie = cookieString
}


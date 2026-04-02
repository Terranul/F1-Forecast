document.getElementById("login-button").addEventListener("click", verifyAndLoginUser);

async function verifyAndLoginUser() {
    // we will first try to create the user, if it doesn't go through we know they already have an account, so we will login
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
        localStorage.setItem("userid", username);
        window.location.href = "/dashboard.html";

    } else {
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
            localStorage.setItem("userid", username);
            window.location.href = "/dashboard.html";
        } else {
             document.getElementById("error-msg").innerText = "Invalid password, try again"
        }
    }
    
}
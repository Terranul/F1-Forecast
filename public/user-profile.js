document.addEventListener("DOMContentLoaded", populateUserPage);
document.getElementById("edit-user").addEventListener("click", updateProfile);

async function updateProfile() {
    console.log("editing user")
    const user = localStorage.getItem("userid")
    const score = document.getElementById("score-input").value;
    const acc = document.getElementById("acc-input").value;
    const body = {};
    if (score) {body.amount = score;}
    if (acc) {body.acc = acc}
    const result = await fetch(`/users/${user}/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (result.status !== 204) {
        document.getElementById("edit-error").innerHTML = "Invalid acc submitted"
    } else {
        getUserInformation()
        location.reload()
    }
}

async function getUserInformation() {
    const userid = localStorage.getItem("userid");
    const result = await fetch(`/users/${userid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await result.json();
    console.log(data);
    localStorage.setItem("user", JSON.stringify(data));
}

function populateUserPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const value = document.getElementById("welcome-message");
    const points = document.getElementById("user-points");
    const ranking = document.getElementById("user-ranking");
    const streak = document.getElementById("user-streak");
    value.textContent = user.USER_NAME
    points.textContent = "Current Points: " + user.AMOUNT
    ranking.textContent = "Current Ranking: " + user.RANKING
    streak.textContent = "Current streak: " + user.STREAK 
}
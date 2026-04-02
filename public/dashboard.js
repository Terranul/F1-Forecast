document.addEventListener("DOMContentLoaded", getUserInformation)
document.addEventListener("DOMContentLoaded", populateUserPage);
document.addEventListener("DOMContentLoaded", getSessionInformation);
document.addEventListener("DOMContentLoaded", getRaceOddsInfo)

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

async function getSessionInformation() {
    const result = await fetch(`/sessions/current`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await result.json();
    console.log(data);
    localStorage.setItem("session", JSON.stringify(data));
}

async function getRaceOddsInfo() {
    const session = JSON.parse(localStorage.getItem("session"));
    const result = await fetch(`/category/driverodds/odds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            trackname: session.TRACKNAME,
            season: session.SEASON
        })
    });
    const data = await result.json();
    const list = document.getElementById("driverodds-data");
    list.innerHTML = "";
    document.getElementById("driverodds-desc").textContent = data.description
    for (const odd of data.odds) {
        const li = document.createElement("li");
        li.appendChild(getOddsDiv(odd));
        list.appendChild(li);
    }
}

function getOddsDiv(odd) {
    const div = document.createElement("div");
    const description = document.createElement("p");
    description.textContent = odd.driverid;
    const odds = document.createElement("p");
    odds.textContent = odd.odd;
    div.appendChild(description);
    div.appendChild(odds);
    return div;
}
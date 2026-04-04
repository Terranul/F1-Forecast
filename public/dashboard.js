document.addEventListener("DOMContentLoaded", getUserInformation)
document.addEventListener("DOMContentLoaded", populateUserPage);
document.addEventListener("DOMContentLoaded", getSessionInformation);
document.addEventListener("DOMContentLoaded", getRaceOddsInfo)
document.addEventListener("DOMContentLoaded", getTeamOddsInfo)
document.addEventListener("DOMContentLoaded", getPodiumOddsInfo)
document.addEventListener("DOMContentLoaded", getfriendInformation);


/*
    For some reason I stupidly put all of the methods here, which means that some id's won't exist until you click into a specific page on the 
    dashboard. It will give an error on the frontend, but it is no issue.
*/

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
    const button = document.createElement("button");
    button.textContent = "Make Prediction"
    // TODO: add event listener on button that will put the prediction into db when clicked (use prediciton endpoint ben)
    div.appendChild(description);
    div.appendChild(odds);
    div.appendChild(button);
    return div;
}
 
async function getTeamOddsInfo() {
    const session = JSON.parse(localStorage.getItem("session"));
    const result = await fetch(`/category/teamraceodds/odds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            season: session.SEASON
        })
    });
    const data = await result.json();
    const list = document.getElementById("teamodds-data");
    list.innerHTML = "";
    document.getElementById("teamodds-desc").textContent = data.description
    for (const odd of data.odds) {
        const li = document.createElement("li");
        li.appendChild(getTeamOddsDiv(odd));
        list.appendChild(li);
    }
}

function getTeamOddsDiv(odd) {
    const div = document.createElement("div");
    const description = document.createElement("p");
    description.textContent = odd.teamName;
    const odds = document.createElement("p");
    console.log("odds" + odd.odd)
    odds.textContent = odd.odds;
    const button = document.createElement("button");
    button.textContent = "Make Prediction"
    // TODO: add event listener on button that will put the prediction into db when clicked
    div.appendChild(description);
    div.appendChild(odds);
    div.appendChild(button);
    return div;
}

async function getPodiumOddsInfo() {
    const session = JSON.parse(localStorage.getItem("session"));
    const result = await fetch(`/category/podiumodds/odds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            season: session.SEASON
        })
    });
    const data = await result.json();
    const list = document.getElementById("podiumodds-data");
    list.innerHTML = "";
    document.getElementById("podiumodds-desc").textContent = data.description
    for (const odd of data.odds) {
        const li = document.createElement("li");
        li.appendChild(getPodiumOddsDiv(odd));
        list.appendChild(li);
    }
}

function getPodiumOddsDiv(odd) {
    const div = document.createElement("div");
    const description = document.createElement("p");
    description.textContent = odd.name;
    const odds = document.createElement("p");
    console.log("odds" + odd.odd)
    odds.textContent = odd.odds;
    const button = document.createElement("button");
    button.textContent = "Make Prediction"
    // TODO: add event listener on button that will put the prediction into db when clicked
    div.appendChild(description);
    div.appendChild(odds);
    div.appendChild(button);
    return div;
}

async function getfriendInformation() {
    const userid = localStorage.getItem("userid");
    const result = await fetch(`/users/${userid}/friends`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await result.json();
    console.log(data);
    localStorage.setItem("Friends", JSON.stringify(data));
    populateFriendsPage();
}

function populateFriendsPage() {
    const friends = JSON.parse(localStorage.getItem("Friends"));
    const list = document.getElementById("friends-list");

    list.innerHTML = ""; 

    for (const friend of friends) {
        const li = document.createElement("li");

        const div = document.createElement("div");

        const name = document.createElement("p");
        name.textContent = friend.USER_NAME;

        const points = document.createElement("p");
        points.textContent = "Points: " + friend.AMOUNT;

        const ranking = document.createElement("p");
        ranking.textContent = "Ranking: " + friend.RANKING;

        const streak = document.createElement("p");
        streak.textContent = "Streak: " + friend.STREAK;

        div.appendChild(name);
        div.appendChild(points);
        div.appendChild(ranking);
        div.appendChild(streak);

        li.appendChild(div);
        list.appendChild(li);
    }
    if (!friends || friends.length === 0) {
        list.innerHTML = "<p>No friends found.</p>";
        return;
    }
}


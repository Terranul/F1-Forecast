document.addEventListener("DOMContentLoaded", getUserInformation)
document.addEventListener("DOMContentLoaded", getSessionInformation);
document.addEventListener("DOMContentLoaded", getRaceOddsInfo)
document.addEventListener("DOMContentLoaded", getTeamOddsInfo)
document.addEventListener("DOMContentLoaded", getPodiumOddsInfo)
document.addEventListener("DOMContentLoaded", getfriendInformation);
document.addEventListener("DOMContentLoaded", populateAvgNationality)
document.addEventListener("DOMContentLoaded", populateAvgTeam)


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
        const friendUsername = friend.USER2ID.slice(0, -7);
        name.textContent = friendUsername

        const points = document.createElement("p");
        points.textContent = "Points: " + friend.AMOUNT;

        const ranking = document.createElement("p");
        ranking.textContent = "Ranking: " + friend.RANKING;

        const streak = document.createElement("p");
        streak.textContent = "Streak: " + friend.STREAK;

        const removeFriend = document.createElement("button");
        removeFriend.textContent = "Remove Friend"
        removeFriend.addEventListener("click", async () => {
            await rmFriend(localStorage.getItem("userid"),  friendUsername)
        })

        div.appendChild(removeFriend);
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

async function rmFriend(user1id, user2id) {
    const result = await fetch(`/users/${user1id}/friends/${user2id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (result.status === 500) {
        alert("unable to remove friend: this tuple you are referencing does not exist")
    } else {
        alert("removed friend")
        location.reload()
    }
}

async function populateAvgNationality() {
    const result = await fetch(`/avg`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await result.json();
    const parent = document.getElementById("avg-container")
    for (const value of data) {
        const div = getNatDiv(value);
        parent.appendChild(div);
    }
}

function getNatDiv(value) {
    const divider = document.createElement("p");
    divider.textContent = "------------------------------"
    const div = document.createElement("div");
    const nat = document.createElement("p");
    nat.textContent = value.NATIONALITY
    const avg = document.createElement("p");
    avg.textContent = "Average Points: " + value.AVG_POINTS;
    div.appendChild(divider)
    div.appendChild(nat);
    div.appendChild(avg);
    return div;
}

async function populateAvgTeam() {
    const result = await fetch(`/avgteam`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await result.json();
    const parent = document.getElementById("avgteam-container");

    for (const value of data) {
        const div = getTeamDiv(value);
        parent.appendChild(div);
    }
}

function getTeamDiv(value) {
    const div = document.createElement("div");

    const divider = document.createElement("p");
    divider.textContent = "------------------------------"

    const team = document.createElement("p");
    team.textContent = value.TEAMID;

    const season = document.createElement("p");
    season.textContent = "Season: " + value.SEASON;

    const avg = document.createElement("p");
    avg.textContent = "Average Finish Position: " + value.AVG_FINISH_POSITION;

    div.appendChild(divider)
    div.appendChild(team);
    div.appendChild(avg);
    div.appendChild(season);

    return div;
}





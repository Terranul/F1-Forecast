document.addEventListener("DOMContentLoaded", populateUserPage);
document.getElementById("edit-user").addEventListener("click", updateProfile);

async function updateProfile() {
    console.log("editing user")
    const user = localStorage.getItem("userid")
    const score = document.getElementById("score-input").value;
    const acc = document.getElementById("acc-input").value;
    if (score < 0) {
        document.getElementById("edit-error").innerHTML = "submit a score > 0"
        return;
    }
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
        alert("Profile updated")
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

async function populateUserPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const value = document.getElementById("welcome-message");
    const points = document.getElementById("user-points");
    const ranking = document.getElementById("user-ranking");
    const streak = document.getElementById("user-streak");
    value.textContent = user.USER_NAME
    points.textContent = "Current Points: " + user.AMOUNT
    ranking.textContent = "Current Ranking: " + user.RANKING
    streak.textContent = "Current streak: " + user.STREAK 
    await populateUsePredictions()
}

async function populateUsePredictions() {
    const predictions = await getUserPredictions()
    for (const prediction of predictions) {
        const predictionEntry = getPredictionDiv(prediction)
        switch(prediction.STATUS) {
            case "O":
                const toWin = document.createElement("p")
                toWin.textContent = "To win: " + prediction.WAGER*prediction.ODDS_VALUE + " points"
                predictionEntry.appendChild(toWin)
                predictionEntry.appendChild(getTextDivider())
                document.getElementById("prediction-info").appendChild(predictionEntry)
                break
            case "C":
                const winnings = document.createElement("p")
                winnings.style.color = "green";
                winnings.textContent = "Winnings: " + prediction.WAGER*prediction.ODDS_VALUE + " points"
                predictionEntry.appendChild(winnings)
                predictionEntry.appendChild(getTextDivider())
                document.getElementById("completed-info").appendChild(predictionEntry)
                break
            case "F":
                const losses = document.createElement("p")
                losses.style.color = "red";
                losses.textContent = "Losses: " + prediction.WAGER + " points"
                predictionEntry.appendChild(losses)
                predictionEntry.appendChild(getTextDivider())
                document.getElementById("completed-info").appendChild(predictionEntry)
                break
            default:
                const pending = document.createElement("p")
                pending.style.color = "yellow";
                pending.textContent = "The result is still pending, please contact our offices for more information."
                predictionEntry.appendChild(pending)
                predictionEntry.appendChild(getTextDivider())
                document.getElementById("completed-info").appendChild(predictionEntry)
        }
    }
}

function getPredictionDiv(predictionEntry) {
    const predDiv = document.createElement("div")
    const description = document.createElement("p")
    description.textContent = prettifyPredictionCode(predictionEntry.CATEGORYID, predictionEntry.TRACKNAME, predictionEntry.PREDICTION_VALUE)
    predDiv.appendChild(description)
    const wager = document.createElement("p")
    wager.textContent = "Wager: " + predictionEntry.WAGER + " points"
    predDiv.appendChild(wager)
    const odds = document.createElement("p")
    odds.textContent = "Odds: " + predictionEntry.ODDS_VALUE
    predDiv.appendChild(odds)
    const status = document.createElement("p")
    status.textContent = "Status: " + convertPredictionStatusCode(predictionEntry.STATUS)
    predDiv.appendChild(status)
    return predDiv
}

function convertPredictionStatusCode(status) {
    switch(status) {
        case "O":
            return "Ongoing"
        case "F":
            return "Failed"
        case "C":
            return "Completed"
        case "T":
            return "Terminated"
        case "U": 
            return "Under Review"
        default:
            return "Pending"
    }
}

function getTextDivider() {
    const divider = document.createElement("p")
    divider.textContent = "----------------------------------------------"
    return divider
}

function prettifyPredictionCode(code, raceName, target) {
    switch (code) {
        case "driverodds":
            return `Predict driver ${target} to win the ${raceName}`
        case "teamraceodds":
            return `Predict team ${target} to accumulate the most points in the ${raceName}`
        case "podiumodds":
            return `Predict driver ${target} to miss the podium at the ${raceName}`
        default:
            return "stop messing with the local storage please and thank you"
    }
}

async function getUserPredictions() {
    const userid = localStorage.getItem("userid");
    const result = await fetch(`/users/${userid}/predictions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await result.json()
}
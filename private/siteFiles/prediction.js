document.addEventListener("DOMContentLoaded", populatePredictionInfo)
document.getElementById("wager-input").addEventListener("input", updateWagerMessage)
document.getElementById("make-prediction-btn").addEventListener("click", makePrediction)

function populatePredictionInfo() {
    const categoryCode = localStorage.getItem("prediction_category_selected")
    document.getElementById("category-description").textContent = prettifyPredictionCode(categoryCode)
    document.getElementById("cur-odds").textContent = `Odds: ${localStorage.getItem("prediction_odds_selected")}`
    document.getElementById("prediction-odds-desc").textContent = "To win: 0 Points"
}

function prettifyPredictionCode(code) {
    const target = localStorage.getItem("prediction_target_selected")
    const raceName = JSON.parse(localStorage.getItem("session")).TRACKNAME
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

// Format for req body: 
//     {
//         categoryid: string
//         prediction_value: string, 
//         wager: number
//         season: number,
//         trackname: string
//     }

async function makePrediction() {
    const user = localStorage.getItem("userid")
    const target = localStorage.getItem("prediction_target_selected")
    const categoryCode = localStorage.getItem("prediction_category_selected")
    const wager = document.getElementById("wager-input").value
    const session = JSON.parse(localStorage.getItem("session"))
    const result = await fetch(`/users/${user}/predictions/${categoryCode + session}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            categoryid: categoryCode,
            prediction_value: target,
            wager: wager,
            season: session.SEASON,
            trackname: session.TRACKNAME
        })
    });
    if (result.status == 202) {
        alert(`Transaction successful: ${wager} point wager recorded`)
        window.location.href = "/file/odds"
    } else {
        alert("Error with transaction. Funds remain in your account. Please try again shortly")
    }
}

function updateWagerMessage() {
    const wager = document.getElementById("wager-input").value
    const toWin = localStorage.getItem("prediction_odds_selected")*wager
    document.getElementById("prediction-odds-desc").textContent = `To win: ${toWin} Points`
}
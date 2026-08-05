document.addEventListener("DOMContentLoaded", populatePredictionInfo)
document.getElementById("wager-input").addEventListener("input", updateWagerMessage)

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

function updateWagerMessage() {
    const wager = document.getElementById("wager-input").value
    const toWin = localStorage.getItem("prediction_odds_selected")*wager
    document.getElementById("prediction-odds-desc").textContent = `To win: ${toWin} Points`
}
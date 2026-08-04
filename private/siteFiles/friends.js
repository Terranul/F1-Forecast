document.getElementById("and-button").addEventListener("click", andOperation);
document.getElementById("or-button").addEventListener("click", orOperation);
document.getElementById("send-query").addEventListener("click", getSearchUsers);
document.getElementById("clear-query").addEventListener("click", clearQuery);

let query = "";

function andOperation() {
    addQuery("AND");
    const textArea = document.getElementById("query-formation");
    textArea.textContent = query;
}

function orOperation() {
    addQuery("OR");
    const textArea = document.getElementById("query-formation");
    textArea.textContent = query;
}

function addQuery(operation) {
    const selected = document.querySelector('input[name="mode"]:checked');
    if (selected) {
        const restriction = getRestriction();
        if (query === "") {
            query = `${selected.value}=${restriction}` ;
        } else {
            query = `(${query} ${operation} ${selected.value}=${restriction})`
        }
    }
`(a AND B)`
}

function getRestriction() {
    const selected = document.querySelector('input[name="mode"]:checked');
    if (selected.value === "amount" || selected.value === "streak") {
        return document.getElementById("number-input").value;
    } else{
        return `'${document.getElementById("username-input").value}'`;
    }
}

function clearQuery() {
    query = ""
    const textArea = document.getElementById("query-formation");
    textArea.textContent = ""
}

async function getSearchUsers() {
    const result = await fetch(`/users/search/${query}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await result.json()
    console.log(JSON.stringify(data));
    renderSearchResults(data)
}

function renderSearchResults(data) {
    const container = document.getElementById("user-info-container");
    container.innerHTML = ""
    for (const user of data) {
        const div = getUserDiv(user);
        container.appendChild(div);
    } 
}

function getUserDiv(user) {
    const div = document.createElement("div");
    const username = document.createElement("p");
    username.textContent = "Username: " + user.USER_NAME;
    div.appendChild(username);
    const streak = document.createElement("p");
    streak.textContent = "Streak: " + user.STREAK;
    div.appendChild(streak);
    const score = document.createElement("p");
    score.textContent = "Score: " + user.AMOUNT;
    div.appendChild(score);
    return div;
}

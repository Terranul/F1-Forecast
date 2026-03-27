const appService = require('../appService');

// ensure you have run testOracleConnection before using any methods here


function formatOdds(data) {
    // the input is a list of numbers, that don't represent odds at all (they just rank who our model thinks will do well)
    // our odds format will be a number that represents your return for 1 point bet. (about to say dollar there...)
    // approach:
    // find the highest value (highest chance of winning) and set it's odds to 1.1
    // for each value after the highest value, find the multiplication factor and multiply this with the 1.1

    const sortedData = data.sort((a, b) => {
        return a.odd - b.odd;
    })

    const baseFactor = sortedData[0].odd

    sortedData.map((value) => {
        const factor = value.odd / baseFactor;
        value.odd = factor * 1.1
    })

    return sortedData
}

module.exports = {
    formatOdds
}

const validation = require("../prediction-engine/prediction-validation")

async function getValidateRaceOdds(req, res) {
    const predictionid = req.params.predictionid;
    try {
        const validationResult = await validation.validateRaceOdds(predictionid)
        res.status(200).json(validationResult)
    } catch(err) {
        res.status(500).json({blame: "Internal server error :(", error_msg: error.message})
    }
}

async function getValidateTopTeam(req, res) {
    const predictionid = req.params.predictionid;
    try {
        const validationResult = await validation.validateTopTeam(predictionid);
        res.status(200).json(validationResult)
    } catch(err) {
        res.status(500).json({blame: "Internal server error :(", error_msg: error.message})
    }
}

async function getValidatePodiumDrivers(req, res) {
    const predictionid = req.params.predictionid;
    try {
        const validationResult = await validation.validatePodiumDrive(predictionid);
        res.status(200).json(validationResult)
    } catch(err) {
        res.status(500).json({blame: "Internal server error :(", error_msg: error.message})
    }
}

// user login -> get on api/users/:user/login -> returns true or false

// after entering we get on api/users/:user -> return all user data except password

// we get current session information with api/currentSessionData

// then we populate the odds with get on api/odds/:categoryid (category id's are static and stored in frontend)
// -> this will return driver id / teamid  too, we must store as a global variable for when a prediction is made

// we populate user prediction history with get on api/users/:user/predictions

// we validate last weeks data with api/users/:user/predictions/:prediction/validate

// when a user makes a prediction we put on api/users/:user/predictions/:prediction 

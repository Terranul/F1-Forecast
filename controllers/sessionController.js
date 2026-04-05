const appService = require('../appService');

async function getCurrentSession(req, res) {
    // we know the current session occurs sometime this week (or never if no races are planned)
    // a side effect of this approach is that 
    const currentDate = new Date() // when passed into oracle this is automatically converted to UTC
    const sql = `SELECT * 
                FROM (
                    SELECT *
                    FROM RACE_SESSION
                    WHERE SESSIONDATE >= :curDate
                )
                ORDER BY SESSIONDATE ASC`
    const result = await appService.executeSqlBinding(sql, {curDate: currentDate})
    console.log(JSON.stringify(result.rows[0]))
    res.status(200).json(result.rows[0]);
    
}

async function averagePointsPerNationality(req, res) {
    const sql = `SELECT nationality,
                 AVG(accumulatedpoints) AS avg_points   
                 FROM DRIVER
                 GROUP BY nationality`
    const result = await appService.executeSql(sql);
    if (result !== null) {
        res.status(200).json(result.rows);
    } else {
        res.status(404).send();
    }
}

async function averagePositionPerTeamPerSession(req, res) {
    const sql = `SELECT teamid, season, AVG(avg_position) AS avg_finish_position
                FROM (
                    SELECT teamid, season, trackname, AVG(position) AS avg_position
                    FROM RACE_RESULT
                    GROUP BY teamid, season, trackname
                    )
                GROUP BY teamid, season
                ORDER BY season, avg_finish_position`
    const result = await appService.executeSql(sql);
    if (result !== null) {
        res.status(200).json(result.rows);
    } else {
        res.status(404).send();
    }
}

module.exports = {
    getCurrentSession,
    averagePointsPerNationality,
    averagePositionPerTeamPerSession
}
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

module.exports = {
    getCurrentSession
}
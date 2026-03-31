const appService = require('./appService');
const https = require('https');
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';


function get(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, async (res) => {

            if (res.statusCode !== 200) {
                console.error(`HTTP ${await res.json}`);

                reject(new Error(`HTTP ${res.statusCode}`));
                res.resume(); // consume response to free memory
                return;
            }

            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    console.error("----- RAW RESPONSE START -----");
                    console.error(data.slice(0, 500));
                    console.error("----- RAW RESPONSE END -----");
                    reject(new Error("Invalid JSON response"));
                }
            });

        });

        req.on('error', (err) => {
            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });
    });
}
// ─── PAGINATION ────────────────────────────────────────────
async function fetchAll(endpoint) {
    const limit = 100;
    let offset = 0;
    let total = Infinity;
    const allRows = [];

    while (offset < total) {
        console.log("Memory:", process.memoryUsage().heapUsed / 1024 / 1024, "MB");
        const json = await get(`${BASE_URL}${endpoint}.json?limit=${limit}&offset=${offset}`);
        const data = json.MRData;

        total = parseInt(data.total, 10);

        const tableKey = Object.keys(data).find(k =>
            !['xmlns', 'series', 'url', 'limit', 'offset', 'total'].includes(k)
            && typeof data[k] === 'object'
        );

        const tableObj = data[tableKey] || {};
        const rowsKey = Object.keys(tableObj).find(k => Array.isArray(tableObj[k]));
        const rows = tableObj[rowsKey] ?? [];

        allRows.push(...rows);
        offset += limit;


    }

    return allRows;
}

// ─── DRIVERS ───────────────────────────────────────────────
async function loadDrivers(season) {
    const driversJson = await get(`${BASE_URL}/${season}/drivers.json?limit=100`);
    const standingsJson = await get(`${BASE_URL}/${season}/driverstandings.json?limit=100`);

    const drivers = driversJson.MRData.DriverTable.Drivers;
    const standingsLists = standingsJson.MRData.StandingsTable.StandingsLists;

    const standings = standingsLists.length
        ? standingsLists[standingsLists.length - 1].DriverStandings
        : [];

    for (const driver of drivers) {
        const standing = standings.find(s => s.Driver.driverId === driver.driverId);

        const teamid = standing?.Constructor?.constructorId ?? null;
        const drivernumber = driver.permanentNumber;
        const nationality = driver.nationality;
        const firstname = driver.givenName.substring(0, 25);
        const lastname = driver.familyName.substring(0, 25);
        const dateofbirth = driver.dateOfBirth ? new Date(driver.dateOfBirth) : null
         

        await appService.insertToTable('DRIVER', {
            driverid: driver.driverId.substring(0, 10),
            accumulatedpoints: standing ? parseInt(standing.points, 10) : 0,
            drivernumber: drivernumber ? drivernumber : null,
            nationality: nationality ? nationality.substring(0, 25) : null,
            firstname: firstname ? firstname : null,
            lastname: lastname ? lastname : null,
            teamid: teamid ? teamid.substring(0, 25) : null,
            dateofbirth: dateofbirth
        });
    }

    console.log(`Inserted drivers (${drivers.length})`);
}

// ─── TEAMS ─────────────────────────────────────────────────
async function loadTeams(season) {
    const constructorsJson = await get(`${BASE_URL}/${season}/constructors.json?limit=100`);
    const standingsJson = await get(`${BASE_URL}/${season}/constructorstandings.json?limit=100`);

    const constructors = constructorsJson.MRData.ConstructorTable.Constructors;
    const standingsLists = standingsJson.MRData.StandingsTable.StandingsLists;

    const standings = standingsLists.length
        ? standingsLists[standingsLists.length - 1].ConstructorStandings
        : [];

    for (const c of constructors) {
        const standing = standings.find(s => s.Constructor.constructorId === c.constructorId);

        await appService.insertToTable('TEAM', {
            teamid: c.constructorId.substring(0, 25),
            name: c.name.substring(0, 50),
            nationality: c.nationality,
            points: standing ? parseInt(standing.points, 10) : 0
        });
    }

    console.log(`Inserted teams (${constructors.length})`);
}

// ─── RACE SESSIONS ─────────────────────────────────────────
async function loadRaceSessions(season) {
    const races = await fetchAll(`/${season}/races`);

    for (const race of races) {
        await appService.executeSql(`INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (${parseInt(race.season, 10)},
        '${race.raceName.substring(0, 50)}', DATE '${race.date}')`)
    }


    console.log(`Inserted race sessions (${races.length})`);
    return races;
}

// ─── RACES ─────────────────────────────────────────────────
async function loadRaces(season, races) {
    if (!races) races = await fetchAll(`/${season}/races`);

    for (const race of races) {
        await appService.insertToTable('RACE', {
            season: parseInt(race.season, 10),
            trackname: race.raceName.substring(0, 50)
        });
    }
}

// ─── PRACTICE ──────────────────────────────────────────────
async function loadPractice(season) {
    const races = await fetchAll(`/${season}/races`);
    let count = 0;

    for (const race of races) {
        const sessions = [
            race.FirstPractice,
            race.SecondPractice,
            race.ThirdPractice
        ];

        let round = 1;
        for (const session of sessions) {
            if (!session) continue;

            await appService.insertToTable('PRACTICE', {
                season: parseInt(race.season, 10),
                trackname: race.raceName.substring(0, 50),
                round: round++
            });

            count++;
        }
    }

    console.log(`Inserted practice sessions (${count})`);
}

// ─── RESULTS ───────────────────────────────────────────────
async function loadRaceResults(season) {
    const json = await get(`${BASE_URL}/${season}/results.json?limit=100`);
    const races = json.MRData.RaceTable.Races ?? [];

    let count = 0;

    for (let i = 0; i < races.length; i++) {
        console.log("Memory:", process.memoryUsage().heapUsed / 1024 / 1024, "MB");
        const race = races[i];
        const pitstops = await getPitstops(season, i + 1);

        for (const result of race.Results ?? []) {
            await appService.insertToTable('RACE_RESULT', {
                driveroftheday: null,
                pitstops: pitstops[result.Driver.driverId] ?? 0,
                position: parseInt(result.position, 10),
                totaltime: formatInterval(result.Time?.time),
                season: season,
                trackname: race.raceName.substring(0, 50),
                driverid: result.Driver.driverId.substring(0, 10),
                teamid: result.Constructor.constructorId.substring(0, 25)
            });

            count++;
        }
    }

    console.log(`Inserted race results (${count})`);
}

// ─── PITSTOPS ──────────────────────────────────────────────
async function getPitstops(season, round) {
    const json = await get(`${BASE_URL}/${season}/${round}/pitstops.json?limit=100`);
    const races = json.MRData.RaceTable.Races ?? [];

    const stops = races.flatMap(r => r.PitStops ?? []);

    return stops.reduce((map, p) => {
        map[p.driverId] = (map[p.driverId] ?? 0) + 1;
        return map;
    }, {});
}

// ─── HELPERS ───────────────────────────────────────────────
function formatInterval(timeStr) {
    if (!timeStr || timeStr.startsWith('+')) return null;
    return `0 ${timeStr}`;
}

// ─── MAIN LOADER ───────────────────────────────────────────
async function loadAllData(season) {
    console.log(`\n=== Loading F1 data for ${season} ===\n`);

    const races = await loadRaceSessions(season);
    await loadTeams(season);
    await loadDrivers(season);
    await loadRaces(season, races);
    await loadPractice(season);
    await loadRaceResults(season);

    console.log(`\n=== Done ===\n`);
}

module.exports = {
    loadAllData,
    fetchAll,
    loadRaceSessions,
    loadTeams,
    loadDrivers,
    loadRaces,
    loadPractice,
    loadRaceResults
};
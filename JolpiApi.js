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

        const teamid = standing?.ConstructorS?.constructorId ?? null;
        const drivernumber = driver.permanentNumber;
        const nationality = driver.nationality;
        const firstname = driver.givenName.substring(0, 25);
        const lastname = driver.familyName.substring(0, 25);
        const dateofbirth = driver.dateOfBirth ? new Date(driver.dateOfBirth) : null
         

        await appService.insertToTable('DRIVER', {
            driverid: driver.driverId.substring(0, 25),
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
// ─── Race ─────────────────────────────────────────────────────────────────────
async function loadRaces(season, races) {
   // if (!races) races = await fetchAll(`/${season}/races`);
    for (const race of races) {
        await appService.insertToTable('RACE', {
            season: parseInt(race.season, 10),
            trackname: race.raceName.substring(0, 50),
        });
    }

    console.log(`Inserted ${races.length} races for season ${season}`);
}

// ─── Sprint ───────────────────────────────────────────────────────────────────
async function loadSprints(season) {
    // Not every season has sprints
    const sprintJson = await get(`${BASE_URL}/${season}/sprint.json?limit=100`);
    const sprints = sprintJson.MRData.RaceTable.Races ?? [];

    for (const sprint of sprints) {
        await appService.insertToTable('SPRINT', {
            season: parseInt(sprint.season, 10),
            trackname: sprint.raceName.substring(0, 50),
        });
    }

    console.log(`Inserted ${sprints.length} sprints for season ${season}`);
}

// ─── Qualifying ───────────────────────────────────────────────────────────────
async function loadQualifying(season) {
    const qualiJson = await get(`${BASE_URL}/${season}/qualifying.json?limit=100`);
    const rounds = qualiJson.MRData.RaceTable.Races ?? [];

    for (const round of rounds) {
        await appService.insertToTable('QUALIFYING', {
            season: parseInt(round.season, 10),
            trackname: round.raceName.substring(0, 50),
            // round:     parseInt(round.round, 10),   Qualifying doesn't expose different qualyfying sessions. Would need to note in results
        });
    }

    console.log(`Inserted ${rounds.length} qualifying sessions for season ${season}`);
}

// ─── Practice ─────────────────────────────────────────────────────────────────
// The Ergast/Jolpi API exposes fp1/fp2/fp3 per race inside the Races array
// under FirstPractice / SecondPractice / ThirdPractice sub-objects.
async function loadPractice(season) {
    const races = await fetchAll(`/${season}/races`);

    let count = 0;
    for (const race of races) {
        const sessions = [
            { obj: race.FirstPractice, round: 1 },
            { obj: race.SecondPractice, round: 2 },
            { obj: race.ThirdPractice, round: 3 },
        ];

        for (const { obj, round } of sessions) {
            if (!obj) continue;    // sprint weekends have no  FP3

            await appService.insertToTable('PRACTICE', {
                season: parseInt(race.season, 10),
                trackname: race.raceName.substring(0, 50),
                round: round,
            });
            count++;
        }
    }

    console.log(`Inserted ${count} practice sessions for season ${season}`);
}

// ─── Results ──────────────────────────────────────────────────────────────────
/*
  CREATE TABLE RACERESULT (
  type
      driveroftheday VARCHAR2(50),
      pitstops       INTEGER,
      position       INTEGER,
      totaltime      INTERVAL DAY TO SECOND,
      season         NUMBER NOT NULL,
      trackname      VARCHAR2(50) NOT NULL,
      driverid       VARCHAR(25) NOT NULL,
      CONSTRAINT RESULT_PK PRIMARY KEY (position, season, trackname)
  )
  The API returns pit-stop counts on /pitstops and driver-of-the-day is not
  in jolpi at all – we store null for those and you can fill them later.
*/
async function loadRaceResults(season) {
    const raceResJson = await get(`${BASE_URL}/${season}/results.json?limit=100`);
    const races = raceResJson.MRData.RaceTable.Races ?? [];

    let count = 0;
    let raceNum = 0;



for (let i = 0; i < races.length; i++) {
    const pitstops = await getPitstops(season, i + 1);
    const race = races[i];
    const results = race.Results ?? [];
        const trackname = race.raceName.substring(0, 50);
        for (const result of results) {
            // totaltime comes as "1:35:20.123" – convert to Oracle INTERVAL string
            const rawTime = result.Time?.time ?? null;
            const totaltime = rawTime ? formatInterval(rawTime) : null;
            const driverId = result.Driver.driverId;

            await appService.insertToTable('RACE_RESULT', {
                driveroftheday: null,      // not in API
                pitstops: pitstops[driverId],     
                position: parseInt(result.position, 10),
                totaltime: totaltime,
                season:season,
                trackname: trackname,
                driverid: driverId.substring(0, 25),
                teamid: result.Constructor.constructorId.substring(0, 25),
            });
            count++;
        }
    }

    console.log(`Inserted ${count} results for season ${season}`);
}

// ─── Results ──────────────────────────────────────────────────────────────────
/*
  CREATE TABLE QUALIRESULT (
      type           STRING,
      position       INTEGER,
      totaltime      INTERVAL DAY TO SECOND,
      season         NUMBER NOT NULL,
      trackname      VARCHAR2(50) NOT NULL,
      driverid       VARCHAR(25) NOT NULL,
      CONSTRAINT RESULT_PK PRIMARY KEY (type, season, trackname, type)
  )
  */
async function loadQualyfyingResults(season) {
    const res = await get(`${BASE_URL}/${season}/qualifying.json?limit=100`);
    const races = res.MRData.RaceTable.Races ?? [];

    let count = 0;

    for (const race of races) {
        const qualiresults = race.QualifyingResults ?? [];
        const trackname = race.raceName.substring(0, 50);
        const season =  race.season;
        for (const result of qualiresults) {
            // totaltime comes as "1:35:20.123" – convert to Oracle INTERVAL string
            const rawQ1time = result.Q1?.time ?? null;
            const rawQ2time = result.Q2?.time ?? null;
            const rawQ3time = result.Q3?.time ?? null;
            const Q1time = rawQ1time ? formatInterval(rawQ1time) : null;
            const Q2time = rawQ2time ? formatInterval(rawQ2time) : null;
            const Q3time = rawQ3time ? formatInterval(rawQ3time) : null;


            await appService.insertToTable('QUALI_RESULT', {
                type: "QUALIFYING",
                position: parseInt(result.position, 10),
                season: parseInt(season, 10),
                trackname: trackname,
                driverid: result.Driver.driverId.substring(0, 25),
                teamid: result.Constructor.constructorId.substring(0, 25),
                q1time: Q1time,
                q2time: Q2time,
                q3time: Q3time,


            });
            count++;
        }
    }

        console.log(`Inserted ${count} qualifying results for the ${season} season`);
    }

    async function loadSprintResults(season) {
        const res = await get(`${BASE_URL}/${season}/sprint.json?limit=100`);
        const races = res.MRData.RaceTable.Races ?? [];
        const type = "SPRINT";

        let count = 0;

        for (const race of races) {
            const sprintresults = race.SprintResults ?? [];
            const season =  parseInt(race.season, 10);
            const trackname = race.raceName.substring(0, 50);
            for (const result of sprintresults) {
                // totaltime comes as "1:35:20.123" – convert to Oracle INTERVAL string
                const rawTime = result.Time?.time ?? null;
                const totaltime = rawTime ? formatInterval(rawTime) : null;
                const driverId = result.Driver.driverId;

                await appService.insertToTable('SPRINT_RESULT', {
                    type : type,
                    position: parseInt(result.position, 10),
                    totaltime: totaltime,
                    season: season,
                    trackname: trackname,
                    driverid: driverId.substring(0, 25),
                    teamid: result.Constructor.constructorId.substring(0, 25),
                });
                count++;
            }
        }

        console.log(`Inserted ${count} sprint results for the ${season} season `);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    /**
     * Convert Ergast time string "H:MM:SS.sss" → Oracle INTERVAL DAY TO SECOND
     * literal string "0 H:MM:SS.sss" (day component always 0 for race times < 24h).
     */
    function formatInterval(timeStr) {
        if (!timeStr) return null;
        // timeStr examples: "1:35:20.456"  or  "+23.4"  (gap times – skip those)
        if (timeStr.startsWith('+')) return null;
        return `0 ${timeStr}`;
    }

    async function getPitstops(season, round) {
        const res = await get(`${BASE_URL}/${season}/${round}/pitstops,json?limit=100`);
        const races = res.MRData.RaceTable.Races ?? [];

        const pitStops = races.flatMap(race => race.PitStops ?? []);
        return pitStops.reduce((map, pitstop) => {
            map[pitstop.driverId] = (map[pitstop.driverId] ?? 0) + 1;
            return map;
        }, {});

    }


    // ─── main loader ────────────────────────────────────────────────────────────
    /**
     * Called to populate the entire schema for a given season.
     * @param {object}  
     * @param {number} season       
     */
    async function loadAllData(season) {
        console.log(`\n=== Loading F1 data for season ${season} ===\n`);
        const races = await loadRaceSessions(season);  // RACE_SESSION first
       await loadTeams(season);                         // TEAMBYDEBUT + TEAM
       await loadDrivers(season);                       // DRIVERBYDEBUT + DRIVER
        await loadRaces(season, races);                  // RACE
       // await loadSprints(season);                       // SPRINT
       // await loadQualifying(season);                    // QUALIFYING
        await loadPractice(season);                      // PRACTICE
        await loadRaceResults(season);                       // RACERESULT
        await loadQualyfyingResults(season);                    // QUALIRESULT
        await loadSprintResults(season);                       // SPRRESULT

        console.log(`\n=== Done loading season ${season} ===\n`);
    }

    module.exports = {
        fetchAll,
        loadAllData,
        loadRaceSessions,
        loadTeams,
        loadDrivers,
        loadRaces,
        loadSprints,
        loadQualifying,
        loadPractice,
        loadRaceResults,
        loadSprintResults,
        loadQualyfyingResults
    };

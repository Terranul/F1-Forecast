const appService = require('./appService');

	
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function fetchAll(endpoint) {
    const limit = 100;
    let offset = 0;
    let total = Infinity;
    const allRows = [];

    while (offset < total) {
        const res = await fetch(`${BASE_URL}${endpoint}?limit=${limit}&offset=${offset}`);
        const json = await res.json();
        const data = json.MRData;

        total = parseInt(data.total, 10);

        const tableKey = Object.keys(data).find(k =>
            k !== 'xmlns' && k !== 'series' && k !== 'url' &&
            k !== 'limit' && k !== 'offset' && k !== 'total' &&
            typeof data[k] === 'object' && data[k] !== null
        );

        const tableObj = data[tableKey] || {};
        const rowsKey = Object.keys(tableObj).find(k => Array.isArray(tableObj[k]));
        const rows = tableObj[rowsKey] ?? [];

        allRows.push(...rows);

        offset += limit;

        // small throttle to avoid hammering undici / WASM
        await delay(100);
    }

    return allRows;
}
// ─── Drivers ─────────────────────────────────────────────────────────────────

async function loadDrivers(season) {
    const driversRes =   await fetch(`${BASE_URL}/${season}/drivers/?limit=100`);
    const standingsRes= await fetch(`${BASE_URL}/${season}/driverstandings/?limit=100`);
    
    const driversJson = await driversRes.json();
    const standingsJson = await standingsRes.json();

    const drivers = driversJson.MRData.DriverTable.Drivers;
    // StandingsLists is an array of rounds; take the last one (most recent)
    const standingsLists = standingsJson.MRData.StandingsTable.StandingsLists;
    const standings = standingsLists.length
        ? standingsLists[standingsLists.length - 1].DriverStandings
        : [];

    for (const driver of drivers) {
        const standing = standings.find(s => s.Driver.driverId === driver.driverId);
        const accPoints = standing ? parseInt(standing.points, 10) : 0;
        const teamid = standing ? standing.Constructor.constructorId : null;

        // DRIVERBYDEBUT – keyed on driver full name (as stored in schema)
        const fisrtname = driver.givenName;
        const lastname = driver.familyName;

     


        await appService.insertToTable('DRIVER', {
            driverid: driver.driverId.substring(0, 10),
            accumulatedpoints: accPoints,
            drivernumber: driver.permanentNumber,
            nationality: driver.nationality.substring(0, 25),
            firstname: fisrtname.substring(0, 25),
            lastname: lastname.substring(0, 25),
            teamid: teamid.substring(0, 25),
            dateofbirth: driver.dateOfBirth
        });
    }

    console.log(`Inserted ${drivers.length} drivers for season ${season}`);
}

// ─── Teams (Constructors) ─────────────────────────────────────────────────────

async function loadTeams(season) {
    console.log(`entered load teams `);
    const constructorsRes =  await  fetch(`${BASE_URL}/${season}/constructors/?limit=100`);
    const standingsRes  = await  fetch(`${BASE_URL}/${season}/constructorstandings/?limit=100`);
    
    const constructorsJson = await constructorsRes.json();
    const standingsJson = await standingsRes.json();

    const constructors = constructorsJson.MRData.ConstructorTable.Constructors;
    const standingsLists = standingsJson.MRData.StandingsTable.StandingsLists;

    //most recent round 
    const standings = standingsLists.length
        ? standingsLists[standingsLists.length - 1].ConstructorStandings
        : [];

    for (const constructor of constructors) {
        const standing = standings.find(s => s.Constructor.constructorId === constructor.constructorId);
        const points = standing ? parseInt(standing.points, 10) : 0;
        const teamId = constructor.constructorId.substring(0, 25);

       
        await appService.insertToTable('TEAM', {
            points: points,
            name: constructor.name.substring(0, 50),
            teamid: teamId,
            nationality: constructor.nationality,
        });
    }

    console.log(`Inserted ${constructors.length} teams for season ${season}`);
}

// ─── Race Sessions (parent table for Race / Sprint / Qualifying / Practice) ───
async function loadRaceSessions(season) {
    console.log(`entered race sessions`);
    console.log(`${BASE_URL}/${season}/races?limit=1`);
    let races = await fetch(`${BASE_URL}/${season}/races?limit=1`);
    races = await races.json()
    console.log(`finished fetching`);

    //await delay(500);
    console.log(`after 400 delay`);

    for (const race of races) {
        await appService.insertToTable('RACE_SESSION', {
            season: parseInt(race.season, 10),
            trackname: race.raceName.substring(0, 50),
            sessiondate: race.date,
        });
    }

    console.log(`Inserted ${races.length} race sessions for season ${season}`);
    return races;   // return so subtypes can reuse the already-fetched list
}

// ─── Race ─────────────────────────────────────────────────────────────────────
async function loadRaces(season, races) {
    if (!races) races = await fetchAll(`/${season}/races`);
   await   delay(200);
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
    const res = await fetch(`${BASE_URL}/${season}/sprint/?limit=100`);
    const json = await res.json();
    const sprints = json.MRData.RaceTable.Races ?? [];

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
    const res = await fetch(`${BASE_URL}/${season}/qualifying/?limit=100`);
    const json = await res.json();
    const rounds = json.MRData.RaceTable.Races ?? [];

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
    const res = await fetch(`${BASE_URL}/${season}/results/?limit=100`);
    const json = await res.json();
    const races = json.MRData.RaceTable.Races ?? [];

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
                driverid: driverId.substring(0, 10),
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
    const res = await fetch(`${BASE_URL}/${season}/qualifying/?limit=100`);
    const json = await res.json();
    const races = json.MRData.RaceTable.Races ?? [];

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
                driverid: result.Driver.driverId.substring(0, 10),
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
        const res = await fetch(`${BASE_URL}/${season}/sprint/?limit=100`);
        const json = await res.json();
        const races = json.MRData.RaceTable.Races ?? [];
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
                    driverid: driverId.substring(0, 10),
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
        const res = await fetch(`${BASE_URL}/${season}/${round}/pitstops/?limit=100`);
        const json = await res.json();
        const races = json.MRData.RaceTable.Races ?? [];

        const pitStops = races.flatMap(race => race.PitStops ?? []);
        return pitStops.reduce((map, pitstop) => {
            map[pitstop.driverId] = (map[pitstop.driverId] ?? 0) + 1;
            return map;
        }, {});

    }




    // async function test() {
    //     const res = await get(`${BASE_URL}/2026/races`);
    //     const text = await res.text();
    //     console.log("STATUS:", res.status);
    //     console.log("CONTENT-TYPE:", res.headers.get("content-type"));
    //     console.log("RAW RESPONSE:", text.slice(0, 500)); // print first 500 chars
    // }
    // ─── main loader ────────────────────────────────────────────────────────────
    /**
     * Called to populate the entire schema for a given season.
     * @param {object}  
     * @param {number} season       
     */
    async function loadAllData(season) {
        console.log(`\n=== Loading F1 data for season ${season} ===\n`);

        
       //await  test();
        
        // Order matters – parent tables before children
        const races = await loadRaceSessions(season);  // RACE_SESSION first
        // await loadTeams(season);                         // TEAMBYDEBUT + TEAM
        // await loadDrivers(season);                       // DRIVERBYDEBUT + DRIVER
        // await loadRaces(season, races);                  // RACE
        // await loadSprints(season);                       // SPRINT
        // await loadQualifying(season);                    // QUALIFYING
        // await loadPractice(season);                      // PRACTICE
        // await loadRaceResults(season);                       // RACERESULT
        // await loadQualyfyingResults(season);                    // QUALIRESULT
        // await loadSprintResults(season);                       // SPRRESULT

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
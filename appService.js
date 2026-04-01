const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

// tells the db that when sending the result of a SELECT query, send the results in a mapped object format: {id: 2, name: ""}
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const envVariables = loadEnvFile('./.env');
// no es modules, so require statements are necessary
const tableCreation = require("./tableCreation");

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);   
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        console.log("process of deleting all existing sets")
        for (const statement of tableCreation.deleteStatements) {
            try {
                await connection.execute(statement);
                console.log(statement)
            } catch (error) {
                console.log(`The deletion statement '${statement}' tried to delete a nonexisting table. Skipping deletion of this table.`)
                console.log(error)
            }
        }
        console.log("moving to table creation")
        for (const table of tableCreation.tableCreations) {
            try {
                await connection.execute(table)
                console.log("creating table: " + table)
            } catch(err) {
                console.log(err + "Issue on table: " + table );
            }
        }
        return true
    }).catch(() => {
        return false;
    });
}

async function testInsert() {
    await withOracleDB( async (connection) => {
        connection.execute(`INSERT INTO RACE SESSION (season, trackname, sessiondate) VALUES (")`)
    })
}

// function to insert demo data for database testing purposes. After using, make sure to delete the call. Or don't I don't really care
async function insertDemoData() {
    console.log("beginning inserting values")
    await withOracleDB(async (connection) => {
        for(const insert of tableCreation.demoInsertStatements) {
            try {
                await connection.execute(insert, {}, { autoCommit: true });
                console.log(insert)
            } catch(err) {
                console.log(`Issue inserting values: ${err} at insert statement: ${insert}`);
            }
        }
    })
    console.log("completed inserting values")
    await testSqlStatements();
}

// tableName: name of the table, make sure all caps
// value: object mapping each attribute: {id: "id", name: "name"}
async function insertToTable(tableName, value) {
    const insertStatement = extractInsertStatement(tableName, value)
    return await withOracleDB(async (connection) => {
        await connection.execute(
            insertStatement,
            value,
            { autoCommit: true }
        )
    });
}

function extractInsertStatement(tableName, value) {
    // match the form ":id, :name"
    let mappingString = ""
    for (const key of Object.keys(value)) {
        mappingString += `:${key},`
    }
    mappingString = mappingString.slice(0, -1); // removes the ending ","
    const cleanMapping = mappingString.replaceAll(":", "");
    console.log(`INSERT INTO ${tableName} (${cleanMapping}) VALUES (${mappingString})`)
    return `INSERT INTO ${tableName} (${cleanMapping}) VALUES (${mappingString})`;
}

// link to the docs for return type: https://node-oracledb.readthedocs.io/en/v6.10.0/user_guide/sql_execution.html
// example: after executing SELECT * FROM SPRINT you should expect to get the structure:
/*
    {
        metaData: [ { name: 'SEASON' }, { name: 'TRACKNAME' } ],
        rows: [
            { SEASON: 2026, TRACKNAME: 'monaco' },
            { SEASON: 2026, TRACKNAME: 'silverstone' }
        ]
     }
*/
async function executeSql(statement) {
    try {
        return await withOracleDB(async (connection) => {
            return connection.execute(statement);
        });
    } catch (err) {
        console.error("Issue with the formatting in sql entry:" + err);
        return null;
    }
}

async function executeSqlBinding(statement, bindings) {
    try {
        return await withOracleDB(async (connection) => {
            connection.execute(statement, bindings, { autoCommit: true })
    })
    } catch(err) {
        console.log("Issue with executing sql binding");
    }
}

async function testSqlStatements() {
    console.log("beginning testing sql statements \n")
    await withOracleDB(async (connection) => {
        for (const query of tableCreation.testsql) {
            const result = await connection.execute(query);
            console.log(result);
        }
    })
}


module.exports = {
    testOracleConnection,
    initiateDemotable, 
    insertDemoData,
    insertToTable,
    executeSql,
    testSqlStatements,
    executeSqlBinding
};
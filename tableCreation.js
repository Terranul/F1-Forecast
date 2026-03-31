const tableCreations = [
    `CREATE TABLE TESTING (
    id NUMBER PRIMARY KEY
)`,

    `CREATE TABLE APP_USER (
    app_userid VARCHAR2(25),
    dateoffirstprediction DATE,
    user_name VARCHAR2(50),
    streak INTEGER,
    CONSTRAINT APP_USER_PK PRIMARY KEY (app_userid, dateoffirstprediction)
)`,

    `CREATE TABLE RACE_SESSION (
    season NUMBER,
    trackname VARCHAR2(50),
    sessiondate DATE,
    CONSTRAINT RACE_SESSION_PK PRIMARY KEY (season, trackname)
)`,

    `CREATE TABLE TEAM (
    points INTEGER,
    name VARCHAR2(50),
    teamid VARCHAR2(25),
    nationality VARCHAR2(50),
    CONSTRAINT TEAM_PK PRIMARY KEY (teamid)
)`,



    `CREATE TABLE DRIVER (
    driverid VARCHAR2(10),
    accumulatedpoints INTEGER,
    drivernumber INTEGER,
    firstname VARCHAR2(25),
    lastname VARCHAR2(25),
    nationality VARCHAR2(25),
    teamid VARCHAR2(10),
    dateofbirth DATE,
    CONSTRAINT DRIVER_PK PRIMARY KEY (driverid),
    CONSTRAINT DRIVER_FK_TEAM FOREIGN KEY (teamid) REFERENCES TEAM(teamid) ON DELETE CASCADE
    
)`,

    `CREATE TABLE SCORE (
    ranking INTEGER,
    acc VARCHAR2(50),
    amount INTEGER,
    deductions INTEGER,
    CONSTRAINT SCORE_PK PRIMARY KEY (ranking, acc)
)`,

    `CREATE TABLE PREDICTION (
    predictionid VARCHAR2(5),
    date_filed DATE NOT NULL,
    time_filed TIMESTAMP(6) NOT NULL,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    dateoffirstprediction DATE NOT NULL,
    app_userid VARCHAR2(25),
    CONSTRAINT PREDICTION_PK PRIMARY KEY (predictionid),
    CONSTRAINT PREDICTION_FK_RACE FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_USER FOREIGN KEY (app_userid, dateoffirstprediction) REFERENCES APP_USER(app_userid, dateoffirstprediction) ON DELETE CASCADE
)`,

    `CREATE TABLE CATEGORY (
    id VARCHAR2(5),
    name VARCHAR2(50),
    CONSTRAINT CATEGORY_PK PRIMARY KEY (id)
)`,

    `CREATE TABLE PREDICTIONCATEGORY (
    predictionid VARCHAR2(5),
    id VARCHAR2(5),
    CONSTRAINT PREDICTIONCATEGORY_PK PRIMARY KEY (predictionid, id),
    CONSTRAINT PREDICTIONCATEGORY_FK FOREIGN KEY (predictionid) REFERENCES PREDICTION(predictionid) ON DELETE CASCADE
)`,

    `CREATE TABLE PREDICTIONSCORE (
    predictionid VARCHAR2(5),
    ranking INTEGER,
    acc VARCHAR2(50),
    CONSTRAINT PREDICTIONSCORE_PK PRIMARY KEY (predictionid, ranking, acc),
    CONSTRAINT PREDICTIONSCORE_FK_PRED FOREIGN KEY (predictionid) REFERENCES PREDICTION(predictionid) ON DELETE CASCADE,
    CONSTRAINT PREDICTIONSCORE_FK_SCORE FOREIGN KEY (ranking, acc) REFERENCES SCORE(ranking, acc) ON DELETE CASCADE
)`,

    `CREATE TABLE FRIEND (
    user1id VARCHAR2(25),
    user1_date DATE,
    user2id VARCHAR2(25),
    user2_date DATE,
    CONSTRAINT FRIEND_FK_USER1 FOREIGN KEY (user1id, user1_date) REFERENCES APP_USER(app_userid, dateoffirstprediction) ON DELETE CASCADE,
    CONSTRAINT FRIEND_FK_USER2 FOREIGN KEY (user2id, user2_date) REFERENCES APP_USER(app_userid, dateoffirstprediction) ON DELETE CASCADE
)`,

    `CREATE TABLE RACE (
    season NUMBER,
    trackname VARCHAR2(50),
    CONSTRAINT RACE_PK PRIMARY KEY (season, trackname),
    CONSTRAINT RACE_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
)`,

    `CREATE TABLE SPRINT (
    season NUMBER,
    trackname VARCHAR2(50),
    CONSTRAINT SPRINT_PK PRIMARY KEY (season, trackname),
    CONSTRAINT SPRINT_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
)`,

    `CREATE TABLE QUALIFYING (
    season NUMBER,
    trackname VARCHAR2(50),
    qualyfyingdate NUMBER,
    CONSTRAINT QUALIFYING_PK PRIMARY KEY (season, trackname),
    CONSTRAINT QUALIFYING_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
)`,

    `CREATE TABLE PRACTICE (
    season NUMBER,
    trackname VARCHAR2(50),
    round NUMBER,
    CONSTRAINT PRACTICE_PK PRIMARY KEY (season, trackname),
    CONSTRAINT PRACTICE_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
)`,

    `CREATE TABLE RACE_RESULT (
    type VARCHAR2(10), 
    CONSTRAINT TYPE_CONSTRAINT CHECK (type IN ('QUALIFYING', 'RACE', 'SPRINT', 'PRACTICE')),
    pitstops INTEGER,
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(10) NOT NULL,
    teamid VARCHAR2(25)  NOT NULL,
    CONSTRAINT RESULT_PK PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT RESULT_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT RESULT_FK_DRIVER FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT RESULT_FK_TEAM FOREIGN KEY (teamid) REFERENCES TEAM(teamid) ON DELETE CASCADE
)`,

`CREATE TABLE QUALI_RESULT (
    type VARCHAR2(10), 
    CONSTRAINT QUALI_TYPE_CONSTRAINT CHECK (type IN ('QUALIFYING', 'RACE', 'SPRINT', 'PRACTICE')),
    position INTEGER,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(10) NOT NULL,
    teamid VARCHAR2(25) NOT NULL,
    q1time INTERVAL DAY TO SECOND,
    q2time INTERVAL DAY TO SECOND,
    q3time INTERVAL DAY TO SECOND,
    CONSTRAINT QUALI_PK PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT QUALI_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT QUALI_FK_DRIVER FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT QUALI_FK_TEAM FOREIGN KEY (teamid) REFERENCES TEAM(teamid) ON DELETE CASCADE
)`,
     

`CREATE TABLE SPRINTRESULT (
    type VARCHAR2(10), 
    CONSTRAINT SPRINTRES_TYPE_CONSTRAINT CHECK (type IN ('QUALIFYING', 'RACE', 'SPRINT', 'PRACTICE')),
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(10) NOT NULL,
    teamid VARCHAR2(25) NOT NULL,
    CONSTRAINT SPRINTRES_PK PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT SPRINTRES_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT SPRINTRES_FK_DRIVER FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT SPRINTRES_FK_TEAM FOREIGN KEY (teamid) REFERENCES TEAM(teamid) ON DELETE CASCADE
)`
];

// CASCADE CONTRAINTS just means that if we delete a table that has other table still referencing it with foreign keys, we will first delete
// the foreign key attributes that reference the table we are trying to delete, then we can drop the table with no issues.
// this means we will be left with tables that are no longer connected by any foreign keys, but it's all good becuase we're deleting them too.
const deleteStatements = [
    `DROP TABLE PREDICTIONSCORE CASCADE CONSTRAINTS`,
    `DROP TABLE PREDICTIONCATEGORY CASCADE CONSTRAINTS`,
    `DROP TABLE FRIEND CASCADE CONSTRAINTS`,
    `DROP TABLE PREDICTION CASCADE CONSTRAINTS`,
    `DROP TABLE RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE QUALIFYING CASCADE CONSTRAINTS`,
    `DROP TABLE SPRINT CASCADE CONSTRAINTS`,
    `DROP TABLE PRACTICE CASCADE CONSTRAINTS`,
    `DROP TABLE RACE CASCADE CONSTRAINTS`,
    `DROP TABLE DRIVER CASCADE CONSTRAINTS`,
    `DROP TABLE DRIVERBYDEBUT CASCADE CONSTRAINTS`,
    `DROP TABLE TEAMREF CASCADE CONSTRAINTS`,
    `DROP TABLE TEAM CASCADE CONSTRAINTS`,
    `DROP TABLE TEAMBYDEBUT CASCADE CONSTRAINTS`,
    `DROP TABLE SCORE CASCADE CONSTRAINTS`,
    `DROP TABLE RACE_SESSION CASCADE CONSTRAINTS`,
    `DROP TABLE CATEGORY CASCADE CONSTRAINTS`,
    `DROP TABLE APP_USER CASCADE CONSTRAINTS`,
    `DROP TABLE TESTING CASCADE CONSTRAINTS`, 
    `DROP TABLE SPRINT_RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE QUALI_RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE RACE_RESULT CASCADE CONSTRAINTS`,
];

const demoInsertStatements = [
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u01', DATE '2023-01-01', 'alice', 5)`,
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u02', DATE '2023-01-02', 'bob', 3)`,

    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'silverstone', DATE '2026-03-01')`,
    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'monaco', DATE '2026-03-15')`,

    `INSERT INTO TEAMBYDEBUT (teamid, dateofentrytof1) VALUES ('t01', DATE '1950-05-13')`,
    `INSERT INTO TEAMBYDEBUT (teamid, dateofentrytof1) VALUES ('t02', DATE '1960-07-01')`,

    `INSERT INTO TEAM (points, name, teamid) VALUES (120, 'redracers', 't01')`,
    `INSERT INTO TEAM (points, name, teamid) VALUES (95, 'speedstars', 't02')`,

    `INSERT INTO DRIVERBYDEBUT (name, dateofentrytof1) VALUES ('hamilton', DATE '2007-03-18')`,
    `INSERT INTO DRIVERBYDEBUT (name, dateofentrytof1) VALUES ('verstappen', DATE '2015-05-03')`,

    `INSERT INTO DRIVER (driverid, accumulatedpoints, points, name, namedebut) VALUES ('d01', 3000, 120, 'redracers', 'hamilton')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, points, name, namedebut) VALUES ('d02', 2500, 95, 'speedstars', 'verstappen')`,

    `INSERT INTO RACE (season, trackname) VALUES (2026, 'silverstone')`,
    `INSERT INTO RACE (season, trackname) VALUES (2026, 'monaco')`,

    `INSERT INTO PREDICTION (predictionid, date_filed, time_filed, season, trackname, dateoffirstprediction, app_userid) VALUES ('p01', DATE '2026-03-05', TO_TIMESTAMP('2026-03-05 12:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'silverstone', DATE '2023-01-01', 'u01')`,
    `INSERT INTO PREDICTION (predictionid, date_filed, time_filed, season, trackname, dateoffirstprediction, app_userid) VALUES ('p02', DATE '2026-03-06', TO_TIMESTAMP('2026-03-06 14:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'monaco', DATE '2023-01-02', 'u02')`,

    `INSERT INTO CATEGORY (id, name) VALUES ('c01', 'speed')`,
    `INSERT INTO CATEGORY (id, name) VALUES ('c02', 'strategy')`,

    `INSERT INTO PREDICTIONCATEGORY (predictionid, id) VALUES ('p01', 'c01')`,
    `INSERT INTO PREDICTIONCATEGORY (predictionid, id) VALUES ('p02', 'c02')`,

    `INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (1, 'a', 100, 0)`,
    `INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (2, 'b', 90, 5)`,

    `INSERT INTO PREDICTIONSCORE (predictionid, ranking, acc) VALUES ('p01', 1, 'a')`,
    `INSERT INTO PREDICTIONSCORE (predictionid, ranking, acc) VALUES ('p02', 2, 'b')`,

    `INSERT INTO FRIEND (user1id, user1_date, user2id, user2_date) VALUES ('u01', DATE '2023-01-01', 'u02', DATE '2023-01-02')`,

    `INSERT INTO QUALIFYING (season, trackname, round) VALUES (2026, 'silverstone', 1)`,
    `INSERT INTO QUALIFYING (season, trackname, round) VALUES (2026, 'monaco', 1)`,

    `INSERT INTO PRACTICE (season, trackname, round) VALUES (2026, 'silverstone', 1)`,
    `INSERT INTO PRACTICE (season, trackname, round) VALUES (2026, 'monaco', 1)`,

    `INSERT INTO SPRINT (season, trackname) VALUES (2026, 'silverstone')`,
    `INSERT INTO SPRINT (season, trackname) VALUES (2026, 'monaco')`,

    `INSERT INTO RESULT (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) VALUES ('hamilton', 2, 1, TO_DSINTERVAL('0 01:35:20'), 2026, 'silverstone', 'd01')`,
    `INSERT INTO RESULT (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) VALUES ('verstappen', 1, 2, TO_DSINTERVAL('0 01:36:15'), 2026, 'monaco', 'd02')`
];

module.exports = {
    tableCreations,
    deleteStatements,
    demoInsertStatements
}
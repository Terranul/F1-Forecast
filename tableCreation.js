const tableCreations = [
    `CREATE TABLE TESTING (
    id NUMBER PRIMARY KEY
)`,

    `CREATE TABLE APP_USER (
    app_userid VARCHAR2(25),
    dateoffirstprediction DATE,
    user_name VARCHAR2(50),
    streak INTEGER,
    password NUMBER,
    acc VARCHAR2(50)
    CONSTRAINT APP_USER_FK FOREIGN KEY (acc) REFERENCES SCORE(acc)
    CONSTRAINT APP_USER_PK PRIMARY KEY (app_userid)
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
    driverid VARCHAR2(5),
    accumulatedpoints INTEGER,
    drivernumber INTEGER,
    firstname VARCHAR2(25),
    lastname VARCHAR2(25),
    nationality VARCHAR2(25),
    teamid VARCHAR2(25),
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

`CREATE TABLE CATEGORY (
    categoryid VARCHAR2(5),
    name VARCHAR2(50),
    CONSTRAINT CATEGORY_PK PRIMARY KEY (categoryid)
)`,

`CREATE TABLE RESULT (
    driveroftheday VARCHAR2(50),
    pitstops INTEGER,
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(5) NOT NULL,
    CONSTRAINT RESULT_PK_BASE PRIMARY KEY (position, season, trackname),
    CONSTRAINT RESULT_FK_RACE_SESSION_BASE FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT RESULT_FK_DRIVER_BASE FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE
)`,

`CREATE TABLE TAKEPART (
    season NUMBER,
    trackname VARCHAR2(50),
    driverid VARCHAR2(5)
    CONSTRAINT TAKEPART_PK PRIMARY KEY (season, trackname, driverid),
    CONSTRAINT TAKEPART_FK_RACE_SESSION FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT TAKEPART_FK_DRIVER FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE
)`,

    `CREATE TABLE PREDICTION (
    predictionid VARCHAR2(5),
    categoryid VARCHAR2(5),
    prediction_value VARCHAR2(10),
    odds_value NUMBER,
    date_filed DATE NOT NULL,
    time_filed TIMESTAMP(6) NOT NULL,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(5),
    app_userid VARCHAR2(25),
    CONSTRAINT PREDICTION_PK PRIMARY KEY (predictionid),
    CONSTRAINT PREDICTION_FK_CATE FOREIGN KEY (categoryid) REFERENCES CATEGORY(categoryid) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_DRVR FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_SESS FOREIGN KEY (season, trackname) REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_USER FOREIGN KEY (app_userid) REFERENCES APP_USER(app_userid) ON DELETE CASCADE
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
    user2id VARCHAR2(25),
    CONSTRAINT FRIEND_FK_USER1 FOREIGN KEY (user1id) REFERENCES APP_USER(app_userid) ON DELETE CASCADE,
    CONSTRAINT FRIEND_FK_USER2 FOREIGN KEY (user2id) REFERENCES APP_USER(app_userid) ON DELETE CASCADE,
    CONSTRAINT FRIEND_PK PRIMARY KEY (user1id, user2id)
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
    qualifyingdate NUMBER,
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
     

`CREATE TABLE SPRINT_RESULT (
    type VARCHAR2(10), 
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
    `DROP TABLE FRIEND CASCADE CONSTRAINTS`,
    `DROP TABLE PREDICTION CASCADE CONSTRAINTS`,
    `DROP TABLE RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE QUALIFYING CASCADE CONSTRAINTS`,
    `DROP TABLE SPRINT CASCADE CONSTRAINTS`,
    `DROP TABLE PRACTICE CASCADE CONSTRAINTS`,
    `DROP TABLE RACE CASCADE CONSTRAINTS`,
    `DROP TABLE DRIVER CASCADE CONSTRAINTS`,
    `DROP TABLE TEAM CASCADE CONSTRAINTS`,
    `DROP TABLE SCORE CASCADE CONSTRAINTS`,
    `DROP TABLE RACE_SESSION CASCADE CONSTRAINTS`,
    `DROP TABLE CATEGORY CASCADE CONSTRAINTS`,
    `DROP TABLE APP_USER CASCADE CONSTRAINTS`,
    `DROP TABLE TESTING CASCADE CONSTRAINTS`, 
    `DROP TABLE SPRINT_RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE QUALI_RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE RACE_RESULT CASCADE CONSTRAINTS`,
    `DROP TABLE TAKEPART CASCADE CONSTRAINTS`,
];

const demoInsertStatements = [
    // APP_USER
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u01', DATE '2026-01-01', 'Alice', 5)`,
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u02', DATE '2026-01-02', 'Bob', 3)`,
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u03', DATE '2026-01-03', 'Charlie', 2)`,
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u04', DATE '2026-01-04', 'Diana', 4)`,
    `INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak) VALUES ('u05', DATE '2026-01-05', 'Edward', 1)`,

    // RACE_SESSION
    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'Silverstone', DATE '2026-03-01')`,
    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'Monaco', DATE '2026-03-15')`,
    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'Spa', DATE '2026-04-10')`,
    `INSERT INTO RACE_SESSION (season, trackname, sessiondate) VALUES (2026, 'Monza', DATE '2026-05-05')`,

    // TEAM
    `INSERT INTO TEAM (points, name, teamid, nationality) VALUES (150, 'Red Racers', 't01', 'USA')`,
    `INSERT INTO TEAM (points, name, teamid, nationality) VALUES (120, 'Blue Rockets', 't02', 'UK')`,
    `INSERT INTO TEAM (points, name, teamid, nationality) VALUES (130, 'Green Lightning', 't03', 'GER')`,
    `INSERT INTO TEAM (points, name, teamid, nationality) VALUES (110, 'Yellow Speed', 't04', 'FRA')`,
    `INSERT INTO TEAM (points, name, teamid, nationality) VALUES (140, 'Black Arrows', 't05', 'ITA')`,

    // DRIVER
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d01', 300, 33, 'Lewis', 'Hamilton', 'GBR', 't01', DATE '1985-01-07')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d02', 250, 44, 'Max', 'Verstappen', 'NED', 't02', DATE '1997-09-30')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d03', 280, 16, 'Charles', 'Leclerc', 'MON', 't03', DATE '1997-10-16')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d04', 200, 11, 'Sergio', 'Perez', 'MEX', 't02', DATE '1990-01-26')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d05', 180, 4, 'Lando', 'Norris', 'GBR', 't04', DATE '1999-11-13')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d06', 220, 3, 'Daniel', 'Ricciardo', 'AUS', 't04', DATE '1989-07-01')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d07', 240, 10, 'Pierre', 'Gasly', 'FRA', 't05', DATE '1996-02-07')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d08', 210, 14, 'Fernando', 'Alonso', 'ESP', 't03', DATE '1981-07-29')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d09', 230, 55, 'Carlos', 'Sainz', 'ESP', 't03', DATE '1994-09-01')`,
    `INSERT INTO DRIVER (driverid, accumulatedpoints, drivernumber, firstname, lastname, nationality, teamid, dateofbirth) VALUES ('d10', 195, 6, 'Nicholas', 'Latifi', 'CAN', 't05', DATE '1995-06-29')`,

    // SCORE
    `INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (1, 'u01', 100, 0)`,
    `INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (2, 'u02', 90, 5)`,
    `INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (3, 'u03', 80, 0)`,

    // CATEGORY
    `INSERT INTO CATEGORY (categoryid, name) VALUES ('c01', 'Race Winner')`,
    `INSERT INTO CATEGORY (categoryid, name) VALUES ('c02', 'Pole Position')`,
    `INSERT INTO CATEGORY (categoryid, name) VALUES ('c03', 'Fastest Lap')`,

    // PREDICTION
    `INSERT INTO PREDICTION (predictionid, categoryid, prediction_value, date_filed, time_filed, season, trackname, driverid, app_userid) VALUES ('p01', 'c01', 'd01', DATE '2026-03-05', TO_TIMESTAMP('2026-03-05 12:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'Silverstone', 'd01', 'u01')`,
    `INSERT INTO PREDICTION (predictionid, categoryid, prediction_value, date_filed, time_filed, season, trackname, driverid, app_userid) VALUES ('p02', 'c02', 'd02', DATE '2026-03-06', TO_TIMESTAMP('2026-03-06 14:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'Monaco', 'd02', 'u02')`,
    `INSERT INTO PREDICTION (predictionid, categoryid, prediction_value, date_filed, time_filed, season, trackname, driverid, app_userid) VALUES ('p03', 'c03', 'd03', DATE '2026-03-07', TO_TIMESTAMP('2026-03-07 15:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'Spa', 'd03', 'u03')`,

    // PREDICTIONSCORE
    `INSERT INTO PREDICTIONSCORE (predictionid, ranking, acc) VALUES ('p01', 1, 'u01')`,
    `INSERT INTO PREDICTIONSCORE (predictionid, ranking, acc) VALUES ('p02', 2, 'u02')`,
    `INSERT INTO PREDICTIONSCORE (predictionid, ranking, acc) VALUES ('p03', 3, 'u03')`,

    // FRIEND
    `INSERT INTO FRIEND (user1id, user2id) VALUES ('u01', 'u02')`,
    `INSERT INTO FRIEND (user1id, user2id) VALUES ('u01', 'u03')`,
    `INSERT INTO FRIEND (user1id, user2id) VALUES ('u02', 'u03')`,

    // RACE
    `INSERT INTO RACE (season, trackname) VALUES (2026, 'Silverstone')`,
    `INSERT INTO RACE (season, trackname) VALUES (2026, 'Monaco')`,
    `INSERT INTO RACE (season, trackname) VALUES (2026, 'Spa')`,

    // SPRINT
    `INSERT INTO SPRINT (season, trackname) VALUES (2026, 'Silverstone')`,
    `INSERT INTO SPRINT (season, trackname) VALUES (2026, 'Monaco')`,

    // QUALIFYING
    `INSERT INTO QUALIFYING (season, trackname, qualifyingdate) VALUES (2026, 'Silverstone', 1)`,
    `INSERT INTO QUALIFYING (season, trackname, qualifyingdate) VALUES (2026, 'Monaco', 1)`,

    // PRACTICE
    `INSERT INTO PRACTICE (season, trackname, round) VALUES (2026, 'Silverstone', 1)`,
    `INSERT INTO PRACTICE (season, trackname, round) VALUES (2026, 'Monaco', 1)`,

    // RESULT
    `INSERT INTO RESULT (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) VALUES ('Lewis Hamilton', 2, 1, TO_DSINTERVAL('0 01:35:20'), 2026, 'Silverstone', 'd01')`,
    `INSERT INTO RESULT (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) VALUES ('Max Verstappen', 1, 2, TO_DSINTERVAL('0 01:36:15'), 2026, 'Monaco', 'd02')`,

    // RACE_RESULT
    `INSERT INTO RACE_RESULT (type, pitstops, position, totaltime, season, trackname, driverid, teamid) VALUES ('Race', 2, 1, TO_DSINTERVAL('0 01:35:20'), 2026, 'Silverstone', 'd01', 't01')`,
    `INSERT INTO RACE_RESULT (type, pitstops, position, totaltime, season, trackname, driverid, teamid) VALUES ('Race', 1, 2, TO_DSINTERVAL('0 01:36:15'), 2026, 'Monaco', 'd02', 't02')`,

    // QUALI_RESULT
    `INSERT INTO QUALI_RESULT (type, position, season, trackname, driverid, teamid, q1time, q2time, q3time) VALUES ('Quali', 1, 2026, 'Silverstone', 'd01', 't01', TO_DSINTERVAL('0 00:25:10'), TO_DSINTERVAL('0 00:24:50'), TO_DSINTERVAL('0 00:24:30'))`,
    `INSERT INTO QUALI_RESULT (type, position, season, trackname, driverid, teamid, q1time, q2time, q3time) VALUES ('Quali', 2, 2026, 'Monaco', 'd02', 't02', TO_DSINTERVAL('0 00:25:20'), TO_DSINTERVAL('0 00:25:00'), TO_DSINTERVAL('0 00:24:40'))`,

    // SPRINT_RESULT
    `INSERT INTO SPRINT_RESULT (type, position, totaltime, season, trackname, driverid, teamid) VALUES ('Sprint', 1, TO_DSINTERVAL('0 00:35:50'), 2026, 'Silverstone', 'd01', 't01')`,
    `INSERT INTO SPRINT_RESULT (type, position, totaltime, season, trackname, driverid, teamid) VALUES ('Sprint', 2, TO_DSINTERVAL('0 00:36:10'), 2026, 'Monaco', 'd02', 't02')`
];
const testsql = [
`SELECT POSITION, FIRSTNAME || ' ' || LASTNAME AS FULLNAME
                 FROM RACE_RESULT NATURAL JOIN DRIVER NATURAL JOIN RACE_SESSION NATURAL JOIN PREDICTION`
];

module.exports = {
    tableCreations,
    deleteStatements,
    demoInsertStatements,
    testsql
}
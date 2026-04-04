DROP TABLE FRIEND CASCADE CONSTRAINTS;
DROP TABLE PREDICTIONSCORE CASCADE CONSTRAINTS;
DROP TABLE PREDICTION CASCADE CONSTRAINTS;
DROP TABLE CATEGORY CASCADE CONSTRAINTS;
DROP TABLE APP_USER CASCADE CONSTRAINTS;
DROP TABLE SCORE CASCADE CONSTRAINTS;

-- The below tables are populated by running JolpiApi which makes api requests to draw a large amount of data
-- Please don't uncomment these when you run the script unless it is necessary becuase the data collection would need
-- to be run again and it's an ugly process
-- If you need to drop these tables, there is a button on the frontend to initiate the repopulation process

-- DROP TABLE SPRINT_RESULT CASCADE CONSTRAINTS;
-- DROP TABLE QUALI_RESULT CASCADE CONSTRAINTS;
-- DROP TABLE RACE_RESULT CASCADE CONSTRAINTS;
-- DROP TABLE RESULT CASCADE CONSTRAINTS;

-- DROP TABLE PRACTICE CASCADE CONSTRAINTS;
-- DROP TABLE QUALIFYING CASCADE CONSTRAINTS;
-- DROP TABLE SPRINT CASCADE CONSTRAINTS;
-- DROP TABLE RACE CASCADE CONSTRAINTS;
-- DROP TABLE TAKEPART CASCADE CONSTRAINTS;

-- DROP TABLE DRIVER CASCADE CONSTRAINTS;
-- DROP TABLE TEAM CASCADE CONSTRAINTS;
-- DROP TABLE RACE_SESSION CASCADE CONSTRAINTS;

DROP TABLE TESTING CASCADE CONSTRAINTS;

CREATE TABLE TESTING (
    id NUMBER PRIMARY KEY
);

CREATE TABLE SCORE (
    ranking INTEGER,
    acc VARCHAR2(50),
    amount INTEGER,
    deductions INTEGER,
    CONSTRAINT SCORE_PK PRIMARY KEY (acc)
);

CREATE TABLE TEAM (
    points INTEGER,
    name VARCHAR2(50),
    teamid VARCHAR2(25),
    nationality VARCHAR2(50),
    CONSTRAINT TEAM_PK PRIMARY KEY (teamid)
);

CREATE TABLE CATEGORY (
    categoryid VARCHAR2(20),
    name VARCHAR2(100),
    CONSTRAINT CATEGORY_PK PRIMARY KEY (categoryid)
);

CREATE TABLE RACE_SESSION (
    season NUMBER,
    trackname VARCHAR2(50),
    sessiondate DATE,
    CONSTRAINT RACE_SESSION_PK PRIMARY KEY (season, trackname)
);

CREATE TABLE DRIVER (
    driverid VARCHAR2(25),
    accumulatedpoints INTEGER,
    drivernumber INTEGER,
    firstname VARCHAR2(25),
    lastname VARCHAR2(25),
    nationality VARCHAR2(25),
    teamid VARCHAR2(25),
    dateofbirth DATE,
    CONSTRAINT DRIVER_PK PRIMARY KEY (driverid),
    CONSTRAINT DRIVER_FK_TEAM 
        FOREIGN KEY (teamid) REFERENCES TEAM(teamid) ON DELETE CASCADE
);

CREATE TABLE APP_USER (
    app_userid VARCHAR2(25),
    dateoffirstprediction DATE,
    user_name VARCHAR2(50),
    streak INTEGER,
    password NUMBER,
    acc VARCHAR2(50),
    CONSTRAINT APP_USER_PK PRIMARY KEY (app_userid),
    CONSTRAINT APP_USER_FK 
        FOREIGN KEY (acc) REFERENCES SCORE(acc)
);

CREATE TABLE TAKEPART (
    season NUMBER,
    trackname VARCHAR2(50),
    driverid VARCHAR2(25),
    CONSTRAINT TAKEPART_PK PRIMARY KEY (season, trackname, driverid),
    CONSTRAINT TAKEPART_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT TAKEPART_FK_DRIVER 
        FOREIGN KEY (driverid) 
        REFERENCES DRIVER(driverid) ON DELETE CASCADE
);

CREATE TABLE RESULT (
    driveroftheday VARCHAR2(50),
    pitstops INTEGER,
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(25) NOT NULL,
    CONSTRAINT RESULT_PK_BASE 
        PRIMARY KEY (position, season, trackname),
    CONSTRAINT RESULT_FK_RACE_SESSION_BASE 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT RESULT_FK_DRIVER_BASE 
        FOREIGN KEY (driverid) 
        REFERENCES DRIVER(driverid) ON DELETE CASCADE
);

CREATE TABLE RACE (
    season NUMBER,
    trackname VARCHAR2(50),
    CONSTRAINT RACE_PK PRIMARY KEY (season, trackname),
    CONSTRAINT RACE_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
);

CREATE TABLE SPRINT (
    season NUMBER,
    trackname VARCHAR2(50),
    CONSTRAINT SPRINT_PK PRIMARY KEY (season, trackname),
    CONSTRAINT SPRINT_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
);

CREATE TABLE QUALIFYING (
    season NUMBER,
    trackname VARCHAR2(50),
    qualifyingdate NUMBER,
    CONSTRAINT QUALIFYING_PK PRIMARY KEY (season, trackname),
    CONSTRAINT QUALIFYING_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
);

CREATE TABLE PRACTICE (
    season NUMBER,
    trackname VARCHAR2(50),
    round NUMBER,
    CONSTRAINT PRACTICE_PK PRIMARY KEY (season, trackname, round),
    CONSTRAINT PRACTICE_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE
);

CREATE TABLE RACE_RESULT (
    type VARCHAR2(10),
    pitstops INTEGER,
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(25) NOT NULL,
    teamid VARCHAR2(25) NOT NULL,
    CONSTRAINT RACE_RESULT_PK 
        PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT RACE_RESULT_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT RACE_RESULT_FK_DRIVER 
        FOREIGN KEY (driverid) 
        REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT RACE_RESULT_FK_TEAM 
        FOREIGN KEY (teamid) 
        REFERENCES TEAM(teamid) ON DELETE CASCADE
);

CREATE TABLE QUALI_RESULT (
    type VARCHAR2(10),
    position INTEGER,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(25) NOT NULL,
    teamid VARCHAR2(25) NOT NULL,
    q1time INTERVAL DAY TO SECOND,
    q2time INTERVAL DAY TO SECOND,
    q3time INTERVAL DAY TO SECOND,
    CONSTRAINT QUALI_PK 
        PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT QUALI_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT QUALI_FK_DRIVER 
        FOREIGN KEY (driverid) 
        REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT QUALI_FK_TEAM 
        FOREIGN KEY (teamid) 
        REFERENCES TEAM(teamid) ON DELETE CASCADE
);

CREATE TABLE SPRINT_RESULT (
    type VARCHAR2(10),
    position INTEGER,
    totaltime INTERVAL DAY TO SECOND,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(25) NOT NULL,
    teamid VARCHAR2(25) NOT NULL,
    CONSTRAINT SPRINT_RESULT_PK 
        PRIMARY KEY (position, season, trackname, type),
    CONSTRAINT SPRINT_RESULT_FK_RACE_SESSION 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT SPRINT_RESULT_FK_DRIVER 
        FOREIGN KEY (driverid) 
        REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT SPRINT_RESULT_FK_TEAM 
        FOREIGN KEY (teamid) 
        REFERENCES TEAM(teamid) ON DELETE CASCADE
);

CREATE TABLE PREDICTION (
    predictionid VARCHAR2(5),
    categoryid VARCHAR2(20),
    prediction_value VARCHAR2(10),
    odds_value NUMBER,
    date_filed DATE NOT NULL,
    time_filed TIMESTAMP(6) NOT NULL,
    season NUMBER NOT NULL,
    trackname VARCHAR2(50) NOT NULL,
    driverid VARCHAR2(25),
    app_userid VARCHAR2(25),
    CONSTRAINT PREDICTION_PK PRIMARY KEY (predictionid),
    CONSTRAINT PREDICTION_FK_CATE 
        FOREIGN KEY (categoryid) REFERENCES CATEGORY(categoryid) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_DRVR 
        FOREIGN KEY (driverid) REFERENCES DRIVER(driverid) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_SESS 
        FOREIGN KEY (season, trackname) 
        REFERENCES RACE_SESSION(season, trackname) ON DELETE CASCADE,
    CONSTRAINT PREDICTION_FK_USER 
        FOREIGN KEY (app_userid) REFERENCES APP_USER(app_userid) ON DELETE CASCADE
);

CREATE TABLE PREDICTIONSCORE (
    predictionid VARCHAR2(5),
    ranking INTEGER,
    acc VARCHAR2(50),
    CONSTRAINT PREDICTIONSCORE_PK 
        PRIMARY KEY (predictionid, ranking, acc),
    CONSTRAINT PREDICTIONSCORE_FK_PRED 
        FOREIGN KEY (predictionid) 
        REFERENCES PREDICTION(predictionid) ON DELETE CASCADE,
    CONSTRAINT PREDICTIONSCORE_FK_SCORE 
        FOREIGN KEY (acc) 
        REFERENCES SCORE(acc) ON DELETE CASCADE
);

CREATE TABLE FRIEND (
    user1id VARCHAR2(25),
    user2id VARCHAR2(25),
    CONSTRAINT FRIEND_PK PRIMARY KEY (user1id, user2id),
    CONSTRAINT FRIEND_FK_USER1 
        FOREIGN KEY (user1id) REFERENCES APP_USER(app_userid) ON DELETE CASCADE,
    CONSTRAINT FRIEND_FK_USER2 
        FOREIGN KEY (user2id) REFERENCES APP_USER(app_userid) ON DELETE CASCADE
);

INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (1, 'Aliceacc', 100, 0);
INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (2, 'Bobacc', 80, 5);
INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (3, 'Charlieacc', 60, 10);
INSERT INTO SCORE (ranking, acc, amount, deductions) VALUES (3, 'Danaacc', 60, 10);

INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak, password, acc)
VALUES ('Alice!userid', TO_DATE('2026-01-01','YYYY-MM-DD'), 'Alice', 3, 1234, 'Aliceacc');

INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak, password, acc)
VALUES ('Bob!userid', TO_DATE('2026-02-15','YYYY-MM-DD'), 'Bob', 5, 2345, 'Bobacc');

INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak, password, acc)
VALUES ('Charlie!userid', TO_DATE('2026-03-10','YYYY-MM-DD'), 'Charlie', 2, 3456, 'Charlieacc');

INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak, password, acc)
VALUES ('Dana!userid', TO_DATE('2026-03-20','YYYY-MM-DD'), 'Dana', 1, 4567, 'Danaacc');

INSERT INTO FRIEND (user1id, user2id) VALUES ('Alice!userid', 'Bob!userid');
INSERT INTO FRIEND (user1id, user2id) VALUES ('Bob!userid', 'Charlie!userid');  
INSERT INTO FRIEND (user1id, user2id) VALUES ('Charlie!userid', 'Alice!userid');  
INSERT INTO FRIEND (user1id, user2id) VALUES ('Dana!userid', 'Bob!userid'); 
INSERT INTO FRIEND (user1id, user2id) VALUES ('Dana!userid', 'Alice!userid'); 

INSERT INTO CATEGORY (categoryid, name) 
VALUES ('driverodds', 'Odds for a given driver to win the race');

INSERT INTO CATEGORY (categoryid, name) 
VALUES ('teamraceodds', 'Odds for a given team to accumulate the most points in a race');

INSERT INTO CATEGORY (categoryid, name) 
VALUES ('podiumodds', 'Odds for a driver with podium finishes this season to finish off the podium');
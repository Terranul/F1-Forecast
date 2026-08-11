-- Used to test the validation process by setting up the db with results so you can run the updatePredictions function 
-- This will create a user called ValidationTestUser, sample results, and 3 predictions to represent each category
-- Make sure to delete the race_session that was inserted after running, as it will mess up the current session endpoint when running the regular db

INSERT INTO SCORE (ranking, acc, amount, deductions)
VALUES (1, 'validationTestUseracc', 20, 0);

INSERT INTO APP_USER (app_userid, dateoffirstprediction, user_name, streak, password, acc)
VALUES ('validationTestUser!userid', TO_DATE('2026-02-15','YYYY-MM-DD'), 'validationTestUser', 0, 0, 'validationTestUseracc');

INSERT INTO RACE_SESSION (season, trackname, sessiondate)
VALUES (2026, 'Test Grand Prix', SYSDATE + INTERVAL '2' HOUR);

-- for reference, I've rigged the data so the first and third predictions listed here will hit, while the second one will fail

INSERT INTO PREDICTION (
    PREDICTIONID,
    CATEGORYID,
    PREDICTION_VALUE,
    ODDS_VALUE,
    DATE_FILED,
    TIME_FILED,
    SEASON,
    TRACKNAME,
    DRIVERID,
    APP_USERID,
    WAGER,
    STATUS
)
VALUES (
   'testPrediction1', 'podiumodds', null, 2, SYSDATE - INTERVAL '2' HOUR, SYSTIMESTAMP, 2026, 'Test Grand Prix', 'Test Driver', 'validationTestUser!userid', 1, 'O' 
);

INSERT INTO PREDICTION (
    PREDICTIONID,
    CATEGORYID,
    PREDICTION_VALUE,
    ODDS_VALUE,
    DATE_FILED,
    TIME_FILED,
    SEASON,
    TRACKNAME,
    DRIVERID,
    APP_USERID,
    WAGER,
    STATUS
)
VALUES (
   'testPrediction2', 'teamraceodds', null, 2, SYSDATE - INTERVAL '2' HOUR, SYSTIMESTAMP, 2026, 'Test Grand Prix', 'Test Driver', 'validationTestUser!userid', 1, 'O' 
);

INSERT INTO PREDICTION (
    PREDICTIONID,
    CATEGORYID,
    PREDICTION_VALUE,
    ODDS_VALUE,
    DATE_FILED,
    TIME_FILED,
    SEASON,
    TRACKNAME,
    DRIVERID,
    APP_USERID,
    WAGER,
    STATUS
)
VALUES (
   'testPrediction3', 'driverodds', null, 2, SYSDATE - INTERVAL '2' HOUR, SYSTIMESTAMP, 2026, 'Test Grand Prix', 'Test Driver', 'validationTestUser!userid', 1, 'O' 
);

INSERT INTO TEAM (
    POINTS,
    NAME,
    TEAMID,
    NATIONALITY
)
VALUES (
    69, 'Test Team Racing', 'Test Team', 'Testarian'
);

INSERT INTO DRIVER (
    DRIVERID,
    ACCUMULATEDPOINTS,
    DRIVERNUMBER,
    FIRSTNAME,
    LASTNAME,
    NATIONALITY,
    TEAMID,
    DATEOFBIRTH
)
VALUES (
    'Test Driver', 50, 3, 'Test', 'Driver', 'Testarian',  'Test Team', null
);

INSERT INTO RACE_RESULT (
    TYPE,
    PITSTOPS,
    POSITION,
    TOTALTIME,
    SEASON,
    TRACKNAME,
    DRIVERID,
    TEAMID
)
VALUES (
    'RACE', 6, 2, null, 2026, 'Test Grand Prix', 'Test Driver', 'Test Team'
);



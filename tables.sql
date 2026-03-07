create table
    Category (
        category_id varchar(5),
        category_name varchar(25),
        sessionType varchar(12),
        primary key (category_id),
        unique (category_name)
    );

create table
    Prediction (
        predictionId varchar(5),
        prediction_value number not null,
        date_filed date not null,
        time_filed timestamp(6) not null,
        primary key (predictionId)
    );

create table
    UserAccount (
        user_id varchar(5),
        first_name varchar(10),
        last_name varchar(10),
        dateOfFirstPrediction date not null,
        streak number,
        primary key (user_id)
    );

create table
    Session (
        trackName varchar(50),
        season integer,
        sessionType varchar(20),
        primary key (trackName, season, sessionType),
        check (season > 1950)
    );

create table
    PracticeSession (
        trackName varchar(50),
        season integer,
        sessionType varchar(20) default 'Practice',
        practiceRound number,
        primary key (trackName, season, sessionType),
        foreign key (trackName, season, sessionType) references Session (trackName, season, sessionType),
        check (season > 1950),
        check (sessionType = 'Practice')
    );

create table
    QualifyingSession (
        trackName varchar(50),
        season integer,
        sessionType varchar(20) default 'Qualifying',
        qualifyingRound number,
        primary key (trackName, season, sessionType),
        foreign key (trackName, season, sessionType) references Session (trackName, season, sessionType),
        check (season > 1950),
        check (sessionType = 'Qualifying')
    );

create table
    SprintSession (
        trackName varchar(50),
        season integer,
        sessionType varchar(20) default 'Sprint',
        primary key (trackName, season, sessionType),
        foreign key (trackName, season, sessionType) references Session (trackName, season, sessionType),
        check (season > 1950),
        check (sessionType = 'Sprint')
    );

create table
    Race (
        trackName varchar(50),
        season integer,
        sessionType varchar(20) default 'Race',
        primary key (trackName, season, sessionType),
        foreign key (trackName, season, sessionType) references Session (trackName, season, sessionType),
        check (season > 1950),
        check (sessionType = 'Sprint')
    );

create table
    Description (
        category_name varchar(25),
        category_description varchar(50) not null,
        primary key (category_name),
        foreign key (category_name) references Category
    );

create table
    results (
        position number,
        totalTime timestamp(6),
        driver_of_the_day varchar(10),
        num_pitstops number,
        primary key (position, totalTime)
    );

create table
    Score (
        score_Id varchar(15),
        ranking number,
        Amount number,
        deductions number,
        predictionId varchar(5),
        primary key (score_Id),
        foreign key (predictionId) references Prediction (predictionId)
    );

create table
    PredictionCategory (
        category_id varchar(5),
        predictionId varchar(5),
        primary key (category_id, predictionId),
        foreign key (category_id) references Category (category_id),
        foreign key (predictionId) references Prediction (predictionId)
    );

create table
    PredictionForSession (
        predictionId varchar(5),
        season integer, --example 2025 for the 2025 f1season
        trackName varchar(50),
        primary key (predictionId, season, trackName),
        foreign key (predictionId) references Prediction (predictionId),
        foreign key (season, trackName) references check (season > 1950)
    );

create table
    PredictionMade (
        user_id varchar(5),
        predictionId varchar(5),
        primary key (predictionId),
        foreign key (predictionId) references Prediction (predictionId),
        foreign key (user_id) references UserAccount (user_id)
    );

create table
    PredictionForSession (
        predictionId varchar(5),
        trackName varchar(50),
        season integer,
        sessionType varchar(20),
        primary key (predictionId, trackName, season, sessionType),
        foreign key (predictionId) references Prediction (predictionId),
        foreign key (trackName, season, sessionType) references Session (trackName, season, sessionType),
        check (season > 1950)
    );



insert into UserAccount (user_id, first_name, last_name, dateOfFirstPrediction, streak)
values ('U001', 'Ben', 'Farone', DATE '2025-03-01', 4);

insert into UserAccount (user_id, first_name, last_name, dateOfFirstPrediction, streak)
values ('U002', 'Evelyne', 'Kosgei', DATE '2025-03-02', 7);

insert into UserAccount (user_id, first_name, last_name, dateOfFirstPrediction, streak)
values ('U003', 'Nelson', 'Mandel', DATE '2025-03-03', 2);

insert into UserAccount (user_id, first_name, last_name, dateOfFirstPrediction, streak)
values ('U004', 'Serena', 'Williams', DATE '2025-03-04', 5);

insert into UserAccount (user_id, first_name, last_name, dateOfFirstPrediction, streak)
values ('U005', 'Queen', 'Elizabeth', DATE '2022-09-01', 3);


-- Category

insert into Category (category_id, category_name)
values ('C001', 'Race Winner', 'Race');

insert into Category (category_id, category_name)
values ('C002', 'Pole Position', 'Qualyfying');

insert into Category (category_id, category_name)
values ('C003', 'Fastest Lap', 'Race');

insert into Category (category_id, category_name)
values ('C004', 'Podium Finish', 'Race');

insert into Category (category_id, category_name)
values ('C005', 'DriverOfDay', 'Race');

--Prediction
insert into Prediction (predictionId, prediction_value, date_filed, time_filed)
values ('P001', 25, DATE '2025-03-10', TIMESTAMP '2025-03-10 09:00:00');

insert into Prediction (predictionId, prediction_value, date_filed, time_filed)
values ('P002', 18, DATE '2025-03-10', TIMESTAMP '2025-03-10 09:15:00');

insert into Prediction (predictionId, prediction_value, date_filed, time_filed)
values ('P003', 15, DATE '2025-03-10', TIMESTAMP '2025-03-10 09:30:00');

insert into Prediction (predictionId, prediction_value, date_filed, time_filed)
values ('P004', 12, DATE '2025-03-10', TIMESTAMP '2025-03-10 09:45:00');

insert into Prediction (predictionId, prediction_value, date_filed, time_filed)
values ('P005', 10, DATE '2025-03-10', TIMESTAMP '2025-03-10 10:00:00');


-- Session

insert into Session (trackName, season, sessionType)
values ('Bahrain', 2025, 'Practice');

insert into Session (trackName, season, sessionType)
values ('Jeddah', 2025, 'Practice');

insert into Session (trackName, season, sessionType)
values ('Melbourne', 2025, 'Qualifying');

insert into Session (trackName, season, sessionType)
values ('Miami', 2025, 'Sprint');

insert into Session (trackName, season, sessionType)
values ('Monza', 2025, 'Race');

-- PracticeSession
-
insert into PracticeSession (trackName, season, sessionType, practiceRound)
values ('Bahrain', 2025, 'Practice', 1);

insert into PracticeSession (trackName, season, sessionType, practiceRound)
values ('Jeddah', 2025, 'Practice', 2);

insert into PracticeSession (trackName, season, sessionType, practiceRound)
values ('Suzuka', 2025, 'Practice', 1);

insert into PracticeSession (trackName, season, sessionType, practiceRound)
values ('Monaco', 2025, 'Practice', 2);

insert into PracticeSession (trackName, season, sessionType, practiceRound)
values ('Silverstone', 2025, 'Practice', 3);

-- parent rows needed for the 3 extra practice inserts
insert into Session (trackName, season, sessionType)
values ('Suzuka', 2025, 'Practice');

insert into Session (trackName, season, sessionType)
values ('Monaco', 2025, 'Practice');

insert into Session (trackName, season, sessionType)
values ('Silverstone', 2025, 'Practice');

-- QualifyingSession

insert into QualifyingSession (trackName, season, sessionType, qualifyingRound)
values ('Melbourne', 2025, 'Qualifying', 1);

insert into QualifyingSession (trackName, season, sessionType, qualifyingRound)
values ('Imola', 2025, 'Qualifying', 2);

insert into QualifyingSession (trackName, season, sessionType, qualifyingRound)
values ('Barcelona', 2025, 'Qualifying', 3);

insert into QualifyingSession (trackName, season, sessionType, qualifyingRound)
values ('Spa', 2025, 'Qualifying', 1);

insert into QualifyingSession (trackName, season, sessionType, qualifyingRound)
values ('Austin', 2025, 'Qualifying', 2);

-- parent rows needed
insert into Session (trackName, season, sessionType)
values ('Imola', 2025, 'Qualifying');

insert into Session (trackName, season, sessionType)
values ('Barcelona', 2025, 'Qualifying');

insert into Session (trackName, season, sessionType)
values ('Spa', 2025, 'Qualifying');

insert into Session (trackName, season, sessionType)
values ('Austin', 2025, 'Qualifying');


-- SprintSession

insert into SprintSession (trackName, season, sessionType)
values ('Miami', 2025, 'Sprint');

insert into SprintSession (trackName, season, sessionType)
values ('Shanghai', 2025, 'Sprint');

insert into SprintSession (trackName, season, sessionType)
values ('Spielberg', 2025, 'Sprint');

insert into SprintSession (trackName, season, sessionType)
values ('Interlagos', 2025, 'Sprint');

insert into SprintSession (trackName, season, sessionType)
values ('Qatar', 2025, 'Sprint');


insert into Session (trackName, season, sessionType)
values ('Shanghai', 2025, 'Sprint');

insert into Session (trackName, season, sessionType)
values ('Spielberg', 2025, 'Sprint');

insert into Session (trackName, season, sessionType)
values ('Interlagos', 2025, 'Sprint');

insert into Session (trackName, season, sessionType)
values ('Qatar', 2025, 'Sprint');


-- Race
-- Assumes Race(trackName, season, sessionType, raceId)
insert into Race (trackName, season, sessionType)
values ('Monza', 2025, 'Race');

insert into Race (raceId, trackName, season, sessionType)
values ('Baku', 2025, 'Race');

insert into Race (raceId, trackName, season, sessionType)
values ('Singapore', 2025, 'Race');

insert into Race (raceId, trackName, season, sessionType)
values ('Mexico', 2025, 'Race');

insert into Race (raceId, trackName, season, sessionType)
values ('AbuDhabi', 2025, 'Race');


insert into Session (trackName, season, sessionType)
values ('Baku', 2025, 'Race');

insert into Session (trackName, season, sessionType)
values ('Singapore', 2025, 'Race');

insert into Session (trackName, season, sessionType)
values ('Mexico', 2025, 'Race');

insert into Session (trackName, season, sessionType)
values ('AbuDhabi', 2025, 'Race');

-- -----------------------------------------
-- PredictionMade
-- -----------------------------------------
insert into PredictionMade (user_id, predictionId)
values ('U001', 'P001');

insert into PredictionMade (user_id, predictionId)
values ('U002', 'P002');

insert into PredictionMade (user_id, predictionId)
values ('U003', 'P003');

insert into PredictionMade (user_id, predictionId)
values ('U004', 'P004');

insert into PredictionMade (user_id, predictionId)
values ('U005', 'P005');

-- -----------------------------------------
-- PredictionCategory
-- -----------------------------------------
insert into PredictionCategory (category_id, predictionId)
values ('C001', 'P001');

insert into PredictionCategory (category_id, predictionId)
values ('C002', 'P002');

insert into PredictionCategory (category_id, predictionId)
values ('C003', 'P003');

insert into PredictionCategory (category_id, predictionId)
values ('C004', 'P004');

insert into PredictionCategory (category_id, predictionId)
values ('C005', 'P005');

-- -----------------------------------------
-- PredictionForSession
-- -----------------------------------------
insert into PredictionForSession (predictionId, trackName, season, sessionType)
values ('P001', 'Bahrain', 2025, 'Practice');

insert into PredictionForSession (predictionId, trackName, season, sessionType)
values ('P002', 'Melbourne', 2025, 'Qualifying');

insert into PredictionForSession (predictionId, trackName, season, sessionType)
values ('P003', 'Miami', 2025, 'Sprint');

insert into PredictionForSession (predictionId, trackName, season, sessionType)
values ('P004', 'Monza', 2025, 'Race');

insert into PredictionForSession (predictionId, trackName, season, sessionType)
values ('P005', 'Jeddah', 2025, 'Practice');

-- -----------------------------------------
-- Score
-- -----------------------------------------
insert into Score (score_Id, ranking, Amount, deductions, predictionId)
values ('S001', 1, 100, 5, 'P001');

insert into Score (score_Id, ranking, Amount, deductions, predictionId)
values ('S002', 2, 90, 3, 'P002');

insert into Score (score_Id, ranking, Amount, deductions, predictionId)
values ('S003', 3, 80, 2, 'P003');

insert into Score (score_Id, ranking, Amount, deductions, predictionId)
values ('S004', 4, 70, 4, 'P004');

insert into Score (score_Id, ranking, Amount, deductions, predictionId)
values ('S005', 5, 60, 1, 'P005');

-- -----------------------------------------
-- PredictionScore
-- -----------------------------------------
insert into PredictionScore (score_Id, predictionId)
values ('S001', 'P001');

insert into PredictionScore (score_Id, predictionId)
values ('S002', 'P002');

insert into PredictionScore (score_Id, predictionId)
values ('S003', 'P003');

insert into PredictionScore (score_Id, predictionId)
values ('S004', 'P004');

insert into PredictionScore (score_Id, predictionId)
values ('S005', 'P005');

-- -----------------------------------------
-- results
-- -----------------------------------------
insert into results (position, totalTime, driver_of_the_day, num_pitstops)
values (1, TIMESTAMP '2025-03-16 15:32:10', 'Lewis', 2);

insert into results (position, totalTime, driver_of_the_day, num_pitstops)
values (2, TIMESTAMP '2025-03-16 15:32:45', 'Max', 2);

insert into results (position, totalTime, driver_of_the_day, num_pitstops)
values (3, TIMESTAMP '2025-03-16 15:33:20', 'Charles', 1);

insert into results (position, totalTime, driver_of_the_day, num_pitstops)
values (4, TIMESTAMP '2025-03-16 15:34:05', 'Lando', 3);

insert into results (position, totalTime, driver_of_the_day, num_pitstops)
values (5, TIMESTAMP '2025-03-16 15:34:50', 'George', 2);

commit;
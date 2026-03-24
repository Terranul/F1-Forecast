/*
changes from tables.sql: 
- add on delete cascade to all foreign keys
- A couple of the 3nf decompositions didn't exist, so they were added here (TeamByDebut, TeamRef, DriverByDebut)
*/

delete from predictionscore;
delete from predictioncategory;
delete from friends;
delete from prediction;
delete from result;
delete from qualifying;
delete from sprint;
delete from practice;
delete from race;
delete from driver;
delete from driverbydebut;
delete from teamref;
delete from team;
delete from teambydebut;
delete from score;
delete from race_session;
delete from category;
delete from "user";

create table "user" (
    id varchar2(5),
    dateoffirstprediction date,
    name varchar2(50),
    streak integer,
    primary key (id, dateoffirstprediction)
);

create table race_session (
    season integer,
    trackname varchar2(50),
    sessiondate date,
    primary key (season, trackname)
);

create table teambydebut (
    teamid varchar2(5),
    dateofentrytof1 date,
    primary key (teamid)
);

create table team (
    points integer,
    name varchar2(50),
    teamid varchar2(5),
    primary key (points, name)
);

create table driverbydebut (
    name varchar2(50),
    dateofentrytof1 date,
    primary key (name)
);

create table driver (
    driverid varchar2(5),
    accumulatedpoints integer,
    points integer,
    name varchar2(50),
    namedebut varchar2(50),
    primary key (driverid),
    foreign key (points, name) references team(points, name) on delete cascade,
    foreign key (namedebut) references driverbydebut(name) on delete cascade
);

create table score (
    ranking integer,
    acc varchar2(50),
    amount integer,
    deductions integer,
    primary key (ranking, acc)
);

create table prediction (
    predictionid varchar2(5),
    date_filed date not null,
    time_filed timestamp(6) not null,
    season integer not null,
    trackname varchar2(50) not null,
    dateoffirstprediction date not null,
    id varchar2(5),
    primary key (predictionid),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade,
    foreign key (dateoffirstprediction, id) references "user"(dateoffirstprediction, id) on delete cascade
);

create table category (
    id varchar2(5),
    name varchar2(50),
    primary key (id)
);

create table predictioncategory (
    predictionid varchar2(5),
    id varchar2(5),
    primary key (predictionid, id),
    foreign key (predictionid) references prediction(predictionid) on delete cascade
);

create table predictionscore (
    predictionid varchar2(5),
    ranking integer,
    acc varchar2(50),
    primary key (predictionid, ranking, acc),
    foreign key (predictionid) references prediction(predictionid) on delete cascade,
    foreign key (ranking, acc) references score(ranking, acc) on delete cascade
);

create table friend (
    user1id varchar2(5),
    user2id varchar2(5),
    foreign key (user1id) references "user"(id) on delete cascade,
    foreign key (user2id) references "user"(id) on delete cascade
);

create table race (
    season integer,
    trackname varchar2(50),
    primary key (season, trackname),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade
);

create table sprint (
    season integer,
    trackname varchar2(50),
    primary key (season, trackname),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade
);

create table qualifying (
    season integer,
    trackname varchar2(50),
    round integer,
    primary key (season, trackname),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade
);

create table practice (
    season integer,
    trackname varchar2(50),
    round integer,
    primary key (season, trackname),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade
);

create table result (
    driveroftheday varchar2(50),
    pitstops integer,
    position integer,
    totaltime interval day to second,
    season integer not null,
    trackname varchar2(50) not null,
    driverid varchar2(5) not null,
    primary key (position, season, trackname),
    foreign key (season, trackname) references race_session(season, trackname) on delete cascade,
    foreign key (driverid) references driver(driverid) on delete cascade
);

create table teamref (
    points integer,
    name varchar2(50),
    teamid varchar2(5),
    primary key (points, name, teamid),
    foreign key (points, name) references team(points, name) on delete cascade,
    foreign key (teamid) references teambydebut(teamid) on delete cascade
);

insert into "user" (id, dateoffirstprediction, name, streak) values ('u01', date '2023-01-01', 'alice', 5);
insert into "user" (id, dateoffirstprediction, name, streak) values ('u02', date '2023-01-02', 'bob', 3);

insert into race_session (season, trackname, sessiondate) values (2026, 'silverstone', date '2026-03-01');
insert into race_session (season, trackname, sessiondate) values (2026, 'monaco', date '2026-03-15');

insert into teambydebut (teamid, dateofentrytof1) values ('t01', date '1950-05-13');
insert into teambydebut (teamid, dateofentrytof1) values ('t02', date '1960-07-01');

insert into team (points, name, teamid) values (120, 'redracers', 't01');
insert into team (points, name, teamid) values (95, 'speedstars', 't02');

insert into driverbydebut (name, dateofentrytof1) values ('hamilton', date '2007-03-18');
insert into driverbydebut (name, dateofentrytof1) values ('verstappen', date '2015-05-03');

insert into driver (driverid, accumulatedpoints, points, name, namedebut) values ('d01', 3000, 120, 'redracers', 'hamilton');
insert into driver (driverid, accumulatedpoints, points, name, namedebut) values ('d02', 2500, 95, 'speedstars', 'verstappen');

insert into race (season, trackname) values (2026, 'silverstone');
insert into race (season, trackname) values (2026, 'monaco');

insert into prediction (predictionid, date_filed, time_filed, season, trackname, dateoffirstprediction, id) values ('p01', date '2026-03-05', to_timestamp('2026-03-05 12:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'silverstone', date '2023-01-01', 'u01');
insert into prediction (predictionid, date_filed, time_filed, season, trackname, dateoffirstprediction, id) values ('p02', date '2026-03-06', to_timestamp('2026-03-06 14:00:00', 'yyyy-mm-dd hh24:mi:ss'), 2026, 'monaco', date '2023-01-02', 'u02');

insert into category (id, name) values ('c01', 'speed');
insert into category (id, name) values ('c02', 'strategy');

insert into predictioncategory (predictionid, id) values ('p01', 'c01');
insert into predictioncategory (predictionid, id) values ('p02', 'c02');

insert into score (ranking, acc, amount, deductions) values (1, 'a', 100, 0);
insert into score (ranking, acc, amount, deductions) values (2, 'b', 90, 5);

insert into predictionscore (predictionid, ranking, acc) values ('p01', 1, 'a');
insert into predictionscore (predictionid, ranking, acc) values ('p02', 2, 'b');

insert into friend (user1id, user2id) values ('u01', 'u02');

insert into qualifying (season, trackname, round) values (2026, 'silverstone', 1);
insert into qualifying (season, trackname, round) values (2026, 'monaco', 1);

insert into practice (season, trackname, round) values (2026, 'silverstone', 1);
insert into practice (season, trackname, round) values (2026, 'monaco', 1);

insert into sprint (season, trackname) values (2026, 'silverstone');
insert into sprint (season, trackname) values (2026, 'monaco');

insert into result (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) values ('hamilton', 2, 1, to_dsinterval('0 01:35:20'), 2026, 'silverstone', 'd01');
insert into result (driveroftheday, pitstops, position, totaltime, season, trackname, driverid) values ('verstappen', 1, 2, to_dsinterval('0 01:36:15'), 2026, 'monaco', 'd02');

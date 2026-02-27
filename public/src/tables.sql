create table Category_NameDesc (
    name varchar,
    description varchar,
    primary key name
    foreign key name references Category_NameId(name)
)

create table Category_NameSession (
    name varchar,
    sessionType varchar,
    foreign key name references Category_NameId(name)
    primary key name
)

create table Category_NameId (
    name varchar,
    id varchar,
    primary key id
)

create table  Category_IdDesc (
    id varchar,
    description varchar,
    primary key name
    foreign key name references Category_NameId(name)
)

create table Prediction (
    PredictionId varchar,
    predictionValue number,
    dateAndTimeFiled date,
    primary key PredictionId
)

create table PCHas (
    categoryId varchar,
    predictionId varchar,
    primary key (categoryId, predictionId)
)

create table PredictionFor (
    predictionValue number,
    dateFiled date,
    predictionId varchar,
    season varchar,
    trackName varchar,
    primary key (predictionId, season, trackName)
    foreign key predictionId references Prediction(predictionId)
)

create table PredictionMakes (
    predictionValue number,
    dateFiled date,
    predictionId varchar,
    dateOfFirstPrediction date
    primary key predictionId
    foreign key predictionId references Prediction(predictionId)
)

create table PHas (
    ranking number,
    acc varchar,
    predictionId varchar
    primary key (ranking, acc, predictionId)
    foreign key predictionId references Prediction(predictionId)
)

 create table Scores (
    acc varchar, 
    ranking number,
    amount number,
    deductions number,
    primary key (acc, ranking)
 )

create table Practice(
    practiceRound number,
    trackName varchar,
    season varchar,
    primary key (practiceRound)
    foreign key (trackName, season) references Session(trackName, season)
)

create table Qualifying (
    qualifyingRound number,
    trackName varchar,
    season varchar,
    foreign key (trackName, season) references Session(trackName, season)
    primary key qualifyingRound
)

create table Sprint (
    SprintId varchar,
    trackName varchar, 
    season varchar,
    primary key SprintId
    foreign key (trackName, season) references Session(trackName, season)
)

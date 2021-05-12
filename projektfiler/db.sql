DROP TABLE IF EXISTS Sections;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Nominations;
DROP TABLE IF EXISTS Votes;
DROP VIEW IF EXISTS winnersPerSection;
DROP VIEW IF EXISTS totalVotesPerSectionAndVotee;
--DELETE FROM Votes;
--DELETE FROM Sections;
--DELETE FROM Users;
--DELETE FROM Nominations;
--create tables
CREATE TABLE IF NOT EXISTS "Sections" (
    "section" TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS "Users" (
    "user" CHAR(20) PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS "Nominations" (
    "user"  CHAR(20) NOT NULL,
    "section"   TEXT NOT NULL,
    FOREIGN KEY("user") REFERENCES "Users"("user") ON DELETE CASCADE,
    FOREIGN KEY("section") REFERENCES "Sections"("section") ON DELETE CASCADE,
    PRIMARY KEY("user", "section")
);
CREATE TABLE IF NOT EXISTS "Votes" (
	"id"	INTEGER,
	"stamp"	TIMESTAMP NOT NULL,
	"voter"	CHAR(20) NOT NULL,
	"votee"	CHAR(20) NOT NULL,
	"section"	TEXT NOT NULL,
    FOREIGN KEY ("votee","section") REFERENCES "Nominations"("user", "section") ON DELETE CASCADE,
	FOREIGN KEY("voter") REFERENCES "Users"("user") ON DELETE CASCADE,
    FOREIGN KEY("votee") REFERENCES "Users"("user") ON DELETE CASCADE,
    FOREIGN KEY("section") REFERENCES "Sections"("section") ON DELETE CASCADE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
--users in out channel
INSERT INTO Users VALUES ('219842729239248897');
INSERT INTO Users VALUES ('120209876625522690');
INSERT INTO Users VALUES ('260822488005476353');
INSERT INTO Users VALUES ('260115645696442371');
INSERT INTO Users VALUES ('496748730855456779');
INSERT INTO Users VALUES ('363008905271443457');
INSERT INTO Users VALUES ('823540261170839582');
--testing with best dude/dudettes
INSERT INTO Sections VALUES('best dude');
INSERT INTO Sections VALUES('best dudette');
--inserting nominations in order to vote
INSERT INTO Nominations VALUES ('120209876625522690','219842729239248897','best dude');
INSERT INTO Nominations VALUES ('496748730855456779','823540261170839582','best dude');
--testing voting for 2 different candidates for one section
--CURRENT_TIMESTAMP ger en sträng med strukturen YYYY-MM-DD-HH:MM:SS, verkar vara 2 timmar bakom vår tidzon, 13:00 ger 11:00 t.ex
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '219842729239248897', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '120209876625522690', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '260822488005476353', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '260115645696442371', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '496748730855456779', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '363008905271443457', '823540261170839582', 'best dude');
INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, '823540261170839582', '219842729239248897', 'best dude');
--views for querying
CREATE VIEW totalVotesPerSectionAndVotee AS SELECT section, votee, COUNT(votee) as votes FROM Votes GROUP BY section, votee; --groups votes by sections and votee
CREATE VIEW winnersPerSection AS SELECT section, votee, MAX(votes) as winner FROM totalVotesPerSectionAndVotee GROUP BY section; --takes the highest voted from above
SELECT * FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24);--takes all the votes from the latest 24 hours, strftime converts timestamps, %s turns it into seconds
--SELECT COUNT(votes) FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == $USERID) GROUP BY voter; --USERID being the variable in this query, returns the number of votes submitted the latest 24 hours by USERID
--INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, $VOTER, $VOTEE, $SECTION); --the default for registering a vote
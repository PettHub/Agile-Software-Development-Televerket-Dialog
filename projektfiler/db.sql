DROP VIEW IF EXISTS winnersPerSection;
DROP VIEW IF EXISTS totalVotesPerSectionAndVotee;
DELETE FROM Votes;
DELETE FROM Sections;
DELETE FROM Users;
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
--testing voting for 2 different candidates for one section
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
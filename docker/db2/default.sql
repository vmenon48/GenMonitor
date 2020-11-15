CREATE TABLE "GenPatient" (
id int,
username varchar(30),
hashedpassword varchar(50),
fhirid varchar(255),
practionerid int,
practionerfhirid varchar(255),
practionername varchar(30)
);

CREATE TABLE "GenPractitioner" (
practionerid int,
username varchar(30),
hashedpassword varchar(50),
practionerfhirid varchar(255),
practionername varchar(30)
);



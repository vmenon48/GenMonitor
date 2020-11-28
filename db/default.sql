CREATE TABLE "GenPatient" (
id int NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),

username varchar(30),
hashedpassword varchar(50),
fhirid varchar(255),
practionerid int,
practionerfhirid varchar(255),
practionername varchar(30)
);

CREATE TABLE "GenPractitioner" (
practionerid int NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),

username varchar(30),
hashedpassword varchar(50),
practionerfhirid varchar(255),
practionername varchar(30)
);



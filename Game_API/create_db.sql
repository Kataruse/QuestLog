CREATE TABLE "covers" (
	"cover_id"	INTEGER,
	"cover"	TEXT,
	PRIMARY KEY("cover_id")
);

CREATE TABLE "games" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"rating"	REAL,
	"rating_count"	INTEGER,
	"cover"	TEXT,
	"completion_time"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE "games_to_genre" (
	"game_id"	INTEGER NOT NULL,
	"genre"	TEXT NOT NULL,
	PRIMARY KEY("game_id","genre"),
	FOREIGN KEY("game_id") REFERENCES "games"("id")
);

CREATE TABLE "games_to_platforms" (
	"game_id"	INTEGER NOT NULL,
	"platform"	TEXT NOT NULL,
	PRIMARY KEY("game_id","platform")
);

CREATE TABLE "genres" (
	"genre_id"	INTEGER,
	"genre"	TEXT,
	PRIMARY KEY("genre_id")
);

CREATE TABLE "libraries" (
	"user_id"	INTEGER NOT NULL,
	"game_id"	INTEGER NOT NULL,
	PRIMARY KEY("user_id","game_id"),
	FOREIGN KEY("game_id") REFERENCES "games"("id"),
	FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE TABLE "platforms" (
	"platform_id"	INTEGER,
	"platform"	TEXT,
	PRIMARY KEY("platform_id")
);

CREATE TABLE "users" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT UNIQUE,
	"availability"	INTEGER,
	"password"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
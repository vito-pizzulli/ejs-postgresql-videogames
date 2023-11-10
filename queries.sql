CREATE TABLE videogames (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL UNIQUE,
	release_date DATE NOT NULL,
	rating DECIMAL(3,2) NOT NULL,
	image VARCHAR(100) NOT NULL
);

CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    videogame_id INTEGER REFERENCES videogames(id),
    CONSTRAINT game_platform_combination UNIQUE (name, videogame_id)
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    videogame_id INTEGER REFERENCES videogames(id),
    CONSTRAINT game_genre_combination UNIQUE (name, videogame_id)
);
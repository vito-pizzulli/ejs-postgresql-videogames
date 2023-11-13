import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import 'dotenv/config';
import session from "express-session";
import flash from "connect-flash";

const app = express();
const port = 3000;
const apiUrl = process.env.API_URL;
let searchDone = false;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(flash());

app.get("/", async (req, res) => {
    try {
        searchDone = true;
        const page = req.query.page;
        const search = req.query.search;
    
        if (page && !search) {
            const result = await axios.get(`${apiUrl}&page=${page}`);
            res.render("index.ejs", { result: result.data, currentPage: page , successMessage: req.flash('success'), errorMessage: req.flash('error'), searchDone: searchDone});

        } else if (page && search) {
            const result = await axios.get(`${apiUrl}&search=${search}&page=${page}`);
            res.render("index.ejs", { result: result.data, currentPage: page, searchedText: search, successMessage: req.flash('success'), errorMessage: req.flash('error'), searchDone: searchDone});

        } else {
            res.render("index.ejs", { successMessage: req.flash('success'), errorMessage: req.flash('error'), searchDone: false});
        }

        } catch (error) {
            console.log(error.response.data);
            res.status(500);
        }
    });

app.get("/library", async (req, res) => {
    const library = await db.query(
        "SELECT videogames.id AS id, videogames.title AS title, videogames.release_date AS release_date, videogames.rating AS rating, STRING_AGG(DISTINCT platforms.name, ', ') AS platforms, STRING_AGG(DISTINCT genres.name, ', ') AS genres, videogames.image AS image FROM videogames JOIN platforms ON videogames.id = platforms.videogame_id JOIN genres ON videogames.id = genres.videogame_id GROUP BY videogames.id, videogames.title, videogames.release_date, videogames.rating, videogames.image ORDER BY videogames.title"
    );
    res.render("library.ejs", { library: library.rows, successMessage: req.flash('success'), errorMessage: req.flash('error')});
});

app.post("/add", async (req, res) => {
    try {
        const title = req.body.title;
        const release_date = req.body.released;
        const rating = req.body.rating;
        const image = req.body.image;
        const platform = req.body.platform;
        const genres = JSON.parse(req.body.genres);
        let videogameId;

        const dbVideogame = await db.query(
            'SELECT * FROM videogames WHERE title = $1', [title]
        );

        if (dbVideogame.rows.length === 0) {
            const result = await db.query(
                'INSERT INTO videogames(title, release_date, rating, image) VALUES($1, $2, $3, $4) RETURNING id', [title, release_date, rating, image]
            );
            videogameId = result.rows[0].id;
        } else {
            videogameId = dbVideogame.rows[0].id;
        };

        const dbPlatform = await db.query(
            'SELECT * FROM platforms WHERE name = $1 AND id = $2', [platform, videogameId]
        );

        if (dbPlatform.rows.length === 0) {
            await db.query(
                'INSERT INTO platforms (name, videogame_id) VALUES ($1, $2)', [platform, videogameId]
            );
        };

        genres.forEach(async (genre) => {
            await db.query(
                'INSERT INTO genres (name, videogame_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [genre.name, videogameId]
            );
        });
        
        req.flash('success', 'Game successfully added to your library!');
        res.redirect("/");

    } catch (err) {
        console.error(err);
        req.flash('error', 'You have already added this game to your library.');
        res.redirect("/");
    }
});

app.post("/delete", async (req,res) => {
    try {
        const videogameId = req.body.videogameId;
        await db.query('DELETE FROM videogames WHERE id = $1', [videogameId]);
        req.flash('success', 'Game successfully deleted from your library!');
        res.redirect("/library");
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while deleting, please try again.');
        res.redirect("/library");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
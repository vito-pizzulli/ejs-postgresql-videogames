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
        const page = req.query.page;
        const search = req.query.search;
    
        if (page && !search) {
            const result = await axios.get(`${apiUrl}&page=${page}`);
            res.render("index.ejs", { result: result.data, currentPage: page , successMessage: req.flash('success'), errorMessage: req.flash('error')});

        } else if (page && search) {
            const result = await axios.get(`${apiUrl}&search=${search}&page=${page}`);
            res.render("index.ejs", { result: result.data, currentPage: page, searchedText: search, successMessage: req.flash('success'), errorMessage: req.flash('error') });

        } else {
            res.render("index.ejs", { successMessage: req.flash('success'), errorMessage: req.flash('error')});
        }

        } catch (error) {
            console.log(error.response.data);
            res.status(500);
        }
    });

app.get("/library", (req, res) => {
    res.render("library.ejs");
});

app.post("/add", async (req, res) => {
    try {
        const title = req.body.title;
        const release_date = req.body.released;
        const rating = req.body.rating;
        const image = req.body.image;

        const result = await db.query(
            'INSERT INTO videogames(title, release_date, rating, image) VALUES($1, $2, $3, $4)', [title, release_date, rating, image]
        );
        req.flash('success', 'Game added successfully to your library!');
        res.redirect("/");

    } catch (err) {
        console.error(err);
        req.flash('error', 'You have already added this game to your library.');
        res.redirect("/");

    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
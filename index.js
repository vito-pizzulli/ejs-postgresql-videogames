import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import 'dotenv/config';

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

app.get("/", async (req, res) => {
    try {
        const page = req.query.page;
        const search = req.query.search;
    
        if (page && !search) {
            const result = await axios.get(`${apiUrl}&page=${page}`);
            res.render("index.ejs", { result: result.data, currentPage: page});

        } else if (page && search) {
            const result = await axios.get(`${apiUrl}&search=${search}&page=${page}&ordering=-rating`);
            res.render("index.ejs", { result: result.data, currentPage: page, searchedText: search });

        } else {
            res.render("index.ejs");
        }

        } catch (error) {
            console.log(error.response.data);
            res.status(500);
        }
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
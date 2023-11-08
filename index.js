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

app.get("/", (req, res) => {
    res.render("index.ejs", {db: db});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
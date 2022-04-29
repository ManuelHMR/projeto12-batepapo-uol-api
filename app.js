import express from "express";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.listen(5000);
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
mongoClient.connect().then(() => {
    db = mongoClient.db("db-batepapo-uol");
})

let user;
let participants = [];
let mensages = [];

// app.post("/participants", async (req, res) => {
//     try{
//         wait 
//     }
// });

// app.get("/participants");

// app.post("/messages");

// app.get("/messages");

// app.post("/status");

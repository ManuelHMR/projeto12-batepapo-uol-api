import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

const app = express();
app.listen(5000);
app.use(express.json());
app.use(cors());
dotenv.config();

let db;

const mongoClient = new MongoClient(process.env.MONGO_URL);
await mongoClient.connect().then( () => {
    db = mongoClient.db("db-batepapo-uol");
}).catch( e => console.log("Database conection problem", e));

const participants = db.collection("participants");
const mensages = db.collection("mensages");

let user;

app.post("/participants", async (req, res) => {

    let userSchema = joi.object({
        name: joi.string().required()
    });
    let validation = userSchema.validate(req.body.name);
    if (!validation){
        res.sendStatus(422)
    }
    try{
        await participants.insertOne({
            name: req.body.name
        }).then(() => console.log(participants))
    }catch(e){console.log(e)}
});

// app.get("/participants");

// app.post("/messages");

// app.get("/messages");

// app.post("/status");

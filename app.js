import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
app.listen(5000);
app.use(express.json());
app.use(cors());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.MONGO_URL);
await mongoClient.connect().then( () => {
    db = mongoClient.db("db-batepapo-uol");
}).catch( err => console.log("Database conection problem", err));
const participants = db.collection("participants");
const messages = db.collection("messages");

app.post("/participants", async (req, res) => {
    let userSchema = joi.string().required();
    try{
        const validation = userSchema.validate(req.body.name);
        if (validation.error){
            res.sendStatus(422);
        }
        if(!validation.error){
            const checkUser = await participants.findOne({name: req.body.name});
            if(!checkUser){
                await participants.insertOne({
                    name: req.body.name
                });
                await messages.insertOne({
                    from: req.body.name,
                    to: "todos",
                    text: "entra na sala...",
                    type: "status",
                    time: dayjs().format('HH:MM:ss')
                });
                res.sendStatus(201)
            }
            if(checkUser){
                res.sendStatus(409)
            }
        }
    }catch(e){console.log(e)}
});

// app.get("/participants");

// app.post("/messages");

// app.get("/messages");

// app.post("/status");

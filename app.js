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

let userSchema = joi.string().required();
let messageSchema = joi.object({
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required()
});

app.post("/participants", async (req, res) => {
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
                const message = {
                    from: req.body.name,
                    to: "todos",
                    text: "entra na sala...",
                    type: "status",
                    time: dayjs().format('HH:MM:ss')
                };
                await messages.insertOne(message);
                res.sendStatus(201)
            }
            if(checkUser){
                res.sendStatus(409)
            }
        }
    }catch(e){console.log(e)}
});

app.get("/participants", async (req, res) => {
    try{
        const participantsList = await participants.find({}).toArray();
        res.status(200).send(participantsList)
    } catch (err) {
        res.status(500).send(err)
    }
});

app.post("/messages", async (req, res) => {
    const {to, text, type} = req.body;
    const from = req.headers.user;
    const validation = messageSchema.validate(req.body);
    //headersCheck
    try{
        if(validation.error){
            res.sendStatus(422);
        };
        if(!validation.error){
            const message = {
                from,
                to,
                text,
                type,
                time: dayjs().format('HH:MM:ss')
            }
            await messages.insertOne({message});
            res.sendStatus(201);
        }
    } catch(err){
        res.send(err)
    };
});

app.get("/messages", async (req, res) => {
    try{
        const messagesArr = await messages.find({}).toArray();
        res.send(messagesArr);
    } catch(err){
        res.send(err);
    };
});

// app.post("/status");

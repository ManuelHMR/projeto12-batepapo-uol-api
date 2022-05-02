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
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.valid("message", "private_message").required()
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
                    name: req.body.name,
                    lastStatus: dayjs().format('HH:MM:ss')
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
    const bodyValidation = messageSchema.validate(req.body);
    const headersValidation = await participants.findOne({name: req.headers.user});
    try{
        if(bodyValidation.error || !headersValidation){
            res.sendStatus(422);
        };
        if(!bodyValidation.error && headersValidation){
            const message = {
                from,
                to,
                text,
                type,
                time: dayjs().format('HH:MM:ss')
            }
            await messages.insertOne(message);
            res.sendStatus(201);
        }
    } catch(err){
        res.send(err)
    };
});

app.get("/messages", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    try{
        const messagesArr = await messages
        .find({$or: [{ to: 'Todos' }, { from: req.headers.user }, { to: req.headers.user }, {type: 'message'}]})
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();
        res.send(messagesArr.reverse());
    } catch(err){
        res.send(err);
    };
});

app.post("/status", async (req, res) => {
    try{
        const validation = await participants.findOne({name: req.headers.user});
        if(!validation){
            res.sendStatus(404);
        };
        if(validation){
            await participants.updateOne({name: req.headers.user}, {$set: {lastStatus: Date.now()}});
            res.sendStatus(200);
        }
    } catch (err) {
        res.send(err);
    }
});


async function deleteInativeUsers() {
    const now = Date.now();
    const usersArr = await participants.find({}).toArray();
    const inativeUsers = usersArr.filter( user => now - user.lastStatus >= 10000);
    inativeUsers.forEach(element => {
        participants.deleteOne({name: element.name})
        messages.insertOne({
            from: element.name,
            to: 'Todos',
            text: 'sai da sala',
            type: 'status',
            time: dayjs().format('HH:MM:ss')
         })    
    })
}

setInterval(deleteInativeUsers, 15000);
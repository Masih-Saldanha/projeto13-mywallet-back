import express, { json } from "express";
import cors from "cors";
// import { MongoClient, ObjectId } from "mongodb";
// import dayjs from "dayjs";
// import joi from "joi";
// import { stripHtml } from "string-strip-html";
import joi from "joi"
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';
import dotenv from "dotenv";

import db from "./db.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

app.post("/signup", async (req, res) => {
    // const { name, email, password, confirmPassword } = req.body;
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.ref("password")
    });
    const { error } = userSchema.validate(req.body);
    const isEmailOnList = await db.collection("users").findOne({ email: req.body.email })
    if (error || isEmailOnList) return res.sendStatus(422);

    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    try {
        await db.collection("users").insertOne({ ...req.body, password: passwordHash, confirmPassword: passwordHash });
        res.sendStatus(201);
    } catch (error) {
        console.log("Error in the account creation.", error);
        res.status(500).send("Error in the account creation.");
    }
})

app.post("/signin", async (req, res) => {
    // const { email, password } = req.body;
    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const { error } = userSchema.validate(req.body);
    if (error) return res.sendStatus(422);

    try {
        const user = await db.collection("users").findOne({ email: req.body.email });
        if (!user) return res.sendStatus(404);

        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = uuid();
            await db.collection("sessions").insertOne({ userId: user._id, token });
            const dataNeeded = { name: user.name, token: token };
            res.send(dataNeeded);
        } else {
            res.sendStatus(404); // not found
        }
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
})

app.post("/transaction", async (req, res) => {
    // const { date, value, description } = req.body;
    const userSchema = joi.object({
        date: joi.number().integer().required(),
        value: joi.number().required(),
        description: joi.string().required()
    });
    const { error } = userSchema.validate(req.body);
    if (error) return res.sendStatus(422);

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "").trim();
    if (!token) return res.sendStatus(401);
    try {
        const session = await db.collection("sessions").findOne({ token });

        if (!session) return res.sendStatus(401);

        const user = await db.collection("users").findOne({ _id: session.userId })

        if (!user) return res.sendStatus(404);

        // const transactions = await db.collection("wallet").findOne({ userId: user._id });

        // await db.collection("wallet").updateOne({ userId: user._id }, { $set: });

        const userData = await db.collection("wallet").findOne({ userId: session.userId });
        if (!userData) {
            await db.collection("wallet").insertOne({ userId: session.userId, transactions: [req.body] });
        } else {
            await db.collection("wallet").updateOne({ userId: session.userId }, { $set: { transactions: [...userData.transactions, req.body] } });
        }

        res.sendStatus(201);
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
})

app.get("/historic", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "").trim();

    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection("sessions").findOne({ token });

        if (!session) return res.sendStatus(401);

        const user = await db.collection("users").findOne({ _id: session.userId })

        if (!user) return res.sendStatus(404);

        const transactions = await db.collection("wallet").findOne({ userId: user._id });
        if (!transactions) return res.send([]);

        res.send(transactions.transactions);
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
})

app.listen(process.env.PORT || 5000, () => {
    console.log(`Servidor ligado na porta ${process.env.PORT}`)
})
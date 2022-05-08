import { Router } from "express";
import joi from "joi"

import db from "./../db.js";

const walletRouter = Router();

walletRouter.post("/transaction", async (req, res) => {
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

walletRouter.get("/historic", async (req, res) => {
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

export default walletRouter;
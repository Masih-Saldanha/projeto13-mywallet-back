import { Router } from "express";
import joi from "joi"
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

import db from "./../db.js";

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
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

authRouter.post("/signin", async (req, res) => {
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

export default authRouter;
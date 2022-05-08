import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

import db from "./../db.js";

export async function signUp(req, res) {
    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    try {
        await db.collection("users").insertOne({ ...req.body, password: passwordHash, confirmPassword: passwordHash });
        res.status(201).send("User created successfully!");
    } catch (error) {
        console.log("Error in the account creation.", error);
        res.status(500).send("Error in the account creation.");
    }
}

export async function signIn(req, res) {
    try {
        const user = await db.collection("users").findOne({ email: req.body.email });
        if (!user) return res.status(404).send("User not found.");

        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = uuid();
            await db.collection("sessions").insertOne({ userId: user._id, token });
            const dataNeeded = { name: user.name, token: token };
            res.send(dataNeeded);
        } else {
            res.status(401).send("Wrong password, try again.");; // not found
        }
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
}

export async function signOut(req, res) {
    const { session } = res.locals
    
    try {
        await db.collection("sessions").deleteOne({ token: session.token });
        res.status(200).send("Session finished");
    } catch (error) {
        console.log("Error deleting session.", error);
        res.status(500).send("Error deleting session.");
    }
}
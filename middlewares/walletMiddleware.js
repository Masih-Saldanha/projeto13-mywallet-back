import joi from "joi";

import db from "./../db.js";

export async function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "").trim();
    if (!token) return res.status(401).send("Token not found.");
    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.status(401).send("Session not found.");
        const user = await db.collection("users").findOne({ _id: session.userId })
        if (!user) return res.status(404).send("User not found.");

        res.locals.session = session;
        res.locals.user = user;
        next();
    } catch (error) {
        console.log("Error on Token validation.", error);
        res.status(500).send("Error on Token validation.");
    }
}

export async function transactionJoiValidation(req, res, next) {
    // const { date, value, description } = req.body;
    const userSchema = joi.object({
        date: joi.number().integer().required(),
        value: joi.number().required(),
        description: joi.string().required()
    });
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(422).send("Wrong data, fill it again.");
    
    next();
}
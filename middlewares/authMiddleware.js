import joi from "joi"

import db from "./../db.js";

export async function signUpJoiValidation(req, res, next) {
    // const { name, email, password, confirmPassword } = req.body;
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.ref("password")
    });
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(422).send("Wrong data, fill it again.");

    const isEmailOnList = await db.collection("users").findOne({ email: req.body.email });
    if (isEmailOnList) return res.status(422).send("Already existing email on DataBase, try another one.");

    next();
}

export async function signInJoiValidation(req, res, next) {
    // const { email, password } = req.body;
    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(422).send("Wrong data, fill it again.");

    next();
}
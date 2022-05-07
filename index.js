import express, { json } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
// import dayjs from "dayjs";
// import joi from "joi";
// import { stripHtml } from "string-strip-html";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const app = express();
app.use(cors());
app.use(json());

app.listen(process.env.PORT || 5000, () => {
    console.log(`Servidor ligado na porta ${process.env.PORT}`)
})
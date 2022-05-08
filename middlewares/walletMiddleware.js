import db from "../db.js";

export async function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "").trim();
    if (!token) return res.sendStatus(401);
    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.sendStatus(401);
        const user = await db.collection("users").findOne({ _id: session.userId })
        if (!user) return res.sendStatus(404);

        res.locals.session = session;
        res.locals.user = user;
        next();
    } catch (error) {
        console.log("Error on Token validation.", error);
        res.status(500).send("Error on Token validation.");
    }
}
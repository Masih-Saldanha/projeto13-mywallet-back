import db from "./../db.js";

export async function transaction(req, res) {
    const { session } = res.locals
    try {
        const userData = await db.collection("wallet").findOne({ userId: session.userId });
        if (!userData) {
            await db.collection("wallet").insertOne({ userId: session.userId, transactions: [req.body] });
        } else {
            await db.collection("wallet").updateOne({ userId: session.userId }, { $set: { transactions: [...userData.transactions, req.body] } });
        }
        res.status(201).send("Transaction registered successfully.");
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
}

export async function historic(req, res) {
    const { user } = res.locals
    try {
        const transactions = await db.collection("wallet").findOne({ userId: user._id });
        if (!transactions) return res.send([]);
        res.send(transactions.transactions);
    } catch (error) {
        console.log("Error logging in user.", error);
        res.status(500).send("Error logging in user.");
    }
}
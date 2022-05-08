import { Router } from "express";

import { historic, transaction } from "../controllers/walletController.js";

const walletRouter = Router();

walletRouter.post("/transaction", transaction);

walletRouter.get("/historic", historic);

export default walletRouter;
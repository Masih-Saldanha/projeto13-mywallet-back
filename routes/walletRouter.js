import { Router } from "express";

import { historic, transaction } from "../controllers/walletController.js";
import { validateToken } from "../middlewares/walletMiddleware.js";

const walletRouter = Router();

walletRouter.use(validateToken);

walletRouter.post("/transaction", transaction);

walletRouter.get("/historic", historic);

export default walletRouter;
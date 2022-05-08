import { Router } from "express";

import { historic, transaction } from "./../controllers/walletController.js";
import { validateToken, transactionJoiValidation } from "./../middlewares/walletMiddleware.js";

const walletRouter = Router();

walletRouter.use(validateToken);

walletRouter.post("/transaction", transactionJoiValidation, transaction);

walletRouter.get("/historic", historic);

export default walletRouter;
import { Router } from "express";

import { signIn, signOut, signUp } from "./../controllers/authController.js";
import { signInJoiValidation, signUpJoiValidation } from "./../middlewares/authMiddleware.js";
import { validateToken } from "./../middlewares/walletMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", signUpJoiValidation, signUp);

authRouter.post("/signin", signInJoiValidation, signIn);

authRouter.delete("/signout", validateToken, signOut);

export default authRouter;
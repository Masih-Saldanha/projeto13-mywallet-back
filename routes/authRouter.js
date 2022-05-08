import { Router } from "express";

import { signIn, signUp } from "./../controllers/authController.js";
import { signInJoiValidation, signUpJoiValidation } from "./../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", signUpJoiValidation, signUp);

authRouter.post("/signin", signInJoiValidation, signIn);

export default authRouter;
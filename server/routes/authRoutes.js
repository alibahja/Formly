import { Router} from "express";
import {logout,register,login, me} from '../controllers/authController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";

const authRouter=Router();

authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.get('/me',authMiddleware,me)

export default authRouter;
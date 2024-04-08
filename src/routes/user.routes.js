import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// router.route("/register").post(registerUser)
// ie, http://localhost:8000/api/v1/users/register

// router.route("/login").post(loginUser)
// ie, http://localhost:8000/api/v1/users/login

router.route("/register").post(registerUser)



export default router;

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// router.route("/register").post(registerUser)
// ie, http://localhost:8000/api/v1/users/register

// router.route("/login").post(loginUser)
// ie, http://localhost:8000/api/v1/users/login

// injecting the multer middleware so that these two fields get to us before registering the user

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

export default router;

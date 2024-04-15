// Purpose of this middleware: To verify if the user exists or not

// This middleware function, verifyJWT, is designed to ensure the validity of a JSON Web Token (JWT) included in incoming requests. It serves the purpose of authenticating users and granting access to protected routes or resources only to authenticated users.

// The main functionalities of this middleware are as follows:

// 1. Extract Token: It attempts to extract the JWT from either the cookies or the Authorization header of the incoming request.

// 2. Token Validation: If a token is present, it validates the token using the provided ACCESS_TOKEN_SECRET. If the token is invalid or expired, it throws an unauthorized error.

// 3. User Verification: After successfully validating the token, it extracts the user ID from the decoded token and attempts to find the corresponding user in the database.

// 4. User Assignment: If the user is found, it assigns the user object to the req object for future use in downstream middleware or route handlers.

// 5. Error Handling: Any errors that occur during this process are caught and handled by throwing an ApiError with an appropriate status code and message.

// Overall, this middleware enhances the security of the application by ensuring that routes protected by JWT authentication only allow access to authenticated users with valid tokens.

import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// many a times, in our code we may use "req" and "next" but not "res"... in that case, in standard practice we replace the res with "_" and write "(req, _, next)"
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // extracting token from either Cookies or Authorization header
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request!");
        }

        // verifying the token using the ACCESS_TOKEN_SECRET
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // finding user by ID extracted from decoded token
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token!");
        }

        // assigning user object to req for future use in routes
        req.user = user;

        // calling the next middleware
        next();
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token!");
    }
});

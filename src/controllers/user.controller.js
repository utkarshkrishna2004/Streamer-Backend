import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //--> How to get a user registered?

    // Step 1: Get user details from frontend
    // Step 2: Validation - eg, not empty fields
    // Step 3: Check if user already exists: username & email
    // Step 4: Check for images, check for avatar
    // Step 5: Upload them to cloudinary, check for avatar again
    // Step 6: Create user object - create entry in DB
    // Step 7: Remove Password & Refresh Token field from response
    // Step 8: Check for user creation
    // Step 9: Return the response

    

    // Step 1: Get user details from frontend
    const { fullname, email, username, password } = req.body;
    console.log("fullname :", fullname);

    // Step 2: Validation - eg, not empty fields
    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required!");
    }

    // Step 3: Check if user already exists: username & email
    const existingUser = User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "User with same email or username already exists!"
        );
    }

    // Step 4: Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!");
    }

    // Step 5: Upload them to cloudinary, check for avatar again
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!");
    }

    // Step 6: Create user object - create entry in DB
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Step 7: Remove Password & Refresh Token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Step 8: Check for user creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user!"
        );
    }

    // Step 9: Return the response
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully!")
        );
});

export { registerUser };

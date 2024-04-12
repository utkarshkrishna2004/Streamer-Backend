import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessandRefreshTokens = async (userId) => {
    try {
        // if we want to generate tokens for a user, we first need to find the user
        const user = await User.findById(userId);

        // now when we found the user, we need to generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // we provide the user with the access token but we keep refresh token saved in our DB too so that the user don't have to input his password so frequently

        // whenever we try to save something, the mongoose models fire up, thus, all the required fields (like, password) start asking for mandatory inputs, but here we only want to add and update only one field, to overcome this issue we use "validateBeforeSave: false"
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // now, we have the "refresh token", the "access token", and, the refresh token has been saved into the DB too
        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating Refresh and Access Tokens!"
        );
    }
};

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

    // Step 2: Validation - eg, not empty fields
    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required!");
    }

    // Step 3: Check if user already exists: username & email
    const existingUser = await User.findOne({
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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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

const loginUser = asyncHandler(async (req, res) => {
    //--> How to get a user logged in?
    // Step 1: Get user details from frontend (req body -> data)
    // Step 2: Take username or email for authentication
    // Step 3: Find the user in the DB
    // Step 4: If the user exists then do a password check
    // Step 5: Generate Access and Refresh Token
    // Step 6: Send the tokens to cookies
    // Step 7: Send a response of successful login


    // Step 1: Get user details from frontend (req body -> data)
    const { email, username, password } = req.body;

    // Step 2: Take username or email for authentication
    if (!username || !email) {
        throw new ApiError(400, "username or email is required!");
    }

    // Step 3: Find the user in the DB with the email or username
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exist!");
    }

    // Step 4: If the user exists then do a password check
    // User -> which exists in the DB
    // user -> an instance of a user object created from the 'User'
    // password -> extracted from req.body
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials!");
    }

    // Step 5: Generate Access and Refresh Token
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
        user._id
    );

    // Step 6: Send the tokens to cookies &
    // Step 7: Send a response of successful login
    // Reason to make another DB query here is that the first time we fetched the user from the DB, it did not have any refreshToken field. However, later it received that field when we generated and saved the tokens. To ensure we have the updated user object with the refreshToken included, we make another DB query.
    // After generating the access and refresh tokens for the user, we need to update the user object in the database with the refresh token. However, the user object fetched earlier did not include the refreshToken field.
    // To ensure that the user object returned to the client contains the updated refreshToken, we make another database query to fetch the updated user object.
    // Additionally, when sending the 'loggedInUser' response to the client, it's essential to prioritize security by excluding sensitive fields like 'password' and 'refreshToken'. This prevents sensitive information from being exposed to the client.
    // The 'select("-password -refreshToken")' syntax in the database query helps in excluding these fields from the response.
    const loggedInUser = User.findById(user._id).select(
        "-password -refreshToken"
    );

    // by default, our cookies can be seen & modified by anyone via the frontend, but as soon as we make "httpOnly: true", & "secure: true", these cookies then can only be modified from the server only
    const options = {
        httpOnly: true,
        secure: true,
    };

    // now we can set the cookies by chaining them with syntax ".cookie().cookie().cookie()..."
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully!"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //--> How to get a user logged out?

    // Step 1: Reset the refreshToken
    // Step 2: Remove the cookies of the user

    // The biggest problem is how to get the user logged out, like for example, in case of 'register' or 'login', we were taking the data from req.body and then were making a DB call, but for logout we cannot hand out the user an input field to put in the credentials for logging him out, as using that he can log out anyone.
    // To solve this, we need to design our own middleware

    // Step 1: Reset the refreshToken
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    // Step 2: Remove the cookies of the user
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

export { registerUser, loginUser, logoutUser };

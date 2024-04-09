import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // optimizes searching in Mongo DB
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        avatar: {
            type: String, // cloudinary url
            required: true,
            trim: true,
            index: true,
        },

        coverImage: {
            type: String,
        },

        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],

        password: {
            type: String,
            required: [true, "Password is required..!"],
        },

        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);



/*
--> TARGET🎯: whenever the data is getting saved, take the password field out, encrypt it, then save it.
--> We want to do some process just before the data gets "saved" into the DB. Thus, we're using "pre" ⬇️
*/
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next(); // if password is "not" modified, next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
/*
-> In " bcrypt.hash(this.password, 10) ", 10 represents the number of hashing rounds used in the bcrypt algorithm.
-> Also, we need to design this code in such a way so that whenever there's a change in the "password field" then only run this code and encrypt the password... Otherwise it may run everytime, say, when a user changes his cover image, etc!
-> That's why we wrote the if condition block ⬆️
*/



userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
//"password" here is the string that the user entered, and, the "this.password" the the encrypted/hashed password



/* 
--> TARGET🎯: Generating both JWT Tokens ⬇️
--> not used "async" since it is a very fast process
*/
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);

// require("dotenv").config({path: './env'});
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
});

connectDB();










// When you put the whole database connection code in the index.js file only!
// There is nothing wrong in this approach, it's just a little cluttered!

/* 
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on PORT ${process.env.PORT}`);
        });

    } catch (error) {
        console.log("ERROR: ", error);
        throw error;
    }
})();
*/

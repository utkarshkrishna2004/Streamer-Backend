// require("dotenv").config({path: './env'});

/*
-> Since our project begins from the index.js file, it is absolutely important to load all the env variables and make them available in the whole project. 
That's why we set up the env variables ASAP in the index file. 

-> There is nothing wrong in the approach commented in the top line of using the dotenv( it's just inconsistent ).., but now we can do it with import statements too, by just splitting the config code into two parts( I: import of dotenv & II: dotenv - config ) and enabling the experimental feature in the scripts of the package.json file. 
*/

import dotenv from "dotenv"; // Part I

import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
}); // Part II

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at PORT: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed...❌ ", error);
    });

/*
-> The code piece below can be used when you want put the whole database connection code in the " index.js " file only!

-> There is nothing wrong in this approach, it's just that the index file gets a little cluttered!

-> That's why we write the database connection code in a separate file, say " db/index.js " and then import that and execute it here ( connectDB() ) in the main " index.js " file.
*/

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

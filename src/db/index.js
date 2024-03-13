import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        /* For attempting DB connection, along with the DB_URI, we also need the DB_NAME (connected with a " / ")... 
        That's why we stored the name in the " constants.js " file and we imported it here and used it for the connection.
        */

        console.log(
            `\n MongoDB connected...✅ \n DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
};

export default connectDB;

/* 
-> Always remember, database is physically present usually in a different continent. Thus, it takes time for the data to reach us from the database. 
That's why it is absolutely important to use " async and await " while writing the DB connection code.

-> Also, there can be some conflicts while fetching data from the database. 
That's why it is absolutely important to use the " try and catch " block while attempting to connect to the DB.
*/

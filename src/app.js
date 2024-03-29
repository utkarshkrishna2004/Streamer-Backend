import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
// first we create the express app( app = express() ), then resolve the potential CORS conflicts
// " .use " is used for middlewares and configurations

app.use(express.json({ limit: "20kb" }));
// " express.json() " means I'm accepting json data in my express app, we can set some limits too if we want

app.use(express.urlencoded({ extended: true, limit: "20kb" }));
// there can be some conflicts while accepting a url, since different types of url encoders are used all over the internet...
//eg, we see " % " or " + " for " space " in urls, etc

app.use(express.static("public"));
// sometimes we want to store some files(say, images or PDFs) in a "public" folder in our app "temproarily" and then do some processes(say, uploading)

app.use(cookieParser());
// at times, we want to access the cookies of our user's browser from our servers and also set it...
// basically, it allows us to perform CRUD operations on user's cookies

export { app };

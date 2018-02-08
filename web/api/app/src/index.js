import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Promise from "bluebird";

import auth from "./routes/auth";
import users from "./routes/users";
import books from "./routes/books";
import test from "./routes/test";

dotenv.config();
const app = express();
const port = 80;
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
const mongoUrl = process.env.MONGODB_URL;
// const mongoUrl = "mongodb://mongodb/your_db";
mongoose.Promise = Promise;
// mongoose.connect(mongoUrl, { useMongoClient: true });
mongoose.connect(mongoUrl);

app.get("/api/info", (req, res) => {
  res.json({
  	mongoUrl,
  	ready: mongoose.connection.readyState
  })
});

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/books", books);
app.use("/api/test", test);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => console.log(`Running on localhost:${port}`));

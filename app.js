
import createError from "http-errors";
import express from "express";
import {dirname} from "path";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan"
import { fileURLToPath } from "url";
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/users.js";
import "dotenv/config"
import connectDB from "./db/config.js";
import cors from "cors";
// import passport from "./middleware/passport.js"
import passport, { isAuthenticated } from "./middleware/passport.js";
import userPublic from "./routes/userPublic.js";
const PORT=process.env.PORT
const __filename=fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);



var app = express();
app.use(cors())
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: "100mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "100mb",
    parameterLimit: 1000000,
  })
);

connectDB();

app.use('/api/admin',isAuthenticated, adminRouter);
app.use('/api/users',isAuthenticated, userRouter);
app.use("/api/public/auth",userPublic)
// app.use("/",(req,res)=>{
//   return res.status(200).json({"isSuccess":true,"message":"Server is running"})
// })

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
 res.status(err.status || 500).json({
  message: err.message || "Internal Server Error",
    isSuccess: err.statusMessage ? true : false,
 })
});


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

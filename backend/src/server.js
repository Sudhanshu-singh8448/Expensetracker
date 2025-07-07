//const express = require ('express')
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB} from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionRoute from "./routes/transactionRoutes.js"

dotenv.config();

// Check for required environment variables
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimiter); // Apply rate limiting to all routes

const PORT = process.env.PORT || 5001;


app.use("/api/transactions",transactionRoute);

initDB().then(() => {
    app.listen(PORT,()=>{
    console.log("server is up and running on PORT :" ,PORT);
});
});



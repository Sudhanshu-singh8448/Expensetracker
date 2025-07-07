//const express = require ('express')
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sql } from "./src/config/db.js";
import job from "./config/cron.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

// Check for required environment variables
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const app = express();

if (process.env.NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use("/api", rateLimiter);

const PORT = process.env.PORT || 3001;

app.get("/api/health",(req,res) => {
    res.status(200).json({status:"ok"});
});

app.get("/",(req,res) => {
    res.send("its working");
});

app.get("/api/transactions/:userId",async(req,res)=>{
    try{
        
        const { userId } = req.params;
        console.log("your userId is ",userId);
        const transactions = await sql`
        SELECT * FROM transactions
        WHERE user_id = ${userId}
        
        `;
        res.status(200).json(transactions);
    }catch(error){
        console.log("Error getting the transaction",error);
        res.status(500).json({message: "Internal server error"});
    }
})

app.delete("/api/transactions/:id",async(req,res)=>{
    try{
        const { id } = req.params;
        console.log("Deleting transaction with id:", id);

        if (isNaN(parseInt(id))){
            return res.status(400).json({message:"Invalid transaction ID"});
        }

        const deleteData = await sql`
        DELETE FROM transactions
        WHERE id = ${id}
        RETURNING *
        `;
        
        if(deleteData.length === 0){
            return res.status(404).json({message:"Transaction not found"});
        }
        
        res.status(200).json({
            message:"Transaction deleted successfully",
            deletedTransaction: deleteData[0]
        });
    }catch(error){
        console.log("Error deleting the transaction:",error);
        res.status(500).json({message: "Internal server error"});
    }
})

app.get("/api/transactions/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM transactions
      WHERE user_id = ${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id = ${userId} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM transactions
      WHERE user_id = ${userId} AND amount < 0
    `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });

  } catch (error) {
    console.error("Error getting transaction summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


async function initDB() {
    try{
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`
       console.log("Database intialized successfully");
    }catch (error){
        console.log("Error initializing DB",error)
        process.exit(1)
    }
}

app.post("/api/transactions",async(req,res)=>{
    try{
        const {title,amount,category,user_id} = req.body;

        // Validate required fields
        if(!title || amount === undefined || !category || !user_id){
            return res.status(400).json({message:"All fields are required (title, amount, category, user_id)" });
        }

        // Validate amount is a number
        if(isNaN(parseFloat(amount))){
            return res.status(400).json({message:"Amount must be a valid number"});
        }

        const transaction = await sql`
        INSERT INTO transactions(user_id,title,amount,category)
        VALUES(${user_id},${title},${parseFloat(amount)},${category})
        RETURNING *
        `
        console.log("Transaction created:", transaction[0]);
        res.status(201).json(transaction[0]);
    }catch (error){
        console.log("Error creating the transaction:",error);
        res.status(500).json({message: "Internal server error"});
    }
})

initDB().then(() => {
    app.listen(PORT,()=>{
    console.log("server is up and running on PORT :" ,PORT);
});
});

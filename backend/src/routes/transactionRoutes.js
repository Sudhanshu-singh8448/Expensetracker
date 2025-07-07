import express from "express";

const router = express.Router();
import {getTransactionsByUserId,deleteTransactionById,getSummaryByUserId,postTransactions} from "../controllers/transactionsController.js"

// More specific routes should come first
router.get("/summary/:userId", getSummaryByUserId);

router.get("/:userId", getTransactionsByUserId);

router.delete("/:id", deleteTransactionById);

router.post("/", postTransactions);

export default router;
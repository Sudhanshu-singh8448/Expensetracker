import { sql } from "../config/db.js";

async function getTransactionsByUserId(req, res) {

    try {

        const { userId } = req.params;
        console.log("your userId is ", userId);
        const transactions = await sql`
            SELECT * FROM transactions
            WHERE user_id = ${userId}
            
            `;
        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error getting the transaction", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

async function deleteTransactionById(req, res) {

    try {
        const { id } = req.params;
        console.log("Deleting transaction with id:", id);

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: "Invalid transaction ID" });
        }

        const deleteData = await sql`
            DELETE FROM transactions
            WHERE id = ${id}
            RETURNING *
            `;

        if (deleteData.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({
            message: "Transaction deleted successfully",
            deletedTransaction: deleteData[0]
        });
    } catch (error) {
        console.log("Error deleting the transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

async function getSummaryByUserId (req,res){
 
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

}
async function postTransactions(req,res){

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
}


export { getTransactionsByUserId,
deleteTransactionById,
getSummaryByUserId,
postTransactions
}

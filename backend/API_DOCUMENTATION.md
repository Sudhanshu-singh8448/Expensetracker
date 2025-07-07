# Expense Tracker API Documentation

## Base URL
```
http://localhost:3001
```

## Environment Variables Required
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `API_URL` - API URL for cron job health checks

## API Endpoints

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok"
}
```

### Get All Transactions for a User
```
GET /api/transactions/:userId
```
**Parameters:**
- `userId` (string) - User identifier

**Response:**
```json
[
  {
    "id": 1,
    "user_id": "user123",
    "title": "Grocery Shopping",
    "amount": -50.00,
    "category": "Food",
    "created_at": "2025-07-07"
  }
]
```

### Create New Transaction
```
POST /api/transactions
```
**Request Body:**
```json
{
  "user_id": "user123",
  "title": "Salary",
  "amount": 3000.00,
  "category": "Income"
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": "user123", 
  "title": "Salary",
  "amount": 3000.00,
  "category": "Income",
  "created_at": "2025-07-07"
}
```

### Delete Transaction
```
DELETE /api/transactions/:id
```
**Parameters:**
- `id` (number) - Transaction ID

**Response:**
```json
{
  "message": "Transaction deleted successfully",
  "deletedTransaction": {
    "id": 1,
    "user_id": "user123",
    "title": "Grocery Shopping",
    "amount": -50.00,
    "category": "Food",
    "created_at": "2025-07-07"
  }
}
```

### Get Financial Summary
```
GET /api/transactions/summary/:userId
```
**Parameters:**
- `userId` (string) - User identifier

**Response:**
```json
{
  "balance": 2950.00,
  "income": 3000.00,
  "expenses": -50.00
}
```

## Features

### Rate Limiting
- **Limit:** 10 requests per 10 seconds per IP
- **Headers:** Rate limit info included in response headers
- **Response:** 429 status when limit exceeded

### Database Schema
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);
```

### Cron Job
- **Schedule:** Every 14 minutes
- **Purpose:** Keep API alive by sending health check requests
- **Prevents:** Server from sleeping on free hosting platforms

## Error Handling
- **400:** Bad Request (validation errors)
- **404:** Not Found (resource doesn't exist)
- **429:** Too Many Requests (rate limit exceeded)
- **500:** Internal Server Error

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Testing the API

### Create a transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "title": "Coffee",
    "amount": -5.99,
    "category": "Food"
  }'
```

### Get transactions
```bash
curl http://localhost:3001/api/transactions/test_user
```

### Get summary
```bash
curl http://localhost:3001/api/transactions/summary/test_user
```

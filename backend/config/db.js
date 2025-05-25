const { Pool } = require("pg")
const dotenv = require("dotenv")

dotenv.config()

// Determine if we're in production (like on Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL in production environments
  ssl: isProduction ? { 
    rejectUnauthorized: false 
  } : false,
})

// Export the pool for use in other files
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
}

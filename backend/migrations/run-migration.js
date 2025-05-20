const { pool } = require("../config/db")
const fs = require("fs")
const path = require("path")

async function runMigration() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, "add_game_results_table.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    // Execute the SQL
    await pool.query(sql)
    console.log("Migration completed successfully")
    
    // Close the pool
    await pool.end()
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

runMigration()

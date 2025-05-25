const { pool } = require("./config/db");

// Test database connection
async function testDbConnection() {
  try {
    console.log("Testing database connection...");
    
    const result = await pool.query("SELECT NOW() as time, current_database() as db, version() as version");
    console.log("Database connection successful!");
    console.log("Current Time:", result.rows[0].time);
    console.log("Database:", result.rows[0].db);
    console.log("PostgreSQL Version:", result.rows[0].version);
    
    // Also test if we can access the tables
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log("\nAvailable tables:");
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } catch (tableError) {
      console.error("Error querying tables:", tableError.message);
    }
    
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.error("Error details:", error);
  } finally {
    // Close the pool
    await pool.end();
    console.log("Connection pool closed");
  }
}

// Run the test
testDbConnection();

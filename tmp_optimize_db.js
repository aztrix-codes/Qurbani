
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Read directly from .env.local in the current directory
const envPath = path.join(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  });

  console.log('--- Database Optimization ---');
  try {
    console.log('1. Speeding up Customer-User joins (using prefixes)...');
    await connection.query('CREATE INDEX idx_cust_link ON customers (user_name(100), area_name(100), zone_name(100))');
    await connection.query('CREATE INDEX idx_user_link ON users (name(100), area_name(100), zone_name(100))');
    
    console.log('2. Indexing regional status for Dashboard...');
    await connection.query('CREATE INDEX idx_cust_region_status ON customers (region, status)');
    
    console.log('3. Indexing receipt timestamps...');
    await connection.query('CREATE INDEX idx_receipts_created ON receipts (created_at)');

    console.log('4. Indexing individual link fields for fallback joins...');
    await connection.query('CREATE INDEX idx_cust_user_name ON customers (user_name)');
    await connection.query('CREATE INDEX idx_user_name_match ON users (name)');

    console.log('✅ Optimization complete!');
  } catch (e) {
    if (e.code === 'ER_DUP_KEYNAME') {
      console.log('⚠️ Some indexes already exist. Skipping.');
    } else {
      console.error('❌ Error optimization:', e.message);
    }
  } finally {
    await connection.end();
  }
}

run();

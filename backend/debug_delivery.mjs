import { initMySQL, getMySQLPool } from './server/config/mysql.js';

async function checkProducts() {
  await initMySQL();
  const pool = getMySQLPool();
  const [farmersInProducts] = await pool.query("SELECT DISTINCT farmerId, farmerName, farmLocation FROM products");
  console.log('Distinct Farmers in products table:', farmersInProducts);
  process.exit(0);
}

checkProducts().catch(console.error);

// MongoDB has been permanently replaced by MySQL (XAMPP / phpMyAdmin).
// Please use initMySQL from './mysql.js'
export async function connectDB() {
  console.log('ℹ️ Redirecting database initialization to MySQL (XAMPP / phpMyAdmin)...');
  const { initMySQL } = await import('./mysql.js');
  return initMySQL();
}
export default connectDB;

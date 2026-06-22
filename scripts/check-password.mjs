import { createClient } from '@libsql/client';
const libsql = createClient({ url: 'file:./dev.db' });
// Get all columns
const cols = await libsql.execute("PRAGMA table_info(users)");
console.log('Columns:', cols.rows.map(r => r.name).join(', '));
const res = await libsql.execute("SELECT * FROM users WHERE email = 'youcefboubkri@gmail.com'");
console.log(res.rows[0]);
process.exit(0);

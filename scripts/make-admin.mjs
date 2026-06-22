import { createClient } from '@libsql/client';
const libsql = createClient({ url: 'file:./dev.db' });
await libsql.execute("UPDATE users SET role = 'ADMIN' WHERE email = 'youcefboubkri@gmail.com'");
const res = await libsql.execute("SELECT name, email, role FROM users WHERE email = 'youcefboubkri@gmail.com'");
console.log('✅ Updated:', res.rows[0]);
process.exit(0);

import { createClient } from '@libsql/client';
const libsql = createClient({ url: 'file:./dev.db' });
const res = await libsql.execute('SELECT name, email, role FROM users LIMIT 10');
console.log(JSON.stringify(res.rows, null, 2));
process.exit(0);

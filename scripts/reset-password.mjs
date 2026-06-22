import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const newPassword = 'admin123';
const hash = await bcrypt.hash(newPassword, 12);

const libsql = createClient({ url: 'file:./dev.db' });
await libsql.execute({ sql: "UPDATE users SET passwordHash = ? WHERE email = 'youcefboubkri@gmail.com'", args: [hash] });

console.log('✅ Password reset!');
console.log('   Email:    youcefboubkri@gmail.com');
console.log('   Password: admin123');
process.exit(0);

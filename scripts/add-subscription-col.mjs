import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:./dev.db' });

try {
  await db.execute("ALTER TABLE users ADD COLUMN subscriptionPlan TEXT DEFAULT 'FREE'");
  console.log('✅ Added subscriptionPlan column');
} catch(e) { console.log('subscriptionPlan already exists or error:', e.message); }

try {
  await db.execute("ALTER TABLE users ADD COLUMN subscriptionExpiry TEXT");
  console.log('✅ Added subscriptionExpiry column');
} catch(e) { console.log('subscriptionExpiry already exists or error:', e.message); }

// Set admin user to PRO
await db.execute("UPDATE users SET subscriptionPlan = 'PRO' WHERE email = 'youcefboubkri@gmail.com'");
console.log('✅ Set admin to PRO plan');

const res = await db.execute("SELECT name, email, subscriptionPlan FROM users");
console.log('Users:', res.rows);
process.exit(0);

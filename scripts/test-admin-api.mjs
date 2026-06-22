import { SignJWT } from 'jose';

const secret = new TextEncoder().encode('sou9car-dev-secret-key-change-in-production');
const token = await new SignJWT({ userId: 'cmpv8ovfi0000xgh0arxn75o8', role: 'ADMIN' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(secret);

const res = await fetch('http://localhost:3002/api/admin/full', {
  headers: { Cookie: `session=${token}` }
});
const text = await res.text();
console.log('Status:', res.status);
console.log('Body:', text.substring(0, 1000));
process.exit(0);

// Generate a bcrypt hash for an admin password.
// Usage: node scripts/hash-password.mjs "your-password"
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}
console.log(bcrypt.hashSync(pw, 10));

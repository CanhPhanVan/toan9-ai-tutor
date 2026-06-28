// Run: node scripts/seed-parent-account.js
// Creates demo parent account: parent / parent123
const bcrypt = require('bcryptjs')

async function main() {
  const hash = await bcrypt.hash('parent123', 10)
  console.log('INSERT INTO "User" (id, name, email, password, role, "createdAt")')
  console.log(`VALUES (gen_random_uuid()::text, 'Phụ huynh Demo', 'parent@school.vn', '${hash}', 'parent', NOW())`)
  console.log('ON CONFLICT (email) DO NOTHING;')
}
main()

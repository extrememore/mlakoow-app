const fs = require('fs')
const path = require('path')

const files = [
  'app/api/admin/answers/[id]/route.ts',
  'app/api/admin/bookings/[id]/route.ts',
  'app/api/admin/questions/[id]/route.ts',
  'app/api/admin/reviews/[id]/route.ts',
  'app/api/admin/users/[id]/route.ts',
]

files.forEach(f => {
  const full = path.join(process.cwd(), f)
  let c = fs.readFileSync(full, 'utf8')

  // Add import if missing
  if (!c.includes("import { isAdmin }") && !c.includes("isAdmin } from '@/lib/roles'")) {
    c = c.replace(
      "import { NextResponse } from 'next/server'",
      "import { NextResponse } from 'next/server'\nimport { isAdmin } from '@/lib/roles'"
    )
  }

  // Fix the broken require pattern - replace require() with proper call
  c = c.replace(
    /if \(!session\?\.user \|\| !require\('@\/lib\/roles'\)\.isAdmin\(role\)\) return null/g,
    "if (!session?.user || !isAdmin(role)) return null"
  )

  // If role var not declared before isAdmin call, add it
  c = c.replace(
    /async function checkAdmin\(\) \{\n  const session = await auth\(\)\n  const role = \(session\?\.user as any\)\?\?\.role \?\? ''\n  if \(!session\?\.user \|\| !isAdmin\(role\)\) return null/g,
    "async function checkAdmin() {\n  const session = await auth()\n  const role = (session?.user as any)?.role ?? ''\n  if (!session?.user || !isAdmin(role)) return null"
  )

  // If role var is missing entirely (pattern without role var)
  c = c.replace(
    /async function checkAdmin\(\) \{\n  const session = await auth\(\)\n  if \(!session\?\.user \|\| !isAdmin\(role\)\) return null/g,
    "async function checkAdmin() {\n  const session = await auth()\n  const role = (session?.user as any)?.role ?? ''\n  if (!session?.user || !isAdmin(role)) return null"
  )

  fs.writeFileSync(full, c)
  console.log('Fixed:', f)
})

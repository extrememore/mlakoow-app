const fs = require('fs')
const path = require('path')

const OLD_CHECK = `async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') return null
  return session
}`

const NEW_CHECK = `async function checkAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !require('@/lib/roles').isAdmin(role)) return null
  return session
}`

const OLD_CHECK2 = `  if (!session?.user || (session.user as any).role !== 'admin') {`
const NEW_CHECK2 = `  const role = (session?.user as any)?.role ?? ''\n  if (!session?.user || !require('@/lib/roles').isAdmin(role)) {`

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full)
    else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8')
      const orig = content
      content = content.replace(OLD_CHECK, NEW_CHECK)
      content = content.replace(/if \(!session\?\.user \|\| \(session\.user as any\)\.role !== 'admin'\) return null/g,
        `const role = (session?.user as any)?.role ?? ''\n  if (!session?.user || !require('@/lib/roles').isAdmin(role)) return null`)
      if (content !== orig) {
        fs.writeFileSync(full, content)
        console.log('Updated:', full.replace(process.cwd() + '\\', ''))
      }
    }
  }
}

walk(path.join(process.cwd(), 'app', 'api', 'admin'))
walk(path.join(process.cwd(), 'app', 'admin'))
console.log('Done!')

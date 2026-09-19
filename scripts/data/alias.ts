// Lets data scripts import the site's own modules (src/lib/*) the way Next does: "@/lib/x"
// resolves to src/lib/x.ts. Import this module first, then load site code with dynamic import().
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT } from './lib.ts'

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@/')) {
      const base = path.join(ROOT, 'src', specifier.slice(2))
      const file = ['.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find(existsSync)
      if (file) return next(pathToFileURL(file).href, context)
    }
    // Site code imports siblings without extensions ("./graph-layout").
    if (specifier.startsWith('.') && context.parentURL?.includes('/src/') && !path.extname(specifier)) {
      const file = new URL(specifier + '.ts', context.parentURL)
      if (existsSync(file)) return next(file.href, context)
    }
    return next(specifier, context)
  },
})

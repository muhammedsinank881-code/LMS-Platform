/**
 * Rasterizes public/icons/icon.svg into the PWA sizes.
 * Run with `npm run icons` after changing the SVG. No other icon source is used.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dir = resolve(root, 'public/icons')
const svg = readFileSync(resolve(dir, 'icon.svg'))
mkdirSync(dir, { recursive: true })

function writePng(source, width, name) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: width } }).render().asPng()
  writeFileSync(resolve(dir, name), png)
}

writePng(svg, 192, 'icon-192.png')
writePng(svg, 512, 'icon-512.png')
writePng(Buffer.from(svg.toString().replace('viewBox="0 0 64 64"', 'viewBox="-16 -16 96 96"')), 512, 'icon-maskable-512.png')
console.log('Wrote icon-192.png, icon-512.png, and icon-maskable-512.png')

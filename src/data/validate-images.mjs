// validate-images.mjs — Validasi konsistensi gambar ↔ nama menu
// Jalankan: node src/data/validate-images.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const foods = JSON.parse(readFileSync(join(__dirname, 'foodsLarge.json'), 'utf-8'))

console.log('\n═══════════════════════════════════════════════════')
console.log('  NGENYANGIN — Laporan Validasi Gambar Menu')
console.log('═══════════════════════════════════════════════════\n')

// 1. Total items
console.log(`📦 Total item makanan: ${foods.length}`)

// 2. Unique menu names
const uniqueNames = new Set(foods.map(f => f.name))
console.log(`🍽️  Nama menu unik: ${uniqueNames.size}`)

// 3. Unique image URLs
const uniqueImages = new Set(foods.map(f => f.image))
console.log(`🖼️  URL gambar unik: ${uniqueImages.size}`)

// 4. Items without image
const noImage = foods.filter(f => !f.image || f.image.trim() === '')
console.log(`❌ Item tanpa gambar: ${noImage.length}`)
if (noImage.length > 0) {
  noImage.slice(0, 5).forEach(f => console.log(`   - [${f.id}] ${f.name}`))
}

// 5. Category breakdown
const catCount = {}
foods.forEach(f => {
  catCount[f.category] = (catCount[f.category] || 0) + 1
})
console.log(`\n📊 Distribusi kategori (${Object.keys(catCount).length} kategori):`)
Object.entries(catCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(25)} ${count}`)
  })

// 6. Photo pool usage analysis — which image URL is used by which food names
const imageToNames = {}
foods.forEach(f => {
  if (!imageToNames[f.image]) imageToNames[f.image] = new Set()
  imageToNames[f.image].add(f.name.split(' ').slice(0, 3).join(' ')) // first 3 words as "base name"
})

// 7. Cross-category image contamination check
// An image is "contaminated" if it appears in foods with very different base names
// We group by photo pool key embedded in URL (the Unsplash photo ID)
const photoIdToCategories = {}
foods.forEach(f => {
  const match = f.image.match(/photo-[a-z0-9]+/)
  if (!match) return
  const pid = match[0]
  if (!photoIdToCategories[pid]) photoIdToCategories[pid] = new Set()
  photoIdToCategories[pid].add(f.category)
})

const crossCategoryImages = Object.entries(photoIdToCategories)
  .filter(([_, cats]) => cats.size > 3)
  .sort((a, b) => b[1].size - a[1].size)

console.log(`\n🔍 Gambar dipakai di >3 kategori berbeda: ${crossCategoryImages.length}`)
if (crossCategoryImages.length > 0) {
  crossCategoryImages.slice(0, 5).forEach(([pid, cats]) => {
    console.log(`   ${pid}: ${[...cats].join(', ')}`)
  })
}

// 8. Items per category — image diversity
console.log('\n🎨 Keragaman gambar per kategori:')
const catImageMap = {}
foods.forEach(f => {
  if (!catImageMap[f.category]) catImageMap[f.category] = new Set()
  catImageMap[f.category].add(f.image)
})
Object.entries(catImageMap)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([cat, imgs]) => {
    const itemCount = catCount[cat]
    const imgCount = imgs.size
    const ratio = (imgCount / itemCount * 100).toFixed(1)
    const status = imgCount >= 3 ? '✅' : imgCount >= 2 ? '⚠️' : '❌'
    console.log(`   ${status} ${cat.padEnd(25)} ${itemCount} items, ${imgCount} gambar unik (${ratio}%)`)
  })

// 9. Sample check — 5 items per category
console.log('\n📋 Sampel 3 item per kategori:')
const catSamples = {}
foods.forEach(f => {
  if (!catSamples[f.category]) catSamples[f.category] = []
  if (catSamples[f.category].length < 3) catSamples[f.category].push(f)
})
Object.entries(catSamples).forEach(([cat, items]) => {
  console.log(`\n  [${cat}]`)
  items.forEach(f => {
    const imgId = (f.image.match(/photo-[a-z0-9]+/) || ['?'])[0]
    console.log(`    • ${f.name.padEnd(35)} → ${imgId}`)
  })
})

// 10. Suspicious pairings — food names that likely have wrong image type
// Heuristic: check if name contains known keywords and image pool matches
const KEYWORD_POOL_MAP = [
  { keywords: ['mie', 'mie ayam', 'bihun', 'kwetiau', 'bakmi'], expectedPools: ['NOODLES', 'RAMEN'] },
  { keywords: ['sushi', 'sashimi', 'onigiri', 'temaki'], expectedPools: ['SUSHI'] },
  { keywords: ['pizza'], expectedPools: ['PIZZA'] },
  { keywords: ['burger', 'hamburger'], expectedPools: ['BURGER'] },
  { keywords: ['salad'], expectedPools: ['SALAD', 'VEGAN', 'BOWL'] },
  { keywords: ['kopi', 'coffee', 'espresso', 'latte', 'cappuccino'], expectedPools: ['COFFEE', 'ICED_COFFEE', 'HOT_DRINK'] },
  { keywords: ['es kopi', 'cold brew', 'iced coffee'], expectedPools: ['ICED_COFFEE'] },
  { keywords: ['ramen'], expectedPools: ['RAMEN', 'NOODLES'] },
  { keywords: ['steak'], expectedPools: ['STEAK', 'GRILLED'] },
  { keywords: ['ayam goreng', 'fried chicken'], expectedPools: ['FRIED_CHICKEN'] },
]

console.log('\n\n✅ RINGKASAN VALIDASI')
console.log('───────────────────────────────────')
console.log(`Total makanan     : ${foods.length}`)
console.log(`Nama unik         : ${uniqueNames.size}`)
console.log(`Gambar unik       : ${uniqueImages.size}`)
console.log(`Tanpa gambar      : ${noImage.length}`)
console.log(`Cross-cat images  : ${crossCategoryImages.length} (gambar di >3 kategori)`)
console.log(`Kategori          : ${Object.keys(catCount).length}`)
console.log('───────────────────────────────────')

if (noImage.length === 0) {
  console.log('\n🎉 Semua item memiliki gambar!')
} else {
  console.log(`\n⚠️  ${noImage.length} item perlu gambar.`)
}

console.log('\n')

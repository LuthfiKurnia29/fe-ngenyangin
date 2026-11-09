// generateData.mjs — Generator 10.000 makanan + 200 supplier
// Jalankan: node src/data/generateData.mjs
// Output: src/data/suppliers.json dan src/data/foodsLarge.json
//
// STRATEGI GAMBAR:
// - Setiap menu template punya photoPool key yang merujuk ke kumpulan Unsplash photo ID relevan
// - Item ke-N dari template yang sama memakai images[N % pool.length] (cyclic, bukan random)
// - Mie ayam → foto mie, sushi → foto sushi, es kopi → foto iced coffee, dst.

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================
// PHOTO POOLS — kumpulan Unsplash ID per jenis makanan
// Format: https://images.unsplash.com/{id}?w=400&q=80
// ============================================================
const P = {
  // ── RICE & NOODLES ──────────────────────────────────────────
  FRIED_RICE:    ['photo-1512058564366-18510be2db19', 'photo-1603133872878-684f208fb84b', 'photo-1596560548464-f010549b84d7'],
  NOODLES:       ['photo-1569050467447-ce54b3bbc37d', 'photo-1557872943-16a5ac26437e', 'photo-1555126634-323283e090fa', 'photo-1591814468924-caf88d1232e1'],
  RAMEN:         ['photo-1569718130467-04e26de7b7f8', 'photo-1569050467447-ce54b3bbc37d', 'photo-1591814468924-caf88d1232e1'],
  RICE:          ['photo-1536304929831-ee1ca9d44906', 'photo-1512058564366-18510be2db19', 'photo-1603133872878-684f208fb84b'],
  // ── SOUPS / STEWS ───────────────────────────────────────────
  SOUP:          ['photo-1547592166-23ac45744acd', 'photo-1588566565463-180a5f4d4a21', 'photo-1498579809087-ef1e558fd1da'],
  CURRY_BEEF:    ['photo-1565557623262-b51c2513a641', 'photo-1455619452474-d2be8b1e70cd', 'photo-1547592166-23ac45744acd'],
  // ── PROTEINS ────────────────────────────────────────────────
  FRIED_CHICKEN: ['photo-1562967914-608f82629710', 'photo-1527477396000-e27163b481c2', 'photo-1626645738196-c2a7c87a8f58', 'photo-1587248720327-8eb72564be1e'],
  GRILLED:       ['photo-1529042410-abe733766861', 'photo-1555939594-58d7cb561ad1', 'photo-1558618666-fcd25c85cd64'],
  STEAK:         ['photo-1558618666-fcd25c85cd64', 'photo-1546069901-d6a69b6e597f', 'photo-1555939594-58d7cb561ad1'],
  SEAFOOD:       ['photo-1565680018434-b513d5e5fd47', 'photo-1559410545-0bdcd187e0a6', 'photo-1467003909585-2f8a72700288', 'photo-1559559254-e3bfb7e7e3b8'],
  // ── VEGETABLES / SALAD ──────────────────────────────────────
  SALAD:         ['photo-1512621776951-a57141f2eefd', 'photo-1540420773420-3366772f4999', 'photo-1498837167922-ddd27525d352', 'photo-1623428187969-5da2dcea5ebf'],
  VEGAN:         ['photo-1512621776951-a57141f2eefd', 'photo-1540420773420-3366772f4999', 'photo-1498837167922-ddd27525d352'],
  BOWL:          ['photo-1512621776951-a57141f2eefd', 'photo-1540420773420-3366772f4999', 'photo-1623428187969-5da2dcea5ebf'],
  // ── JAPANESE ────────────────────────────────────────────────
  SUSHI:         ['photo-1562802378-91e63c20a4e5', 'photo-1617196034183-421b4040d20d', 'photo-1611143669185-af224c5e3252', 'photo-1559410545-0bdcd187e0a6'],
  // ── WESTERN FASTFOOD ────────────────────────────────────────
  PIZZA:         ['photo-1565299624-7e4b80b6df75', 'photo-1574071318508-1cdbab80d002', 'photo-1513104890138-7c749659a591'],
  BURGER:        ['photo-1568901346774-61b4b48aaa90', 'photo-1550317138-10000687a72b', 'photo-1596956470007-2bf6095e7e16'],
  PASTA:         ['photo-1612892483-33e06ba3f9f7', 'photo-1527415566-b6a37a06f5dc', 'photo-1555949258-eb67b1ef0ceb'],
  KEBAB:         ['photo-1561731216-c3a4b6f69197', 'photo-1529042410-abe733766861'],
  SANDWICH:      ['photo-1528735602780-2552fd46c7ba', 'photo-1568901346774-61b4b48aaa90'],
  // ── HOT DRINKS ──────────────────────────────────────────────
  COFFEE:        ['photo-1495474472359-068ac4b0aaab', 'photo-1509042239860-f550ce710b93', 'photo-1442512595331-e89e73853f31'],
  ICED_COFFEE:   ['photo-1461023058943-07fcbe16d735', 'photo-1517959105821-ecd9eb73a2f0', 'photo-1534778101976-62847782c213'],
  TEA:           ['photo-1556679908-c1aa2d8c9bb3', 'photo-1544787219-7f47ccb76574', 'photo-1564890369478-c89ca6d9cde9'],
  MATCHA:        ['photo-1536256263542-651b7d2f9e30', 'photo-1515823064-d6e0c04616a7', 'photo-1556679908-c1aa2d8c9bb3'],
  HOT_DRINK:     ['photo-1495474472359-068ac4b0aaab', 'photo-1512867052-61e1e1e1fc0a', 'photo-1442512595331-e89e73853f31'],
  // ── COLD DRINKS ─────────────────────────────────────────────
  JUICE:         ['photo-1543362906-acfc16c67564', 'photo-1512842845297-aa13f4e2e0d6', 'photo-1497534446932-c925b458314e'],
  SMOOTHIE:      ['photo-1544145945-f90425340c7e', 'photo-1623065400855-12ac2e59c4b2', 'photo-1587583735353-52f9db0c95f9'],
  ICED_DRINK:    ['photo-1543362906-acfc16c67564', 'photo-1497034825429-c343d7c6a68f', 'photo-1512867052-61e1e1e1fc0a'],
  // ── DESSERTS & BAKERY ───────────────────────────────────────
  DONUT:         ['photo-1551024601-5ed00b1c73b6', 'photo-1548365328-8c6db3220e4c', 'photo-1600359756280-4b329e2a5932'],
  ICE_CREAM:     ['photo-1563805151-7f49cdfe4b2d', 'photo-1501443762994-82bd5dace89a', 'photo-1497034825429-c343d7c6a68f'],
  CAKE:          ['photo-1563729564-c09c3ea61432', 'photo-1578985545062-69928b1d9587', 'photo-1587174486073-ae5e5cff23aa'],
  BROWNIES:      ['photo-1606312619070-d48b4c652a52', 'photo-1559620192-032c4bc4674e', 'photo-1563729564-c09c3ea61432'],
  BREAD:         ['photo-1509440159591-93965d64cb33', 'photo-1565299507177-b0ac66763828', 'photo-1549921296-3b0f9a35af35'],
  CROISSANT:     ['photo-1549919029-3a2d93d31e7b', 'photo-1555507036-ab1f4038808a', 'photo-1509440159591-93965d64cb33'],
  PANCAKE:       ['photo-1484723091-cca5a3fb4e2f', 'photo-1567620905732-2d1ec7ab7445', 'photo-1601924994987-69e26d50dc26'],
  WAFFLE:        ['photo-1568727548428-3e1fc91f8bfb', 'photo-1484723091-cca5a3fb4e2f', 'photo-1601924994987-69e26d50dc26'],
  // ── TRADITIONAL / ASIAN ─────────────────────────────────────
  TRADITIONAL:   ['photo-1551754655-5e59ae9b3bdd', 'photo-1596560548464-f010549b84d7', 'photo-1536304929831-ee1ca9d44906'],
  DUMPLING:      ['photo-1563379926-26799529d2e1', 'photo-1617196034183-421b4040d20d', 'photo-1511910849309-0dffb8785146'],
  SPRING_ROLL:   ['photo-1563379926-26799529d2e1', 'photo-1511910849309-0dffb8785146', 'photo-1551754655-5e59ae9b3bdd'],
  KOREAN:        ['photo-1583224964978-2257b8a1700b', 'photo-1498579809087-ef1e558fd1da', 'photo-1529042410-abe733766861'],
  // ── FROZEN ──────────────────────────────────────────────────
  FROZEN:        ['photo-1565557623262-b51c2513a641', 'photo-1562967914-608f82629710', 'photo-1527477396000-e27163b481c2'],
}

function img(pool, idx = 0) {
  const ids = P[pool] || P.TRADITIONAL
  return `https://images.unsplash.com/${ids[idx % ids.length]}?w=400&q=80`
}

// ============================================================
// MENU CATALOG — 420+ template menu nyata per kategori
// { base, category, pool, variants[], priceRange[min,max] }
// ============================================================
const MENU_CATALOG = [

  // ── MAKANAN BERAT ──────────────────────────────────────────
  { base:'Nasi Goreng', cat:'Makanan Berat', pool:'FRIED_RICE', v:['Spesial','Kampung','Seafood','Pattaya','Mawut','Jawa','Pete','Teri'] },
  { base:'Nasi Goreng Ayam', cat:'Makanan Berat', pool:'FRIED_RICE', v:['Spesial','Bakar','Rica'] },
  { base:'Nasi Goreng Sapi', cat:'Makanan Berat', pool:'FRIED_RICE', v:['Black Pepper','Lada Hitam','Rica'] },
  { base:'Nasi Gudeg', cat:'Makanan Berat', pool:'CURRY_BEEF', v:['Ayam','Telur','Komplit','Jogja'] },
  { base:'Nasi Rawon', cat:'Makanan Berat', pool:'SOUP', v:['Spesial','Sapi','Iga','Surabaya'] },
  { base:'Nasi Soto Ayam', cat:'Makanan Berat', pool:'SOUP', v:['Lamongan','Betawi','Kudus','Spesial'] },
  { base:'Nasi Kuning', cat:'Makanan Berat', pool:'RICE', v:['Komplit','Ayam Bakar','Spesial','Betawi'] },
  { base:'Nasi Uduk', cat:'Makanan Berat', pool:'RICE', v:['Komplit','Ayam Goreng','Spesial'] },
  { base:'Nasi Pecel', cat:'Makanan Berat', pool:'VEGAN', v:['Spesial','Telur','Ayam','Madiun'] },
  { base:'Nasi Campur', cat:'Makanan Berat', pool:'RICE', v:['Bali','Spesial','Jawa','Rumahan'] },
  { base:'Nasi Kebuli', cat:'Makanan Berat', pool:'RICE', v:['Ayam','Kambing','Spesial'] },
  { base:'Nasi Briyani', cat:'Makanan Berat', pool:'RICE', v:['Ayam','Kambing','Spesial'] },
  { base:'Nasi Lemak', cat:'Makanan Berat', pool:'RICE', v:['Ayam','Spesial'] },
  { base:'Nasi Bakar', cat:'Makanan Berat', pool:'GRILLED', v:['Ayam','Ikan','Spesial','Jengkol'] },
  { base:'Bubur Ayam', cat:'Makanan Berat', pool:'SOUP', v:['Spesial','Betawi','Kuning','Komplit'] },

  // ── MIE & PASTA ────────────────────────────────────────────
  { base:'Mie Ayam', cat:'Mie & Pasta', pool:'NOODLES', v:['Bakso','Pangsit','Jamur','Jumbo','Spesial','Pedas','Wonton'] },
  { base:'Mie Goreng', cat:'Mie & Pasta', pool:'NOODLES', v:['Spesial','Jawa','Seafood','Ayam','Pedas Extra','Istimewa'] },
  { base:'Bakmi Ayam', cat:'Mie & Pasta', pool:'NOODLES', v:['Spesial','Pangsit','Bakso','Jumbo'] },
  { base:'Kwetiau Goreng', cat:'Mie & Pasta', pool:'NOODLES', v:['Ayam','Sapi','Seafood','Spesial'] },
  { base:'Kwetiau Siram', cat:'Mie & Pasta', pool:'NOODLES', v:['Ayam','Sapi','Seafood'] },
  { base:'Bihun Goreng', cat:'Mie & Pasta', pool:'NOODLES', v:['Spesial','Ayam','Seafood'] },
  { base:'Mie Tek-Tek', cat:'Mie & Pasta', pool:'NOODLES', v:['Spesial','Ayam','Sapi'] },
  { base:'Mie Koclok', cat:'Mie & Pasta', pool:'NOODLES', v:['Spesial','Ayam'] },
  { base:'Spaghetti Bolognese', cat:'Mie & Pasta', pool:'PASTA', v:['Original','Spesial','Extra Cheese'] },
  { base:'Spaghetti Carbonara', cat:'Mie & Pasta', pool:'PASTA', v:['Original','Creamy','Extra Cheese'] },
  { base:'Fettuccine Alfredo', cat:'Mie & Pasta', pool:'PASTA', v:['Original','Chicken','Mushroom'] },
  { base:'Pasta Arabiata', cat:'Mie & Pasta', pool:'PASTA', v:['Original','Pedas','Spesial'] },
  { base:'Pasta Pesto', cat:'Mie & Pasta', pool:'PASTA', v:['Original','Chicken'] },
  { base:'Lasagna', cat:'Mie & Pasta', pool:'PASTA', v:['Daging','Ayam','Vegetarian'] },

  // ── AYAM & DAGING ──────────────────────────────────────────
  { base:'Ayam Goreng', cat:'Ayam & Daging', pool:'FRIED_CHICKEN', v:['Crispy','Original','Rumahan','Rempah','Kalasan','Madu'] },
  { base:'Ayam Geprek', cat:'Ayam & Daging', pool:'FRIED_CHICKEN', v:['Level 1','Level 3','Level 5','Sambal Bawang','Keju'] },
  { base:'Ayam Bakar', cat:'Ayam & Daging', pool:'GRILLED', v:['Madu','Taliwang','Padang','Bumbu Jawa','Rica'] },
  { base:'Ayam Penyet', cat:'Ayam & Daging', pool:'FRIED_CHICKEN', v:['Spesial','Sambal Bawang','Sambal Ijo'] },
  { base:'Ayam Rica-Rica', cat:'Ayam & Daging', pool:'FRIED_CHICKEN', v:['Original','Extra Pedas','Manado'] },
  { base:'Ayam Kremes', cat:'Ayam & Daging', pool:'FRIED_CHICKEN', v:['Original','Spesial'] },
  { base:'Rendang Sapi', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Original','Padang','Kering','Basah'] },
  { base:'Rendang Ayam', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Original','Padang'] },
  { base:'Daging Sapi Lada Hitam', cat:'Ayam & Daging', pool:'STEAK', v:['Original','Extra Lada'] },
  { base:'Steak Daging', cat:'Ayam & Daging', pool:'STEAK', v:['Well Done','Medium','Blackpepper Sauce'] },
  { base:'Chicken Steak', cat:'Ayam & Daging', pool:'STEAK', v:['BBQ Sauce','Blackpepper','Mushroom Sauce'] },
  { base:'Sate Ayam', cat:'Ayam & Daging', pool:'GRILLED', v:['Madura','Ponorogo','Spesial','10 Tusuk'] },
  { base:'Sate Kambing', cat:'Ayam & Daging', pool:'GRILLED', v:['Original','Spesial','Ponorogo'] },
  { base:'Sate Sapi', cat:'Ayam & Daging', pool:'GRILLED', v:['Original','Spesial'] },
  { base:'Tongseng Kambing', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Original','Extra Daging'] },
  { base:'Gulai Kambing', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Original','Padang'] },
  { base:'Empal Gepuk', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Original','Spesial'] },
  { base:'Dendeng Sapi', cat:'Ayam & Daging', pool:'GRILLED', v:['Balado','Batokok'] },
  { base:'Daging Semur', cat:'Ayam & Daging', pool:'CURRY_BEEF', v:['Betawi','Jawa'] },

  // ── SEAFOOD ────────────────────────────────────────────────
  { base:'Udang Goreng Tepung', cat:'Seafood', pool:'SEAFOOD', v:['Spesial','Crispy','Saus Tiram'] },
  { base:'Udang Bakar', cat:'Seafood', pool:'SEAFOOD', v:['Madu','Bumbu Jawa','Rica'] },
  { base:'Udang Saus Padang', cat:'Seafood', pool:'SEAFOOD', v:['Spesial','Extra Pedas'] },
  { base:'Cumi Goreng Tepung', cat:'Seafood', pool:'SEAFOOD', v:['Crispy','Spesial'] },
  { base:'Cumi Saus Tiram', cat:'Seafood', pool:'SEAFOOD', v:['Original','Spesial'] },
  { base:'Ikan Bakar', cat:'Seafood', pool:'SEAFOOD', v:['Bumbu Jawa','Madu','Padang','Rica','Nila','Gurame'] },
  { base:'Ikan Goreng', cat:'Seafood', pool:'SEAFOOD', v:['Lele','Nila','Gurame','Tongkol','Patin'] },
  { base:'Kepiting Saus Tiram', cat:'Seafood', pool:'SEAFOOD', v:['Spesial','Padang'] },
  { base:'Kerang Rebus', cat:'Seafood', pool:'SEAFOOD', v:['Bumbu Jahe','Saus Tiram'] },
  { base:'Ikan Asam Manis', cat:'Seafood', pool:'SEAFOOD', v:['Tongkol','Gurame','Spesial'] },
  { base:'Pepes Ikan', cat:'Seafood', pool:'SEAFOOD', v:['Nila','Tongkol','Gurame'] },
  { base:'Sup Seafood', cat:'Seafood', pool:'SEAFOOD', v:['Spesial','Tom Yum Style'] },

  // ── NASI & LAUK ────────────────────────────────────────────
  { base:'Nasi Gado-Gado', cat:'Nasi & Lauk', pool:'VEGAN', v:['Spesial','Betawi','Jumbo'] },
  { base:'Nasi Pecel Spesial', cat:'Nasi & Lauk', pool:'VEGAN', v:['Madiun','Blitar','Telur'] },
  { base:'Nasi Tempe Orek', cat:'Nasi & Lauk', pool:'VEGAN', v:['Original','Pete'] },
  { base:'Nasi Sayur Lodeh', cat:'Nasi & Lauk', pool:'VEGAN', v:['Spesial','Ayam'] },
  { base:'Nasi Box Ayam', cat:'Nasi & Lauk', pool:'FRIED_CHICKEN', v:['Goreng','Bakar','Geprek'] },
  { base:'Nasi Box Spesial', cat:'Nasi & Lauk', pool:'RICE', v:['Ayam + Ikan','2 Lauk','3 Lauk'] },
  { base:'Nasi Kulit', cat:'Nasi & Lauk', pool:'FRIED_CHICKEN', v:['Spesial','Crispy'] },
  { base:'Nasi Liwet', cat:'Nasi & Lauk', pool:'RICE', v:['Ayam','Ikan','Spesial'] },
  { base:'Nasi Tutug Oncom', cat:'Nasi & Lauk', pool:'VEGAN', v:['Original','Spesial'] },
  { base:'Ketupat Sayur', cat:'Nasi & Lauk', pool:'VEGAN', v:['Spesial','Betawi'] },
  { base:'Lontong Sayur', cat:'Nasi & Lauk', pool:'VEGAN', v:['Spesial','Betawi','Padang'] },
  { base:'Nasi Jinggo', cat:'Nasi & Lauk', pool:'RICE', v:['Original','Spesial'] },

  // ── MAKANAN RINGAN ─────────────────────────────────────────
  { base:'Pisang Goreng', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Crispy','Nugget','Keju','Cokelat','Original'] },
  { base:'Bakwan Jagung', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Pedas','Crispy'] },
  { base:'Tahu Bulat', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Crispy','Telur','Pedas'] },
  { base:'Cireng', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Bumbu Rujak','Isi Daging','Crispy'] },
  { base:'Batagor', cat:'Makanan Ringan', pool:'DUMPLING', v:['Kuah','Kering','Spesial'] },
  { base:'Siomay', cat:'Makanan Ringan', pool:'DUMPLING', v:['Ayam','Spesial','Komplit'] },
  { base:'Lumpia', cat:'Makanan Ringan', pool:'SPRING_ROLL', v:['Basah','Goreng','Semarang','Isi Ayam'] },
  { base:'Risoles', cat:'Makanan Ringan', pool:'SPRING_ROLL', v:['Mayo','Ayam','Keju'] },
  { base:'Comro', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Pedas'] },
  { base:'Misro', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Gula Merah'] },
  { base:'Lemper', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Ayam','Spesial'] },
  { base:'Pempek', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Kapal Selam','Lenjer','Adaan','Paket'] },
  { base:'Ketoprak', cat:'Makanan Ringan', pool:'VEGAN', v:['Original','Spesial','Betawi'] },
  { base:'Tahu Gejrot', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Pedas'] },
  { base:'Tahu Sumedang', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Spesial'] },
  { base:'Keripik Tempe', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Original','Pedas'] },
  { base:'Tahu Crispy', cat:'Makanan Ringan', pool:'TRADITIONAL', v:['Saus Sambal','Saus Tiram','Spesial'] },

  // ── JAJANAN TRADISIONAL ────────────────────────────────────
  { base:'Martabak Telur', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Ayam Sapi','Spesial','Daging Sapi'] },
  { base:'Martabak Manis', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Cokelat Keju','Oreo','Kacang','Spesial','Red Velvet'] },
  { base:'Pukis', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Cokelat','Keju','Pandan','Original'] },
  { base:'Serabi', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Solo','Bandung','Kuah Kinca','Cokelat'] },
  { base:'Terang Bulan', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Cokelat','Keju','Spesial'] },
  { base:'Cilok', cat:'Jajanan Tradisional', pool:'SOUP', v:['Kuah','Goreng','Bumbu Rujak','Spesial'] },
  { base:'Kupat Tahu', cat:'Jajanan Tradisional', pool:'VEGAN', v:['Bandung','Spesial'] },
  { base:'Gado-Gado', cat:'Jajanan Tradisional', pool:'SALAD', v:['Betawi','Spesial','Jumbo','Jakarta'] },
  { base:'Pecel', cat:'Jajanan Tradisional', pool:'SALAD', v:['Madiun','Blitar','Spesial'] },
  { base:'Ketoprak Betawi', cat:'Jajanan Tradisional', pool:'VEGAN', v:['Original','Spesial'] },
  { base:'Kue Cubit', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Cokelat','Keju','Matcha','Original'] },
  { base:'Bubur Kacang Hijau', cat:'Jajanan Tradisional', pool:'SOUP', v:['Original','Santan'] },
  { base:'Bubur Sumsum', cat:'Jajanan Tradisional', pool:'SOUP', v:['Original','Kinca'] },
  { base:'Klepon', cat:'Jajanan Tradisional', pool:'TRADITIONAL', v:['Original','Cokelat'] },
  { base:'Dadar Gulung', cat:'Jajanan Tradisional', pool:'PANCAKE', v:['Pandan','Cokelat','Original'] },
  { base:'Wingko Babat', cat:'Jajanan Tradisional', pool:'TRADITIONAL', v:['Original','Cokelat'] },
  { base:'Getuk Lindri', cat:'Jajanan Tradisional', pool:'TRADITIONAL', v:['Original','Spesial'] },

  // ── ROTI & KUE ─────────────────────────────────────────────
  { base:'Roti Bakar', cat:'Roti & Kue', pool:'BREAD', v:['Cokelat Keju','Stroberi Keju','Blueberry','Pandan Keju','Butter'] },
  { base:'Croissant', cat:'Roti & Kue', pool:'CROISSANT', v:['Original','Butter','Almond','Cokelat'] },
  { base:'Pain au Chocolat', cat:'Roti & Kue', pool:'CROISSANT', v:['Original','Double Choc'] },
  { base:'Roti Boy', cat:'Roti & Kue', pool:'BREAD', v:['Original','Butter','Spesial'] },
  { base:'Roti Canai', cat:'Roti & Kue', pool:'BREAD', v:['Original','Telur','Keju','Madu Butter'] },
  { base:'Roti Sobek', cat:'Roti & Kue', pool:'BREAD', v:['Cokelat','Keju','Spesial'] },
  { base:'Cinnamon Roll', cat:'Roti & Kue', pool:'BREAD', v:['Classic','With Cream Cheese','Spesial'] },
  { base:'Donat Original', cat:'Roti & Kue', pool:'DONUT', v:['Glazed','Cokelat','Sprinkle'] },
  { base:'Donat Isi', cat:'Roti & Kue', pool:'DONUT', v:['Custard','Cokelat','Stroberi','Bluberry'] },
  { base:'Muffin', cat:'Roti & Kue', pool:'CAKE', v:['Blueberry','Cokelat','Vanilla','Keju'] },
  { base:'Bolu Kukus', cat:'Roti & Kue', pool:'CAKE', v:['Pandan','Cokelat','Original'] },
  { base:'Kue Lapis', cat:'Roti & Kue', pool:'CAKE', v:['Legit','Pelangi','Surabaya'] },
  { base:'Kastengel', cat:'Roti & Kue', pool:'TRADITIONAL', v:['Original','Extra Keju'] },
  { base:'Nastar', cat:'Roti & Kue', pool:'TRADITIONAL', v:['Original','Cokelat'] },
  { base:'Brownie', cat:'Roti & Kue', pool:'BROWNIES', v:['Fudgy','Original','Extra Cokelat','Walnut'] },
  { base:'Waffle', cat:'Roti & Kue', pool:'WAFFLE', v:['Original','Cokelat','Stroberi','Madu'] },
  { base:'Pancake', cat:'Roti & Kue', pool:'PANCAKE', v:['Classic','Blueberry','Cokelat Keju','Spesial'] },

  // ── DESSERT ────────────────────────────────────────────────
  { base:'Es Krim', cat:'Dessert', pool:'ICE_CREAM', v:['Vanilla','Cokelat','Stroberi','Matcha','Mango'] },
  { base:'Sundae', cat:'Dessert', pool:'ICE_CREAM', v:['Cokelat','Stroberi','Spesial'] },
  { base:'Cheesecake', cat:'Dessert', pool:'CAKE', v:['Original','Blueberry','Cokelat','Matcha'] },
  { base:'Tiramisu', cat:'Dessert', pool:'CAKE', v:['Original','Spesial'] },
  { base:'Puding', cat:'Dessert', pool:'ICE_CREAM', v:['Cokelat','Mangga','Susu','Lapis'] },
  { base:'Mochi', cat:'Dessert', pool:'ICE_CREAM', v:['Matcha','Cokelat','Stroberi','Mangga'] },
  { base:'Crepes', cat:'Dessert', pool:'PANCAKE', v:['Cokelat Keju','Stroberi','Mangga','Nutella'] },
  { base:'Es Pisang Ijo', cat:'Dessert', pool:'ICE_CREAM', v:['Original','Spesial'] },
  { base:'Es Campur', cat:'Dessert', pool:'ICE_CREAM', v:['Spesial','Betawi','Original'] },
  { base:'Es Cendol', cat:'Dessert', pool:'ICE_CREAM', v:['Spesial','Bandung','Durian'] },
  { base:'Bubur Hitam', cat:'Dessert', pool:'SOUP', v:['Santan','Susu'] },

  // ── JAPANESE ───────────────────────────────────────────────
  { base:'Sushi Roll', cat:'Japanese', pool:'SUSHI', v:['Salmon','Tuna','Ebi Tempura','California','Dragon Roll','Rainbow'] },
  { base:'Sashimi', cat:'Japanese', pool:'SUSHI', v:['Salmon','Tuna','Mix 10pcs','Mix 15pcs'] },
  { base:'Ramen Ayam', cat:'Japanese', pool:'RAMEN', v:['Shoyu','Shio','Original'] },
  { base:'Ramen Tonkotsu', cat:'Japanese', pool:'RAMEN', v:['Original','Spicy','Miso'] },
  { base:'Ramen Spicy', cat:'Japanese', pool:'RAMEN', v:['Level 2','Level 3','Level 5'] },
  { base:'Gyoza', cat:'Japanese', pool:'DUMPLING', v:['Ayam','Daging Sapi','Udang','Vegetable','Pan-Fried'] },
  { base:'Takoyaki', cat:'Japanese', pool:'TRADITIONAL', v:['Original 6pcs','Original 9pcs','Spesial'] },
  { base:'Onigiri', cat:'Japanese', pool:'RICE', v:['Salmon','Tuna Mayo','Ayam Teriyaki','Umeboshi'] },
  { base:'Udon', cat:'Japanese', pool:'NOODLES', v:['Kuah Ayam','Yaki Udon','Spicy'] },
  { base:'Soba', cat:'Japanese', pool:'NOODLES', v:['Kuah','Yakisoba','Cold'] },
  { base:'Tempura', cat:'Japanese', pool:'SEAFOOD', v:['Udang','Mix','Sayur'] },
  { base:'Chicken Teriyaki', cat:'Japanese', pool:'GRILLED', v:['Original','Spesial','Jumbo'] },
  { base:'Beef Teriyaki', cat:'Japanese', pool:'GRILLED', v:['Original','Spesial'] },
  { base:'Karaage', cat:'Japanese', pool:'FRIED_CHICKEN', v:['Original','Spicy','Spesial'] },
  { base:'Katsu Don', cat:'Japanese', pool:'FRIED_CHICKEN', v:['Chicken Katsu','Beef Katsu'] },
  { base:'Oyakodon', cat:'Japanese', pool:'FRIED_CHICKEN', v:['Original','Spesial'] },
  { base:'Nasi Goreng Jepang', cat:'Japanese', pool:'FRIED_RICE', v:['Spesial','Seafood'] },
  { base:'Edamame', cat:'Japanese', pool:'VEGAN', v:['Rebus','Rasa Garlic Butter','Spicy'] },

  // ── KOREAN ─────────────────────────────────────────────────
  { base:'Bibimbap', cat:'Korean', pool:'KOREAN', v:['Original','Beef','Vegetarian','Spicy'] },
  { base:'Korean Fried Chicken', cat:'Korean', pool:'FRIED_CHICKEN', v:['Original','Yangnyeom','Honey Butter','Spicy'] },
  { base:'Tteokbokki', cat:'Korean', pool:'KOREAN', v:['Original','Spicy','Rose Sauce','Cheese'] },
  { base:'Ramyeon', cat:'Korean', pool:'RAMEN', v:['Original','Spicy','Kimchi','Army Stew'] },
  { base:'Japchae', cat:'Korean', pool:'NOODLES', v:['Original','Spesial'] },
  { base:'Kimchi Jjigae', cat:'Korean', pool:'SOUP', v:['Tofu','Daging'] },
  { base:'Army Stew', cat:'Korean', pool:'SOUP', v:['Original','Spesial'] },
  { base:'Kimbap', cat:'Korean', pool:'SUSHI', v:['Original','Tuna','Daging','Spesial'] },
  { base:'Dakgalbi', cat:'Korean', pool:'FRIED_CHICKEN', v:['Original','Cheese','Spicy'] },
  { base:'Jajangmyeon', cat:'Korean', pool:'NOODLES', v:['Original','Spesial'] },
  { base:'Sundubu Jjigae', cat:'Korean', pool:'SOUP', v:['Original','Seafood'] },
  { base:'Korean BBQ Set', cat:'Korean', pool:'GRILLED', v:['Samgyeopsal','Dak Galbi','Mix'] },

  // ── WESTERN ────────────────────────────────────────────────
  { base:'Pizza', cat:'Western', pool:'PIZZA', v:['Margherita','Pepperoni','BBQ Chicken','Beef & Mushroom','Spesial'] },
  { base:'Burger', cat:'Western', pool:'BURGER', v:['Classic','Double Beef','BBQ','Mushroom Swiss','Crispy Chicken'] },
  { base:'Chicken Burger', cat:'Western', pool:'BURGER', v:['Crispy','Grilled','Spicy'] },
  { base:'Club Sandwich', cat:'Western', pool:'SANDWICH', v:['Classic','Chicken','BLT'] },
  { base:'Kebab', cat:'Western', pool:'KEBAB', v:['Daging','Ayam','Mix','Jumbo'] },
  { base:'Steak Ribeye', cat:'Western', pool:'STEAK', v:['Well Done','Medium','Rare'] },
  { base:'Beef Steak', cat:'Western', pool:'STEAK', v:['BBQ Sauce','Blackpepper','Mushroom'] },
  { base:'Caesar Salad', cat:'Western', pool:'SALAD', v:['Chicken','Original','Spesial'] },
  { base:'Mushroom Soup', cat:'Western', pool:'SOUP', v:['Cream','Original'] },
  { base:'French Fries', cat:'Western', pool:'TRADITIONAL', v:['Original','Spicy','Cheese','Truffle'] },
  { base:'Chicken Wings', cat:'Western', pool:'FRIED_CHICKEN', v:['BBQ','Buffalo','Honey Garlic','Spicy'] },
  { base:'Hotdog', cat:'Western', pool:'SANDWICH', v:['Classic','Cheese','Spesial'] },

  // ── KOPI & TEH ─────────────────────────────────────────────
  { base:'Kopi Susu', cat:'Kopi & Teh', pool:'ICED_COFFEE', v:['Kekinian','Gula Aren','Brown Sugar','Oat Milk','Spesial'] },
  { base:'Es Kopi Susu', cat:'Kopi & Teh', pool:'ICED_COFFEE', v:['Gula Aren','Klasik','Spesial','Hazelnut'] },
  { base:'Americano', cat:'Kopi & Teh', pool:'COFFEE', v:['Panas','Es','Double Shot'] },
  { base:'Cappuccino', cat:'Kopi & Teh', pool:'COFFEE', v:['Original','Vanilla','Caramel'] },
  { base:'Latte', cat:'Kopi & Teh', pool:'COFFEE', v:['Original','Vanilla','Caramel','Hazelnut','Oat'] },
  { base:'Flat White', cat:'Kopi & Teh', pool:'COFFEE', v:['Original','Spesial'] },
  { base:'Cold Brew', cat:'Kopi & Teh', pool:'ICED_COFFEE', v:['Original','Susu','Black'] },
  { base:'Espresso', cat:'Kopi & Teh', pool:'COFFEE', v:['Single','Double','Ristretto'] },
  { base:'Kopi Hitam', cat:'Kopi & Teh', pool:'COFFEE', v:['Tubruk','Nusantara','Aceh','Toraja','Flores'] },
  { base:'Matcha Latte', cat:'Kopi & Teh', pool:'MATCHA', v:['Panas','Es','Double Matcha'] },
  { base:'Teh Tarik', cat:'Kopi & Teh', pool:'TEA', v:['Original','Spesial'] },
  { base:'Thai Tea', cat:'Kopi & Teh', pool:'TEA', v:['Original','Susu','Spesial'] },
  { base:'Teh Hijau', cat:'Kopi & Teh', pool:'MATCHA', v:['Es','Panas','Madu'] },
  { base:'Kopi Vietnam', cat:'Kopi & Teh', pool:'ICED_COFFEE', v:['Original','Susu'] },

  // ── MINUMAN PANAS ──────────────────────────────────────────
  { base:'Wedang Jahe', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Susu','Rempah'] },
  { base:'Susu Cokelat Panas', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Extra Cokelat'] },
  { base:'Milo Panas', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Extra Milo'] },
  { base:'Teh Poci', cat:'Minuman Panas', pool:'TEA', v:['Panas','Manis','Spesial'] },
  { base:'Wedang Uwuh', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Spesial'] },
  { base:'Cokelat Panas', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Belgian','Spesial'] },
  { base:'Susu Jahe', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Rempah'] },
  { base:'Bandrek', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Susu'] },
  { base:'Sekoteng', cat:'Minuman Panas', pool:'HOT_DRINK', v:['Original','Spesial'] },
  { base:'Kopi Rempah', cat:'Minuman Panas', pool:'COFFEE', v:['Nusantara','Jahe','Kayu Manis'] },

  // ── MINUMAN DINGIN ─────────────────────────────────────────
  { base:'Es Teh Manis', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Original','Lemon','Susu'] },
  { base:'Es Jeruk', cat:'Minuman Dingin', pool:'JUICE', v:['Peras','Nipis','Limau','Spesial'] },
  { base:'Es Kelapa Muda', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Original','Cokelat','Spesial'] },
  { base:'Boba / Bubble Tea', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Teh Susu','Matcha','Brown Sugar','Spesial'] },
  { base:'Es Cincau', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Original','Susu'] },
  { base:'Es Doger', cat:'Minuman Dingin', pool:'ICE_CREAM', v:['Original','Spesial'] },
  { base:'Milkshake', cat:'Minuman Dingin', pool:'ICE_CREAM', v:['Cokelat','Stroberi','Vanilla','Oreo'] },
  { base:'Yakult Soda', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Original','Lemon','Spesial'] },
  { base:'Infused Water', cat:'Minuman Dingin', pool:'JUICE', v:['Lemon Mint','Stroberi','Timun'] },
  { base:'Es Lemon Tea', cat:'Minuman Dingin', pool:'ICED_DRINK', v:['Original','Spesial'] },

  // ── JUS & SMOOTHIE ─────────────────────────────────────────
  { base:'Jus Alpukat', cat:'Jus & Smoothie', pool:'JUICE', v:['Cokelat','Susu','Original','Milo'] },
  { base:'Jus Mangga', cat:'Jus & Smoothie', pool:'JUICE', v:['Harum Manis','Madu','Spesial'] },
  { base:'Jus Semangka', cat:'Jus & Smoothie', pool:'JUICE', v:['Original','Lemon'] },
  { base:'Jus Tomat', cat:'Jus & Smoothie', pool:'JUICE', v:['Madu','Original'] },
  { base:'Jus Nanas', cat:'Jus & Smoothie', pool:'JUICE', v:['Original','Susu'] },
  { base:'Jus Jambu', cat:'Jus & Smoothie', pool:'JUICE', v:['Merah','Batu','Susu'] },
  { base:'Jus Wortel', cat:'Jus & Smoothie', pool:'JUICE', v:['Madu','Susu'] },
  { base:'Jus Buah Campur', cat:'Jus & Smoothie', pool:'JUICE', v:['Tropis','Spesial','4 Buah'] },
  { base:'Smoothie Mangga', cat:'Jus & Smoothie', pool:'SMOOTHIE', v:['Original','Spesial'] },
  { base:'Smoothie Strawberry', cat:'Jus & Smoothie', pool:'SMOOTHIE', v:['Original','Susu'] },
  { base:'Smoothie Pisang', cat:'Jus & Smoothie', pool:'SMOOTHIE', v:['Original','Cokelat'] },
  { base:'Green Smoothie', cat:'Jus & Smoothie', pool:'SMOOTHIE', v:['Spinach','Kale','Spesial'] },
  { base:'Acai Bowl', cat:'Jus & Smoothie', pool:'BOWL', v:['Original','Granola','Spesial'] },

  // ── SAYUR & SALAD ──────────────────────────────────────────
  { base:'Gado-Gado Betawi', cat:'Sayur & Salad', pool:'SALAD', v:['Original','Spesial','Jumbo'] },
  { base:'Pecel Sayur', cat:'Sayur & Salad', pool:'SALAD', v:['Spesial','Telur'] },
  { base:'Urap-Urap', cat:'Sayur & Salad', pool:'VEGAN', v:['Original','Spesial'] },
  { base:'Sayur Asem', cat:'Sayur & Salad', pool:'SOUP', v:['Betawi','Jawa','Spesial'] },
  { base:'Capcay', cat:'Sayur & Salad', pool:'VEGAN', v:['Kuah','Goreng','Spesial'] },
  { base:'Tumis Kangkung', cat:'Sayur & Salad', pool:'VEGAN', v:['Terasi','Bawang Putih','Spesial'] },
  { base:'Tumis Bayam', cat:'Sayur & Salad', pool:'VEGAN', v:['Bawang','Jagung Muda'] },
  { base:'Greek Salad', cat:'Sayur & Salad', pool:'SALAD', v:['Original','Spesial'] },
  { base:'Garden Salad', cat:'Sayur & Salad', pool:'SALAD', v:['Thousand Island','Vinaigrette','Caesar'] },
  { base:'Coleslaw', cat:'Sayur & Salad', pool:'SALAD', v:['Original','Creamy'] },
  { base:'Avocado Salad', cat:'Sayur & Salad', pool:'SALAD', v:['Original','Spesial'] },
  { base:'Fruit Salad', cat:'Sayur & Salad', pool:'SALAD', v:['Yogurt','Madu','Spesial'] },

  // ── VEGETARIAN / VEGAN ─────────────────────────────────────
  { base:'Nasi Vegetarian', cat:'Vegetarian/Vegan', pool:'VEGAN', v:['Spesial','Jawa','3 Lauk'] },
  { base:'Mie Goreng Vegan', cat:'Vegetarian/Vegan', pool:'NOODLES', v:['Original','Pedas'] },
  { base:'Burger Vegan', cat:'Vegetarian/Vegan', pool:'BURGER', v:['Mushroom Patty','Black Bean','Spesial'] },
  { base:'Buddha Bowl', cat:'Vegetarian/Vegan', pool:'BOWL', v:['Original','Quinoa','Spesial'] },
  { base:'Avocado Toast', cat:'Vegetarian/Vegan', pool:'BREAD', v:['Original','Telur Poached','Spesial'] },
  { base:'Tempe Goreng', cat:'Vegetarian/Vegan', pool:'TRADITIONAL', v:['Crispy','Bacem','Mendoan','Bumbu'] },
  { base:'Tahu Goreng', cat:'Vegetarian/Vegan', pool:'TRADITIONAL', v:['Crispy','Bacem','Sumedang'] },
  { base:'Vegetable Curry', cat:'Vegetarian/Vegan', pool:'CURRY_BEEF', v:['Jepang','Thailand','Padang Style'] },
  { base:'Oatmeal Bowl', cat:'Vegetarian/Vegan', pool:'BOWL', v:['Buah','Madu Granola','Choco Banana'] },
  { base:'Vegetarian Ramen', cat:'Vegetarian/Vegan', pool:'RAMEN', v:['Shoyu','Miso','Spicy'] },
  { base:'Tofu Scramble', cat:'Vegetarian/Vegan', pool:'VEGAN', v:['Original','Spesial'] },
  { base:'Quinoa Bowl', cat:'Vegetarian/Vegan', pool:'BOWL', v:['Vegetable','Protein','Spesial'] },

  // ── FROZEN FOOD ────────────────────────────────────────────
  { base:'Chicken Nugget Frozen', cat:'Frozen Food', pool:'FRIED_CHICKEN', v:['200gr','500gr','1kg'] },
  { base:'Dimsum Frozen', cat:'Frozen Food', pool:'DUMPLING', v:['Mix 20pcs','Ayam 20pcs','Udang 20pcs'] },
  { base:'Siomay Frozen', cat:'Frozen Food', pool:'DUMPLING', v:['Ayam','Ikan','Mix'] },
  { base:'Martabak Frozen', cat:'Frozen Food', pool:'PANCAKE', v:['Fusion','Cokelat','Keju','Spesial'] },
  { base:'Burger Patty Frozen', cat:'Frozen Food', pool:'BURGER', v:['Beef','Chicken','200gr x 4'] },
  { base:'Sosis Frozen', cat:'Frozen Food', pool:'GRILLED', v:['Ayam','Sapi','Mix'] },
  { base:'Pempek Frozen', cat:'Frozen Food', pool:'TRADITIONAL', v:['Kapal Selam 5pcs','Mix 10pcs'] },
  { base:'Bakso Frozen', cat:'Frozen Food', pool:'SOUP', v:['Urat','Halus','Spesial Mix'] },

  // ── PAKET HEMAT ────────────────────────────────────────────
  { base:'Paket Nasi Ayam', cat:'Paket Hemat', pool:'FRIED_CHICKEN', v:['Goreng','Bakar','Geprek','Komplit'] },
  { base:'Paket Nasi Ikan', cat:'Paket Hemat', pool:'SEAFOOD', v:['Lele','Nila','Bakar','Komplit'] },
  { base:'Paket Mie Ayam', cat:'Paket Hemat', pool:'NOODLES', v:['Bakso','Pangsit','Komplit'] },
  { base:'Paket Soto Komplit', cat:'Paket Hemat', pool:'SOUP', v:['Ayam','Daging','Spesial'] },
  { base:'Paket Family Meal', cat:'Paket Hemat', pool:'FRIED_CHICKEN', v:['2 Orang','4 Orang','6 Orang'] },
  { base:'Paket Hemat Makan Siang', cat:'Paket Hemat', pool:'RICE', v:['Nasi + 1 Lauk','Nasi + 2 Lauk'] },
  { base:'Paket Minum + Snack', cat:'Paket Hemat', pool:'ICED_DRINK', v:['Es Teh + Pisgor','Kopi + Roti','Spesial'] },
]

// ============================================================
// CATEGORIES & WEIGHTS
// ============================================================
const CATEGORIES = [
  'Makanan Berat','Makanan Ringan','Roti & Kue','Dessert',
  'Minuman Dingin','Minuman Panas','Kopi & Teh','Jus & Smoothie',
  'Seafood','Ayam & Daging','Sayur & Salad','Mie & Pasta',
  'Nasi & Lauk','Jajanan Tradisional','Japanese','Korean',
  'Western','Vegetarian/Vegan','Frozen Food','Paket Hemat',
]
const CATEGORY_WEIGHTS = [10,8,7,6,5,4,5,4,5,8,4,6,8,5,4,4,3,4,4,6]

// ============================================================
// LOCATIONS & SUPPLIERS DATA
// ============================================================
const JAKARTA_AREAS = [
  'Tebet, Jakarta Selatan','Kebayoran Baru, Jakarta Selatan','Menteng, Jakarta Pusat',
  'Kemang, Jakarta Selatan','Blok M, Jakarta Selatan','Sudirman, Jakarta Pusat',
  'Kuningan, Jakarta Selatan','Senayan, Jakarta Pusat','Pademangan, Jakarta Utara',
  'Pluit, Jakarta Utara','Kelapa Gading, Jakarta Utara','Mangga Besar, Jakarta Barat',
  'Grogol, Jakarta Barat','Kebon Jeruk, Jakarta Barat','Tambora, Jakarta Barat',
  'Jatinegara, Jakarta Timur','Cakung, Jakarta Timur','Kramat Jati, Jakarta Timur',
  'Senen, Jakarta Pusat','Gambir, Jakarta Pusat','Tomang, Jakarta Barat',
  'Muara Baru, Jakarta Utara','Tanjung Priok, Jakarta Utara','Klender, Jakarta Timur',
  'Duren Sawit, Jakarta Timur','Cipete, Jakarta Selatan','Cinere, Jakarta Selatan',
  'Cilandak, Jakarta Selatan','Pasar Minggu, Jakarta Selatan','Jagakarsa, Jakarta Selatan',
]
const BODETABEK_AREAS = [
  'Depok','Bogor Kota','Bekasi Kota','Tangerang Kota','Tangerang Selatan',
  'Serpong','Pondok Aren','BSD City','Cibinong','Citayam',
  'Ciputat','Pamulang','Cinere, Depok','Lenteng Agung','Srengseng Sawah',
  'Kemang, Bogor','Sentul','Citeureup','Jonggol','Cimanggis',
  'Jatiasih','Rawalumbu','Babelan','Tarumajaya','Cikokol',
]
const ALL_AREAS = [...JAKARTA_AREAS, ...BODETABEK_AREAS]

const STORE_PREFIXES = [
  'Warung','Kedai','Tenda','Depot','Rumah Makan','RM','Dapur','Kios',
  'Gerobak','Restoran','Kantin','Pojok','Meja Makan','Gubug','Lesehan',
]
const STORE_NAMES_A = [
  'Bu Dewi','Pak Haji','Bu Siti','Pak Roni','Mbak Rini','Mas Budi',
  'Bu Ani','Pak Joko','Mang Ujang','Neng Erna','Bang Anto','Bu Yanti',
  'Pak Dodi','Mbak Wulan','Bu Lastri','Mang Asep','Bu Nani','Pak Surya',
  'Mas Dedy','Bu Fatimah','Cak Imam','Bu Haryati','Pak Wahid','Bu Sari',
  'Mang Tarno','Bu Endah','Pak Fauzi','Mbak Desi','Bu Sumiati','Pak Bowo',
]
const STORE_DESCS = [
  'menyediakan makanan surplus berkualitas dengan harga terjangkau. Semua produk segar dibuat hari yang sama.',
  'menjual aneka makanan dan minuman surplus dengan harga hemat. Dijamin halal dan lezat!',
  'spesialis masakan rumahan yang lezat. Surplus hari ini tersedia dengan harga spesial.',
  'hadir dengan pilihan menu lengkap berbahan segar. Surplus tersisa bisa Anda dapatkan lebih murah.',
  'menghadirkan cita rasa autentik dengan bahan pilihan. Dapatkan surplus kami sebelum habis!',
]

// ============================================================
// HELPERS
// ============================================================
function weighted(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pad(n, len = 5) {
  return String(n).padStart(len, '0')
}

// ============================================================
// 1. GENERATE SUPPLIERS
// ============================================================
console.log('🔄 Generating 200 suppliers...')
const suppliers = []
for (let i = 1; i <= 200; i++) {
  const area = pick(ALL_AREAS)
  const prefix = pick(STORE_PREFIXES)
  const nameA = pick(STORE_NAMES_A)
  const areaShort = area.split(',')[0]
  suppliers.push({
    id: `sup_${pad(i, 4)}`,
    name: `${prefix} ${nameA} ${areaShort}`,
    address: areaShort,
    fullAddress: `Jl. ${pick(['Besar','Kecil','Raya','Utama','Merdeka','Sejahtera'])} No. ${randInt(1,200)}, ${area}`,
    description: `${prefix} ${nameA} ${STORE_DESCS[i % STORE_DESCS.length]}`,
    phone: `08${randInt(10,99)}${randInt(1000000,9999999)}`,
    avatar: null,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    totalFoods: 0, // akan diupdate
  })
}

// ============================================================
// 2. GENERATE 10.000 FOODS
// ============================================================
console.log('🔄 Generating 10,000 foods dari menu catalog...')

// Buat indeks template per kategori
const templatesByCategory = {}
for (const cat of CATEGORIES) {
  templatesByCategory[cat] = MENU_CATALOG.filter(t => t.cat === cat)
}

const ITEM_VARIANTS = ['Spesial','Jumbo','Mini','Original','Ekonomis','Rumahan','Premium','Istimewa','Klasik','Kekinian']

const foods = []
const catCounts = {}
const templateUsage = {} // { templateBase: count }

for (let i = 1; i <= 10000; i++) {
  // Pilih kategori berdasarkan bobot
  const cat = weighted(CATEGORIES, CATEGORY_WEIGHTS)

  // Pilih template dari kategori
  const catTemplates = templatesByCategory[cat]
  if (!catTemplates || catTemplates.length === 0) continue

  const template = pick(catTemplates)
  const { base, pool, v: templateVariants } = template

  // Hitung berapa kali template ini sudah dipakai (untuk cycling gambar)
  const tKey = `${base}_${cat}`
  if (!templateUsage[tKey]) templateUsage[tKey] = 0
  const useCount = templateUsage[tKey]++

  // Nama: pakai variant dari template, atau varian umum secara acak
  let name
  const allVariants = [...(templateVariants || []), ...ITEM_VARIANTS]
  if (Math.random() < 0.6 && templateVariants && templateVariants.length > 0) {
    name = `${base} ${templateVariants[useCount % templateVariants.length]}`
  } else {
    name = base // nama polos 40% kasus
  }

  // Gambar — cyclic dari pool, bukan random
  const photoIds = P[pool] || P.TRADITIONAL
  const photoId = photoIds[useCount % photoIds.length]
  const imageUrl = `https://images.unsplash.com/${photoId}?w=400&q=80`

  // Harga
  const isMinuman = ['Kopi & Teh','Minuman Panas','Minuman Dingin','Jus & Smoothie'].includes(cat)
  const isBerat = ['Makanan Berat','Ayam & Daging','Seafood','Nasi & Lauk'].includes(cat)
  const baseMin = isMinuman ? 10000 : isBerat ? 20000 : 12000
  const baseMax = isMinuman ? 45000 : isBerat ? 85000 : 55000
  const originalPrice = Math.round(randInt(baseMin, baseMax) / 500) * 500
  const discountPct = pick([0,0,0,10,10,15,15,20,25,30,35,40,50])
  const discountPrice = discountPct > 0
    ? Math.round(originalPrice * (1 - discountPct / 100) / 500) * 500
    : originalPrice

  // Supplier
  const supplier = suppliers[(i - 1) % suppliers.length]

  // Deskripsi
  const descs = [
    `Nikmati ${name} yang lezat dan segar. Stok terbatas, jangan sampai kehabisan!`,
    `${name} buatan rumahan dengan bahan pilihan. Harga hemat untuk porsi kenyang.`,
    `Dapatkan ${name} dengan kualitas terbaik hari ini. Surplus segar tersedia.`,
    `${name} — menu favorit pelanggan setia kami dengan cita rasa autentik.`,
    `Pesan sekarang dan nikmati ${name} yang gurih dan memuaskan.`,
  ]

  const pickupHours = ['09:00','10:00','11:00','11:30','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','20:30','21:00']

  catCounts[cat] = (catCounts[cat] || 0) + 1
  supplier.totalFoods++

  foods.push({
    id: `food_${pad(i)}`,
    name,
    category: cat,
    description: descs[i % descs.length],
    originalPrice,
    discountPrice,
    discount: discountPct,
    stock: randInt(2, 50),
    pickupDeadline: pick(pickupHours),
    image: imageUrl,
    supplierId: supplier.id,
    supplierName: supplier.name,
    outlet: supplier.address,
    address: supplier.fullAddress,
    safetyApproved: Math.random() > 0.15,
    isActive: Math.random() > 0.05,
    createdAt: new Date(Date.now() - randInt(0, 90) * 86400000).toISOString(),
    tags: [],
  })
}

// ============================================================
// 3. WRITE OUTPUT
// ============================================================
const outDir = __dirname
writeFileSync(join(outDir, 'suppliers.json'), JSON.stringify(suppliers, null, 2))
writeFileSync(join(outDir, 'foodsLarge.json'), JSON.stringify(foods, null, 2))

console.log(`✅ Generated ${suppliers.length} suppliers → suppliers.json`)
console.log(`✅ Generated ${foods.length} foods → foodsLarge.json`)
console.log('\n📊 Category breakdown:')
for (const [cat, count] of Object.entries(catCounts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${cat}: ${count}`)
}
console.log('\n📸 Template usage (top 10):')
const topTemplates = Object.entries(templateUsage).sort((a,b)=>b[1]-a[1]).slice(0,10)
for (const [t, c] of topTemplates) {
  console.log(`  ${t}: ${c}x`)
}

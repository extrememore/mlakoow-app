const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultMenus = [
  { name: 'Produk Original', price: 45000 },
  { name: 'Produk Varian Cokelat', price: 55000 },
  { name: 'Produk Premium', price: 85000 },
  { name: 'Paket Oleh-Oleh Besar', price: 150000 },
];

const olehImages = [
  'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=1200&auto=format&fit=crop', // cookies
  'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=1200&auto=format&fit=crop', // bakery/cake
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1200&auto=format&fit=crop', // jar
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=1200&auto=format&fit=crop', // pastry
  'https://images.unsplash.com/photo-1628815870980-f416105d89b3?q=80&w=1200&auto=format&fit=crop', // sambal/jar
];

function getImg(index) {
  return olehImages[index % olehImages.length];
}

const olehSpots = [
  {
    name: "Spikoe Resep Kuno",
    slug: "spikoe-resep-kuno",
    address: "Jl. Rungkut Madya No.41, Surabaya",
    description: "Kue lapis legendaris Surabaya yang dibuat dengan resep kuno warisan keluarga. Teksturnya sangat lembut dan rasanya otentik.",
    ticketPrice: 95000,
    rating: 4.9,
    reviewCount: 3200,
    estimatedDuration: 15,
    lat: -7.3320,
    lng: 112.7750,
    featured: true,
    hiddenGem: false,
    openHour: "07:00",
    closeHour: "20:30",
    facilities: JSON.stringify(["Takeaway", "Pesan Antar", "Legendaris", "Oleh-oleh Premium"]),
    menus: JSON.stringify([
      { name: "Spikoe Reguler (Kismis/Tanpa Kismis)", price: 95000 },
      { name: "Spikoe Besar (Kismis/Tanpa Kismis)", price: 180000 },
      { name: "Spikoe Speculaas", price: 105000 }
    ])
  },
  {
    name: "Lapis Kukus Pahlawan",
    slug: "lapis-kukus-pahlawan",
    address: "Jl. Diponegoro No.73, Surabaya Pusat",
    description: "Lapis kukus khas Surabaya dengan bahan dasar tepung singkong dan taburan keju melimpah. Sangat lembut dan disukai semua kalangan.",
    ticketPrice: 35000,
    rating: 4.7,
    reviewCount: 4500,
    estimatedDuration: 15,
    lat: -7.2885,
    lng: 112.7350,
    featured: true,
    hiddenGem: false,
    openHour: "06:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Cabang Banyak", "Tahan Lama", "Murah", "Takeaway"]),
    menus: JSON.stringify([
      { name: "Lapis Kukus Original", price: 35000 },
      { name: "Lapis Kukus Chocopandan", price: 35000 },
      { name: "Lapis Kukus Brownies", price: 38000 }
    ])
  },
  {
    name: "Wisata Rasa (Almond Crispy)",
    slug: "wisata-rasa-almond",
    address: "Jl. Raya Jemursari No.164, Surabaya Selatan",
    description: "Pelopor Almond Crispy Cheese di Surabaya. Camilan tipis renyah dengan taburan almond dan keju yang nagih banget.",
    ticketPrice: 65000,
    rating: 4.8,
    reviewCount: 2800,
    estimatedDuration: 20,
    lat: -7.3180,
    lng: 112.7420,
    featured: true,
    hiddenGem: false,
    openHour: "07:30",
    closeHour: "21:30",
    facilities: JSON.stringify(["Takeaway", "Oleh-oleh Kering", "Parkir Luas"]),
    menus: JSON.stringify([
      { name: "Almond Crispy Cheese Original", price: 65000 },
      { name: "Almond Crispy Choco", price: 65000 },
      { name: "Almond Crispy Green Tea", price: 70000 }
    ])
  },
  {
    name: "Pusat Oleh-Oleh Bu Rudy",
    slug: "pusat-oleh-oleh-bu-rudy",
    address: "Jl. Dharmahusada No.140, Surabaya Timur",
    description: "Surganya pencinta pedas. Terkenal dengan sambal bawang botolan dan udang crispy yang fenomenal sebagai oleh-oleh wajib dari Surabaya.",
    ticketPrice: 35000,
    rating: 4.8,
    reviewCount: 5600,
    estimatedDuration: 30,
    lat: -7.2650,
    lng: 112.7600,
    featured: true,
    hiddenGem: false,
    openHour: "06:30",
    closeHour: "20:00",
    facilities: JSON.stringify(["Sambal Kemasan", "Pusat Oleh-oleh Lengkap", "Pedes", "Restoran"]),
    menus: JSON.stringify([
      { name: "Sambal Bawang Bu Rudy (Botol)", price: 30000 },
      { name: "Udang Crispy Bu Rudy", price: 45000 },
      { name: "Sambal Terasi & Peda", price: 32000 },
      { name: "Paket Oleh-oleh Komplit", price: 120000 }
    ])
  },
  {
    name: "Kerupuk Ikan Sentra Kenjeran",
    slug: "kerupuk-ikan-kenjeran",
    address: "Kawasan Pantai Kenjeran, Surabaya Timur",
    description: "Sentra produksi dan penjualan kerupuk hasil laut khas pesisir Surabaya. Terdapat kerupuk ikan, terung, hingga keripik tripang.",
    ticketPrice: 25000,
    rating: 4.5,
    reviewCount: 950,
    estimatedDuration: 45,
    lat: -7.2400,
    lng: 112.7950,
    featured: false,
    hiddenGem: true,
    openHour: "08:00",
    closeHour: "18:00",
    facilities: JSON.stringify(["Oleh-oleh Kering", "Grosir", "Murah", "Beli Kiloan"]),
    menus: JSON.stringify([
      { name: "Kerupuk Ikan Payus (Mentah 500g)", price: 30000 },
      { name: "Kerupuk Ikan Kenjeran (Matang)", price: 25000 },
      { name: "Keripik Terung Laut", price: 45000 }
    ])
  },
  {
    name: "Kue Bikang Peneleh",
    slug: "kue-bikang-peneleh",
    address: "Jl. Peneleh No.32, Surabaya Pusat",
    description: "Jajanan tradisional kue bikang yang sudah melegenda sejak lama. Mekar, bersarang sempurna, dan legit.",
    ticketPrice: 20000,
    rating: 4.6,
    reviewCount: 620,
    estimatedDuration: 10,
    lat: -7.2550,
    lng: 112.7400,
    featured: false,
    hiddenGem: true,
    openHour: "06:00",
    closeHour: "14:00",
    facilities: JSON.stringify(["Legendaris", "Kue Basah", "Cepat Habis"]),
    menus: JSON.stringify([
      { name: "Bikang Pandan", price: 6000 },
      { name: "Bikang Cokelat", price: 6000 },
      { name: "Bikang Original", price: 5000 },
      { name: "Box Campur (10 pcs)", price: 55000 }
    ])
  },
  {
    name: "Cakue Peneleh",
    slug: "cakue-peneleh",
    address: "Pasar Atom Mall Lantai 1, Surabaya Utara",
    description: "Cakue isi ayam udang yang sangat populer di Surabaya, dinikmati dengan saus asam manis pedas yang khas.",
    ticketPrice: 25000,
    rating: 4.8,
    reviewCount: 1500,
    estimatedDuration: 15,
    lat: -7.2400,
    lng: 112.7430,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Jajanan Mall", "Takeaway", "Halal", "Legendaris"]),
    menus: JSON.stringify([
      { name: "Cakue Isi Ayam Udang (1 pc)", price: 8000 },
      { name: "Cakue Polos (1 pc)", price: 5000 },
      { name: "Ote-Ote Porong", price: 20000 }
    ])
  },
  {
    name: "Siropen Telasih",
    slug: "siropen-telasih",
    address: "Jl. Mliwis No.5, Surabaya Utara",
    description: "Pabrik sirup pertama di Indonesia yang berdiri sejak 1923. Sirup legendaris yang mempertahankan botol kaca dan resep aslinya.",
    ticketPrice: 35000,
    rating: 4.7,
    reviewCount: 410,
    estimatedDuration: 20,
    lat: -7.2350,
    lng: 112.7350,
    featured: false,
    hiddenGem: true,
    openHour: "08:00",
    closeHour: "16:00",
    facilities: JSON.stringify(["Minuman", "Legendaris", "Heritage", "Botol Kaca"]),
    menus: JSON.stringify([
      { name: "Sirup Frambozen Telasih", price: 35000 },
      { name: "Sirup Mawar Telasih", price: 35000 },
      { name: "Sirup Leci", price: 35000 },
      { name: "Sirup Premium Heritage (Box)", price: 85000 }
    ])
  },
  {
    name: "Bolu Joeang Surabaya",
    slug: "bolu-joeang-surabaya",
    address: "Jl. Raya Gubeng No.1, Surabaya Pusat",
    description: "Bolu kekinian bertema pahlawan dengan kemasan menarik dan rasa yang sangat beraneka ragam.",
    ticketPrice: 32000,
    rating: 4.5,
    reviewCount: 880,
    estimatedDuration: 10,
    lat: -7.2710,
    lng: 112.7480,
    featured: false,
    hiddenGem: false,
    openHour: "07:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Kue Bolu", "Murah", "Oleh-oleh Kekinian"]),
    menus: JSON.stringify([
      { name: "Bolu Joeang Red Velvet", price: 32000 },
      { name: "Bolu Joeang Double Cheese", price: 35000 },
      { name: "Bolu Joeang Cokelat", price: 32000 }
    ])
  },
  {
    name: "Bandeng Asap Sidoarjo (Cabang SBY)",
    slug: "bandeng-asap-sidoarjo-sby",
    address: "Jl. Raya Jemursari, Surabaya Selatan",
    description: "Olahan bandeng asap cabut duri dengan aroma *smokey* yang kuat, disajikan lengkap dengan sambal kecap petis yang lezat.",
    ticketPrice: 75000,
    rating: 4.6,
    reviewCount: 1100,
    estimatedDuration: 15,
    lat: -7.3200,
    lng: 112.7400,
    featured: true,
    hiddenGem: false,
    openHour: "08:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Olahan Ikan", "Tahan Lama", "Vacuum Pack"]),
    menus: JSON.stringify([
      { name: "Bandeng Asap Besar", price: 85000 },
      { name: "Bandeng Asap Sedang", price: 70000 },
      { name: "Bandeng Presto", price: 55000 },
      { name: "Otak-otak Bandeng", price: 65000 }
    ])
  },
  {
    name: "Belinjo Udang Boyya",
    slug: "belinjo-udang-boyya",
    address: "Jl. Kedungdoro No. 120, Surabaya Pusat",
    description: "Kerupuk emping belinjo berbentuk pipih dengan balutan bumbu udang manis pedas. Sangat renyah dan bikin ketagihan.",
    ticketPrice: 45000,
    rating: 4.7,
    reviewCount: 520,
    estimatedDuration: 15,
    lat: -7.2650,
    lng: 112.7300,
    featured: false,
    hiddenGem: true,
    openHour: "08:00",
    closeHour: "20:00",
    facilities: JSON.stringify(["Camilan Kering", "Legendaris", "Takeaway"]),
    menus: JSON.stringify([
      { name: "Belinjo Udang Boyya (Manis)", price: 45000 },
      { name: "Belinjo Udang Boyya (Pedas)", price: 45000 },
      { name: "Belinjo Udang Mentah (Box)", price: 85000 }
    ])
  },
  {
    name: "Petis Udang Sidoarjo (Ny. Siok Cab. Sby)",
    slug: "petis-udang-ny-siok",
    address: "Pasar Genteng Baru, Surabaya Pusat",
    description: "Bumbu petis udang berkualitas super dengan tekstur kental dan rasa gurih manis khas Jawa Timur. Cocok untuk rujak dan gorengan.",
    ticketPrice: 40000,
    rating: 4.8,
    reviewCount: 650,
    estimatedDuration: 20,
    lat: -7.2600,
    lng: 112.7380,
    featured: true,
    hiddenGem: false,
    openHour: "07:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Bumbu Dapur", "Oleh-oleh Khas", "Pasar Tradisional"]),
    menus: JSON.stringify([
      { name: "Petis Udang Super (Cepuk Besar)", price: 55000 },
      { name: "Petis Udang Biasa (Cepuk Sedang)", price: 35000 },
      { name: "Petis Bumbu Siap Pakai", price: 25000 }
    ])
  },
  {
    name: "Abon Sapi Padmosusastro",
    slug: "abon-sapi-padmo",
    address: "Jl. Padmosusastro, Surabaya Barat",
    description: "Abon sapi asli dengan serat daging yang jelas dan bumbu rempah meresap. Ada pilihan rasa manis dan pedas.",
    ticketPrice: 85000,
    rating: 4.7,
    reviewCount: 480,
    estimatedDuration: 10,
    lat: -7.2850,
    lng: 112.7250,
    featured: false,
    hiddenGem: true,
    openHour: "08:00",
    closeHour: "18:00",
    facilities: JSON.stringify(["Oleh-oleh Kering", "Tahan Lama", "Legendaris"]),
    menus: JSON.stringify([
      { name: "Abon Sapi Manis (250g)", price: 85000 },
      { name: "Abon Sapi Pedas (250g)", price: 85000 },
      { name: "Dendeng Sapi Manis", price: 95000 }
    ])
  },
  {
    name: "Roti In Surabaya",
    slug: "roti-in-surabaya",
    address: "Jl. Jemursari No.128, Surabaya Selatan",
    description: "Toko roti legendaris dengan andalan Roti Sisir mentega kuno yang empuk dan harum.",
    ticketPrice: 30000,
    rating: 4.6,
    reviewCount: 920,
    estimatedDuration: 15,
    lat: -7.3150,
    lng: 112.7400,
    featured: false,
    hiddenGem: false,
    openHour: "07:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Bakery", "Legendaris", "Roti Kuno"]),
    menus: JSON.stringify([
      { name: "Roti Sisir Mentega (Box)", price: 45000 },
      { name: "Roti Sobek Cokelat Keju", price: 35000 },
      { name: "Roti Bluder Isi", price: 12000 }
    ])
  },
  {
    name: "Kue Mente Nyonya",
    slug: "kue-mente-nyonya",
    address: "Pasar Atom Mall, Surabaya Utara",
    description: "Kue kering berbahan dasar kacang mete berkualitas dengan tekstur renyah dan *buttery* lumer di mulut.",
    ticketPrice: 110000,
    rating: 4.8,
    reviewCount: 390,
    estimatedDuration: 15,
    lat: -7.2400,
    lng: 112.7430,
    featured: false,
    hiddenGem: true,
    openHour: "10:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Premium Cookies", "Jajanan Mall", "Takeaway"]),
    menus: JSON.stringify([
      { name: "Kue Mente Toples Besar", price: 120000 },
      { name: "Kue Mente Toples Kecil", price: 65000 },
      { name: "Kastengel Premium", price: 135000 }
    ])
  }
];

async function seed() {
  let cat = await prisma.category.findUnique({ where: { slug: 'oleh-oleh' } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { name: 'Oleh-Oleh', slug: 'oleh-oleh', icon: '🛍️', color: '#10B981' } // Emerald green
    });
  }

  console.log('Menambahkan 15 Destinasi Oleh-Oleh...');

  for (let i = 0; i < olehSpots.length; i++) {
    const dest = olehSpots[i];
    
    // Tentukan Area dari address jika belum fix
    let area = "Surabaya Pusat";
    if (dest.address.includes('Selatan')) area = 'Surabaya Selatan';
    if (dest.address.includes('Utara')) area = 'Surabaya Utara';
    if (dest.address.includes('Timur')) area = 'Surabaya Timur';
    if (dest.address.includes('Barat')) area = 'Surabaya Barat';

    const img1 = getImg(i * 3);
    const img2 = getImg(i * 3 + 1);
    const img3 = getImg(i * 3 + 2);
    const gallery = JSON.stringify([img1, img2, img3]);

    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {
        ...dest,
        area,
        categoryId: cat.id,
        mainImage: img1,
        gallery: gallery,
      },
      create: {
        ...dest,
        area,
        categoryId: cat.id,
        mainImage: img1,
        gallery: gallery,
      }
    });
  }

  console.log('Selesai!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

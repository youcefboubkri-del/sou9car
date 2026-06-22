import { createClient } from '@libsql/client';
import { randomBytes } from 'crypto';

const c = createClient({ url: 'file:./dev.db' });
const id = () => randomBytes(12).toString('hex');
const now = new Date().toISOString();
const sellerId = 'cmpv8ovfi0000xgh0arxn75o8';

const listings = [
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Citroën C4 Exclusive 1.6 HDi — Toutes Options',
    brand: 'Citroën', model: 'C4', year: 2011, mileage: 200000,
    price: 123000, fuelType: 'Diesel', transmission: 'Manuelle', bodyType: 'Berline',
    city: 'Fès', doors: 5, color: null, isFeatured: false,
    description: 'Très belle voiture familiale, peinture d\'origine, jamais accidentée, aucune réparation à prévoir. Version Exclusive toutes options.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149912195-104512.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149912197-188557.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149912200-958676.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149912199-896103.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149912201-898441.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Dacia Sandero 2024 — Diesel 60 000 km Première Main',
    brand: 'Dacia', model: 'Sandero', year: 2024, mileage: 60000,
    price: 142000, fuelType: 'Diesel', transmission: 'Manuelle', bodyType: 'Citadine',
    city: 'Casablanca', doors: 5, color: null, isFeatured: false,
    description: 'Dacia Sandero Diesel Manuel 2024 en excellent état. Première main, importation neuve. Équipements: airbags, clim, GPS, radar recul, ABS, ESP, régulateur de vitesse, Bluetooth.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149911370-990874.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149911368-916442.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149911369-579603.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149911367-773759.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Toyota Yaris Hybrid 2023 — Gris Foncé Haute Gamme',
    brand: 'Toyota', model: 'Yaris', year: 2023, mileage: 56300,
    price: 260000, fuelType: 'Hybride', transmission: 'Automatique', bodyType: 'Citadine',
    city: 'Fès', doors: 5, color: 'Gris Foncé', isFeatured: true,
    description: 'Voiture comme neuf, première main, haute gamme. Entretien fait toujours chez Toyota du Maroc. Hybride automatique très économique en carburant.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/toyota-yaris-1780772547.jpeg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Peugeot 3008 Automatique 2017 — Toutes Options',
    brand: 'Peugeot', model: '3008', year: 2017, mileage: 113000,
    price: 223000, fuelType: 'Diesel', transmission: 'Automatique', bodyType: 'SUV',
    city: 'Fès', doors: 5, color: null, isFeatured: false,
    description: 'Très belle voiture familiale, peinture d\'origine aucune retouche, jamais accidentée, aucune réparation à prévoir. Boîte automatique. Possibilité de reprise.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906383-731635.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906382-465779.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906381-586974.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906384-957565.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906385-540854.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149906386-124699.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Audi A3 Berline 1.6 TDI S-Tronic 2015 — Inspectée',
    brand: 'Audi', model: 'A3', year: 2015, mileage: 212905,
    price: 185000, fuelType: 'Diesel', transmission: 'Automatique', bodyType: 'Berline',
    city: 'Casablanca', doors: 4, color: null, isFeatured: false,
    description: 'Audi A3 Berline 1.6 TDI Prestige S-Tronic 7 BVA 105ch. Inspectée sur 150 points de contrôle. Aucun accident ni problème administratif. Deuxième propriétaire. Origine Maroc.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904044-905991.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904047-475833.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904049-569973.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904052-141971.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904054-183411.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149904056-277716.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Hyundai Tucson N-Line 2025 — SUV Diesel Automatique',
    brand: 'Hyundai', model: 'Tucson', year: 2025, mileage: 89804,
    price: 360000, fuelType: 'Diesel', transmission: 'Automatique', bodyType: 'SUV',
    city: 'Casablanca', doors: 5, color: null, isFeatured: true,
    description: 'SUV au design sportif et moderne. Finition N-Line, excellente dotation. Véhicule expertisé, contrôlé et garanti. Parfait état général.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887229-469221.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887231-408971.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887230-435641.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887232-130024.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887228-163632.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887233-306833.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149887234-801975.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'Dacia Duster 1.5 dCi EDC 2021 — Automatique Première Main',
    brand: 'Dacia', model: 'Duster', year: 2021, mileage: 109527,
    price: 200000, fuelType: 'Diesel', transmission: 'Automatique', bodyType: 'SUV',
    city: 'Casablanca', doors: 5, color: null, isFeatured: false,
    description: 'Dacia Duster 1.5 dCi 110 EDC Essentiel. Première main, véhicule préparé. Financement disponible à partir de 1 960 DH/mois.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883637-211842.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883638-472134.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883640-603476.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883641-321511.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883643-685725.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149883644-221481.jpg',
    ]
  },
  {
    id: id(), sellerId, status: 'ACTIVE',
    title: 'BMW Série 3 318d Sport 2022 — 39 000 km Certifiée',
    brand: 'BMW', model: 'Série 3', year: 2022, mileage: 39421,
    price: 410000, fuelType: 'Diesel', transmission: 'Automatique', bodyType: 'Berline',
    city: 'Casablanca', doors: 4, color: null, isFeatured: true,
    description: 'BMW Série 3 318d Sport 2022. Première main, contrôle rigoureux. Financement à partir de 4 018 DH/mois. Véhicule certifié, excellent état.',
    images: [
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885031-496816.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885034-407337.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885038-731147.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885040-711471.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885043-364154.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885046-501862.jpg',
      'https://v3.moteur.ma/storage/media/images/ads/resized/10149885049-246599.jpg',
    ]
  },
];

async function insertAll() {
  for (const l of listings) {
    await c.execute({
      sql: `INSERT INTO listings (id,sellerId,title,description,brand,model,year,mileage,price,currency,fuelType,transmission,bodyType,color,doors,city,status,isFeatured,isVintage,isImport,isDamaged,hasWarranty,views,createdAt,updatedAt)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,?,?,?)`,
      args: [l.id, l.sellerId, l.title, l.description, l.brand, l.model, l.year, l.mileage, l.price, 'MAD', l.fuelType, l.transmission, l.bodyType || null, l.color || null, l.doors || null, l.city, l.status, l.isFeatured ? 1 : 0, Math.floor(Math.random() * 500), now, now]
    });
    for (let i = 0; i < l.images.length; i++) {
      await c.execute({
        sql: 'INSERT INTO listing_images (id,listingId,url,"order",createdAt) VALUES (?,?,?,?,?)',
        args: [id(), l.id, l.images[i], i, now]
      });
    }
    console.log('Inserted:', l.title);
  }
  const r = await c.execute('SELECT COUNT(*) as n FROM listings');
  const ri = await c.execute('SELECT COUNT(*) as n FROM listing_images');
  console.log('Total listings:', r.rows[0].n);
  console.log('Total images:', ri.rows[0].n);
}

insertAll().catch(console.error);

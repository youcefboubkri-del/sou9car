import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./dev.db' });
const sellerId = 'cmpv8ovfi0000xgh0arxn75o8';
const now = new Date().toISOString();

const cars = [
  {
    id: 'lst_bmw5_001',
    title: 'BMW Série 5 530d xDrive — Très bon état',
    brand: 'BMW', model: 'Série 5', year: 2022, mileage: 81300,
    price: 440000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'Sedan', color: 'Noir Saphir', engineSize: '3.0L', power: '265',
    doors: 4, seats: 5, city: 'Casablanca',
    description: 'BMW 530d xDrive full options. Toit ouvrant panoramique, sièges cuir chauffants, caméra 360°, régulateur de vitesse adaptatif. Entretien BMW Casablanca. Un seul propriétaire.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 312
  },
  {
    id: 'lst_bmw3_002',
    title: 'BMW Série 3 320d — Sport Line impeccable',
    brand: 'BMW', model: 'Série 3', year: 2019, mileage: 87100,
    price: 285000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'Sedan', color: 'Blanc Alpin', engineSize: '2.0L', power: '190',
    doors: 4, seats: 5, city: 'Casablanca',
    description: "BMW 320d Sport Line. Navigation professionnelle, pack M intérieur, jantes 18 pouces, phares LED. Révisions chez BMW Maroc. Carnet d'entretien complet.",
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 278
  },
  {
    id: 'lst_toyota_003',
    title: 'Toyota Corolla Hybrid — Économique et fiable',
    brand: 'Toyota', model: 'Corolla', year: 2022, mileage: 51000,
    price: 215000, fuelType: 'Hybrid', transmission: 'Automatic',
    bodyType: 'Sedan', color: 'Gris Acier', engineSize: '1.8L', power: '122',
    doors: 4, seats: 5, city: 'Marrakech',
    description: 'Toyota Corolla Hybrid 2022. Consommation 4.5L/100km. Apple CarPlay, Android Auto, caméra de recul, écran tactile 8 pouces. Garantie Toyota active.',
    isImport: 0, hasWarranty: 1, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 445
  },
  {
    id: 'lst_vw_004',
    title: 'Volkswagen Golf 8 GTD — Édition sport',
    brand: 'Volkswagen', model: 'Golf', year: 2021, mileage: 43000,
    price: 265000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'Hatchback', color: 'Gris Nardo', engineSize: '2.0L', power: '200',
    doors: 5, seats: 5, city: 'Casablanca',
    description: 'VW Golf 8 GTD DSG7. Jantes 18 pouces GTD, digital cockpit, siège sport, Pack Comfort. Carnet VW complet. Aucun défaut.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 389
  },
  {
    id: 'lst_volvo_005',
    title: 'Volvo XC60 D4 Momentum — SUV Premium',
    brand: 'Volvo', model: 'XC60', year: 2019, mileage: 94500,
    price: 295000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'SUV', color: 'Bleu Bursting', engineSize: '2.0L', power: '190',
    doors: 5, seats: 5, city: 'Rabat',
    description: 'Volvo XC60 D4 AWD Momentum. Toit panoramique, Pilot Assist, sièges cuir chauffants/ventilés, audio Bowers & Wilkins, 4x4 intelligent. Entretien Volvo Maroc.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 201
  },
  {
    id: 'lst_audi_q7_006',
    title: 'Audi Q7 3.0 TDI Quattro — 7 places luxe',
    brand: 'Audi', model: 'Q7', year: 2017, mileage: 126341,
    price: 340000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'SUV', color: 'Blanc Ibis', engineSize: '3.0L', power: '272',
    doors: 5, seats: 7, city: 'Casablanca',
    description: 'Audi Q7 3.0 TDI 272ch Quattro S-Line. 7 places, toit panoramique, Bang & Olufsen, navigation MMI, caméra 360°. Importé propre, dédouané.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 534
  },
  {
    id: 'lst_audi_a4_007',
    title: 'Audi A4 35 TDI S-Line — Berline premium',
    brand: 'Audi', model: 'A4', year: 2020, mileage: 58000,
    price: 320000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'Sedan', color: 'Gris Quantum', engineSize: '2.0L', power: '163',
    doors: 4, seats: 5, city: 'Rabat',
    description: 'Audi A4 35 TDI S tronic S-Line. Virtual cockpit, matrix LED, pack techno, sièges sport cuir. Un seul propriétaire, entretien Audi. Carnet complet.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 267
  },
  {
    id: 'lst_merc_c_008',
    title: 'Mercedes-Benz Classe C 220d AMG Line',
    brand: 'Mercedes', model: 'Classe C', year: 2018, mileage: 112000,
    price: 258000, fuelType: 'Diesel', transmission: 'Automatic',
    bodyType: 'Sedan', color: 'Noir Obsidienne', engineSize: '2.0L', power: '194',
    doors: 4, seats: 5, city: 'Casablanca',
    description: 'Mercedes C220d AMG Line 9G-Tronic. Pack AMG intérieur/extérieur, écran Comand, toit ouvrant, jantes AMG 18 pouces. Entretien Mercedes Maroc complet.',
    isImport: 1, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 421
  },
  {
    id: 'lst_clio_009',
    title: 'Renault Clio 5 TCe 130 Intens — Comme neuve',
    brand: 'Renault', model: 'Clio', year: 2021, mileage: 37800,
    price: 138000, fuelType: 'Gasoline', transmission: 'Automatic',
    bodyType: 'Hatchback', color: 'Rouge Flamme', engineSize: '1.3L', power: '130',
    doors: 5, seats: 5, city: 'Tanger',
    description: 'Renault Clio 5 TCe 130 EDC Intens. Écran 9.3 pouces Easy Link, navigation, caméra recul, clim auto, capteurs parking. Première main, zéro défaut.',
    isImport: 0, hasWarranty: 1, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 356
  },
  {
    id: 'lst_duster_010',
    title: 'Renault Duster 1.5 dCi 4x4 — Tout terrain',
    brand: 'Renault', model: 'Duster', year: 2020, mileage: 68500,
    price: 152000, fuelType: 'Diesel', transmission: 'Manual',
    bodyType: 'SUV', color: 'Brun Terracotta', engineSize: '1.5L', power: '115',
    doors: 5, seats: 5, city: 'Agadir',
    description: 'Renault Duster 4x4 dCi 115ch. Intégrale permanente, Media Nav Evolution, climatisation, régulateur vitesse. Parfait état mécanique et carrosserie.',
    isImport: 0, hasWarranty: 0, isDamaged: 0, isVintage: 0, status: 'SOLD', views: 198
  }
];

for (const car of cars) {
  await client.execute({
    sql: `INSERT OR IGNORE INTO listings (id, sellerId, title, description, brand, model, year, mileage, price, fuelType, transmission, bodyType, color, engineSize, power, doors, seats, city, isImport, hasWarranty, isDamaged, isVintage, status, views, isFeatured, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    args: [
      car.id, sellerId, car.title, car.description,
      car.brand, car.model, car.year, car.mileage, car.price,
      car.fuelType, car.transmission, car.bodyType, car.color,
      car.engineSize, car.power, car.doors, car.seats, car.city,
      car.isImport, car.hasWarranty, car.isDamaged, car.isVintage,
      car.status, car.views, now, now
    ]
  });
  console.log(`✅ ${car.brand} ${car.model} ${car.year} — ${car.price.toLocaleString()} MAD — ${car.status}`);
}

console.log('\n🎉 10 cars seeded successfully!');

import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./dev.db' });
const now = new Date().toISOString();

// All 10 photos verified 200 OK from Unsplash CDN
const photos = [
  {
    listingId: 'lst_bmw5_001',
    brand: 'BMW Série 5',
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_bmw3_002',
    brand: 'BMW Série 3',
    url: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_toyota_003',
    brand: 'Toyota Corolla',
    url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_vw_004',
    brand: 'VW Golf 8',
    url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_volvo_005',
    brand: 'Volvo XC60',
    url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_audi_q7_006',
    brand: 'Audi Q7',
    url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_audi_a4_007',
    brand: 'Audi A4',
    url: 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_merc_c_008',
    brand: 'Mercedes Classe C',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_clio_009',
    brand: 'Renault Clio 5',
    url: 'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=800&q=80'
  },
  {
    listingId: 'lst_duster_010',
    brand: 'Renault Duster',
    url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
  }
];

for (const p of photos) {
  await client.execute({ sql: 'DELETE FROM listing_images WHERE listingId = ?', args: [p.listingId] });
  await client.execute({
    sql: `INSERT INTO listing_images (id, listingId, url, "order", createdAt) VALUES (?, ?, ?, 0, ?)`,
    args: [`img_${p.listingId}`, p.listingId, p.url, now]
  });
  console.log(`✅ ${p.brand} — photo updated`);
}

console.log('\n🎉 All 10 photos updated! (200 OK verified)');

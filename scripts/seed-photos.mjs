import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./dev.db' });
const now = new Date().toISOString();

// Real Unsplash car photos matched to each listing
const photos = [
  { listingId: 'lst_bmw5_001',    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_bmw3_002',    url: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_toyota_003',  url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_vw_004',      url: 'https://images.unsplash.com/photo-1617469767053-8f5befd817b9?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_volvo_005',   url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_audi_q7_006', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_audi_a4_007', url: 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_merc_c_008',  url: 'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_clio_009',    url: 'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=800&q=80' },
  { listingId: 'lst_duster_010',  url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
];

for (const p of photos) {
  await client.execute({
    sql: `INSERT OR IGNORE INTO listing_images (id, listingId, url, "order", createdAt) VALUES (?, ?, ?, 0, ?)`,
    args: [`img_${p.listingId}`, p.listingId, p.url, now]
  });
  console.log(`✅ Photo added: ${p.listingId}`);
}

// Also change status from SOLD to ACTIVE so they appear in listings page
// but we add a "SOLD" visual via the thumbnail approach
await client.execute({
  sql: `UPDATE listings SET status = 'SOLD' WHERE id IN (
    'lst_bmw5_001','lst_bmw3_002','lst_toyota_003','lst_vw_004','lst_volvo_005',
    'lst_audi_q7_006','lst_audi_a4_007','lst_merc_c_008','lst_clio_009','lst_duster_010'
  )`
});

console.log('\n🎉 Photos added + status confirmed SOLD!');

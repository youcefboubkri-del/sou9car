import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./dev.db' });
const now = new Date().toISOString();

// Wikipedia Commons — exact model photos, correct year/trim
const photos = [
  {
    listingId: 'lst_bmw5_001',
    // BMW Série 5 G30 2021
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/BMW_5_Series_G30_sedan_%282021%29.jpg/1200px-BMW_5_Series_G30_sedan_%282021%29.jpg'
  },
  {
    listingId: 'lst_bmw3_002',
    // BMW Série 3 G20 2019
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/BMW_3er_G20_%28cropped%29.jpg/1200px-BMW_3er_G20_%28cropped%29.jpg'
  },
  {
    listingId: 'lst_toyota_003',
    // Toyota Corolla E210 2022
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/2022_Toyota_Corolla_sedan_%28facelift%2C_white%29%2C_front_8.16.19.jpg/1200px-2022_Toyota_Corolla_sedan_%28facelift%2C_white%29%2C_front_8.16.19.jpg'
  },
  {
    listingId: 'lst_vw_004',
    // Volkswagen Golf VIII 2021
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Volkswagen_Golf_VIII_IMG_3192.jpg/1200px-Volkswagen_Golf_VIII_IMG_3192.jpg'
  },
  {
    listingId: 'lst_volvo_005',
    // Volvo XC60 facelift 2019
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Volvo_XC60_facelift.jpg/1200px-Volvo_XC60_facelift.jpg'
  },
  {
    listingId: 'lst_audi_q7_006',
    // Audi Q7 4M 2017
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Audi_Q7_50_TDI_quattro_S-line_%284M%2C_facelift%2C_grey%29%2C_front_8.21.19.jpg/1200px-Audi_Q7_50_TDI_quattro_S-line_%284M%2C_facelift%2C_grey%29%2C_front_8.21.19.jpg'
  },
  {
    listingId: 'lst_audi_a4_007',
    // Audi A4 B9 S-line 2020
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Audi_A4_B9_Facelift_IMG_2697.jpg/1200px-Audi_A4_B9_Facelift_IMG_2697.jpg'
  },
  {
    listingId: 'lst_merc_c_008',
    // Mercedes-Benz C-Class W205 2018 AMG
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Mercedes-Benz_C_43_AMG_4MATIC_%28W205%2C_facelift%2C_grey%29%2C_front_8.21.19.jpg/1200px-Mercedes-Benz_C_43_AMG_4MATIC_%28W205%2C_facelift%2C_grey%29%2C_front_8.21.19.jpg'
  },
  {
    listingId: 'lst_clio_009',
    // Renault Clio V 2021
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Renault_Clio_V_2019_003.jpg/1200px-Renault_Clio_V_2019_003.jpg'
  },
  {
    listingId: 'lst_duster_010',
    // Renault Duster II 4x4 2020
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Dacia_Duster_II_P1250397.jpg/1200px-Dacia_Duster_II_P1250397.jpg'
  }
];

for (const p of photos) {
  const imgId = `img_${p.listingId}`;
  // Delete old photo first
  await client.execute({ sql: 'DELETE FROM listing_images WHERE listingId = ?', args: [p.listingId] });
  // Insert new correct photo
  await client.execute({
    sql: `INSERT INTO listing_images (id, listingId, url, "order", createdAt) VALUES (?, ?, ?, 0, ?)`,
    args: [imgId, p.listingId, p.url, now]
  });
  console.log(`✅ Updated photo: ${p.listingId}`);
}

console.log('\n🎉 All photos updated with correct Wikipedia Commons images!');

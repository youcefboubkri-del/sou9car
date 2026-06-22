import https from 'https';
import { createWriteStream } from 'fs';

const urls = [
  { name: "Auto Ayoub Prestige", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/468304/auto-ayoub-prestige.html" },
  { name: "Maison Occaz Sarl", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/510298/maison-occaz-sarl.html" },
  { name: "Dreamcars", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/510132/dreamcars.html" },
  { name: "Madini Car Center", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/509500/madini-car-center.html" },
  { name: "Garage Lahcen", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/117825/garage-lahcen.html" },
  { name: "2M Drive", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/509386/2m-drive.html" },
  { name: "Corniche Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/79129/corniche-auto.html" },
  { name: "GT Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/325181/gt-auto.html" },
  { name: "Auto Reda", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/459989/auto-reda.html" },
  { name: "El Asri Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/487421/el-asri-auto.html" },
  { name: "Belair Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/368540/belair-auto.html" },
  { name: "Global Occaz", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/372989/global-occaz.html" },
  { name: "AutoCash", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/500759/autocash.html" },
  { name: "SuperCars", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/499540/supercars.html" },
  { name: "Supreme Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/498113/supreme-auto.html" },
  { name: "Mint Luxe Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/100232/mint-luxe-auto.html" },
  { name: "Luxury Auto", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/72353/luxury-auto.html" },
  { name: "FirstChoice", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/21796/firstchoice.html" },
  { name: "Gotha Motors", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/424005/gotha-motors.html" },
  { name: "Elegance Cars", url: "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/stock-professionnel/463772/elegance-cars.html" },
];

function fetch(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(10000, () => { req.destroy(); resolve(''); });
  });
}

function extractPhones(html) {
  // Extract tel: links
  const telMatches = [...html.matchAll(/href="tel:([^"]+)"/g)].map(m => m[1].trim());
  // Extract phone patterns in text
  const textPhones = [...html.matchAll(/(\+212|00212)[.\s\-]?[5-7][\d\s\-\.]{7,10}/g)].map(m => m[0].replace(/\s/g,''));
  const localPhones = [...html.matchAll(/0[5-7]\d{8}/g)].map(m => m[0]);
  const all = [...new Set([...telMatches, ...textPhones, ...localPhones])];
  return all.filter(p => p.replace(/\D/g,'').length >= 9);
}

function extractCity(html) {
  const m = html.match(/Casablanca|Rabat|Marrakech|Tanger|Fès|Agadir|Mohammedia|Kénitra|Oujda|Meknès/i);
  return m ? m[0] : 'N/A';
}

const results = [];

for (const dealer of urls) {
  const html = await fetch(dealer.url);
  const phones = extractPhones(html);
  const city = extractCity(html);
  results.push({ name: dealer.name, city, phones });
  if (phones.length > 0) {
    console.log(`✅ ${dealer.name} (${city}): ${phones.join(', ')}`);
  } else {
    console.log(`❌ ${dealer.name}: no phone found`);
  }
  await new Promise(r => setTimeout(r, 500)); // be polite
}

console.log('\n=== SUMMARY ===');
const withPhones = results.filter(r => r.phones.length > 0);
console.log(`Found phones for ${withPhones.length}/${results.length} dealers\n`);
withPhones.forEach(r => console.log(`${r.name} | ${r.city} | ${r.phones[0]}`));

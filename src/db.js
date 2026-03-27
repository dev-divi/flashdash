import Dexie from 'dexie';

export const db = new Dexie('FlashDashDB');

db.version(1).stores({
  settings: 'key',          // key, value  (single-row pattern)
  jobs:     '++id, status, timestamp',
  presets:  '++id, order',
});

// Default service presets
const DEFAULT_PRESETS = [
  { name: 'Basic Wash',      price: 50,  order: 0 },
  { name: 'Full Detail',     price: 150, order: 1 },
  { name: 'Interior Only',   price: 80,  order: 2 },
  { name: 'Ceramic Coat',    price: 500, order: 3 },
  { name: 'Wash & Wax',      price: 100, order: 4 },
];

// Seed presets on first launch
export async function seedDefaults() {
  const count = await db.presets.count();
  if (count === 0) {
    await db.presets.bulkAdd(DEFAULT_PRESETS);
  }
  const biz = await db.settings.get('businessName');
  if (!biz) {
    await db.settings.bulkPut([
      { key: 'businessName',  value: 'My Detailing Co.' },
      { key: 'businessPhone', value: '' },
      { key: 'businessEmail', value: '' },
      { key: 'logo',          value: '' },
      { key: 'stripeLink',    value: '' },
    ]);
  }
}

/* Mahsulotlar ma'lumotlari: barcha rasmlar public/images/cards ichidan */
const IMG_DIR = 'public/images/cards/';

const CATEGORIES = [
  { id: 'all', name: 'Barchasi', cover: 'image-45' },
  { id: 'yotoq', name: "Yotoqxona to'plamlari", cover: 'image-01' },
  { id: 'shkaf', name: 'Shkaflar', cover: 'image-20' },
  { id: 'trelyaj', name: 'Trelyaj va komodlar', cover: 'image-10' },
];

const MODEL_NAMES = [
  'Luna', 'Aurora', 'Milano', 'Verona', 'Bella', 'Royal', 'Sofia', 'Venezia', 'Elegance', 'Grace',
  'Monaco', 'Lotus', 'Diamond', 'Valencia', 'Siena', 'Imperial', 'Opera', 'Palermo', 'Riva', 'Nova',
];

const GROUPS = {
  yotoq: ['01', '02', '03', '04', '05', '06', '12', '14', '15', '17', '18', '19', '22', '25', '26', '27',
    '28', '29', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45',
    '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57'],
  shkaf: ['07', '09', '11', '13', '20', '21', '30'],
  trelyaj: ['08', '10', '16', '23', '24'],
};

const CAT_LABEL = { yotoq: "Yotoqxona to'plami", shkaf: 'Shkaf', trelyaj: 'Trelyaj' };
/* Qidiruv uchun sinonimlar (lotin, kirill, ruscha) */
const CAT_KEYWORDS = {
  yotoq: "yotoq yotoqxona karavot kravat krovat to'plam toplam spalniy spalnya karavat кровать спальня спальный гарнитур ётоқхона",
  shkaf: 'shkaf shkav garderob kiyim javon шкаф гардероб шкаф-купе',
  trelyaj: 'trelyaj trilyaj komod oyna stol tualet трельяж комод зеркало туалетный столик',
};
const BASE_PRICE = { yotoq: 9500000, shkaf: 4200000, trelyaj: 2300000 };
const PRICE_STEP = 350000;
const DISCOUNTS = [0, 0, 10, 0, 15, 0, 0, 20, 0, 5];

/* Deterministik qiymatlar: har safar bir xil ma'lumot chiqadi */
function buildProducts() {
  let index = 0;
  return Object.entries(GROUPS).flatMap(([cat, ids]) =>
    ids.map((num, i) => {
      index += 1;
      const fullPrice = BASE_PRICE[cat] + ((index * 731) % 23) * PRICE_STEP;
      const discount = DISCOUNTS[index % DISCOUNTS.length];
      const gallery = [num, ids[(i + 1) % ids.length], ids[(i + 2) % ids.length]];
      return Object.freeze({
        id: `p${num}`,
        name: `${MODEL_NAMES[index % MODEL_NAMES.length]} ${CAT_LABEL[cat]}`,
        cat,
        catLabel: CAT_LABEL[cat],
        keywords: CAT_KEYWORDS[cat],
        price: discount ? Math.round((fullPrice * (100 - discount)) / 100 / 1000) * 1000 : fullPrice,
        oldPrice: discount ? fullPrice : null,
        discount,
        rating: Number((4.5 + ((index * 7) % 5) / 10).toFixed(1)),
        reviews: 12 + ((index * 37) % 140),
        popularity: (index * 53) % 97,
        isNew: index % 6 === 1,
        images: Object.freeze(gallery.map((n) => `${IMG_DIR}image-${n}.webp`)),
      });
    })
  );
}

const PRODUCTS = Object.freeze(buildProducts());

export const QUIZ_ITEMS = [
  { domain: 'Pengetahuan Umum', text: 'Osteoporosis meningkatkan risiko seseorang mengalami fraktur (patah tulang).', correct: 'Benar' },
  { domain: 'Pengetahuan Umum', text: 'Pada usia 80 tahun, sebagian besar perempuan telah mengalami osteoporosis.', correct: 'Benar' },
  { domain: 'Pengetahuan Umum', text: 'Mulai usia 50 tahun, sebagian besar perempuan berisiko mengalami setidaknya satu kali fraktur sepanjang sisa hidupnya.', correct: 'Benar' },
  { domain: 'Faktor Risiko', text: 'Memiliki massa tulang puncak yang lebih tinggi pada akhir masa kanak-kanak tidak memberikan perlindungan terhadap perkembangan osteoporosis di kemudian hari.', correct: 'Salah' },
  { domain: 'Faktor Risiko', text: 'Osteoporosis lebih sering terjadi pada laki-laki dibandingkan perempuan.', correct: 'Salah' },
  { domain: 'Faktor Risiko', text: 'Jatuh sama pentingnya dengan rendahnya kekuatan tulang dalam menyebabkan fraktur.', correct: 'Benar' },
  { domain: 'Faktor Risiko', text: 'Riwayat keluarga dengan osteoporosis secara signifikan meningkatkan kecenderungan seseorang mengalami osteoporosis.', correct: 'Benar' },
  { domain: 'Pencegahan', text: 'Semua jenis aktivitas fisik sama bermanfaatnya untuk mencegah osteoporosis.', correct: 'Salah' },
  { domain: 'Pencegahan', text: 'Kebutuhan kalsium harian yang memadai dapat terpenuhi hanya dari dua gelas susu per hari.', correct: 'Salah' },
  { domain: 'Pencegahan', text: 'Suplemen kalsium saja sudah cukup untuk mencegah kehilangan massa tulang.', correct: 'Salah' },
  { domain: 'Pencegahan', text: 'Asupan garam yang tinggi merupakan faktor risiko osteoporosis.', correct: 'Benar' },
  { domain: 'Terapi', text: 'Saat ini tidak tersedia pengobatan yang efektif untuk osteoporosis di Indonesia.', correct: 'Salah' },
];

export const QUIZ_OPTIONS = ['Benar', 'Salah', 'Tidak Tahu'];

export const SCORE_BANDS = [
  {
    min: 0,
    max: 4,
    category: 'Kurang',
    interpretation: 'Peserta belum memahami konsep dasar osteoporosis dan PBM; perlu penguatan edukasi pada seluruh domain.',
  },
  {
    min: 5,
    max: 8,
    category: 'Cukup',
    interpretation: 'Peserta memahami sebagian konsep, namun belum konsisten pada domain faktor risiko dan pencegahan.',
  },
  {
    min: 9,
    max: 12,
    category: 'Baik',
    interpretation: 'Ambang keberhasilan program; peserta memahami mayoritas domain dengan baik.',
  },
];

export function getScoreBand(rawScore) {
  return SCORE_BANDS.find((band) => rawScore >= band.min && rawScore <= band.max) ?? SCORE_BANDS[0];
}

const FOOD_GROUPS = {
  'Susu & Olahan Susu': [
    ['Susu UHT full cream 250 ml', 300], ['Susu UHT low fat 250 ml', 320],
    ['Susu kental manis 2 sdm', 65], ['Susu bubuk full cream 30 g', 280],
    ['Susu kedelai 250 ml', 80], ['Susu almond 250 ml', 180], ['Susu oat 250 ml', 120],
    ['Yogurt plain 150 g', 240], ['Yogurt drink 200 ml', 230], ['Keju cheddar 1 slice', 200],
    ['Keju mozzarella 30 g', 220], ['Keju parmesan 1 sdm', 70], ['Es krim vanilla 1 scoop', 90],
    ['Susu cokelat kotak 200 ml', 240], ['Mentega 1 sdm', 3], ['Whipped cream 2 sdm', 20],
  ],
  'Tahu, Tempe & Kedelai': [
    ['Tahu putih 100 g', 350], ['Tahu sutra 100 g', 130], ['Tempe 100 g', 111],
    ['Tempe goreng 100 g', 117], ['Oncom 100 g', 96], ['Tahu bulat goreng 5 buah', 175],
    ['Kembang tahu 50 g', 90],
  ],
  'Ikan & Makanan Laut': [
    ['Ikan teri kering 30 g', 480], ['Ikan teri basah 30 g', 213], ['Sarden kalengan 100 g', 240],
    ['Ikan kembung goreng 100 g', 60], ['Ikan lele goreng 100 g', 53], ['Ikan tongkol 100 g', 35],
    ['Ikan asin 30 g', 165], ['Udang rebus 100 g', 120], ['Cumi rebus 100 g', 32],
    ['Kepiting 100 g', 89], ['Rajungan rebus 100 g', 80], ['Bandeng presto 100 g', 200],
    ['Kerang rebus 100 g', 130], ['Rebon kering 1 sdm', 220],
  ],
  'Daging, Unggas & Telur': [
    ['Ayam goreng 100 g', 11], ['Ayam panggang 100 g', 14], ['Daging sapi 100 g', 12],
    ['Bakso sapi 5 butir', 28], ['Sosis 1 buah', 30], ['Telur rebus 1 butir', 28],
    ['Telur dadar 1 porsi', 32], ['Telur puyuh 5 butir', 40], ['Hati ayam 100 g', 9],
    ['Empal daging 100 g', 15],
  ],
  Sayuran: [
    ['Bayam rebus 100 g', 99], ['Kangkung rebus 100 g', 73], ['Daun singkong rebus 100 g', 165],
    ['Daun pepaya rebus 100 g', 180], ['Brokoli rebus 100 g', 47], ['Sawi hijau rebus 100 g', 102],
    ['Kacang panjang rebus 100 g', 50], ['Daun kelor 100 g', 185], ['Wortel rebus 100 g', 33],
    ['Kol rebus 100 g', 40], ['Terong rebus 100 g', 9], ['Buncis rebus 100 g', 37],
    ['Daun katuk 100 g', 204], ['Genjer rebus 100 g', 62],
  ],
  'Kacang-kacangan & Biji': [
    ['Kacang almond 30 g', 75], ['Kacang merah rebus 100 g', 28], ['Kacang tanah sangrai 30 g', 25],
    ['Edamame rebus 100 g', 63], ['Kacang hijau rebus 100 g', 27], ['Wijen sangrai 1 sdm', 88],
    ['Chia seed 1 sdm', 76], ['Kacang kedelai rebus 100 g', 102], ['Kuaci 30 g', 22],
    ['Selai kacang 1 sdm', 13],
  ],
  Buah: [
    ['Jeruk 1 buah sedang', 52], ['Pisang ambon 1 buah', 8], ['Pepaya 100 g', 24],
    ['Mangga 1 buah sedang', 18], ['Apel 1 buah sedang', 11], ['Jambu biji 1 buah', 18],
    ['Kurma 5 butir', 32], ['Kiwi 1 buah', 34], ['Buah naga 100 g', 9], ['Alpukat 1/2 buah', 8],
  ],
  'Karbohidrat & Roti': [
    ['Nasi putih 100 g', 3], ['Nasi merah 100 g', 7], ['Roti gandum 2 lembar', 60],
    ['Roti tawar putih 2 lembar', 50], ['Oatmeal 100 g', 54], ['Mi instan 1 bungkus', 20],
    ['Kentang rebus 100 g', 12], ['Ubi jalar rebus 100 g', 30], ['Jagung rebus 1 buah', 5],
    ['Singkong rebus 100 g', 16],
  ],
  'Camilan & Lainnya': [
    ['Keripik tempe 30 g', 33], ['Kerupuk udang 30 g', 15], ['Martabak manis 1 potong', 45],
    ['Pisang goreng 2 buah', 14], ['Risoles 1 buah', 22], ['Biskuit gandum 3 keping', 18],
    ['Cokelat batang 40 g', 60], ['Puding susu 1 cup', 110], ['Es teh manis 1 gelas', 2],
    ['Kopi susu 1 gelas', 90],
  ],
  'Masakan Khas Indonesia': [
    ['Gado-gado 1 porsi', 140], ['Pecel 1 porsi', 95], ['Sayur lodeh 1 mangkok', 85],
    ['Soto ayam 1 mangkok', 45], ['Rawon 1 mangkok', 30], ['Sayur asem 1 mangkok', 70],
    ['Capcay 1 porsi', 65], ['Tumis kangkung 1 porsi', 75], ['Opor ayam 1 porsi', 40],
    ['Pepes ikan 1 porsi', 80],
  ],
};

export const FOODS = Object.entries(FOOD_GROUPS).flatMap(([category, items]) =>
  items.map(([name, mg]) => ({ category, name, mg })),
);

export const ACTIVITY_TYPES = [
  'Jalan cepat',
  'Lari',
  'Naik tangga',
  'Latihan beban',
  'Senam menumpu beban',
];

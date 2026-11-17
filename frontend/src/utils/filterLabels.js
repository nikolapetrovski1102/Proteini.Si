// Display names for product filter groups and values.
//
// Categories, sports, goals etc. are stored in the database with English names,
// and some links still filter by those English names, so we translate at render
// time keyed by slug instead of renaming the rows. Unknown slugs (new rows added
// from the admin) fall back to the database name.
import { getCurrentLanguage } from "../Pages/translation/translation";

const [MK, AL, EN] = [0, 1, 2];

const CATEGORIES = {
  "amino-acids": ["Амино киселини", "Aminoacide", "Amino Acids"],
  thermogenics: ["Термогеници", "Termogjenikë", "Thermogenics"],
  monohydrates: ["Монохидрати", "Monohidrate", "Monohydrates"],
  whey: ["Whey протеин", "Proteinë whey", "Whey Protein"],
  carbohydrates: ["Јаглехидрати", "Karbohidrate", "Carbohydrates"],
  "muscle-mass-fast-gain": ["Брзо зголемување на маса", "Rritje e shpejtë e masës", "Fast Mass Gain"],
  "strength-energy-pump": ["Сила / енергија / пумпа", "Forcë / energji / pump", "Strength / Energy / Pump"],
  "fat-burners": ["Согорувачи на маснотии", "Djegës yndyrash", "Fat Burners"],
  tribulus: ["Трибулус", "Tribulus", "Tribulus"],
  "vitamin-c": ["Витамин C", "Vitaminë C", "Vitamin C"],
  muesli: ["Мусли", "Musli", "Muesli"],
  "immune-system": ["Имунитет", "Sistemi imunitar", "Immune System"],
  "drinks-with-carnitine": ["Пијалоци со карнитин", "Pije me karnitinë", "Drinks with Carnitine"],
  weights: ["Тегови", "Pesha", "Weights"],
  magnesium: ["Магнезиум", "Magnez", "Magnesium"],
  "boxing-gloves": ["Боксерски ракавици", "Doreza boksi", "Boxing Gloves"],
  shakers: ["Шејкери", "Shejkerë", "Shakers"],
  "t-shirts-mens": ["Маички", "Bluza", "T-Shirts"],
  "t-shirts-womens": ["Маички", "Bluza", "T-Shirts"],
  "pullovers-hoodies-womens": ["Дуксери", "Duksa", "Pullovers & Hoodies"],
  "pullovers-hoodies-mens": ["Дуксери", "Duksa", "Pullovers & Hoodies"],
  bidons: ["Бидони", "Bidona", "Water Bottles"],
  "hand-wraps": ["Бандажи за раце", "Fasha për duar", "Hand Wraps"],
  zinc: ["Цинк", "Zink", "Zinc"],
  "training-bands-loops": ["Ластици за тренинг", "Llastikë stërvitjeje", "Training Bands & Loops"],
  "instant-drinks": ["Инстант пијалоци", "Pije të çastit", "Instant Drinks"],
  "bones-and-joints": ["Коски и зглобови", "Kockat dhe nyjet", "Bones & Joints"],
  snacks: ["Закуски", "Ushqime të lehta", "Snacks"],
  "vitamin-d": ["Витамин D", "Vitaminë D", "Vitamin D"],
  "carnitine-weight": ["Карнитин", "Karnitinë", "Carnitine"],
  carnitine: ["Карнитин", "Karnitinë", "Carnitine"],
  "endurance-enhancers": ["За издржливост", "Për qëndrueshmëri", "Endurance Enhancers"],
  "muscle-mass-quality-gain": ["Квалитетна мускулна маса", "Masë muskulore cilësore", "Quality Muscle Gain"],
  "energy-isotonic-drinks": ["Енергетски и изотонични пијалоци", "Pije energjike dhe izotonike", "Energy & Isotonic Drinks"],
  "energy-isotonic-drinks-drinks": ["Енергетски и изотонични пијалоци", "Pije energjike dhe izotonike", "Energy & Isotonic Drinks"],
  isolate: ["Изолат", "Izolat", "Isolate"],
  "advanced-types": ["Напредни форми", "Forma të avancuara", "Advanced Types"],
  glutamine: ["Глутамин", "Glutaminë", "Glutamine"],
  definition: ["Дефиниција", "Definim", "Definition"],
  creatine: ["Креатин", "Kreatinë", "Creatine"],
  "protein-blends": ["Протеински мешавини", "Përzierje proteinash", "Protein Blends"],
  "energy-bars": ["Енергетски барови", "Bare energjike", "Energy Bars"],
  "energy-bars-snacks": ["Енергетски барови", "Bare energjike", "Energy Bars"],
  recovery: ["Обновување", "Rikuperim", "Recovery"],
  "mental-focus": ["Ментален фокус", "Fokus mendor", "Mental Focus"],
  "multi-formulas": ["Мулти формули", "Multi-formula", "Multi Formulas"],
  "b-complex": ["Б комплекс", "Kompleks B", "B-Complex"],
  pancakes: ["Палачинки", "Petulla", "Pancakes"],
  "hair-and-skin": ["Коса и кожа", "Flokë dhe lëkurë", "Hair & Skin"],
  gloves: ["Ракавици", "Doreza", "Gloves"],
  "punching-bags": ["Вреќи за удирање", "Thasë boksi", "Punching Bags"],
  bottles: ["Шишиња", "Shishe", "Bottles"],
  "pants-tights": ["Панталони и хеланки", "Pantallona dhe tajts", "Pants & Tights"],
  "pants-womens": ["Панталони", "Pantallona", "Pants"],
  tights: ["Хеланки", "Tajts", "Tights"],
  "shorts-mens": ["Шорцеви", "Pantallona të shkurtra", "Shorts"],
  "shorts-womens": ["Шорцеви", "Pantallona të shkurtra", "Shorts"],
  bags: ["Торби", "Çanta", "Bags"],
  belts: ["Појаси", "Rripa", "Belts"],
  "meal-replacement": ["Замена за оброк", "Zëvendësues vakti", "Meal Replacement"],
  "meal-replacement-drinks": ["Замена за оброк", "Zëvendësues vakti", "Meal Replacement"],
  digestion: ["Варење", "Tretje", "Digestion"],
  pudding: ["Пудинг", "Puding", "Pudding"],
  "green-tea": ["Зелен чај", "Çaj jeshil", "Green Tea"],
  "energy-gels": ["Енергетски гелови", "Xhel energjik", "Energy Gels"],
  casein: ["Казеин", "Kazeinë", "Casein"],
  proteins: ["Протеини", "Proteina", "Proteins"],
  "energy-boosters": ["Енергетски засилувачи", "Përforcues energjie", "Energy Boosters"],
  "amino-mix": ["Амино микс", "Amino miks", "Amino Mix"],
  "vegan-protein": ["Вегански протеин", "Proteinë vegane", "Vegan Protein"],
  "caffeinated-drinks": ["Пијалоци со кофеин", "Pije me kafeinë", "Caffeinated Drinks"],
  "guilt-free": ["Без грижа на совест", "Pa faj", "Guilt-Free"],
  "calorie-free": ["Без калории", "Pa kalori", "Calorie-Free"],
  sleep: ["Сон", "Gjumi", "Sleep"],
  "other-equipment": ["Друго", "Tjetër", "Other"],
  "other-mens": ["Друго", "Tjetër", "Other"],
  "other-womens": ["Друго", "Tjetër", "Other"],
  "other-accessories": ["Друго", "Tjetër", "Other"],
  towels: ["Крпи", "Peshqirë", "Towels"],
  "sports-tops": ["Спортски маички и топови", "Bluza dhe topa sportivë", "Sports Tops"],
  "anti-aging": ["Против стареење", "Kundër plakjes", "Anti-Aging"],
  spreads: ["Намази", "Kremra për lyerje", "Spreads"],
  "beef-protein": ["Говедски протеин", "Proteinë viçi", "Beef Protein"],
  gainers: ["Гејнери", "Gejnerë", "Gainers"],
  "pre-workout": ["Пред тренинг", "Para stërvitjes", "Pre-Workout"],
  "ready-to-drink": ["Готови за пиење", "Gati për t'u pirë", "Ready to Drink"],
  "protein-bars": ["Протеински барови", "Bare proteinike", "Protein Bars"],
  "protein-bars-weight": ["Протеински барови", "Bare proteinike", "Protein Bars"],
  "protein-bars-snacks": ["Протеински барови", "Bare proteinike", "Protein Bars"],
  oils: ["Масла", "Vajra", "Oils"],
  stress: ["Стрес", "Stresi", "Stress"],
  "hormone-boosters": ["Хормонски засилувачи", "Përforcues hormonalë", "Hormone Boosters"],
  "weight-loss": ["Слабеење", "Humbje peshe", "Weight Loss"],
  "protein-snacks": ["Протеински закуски", "Snacks proteinike", "Protein Snacks"],
  vitamins: ["Витамини", "Vitamina", "Vitamins"],
  minerals: ["Минерали", "Minerale", "Minerals"],
  purpose: ["Намена", "Qëllimi", "Purpose"],
  antioxidants: ["Антиоксиданси", "Antioksidantë", "Antioxidants"],
  "omega-3": ["Омега 3", "Omega 3", "Omega 3"],
  collagen: ["Колаген", "Kolagjen", "Collagen"],
  drinks: ["Пијалоци", "Pije", "Drinks"],
  "training-equipment": ["Опрема за тренинг", "Pajisje stërvitore", "Training Equipment"],
  "fight-gear": ["Опрема за борилачки спортови", "Pajisje për arte marciale", "Fight Gear"],
  accessories: ["Додатоци", "Aksesorë", "Accessories"],
  "mens-clothing": ["Машка облека", "Veshje për meshkuj", "Men's Clothing"],
  "womens-clothing": ["Женска облека", "Veshje për femra", "Women's Clothing"],
  "kids-clothes": ["Детска облека", "Veshje për fëmijë", "Kids' Clothing"],
  "gift-voucher": ["Подарочни ваучери", "Kupona dhuratë", "Gift Vouchers"],
  "egg-white-protein": ["Протеин од јајце", "Proteinë veze", "Egg White Protein"],
};

const SPORTS = {
  "road-cycling": ["Друмски велосипедизам", "Çiklizëm rrugor", "Road Cycling"],
  "mountain-biking": ["Планински велосипедизам", "Çiklizëm malor", "Mountain Biking"],
  running: ["Трчање", "Vrapim", "Running"],
  football: ["Фудбал", "Futboll", "Football"],
  basketball: ["Кошарка", "Basketboll", "Basketball"],
  handball: ["Ракомет", "Hendboll", "Handball"],
  volleyball: ["Одбојка", "Volejboll", "Volleyball"],
  hockey: ["Хокеј", "Hokej", "Hockey"],
  "fitness-bodybuilding": ["Фитнес и бодибилдинг", "Fitnes dhe bodybuilding", "Fitness & Bodybuilding"],
  "functional-training": ["Функционален тренинг", "Stërvitje funksionale", "Functional Training"],
  hiking: ["Планинарење", "Ecje në mal", "Hiking"],
  "trail-running": ["Трејл трчање", "Vrapim në terren", "Trail Running"],
  climbing: ["Качување", "Ngjitje", "Climbing"],
};

const GOALS = {
  "weight-loss": ["Слабеење", "Humbje peshe", "Weight Loss"],
  "muscle-mass": ["Мускулна маса", "Masë muskulore", "Muscle Mass"],
  "endurance-recovery": ["Издржливост и обновување", "Qëndrueshmëri dhe rikuperim", "Endurance & Recovery"],
  "active-lifestyle": ["Активен животен стил", "Stil jetese aktiv", "Active Lifestyle"],
};

const USE_TIMINGS = {
  "before-training": ["Пред тренинг", "Para stërvitjes", "Before Training"],
  "during-training": ["За време на тренинг", "Gjatë stërvitjes", "During Training"],
  "after-training": ["После тренинг", "Pas stërvitjes", "After Training"],
};

const FLAVORS = {
  almond: ["Бадем", "Bajame", "Almond"],
  apple: ["Јаболко", "Mollë", "Apple"],
  banana: ["Банана", "Banane", "Banana"],
  brownie: ["Брауни", "Brownie", "Brownie"],
  caramel: ["Карамела", "Karamel", "Caramel"],
  cherry: ["Цреша", "Qershi", "Cherry"],
  chocolate: ["Чоколадо", "Çokollatë", "Chocolate"],
  coconut: ["Кокос", "Kokos", "Coconut"],
  cookie: ["Колаче", "Biskotë", "Cookie"],
  grapefruit: ["Грејпфрут", "Grejpfrut", "Grapefruit"],
  lemon: ["Лимон", "Limon", "Lemon"],
  orange: ["Портокал", "Portokall", "Orange"],
  pineapple: ["Ананас", "Ananas", "Pineapple"],
  pistachio: ["Пистаќ", "Fëstëk", "Pistachio"],
  raspberry: ["Малина", "Mjedër", "Raspberry"],
  strawberry: ["Јагода", "Luleshtrydhe", "Strawberry"],
  vanilla: ["Ванила", "Vanilje", "Vanilla"],
};

const TAGS = {
  endurance: ["Издржливост", "Qëndrueshmëri", "Endurance"],
  "free-shaker": ["Бесплатен шејкер", "Shejker falas", "Free Shaker"],
};

// Boolean "status" filters are keyed by their filter key, not a slug.
const STATUS = {
  inStock: ["На залиха", "Në stok", "In Stock"],
  onSale: ["На попуст", "Në zbritje", "On Sale"],
  newProducts: ["Нови производи", "Produkte të reja", "New Products"],
  bestSellers: ["Најпродавани", "Më të shiturat", "Best Sellers"],
  outlet: ["Аутлет", "Outlet", "Outlet"],
  upcomingPromotions: ["Претстојни промоции", "Promocione të ardhshme", "Upcoming Promotions"],
};

const BY_GROUP = {
  categoryIds: CATEGORIES,
  sportIds: SPORTS,
  goalIds: GOALS,
  useTimingIds: USE_TIMINGS,
  flavorIds: FLAVORS,
  tagIds: TAGS,
  status: STATUS,
};

const UI = {
  categoryIds: ["Категорија", "Kategoria", "Category"],
  subcategory: ["Подкатегорија", "Nënkategoria", "Subcategory"],
  sportIds: ["Спорт", "Sporti", "Sport"],
  goalIds: ["Цел", "Qëllimi", "Goal"],
  useTimingIds: ["Употреба", "Përdorimi", "When to Use"],
  flavorIds: ["Вкус", "Shija", "Flavor"],
  sizes: ["Големина", "Madhësia", "Size"],
  brandIds: ["Бренд", "Marka", "Brand"],
  priceRange: ["Цена", "Çmimi", "Price"],
  status: ["Статус", "Statusi", "Status"],
  tagIds: ["Друго", "Tjetër", "Other"],
  filter: ["Филтри", "Filtra", "Filters"],
  loading: ["Се вчитуваат филтрите...", "Po ngarkohen filtrat...", "Loading filters..."],
  search: ["Пребарување", "Kërkim", "Search"],
  currency: ["ден.", "MKD", "MKD"],
  clear: ["Исчисти филтри", "Pastro filtrat", "Clear filters"],
  clearShort: ["Исчисти", "Pastro", "Clear"],
  min: ["Од", "Nga", "Min"],
  max: ["До", "Deri", "Max"],
  under: ["До {n}", "Deri {n}", "Up to {n}"],
  over: ["Над {n}", "Mbi {n}", "Over {n}"],
  showAll: ["Прикажи ги сите ({n})", "Shfaq të gjitha ({n})", "Show all ({n})"],
  showLess: ["Прикажи помалку", "Shfaq më pak", "Show less"],
  searchIn: ["Пребарај...", "Kërko...", "Search..."],
  noMatches: ["Нема совпаѓања", "Asnjë përputhje", "No matches"],
  close: ["Затвори", "Mbyll", "Close"],
  loadingShort: ["Се вчитува...", "Duke u ngarkuar...", "Loading..."],
  showProducts: ["Прикажи {n} производи", "Shfaq {n} produkte", "Show {n} products"],
  searchResults: ["Резултати за „{q}“", "Rezultatet për „{q}“", "Results for “{q}”"],
  noProducts: ["Нема пронајдени производи.", "Nuk u gjetën produkte.", "No products found."],
  showingOf: ["Прикажани {n} од {total} производи", "Po shfaqen {n} nga {total} produkte", "Showing {n} of {total} products"],
  showMore: ["Прикажи повеќе", "Shfaq më shumë", "Show more"],
  allLoaded: ["Сите {total} производи се вчитани", "Të gjitha {total} produktet u ngarkuan", "All {total} products loaded"],
};

const pick = (pair) => {
  if (!pair) return null;
  const lang = getCurrentLanguage();
  const idx = lang === "al" ? AL : lang === "en" ? EN : MK;
  return pair[idx] ?? pair[MK];
};

/** Translated name for a filter value; falls back to the database name. */
export function filterLabel(groupKey, slug, fallback) {
  return pick(BY_GROUP[groupKey]?.[slug]) || fallback;
}

/** Translated filter UI string (group titles and the few fixed labels). */
export function filterText(key) {
  return pick(UI[key]) || key;
}

/** Translated name for a URL slug of any category, sport or goal (page headings). */
export function labelForSlug(slug) {
  for (const key of ["categoryIds", "goalIds", "sportIds"]) {
    const label = pick(BY_GROUP[key][slug]);
    if (label) return label;
  }
  return null;
}

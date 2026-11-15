// Display names for product filter groups and values.
//
// Categories, sports, goals etc. are stored in the database with English names,
// and some links still filter by those English names, so we translate at render
// time keyed by slug instead of renaming the rows. Unknown slugs (new rows added
// from the admin) fall back to the database name.
import { getCurrentLanguage } from "../Pages/translation/translation";

const [MK, AL] = [0, 1];

const CATEGORIES = {
  "amino-acids": ["Амино киселини", "Aminoacide"],
  thermogenics: ["Термогеници", "Termogjenikë"],
  monohydrates: ["Монохидрати", "Monohidrate"],
  whey: ["Whey протеин", "Proteinë whey"],
  carbohydrates: ["Јаглехидрати", "Karbohidrate"],
  "muscle-mass-fast-gain": ["Брзо зголемување на маса", "Rritje e shpejtë e masës"],
  "strength-energy-pump": ["Сила / енергија / пумпа", "Forcë / energji / pump"],
  "fat-burners": ["Согорувачи на маснотии", "Djegës yndyrash"],
  tribulus: ["Трибулус", "Tribulus"],
  "vitamin-c": ["Витамин C", "Vitaminë C"],
  muesli: ["Мусли", "Musli"],
  "immune-system": ["Имунитет", "Sistemi imunitar"],
  "drinks-with-carnitine": ["Пијалоци со карнитин", "Pije me karnitinë"],
  weights: ["Тегови", "Pesha"],
  magnesium: ["Магнезиум", "Magnez"],
  "boxing-gloves": ["Боксерски ракавици", "Doreza boksi"],
  shakers: ["Шејкери", "Shejkerë"],
  "t-shirts-mens": ["Маички", "Bluza"],
  "t-shirts-womens": ["Маички", "Bluza"],
  "pullovers-hoodies-womens": ["Дуксери", "Duksa"],
  "pullovers-hoodies-mens": ["Дуксери", "Duksa"],
  bidons: ["Бидони", "Bidona"],
  "hand-wraps": ["Бандажи за раце", "Fasha për duar"],
  zinc: ["Цинк", "Zink"],
  "training-bands-loops": ["Ластици за тренинг", "Llastikë stërvitjeje"],
  "instant-drinks": ["Инстант пијалоци", "Pije të çastit"],
  "bones-and-joints": ["Коски и зглобови", "Kockat dhe nyjet"],
  snacks: ["Закуски", "Ushqime të lehta"],
  "vitamin-d": ["Витамин D", "Vitaminë D"],
  "carnitine-weight": ["Карнитин", "Karnitinë"],
  carnitine: ["Карнитин", "Karnitinë"],
  "endurance-enhancers": ["За издржливост", "Për qëndrueshmëri"],
  "muscle-mass-quality-gain": ["Квалитетна мускулна маса", "Masë muskulore cilësore"],
  "energy-isotonic-drinks": ["Енергетски и изотонични пијалоци", "Pije energjike dhe izotonike"],
  "energy-isotonic-drinks-drinks": ["Енергетски и изотонични пијалоци", "Pije energjike dhe izotonike"],
  isolate: ["Изолат", "Izolat"],
  "advanced-types": ["Напредни форми", "Forma të avancuara"],
  glutamine: ["Глутамин", "Glutaminë"],
  definition: ["Дефиниција", "Definim"],
  creatine: ["Креатин", "Kreatinë"],
  "protein-blends": ["Протеински мешавини", "Përzierje proteinash"],
  "energy-bars": ["Енергетски барови", "Bare energjike"],
  "energy-bars-snacks": ["Енергетски барови", "Bare energjike"],
  recovery: ["Обновување", "Rikuperim"],
  "mental-focus": ["Ментален фокус", "Fokus mendor"],
  "multi-formulas": ["Мулти формули", "Multi-formula"],
  "b-complex": ["Б комплекс", "Kompleks B"],
  pancakes: ["Палачинки", "Petulla"],
  "hair-and-skin": ["Коса и кожа", "Flokë dhe lëkurë"],
  gloves: ["Ракавици", "Doreza"],
  "punching-bags": ["Вреќи за удирање", "Thasë boksi"],
  bottles: ["Шишиња", "Shishe"],
  "pants-tights": ["Панталони и хеланки", "Pantallona dhe tajts"],
  "pants-womens": ["Панталони", "Pantallona"],
  tights: ["Хеланки", "Tajts"],
  "shorts-mens": ["Шорцеви", "Pantallona të shkurtra"],
  "shorts-womens": ["Шорцеви", "Pantallona të shkurtra"],
  bags: ["Торби", "Çanta"],
  belts: ["Појаси", "Rripa"],
  "meal-replacement": ["Замена за оброк", "Zëvendësues vakti"],
  "meal-replacement-drinks": ["Замена за оброк", "Zëvendësues vakti"],
  digestion: ["Варење", "Tretje"],
  pudding: ["Пудинг", "Puding"],
  "green-tea": ["Зелен чај", "Çaj jeshil"],
  "energy-gels": ["Енергетски гелови", "Xhel energjik"],
  casein: ["Казеин", "Kazeinë"],
  proteins: ["Протеини", "Proteina"],
  "energy-boosters": ["Енергетски засилувачи", "Përforcues energjie"],
  "amino-mix": ["Амино микс", "Amino miks"],
  "vegan-protein": ["Вегански протеин", "Proteinë vegane"],
  "caffeinated-drinks": ["Пијалоци со кофеин", "Pije me kafeinë"],
  "guilt-free": ["Без грижа на совест", "Pa faj"],
  "calorie-free": ["Без калории", "Pa kalori"],
  sleep: ["Сон", "Gjumi"],
  "other-equipment": ["Друго", "Tjetër"],
  "other-mens": ["Друго", "Tjetër"],
  "other-womens": ["Друго", "Tjetër"],
  "other-accessories": ["Друго", "Tjetër"],
  towels: ["Крпи", "Peshqirë"],
  "sports-tops": ["Спортски маички и топови", "Bluza dhe topa sportivë"],
  "anti-aging": ["Против стареење", "Kundër plakjes"],
  spreads: ["Намази", "Kremra për lyerje"],
  "beef-protein": ["Говедски протеин", "Proteinë viçi"],
  gainers: ["Гејнери", "Gejnerë"],
  "pre-workout": ["Пред тренинг", "Para stërvitjes"],
  "ready-to-drink": ["Готови за пиење", "Gati për t'u pirë"],
  "protein-bars": ["Протеински барови", "Bare proteinike"],
  "protein-bars-weight": ["Протеински барови", "Bare proteinike"],
  "protein-bars-snacks": ["Протеински барови", "Bare proteinike"],
  oils: ["Масла", "Vajra"],
  stress: ["Стрес", "Stresi"],
  "hormone-boosters": ["Хормонски засилувачи", "Përforcues hormonalë"],
  "weight-loss": ["Слабеење", "Humbje peshe"],
  "protein-snacks": ["Протеински закуски", "Snacks proteinike"],
  vitamins: ["Витамини", "Vitamina"],
  minerals: ["Минерали", "Minerale"],
  purpose: ["Намена", "Qëllimi"],
  antioxidants: ["Антиоксиданси", "Antioksidantë"],
  "omega-3": ["Омега 3", "Omega 3"],
  collagen: ["Колаген", "Kolagjen"],
  drinks: ["Пијалоци", "Pije"],
  "training-equipment": ["Опрема за тренинг", "Pajisje stërvitore"],
  "fight-gear": ["Опрема за борилачки спортови", "Pajisje për arte marciale"],
  accessories: ["Додатоци", "Aksesorë"],
  "mens-clothing": ["Машка облека", "Veshje për meshkuj"],
  "womens-clothing": ["Женска облека", "Veshje për femra"],
  "kids-clothes": ["Детска облека", "Veshje për fëmijë"],
  "gift-voucher": ["Подарочни ваучери", "Kupona dhuratë"],
  "egg-white-protein": ["Протеин од јајце", "Proteinë veze"],
};

const SPORTS = {
  "road-cycling": ["Друмски велосипедизам", "Çiklizëm rrugor"],
  "mountain-biking": ["Планински велосипедизам", "Çiklizëm malor"],
  running: ["Трчање", "Vrapim"],
  football: ["Фудбал", "Futboll"],
  basketball: ["Кошарка", "Basketboll"],
  handball: ["Ракомет", "Hendboll"],
  volleyball: ["Одбојка", "Volejboll"],
  hockey: ["Хокеј", "Hokej"],
  "fitness-bodybuilding": ["Фитнес и бодибилдинг", "Fitnes dhe bodybuilding"],
  "functional-training": ["Функционален тренинг", "Stërvitje funksionale"],
  hiking: ["Планинарење", "Ecje në mal"],
  "trail-running": ["Трејл трчање", "Vrapim në terren"],
  climbing: ["Качување", "Ngjitje"],
};

const GOALS = {
  "weight-loss": ["Слабеење", "Humbje peshe"],
  "muscle-mass": ["Мускулна маса", "Masë muskulore"],
  "endurance-recovery": ["Издржливост и обновување", "Qëndrueshmëri dhe rikuperim"],
  "active-lifestyle": ["Активен животен стил", "Stil jetese aktiv"],
};

const USE_TIMINGS = {
  "before-training": ["Пред тренинг", "Para stërvitjes"],
  "during-training": ["За време на тренинг", "Gjatë stërvitjes"],
  "after-training": ["После тренинг", "Pas stërvitjes"],
};

const FLAVORS = {
  almond: ["Бадем", "Bajame"],
  apple: ["Јаболко", "Mollë"],
  banana: ["Банана", "Banane"],
  brownie: ["Брауни", "Brownie"],
  caramel: ["Карамела", "Karamel"],
  cherry: ["Цреша", "Qershi"],
  chocolate: ["Чоколадо", "Çokollatë"],
  coconut: ["Кокос", "Kokos"],
  cookie: ["Колаче", "Biskotë"],
  grapefruit: ["Грејпфрут", "Grejpfrut"],
  lemon: ["Лимон", "Limon"],
  orange: ["Портокал", "Portokall"],
  pineapple: ["Ананас", "Ananas"],
  pistachio: ["Пистаќ", "Fëstëk"],
  raspberry: ["Малина", "Mjedër"],
  strawberry: ["Јагода", "Luleshtrydhe"],
  vanilla: ["Ванила", "Vanilje"],
};

const TAGS = {
  endurance: ["Издржливост", "Qëndrueshmëri"],
  "free-shaker": ["Бесплатен шејкер", "Shejker falas"],
};

// Boolean "status" filters are keyed by their filter key, not a slug.
const STATUS = {
  inStock: ["На залиха", "Në stok"],
  onSale: ["На попуст", "Në zbritje"],
  newProducts: ["Нови производи", "Produkte të reja"],
  bestSellers: ["Најпродавани", "Më të shiturat"],
  outlet: ["Аутлет", "Outlet"],
  upcomingPromotions: ["Претстојни промоции", "Promocione të ardhshme"],
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
  categoryIds: ["Категорија", "Kategoria"],
  subcategory: ["Подкатегорија", "Nënkategoria"],
  sportIds: ["Спорт", "Sporti"],
  goalIds: ["Цел", "Qëllimi"],
  useTimingIds: ["Употреба", "Përdorimi"],
  flavorIds: ["Вкус", "Shija"],
  sizes: ["Големина", "Madhësia"],
  brandIds: ["Бренд", "Marka"],
  priceRange: ["Цена", "Çmimi"],
  status: ["Статус", "Statusi"],
  tagIds: ["Друго", "Tjetër"],
  filter: ["Филтри", "Filtra"],
  loading: ["Се вчитуваат филтрите...", "Po ngarkohen filtrat..."],
  search: ["Пребарување", "Kërkim"],
  currency: ["ден.", "MKD"],
  clear: ["Исчисти филтри", "Pastro filtrat"],
  clearShort: ["Исчисти", "Pastro"],
  min: ["Од", "Nga"],
  max: ["До", "Deri"],
  under: ["До {n}", "Deri {n}"],
  over: ["Над {n}", "Mbi {n}"],
  showAll: ["Прикажи ги сите ({n})", "Shfaq të gjitha ({n})"],
  showLess: ["Прикажи помалку", "Shfaq më pak"],
  searchIn: ["Пребарај...", "Kërko..."],
  noMatches: ["Нема совпаѓања", "Asnjë përputhje"],
  close: ["Затвори", "Mbyll"],
  loadingShort: ["Се вчитува...", "Duke u ngarkuar..."],
  showProducts: ["Прикажи {n} производи", "Shfaq {n} produkte"],
  searchResults: ["Резултати за „{q}“", "Rezultatet për „{q}“"],
  noProducts: ["Нема пронајдени производи.", "Nuk u gjetën produkte."],
  showingOf: ["Прикажани {n} од {total} производи", "Po shfaqen {n} nga {total} produkte"],
  showMore: ["Прикажи повеќе", "Shfaq më shumë"],
  allLoaded: ["Сите {total} производи се вчитани", "Të gjitha {total} produktet u ngarkuan"],
};

const pick = (pair) => (pair ? pair[getCurrentLanguage() === "al" ? AL : MK] : null);

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

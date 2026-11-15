// Built-in tip articles. They are shown whenever the API has no published tips, so the
// homepage teaser, /tips and /tips/:slug always have real content to link to.
// Articles added in Admin → Tips replace this list entirely.

const IMAGE_ORIGIN = "https://proteini.mk";

export const BUILT_IN_TIPS = [
  {
    id: "builtin-womens-energy",
    slug: "zenskata-energija-zapocnuva-od-vnatre",
    category: "health",
    readMinutes: 4,
    imagePath: "/img/tips/tip-womens-energy.webp",
    title: "Женската енергија започнува од внатре",
    titleAl: "Energjia e gruas fillon nga brenda",
    subtitle:
      "Кога телото функционира во рамнотежа, тоа се рефлектира надворешно преку стабилна енергија, подобро расположение и посилен фокус.",
    subtitleAl:
      "Kur trupi funksionon në ekuilibër, kjo reflektohet nga jashtë përmes energjisë së qëndrueshme, humorit më të mirë dhe fokusit më të fortë.",
    content: `
<p>Умор во средината на денот, нагли промени во расположението и желба за слатко често не се „само стрес“. Најчесто се знак дека на телото му недостига рамнотежа – во исхраната, сонот или движењето.</p>
<h2>1. Стабилен шеќер во крвта</h2>
<p>Оброците богати само со брзи јаглехидрати даваат кратка енергија, по која следува пад. Комбинирајте ги јаглехидратите со протеини и здрави масти – на пример овесна каша со грчки јогурт и јаткасти плодови.</p>
<h2>2. Доволно протеини во секој оброк</h2>
<p>Протеините помагаат за ситост, за одржување на мускулната маса и за стабилна енергија. Целта е по 20–30 g протеини во главните оброци. Кога немате време, протеинскиот шејк е практично решение.</p>
<h2>3. Железо, магнезиум и витамини од B-група</h2>
<ul>
  <li><strong>Железо</strong> – црвено месо, леќа, спанаќ. Недостатокот е чест кај жените и предизвикува замор.</li>
  <li><strong>Магнезиум</strong> – јаткасти плодови, семки, темна чоколада. Помага за мускулите и сонот.</li>
  <li><strong>B-витамини</strong> – јајца, интегрални житарки, мешунки. Учествуваат во создавањето енергија.</li>
</ul>
<h2>4. Сон и движење</h2>
<p>7–9 часа квалитетен сон и најмалку 30 минути движење дневно имаат поголемо влијание врз енергијата од кој било додаток. Додатоците се тука да ја надополнат добрата рутина, не да ја заменат.</p>
<blockquote>Ако заморот трае подолго, направете крвна слика и консултирајте се со лекар пред да започнете со додатоци во исхраната.</blockquote>
`,
    contentAl: `
<p>Lodhja në mes të ditës, ndryshimet e papritura të humorit dhe dëshira për ëmbëlsira shpesh nuk janë „vetëm stres“. Zakonisht janë shenjë se trupit i mungon ekuilibri – në ushqim, gjumë ose lëvizje.</p>
<h2>1. Sheqer i qëndrueshëm në gjak</h2>
<p>Vaktet me vetëm karbohidrate të shpejta japin energji të shkurtër, e ndjekur nga rënie. Kombinoni karbohidratet me proteina dhe yndyrna të shëndetshme – për shembull tërshërë me kos grek dhe arra.</p>
<h2>2. Proteina të mjaftueshme në çdo vakt</h2>
<p>Proteinat ndihmojnë për ngopje, për ruajtjen e masës muskulore dhe për energji të qëndrueshme. Synoni 20–30 g proteina në vaktet kryesore. Kur nuk keni kohë, shejku proteinik është zgjidhje praktike.</p>
<h2>3. Hekur, magnez dhe vitaminat B</h2>
<ul>
  <li><strong>Hekuri</strong> – mish i kuq, thjerrëza, spinaq. Mungesa është e shpeshtë te gratë dhe shkakton lodhje.</li>
  <li><strong>Magnezi</strong> – arra, fara, çokollatë e zezë. Ndihmon muskujt dhe gjumin.</li>
  <li><strong>Vitaminat B</strong> – vezë, drithëra integrale, bishtajore. Marrin pjesë në prodhimin e energjisë.</li>
</ul>
<h2>4. Gjumi dhe lëvizja</h2>
<p>7–9 orë gjumë cilësor dhe të paktën 30 minuta lëvizje në ditë kanë ndikim më të madh në energji se çdo suplement. Suplementet janë këtu për të plotësuar një rutinë të mirë, jo për ta zëvendësuar atë.</p>
<blockquote>Nëse lodhja zgjat më shumë, bëni analizat e gjakut dhe konsultohuni me mjekun para se të filloni me suplemente.</blockquote>
`,
  },
  {
    id: "builtin-liver-detox",
    slug: "crn-drob-i-detoksikacija",
    category: "nutrition",
    readMinutes: 4,
    imagePath: "/img/tips/tip-liver-detox.webp",
    title: "Црн дроб и детоксикација: Како природно да ги поддржите",
    titleAl: "Mëlçia dhe detoksifikimi: Si t'i mbështetni natyrshëm",
    subtitle:
      "Дали знаевте дека вашето тело се детоксицира 24 часа на ден – дури и додека спиете? Еве како да му помогнете без екстремни диети.",
    subtitleAl:
      "A e dini se trupi juaj detoksifikohet 24 orë në ditë – madje edhe kur flini? Ja si ta ndihmoni pa dieta ekstreme.",
    content: `
<p>Црниот дроб е главниот „филтер“ на телото. Тој ги разградува хормоните, лековите, алкохолот и отпадните материи од метаболизмот. Не му требаат скапи „детокс“ програми – му требаат добри навики секој ден.</p>
<h2>Пијте доволно вода</h2>
<p>Водата им помага на црниот дроб и бубрезите да ги исфрлат отпадните материи. Целете кон 30–35 ml на килограм телесна тежина, повеќе во денови со тренинг.</p>
<h2>Влакна и зеленчук на секој оброк</h2>
<ul>
  <li><strong>Крстоцветен зеленчук</strong> – брокула, карфиол, зелка.</li>
  <li><strong>Горчливи зеленчуци</strong> – рукола, артичока, цикорија.</li>
  <li><strong>Овошје богато со антиоксиданси</strong> – калинка, бобинки, цитруси.</li>
</ul>
<h2>Доволно протеини</h2>
<p>Процесите на детоксикација во црниот дроб користат аминокиселини од протеините. Затоа строгите „сокови-само“ диети може да имаат спротивен ефект.</p>
<h2>Помалку алкохол и ултрапреработена храна</h2>
<p>Алкохолот, вишокот шеќер и трансмастите се најголемото оптоварување за црниот дроб. Намалувањето на нив е најдобриот „детокс“.</p>
<h2>Сон и тренинг</h2>
<p>Редовното движење го намалува масното ткиво околу органите, а квалитетниот сон му дава време на телото да се обнови.</p>
<blockquote>Додатоци како силимарин (млечен трн) може да бидат дел од рутината, но секогаш по консултација со лекар или фармацевт.</blockquote>
`,
    contentAl: `
<p>Mëlçia është „filtri“ kryesor i trupit. Ajo zbërthen hormonet, ilaçet, alkoolin dhe mbetjet e metabolizmit. Nuk ka nevojë për programe të shtrenjta „detoks“ – ka nevojë për zakone të mira çdo ditë.</p>
<h2>Pini ujë të mjaftueshëm</h2>
<p>Uji i ndihmon mëlçisë dhe veshkave të largojnë mbetjet. Synoni 30–35 ml për kilogram peshë trupore, më shumë në ditët me stërvitje.</p>
<h2>Fibra dhe perime në çdo vakt</h2>
<ul>
  <li><strong>Perime kryqëzore</strong> – brokoli, lulelakër, lakër.</li>
  <li><strong>Perime të hidhura</strong> – rukola, angjinare, çikore.</li>
  <li><strong>Fruta të pasura me antioksidantë</strong> – shegë, manaferra, agrume.</li>
</ul>
<h2>Proteina të mjaftueshme</h2>
<p>Proceset e detoksifikimit në mëlçi përdorin aminoacidet nga proteinat. Prandaj dietat e rrepta „vetëm me lëngje“ mund të kenë efekt të kundërt.</p>
<h2>Më pak alkool dhe ushqim ultra të përpunuar</h2>
<p>Alkooli, sheqeri i tepërt dhe yndyrnat trans janë ngarkesa më e madhe për mëlçinë. Reduktimi i tyre është „detoksi“ më i mirë.</p>
<h2>Gjumi dhe stërvitja</h2>
<p>Lëvizja e rregullt zvogëlon yndyrën rreth organeve, ndërsa gjumi cilësor i jep trupit kohë të rikuperohet.</p>
<blockquote>Suplementet si silimarina (gjembi i qumështit) mund të jenë pjesë e rutinës, por gjithmonë pas konsultimit me mjekun ose farmacistin.</blockquote>
`,
  },
  {
    id: "builtin-protein-cheesecake",
    slug: "proteinski-cizkejk-bez-pecenje-vo-tegla",
    category: "recipes",
    readMinutes: 3,
    imagePath: "/img/tips/tip-protein-cheesecake.webp",
    title: "Протеински чизкејк без печење во тегла",
    titleAl: "Cheesecake me proteina pa pjekje në kavanoz",
    subtitle:
      "Дали некогаш посакувате нешто слатко после оброк или тренинг, но не сакате да ја урнете исхраната? Овој десерт е готов за 10 минути.",
    subtitleAl:
      "A keni ndonjëherë dëshirë për diçka të ëmbël pas një vakti apo stërvitjeje, por nuk doni ta prishni dietën? Ky ëmbëlsirë është gati për 10 minuta.",
    content: `
<p>Кремаст, сладок и полн со протеини – а без рерна и без шеќер. Рецептот е за 2 тегли (околу 25 g протеини по порција).</p>
<h2>Состојки</h2>
<h3>За подлогата</h3>
<ul>
  <li>40 g овесни снегулки</li>
  <li>2 урми без коскички (или 1 лажица мед)</li>
  <li>1 лажица кикиритки путер</li>
</ul>
<h3>За кремот</h3>
<ul>
  <li>250 g грчки јогурт или скир</li>
  <li>100 g посно крем сирење</li>
  <li>1 мерка (30 g) протеин во прав со вкус на ванила</li>
  <li>сок од половина лимон</li>
  <li>засладувач по желба</li>
</ul>
<h3>За врвот</h3>
<ul>
  <li>шака свежи или замрзнати бобинки</li>
</ul>
<h2>Подготовка</h2>
<ol>
  <li>Изблендирајте ги овесот, урмите и путерот додека не добиете влажни трошки. Поделете ги во две тегли и притиснете со лажица.</li>
  <li>Изматете ги јогуртот, крем сирењето, протеинот и лимоновиот сок во мазен крем. Ако е премногу густ, додајте лажица млеко.</li>
  <li>Истурете го кремот врз подлогата и ставете бобинки одозгора.</li>
  <li>Оставете во фрижидер најмалку 30 минути. Се чува до 2 дена.</li>
</ol>
<blockquote>Совет: протеинот со вкус на чизкејк, кокос или бело чоколадо дава уште подобар вкус од класичната ванила.</blockquote>
`,
    contentAl: `
<p>Kremoz, i ëmbël dhe plot proteina – pa furrë dhe pa sheqer. Receta është për 2 kavanoza (rreth 25 g proteina për porcion).</p>
<h2>Përbërësit</h2>
<h3>Për bazën</h3>
<ul>
  <li>40 g tërshërë</li>
  <li>2 hurma pa bërthama (ose 1 lugë mjaltë)</li>
  <li>1 lugë gjalpë kikiriku</li>
</ul>
<h3>Për kremin</h3>
<ul>
  <li>250 g kos grek ose skyr</li>
  <li>100 g djathë krem me pak yndyrë</li>
  <li>1 masë (30 g) proteinë pluhur me shije vanilje</li>
  <li>lëng nga gjysmë limoni</li>
  <li>ëmbëlsues sipas dëshirës</li>
</ul>
<h3>Për sipër</h3>
<ul>
  <li>një grusht manaferra të freskëta ose të ngrira</li>
</ul>
<h2>Përgatitja</h2>
<ol>
  <li>Blendoni tërshërën, hurmat dhe gjalpin derisa të merrni thërrime të lagështa. Ndajini në dy kavanoza dhe shtypini me lugë.</li>
  <li>Përzieni kosin, djathin krem, proteinën dhe lëngun e limonit në një krem të lëmuar. Nëse është shumë i trashë, shtoni një lugë qumësht.</li>
  <li>Hidheni kremin mbi bazë dhe vendosni manaferra sipër.</li>
  <li>Lëreni në frigorifer të paktën 30 minuta. Ruhet deri në 2 ditë.</li>
</ol>
<blockquote>Këshillë: proteina me shije cheesecake, kokosi ose çokollate të bardhë jep shije edhe më të mirë se vanilja klasike.</blockquote>
`,
  },
];

export const findBuiltInTip = (slug) => BUILT_IN_TIPS.find((tip) => tip.slug === slug) || null;

export const getTipImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  // Bundled images ship with the frontend; admin uploads live on the API server.
  if (path.startsWith("/img/")) return path;
  if (path.startsWith("/")) return `${IMAGE_ORIGIN}${path}`;
  return path;
};

const CATEGORY_KEYS = {
  news: "news",
  events: "events",
  event: "events",
  "new-products": "newProducts",
  newproducts: "newProducts",
  health: "tipCategoryHealth",
  nutrition: "tipCategoryNutrition",
  recipes: "tipCategoryRecipes",
  recipe: "tipCategoryRecipes",
  training: "tipCategoryTraining",
};

export const normalizeCategory = (category) => (category || "news").trim().toLowerCase();

export const categoryLabel = (category, translate) => {
  const key = CATEGORY_KEYS[normalizeCategory(category)];
  if (key) return translate(key);
  const raw = (category || "").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : translate("news");
};

/** Picks the Albanian fields when the site is in Albanian and they are filled in. */
export const localizeTip = (tip, language) => {
  const al = language === "al" || language === "sq";
  const pick = (mk, alt) => (al && tip[alt] ? tip[alt] : tip[mk]);
  return {
    ...tip,
    title: pick("title", "titleAl"),
    subtitle: pick("subtitle", "subtitleAl"),
    content: pick("content", "contentAl"),
  };
};

/** Rough reading time from the article HTML when the article does not carry one. */
export const readingMinutes = (tip) => {
  if (tip.readMinutes) return tip.readMinutes;
  const words = (tip.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

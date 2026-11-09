// Static navigation data for the header (desktop dropdowns and mobile menu).
// Kept out of Header.jsx so the component only deals with layout and behaviour.
import {
  FiActivity,
  FiAward,
  FiBox,
  FiCalendar,
  FiCoffee,
  FiGift,
  FiGrid,
  FiPercent,
  FiShield,
  FiShoppingBag,
  FiTag,
  FiTrendingDown,
  FiZap,
} from "react-icons/fi";

/** Category trees. `translate` is the LanguageContext translate function. */
export const buildCategoryNav = (translate) => {
  const sportItems = [
    {
      label: translate("aminoAcids"),
      link: "/all-products/amino-acids",
      subItems: [
        { label: translate("bcaa"), link: "/all-products/bcaa" },
        { label: translate("glutamine"), link: "/all-products/glutamine" },
        { label: translate("hmb"), link: "/all-products/hmb" },
        { label: translate("eaa"), link: "/all-products/eaa" },
        { label: translate("aminoMix"), link: "/all-products/amino-mix" },
      ],
    },
    {
      label: translate("definition"),
      link: "/all-products/definition",
      subItems: [
        {
          label: translate("thermogenics"),
          link: "/all-products/thermogenics",
        },
        { label: translate("carnitine"), link: "/all-products/carnitine" },
      ],
    },
    {
      label: translate("creatine"),
      link: "/all-products/creatine",
      subItems: [
        {
          label: translate("monohydrates"),
          link: "/all-products/monohydrates",
        },
        {
          label: translate("advancedTypes"),
          link: "/all-products/advanced-types",
        },
      ],
    },
    {
      label: translate("proteins"),
      link: "/all-products/proteins",
      subItems: [
        { label: translate("whey"), link: "/all-products/whey" },
        {
          label: translate("eggWhiteProtein"),
          link: "/all-products/egg-white-protein",
        },
        { label: translate("isolate"), link: "/all-products/isolate" },
        {
          label: translate("proteinBlends"),
          link: "/all-products/protein-blends",
        },
        { label: translate("casein"), link: "/all-products/casein" },
        {
          label: translate("veganProtein"),
          link: "/all-products/vegan-protein",
        },
        { label: translate("beefProtein"), link: "/all-products/beef-protein" },
      ],
    },
    {
      label: translate("energyBoosters"),
      link: "/all-products/energy-boosters",
      subItems: [
        {
          label: translate("carbohydrates"),
          link: "/all-products/carbohydrates",
        },
        {
          label: translate("energyIsotonicDrinks"),
          link: "/all-products/energy-isotonic-drinks",
        },
        { label: translate("energyBars"), link: "/all-products/energy-bars" },
        { label: translate("energyGels"), link: "/all-products/energy-gels" },
        {
          label: translate("caffeinatedDrinks"),
          link: "/all-products/caffeinated-drinks",
        },
      ],
    },
    {
      label: translate("gainers"),
      link: "/all-products/gainers",
      subItems: [
        {
          label: translate("muscleMassFastGain"),
          link: "/all-products/muscle-mass-fast-gain",
        },
        {
          label: translate("muscleMassQualityGain"),
          link: "/all-products/muscle-mass-quality-gain",
        },
        { label: translate("recovery"), link: "/all-products/recovery" },
      ],
    },
    {
      label: "PRE-WORKOUT",
      link: "/all-products/pre-workout",
      subItems: [
        {
          label: translate("strengthEnergyPump"),
          link: "/all-products/strength-energy-pump",
        },
        {
          label: translate("endurance"),
          link: "/all-products/endurance-enhancers",
        },
        { label: translate("mentalFocus"), link: "/all-products/mental-focus" },
      ],
    },
    {
      label: translate("hormoneBoosters"),
      link: "/all-products/hormone-boosters",
      subItems: [
        { label: translate("tribulus"), link: "/all-products/tribulus" },
        { label: translate("daa"), link: "/all-products/daa" },
        {
          label: translate("multiFormulas"),
          link: "/all-products/multi-formulas",
        },
      ],
    },
  ];

  const protein = [
    {
      label: translate("proteins"),
      link: "/all-products/proteins",
      subItems: [
        { label: translate("whey"), link: "/all-products/whey" },
        {
          label: translate("eggWhiteProtein"),
          link: "/all-products/egg-white-protein",
        },
        { label: translate("isolate"), link: "/all-products/isolate" },
        {
          label: translate("proteinBlends"),
          link: "/all-products/protein-blends",
        },
        { label: translate("casein"), link: "/all-products/casein" },
        {
          label: translate("veganProtein"),
          link: "/all-products/vegan-protein",
        },
        { label: translate("beefProtein"), link: "/all-products/beef-protein" },
        {
          label: translate("readyToDrink"),
          link: "/all-products/ready-to-drink",
        },
        { label: translate("proteinBars"), link: "/all-products/protein-bars" },
        {
          label: translate("proteinSnaks"),
          link: "/all-products/protein-snaks",
        },
      ],
    },
    {
      label: translate("gainers"),
      link: "/all-products/gainers",
      subItems: [
        {
          label: translate("muscleMassFastGain"),
          link: "/all-products/muscle-mass-fast-gain",
        },
        {
          label: translate("muscleMassQualityGain"),
          link: "/all-products/muscle-mass-quality-gain",
        },
        { label: translate("recovery"), link: "/all-products/recovery" },
      ],
    },
  ];

  const weightLoss = [
    {
      label: translate("weightLoss"),
      link: "/all-products/weight-loss",
      subItems: [
        { label: translate("fatBurners"), link: "/all-products/fat-burners" },
        {
          label: translate("carnitine"),
          link: "/all-products/carnitine-weight",
        },
        { label: translate("cla"), link: "/all-products/cla" },
        { label: translate("greenTea"), link: "/all-products/green-tea" },
        { label: translate("guiltFree"), link: "/all-products/guilt-free" },
        {
          label: translate("mealReplacement"),
          link: "/all-products/meal-replacement",
        },
        {
          label: translate("proteinBars"),
          link: "/all-products/protein-bars-weight",
        },
      ],
    },
  ];

  const vitamins = [
    {
      label: translate("vitamins"),
      link: "/all-products/vitamins",
      subItems: [
        { label: translate("vitaminC"), link: "/all-products/vitamin-c" },
        { label: translate("vitaminD"), link: "/all-products/vitamin-d" },
        { label: translate("bComplex"), link: "/all-products/b-complex" },
      ],
    },
    {
      label: translate("minerals"),
      link: "/all-products/minerals",
      subItems: [
        { label: translate("magnesium"), link: "/all-products/magnesium" },
        { label: translate("zinc"), link: "/all-products/zinc" },
      ],
    },
    {
      label: translate("purpose"),
      link: "/all-products/purpose",
      subItems: [
        {
          label: translate("imuneSystem"),
          link: "/all-products/immune-system",
        },
        {
          label: translate("bonesAndJoints"),
          link: "/all-products/bones-and-joints",
        },
        {
          label: translate("hairAndSkin"),
          link: "/all-products/hair-and-skin",
        },
        { label: translate("digestion"), link: "/all-products/digestion" },
        { label: translate("sleep"), link: "/all-products/sleep" },
        { label: translate("antiAging"), link: "/all-products/anti-aging" },
        { label: translate("stress"), link: "/all-products/stress" },
      ],
    },
    { label: translate("antioxidants"), link: "/all-products/antioxidants" },
    { label: translate("omega3"), link: "/all-products/omega-3" },
    { label: translate("collagen"), link: "/all-products/collagen" },
  ];

  const snacks = [
    {
      label: translate("snacks"),
      link: "/all-products/snacks",
      subItems: [
        { label: translate("muesli"), link: "/all-products/muesli" },
        { label: translate("snacks"), link: "/all-products/snacks" },
        { label: translate("pancakes"), link: "/all-products/pancakes" },
        { label: translate("pudding"), link: "/all-products/pudding" },
        { label: translate("calorieFree"), link: "/all-products/calorie-free" },
        { label: translate("spreads"), link: "/all-products/spreads" },
        { label: translate("oils"), link: "/all-products/oils" },
        { label: translate("energyBars"), link: "/all-products/energy-bars" },
        { label: translate("proteinBars"), link: "/all-products/protein-bars" },
      ],
    },
    {
      label: translate("drinks"),
      link: "/all-products/drinks",
      subItems: [
        {
          label: translate("drinksWithCarnitine"),
          link: "/all-products/drinks-with-carnitine",
        },
        {
          label: translate("instantDrinks"),
          link: "/all-products/instant-drinks",
        },
        {
          label: translate("energyIsotonicDrinks"),
          link: "/all-products/energy-isotonic-drinks",
        },
        {
          label: translate("mealReplacement"),
          link: "/all-products/meal-replacement-drinks",
        },
      ],
    },
  ];

  const accessories = [
    {
      label: translate("trainingEquipment"),
      link: "/all-products/training-equipment",
      subItems: [
        { label: translate("weights"), link: "/all-products/weights" },
        {
          label: translate("trainingBandsAndLoop"),
          link: "/all-products/training-bands-loops",
        },
        { label: translate("gloves"), link: "/all-products/gloves" },
        { label: translate("belts"), link: "/all-products/belts" },
        { label: translate("other"), link: "/all-products/other-equipment" },
      ],
    },
    {
      label: translate("fightGear"),
      link: "/all-products/fight-gear",
      subItems: [
        {
          label: translate("boxingGloves"),
          link: "/all-products/boxing-gloves",
        },
        { label: translate("handWraps"), link: "/all-products/hand-wraps" },
        {
          label: translate("punchingBags"),
          link: "/all-products/punching-bags",
        },
      ],
    },
    {
      label: translate("accessories"),
      link: "/all-products/accessories",
      subItems: [
        { label: translate("shakers"), link: "/all-products/shakers" },
        { label: translate("bidons"), link: "/all-products/bidons" },
        { label: translate("bottles"), link: "/all-products/bottles" },
        { label: translate("bags"), link: "/all-products/bags" },
        { label: translate("towels"), link: "/all-products/towels" },
        { label: translate("other"), link: "/all-products/other-accessories" },
      ],
    },
  ];

  const clothing = [
    {
      label: translate("mensClothing"),
      link: "/all-products/mens-clothing",
      subItems: [
        { label: translate("tShirts"), link: "/all-products/t-shirts-mens" },
        {
          label: translate("pulloversAndZipHoodies"),
          link: "/all-products/pullovers-hoodies-mens",
        },
        {
          label: translate("pantsAndTights"),
          link: "/all-products/pants-tights",
        },
        { label: translate("shorts"), link: "/all-products/shorts-mens" },
        { label: translate("other"), link: "/all-products/other-mens" },
      ],
    },
    {
      label: translate("womensClothing"),
      link: "/all-products/womens-clothing",
      subItems: [
        { label: translate("tShirts"), link: "/all-products/t-shirts-womens" },
        {
          label: translate("pulloversAndZipHoodies"),
          link: "/all-products/pullovers-hoodies-womens",
        },
        { label: translate("pants"), link: "/all-products/pants-womens" },
        { label: translate("tights"), link: "/all-products/tights" },
        {
          label: translate("sportsTshirtsAndTops"),
          link: "/all-products/sports-tops",
        },
        { label: translate("shorts"), link: "/all-products/shorts-womens" },
        { label: translate("other"), link: "/all-products/other-womens" },
      ],
    },
    { label: translate("kidsClothes"), link: "/all-products/kids-clothes" },
  ];

  return [
    {
      key: "sports-nutrition",
      icon: FiActivity,
      title: translate("sportsNutrition"),
      link: "/all-products/sports-nutrition",
      columns: [
        sportItems.slice(0, 3),
        sportItems.slice(3, 5),
        sportItems.slice(5, 8),
      ],
    },
    {
      key: "protein",
      icon: FiZap,
      title: translate("protein"),
      link: "/all-products/proteins",
      columns: [protein.slice(0, 1), protein.slice(1, 2)],
    },
    {
      key: "weightLoss",
      icon: FiTrendingDown,
      title: translate("weightLoss"),
      link: "/all-products/weight-loss",
      columns: [weightLoss],
    },
    {
      key: "vitamins",
      icon: FiShield,
      title: translate("vitamins"),
      link: "/all-products/vitamins",
      columns: [
        vitamins.slice(0, 2),
        vitamins.slice(2, 3),
        vitamins.slice(3, 6),
      ],
    },
    {
      key: "snacks",
      icon: FiCoffee,
      title: translate("snacks"),
      link: "/all-products/snacks",
      columns: [snacks.slice(0, 1), snacks.slice(1, 2)],
    },
    {
      key: "accessories",
      icon: FiBox,
      title: translate("accessories"),
      link: "/all-products/accessories",
      columns: [
        accessories.slice(0, 1),
        accessories.slice(1, 2),
        accessories.slice(2, 3),
      ],
    },
    {
      key: "clothing",
      icon: FiShoppingBag,
      title: translate("clothing"),
      link: "/all-products/mens-clothing",
      columns: [
        clothing.slice(0, 1),
        clothing.slice(1, 2),
        clothing.slice(2, 3),
      ],
    },
  ];
};

/** Offer shortcuts shown under "Offers". `tone` picks the tile accent. */
export const buildOfferItems = (translate) => [
  {
    key: "sale",
    label: translate("productsOnSale"),
    description: translate("offerDescSale"),
    link: "/all-products?onSale=true",
    icon: FiPercent,
    tone: "red",
  },
  {
    key: "upcoming",
    label: translate("upcomingPromotions"),
    description: translate("offerDescUpcoming"),
    link: "/all-products?upcomingPromotions=true",
    icon: FiCalendar,
    tone: "yellow",
  },
  {
    key: "outlet",
    label: translate("outlet"),
    description: translate("offerDescOutlet"),
    link: "/all-products?outlet=true",
    icon: FiTag,
    tone: "ink",
  },
  {
    key: "best",
    label: translate("bestSeller"),
    description: translate("offerDescBest"),
    link: "/all-products?bestSeller=true",
    icon: FiAward,
    tone: "yellow",
  },
  {
    key: "new",
    label: translate("new"),
    description: translate("offerDescNew"),
    link: "/all-products?newProducts=true",
    icon: FiZap,
    tone: "green",
  },
  {
    key: "voucher",
    label: translate("giftVouchers"),
    description: translate("offerDescVoucher"),
    link: "/all-products/gift-voucher",
    icon: FiGift,
    tone: "red",
  },
  {
    key: "all",
    label: translate("allProducts"),
    description: translate("offerDescAll"),
    link: "/all-products",
    icon: FiGrid,
    tone: "ink",
  },
];

const stripAccents = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Letter a brand is filed under: A–Z, or "#" for digits and symbols. */
export const brandLetter = (label = "") => {
  const first = stripAccents(label.trim()).charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

/** Case- and accent-insensitive brand match. */
export const brandMatches = (label, query) =>
  stripAccents(label).toLowerCase().includes(stripAccents(query.trim()).toLowerCase());

/** `[{ letter, brands }]` in A–Z order, with "#" first. */
export const groupBrandsByLetter = (brands) => {
  const groups = new Map();
  brands.forEach((brand) => {
    const letter = brandLetter(brand.label);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(brand);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)))
    .map(([letter, list]) => ({ letter, brands: list }));
};

export const BRAND_LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

/** Fallback brand list, used until the live brand list has loaded. */
export const FALLBACK_BRANDS = [
  {
    subItems: [
      { label: "5% Nutrition", link: "/all-products?brand=5-nutrition" },
      { label: "ä Näno", link: "/all-products?brand=a-nano" },
      { label: "AK-47 Labs", link: "/all-products?brand=ak-47-labs" },
      {
        label: "Applied Nutrition",
        link: "/all-products?brand=applied-nutrition",
      },
      { label: "ATOMBODY", link: "/all-products?brand=atombody" },
      {
        label: "Battery Nutrition",
        link: "/all-products?brand=battery-nutrition",
      },
      { label: "BioTechUSA", link: "/all-products?brand=bio-tech-usa" },
      { label: "Body Attack", link: "/all-products?brand=body-attack" },
      { label: "Bolero", link: "/all-products?brand=bolero" },
      { label: "BSN", link: "/all-products?brand=bsn" },
      { label: "Cellucor", link: "/all-products?brand=cellucor" },
      { label: "CHIMPANZEE", link: "/all-products?brand=chimpanzee" },
      { label: "CNP", link: "/all-products?brand=cnp" },
      {
        label: "Dedicated Nutrition",
        link: "/all-products?brand=dedicated-nutrition",
      },
      { label: "DNA", link: "/all-products?brand=dna" },
      { label: "DY Nutrition", link: "/all-products?brand=dy-nutrition" },
      { label: "EHPlabs", link: "/all-products?brand=ehplabs" },
      { label: "German Forge", link: "/all-products?brand=german-forge" },
    ],
  },
  {
    subItems: [
      { label: "Green Cola", link: "/all-products?brand=green-cola" },
      { label: "Haribo", link: "/all-products?brand=haribo" },
      { label: "IronMaxx", link: "/all-products?brand=ironmaxx" },
      { label: "Lenny & Larry", link: "/all-products?brand=lenny-larry" },
      { label: "Liverpool F.C.", link: "/all-products?brand=liverpool-f-c" },
      { label: "Mars", link: "/all-products?brand=mars" },
      { label: "MuscleTech", link: "/all-products?brand=muscletech" },
      { label: "Naughty Boy", link: "/all-products?brand=naughty-boy" },
      { label: "NEBBIA", link: "/all-products?brand=nebbia" },
      { label: "NOCCO", link: "/all-products?brand=nocco" },
      { label: "NOW Foods", link: "/all-products?brand=now-foods" },
      { label: "Nutrend", link: "/all-products?brand=nutrend" },
      {
        label: "Nutrex Research",
        link: "/all-products?brand=nutrex-research",
      },
      {
        label: "Olimp Sport Nutrition",
        link: "/all-products?brand=olimp-sport-nutrition",
      },
      {
        label: "Optimum Nutrition",
        link: "/all-products?brand=optimum-nutrition",
      },
      { label: "OstroVit", link: "/all-products?brand=ostrovit" },
      { label: "Perfect Meals", link: "/all-products?brand=perfect-meals" },
      { label: "PharmaFreak", link: "/all-products?brand=pharmafreak" },
    ],
  },
  {
    subItems: [
      { label: "Proteini.si", link: "/all-products?brand=proteini-si" },
      { label: "PVL", link: "/all-products?brand=pvl" },
      { label: "RABEKO", link: "/all-products?brand=rabeko" },
      { label: "Redcon1", link: "/all-products?brand=redcon1" },
      { label: "RIPT", link: "/all-products?brand=ript" },
      {
        label: "Scitec Nutrition",
        link: "/all-products?brand=scitec-nutrition",
      },
      { label: "Scivation", link: "/all-products?brand=scivation" },
      { label: "Snickers", link: "/all-products?brand=snickers" },
      {
        label: "SPORTNAHRUNG.AT",
        link: "/all-products?brand=sportnahrung-at",
      },
      { label: "Swanson", link: "/all-products?brand=swanson" },
      { label: "THE Nutrition", link: "/all-products?brand=the-nutrition" },
      { label: "Tiger", link: "/all-products?brand=tiger" },
      {
        label: "Universal Nutrition",
        link: "/all-products?brand=universal-nutrition",
      },
      { label: "USN", link: "/all-products?brand=usn" },
      { label: "USP Labs", link: "/all-products?brand=usp-labs" },
      { label: "VAST Sports", link: "/all-products?brand=vast-sports" },
    ],
  },
].flatMap((column) => column.subItems);

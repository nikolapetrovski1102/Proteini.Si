// Which shop icon goes with which category slug, filter group and status.
import {
  BanknoteIcon,
  BarIcon,
  BicepIcon,
  BoltIcon,
  BoxIcon,
  BoxingGloveIcon,
  CalendarIcon,
  CanIcon,
  CapsuleIcon,
  ChecklistIcon,
  DumbbellIcon,
  FlameIcon,
  GiftIcon,
  GridIcon,
  HashIcon,
  IceCreamIcon,
  MedalIcon,
  LeafIcon,
  MoleculeIcon,
  MoonIcon,
  PriceTagIcon,
  ProteinTubIcon,
  SaleIcon,
  ScaleIcon,
  SealCheckIcon,
  ShakerIcon,
  ShieldHeartIcon,
  SneakerIcon,
  SparkleIcon,
  StopwatchIcon,
  TShirtIcon,
  TargetIcon,
} from "./ShopIcons";

/* --------------------------------------------------------------- lookups */

const SLUG_ICONS = {
  // nav-only keys
  "sports-nutrition": DumbbellIcon,
  // protein
  proteins: ProteinTubIcon,
  protein: ProteinTubIcon,
  whey: ProteinTubIcon,
  isolate: ProteinTubIcon,
  casein: ProteinTubIcon,
  "protein-blends": ProteinTubIcon,
  "vegan-protein": LeafIcon,
  "beef-protein": ProteinTubIcon,
  "egg-white-protein": ProteinTubIcon,
  "ready-to-drink": CanIcon,
  // muscle mass
  gainers: BicepIcon,
  "muscle-mass-fast-gain": BicepIcon,
  "muscle-mass-quality-gain": BicepIcon,
  "muscle-mass": BicepIcon,
  recovery: BicepIcon,
  "hormone-boosters": BicepIcon,
  tribulus: LeafIcon,
  daa: MoleculeIcon,
  "multi-formulas": CapsuleIcon,
  // amino acids & creatine
  "amino-acids": MoleculeIcon,
  bcaa: MoleculeIcon,
  glutamine: MoleculeIcon,
  hmb: MoleculeIcon,
  eaa: MoleculeIcon,
  "amino-mix": MoleculeIcon,
  creatine: MoleculeIcon,
  monohydrates: MoleculeIcon,
  "advanced-types": MoleculeIcon,
  // weight loss
  "weight-loss": ScaleIcon,
  weightLoss: ScaleIcon,
  definition: FlameIcon,
  thermogenics: FlameIcon,
  "fat-burners": FlameIcon,
  carnitine: FlameIcon,
  "carnitine-weight": FlameIcon,
  cla: FlameIcon,
  "green-tea": LeafIcon,
  "guilt-free": ScaleIcon,
  "meal-replacement": ScaleIcon,
  "calorie-free": ScaleIcon,
  // energy
  "energy-boosters": BoltIcon,
  "pre-workout": BoltIcon,
  "strength-energy-pump": BoltIcon,
  "endurance-enhancers": StopwatchIcon,
  "mental-focus": BoltIcon,
  "energy-gels": BoltIcon,
  carbohydrates: BoltIcon,
  // vitamins & health
  vitamins: CapsuleIcon,
  minerals: CapsuleIcon,
  "vitamin-c": CapsuleIcon,
  "vitamin-d": CapsuleIcon,
  "b-complex": CapsuleIcon,
  magnesium: CapsuleIcon,
  zinc: CapsuleIcon,
  "omega-3": CapsuleIcon,
  antioxidants: LeafIcon,
  collagen: CapsuleIcon,
  purpose: ShieldHeartIcon,
  "immune-system": ShieldHeartIcon,
  "bones-and-joints": ShieldHeartIcon,
  "hair-and-skin": ShieldHeartIcon,
  digestion: ShieldHeartIcon,
  stress: ShieldHeartIcon,
  "anti-aging": ShieldHeartIcon,
  sleep: MoonIcon,
  // food & drinks
  snacks: BarIcon,
  muesli: BarIcon,
  pancakes: BarIcon,
  pudding: BarIcon,
  spreads: BarIcon,
  oils: BarIcon,
  drinks: CanIcon,
  // gear & clothing
  accessories: ShakerIcon,
  shakers: ShakerIcon,
  bidons: ShakerIcon,
  bottles: ShakerIcon,
  bags: ShakerIcon,
  towels: ShakerIcon,
  "training-equipment": DumbbellIcon,
  weights: DumbbellIcon,
  belts: DumbbellIcon,
  gloves: DumbbellIcon,
  "training-bands-loops": DumbbellIcon,
  "fight-gear": BoxingGloveIcon,
  "boxing-gloves": BoxingGloveIcon,
  "hand-wraps": BoxingGloveIcon,
  "punching-bags": BoxingGloveIcon,
  clothing: TShirtIcon,
  "mens-clothing": TShirtIcon,
  "womens-clothing": TShirtIcon,
  "kids-clothes": TShirtIcon,
  "gift-voucher": GiftIcon,
  // goals
  "endurance-recovery": StopwatchIcon,
  "active-lifestyle": SneakerIcon,
  // use timing
  "before-training": BoltIcon,
  "during-training": StopwatchIcon,
  "after-training": BicepIcon,
};

// Loose fallbacks for slugs added later from the admin.
const SLUG_PATTERNS = [
  [/protein-bar|energy-bar|bar/, BarIcon],
  [/drink|isoton|caffein/, CanIcon],
  [/protein/, ProteinTubIcon],
  [/vitamin|mineral/, CapsuleIcon],
  [/cloth|shirt|hood|pullover|pants|tights|shorts|tops|womens|mens/, TShirtIcon],
  [/carnitine|burn|thermo/, FlameIcon],
  [/energy|workout/, BoltIcon],
  [/amino|creatin/, MoleculeIcon],
  [/glove|box|punch|fight/, BoxingGloveIcon],
  [/equipment|weight/, DumbbellIcon],
  [/shaker|bottle|bidon|accessor/, ShakerIcon],
];

/** Icon component for a category/goal slug, or null when none fits. */
export function iconForSlug(slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase();
  if (SLUG_ICONS[slug] || SLUG_ICONS[key]) return SLUG_ICONS[slug] || SLUG_ICONS[key];
  const match = SLUG_PATTERNS.find(([pattern]) => pattern.test(key));
  return match ? match[1] : null;
}

/** Icon for a nav link like "/all-products/whey". */
export const iconForLink = (link = "") => iconForSlug(link.split("?")[0].split("/").filter(Boolean).pop());

export const FILTER_GROUP_ICONS = {
  categoryIds: GridIcon,
  priceRange: BanknoteIcon,
  status: ChecklistIcon,
  brandIds: SealCheckIcon,
  goalIds: TargetIcon,
  sportIds: SneakerIcon,
  useTimingIds: StopwatchIcon,
  flavorIds: IceCreamIcon,
  sizes: TShirtIcon,
  tagIds: HashIcon,
};

export const STATUS_ICONS = {
  inStock: BoxIcon,
  onSale: SaleIcon,
  newProducts: SparkleIcon,
  bestSellers: MedalIcon,
  outlet: PriceTagIcon,
  upcomingPromotions: CalendarIcon,
};

/** Icon for one option inside a filter group (categories, status, goals, timing). */
export function iconForFilterItem(groupKey, item) {
  if (groupKey === "status") return STATUS_ICONS[item.id] || null;
  if (["categoryIds", "goalIds", "useTimingIds"].includes(groupKey)) return iconForSlug(item.slug);
  return null;
}

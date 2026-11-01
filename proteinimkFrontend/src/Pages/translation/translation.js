// Translation dictionary
const translations = {
  al: {
    contactAssistance:
      "Nëse keni nevojë për ndihmë ose keni pyetje në lidhje me produktet:",
    phoneLabel: "T",
    emailLabel: "E",
    workingHours: "Orari i punës:",
    workingHoursWeekdays: "E hënë - E premte: 10:00 - 22:00",
    workingHoursWeekend: "E shtunë, E diel, festat publike: Mbyllur",
    businessCooperationTitle:
      "A po kërkoni një mundësi të re biznesi? A shijoni sportin dhe praktikoni një mënyrë jetese të shëndetshme? Atëherë ju ftojmë t'i bashkoheni historisë së suksesit të Proteini.si.",
    businessCooperationImageAlt: "Mundësi biznesi",
    businessCooperationDesc1:
      "Proteini.si SHOP është pjesë e një rrjeti dyqanesh me ushqim sportiv, aksesorë dhe veshje. Mund të gjeni Dyqanet Proteini.si në të gjithë Slloveninë, në vendet e ish-Jugosllavisë dhe në Austri. Në dyqanet tona do të gjeni staf shitjesh miqësor, të dobishëm dhe të kualifikuar profesionalisht që do t'ju ndihmojë të zgjidhni produktin e duhur për qëllimet tuaja dhe mënyrën tuaj të jetesës.",
    businessCooperationDesc2:
      "Në Dyqanet Proteini.si dhe në dyqanin online Proteini.si mund të gjeni vetëm produkte dhe marka të cilësisë së lartë si Battery Nutrition, Olimp, Nutrend, USN, Ironmaxx dhe shumë marka të tjera të ushqimit sportiv, sepse ne duam t'ju ofrojmë vetëm më të mirën.",
    businessCooperationContact:
      "Për më shumë informacion ju lutemi na kontaktoni në",
    faqTitle: "Pyetjet e bëra më shpesh",
    faqShippingTime: "Sa kohë zgjat transporti?",
    faqShippingTimeAnswer:
      "Transporti standard zgjat 2-4 ditë pune, ndërsa transporti ekspres zgjat 1-2 ditë pune.",
    faqReturnProduct: "A mund të kthej një produkt?",
    faqReturnProductAnswer:
      "Po, mund t'i ktheni produktet brenda 14 ditëve nga marrja, të pahapura dhe në paketimin origjinal.",
    faqTrackOrder: "Si ta gjurmoj porosinë time?",
    faqTrackOrderAnswer:
      "Do të merrni një numër gjurmimi me email pasi porosia juaj të jetë dërguar.",
    faqInternationalShipping: "A dërgoni ndërkombëtarisht?",
    faqInternationalShippingAnswer:
      "Aktualisht, ne dërgojmë vetëm brenda Maqedonisë së Veriut.",
    faqLoyaltyPoints: "Si t'i përdor pikët e mia të besnikërisë?",
    faqLoyaltyPointsAnswer:
      "Pikët e besnikërisë mund të aplikohen gjatë arkëtimit për zbritje të menjëhershme.",
    customerSupport: "Mbështetje për klientët",
    customerSupportDesc:
      "Klientët e Protein.si gjithmonë mund të kontrollojnë në llogarinë e tyre të përdoruesit statusin e porosisë, historikun e blerjeve dhe statusin e pikëve të besnikërisë, si dhe të ndryshojnë të dhënat e tyre personale, adresën e dërgesës, fjalëkalimin, etj.",
    howToSubmitOrder: "Si të dorëzoni një porosi",
    howToSubmitOrderDesc:
      "Kur të gjeni produktin që dëshironi të blini, zgjidhni sasinë dhe klikoni në butonin e gjelbër SHTO NË SHPORT për të shtuar artikullin në shportën tuaj virtuale. Nëse produkti ka parametra të ndryshëm që duhet të zgjidhni, si madhësia, shija, etj., duhet të përcaktoni edhe këto parametra përpara se ta shtoni artikullin në shportë. Sistemi do t'ju kujtojë me mirësi me një mesazh të shfaqur në këndin e sipërm të djathtë, se çfarë vlere duhet të shtoni në shportën tuaj në rast se dëshironi të merrni transport falas. Mund të vazhdoni të shfletoni për të zgjedhur produkte shtesë, ose mund të vazhdoni me blerjen duke klikuar në butonin e gjelbër PLOTËSO BLERJEN.",
    basketStep: "1. SHPORTA",
    basketStepDesc:
      "Një vështrim në shportën tuaj do të zbulojë përmbajtjen e saj, produktet e zgjedhura me parametrat e lidhura, numrin e pikëve të besnikërisë të mbledhura me këtë blerje, paratë e kursyera dhe shumën totale për pagesë. Nëse gjithçka është renditur saktë, mund të vazhdoni në hapin tjetër.",
    promoCodeStep: "2. PËRDORNI KODIN PROMOCIONAL",
    promoCodeStepDesc:
      "Në anën e djathtë mund të gjeni të gjitha kodet promocionale që janë aktualisht aktive. Duke klikuar në atë të dëshiruar, kodi do të shfaqet në fushën e zbrazët në anën e majtë. Përdorni kodin duke klikuar butonin OK. Me secilën blerje online, mund të përdoret vetëm një kod promocional (kombinimi i kodeve të ndryshme promocionale nuk është i mundur). Nuk është e nevojshme të përdorni kodin, mund të vazhdoni lirisht me procesin tuaj të blerjes edhe pa përdorimin e kodit promocional.",
    freeGiftStep: "3. ZGJIDHNI DHURATËN FALAS TË PROTEINI.SI",
    freeGiftStepDesc:
      "Në varësi të vlerës së porosisë suaj, sistemi ju ofron mundësinë të zgjidhni një dhuratë falas që e konfirmoni duke klikuar në butonin e verdhë ZGJIDH. Zgjedhja e një dhurate falas të Proteini.si nuk është e nevojshme dhe mund të vazhdoni me blerjen tuaj pa zgjedhur dhuratën.",
    freeShippingStep: "4. PËR TË MARRË TRANSPORT FALAS JU MUNGON VETËM XY EUR",
    freeShippingStepDesc:
      "Në këtë hap, sistemi do të propozojë produkte në një vlerë që ju mungon ende për të marrë transport falas. Nëse dëshironi të shtoni produktin e propozuar, klikoni në butonin e gjelbër SHTO NË SHPORT. Do të hapet një dritare e re me përshkrimin e produktit, çmimin, pikët e besnikërisë që fitoni në rast të blerjes dhe sasinë. Klikoni në butonin e gjelbër VAZHDO për të vazhduar me blerjen.",
    freeGiftDescription:
      "Në Proteini.si synojmë t'u ofrojmë klientëve tanë një përzgjedhje të gjerë të produkteve të ushqyerjes sportive me cilësi të lartë dhe produkte për një mënyrë jetese të shëndetshme dhe aktive. Ne gjithashtu shpërblejmë klientët tanë, për t'i falënderuar që na kanë besuar. Në varësi të vlerës së blerjes suaj, ju mund të zgjidhni nga një shumëllojshmëri dhuratash falas, të tilla si byzylykë, varëse, shakerë, shishe uji, peshqirë, çanta, etj. Sa më e lartë të jetë shuma e blerjes suaj, aq më e madhe është vlera e dhuratës suaj.",
    paymentMethodsTitle: "Ne ofrojmë metodat e mëposhtme të pagesës:",
    paymentMethodCard:
      "Kartë debiti ose krediti (Mastercard, Visa, Activa, Maestro)",
    paymentMethodCash: "Pagesë në dorëzim",
    paymentMethodDescription:
      "Furnizuesi lëshon një faturë në një medium të qëndrueshëm, me një ndarje të kostove dhe një njoftim për klientin se si të tërhiqet nga blerja dhe ta kthejë produktin, nëse është e nevojshme dhe e mundur.",
    paymentMethodStorage:
      "Marrëveshja e blerjes (porosia) ruhet elektronikisht në një server të arritshëm për furnizuesin dhe klientin, në çdo kohë në profilin e tij të përdoruesit (Profili im).",
    shippingInformation: "Informacion për transportin",
    shippingDesc1:
      "Ne ofrojmë transport të shpejtë dhe të besueshëm në të gjithë vendin.",
    shippingDesc2:
      "Të gjitha parcelat dërgohen me partnerin tonë korrier ELS - Eko Logistic Service MK.",
    shippingDesc3:
      "Porositë mund të paguhen me kartë krediti ose me pagesë në dorëzim përmes ELS.",
    shippingDesc4:
      "Të gjitha porositë e bëra në ditë pune deri në orën 14 do të dërgohen po atë ditë!",
    shippingDesc5: "Transporti falas për porosi mbi 3000 denarë",
    // Albanian translations
    forWeightLoss: "Për humbje peshe",
    forMuscleMass: "Për masë muskulore",
    forMoreEndurance: "Për më shumë qëndrueshmëri",
    forHealthAndWellBeing: "Për shëndet dhe mirëqenie",
    bestSeller: "Më i shitura",
    // Common UI elements
    welcome: "Mirë se vini",
    hello: "Përshëndetje",
    goodbye: "Mirupafshim",

    // Home Page
    freeShipping: "Transporti falas për porositë mbi 3000 MKD",
    exploreOffers: "EKSPLORO OFERTAT",
    findAProduct: "Gjeni një produkt",
    language: "Gjuha",
    branches: "Degët",
    myAccount: "Llogaria ime",
    shoppingCart: "Shporta ime",
    sportsNutrition: "Ushqimi Sportiv",
    aminoAcids: "AMINOACIDET",
    bcaa: "BCAA",
    glutamine: "GLUTAMINA",
    hmb: "HMB",
    eaa: "EAA",
    aminoMix: "PËRZIERJA AMINO",
    definition: "PËRKUFIZIMI",
    thermogenics: "TERMOGJENIKËT",
    carnitine: "KARNITINA",
    creatine: "KREATINA",
    monohydrates: "MONOHIDRATET",
    advancedTypes: "LLOJET E AVANCUARA",
    protein: "Proteina",
    proteins: "Proteinat",
    energyBoosters: "MË SHUMË ENERGJI",
    carbohydrates: "Karbohidratet",
    energyIsotonicDrinks: "PIJET ENERGJIKE-IZOTONIKE",
    energyBars: "SHKOPKA ENERGJIKE",
    energyGels: "XHEL ENERGJIK",
    caffeinatedDrinks: "PIJET ME KAFEINË",
    whey: "WHEY",
    eggWhiteProtein: "PROTEINË NGA E BARDHA E VEZËS",
    isolate: "IZOLATI",
    proteinBlends: "PËRZIERJET E PROTEINAVE",
    casein: "KASEINA",
    veganProtein: "PROTEINA VEGANE",
    beefProtein: "PROTEINA E VIÇIT",
    readyToDrink: "GATI PËR TË PIRË",
    proteinBars: "SHKOPKA PROTEINE",
    proteinSnaks: "USHQIMET E LEHTA PROTEINE",
    gainers: "SHTUESIT E PESHËS",
    muscleMassFastGain: "SHTIMI I SHPEJTË I MASËS MUSKULORE",
    muscleMassQualityGain: "SHTIMI CILËSOR I MASËS MUSKULORE",
    strengthEnergyPump: "FUQIA / ENERGJIA / PUMP",
    endurance: "QËNDRUESHMËRIA",
    mentalFocus: "FOKUSI MENTAL",
    hormoneBoosters: "RRITËS HORMONALË",
    tribulus: "TRIBULUS",
    daa: "DAA",
    multiFormulas: "FORMULA TË KOMBINUARA",
    recovery: "RIMËKËMBJA",
    weightLoss: "Humbja e peshës",
    fatBurners: "DJEGËSIT E DHJAMIT",
    cla: "CLA",
    greenTea: "ÇAJI I GJELBËRT",
    guiltFree: "PA NDJENJË F AJE",
    mealReplacement: "ZËVENDËSIMI I USHQIMIT",
    vitamins: "Vitaminat",
    vitaminC: "Vitamina C",
    vitaminD: "Vitamina D",
    bComplex: "KOMPLEKSI B",
    minerals: "MINERALET",
    magnesium: "MAGNEZI",
    zinc: "ZINKU",
    purpose: "QËLLIMI",
    imuneSystem: "SISTEMI IMUNITAR",
    bonesAndJoints: "KOCKAT DHE NYJET",
    hairAndSkin: "FLOKËT DHE LËKURA",
    digestion: "TRETJA",
    sleep: "GJUMI",
    antiAging: "KUNDËR PL MOSHIMIT",
    stress: "STRESI",
    antioxidants: "ANTIOKSIDANTËT",
    omega3: "OMEGA 3",
    collagen: "KOLAGJENI",
    snacks: "Ushqime të lehta",
    muesli: "MUESLI",
    pancakes: "PALLACINKA",
    pudding: "PUDINGU",
    calorieFree: "PA KALORI",
    spreads: "PETËT",
    oils: "VAJRAT",
    energyBars: "SHKOPKA ENERGJIKE",
    drinks: "PIJET",
    drinksWithCarnitine: "PIJET ME KARNITINË",
    instantDrinks: "PIJET E MENJËHERSHME",
    accessories: "Pajisjet",
    trainingEquipment: "PAJISJET PËR STËRVITJE",
    weights: "PESHAT",
    trainingBandsAndLoop: "SHIRITAT DHE LASTAT PËR STËRVITJE",
    gloves: "DORËZAT",
    belts: "RRIpat",
    other: "TË TJERA",
    fightGear: "PAJISJET PËR BOKS/MMA",
    boxingGloves: "DORËZAT E BOKSIT",
    handWraps: "FASHAT PËR DUAR",
    punchingBags: "ÇANTA BOKSI",
    shakers: "SHEJKERËT",
    bidons: "BIDONËT",
    bottles: "SHISHET",
    bags: "ÇANTA",
    backpacks: "ÇANTA SHPËRNDARËSE",
    tights: "HELANKE",
    towels: "PESHQIRËT",
    clothing: "Veshjet",
    mensClothing: "VESHJE PËR BURRA",
    womensClothing: "VESHJE PËR GRA",
    tShirts: "BLAUZA",
    pulloversAndZipHoodies: "PULOVRA DHE BLAUZA ME ZIP",
    pantsAndTights: "PANTALLONA DHE LEGJINA",
    shorts: "SHORCA",
    pants: "PANTALLONA",
    sportsTshirtsAndTops: "BLUZA DHE TOPA SPORTIVË",
    jackets: "XHUPA",
    hoodies: "BLAUZA ME KAPUÇ",
    kidsClothes: "VESHJE PËR FËMIJË",
    freeShippingOver: "Transporti falas mbi 3000 MKD*",
    youGainLoyaltyPoints: "Ju fitoni pikë besnikërie me çdo blerje",
    unparalleledQuality: "Cilësi e pakrahasueshme",
    checkTodaysOffer: "Shikoni ofertën e sotme",
    noNewProductsAvailable:
      "Nuk ka produkte të reja në dispozicion për momentin.",
    noProductsOnSale: "Nuk ka produkte në shitje për momentin.",
    recomendedForYou: "Të rekomanduara për ju",
    rfydesc1:
      "Produkte që mendojmë se mund t'ju pëlqejnë. Nëse na tregoni më shumë për veten tuaj ",
    rfydesc2: "Ne do të sugjerojmë më të përshtatshmet për dëshirat tuaja ",
    rfydesc3: " Regjistrohuni!",
    registeredUsersHave: "Përdoruesit e regjistruar kanë:",
    goalOrientedProducts: "produkte të orientuara nga qëllimi",
    exclusiveBenefits: "përfitime ekskluzive",
    loyaltyPoints: "pikët e besnikërisë",
    loyaltyPoints1: "Pikët e besnikërisë",
    fastOrdering: "porositje e shpejtë",
    listOfFavourites: "lista e të preferuarave...",
    register: "Regjistrohu",
    registerForABetterExperience: "Regjistrohu për një përvojë më të mirë!",
    noRecommendedProducts: "Nuk ka produkte të rekomanduara për momentin.",
    noOutletProductsAvailable:
      "Nuk ka produkte në dispozicion në dalje për momentin.",
    chooseYourGoal: "Zgjidhni qëllimin tuaj",
    loseWeight: "Humbni peshë",
    gainMuscleMass: "Fitoni masë muskulore",
    improveYourForm: "Përmirësoni formën dhe qëndrueshmërinë",
    vitalityAsALifestyle: "Vitaliteti si mënyrë jetese",
    showAll: "Shfaq të gjitha",
    showMore: "Shfaq më shumë",
    showLess: "Shfaq më pak",
    voucherAmount: "Vlera e kuponit",
    voucherMinimum: "Vlera minimale:",
    whatSportsAreYou: "Për çfarë sportesh jeni të interesuar?",
    cycling: "Çiklizëm",
    running: "Vrapimi",
    teamSports: "Sportet ekipore",
    fitnessAndBodybuilding: "Fitnesi dhe bodybuilding",
    tips: "Këshilla",
    allTips: "TË GJITHA KËSHILLAT",
    events: "NGJARJET",
    newProducts: "PRODUKTET E REJA",
    productCountLabel: "produkte",
    recommendedOrder: "Të rekomanduara",
    searchSuggestionsHint: "Produkte të sugjeruara para se të kërkoni",
    northMacedonia: "Maqedonia e Veriut",
    news: "Lajmet",
    womensEnergyStarts: "Energjia e gruas fillon nga brenda",
    whenTheBodyFunctions:
      "Kur truri funksionon në ekuilibër, kjo reflektohet nga jashtë përmes një gjendjeje të qëndrueshme ...",
    liverAndDetoxification:
      "Mëlçia dhe Detoksifikimi: Si t'i Mbështetni Ato Natyralisht",
    didYouKnowThat:
      "A e dini se trupi juaj detoksifikohet 24 orë në ditë - madje edhe ...",
    noBakeProteinCheescake: "Cheesecake me proteina pa pjekje në kavanoz",
    doYouEverCrave:
      "A keni ndonjëherë dëshirë për diçka të ëmbël pas një vakti apo stërvitje, por ...",
    video: "Video",
    fitnessMyLife: "Fitnesi - Jeta ime!",
    hiitWorkout: "STËRVITJA HIIT",
    shutUpAndBench: "Hesht dhe bëj stërvitje në stol",
    goHardOrGoHome: "Jepi të gjitha ose shko në shtëpi",
    theUltimateBack: "Stërvitja përfundimtare e shpinës",
    readyForSummer: "Gati për verë?",
    outlet: "Outlet",
    purchaseProcess: "Procesi i blerjes",
    new: "E re",
    partners: "Partnerët",
    awardsAndCertificates: "Çmimet dhe certifikatat",
    proteinisi: "#proteinisi",
    shareYourExperience: "Shpërndani përvojën tuaj",
    needHelp: "Keni nevojë për ndihmë",
    weAreAvailableForYou:
      "Jemi në dispozicion për ju nga e hëna në të premte, nga ora 8:00 deri në 16:00",
    phoneNumber: "+389 71 399 036",
    email: "E-mail",
    companyAddress: "Adresa e Kompanisë",
    subscribeToENews: "Abonohu në E-lajme",
    stayInformedAboutCurrent:
      "Qëndroni të informuar për promovimet dhe lajmet aktuale",
    enterYourEmailAddress: "Shkruani adresën tuaj të emailit",
    login: "Hyrja",
    followUs: "Na ndiqni",
    aboutProteiniSi: "Rreth Proteini.si",
    aboutTheCompanyProteiniSi: "Rreth Kompanisë Proteini.si",
    businessCooperation: "Bashkëpunimi Afarist",
    contatto: "Kontakti",
    contact: "Kontakti",
    theme: "TEMA",
    bright: "E ndritshme",
    dark: "E errët",
    customerService: "Shërbimi ndaj klientit",
    shipping: "Transporti",
    paymentMethods: "Mënyrat e pagesës",
    freeGift: "Dhuratë falas",
    faq: "FAQ",
    termsOfService: "Kushtet e Shërbimit",
    generalProvisions: "Dispozitat e përgjithshme",
    newInTheShop: "E re në dyqan",
    perServing: "për racion",
    servings: "racione",
    moreAboutRatings: "(më shumë rreth vlerësimeve)",
    quickPurchase: "Blerja e shpejtë",
    productsOnSale: "Produktet në shitje",
    brands: "Brendet",
    offers: "Ofertat",
    upcomingPromotions: "Promovimet e ardhshme",
    sale: "E re",
    recommended: "E REKOMANDUAR",
    productsInTheOutlet: "Produktet në dalje",

    //Profile
    adminPanel: "PANELI ADMINISTRATIV",
    logout: "Dilni",
    myProfile: "Profili im",
    accessDetails: "Detajet e qasjes",
    username: "Emri i përdoruesit",
    status: "Statusi",
    noStatus: "Nuk ka status",
    changePassword: "Ndrysho fjalëkalimin",
    currentPassword: "Fjalëkalimi aktual",
    newPassword: "Fjalëkalimi i ri",
    repeatNewPassword: "Përsëritni fjalëkalimin e ri",
    billingInformation: "Informacionet e faturimit",
    userName: "Emri i përdoruesit",
    edit: "Ndrysho",

    //Sign in
    signInTo: "Hyni në proteini.si",
    eMail: "E-mail",
    password: "Fjalëkalimi",
    signInWithGoogle: "Hyni me Google",
    signInWithFb: "Hyni me Facebook",
    signInWithApple: "Hyni me Apple",
    signInWithPaypal: "Hyni me PayPal",
    forgotPassword: "Keni harruar fjalëkalimin",
    weCareAndProcess:
      "Ne kujdesemi dhe përpunojmë të dhënat tuaja personale në përputhje me",
    dontHaveAnAccountYet: "Nuk keni ende një llogari?",
    proteiniSiAllows: "Llogaria Proteini.si ju lejon:",
    exclusiveBenefits1: "Përfitime ekskluzive",
    fasterPurchase: "Blerje më e shpejtë",
    trackOrderStatus: "Ndiqni statusin e porosisë",
    favoriteProductList: "Lista e produkteve të preferuara",
    collectAndUseLoyalty: "Mblidhni dhe përdorni pikët e besnikërisë",
    createAnAcc: "Krijoni një llogari",
    loggingIn: "Duke hyrë",
    failedToFetch: "Hyrja dështoi",
    creating: "Duke krijuar",
    creationFailed: "Krijimi dështoi",

    //Create an Account
    advatagesOfCreating: "Përparësitë e krijimit të një llogarie përdoruesi",
    alreadyHaveAnAccount: "Keni tashmë një llogari? Hyni",
    createYourAccount: "Krijoni llogarinë tuaj",
    neutralPerson: "Personi fizik",
    company: "Kompania",
    nameAndSurname: "Emri dhe mbiemri",
    email1: "E-maili",
    passwordShouldBeAtLeast: "Fjalëkalimi duhet të jetë të paktën 8 karaktere",
    confirmYour: "Konfirmoni fjalëkalimin tuaj",
    quickRegistration: "Regjistrimi i shpejtë me një llogari ekzistuese",
    companyName: "Emri i Kompanisë",
    streetName: "Rruga dhe numri",
    taxNumber: "Numri tatimor",
    postCode: "Kodi postar",
    city: "Qyteti",
    phone: "Telefoni",
    selectACountry: "Zgjidhni shtetin",
    country: "Shteti",

    google: "Google",
    FaFacebook: "Facebook",
    apple: "Apple",

    home: "Faqja kryesore",
    about: "Rreth nesh",
    services: "Shërbimet",
    contact: "Kontakti",
    privacyPolicy: "Politika e privatësisë",

    // Footer
    copyright: "Të gjitha të drejtat e rezervuara",
    footerInfo1: "Ushqimi sportiv dhe suplementet ushqyese si",
    footerInfo2: "proteina, aminoacide, vitamina, suplemente për humbje peshe,",
    footerInfo3: "ushqime të shëndetshme dhe shumë më tepër",
    allRightsReserved: "Të gjitha të drejtat e rezervuara",

    // Modal
    close: "Mbylle",
    confirm: "Konfirmo",
    cancel: "Anulo",

    // Popup
    success: "Sukses!",
    error: "Ndodhi një gabim",
    loading: "Duke ngarkuar...",

    // Language Modal
    selectLanguage: "Zgjidhni gjuhën",
    slovenia: "Sllovenia",
    europeanUnion: "Bashkimi Evropian",
    croatia: "Kroacia",
    serbia: "Serbia",
    bosnia: "Bosnja dhe Hercegovina",
    montenegro: "Mali i Zi",
    macedonia: "Maqedonia",
    albania: "Shqipëria",

    // Admin Panel
    id: "ID",
    image: "Foto",
    name: "Emri",
    category: "Kategoria",
    grams: "Gramat",
    price: "Çmimi",
    ddv: "TVSH %",
    priceWithDDV: "Çmimi + TVSH",
    quantity: "Sasia",
    placement: "Vendosja",
    actions: "Veprimet",
    addNewProduct: "+ Shto produkt të ri",
    edit: "Ndrysho",
    delete: "Fshije",

    // Admin Panel - Add/Edit Product Modal
    productName: "Emri i produktit",
    brand: "Marka",
    price: "Çmimi",
    ddvPercentage: "Përqindja e TVSH-së (%)",
    quantity: "Sasia",
    servings: "Racionet",
    gPerServing: "Gramë për racion",
    gNutrition: "Gramë ushqimi",
    productImage: "Fotoja e produktit",
    otherDescriptionTitle: "Titulli i përshkrimit tjetër",
    otherDescriptionText: "Teksti i përshkrimit tjetër",
    nutritionValuesIngredients: "Vlerat ushqyese - Përbërësit",
    nutritionValuesIngredientsDescription: "Përshkrimi i vlerave ushqyese",
    nutritionInformation: "Informacionet ushqyese",
    instructionsForUse: "Udhëzimet për përdorim",
    instructionsForUseDescription: "Përshkrimi i udhëzimeve për përdorim",
    detailedInstructions: "Udhëzimet e detajuara",
    cancel: "Anulo",
    addAnotherDescription: "+ Shto një përshkrim tjetër",
    categorySelection: "Përzgjedhja e kategorisë",
    mainCategory: "Kategoria kryesore",
    selectMainCategory: "Zgjidh kategorinë kryesore...",
    subcategory: "Nënkategoria",
    selectSubcategory: "Zgjidh nënkategorinë...",
    selectMainCategoryFirst: "Së pari zgjidhni kategorinë kryesore",
    selectedCategories: "Kategoritë e zgjedhura:",
    categorySelectionInfo:
      "Zgjidhni kategorinë kryesore, pastaj zgjidhni nënkategoritë. Kategoria kryesore do të përfshihet automatikisht.",
    otherFilters: "Filtrat e tjerë",
    productManagement: "Menaxhimi i produkteve",
    newInTheShop: "E re në dyqan",
    productsOnSale: "Produktet në shitje",
    recommendedForYou: "Të rekomanduara për ju",
    productsInTheOutlet: "Produktet në dalje",
    justForMe: "Vetëm për mua",
    mainDescriptions: "Përshkrimet kryesore",
    descriptionPlus: "Përshkrimi",
    description: "Përshkrimi",
    categoryPlacement: "Vendosja në kategori",
    enterProductName: "Shkruani emrin e produktit",
    enterCategory: "Shkruani kategorinë",
    clickToUploadImage: "Kliko për të ngarkuar foton",
    processing: "Duke përpunuar...",
    updateProduct: "Përditëso produktin",
    createProduct: "Krijo produktin",

    //Privacy Policy AL
    generalProvisions: "DISPOZITAT E PËRGJITHSHME",
    dataOfTheController: "Të dhënat e Kontrolluesit",
    controllerDescription:
      "Kontrolluesi është ai që menaxhon të dhënat personale dhe përcakton qëllimet dhe mjetet për përpunimin e të dhënave personale. Për aq sa këto kushte dhe rregulla përcaktojnë disa kontrollues, kjo do të thotë se ata përcaktojnë së bashku qëllimet dhe metodat e përpunimit të të dhënave tuaja personale (kontrollues të përbashkët).",
    controllerOfUsersData:
      "Kontrolluesi i të dhënave personale të përdoruesve është:",
    legalEntityName:
      "Emri i personit juridik: Proteini.si, trgovina, storitve in proizvodnja d.o.o.",
    legalEntityAddress: "Adresa e personit juridik: Ulica heroja Verdnika 22",
    postcodeAndPlace: "Kodi postar dhe vendi: 4270 Jesenice, Slloveni",
    vatNumber: "Numri TVSH: SI 44085206",
    registrationNumber: "Numri i regjistrimit: 2024691000",
    contactEmail: "E-mail për kontakt: info@proteini.si",
    contactPhone: "Numri i telefonit për kontakt: +386 (0)40 248 248",
    entryData:
      "Të dhënat e regjistrimit në regjistër ose ndonjë regjistër tjetër publik: 18.11.2004",
    dataOfTheProcessor: "Të dhënat e Përpunuesit",
    processorDescription:
      "Përpunuesi i të dhënave personale është ai që përpunon të dhënat personale në emër të Kontrolluesit. Përpunuesi mund të përpunojë vetëm të dhëna personale vetëm për qëllimet e përcaktuara në udhëzime të dokumentuara nga Kontrolluesi. Përpunuesit tanë përpunojnë të dhënat personale të përdoruesve në përputhje me legjislacionin në fuqi, bazuar në një marrëdhënie kontraktuale ekzistuese që rregullon të gjitha fushat e përpunimit.",
    processor1:
      "Përpunuesi: Računalniške storitve, Matej Milošević s.p. Zgornje Pirniče 119B 1215 Medvode Numri i regjistrimit: 6924638000",
    processor2:
      "Përpunuesi: POŠTA SLOVENIJE d.o.o. Slomškov trg 10, Maribor, 2000 Numri i regjistrimit: 5881447000",
    processor3:
      "Përpunuesi: DPD d.o.o. KURIRSKA IN PAKETNA DISTRIBUCIJA, Celovška cesta 492 1210 Ljubljana Numri i regjistrimit: 1966812000",
    processor4:
      "Përpunuesi: GE-KO, MAJA DOLŽAN S.P. Cesta Toneta Tomšiča 71, 4270 Jesenice Numri i regjistrimit: 8732043000",
    processor5:
      "Përpunuesi: EDITOR Spletne komunikacije d.o.o. Velika pot 29 5250 Solkan Numri i regjistrimit: 1648098000",
    website: "Faqja e internetit",
    privacyPolicyIntendedFor:
      "Politika e privatësisë është e destinuar për përdoruesit ose klientët përmes faqes së internetit ose faqeve të internetit të Kontrolluesit ose Ofruesit:",
    legislation: "Legjislacioni",
    slovenianAndEuropeanLegislations:
      "Përdoren legjislacionet sllovene dhe evropiane për vlerësimin e kësaj politike të privatësisë.",
    privacyPolicyPreparedAccordingTo:
      "Kjo politikë e privatësisë është përgatitur në përputhje me Ligjin për Mbrojtjen e të Dhënave Personale (ZVOP-2, Gazeta Zyrtare e RS, nr. 163/22 dhe amend.), Rregulloren (BE) 2016/679 të Parlamentit Evropian dhe Këshillit të datës 27/04/2016 në lidhje me mbrojtjen e individëve në përpunimin e informacionit personal dhe qarkullimin e lirë të një informacioni të tillë dhe shfuqizimin e Direktivës 95/46/EC (Rregullorja e Përgjithshme e Mbrojtjes së të Dhënave, GDPR), Ligjin për Komunikime Elektronike (ZEKom-2, Gazeta Zyrtare e RS, nr. 133/22 dhe amend.), dhe legjislacione të tjera sllovene dhe evropiane që rregullojnë këto fusha.",
    legalPrinciples: "Parimet ligjore",
    controllerAndProcessorsRespect:
      "Kontrolluesi dhe Përpunuesit e tyre respektojnë parimet e përgjithshme në lidhje me përpunimin e të dhënave personale të përdoruesve:",
    principle1:
      "Ne përpunojmë të dhënat personale të përdoruesve në një mënyrë ligjore, të drejtë dhe transparente.",
    principle2:
      "Ne mbledhim të dhëna personale për qëllime që përcaktohen paraprakisht, eksplicite dhe ligjore, dhe nuk i përpunojmë më tej të dhënat për qëllime të tjera, përveç për qëllime të kërkimit shkencor ose historik ose statistikave në kushte të caktuara.",
    principle3:
      "Ne i përpunojmë të dhënat personale në masën më të vogël të mundshme dhe për qëllimet e përpunimit.",
    principle4:
      "Ne sigurohemi që të dhënat personale të përpunuara të jenë të sakta dhe të përditësuara rregullisht, ku ne korrigjojmë ose fshijmë të dhënat e pasakta.",
    principle5:
      "Ne i mbajmë të dhënat personale vetëm për aq kohë sa është e nevojshme për qëllimet e përpunimit.",
    principle6:
      "Ne sigurojmë mbrojtje adekuate të të dhënave personale, e cila përfshin parandalimin e përpunimit të paautorizuar ose të paligjshëm dhe humbjen aksidentale, shkatërrimin ose dëmtimin e të dhënave, duke zbatuar masa të përshtatshme teknike dhe organizative.",
    definitionsOfTerms: "Përkufizimi i Termave",
    privacyPolicyApplies:
      "Politika e Privatësisë zbatohet për kontratat e lidhura përmes komunikimit në distancë, kur të dhënat personale futen direkt në faqen e internetit të kontrolluesit ose merren përmes shkëmbimit të emaileve ose kanaleve të tjera të krahasueshme të komunikimit të ofruesit. Ajo zbatohet gjithashtu për forma të tjera të përdorimit të faqes së internetit ku përdoruesi fut të dhëna personale (p.sh., abonim në buletinin informativ, postime publike) në faqen e internetit të kontrolluesit.",
    personalDataDefinition:
      "Të dhënat personale i referohen çdo informacioni që lidhet me një individ të identifikuar ose të identifikueshëm që është person fizik. Individi i identifikuar është dikush, të dhënat personale të të cilit janë të identifikuara dhe të përpunuara sipas qëllimeve të përcaktuara nga Kontrolluesi.",
    identifiableIndividual:
      "Individi i identifikueshëm është dikush që mund të identifikohet direkt ose indirekt dhe të dhënat personale të të cilit mund të përpunohen sipas qëllimeve të përcaktuara nga Kontrolluesi.",
    userDefinition:
      "Një përdorues është një individ që është person fizik, të dhënat personale të të cilit përpunohen bazuar në një bazë ligjore ose kontraktuale që ekziston midis kontrolluesit dhe atij individi, ose bazuar në pëlqimin eksplicit të dhënë nga individi kontrolluesit, ose në interesat legjitime të kontrolluesit.",
    controllerDefinition:
      "Kontrolluesi përcakton qëllimet dhe mjetet e përpunimit brenda kuadrit të aktivitetit të tyre të regjistruar dhe/ose autorizimeve ligjore. Përdoruesi informohet paraprakisht se kush janë Kontrolluesi dhe Përpunuesi i të dhënave të tyre personale.",
    processorDefinition:
      "Përpunuesi përpunon të dhënat personale të individëve në emër të Kontrolluesit, sipas udhëzimeve të tyre, dhe brenda kuadrit të qëllimeve dhe mjeteve legjitime të përpunimit. Kontrolluesi i siguron përdoruesit të dhëna mbi Përpunuesit e të dhënave të tyre personale në këtë Politikë Privatësie.",
    subprocessorDefinition:
      "Nën-përpunuesi përpunon të dhënat personale të individëve në emër dhe sipas udhëzimeve të Përpunuesit brenda kuadrit të qëllimeve dhe mjeteve legjitime të përpunimit. Nën-përpunuesi është direkt përgjegjës ndaj Përpunuesit dhe Përpunuesi është direkt përgjegjës ndaj Kontrolluesit.",
    processingOfUsersPersonalData:
      "Përpunimi i të Dhënave Personale të Përdoruesve",
    processingDefinition:
      "Përpunimi i të dhënave personale i referohet çdo operacioni ose grupi operacionesh të kryera mbi të dhënat personale ose grupet e të dhënave personale, qoftë me mjete të automatizuara apo jo, të tilla si mbledhja, regjistrimi, organizimi, strukturimi, ruajtja, përshtatja ose ndryshimi, rikthimi, konsultimi, përdorimi, zbulimi me transmetim, shpërndarja, ose vënia në dispozicion ndryshe, rreshtimi ose kombinimi, kufizimi, fshirja ose shkatërrimi.",
    controllerMayProcessOnlyIf:
      "Kontrolluesi mund të përpunojë të dhëna personale vetëm nëse ka një bazë të përshtatshme ligjore për përpunimin. Kontrolluesi përpunon të dhënat personale të përdoruesve ekskluzivisht për qëllime që janë të përcaktuara qartë dhe në përputhje me legjislacionin në fuqi. Për çdo qëllim përpunimi, kontrolluesi siguron transparencë dhe informon përdoruesit për:",
    processingContent1: "1. përmbajtjen e qëllimit të përpunimit,",
    processingContent2: "2. llojin e të dhënave personale që përpunohen,",
    processingContent3: "3. bazën ligjore për përpunimin, dhe",
    processingContent4: "4. periudhat e mbajtjes.",
    ifControllerProcessesForNewPurposes:
      "Nëse kontrolluesi përpunon të dhëna personale për qëllime të reja që nuk janë të pajtueshme me bazën ekzistuese ligjore ose nuk bazohen në pëlqim eksplicit:",
    newPurposes1:
      "1. kontrolluesi siguron të gjithë informacionin e nevojshëm për përdoruesin paraprakisht, dhe",
    newPurposes2:
      "2. merr pëlqim të ri eksplicit nëse përpunimi bazohet në një pëlqim të tillë.",
    controllerEnsuresPurposes:
      "Kontrolluesi siguron që të gjitha qëllimet e përpunimit të jenë në përputhje me parimet e minimizimit të të dhënave, sigurisë dhe privatësisë dhe që të dhënat personale të përpunohen vetëm në masën e nevojshme për të arritur qëllimin e specifikuar.",
    retentionPeriodsForPersonalData:
      "Periudhat e Mbajtjes për të Dhënat Personale",
    retentionDescription:
      "Kontrolluesi ruan të dhënat personale të përdoruesve në një formë që lejon identifikimin e përdoruesve vetëm për aq kohë sa është e nevojshme për të përmbushur qëllimet për të cilat të dhënat u mblodhën ose u përpunuan më tej, ose për të përmbushur detyrimet ligjore. Pas përfundimit të periudhës së mbajtjes, kontrolluesi fshin, anonimizon, ose arkivon të dhënat, përveç nëse ka arsye të tjera ligjore për përpunim të mëtejshëm.",
    retentionPeriodsSpecified:
      "Periudhat e mbajtjes për të dhënat personale janë të specifikuara për çdo qëllim përpunimi, së bashku me bazën ligjore për përpunimin dhe llojin e të dhënave personale që përpunohen.",
    disclosureAndTransfer: "Zbulimi dhe Transferimi i të Dhënave Personale",
    controllerDisclosesInFollowingCases:
      "Kontrolluesi zbulon të dhënat personale të përdoruesve në rastet e mëposhtme:",
    disclosureRequiredByLaw: "1. Zbulimi i Kërkuar nga Ligji:",
    disclosureRequiredByLawText:
      "Kontrolluesi mund t'u zbulojë të dhëna personale palëve të treta vetëm kur kërkohet me ligj (p.sh., urdhra të gjykatës, kërkesa nga organet e inspektimit, ose autoritete të tjera qeveritare). Zbulimi kryhet vetëm në masën e nevojshme për të përmbushur detyrimet ligjore.",
    transferToThirdCountries: "2. Transferimi i të Dhënave në Vendet e Treta:",
    transferToThirdCountriesText:
      "Kontrolluesi siguron që të dhënat të transferohen në vendet e treta vetëm nëse ato ofrojnë një nivel adekuat të mbrojtjes së të dhënave personale në përputhje me legjislacionin ose nëse ekzistojnë masa të përshtatshme mbrojtëse (p.sh., klauzola standarde kontraktuale ose rregulla të detyrueshme të korporatës).",
    disclosureToContractualProcessors: "3. Zbulimi te Përpunuesit Kontraktual:",
    disclosureToContractualProcessorsText:
      "Kontrolluesi mund t'u zbulojë të dhëna personale përpunuesve kontraktualë që ofrojnë shërbime për kontrolluesin (p.sh., mbështetje IT, agjenci marketingu, kontabilitet). Përpunues të tillë veprojnë vetëm sipas udhëzimeve të kontrolluesit, dhe sigurohen masa të përshtatshme sigurie për të mbrojtur të dhënat e përdoruesve.",
    useOfCookies: "Përdorimi i Cookies",
    cookiesNotice:
      "Kontrolluesi u siguron përdoruesve një njoftim të qartë dhe të dukshëm në lidhje me përdorimin e cookies kur vizitojnë faqen e internetit. Ky njoftim është i disponueshëm përmes një lidhjeje të dedikuar në një vend të dukshëm në faqen e internetit, ku përdoruesit mund të gjejnë të gjithë informacionin e nevojshëm, duke përfshirë opsionet për menaxhimin e preferencave të cookies. Kontrolluesi siguron që përdoruesit të kenë një opsion të qartë për të modifikuar pëlqimin e tyre më vonë përmes një njoftimi ose lidhjeje të dukshme në faqen e internetit. Përdoruesit janë gjithashtu në gjendje të personalizojnë ose refuzojnë cookies gjatë vizitës së tyre të parë dhe informohen për pasojat e refuzimit të cookies, të tilla si kufizime të mundshme në funksionalitetin ose përvojën e përdoruesit (p.sh., funksionim i kufizuar i disa veçorive).",
    cookiesWithoutConsent:
      "Kontrolluesi mund të përdorë cookies pa pëlqimin eksplicit të përdoruesit nëse ato janë rreptësisht të nevojshme, të kërkuara për transmetimin e komunikimeve përmes një rrjeti komunikimi elektronik, ose cookies thelbësore për ofrimin e një shërbimi të shoqërisë së informacionit të kërkuar në mënyrë eksplicite nga përdoruesi (p.sh., hyrja në llogarinë e përdoruesit, blerja e produktit).",
    cookiesNoticeWithConsent:
      "Në të gjitha rastet e tjera, kontrolluesi siguron një njoftim me pëlqimin e përdoruesit dhe informon përdoruesin për opsionet e disponueshme për menaxhimin e cilësimeve të cookies. Njoftimi përfshin informacionin e mëposhtëm:",
    cookieInfo1:
      "1. Llojet dhe emrat e cookies (p.sh., analitike, reklamuese, funksionale).",
    cookieInfo2:
      "2. Qëllimi i secilës cookie (p.sh., monitorimi i trafikut, mundësimi i shportës së blerjeve, synimi i reklamave).",
    cookieInfo3:
      "3. Kohëzgjatja e ruajtjes së secilës cookie (p.sh., cookies sesioni, cookies të përhershme).",
    userResponsibilities: "Përgjegjësitë e Përdoruesit",
    accuracyAndTruthfulness: "1. Saktësia dhe Vërtetësia e të Dhënave:",
    accuracyAndTruthfulnessText:
      "Përdoruesit janë të detyruar të sigurojnë që çdo të dhënë që ata japin (p.sh., gjatë regjistrimit, porositjes së produkteve ose shërbimeve, abonimit në buletinet informative, pjesëmarrjes në konkurse, ose plotësimit të formularëve të kontaktit) të jetë e saktë, e vërtetë dhe e plotë. Përdorimi i të dhënave personale të rreme ose të palëve të treta pa autorizim është rreptësisht i ndaluar.",
    confidentialityOfCredentials:
      "2. Konfidencialiteti i Kredencialeve të Qasjes:",
    confidentialityOfCredentialsText:
      "Përdoruesit duhet të mbrojnë me kujdes kredencialet e tyre të qasjes, të tilla si emrat e përdoruesit, fjalëkalimet ose detaje të tjera identifikimi, dhe nuk duhet t'i ndajnë ato me palë të treta. Përdoruesit janë përgjegjës për të gjitha aktivitetet e kryera duke përdorur kredencialet e tyre të qasjes.",
    prohibitionOfMisuse: "3. Ndalimi i Keqpërdorimit:",
    prohibitionOfMisuseText:
      "Keqpërdorimi i të dhënave personale, si përdorimi i të dhënave të rreme ose të palëve të treta pa autorizim, imitimi ose dhënia e informacionit të rremë, është rreptësisht i ndaluar. Kontrolluesi rezervon të drejtën të fillojë procedura ligjore kundër përdoruesve që shkelin këtë dispozitë.",
    consequencesOfViolations: "4. Pasojat e Shkeljeve:",
    consequencesOfViolationsText:
      "Në rast shkeljesh, kontrolluesi mund të çaktivizojë qasjen e përdoruesit te shërbimet, të fshijë llogarinë e tyre dhe të fillojë procedura ligjore kundër përdoruesit shkelës.",
    publicPostsByUsers: "Postimet Publike nga Përdoruesit",
    publicPostsExamples:
      "Kontrolluesi mund të lejojë postime publike nga përdoruesit në faqen e internetit, të tilla si:",
    publicPost1: "1. komentimi i postimeve,",
    publicPost2: "2. postimi i komenteve,",
    publicPost3: "3. pjesëmarrja në konkurse dhe aktivitete të tjera.",
    publicPostDataText:
      "Të dhënat personale të postuara publikisht janë të dhëna vullnetarisht nga përdoruesi. Kontrolluesi nuk i përpunon të dhënat e postuara publikisht për asnjë qëllim tjetër, përveç për të mundësuar funksionalitetet në lidhje me postimet publike. Kontrolluesi nuk është përgjegjës për keqpërdorimin e të dhënave të postuara publikisht nga palët e treta, pasi nuk ka kontroll mbi veprime të tilla.",
    additionalWarnings: "Paralajmërime shtesë",
    controllerSpecificallyWarns:
      "Kontrolluesi paralajmëron në mënyrë specifike përdoruesit për përmbajtjen e mëposhtme:",
    rightToUnsubscribe:
      "E DREJTA PËR TË HEDHUR DORË: Çdo komunikim i MARKETINGUT ME EMAIL përfshin një opsion të qartë dhe pa pagesë për të hequr dorë. Ju mund të hiqni dorë nga marrja e emaileve të marketingut në çdo kohë: 1. duke klikuar lidhjen 'Çregjistrohu' të përfshirë në çdo mesazh, ose 2. duke paraqitur një kërkesë për të hequr dorë nga marrja e komunikimeve të marketingut në adresën e emailit info@proteini.si. Çdo mesazh SMS MARKETINGU përmban udhëzime se si të hiqni dorë. Ju mund të hiqni dorë nga marrja e mesazheve SMS të marketingut në çdo kohë: 1. duke u përgjigjur 'STOP' në mesazhin SMS të marrë, ose 2. duke paraqitur një kërkesë për të hequr dorë nga marrja e mesazheve SMS të marketingut në adresën e emailit info@proteini.si. Procesi i heqjes së dorës për mesazhet SMS të marketingut: Heqja juaj e dorës do të hyjë në fuqi brenda 3 ditëve të punës nga marrja e kërkesës suaj. Pas përfundimit të heqjes së dorës, të dhënat tuaja të kontaktit do të bllokohen menjëherë për qëllime të komunikimit të marketingut dhe nuk do të përpunohen më për qëllime të tilla. Heqja e dorës nga komunikimet e marketingut nuk ndikon në ekzekutimin e kontratës ose komunikimet e tjera që janë rreptësisht të nevojshme për përmbushjen e porosisë suaj (p.sh., konfirmimet e porosisë, njoftimet e dorëzimit).",
    legislativeBasis: "BAZA LIGJISLATIVE",
    contractualBasis: "Baza Kontraktuale",
    contractualBasisForProcessing:
      "Baza kontraktuale për përpunimin e të dhënave personale të përdoruesve do të thotë që përpunimi është i nevojshëm për:",
    contractualBasis1:
      "1. përmbushjen e kontratës pala kontraktuese e së cilës është përdoruesi të cilit i përkasin të dhënat personale; ose",
    contractualBasis2:
      "2. zbatimin e masave me kërkesë të përdoruesit të tillë para lidhjes së kontratës.",
    contractualBasisInfo:
      "Kontrolluesi i siguron përdoruesit informacion mbi përpunimin e të dhënave të tyre personale në këtë Politikë Privatësie dhe, kur është e nevojshme, me njoftime në faqen e tyre të internetit.",
    contractualBasisNoExplicitConsent:
      "Kontrolluesi nuk kërkon një pëlqim eksplicit për përpunimin kontraktual të të dhënave personale të përdoruesit.",
    contractualBasisIfUserFails:
      "Nëse përdoruesi nuk i siguron të gjitha të dhënat personale që Kontrolluesi ka nevojë për të përmbushur detyrimin kontraktual, Kontrolluesi nuk është në gjendje të përfundojë porosinë e përdoruesit. Kontrolluesi merr përsipër të mbledhë dhe përpunojë vetëm të dhëna personale nga përdoruesi në masën e nevojshme për të përmbushur kontratën.",
    legalBasis: "Baza Ligjore",
    legalBasisText:
      "Kontrolluesi përpunon të dhënat personale të përdoruesve bazuar në një bazë ligjore legjitime kur përpunimi është i nevojshëm për përmbushjen e detyrimeve ligjore të zbatueshme për kontrolluesin. Të dhënat personale përpunohen ekskluzivisht për qëllimin e përmbushjes së detyrimeve ligjore dhe nuk i nënshtrohen përpunimit të mëtejshëm për qëllime të tjera që janë në kundërshtim me ligjin.",
    legalObligationsInSlovenia:
      "Në Republikën e Sllovenisë, detyrimet ligjore për përpunimin e të dhënave të caktuara personale përcaktohen kryesisht në:",
    legalObligation1:
      "1. Ligji për Tatimin mbi Vlerën e Shtuar (ZDDV-1), i cili përcakton detyrimin për të lëshuar dhe mbajtur faturat;",
    legalObligation2:
      "2. Rregullat për Zbatimin e Ligjit për Tatimin mbi Vlerën e Shtuar, të cilat rregullojnë më tej përmbajtjen dhe mbajtjen e faturave;",
    legalObligation3:
      "3. Ligji për Procedurën Tatimore (ZDavP-2), i cili rregullon detyrimet në lidhje me mbajtjen e regjistrave për qëllime tatimore, duke përcaktuar që kontrolluesi duhet të mbajë të dhënat nga faturat e lëshuara (duke përfshirë të dhënat personale të përdoruesve në fatura) për të paktën 10 vjet pas përfundimit të vitit fiskal të cilit i përket fatura;",
    legalObligation4:
      "4. Ligji për Kompanitë (ZGD-1), i cili specifikon kërkesat për librat e biznesit dhe raportimin;",
    legalObligation5:
      "5. Standardet Sllovene të Kontabilitetit (SRS), të cilat rregullojnë detyrimet për mbajtjen e regjistrave të kontabilitetit;",
    legalObligation6:
      "6. Ligji i Kontabilitetit (ZR), i cili përshkruan rregullat për mbajtjen e dokumenteve dhe regjistrave të biznesit.",
    legalBasisNoExplicitConsent:
      "Kontrolluesi nuk kërkon pëlqimin eksplicit të përdoruesit për përpunimin e të dhënave personale bazuar në arsye ligjore.",
    explicitConsent: "Pëlqimi Eksplicit",
    explicitConsentText:
      "Pëlqimi eksplicit shërben si baza ligjore për përpunimin e të dhënave personale kur kontrolluesi nuk ka një bazë ligjore legjitime ose kontraktuale ose interes legjitim për përpunimin.",
    userConsentValidWhen:
      "Pëlqimi i përdoruesit është i vlefshëm kur plotëson kriteret e mëposhtme:",
    consentCriteria1:
      "1. është vullnetar, specifik, i informuar dhe një deklaratë e qartë e qëllimit, ku përdoruesi pajtohet me përpunimin e të dhënave të tyre personale për një qëllim specifik;",
    consentCriteria2:
      "2. sigurohet përmes konfirmimit të qartë, të tilla si klikimi i një kutie (jo e para-shënuar), nënshkrimi, konfirmimi verbal ose një metodë tjetër e përshtatshme;",
    consentCriteria3:
      "3. është gjithmonë i ndarë nga kushtet ose dispozitat e tjera, kur është teknikisht e mundur.",
    controllerEnsuresInformationPrior:
      "Kontrolluesi siguron informacion të përshtatshëm për përdoruesin përpara marrjes së pëlqimit përmes metodave të mëposhtme:",
    consentMethod1:
      "1. Përshkrimi i qëllimit: Një njoftim ligjor që i paraprin kutisë së konfirmimit specifikon qëllimin e pëlqimit (p.sh., 'Dëshiroj të abonohem në buletinin informativ për të marrë informacion shtesë, këshilla, promovime dhe lajme të tjera të dobishme.').",
    consentMethod2:
      "2. E drejta për të tërhequr pëlqimin: E deklaruar qartë në njoftimin ligjor që i paraprin kutisë, ndërsa të drejtat shtesë janë të shpjeguara në këto kushte privatësie (p.sh., 'Ju mund të çregjistroheni nga buletini informativ në çdo kohë.').",
    consentMethod3:
      "3. Lidhje e drejtpërdrejtë me kushtet e privatësisë: Njoftimi ligjor që i paraprin kutisë siguron një lidhje të drejtpërdrejtë me këto kushte privatësie (p.sh., 'Kam lexuar dhe pajtohem me këto Kushte Privatësie.').",
    controllerMaintainsRecord:
      "Kontrolluesi mban një regjistër të pëlqimeve të dhëna, duke përfshirë informacionin se kur dhe si është dhënë pëlqimi, për të siguruar provë të vlefshmërisë së tij në rast verifikimi.",
    legitimateInterest: "Interesi Legjitim",
    legitimateInterestText:
      "Kontrolluesi mund të përpunojë të dhënat personale të përdoruesve nëse është e nevojshme për interesat legjitime të ndjekura nga kontrolluesi. Një përpunim i tillë është i kufizuar në masën e kërkuar për të arritur këto interesa legjitime duke respektuar të drejtat dhe interesat e përdoruesve.",
    balancingTest:
      "Në përcaktimin e interesave legjitime, kontrolluesi kryen një test balancimi për të verifikuar nëse:",
    balancingTest1:
      "1. përpunimi shërben për një qëllim legjitim, të tillë si përmirësimi i shërbimit, parandalimi i abuzimit, zbatimi i kërkesave ligjore ose marketingu direkt;",
    balancingTest2:
      "2. të dhënat personale përpunohen në masën minimale të nevojshme për të arritur qëllimin;",
    balancingTest3:
      "3. të drejtat, liritë dhe interesat e përdoruesit nuk tejkalojnë interesat legjitime të kontrolluesit.",
    examplesOfLegitimateInterests:
      "Shembuj të interesave legjitime të ndjekura nga kontrolluesi përfshijnë, por nuk kufizohen vetëm në:",
    legitimateInterestExample1: "1. zbatimi i kërkesave ligjore;",
    legitimateInterestExample2:
      "2. përmirësimi i përvojës së përdoruesit përmes analizës së sjelljes për të optimizuar faqen e internetit, me kusht që të dhënat të jenë anonimizuar ose të përpunohen me ndikim minimal te përdoruesit;",
    legitimateInterestExample3:
      "3. marketingu direkt duke dërguar oferta të personalizuara për produkte ose shërbime të ngjashme për klientët ekzistues, duke siguruar që përdoruesit të mund të heqin dorë gjithmonë nga komunikime të tilla dhe që të dhënat të mos përdoren për qëllime të papajtueshme.",
    parentalOrGuardianConsent: "Pëlqimi Prindëror ose i Kujdestarit",
    parentalConsentText:
      "Për përpunimin e të dhënave personale të fëmijëve nën moshën 15 vjeç bazuar në pëlqimin e fëmijës, kërkohet miratimi paraprak nga prindërit ose kujdestarët ligjorë. Kontrolluesi nuk i përpunon të dhënat personale pa një pëlqim të tillë.",
    controllerMayRequestVerification:
      "Kontrolluesi mund të kërkojë verifikim shtesë për të siguruar që pëlqimi është dhënë vërtet nga prindi ose kujdestari, kur është teknikisht i mundur dhe proporcional me rreziqet e përfshira në përpunimin e të dhënave personale:",
    verificationMethod1:
      "1. kontrolluesi kërkon një adresë emaili ose numër telefoni të prindit/kujdestarit për të dërguar një kërkesë pëlqimi; ose",
    verificationMethod2:
      "2. Kontrolluesi kërkon konfirmim të drejtpërdrejtë përmes një emaili që përmban një lidhje, përmes së cilës prindi/kujdestari konfirmon pëlqimin, ose përmes një telefonate për të verifikuar identitetin dhe pëlqimin.",
    controllerProcessesChildrenData:
      "Kontrolluesi i përpunon të dhënat personale të fëmijëve ekskluzivisht për qëllime specifike, të përcaktuara qartë dhe të nevojshme, duke siguruar respektimin e parimit të minimizimit të të dhënave.",
    parentsOrGuardiansResponsible:
      "Prindërit ose kujdestarët janë përgjegjës për saktësinë e të dhënave të dhëna dhe për dhënien e pëlqimit kur fëmijët i fusin vetë të dhënat. Kontrolluesi nuk është përgjegjës për të dhënat e pasakta ose të rreme të dhëna nga përdoruesit.",
    personalDataAndPurposes: "TË DHËNAT PERSONALE DHE QËLLIMET E PËRPUNIMIT",
    fulfillmentOfContractualObligations: "Përmbushja e Detyrimeve Kontraktuale",
    fulfillmentText:
      "Kontrolluesi përpunon të dhënat personale të përdoruesit për qëllimin e përmbushjes së detyrimeve që dalin nga kontrata e lidhur, e cila përfshin përpunimin e porosive, dorëzimin e produkteve ose shërbimeve, lëshimin e faturave, zgjidhjen e ankesave ose pretendimeve të mundshme dhe kryerjen e veprimeve të tjera të nevojshme për të përmbushur kontratën. Ky përpunim është thelbësor për ekzekutimin e suksesshëm të marrëdhënies kontraktuale midis kontrolluesit dhe përdoruesit; prandaj, pëlqimi eksplicit nga përdoruesi nuk kërkohet.",
    fulfillmentLegalBasis:
      "BAZA LIGJORE: Baza kontraktuale MBAJTJA E TË DHËNAVE: 10 vjet nga lëshimi i faturës",
    fulfillmentPersonalData: "TË DHËNAT PERSONALE:",
    personalDataItem1: "1. Emri dhe Mbiemri",
    personalDataItem2:
      "2. Adresa e vendbanimit të përhershëm dhe/ose të përkohshëm, kodi postar, qyteti dhe shteti",
    personalDataItem3: "3. Adresa e emailit",
    personalDataItem4: "4. Numri i telefonit",
    personalDataItem5: "5. Numri i llogarisë transaksionale",
    personalDataItem6: "6. Numri i kartës së kreditit",
    personalDataItem7: "7. Numri i identifikimit tatimor",
    sendingInfoAndNotifications:
      "Dërgimi i informacionit dhe njoftimeve në lidhje me ekzekutimin e kontratës",
    sendingInfoText:
      "Kontrolluesi përpunon të dhënat personale të përdoruesit për dërgimin e informacionit të rëndësishëm në lidhje me porosinë ose kontratën, duke përfshirë konfirmimin e porosisë, njoftimet e statusit të porosisë dhe informacionin tjetër kritik të nevojshëm për informimin e përdoruesit. Një komunikim i tillë është thelbësor për të siguruar mbështetje të duhur për përdoruesit. Pëlqimi eksplicit nuk kërkohet, pasi përpunimi bazohet në interesin legjitim të kontrolluesit dhe në ekzekutimin e kontratës.",
    sendingInfoLegalBasis:
      "BAZA LIGJORE: Baza kontraktuale dhe interesi legjitim MBAJTJA E TË DHËNAVE: Deri në përfundimin e marrëdhënies kontraktuale dhe më pas për 5 vjet shtesë për provë të pajtueshmërisë",
    respondingToUserInquiries: "Përgjigjja ndaj pyetjeve të përdoruesit",
    respondingText:
      "Kontrolluesi përpunon të dhënat personale të dhëna nga përdoruesi përmes formularëve të kontaktit ose pyetjeve (përfshirë përmes emailit) për qëllimin e përgjigjjes ndaj përdoruesit dhe dhënies së informacionit përkatës në lidhje me produktet, shërbimet ose çështje të tjera të biznesit. Ky përpunim bazohet në interesin legjitim të kontrolluesit për të siguruar mbështetje dhe ndihmë cilësore për klientët, dhe pëlqimi nuk kërkohet.",
    respondingLegalBasis:
      "BAZA LIGJORE: Baza kontraktuale dhe interesi legjitim MBAJTJA E TË DHËNAVE: Deri në përfundimin e komunikimit, ose deri në 1 vit pas kontaktit të fundit, përveç nëse lidhet një kontratë",
    userRegistration: "Regjistrimi i përdoruesit",
    registrationText:
      "Për përdorimin e disa veçorive të faqes së internetit ose aplikacionit, duke përfshirë hyrjen në dyqanin online, regjistrimin për arsimim, ngjarje ose shërbime, komentimin, paraqitjen e komenteve ose veprime të ngjashme, kërkohet regjistrimi. Kontrolluesi përpunon të dhënat personale për qëllimin e mundësimit të këtyre veçorive, dhe pëlqimi eksplicit nuk kërkohet pasi përpunimi bazohet në bazën kontraktuale.",
    registrationLegalBasis:
      "BAZA LIGJORE: Baza kontraktuale MBAJTJA E TË DHËNAVE: Deri në revokimin e llogarisë së përdoruesit, përveç nëse legjislacioni kërkon mbajtje më të gjatë (p.sh., të dhënat e blerjes mbahen për 10 vjet)",
    fulfillingLegalObligations: "Përmbushja e detyrimeve ligjore",
    fulfillingLegalText:
      "Kontrolluesi përpunon të dhënat personale të përdoruesve në përputhje me kërkesat ligjore, duke përfshirë mbajtjen e regjistrave të kontabilitetit, dhënien e të dhënave autoriteteve kompetente dhe forma të tjera të përpunimit të kërkuara nga legjislacioni. Ky përpunim bazohet në përmbushjen e detyrimeve ligjore dhe nuk kërkon pëlqimin e përdoruesit.",
    fulfillingLegalLegalBasis:
      "BAZA LIGJORE: Baza ligjore MBAJTJA E TË DHËNAVE: Në përputhje me periudhat ligjore të mbajtjes (p.sh., 10 vjet për të dhënat e kontabilitetit)",
    ipAddress: "Adresa IP",
    cookieId: "ID e Cookie",
    accessLogs: "Regjistrat e qasjes",
    contentOfCommunication: "Përmbajtja e komunikimit",
    protectionOfLegitimateInterests:
      "Mbrojtja e interesave legjitime të kontrolluesit ose palëve të treta",
    protectionText:
      "Kontrolluesi përpunon të dhënat personale për të mbrojtur interesat e tij legjitime, të tilla si parandalimi i abuzimit, sigurimi i sigurisë së sistemit ose zgjidhja e mosmarrëveshjeve ligjore. Ky përpunim kryhet në masën e nevojshme për të mbrojtur këto interesa, përveç nëse të drejtat themelore të përdoruesve mbizotërojnë.",
    protectionLegalBasis:
      "BAZA LIGJORE: interesi legjitim dhe baza ligjore MBAJTJA E TË DHËNAVE: Për aq kohë sa ka një interes legjitim për përpunim (p.sh., kohëzgjatja e një mosmarrëveshjeje ligjore ose periudha e nevojshme për të hetuar abuzimin), ose në rastet e procedurave ligjore, të dhënat mbahen në përputhje me periudhat ligjore të mbajtjes për zbatimin ose mbrojtjen e kërkesave ligjore (p.sh., periudhat e parashkrimit)",
    directMarketingWithoutConsent: "Marketingu direkt pa pëlqim eksplicit",
    directMarketingWithoutText:
      "Kontrolluesi mund të dërgojë njoftime në lidhje me marketingun direkt të produkteve ose shërbimeve të tij pa pëlqimin eksplicit të përdoruesit, kur: 1. njoftimet janë për produkte ose shërbime të ngjashme me ato që përdoruesi ka porositur ose përdorur tashmë, 2. kontrolluesi dërgon njoftime bazuar në interesin legjitim, me kusht që përdoruesit t'i jepet një opsion i qartë për të refuzuar një përpunim të tillë (e drejta për të kundërshtuar), dhe 3. kontrolluesi siguron që mesazhet janë të qarta, jo ndërhyrëse dhe në përputhje me ligjin, dhe që përdoruesi mund të kundërshtojë lehtësisht dhe pa pagesë përpunimin në çdo kohë, në përputhje me të drejtat që janë përcaktuar më në mënyrë më specifike në këto kushte privatësie.",
    directMarketingWithoutLegalBasis:
      "BAZA LIGJORE: interesi legjitim MBAJTJA E TË DHËNAVE: Deri në 3 vjet pas kontaktit të fundit, përveç nëse përdoruesi çregjistrohet nga marrja e njoftimeve",
    directMarketingWithConsent: "Marketingu direkt me pëlqim eksplicit",
    directMarketingWithText:
      "Për të gjitha njoftimet që shkojnë përtej fushëveprimit të interesit legjitim, kontrolluesi duhet të marrë pëlqimin eksplicit të përdoruesit. Kjo përfshin dërgimin e emaileve promovuese, mesazheve SMS ose materialeve të tjera marketingu në lidhje me produkte të reja, shërbime ose oferta speciale që nuk janë të lidhura me blerjet e kaluara ose një marrëdhënie kontraktuale, ose për të cilat përdoruesi nuk ka shprehur ende interes.",
    directMarketingWithLegalBasis:
      "BAZA LIGJORE: pëlqimi i përdoruesit MBAJTJA E TË DHËNAVE: Deri në 3 vjet pas kontaktit të fundit, përveç nëse përdoruesi çregjistrohet nga marrja e njoftimeve",
    profilingForTargetedAdvertising:
      "Profilizimi për qëllime reklamimi të synuar",
    profilingForTargetedText:
      "Profilizimi për qëllime reklamimi të synuar nënkupton mbledhjen dhe analizimin e të dhënave mbi sjelljen e përdoruesit, të tilla si vizitat në faqen e internetit, klikimet, kërkimet ose ndërveprimet me përmbajtjen në faqen e internetit të kontrolluesit. Bazuar në këto të dhëna, kontrolluesi krijon profile të përdoruesve që mundësojnë shfaqjen e reklamave të personalizuara bazuar në interesat e përdoruesit. Qëllimi është të rritet efektiviteti i reklamave duke arritur te audienca përkatëse e synuar. Për këtë qëllim, kontrolluesi përdor cookies reklamimi të tilla si Google Ads, Facebook Pixel, DoubleClick (Google), LinkedIn Ads, Bing Ads (Microsoft) dhe Twitter Ads.",
    profilingForTargetedLegalBasis:
      "BAZA LIGJORE: pëlqimi i përdoruesit MBAJTJA E TË DHËNAVE: Siç specifikohet në njoftimin e cookies për secilën cookie të përdorur individualisht, por jo më shumë se dy vjet",
    profilingForTargetedPersonalData: "TË DHËNAT PERSONALE:",
    targetedPersonalData1:
      "1. Identifikuesit e pajisjes dhe përdoruesit: Adresa IP, ID e Cookie, ID e Reklamimit",
    targetedPersonalData2:
      "2. Të dhënat e sjelljes në faqen e internetit: faqet e vizituara, klikimet në reklama, koha e kaluar në faqen e internetit, produktet në shportën e braktisur (vetëm në rastin e ofertave të produkteve)",
    targetedPersonalData3:
      "3. Të dhënat e ndërveprimit me përmbajtjen e reklamave: klikimet në reklama, ndërveprimet me përmbajtje të tjera (shikime videosh, imazhe, etj.)",
    targetedPersonalData4: "4. Gjeolokalizimi (nëse është i aktivizuar)",
    targetedPersonalData5:
      "5. Të dhënat e pajisjes dhe shfletuesit: lloji i pajisjes, sistemi operativ, versioni i shfletuesit",
    profilingForRemarketing: "Profilizimi për qëllime remarketing",
    profilingForRemarketingText:
      "Profilizimi për qëllime remarketing përfshin mbledhjen e të dhënave për përdoruesit që tashmë kanë vizituar faqen e internetit ose kanë treguar interes për produktet ose shërbimet e kontrolluesit, në mënyrë që më vonë të shfaqen reklama të personalizuara në platforma të tjera. Qëllimi është të inkurajohen përdoruesit të kthehen dhe të përfundojnë një blerje ose të porosisin një shërbim. Për këtë qëllim, kontrolluesi përdor cookies remarketing të tilla si Google Ads Remarketing, Criteo, AdRoll, Taboola, Outbrain dhe TikTok Pixel.",
    profilingForRemarketingLegalBasis:
      "BAZA LIGJORE: pëlqimi i përdoruesit MBAJTJA E TË DHËNAVE: Siç specifikohet në njoftimin e cookies për secilën cookie të përdorur individualisht, por jo më shumë se dy vjet",
    remarketingPersonalData1: "1. Adresa IP",
    remarketingPersonalData2: "2. ID e Cookie",
    remarketingPersonalData3:
      "3. Të dhënat e sjelljes (historiku i shikimit, klikimet në përmbajtje, ndërveprimet)",
    remarketingPersonalData4:
      "4. Të dhënat e blerjes (blerjet e kaluara dhe interesat)",
    remarketingPersonalData5: "5. Gjeolokalizimi (nëse është i aktivizuar)",
    remarketingPersonalData6: "6. Adresa e emailit (lidhja me kanale të tjera)",
    remarketingPersonalData7:
      "7. Të dhënat e mediave sociale (ndërveprimet me reklamat nga mediat sociale)",
    executionOfPrizeCompetition: "Ekzekutimi i konkursit të çmimeve",
    executionOfPrizeText:
      "Përpunuesi përpunon të dhënat personale të përdoruesit për qëllimin e organizimit, ekzekutimit dhe administrimit të konkursit të çmimeve, i cili përfshin verifikimin e kritereve të pranueshmërisë për pjesëmarrje, njoftimin e fituesve, dhënien e çmimeve dhe përmbushjen e çdo detyrimi të mundshëm tatimor ose ligjor tjetër. Ky përpunim është i nevojshëm për ekzekutimin e konkursit të çmimeve dhe për përmbushjen e detyrimeve në lidhje me zbatimin e tij; prandaj, pëlqimi eksplicit i përdoruesit nuk kërkohet.",
    executionOfPrizeLegalBasis:
      "BAZA LIGJORE: baza kontraktuale dhe detyrimi ligjor MBAJTJA E TË DHËNAVE: deri në përfundimin e konkursit të çmimeve dhe dhënien e çmimeve (të dhënat e pjesëmarrësve) dhe deri në 5 vjet pas përfundimit të vitit kalendarik në të cilin është dhënë çmimi (të dhënat e fituesve)",
    improvingUserExperience: "Përmirësimi i përvojës së përdoruesit",
    improvingUserExperienceText:
      "Përmirësimi i përvojës së përdoruesit përfshin përshtatjen e faqes së internetit ose shërbimit për të bërë më të lehtë për përdoruesit lundrimin, përmirësimin e shpejtësisë së ngarkimit të faqes, sigurimin e përmbajtjes së personalizuar, integrimin e mediave sociale, ruajtjen e zgjedhjeve të përdoruesit, përdorimin e përmbajtjes video dhe audio, ruajtjen e informacionit të shportës së blerjeve, rregullimin e profileve të përdoruesve ose sigurimin e mbështetjes së chat-it live. Kjo mund të arrihet duke gjurmuar aktivitetet e përdoruesve, duke siguruar rekomandime dhe duke personalizuar përmbajtjen bazuar në ndërveprimet e tyre të kaluara.",
    improvingUserExperienceLegalBasis:
      "BAZA LIGJORE: pëlqimi i përdoruesit MBAJTJA E TË DHËNAVE: Siç specifikohet në njoftimin e cookies për secilën cookie të përdorur individualisht, por jo më shumë se dy vjet",
    improvingPersonalData1: "1. Emri dhe Mbiemri",
    improvingPersonalData2: "2. Adresa e emailit",
    improvingPersonalData3: "3. Emri i përdoruesit",
    improvingPersonalData4: "4. Adresa IP",
    improvingPersonalData5: "5. ID e Cookie",
    improvingPersonalData6:
      "6. Të dhënat e sjelljes (historiku i shikimit, klikimet në përmbajtje, ndërveprimet)",
    improvingPersonalData7:
      "7. Të dhënat e blerjes (blerjet e kaluara dhe interesat)",
    monitoringStatisticalData: "Monitorimi i të dhënave statistikore",
    monitoringStatisticalText:
      "Kontrolluesi i të dhënave mund të mbledhë dhe analizojë të dhëna për qëllime anonime statistikore për të përmirësuar funksionimin e faqes së internetit, të optimizojë përvojën e përdoruesit ose të zhvillojë shërbime të reja. Meqenëse ky përpunim nuk përfshin të dhëna personale, pëlqimi nuk kërkohet, dhe përpunimi bazohet në interesin legjitim të kontrolluesit.",
    monitoringStatisticalText2:
      "Megjithatë, nëse kontrolluesi përdor cookies analitike të tilla si Google Analytics, Hotjar, Matomo, Adobe Analytics, Mixpanel, Crazy Egg, Heap Analytics, Amplitude, Kissmetrics, ose Yandex Metrica për të monitoruar vizitat dhe sjelljen e përdoruesve në faqen e internetit për të dhëna statistikore dhe analizë, kërkohet pëlqimi paraprak i individit.",
    monitoringStatisticalLegalBasis:
      "BAZA LIGJORE: interesi legjitim dhe pëlqimi i përdoruesit MBAJTJA E TË DHËNAVE: Siç specifikohet në njoftimin e cookies për secilën cookie të përdorur individualisht, cookies e sesionit fshihen kur shfletuesi mbyllet, ndërsa të tjerat nuk mbahen për më shumë se një vit",
    monitoringPersonalData1:
      "1. Identifikuesit e pajisjes dhe përdoruesit: Adresa IP, ID e Cookie, ID e Reklamuesit",
    monitoringPersonalData2:
      "2. Të dhënat e sjelljes në faqen e internetit: faqet e vizituara, klikimet në reklama, koha e kaluar në faqe, artikujt në një shportë të papërfunduar (vetëm në rastin e ofertave të produkteve)",
    monitoringPersonalData3:
      "3. Të dhënat e ndërveprimit me përmbajtjen e reklamave: klikimet në reklama, ndërveprimet me përmbajtje të tjera (shikime videosh, imazhe, etj.)",
    monitoringPersonalData4: "4. Gjeolokalizimi (nëse është i aktivizuar)",
    userRights: "TË DREJTAT E PËRDORUESIT",
    generalInfoAboutRights: "Informacion i Përgjithshëm për të Drejtat",
    userMayRequest: "Përdoruesi mund të kërkojë nga kontrolluesi:",
    right1: "1. qasje në të dhënat personale,",
    right2: "2. korrigjim të të dhënave personale,",
    right3: "3. fshirje të të dhënave personale (e drejta për t'u harruar),",
    right4: "4. kufizim të përpunimit të të dhënave personale,",
    right5: "5. kundërshtim të përpunimit të të dhënave personale,",
    right6: "6. transferueshmëri të të dhënave.",
    additionalRights:
      "Përveç këtyre gjashtë të drejtave themelore, përdoruesi ka gjithashtu të drejtat e mëposhtme:",
    additionalRight7:
      "7. e drejta për të mos iu nënshtruar përpunimit të automatizuar vetëm, duke përfshirë profilizimin;",
    additionalRight8:
      "8. e drejta për të tërhequr pëlqimin për përpunimin e të dhënave të tyre personale;",
    additionalRight9:
      "9. e drejta për të paraqitur një ankesë pranë autoritetit mbikëqyrës.",
    controllerWillRespond:
      "Kontrolluesi do të përgjigjet pa vonesë të panevojshme, dhe jo më vonë se një muaj pas marrjes së kërkesës.",
    ifRequestIsComplex:
      "Nëse kërkesa është komplekse ose kontrolluesi ka marrë kërkesa të shumta, koha e përgjigjes mund të zgjatet edhe për dy muaj shtesë. Kontrolluesi do të informojë përdoruesin për zgjatjen dhe arsyet e vonesës brenda një muaji nga marrja e kërkesës.",
    ifControllerDoesNotAct:
      "Nëse kontrolluesi nuk vepron sipas kërkesës së përdoruesit, ai do të informojë përdoruesin për arsyet e mosveprimit dhe mundësinë për të paraqitur një ankesë pranë autoritetit përkatës mbikëqyrës ose për të kërkuar mbrojtje gjyqësore.",
    usersMayAddressRequests:
      "Përdoruesit mund t'i drejtojnë kërkesat e tyre direkt kontrolluesit përmes të dhënave të kontaktit të siguruara në këto kushte privatësie. Kontrolluesi siguron që të drejtat e përdoruesit do të ushtrohen pa pagesë, përveç nëse kërkesat janë qartazi të pabazuara ose të tepërta, veçanërisht për shkak të natyrës së tyre përsëritëse. Në raste të tilla, kontrolluesi mund të vendosë një tarifë të arsyeshme ose të refuzojë të veprojë.",
    rightToAccessData: "E drejta për të pasur qasje në të dhëna",
    rightToAccessText:
      "Përdoruesi ka të drejtë të marrë konfirmim nga Kontrolluesi nëse të dhënat personale që lidhen me të janë duke u përpunuar apo jo.",
    controllerShallProvide: "Kontrolluesi do të sigurojë informacionin mbi:",
    accessInfo1: "1. qëllimet e përpunimit;",
    accessInfo2: "2. kategoritë e të dhënave personale që ata përpunojnë;",
    accessInfo3:
      "3. përpunuesit të cilëve të dhënat personale janë transferuar për përpunim ose janë zbuluar;",
    accessInfo4: "4. kohën e parashikuar të mbajtjes së të dhënave personale;",
    accessInfo5:
      "5. të drejtat e përdoruesit për fshirje dhe korrigjim të të dhënave, dhe për kufizim të përpunimit ose kundërshtim të përpunimit;",
    accessInfo6:
      "6. të drejtën për të paraqitur një ankesë pranë një organi mbikëqyrës;",
    accessInfo7:
      "7. burimet nga të cilat Kontrolluesi mori të dhënat, me kusht që ato të mos jenë paraqitur për përpunim nga përdoruesi; dhe",
    accessInfo8:
      "8. ekzistencën e vendimmarrjes së automatizuar, duke përfshirë profilizimin.",
    exerciseRightsForm:
      "Për të ushtruar këtë të drejtë, përdoruesi mund të përdorë këtë formular jo-detyrues: Ushtrimi i të drejtave - formular",
    rightToRectification: "E drejta e korrigjimit",
    rightToRectificationText:
      "Përdoruesi mund të kërkojë nga Kontrolluesi të korrigjojë pa vonesë të panevojshme:",
    rectification1:
      "1. të dhënat e pasakta që lidhen me përdoruesin që përpunohen nga Kontrolluesi (ose përpunuesit e tyre) ose",
    rectification2: "2. të plotësojë të dhënat personale jo të plota.",
    rightToErasure: "E drejta e fshirjes",
    rightToErasureText:
      "Përdoruesi mund të kërkojë nga Kontrolluesi të fshijë të dhënat personale të përdoruesit pa vonesë të panevojshme nëse plotësohet të paktën një nga kushtet e mëposhtme:",
    erasureCondition1:
      "1. Të dhënat personale nuk kërkohen më për qëllimin për të cilin janë mbledhur ose përpunuar ndryshe.",
    erasureCondition2:
      "2. Përdoruesi tërheq pëlqimin e dhënë Kontrolluesit për përpunimin, ku nuk ka asnjë bazë tjetër ligjore për përpunimin.",
    erasureCondition3:
      "3. Përdoruesi kundërshton përpunimin e të dhënave të tyre personale për qëllime të interesit publik ose për interesa legjitime të Kontrolluesit ose për qëllime të marketingut direkt dhe/ose profilizimit.",
    erasureCondition4:
      "4. Të dhënat personale janë përpunuar në mënyrë të paligjshme.",
    erasureCondition5:
      "5. Të dhënat personale duhet të fshihen për të përmbushur një detyrim ligjor të vendosur Kontrolluesit nga legjislacioni.",
    erasureCondition6:
      "6. Të dhënat personale janë mbledhur në lidhje me ofrimin e shërbimeve të shoqërisë së informacionit për një person më të ri se 15 vjeç.",
    rightToRestriction: "E drejta për kufizim të përpunimit",
    rightToRestrictionText:
      "Përdoruesi mund të kërkojë nga Kontrolluesi kufizimin e përpunimit në një nga rastet e mëposhtme:",
    restrictionCase1:
      "1. Saktësia e të dhënave personale kundërshtohet nga përdoruesi, për një periudhë që i mundëson Kontrolluesit të verifikojë saktësinë e të dhënave personale.",
    restrictionCase2:
      "2. Përpunimi i të dhënave personale të përdoruesit është i paligjshëm, dhe përdoruesi kundërshton fshirjen e të dhënave personale dhe kërkon kufizimin e përpunimit ose përdorimit të tyre në vend të kësaj.",
    restrictionCase3:
      "3. Kontrolluesi nuk ka më nevojë për të dhënat personale për qëllimet e përpunimit për të cilat kishte një bazë ligjore ose pëlqimin eksplicit të përdoruesit, por ato kërkohen për vendosjen, ushtrimin ose mbrojtjen e kërkesave ligjore.",
    restrictionCase4:
      "4. Përdoruesi ka paraqitur një kundërshtim (e drejta për të kundërshtuar) në pritje të verifikimit nëse arsyet legjitime të Kontrolluesit tejkalojnë ato të përdoruesit të cilit i përkasin të dhënat personale.",
    whenUserExercisingThisRight:
      "Kur përdoruesi ushtron këtë të drejtë, Kontrolluesi mund të ruajë vetëm të dhënat e tyre dhe t'i përpunojë ato vetëm nëse:",
    restrictionException1: "1. përdoruesi ka dhënë (pasues) pëlqim eksplicit;",
    restrictionException2:
      "2. kërkohet për vendosjen, ushtrimin ose mbrojtjen e kërkesave ligjore;",
    restrictionException3:
      "3. kërkohet për mbrojtjen e të drejtave të përdoruesve të tjerë (persona fizikë ose juridikë); dhe",
    restrictionException4:
      "4. kërkohet për një interes të rëndësishëm publik të Bashkimit Evropian ose Republikës së Sllovenisë.",
    rightToDataPortability: "E drejta për transferueshmëri të të dhënave",
    rightToDataPortabilityText:
      "Përdoruesi ka të drejtë të marrë nga Kontrolluesi të dhënat personale që lidhen me të cilat po përpunohen nga Kontrolluesi. Kontrolluesi duhet t'i sigurojë përdoruesit këto të dhëna në:",
    portabilityFormat1: "1. një format të strukturuar;",
    portabilityFormat2: "2. format të përdorur zakonisht;",
    portabilityFormat3:
      "3. format të lexueshëm nga makina, i cili i lejon përdoruesit të lexojë informacionin pa asnjë problem.",
    portabilityRightText:
      "Përdoruesi ka gjithashtu të drejtën t'ia transmetojë të dhënat e marra një kontrolluesi tjetër pa pengesa nga ne, Kontrolluesi, nëse:",
    portabilityCondition1:
      "1. të dhënat janë përpunuar bazuar në një pëlqim eksplicit dhe",
    portabilityCondition2: "2. përpunimi kryhet me mjete të automatizuara.",
    portabilityTechnicallyFeasible:
      "Përdoruesi ka të drejtë që të dhënat e tyre të transmetohen nga një kontrollues te tjetri, kur është teknikisht e mundur.",
    rightToObject: "E drejta për të kundërshtuar",
    rightToObjectText:
      "Përdoruesi mund në çdo kohë të kundërshtojë përpunimin e të dhënave personale që lidhen me të, kur Kontrolluesi përpunon të dhënat e tyre personale:",
    objectCase1: "1. në interes publik ose",
    objectCase2:
      "2. për interesa legjitime të Kontrolluesit, duke përfshirë profilizimin e këtij përdoruesi.",
    controllerShallNotCease:
      "Kontrolluesi nuk do të pushojë së përpunuari të dhënat personale të përdoruesit me kërkesë të përdoruesit nëse:",
    objectException1:
      "1. ata mund të provojnë ekzistencën e arsyeve të nevojshme legjitime për përpunim që tejkalojnë interesat, të drejtat dhe liritë e përdoruesit; ose",
    objectException2:
      "2. të dhënat kërkohen për vendosjen, ushtrimin ose mbrojtjen e kërkesave ligjore.",
    controllerShallAlwaysGrant:
      "Kontrolluesi do të japë gjithmonë kërkesën e përdoruesit kur përdoruesi kundërshton përpunimin e të dhënave të tyre personale për qëllime të marketingut direkt, duke përfshirë profilizimin në masën që lidhet me marketingun direkt. Kontrolluesi është i detyruar të ndalojë përpunimin e të dhënave të tilla personale për qëllime të marketingut direkt.",
    controllerShallProvideClearInfo:
      "Për këtë qëllim, Kontrolluesi do të, në vendet ku i kërkon përdoruesit të pëlqejë përpunimin e të dhënave të tyre për qëllime të marketingut direkt, t'i sigurojë përdoruesit informacion të qartë dhe të veçantë mbi mundësinë që përdoruesi mund në çdo kohë të tërheqë pëlqimin e tyre dhe të kundërshtojë përpunimin e të dhënave të tyre për këto qëllime.",
    rightRelatedToAutomatedProcessing:
      "E drejta lidhur me përpunimin e automatizuar dhe profilizimin",
    rightRelatedToAutomatedText:
      "Përdoruesi ka të drejtë të mos i nënshtrohet një vendimi bazuar vetëm në përpunimin e automatizuar të të dhënave të tyre, duke përfshirë profilizimin, i cili prodhon efekte ligjore që lidhen me ta ose ndikon në mënyrë të ngjashme ndjeshëm tek ata.",
    userCannotExerciseRight:
      "Përdoruesi nuk mund të ushtrojë të drejtën për të parandaluar përpunimin e automatizuar të të dhënave të tyre, duke përfshirë profilizimin, nëse vendimi (përpunimi i automatizuar) është:",
    automatedException1:
      "1. i nevojshëm për lidhjen ose ekzekutimin e një kontrate midis përdoruesit dhe kontrolluesit (p.sh., shporta online e blerjeve),",
    automatedException2:
      "2. i lejuar nga ligji i Bashkimit Evropian ose Republikës së Sllovenisë dhe siguron masa të përshtatshme mbrojtëse për të drejtat dhe liritë, si dhe interesat legjitime të përdoruesit (p.sh., përpunimi i të dhënave nga Autoriteti Tatimor i Sllovenisë),",
    automatedException3:
      "3. bazuar në pëlqimin eksplicit të përdoruesit (p.sh., për marketing direkt përmes sistemeve të automatizuara për dërgimin e mesazheve të marketingut).",
    whereExplicitConsentRequired:
      "Kur kërkohet pëlqimi eksplicit, kontrolluesi siguron njoftime të përshtatshme për përdoruesin dhe një kuti konfirmimi për pëlqimin eksplicit.",
    rightToWithdrawExplicitConsent:
      "E drejta për të tërhequr pëlqimin eksplicit",
    rightToWithdrawText:
      "Përdoruesi ka të drejtë të tërheqë pëlqimin e tyre për përpunimin e të dhënave personale në çdo kohë, nëse përpunimi bazohet në pëlqim. Tërheqja e pëlqimit nuk ndikon në ligjshmërinë e përpunimit që është kryer para tërheqjes. Tërheqja e pëlqimit do të ndalojë përpunimin e mëtejshëm të të dhënave personale për qëllimin për të cilin është dhënë pëlqimi.",
    userCanWithdraw: "Përdoruesi mund të tërheqë:",
    withdrawType1: "1. pëlqimin e përgjithshëm për përpunim, ose",
    withdrawType2:
      "2. pëlqimin për përpunim për qëllime të marketingut direkt.",
    generalConsentWithdrawn:
      "Pëlqimi i përgjithshëm mund të tërhiqet me një kërkesë të thjeshtë, p.sh., përmes emailit, formularit të kontaktit, telefonit ose çdo kanali tjetër të siguruar qartë të ofruar nga kontrolluesi. Kontrolluesi duhet të përpunojë tërheqjen menjëherë ose të paktën brenda një muaji nga marrja e kërkesës.",
    consentForDirectMarketing:
      "Pëlqimi për përpunim për qëllime të marketingut direkt mund të tërhiqet nga përdoruesi në çdo kohë duke kërkuar që të dhënat e tyre të mos përdoren më për marketing direkt (pavarësisht nga baza ligjore). Kontrolluesi duhet të sigurojë që çdo formë e marketingut direkt (p.sh., email, SMS, thirrje) t'i sigurojë përdoruesit një mënyrë të lehtë dhe falas për të ushtruar të drejtën për të tërhequr pëlqimin. Çdo komunikim marketingu duhet të përfshijë qartë një opsion për të hequr dorë, të tillë si një lidhje 'Çregjistrohu' ose opsion tjetër të përshtatshëm që i lejon përdoruesit të heqë dorë shpejt dhe lehtë.",
    controllerEnablesWithdrawal:
      "Kontrolluesi mundëson tërheqjen e pëlqimit për marketing direkt pa kosto për përdoruesin dhe në të njëjtën mënyrë të lehtë siç është dhënë pëlqimi. Kontrolluesi duhet të mbajë provë të tërheqjes dhe të sigurojë që të dhënat të mos përdoren më për qëllime të paautorizuara. Kontrolluesi duhet të ndalojë përpunimin e të dhënave personale për qëllime të marketingut direkt jo më vonë se 15 ditë pas marrjes së kërkesës së përdoruesit. Kontrolluesi duhet të njoftojë përdoruesin për tërheqjen me shkrim ose përmes një metode tjetër të rënë dakord brenda 5 ditëve nga përpunimi i tërheqjes.",
    rightToLodgeComplaint:
      "E drejta për të paraqitur një ankesë pranë autoritetit mbikëqyrës",
    rightToLodgeText:
      "Përdoruesi ka të drejtë të paraqesë një ankesë pranë autoritetit kompetent mbikëqyrës nëse beson se përpunimi i të dhënave të tyre personale shkel Rregulloren e Përgjithshme të Mbrojtjes së të Dhënave (GDPR) ose legjislacionin e Republikës së Sllovenisë (ZVOP-2).",
    competentAuthority:
      "Në Republikën e Sllovenisë, autoriteti kompetent për mbrojtjen e të dhënave personale është: Komisioneri i Informacionit i Republikës së Sllovenisë Dunajska cesta 22, 1000 Ljubljana Email: gp.ip@ip-rs.si Faqja e internetit: www.ip-rs.si",
    userMayFileComplaintIf:
      "Përdoruesi mund të paraqesë një ankesë nëse kontrolluesi:",
    complaintReason1:
      "1. nuk është përgjigjur në mënyrë adekuate ndaj një kërkese për ushtrimin e të drejtave,",
    complaintReason2:
      "2. ka shkelur rregulloret në lidhje me mbrojtjen e të dhënave personale,",
    complaintReason3:
      "3. nuk ka marrë masa të përshtatshme mbrojtëse kur përpunon të dhënat.",
    controllerInformsUser:
      "Kontrolluesi informon përdoruesin se ata kanë gjithashtu të drejtën të paraqesin një padi në Gjykatën Administrative nëse besojnë se vendimi i Komisionerit të Informacionit nuk është i përshtatshëm.",
    copyright: "E DREJTA E AUTORIT",
    contentsAndTexts: "Përmbajtjet dhe tekstet",
    contentsAndTextsText:
      "Është e ndaluar të kopjohen ose të përdoren ndryshe përmbajtjet dhe tekstet në faqen e internetit të Kontrolluesit jashtë nevojave të bashkëpunimit midis Kontrolluesit dhe përdoruesit, përveç nëse thuhet ndryshe në faqen e internetit. Çdo ndërhyrje në të drejtën e autorit konsiderohet si shkelje e të drejtave të pronësisë intelektuale dhe mund t'i nënshtrohet procedurave të përshtatshme ligjore të filluara nga Kontrolluesi.",
    photographsAndAudiovisual: "Fotografitë dhe veprat audiovizuale",
    photographsAndAudiovisualText:
      "Të gjitha fotot, videot dhe veprat e tjera audiovizuale të publikuara në faqen e internetit janë vepër me të drejtë autori dhe pronë dhe/ose në posedim të Kontrolluesit dhe ato nuk duhet të kopjohen ose të përdoren ndryshe jashtë nevojave të bashkëpunimit midis Kontrolluesit dhe përdoruesit, përveç nëse thuhet ndryshe në faqen e internetit. Çdo ndërhyrje në të drejtën e autorit konsiderohet si shkelje e të drejtave të pronësisë intelektuale dhe mund t'i nënshtrohet procedurave të përshtatshme ligjore të filluara nga Kontrolluesi.",
    legalDocument: "Dokumenti ligjor",
    legalDocumentText:
      "Teksti i kësaj Politike të Privatësisë është pronë e Kontrolluesit dhe është e ndaluar të kopjohet, shpërndahet ose të trajtohet ndryshe ky tekst për qëllime marketingu pa një pëlqim me shkrim nga pronari i sistemit të informacionit i cili në emër të Kontrolluesit mirëmban Politikën e Privatësisë, përveç nëse lejohet nga ligji. Çdo ndërhyrje në të drejtën e autorit konsiderohet si shkelje e të drejtave të pronësisë intelektuale dhe mund t'i nënshtrohet procedurave të përshtatshme ligjore të filluara nga pronari i sistemit të informacionit, që është kompania POGOJI.SI, Tjaša Vidic s.p. Për çdo informacion shtesë në lidhje me këtë çështje, ju lutemi kontaktoni: podpora(at)pogoji.si.",
    legalDocumentNote:
      "Kjo dispozitë nuk ndikon në të drejtat e blerësve ose marrësve të shërbimeve, të cilët mund të ruajnë ose riprodhojnë dispozitat e këtyre kushteve dhe rregullave për qëllime personale.",
    finalProvisions: "DISPOZITAT PËRFUNDIMTARE",
    bindingNature: "Natyra e detyrueshme",
    bindingNature1:
      "1. Politika e Privatësisë zbatohet për të gjithë ata që përdorin faqen e internetit dhe i sigurojnë Kontrolluesit të dhëna personale në mënyrë që Kontrolluesi të mund t'i menaxhojë dhe përpunojë ato më tej.",
    bindingNature2:
      "2. Politika e Privatësisë është detyruese për Kontrolluesin, Përpunuesit dhe përdoruesit në fushën e paraqitjes, menaxhimit dhe përpunimit të të dhënave personale të përdoruesit, si dhe në zbatimin e të drejtave të përdoruesve dhe detyrimeve të Kontrolluesit dhe Përpunuesve.",
    bindingNature3:
      "3. Politika e Privatësisë është një pjesë integrale e çdo përpunimi të të dhënave personale në përputhje me qëllimet e përcaktuara më parë, bazat për përpunim, pëlqimin e përdoruesit dhe kategoritë e përdoruesit personal për përpunim në të ardhmen.",
    bindingNature4:
      "4. Përdoruesi informohet paraprakisht me këtë Politikë Privatësie, e cila është e disponueshme në faqen e internetit të Kontrolluesit dhe në të gjitha format dhe veprimet ku përdoruesi mund të paraqesë të dhënat e tyre personale për përpunim.",
    amendments: "Ndryshimet",
    amendments1:
      "1. Kontrolluesi do të përditësojë rregullisht Politikën e Privatësisë sipas ndryshimeve në legjislacion.",
    amendments2:
      "2. Kontrolluesi do të informojë përdoruesit për ndryshimet rregullisht dhe në kohë, në formë të shkruar me një mesazh elektronik.",
    amendments3:
      "3. Kontrolluesi do të sigurojë një arkiv të ndryshimeve të Politikës së Privatësisë i cili do të vihet në dispozicion të çdo përdoruesi me kërkesën e tyre paraprake me shkrim të paraqitur në adresën e emailit të kontaktit të Kontrolluesit.",
    disputeResolution: "Zgjidhja e mosmarrëveshjeve",
    disputeResolutionText:
      "Kontrolluesi dhe përdoruesi do të përpiqen të zgjidhin çdo mosmarrëveshje dhe mosmarrëveshje potenciale në mënyrë paqësore dhe me marrëveshje të ndërsjellë. Nëse marrëveshja e ndërsjellë nuk është e mundur, mosmarrëveshjet do të zgjidhen nga gjykata kompetente e selisë së Kontrolluesit në Republikën e Sllovenisë. Megjithatë, një përdorues që banon në një shtet anëtar të Bashkimit Evropian mund të vendosë të zgjidhë mosmarrëveshjen edhe para gjykatave të vendit të tij të banimit. Para kësaj, palët mund të vendosin gjithashtu të përdorin metoda alternative të zgjidhjes së mosmarrëveshjeve, të tilla si ndërmjetësimi ose arbitrazhi, në përputhje me ligjin në fuqi.",
    territorialValidity: "Vlefshmëria territoriale",
    territorialValidityText:
      "Politika e privatësisë zbatohet për të gjithë përdoruesit, pavarësisht nga vendi i qasjes ose vendbanimit të tyre, dhe mbulon të gjitha llojet e përpunimit të të dhënave personale, pavarësisht nga vendndodhja gjeografike e përdoruesit ose kontrolluesit.",
    temporalValidity: "Vlefshmëria kohore",
    temporalValidityText: "Kushtet ligjore zbatohen nga: 25.03.2026 18:27",

    // Terms of Service AL
    termsOfService: "Kushtet e Shërbimit",
    informationAboutTheProvider: "Informacion rreth ofruesit",
    providerOfProductsAndServicesIs:
      "Ofruesi i produkteve dhe/ose shërbimeve është:",
    postcodeAndPlace: "Kodi postar dhe vendi: 4270 Jesenice, Slloveni",
    vatNumber: "Numri TVSH: SI 44085206, pagues i TVSH-së",
    contactPhone: "Numri i telefonit për kontakt: +386 40 248 248",
    providerSpecificallyWarns:
      "Ofruesi paralajmëron në mënyrë specifike klientët për përmbajtjen e mëposhtme:",
    warningText:
      "Të gjitha informacionet në faqen e internetit proteini.si janë vetëm për qëllime informative dhe në asnjë mënyrë nuk synojnë të zëvendësojnë këshillat dhe trajtimin mjekësor të mjekut që ju trajton ose personelit tjetër mjekësor, as nuk janë zëvendësues për ndihmën e duhur mjekësore. Produktet dhe pretendimet për produktet individuale në këtë dyqan online nuk janë vlerësuar nga institucionet shtetërore dhe nuk janë të destinuara për asnjë formë trajtimi ose parandalimi të sëmundjeve. Përshkrimet tekstuale dhe materialet pikturale të produkteve individuale janë të natyrës informative dhe disa nuk janë të miratuara nga Instituti Evropian për Sigurinë Ushqimore (EFSA). Nëse jeni duke marrë ndonjë ilaç dhe/ose suplement ushqimor, konsultohuni me mjekun tuaj përpara se t'i kombinoni ato me ushqimin sportiv dhe suplementet.",
    webSite: "Faqja e internetit",
    termsAndConditionsIntendedFor:
      "Kushtet dhe Rregullat janë të destinuara për klientin kur lidh kontrata në distancë përmes e-mailit të ofruesit ose përmes faqes së internetit të ofruesit ose faqeve të internetit:",
    legislation: "Legjislacioni",
    forTheInterpretation: "Për interpretimin",
    ofTheseTermsAndConditions: "e këtyre Kushteve dhe Rregullave",
    theSlovenianLegislationShallApply: "zbatohet legjislacioni slloven.",
    theseTermsAndConditionsHaveBeenDrawnUp:
      "Këto Kushte dhe Rregulla janë hartuar në përputhje me dispozitat e",
    codeOfObligations: "Ligjit të Detyrimeve",
    oz: "OZ",
    electronicBusinessAndElectronicSignatureAct:
      "Ligjit për Biznesin Elektronik dhe Nënshkrimin Elektronik",
    zepep: "ZEPEP",
    electronicCommerceMarketAct: "Ligjit për Tregun e Tregtisë Elektronike",
    zept: "ZEPT",
    electronicCommunicationsAct: "Ligjit për Komunikime Elektronike",
    zekom2: "ZEKom-2",
    copyrightAndRelatedRightsAct:
      "Ligjit për të Drejtën e Autorit dhe të Drejtat e Përafërta",
    zasp: "ZASP",
    consumerProtectionAct: "Ligjit për Mbrojtjen e Konsumatorit",
    zvpot1: "ZVPot-1",
    andOtherSectoralNationalAndEuropeanLegislation:
      "dhe legjislacioneve të tjera sektoriale kombëtare dhe evropiane.",
    principle1Text:
      "Ofruesi respekton parimet e ligjshmërisë dhe drejtësisë në menaxhimin e faqes së internetit dhe shitjen e produkteve/shërbimeve.",
    principle2Text:
      "Ofruesi vepron në përputhje me praktikat e ndershme dhe në përmbushjen e detyrimeve të tij merr parasysh aftësinë, kujdesin dhe zellin e duhur.",
    principle3Text:
      "Ofruesi respekton parimin e transparencës dhe me këto Kushte dhe Rregulla në mënyrë të qartë dhe të kuptueshme i informon klientët për të drejtat e tyre.",
    principle4Text:
      "Ofruesi respekton parimin e proporcionalitetit në përpunimin e të dhënave personale. Mund të përpunojë vetëm të dhënat që janë për nga qëllimi relevante për qëllimet për të cilat po mblidhen dhe, nëse është e nevojshme, përpunohen. Mbrojtja e të dhënave personale rregullohet nga ofruesi në Politikën e Privatësisë, të publikuar në faqen e internetit dhe klienti informohet për të paraprakisht.",
    useOfWebsite: "PËRDORIMI I FAQES SË INTERNETIT",
    meaningOfUse: "Kuptimi i përdorimit",
    theUseOfThisWebsiteMeans: "Përdorimi i kësaj faqeje interneti do të thotë:",
    usePoint1: "1. Shikimi i përmbajtjes në faqen e internetit,",
    usePoint2: "2. Plotësimi i formularëve në faqen e internetit,",
    usePoint3:
      "3. Porositja e produkteve ose shërbimeve në faqen e internetit,",
    usePoint4: "4. Regjistrimi i klientit,",
    usePoint5: "5. Përdorimi i aplikacionit në internet,",
    usePoint6: "6. Mundësia e klientit për të komentuar,",
    usePoint7:
      "7. Lloje të tjera përdorimi në lidhje me përmbajtjen e faqes së internetit.",
    rulesOfUse: "Rregullat e përdorimit",
    customersMustUseTheWebsiteResponsibly:
      "Klientët duhet ta përdorin faqen e internetit me përgjegjësi dhe nuk duhet të shkaktojnë asnjë dëm në të. Është e ndaluar të:",
    rule1:
      "1. Shkelen të drejtat e autorit të ndonjë pale të tretë ose të shkelen ndonjë të drejtë tjetër të pronësisë intelektuale të palëve të treta,",
    rule2:
      "2. Shkelen të drejtat personale të palëve të treta (bindjet fetare, politike, gjendja mjekësore dhe të drejta të tjera të mbrojtura me ligj),",
    rule3: "3. Promovohet urrejtja ose aktet e dhunshme,",
    rule4: "4. Inkurajohet marrja e substancave të paligjshme,",
    rule5: "5. Inkurajohet phishing-u,",
    rule6:
      "6. Përhapen me qëllim viruse, krimba, mangësi, kuaj trojan, skedarë të dëmtuar, mashtrime ose përmbajtje ose elemente të tjera të natyrës shkatërruese ose mashtruese,",
    rule7:
      "7. Përdoret faqja e internetit me qëllim të shkëmbimit të paligjshëm të skedarëve me ndihmën e rrjeteve të avancuara peer-to-peer,",
    rule8:
      "8. Përdoret sistemi për minierën e bitcoin dhe valutave të tjera elektronike,",
    rule9:
      "9. Të kryhen ndonjë veprim tjetër që shkel ose inkurajon veprime që përfaqësojnë shkelje të rregullave për çështje penale ose rregulloreve të tjera të zbatueshme dhe të drejtave të palëve të treta.",
    responsibilityOfContent: "Përgjegjësia e përmbajtjes",
    responsibleForOperations:
      "përgjegjës për funksionimin e faqes së internetit dhe përmbajtjen e ofruar, përveç në rast të forcës madhore ose ndonjë shkaku tjetër jashtë kontrollit të tij",
    eliminateTechnicalAndSubstantiveErrors:
      "eliminojë shpejt gabimet teknike dhe thelbësore",
    providerDoesNotAssumeResponsibility:
      "Ofruesi nuk merr përsipër përgjegjësinë për ndonjë dëm të pësuar nga klienti, përveç nëse klienti provon të kundërtën, në rastet e mëposhtme:",
    responsibilityCase1:
      "1. nëse klienti e përdor faqen e internetit gabimisht, pavarësisht udhëzimeve të qarta,",
    responsibilityCase2:
      "2. nëse klienti nuk i përmbahet kushteve dhe rregullave të ofruesit,",
    responsibilityCase3: "3. gabime të vogla gramatikore në tekste,",
    responsibilityCase4:
      "4. nëse faqja e internetit nuk funksionon 24 orë në ditë, 7 ditë në javë në tërësi (100%),",
    responsibilityCase5:
      "5. lidhjet me faqet e internetit të palëve të treta janë vetëm për qëllime informative, përveç nëse thuhet ndryshe (p.sh., kalimi në pagesa me karta krediti, PayPal dhe metoda të tjera të krahasueshme).",
    responsibilitiesForUse: "Përgjegjësitë për përdorim",
    responsibilityForUse1:
      "1. Klienti duhet të largohet nga faqja e internetit, nëse nuk pajtohet me Kushtet dhe Rregullat.",
    responsibilityForUse2:
      "2. Klienti do ta përdorë faqen e internetit në atë mënyrë që të mos shkaktojë asnjë dëm në faqen e internetit ose te ofruesi, qoftë qëllimisht ose nga pakujdesia.",
    responsibilityForUse3:
      "3. Klienti mund të njoftojë ofruesin për ndërprerjet teknike ose mosfunksionimin e faqes së internetit ose përmbajtjes, nëse ofruesi nuk i njeh shqetësime ose mosfunksionime të tilla.",
    responsibilityForUse4:
      "4. Klienti është i detyruar të largohet nga faqja e internetit nëse përmbajtja është e përshtatshme vetëm për të rritur (18 vjeç e lart), për të cilën paralajmërohet menjëherë pas hyrjes në faqen e internetit.",
    responsibilityForUse5:
      "5. Në rastin e ofertës së produkteve ose shërbimeve për të cilat klienti duhet të jetë i moshës madhore për të porositur, ai paralajmërohet në mënyrë specifike për këtë para se të bëjë porosinë dhe nuk mund të bëjë porosinë nëse nuk i plotëson kërkesat e moshës.",
    customerRegistration: "Regjistrimi i klientit",
    registration1:
      "1. Me regjistrimin, klienti jep të dhëna të sakta dhe të vërteta. Keqpërdorimi i të dhënave personale të ndonjë pale të tretë është i ndaluar.",
    registration2:
      "2. Klienti do të mbrojë me kujdes emrin e përdoruesit dhe fjalëkalimin e marrë dhe nuk do t'ia përcjellë asnjë pale të tretë.",
    registration3:
      "3. Klienti është i vetëdijshëm se në rast të të dhënave të rreme ose keqpërdorimit të të dhënave personale të ndonjë pale të tretë, ofruesi mund të fillojë procedura ligjore përkatëse kundër klientit.",
    rulesOfCommenting: "Rregullat e komentimit",
    commentRule1:
      "1. Është e ndaluar të fyesh përdoruesit ose klientët e tjerë dhe ofruesin në faqen e internetit.",
    commentRule2:
      "2. Gjuha e urrejtjes është e ndaluar, si dhe çdo formë diskriminimi ndaj të tjerëve, publikut të gjerë dhe ofruesit.",
    commentRule3:
      "3. Është e ndaluar të bashkëngjitni ndonjë përmbajtje (imazhe, regjistrime video), e cila mund të fyejë të tjerët, të përfaqësojë gjuhë urrejtjeje, të inkurajojë çdo diskriminim, të promovojë doping ose lojërat e fatit ose që shkel të drejtat e pronësisë intelektuale të palëve të treta ose në ndonjë mënyrë tjetër paragjykon të drejtat e palëve të treta.",
    commentRule4:
      "4. Publikimi i përmbajtjeve pornografike, nxitja e veprave penale dhe shkeljeve të tjera, si dhe forma të tjera të sjelljes së dhunshme është e ndaluar.",
    commentRule5:
      "5. Ofruesi ose moderatori i tij rezervon të drejtën, pa asnjë njoftim paraprak, qoftë përkohësisht ose përgjithmonë, të pengojë qasjen e klientit në komente, nëse ky i fundit shkel këto rregulla.",
    copyrights: "TË DREJTAT E AUTORIT",
    photographsAndAudiovisualWorks: "Fotografitë dhe veprat audiovizuale",
    photographsAndAudiovisualText:
      "Të gjitha fotografitë, regjistrimet video dhe veprat e tjera audio vizuale të publikuara në faqen e internetit janë e drejtë autori e ofruesit dhe nuk mund të kopjohen ose të përdoren në asnjë mënyrë tjetër jashtë nevojave të bashkëpunimit ligjor midis klientit dhe ofruesit, përveç nëse faqja e internetit thotë ndryshe. Çdo ndërhyrje në të drejtën e autorit do të konsiderohet shkelje e të drejtave të pronësisë intelektuale dhe mund të jetë subjekt i fillimit të veprimeve ligjore përkatëse.",
    saleOfProducts: "SHITJA E PRODUKTEVE",
    productOffer: "Oferta e produkteve",
    productOfferText:
      "Karakteristikat kryesore të produkteve të ofruesit janë paraqitur në detaje në faqen e internetit. Karakteristikat dhe çmimet e produkteve, kostot dhe kohët e dorëzimit, metodat e mundshme të pagesës, zbritjet ose promovimet e mundshme, mënyrat e përdorimit të kuponeve, nëse ofruesi i lejon ato, dhe informacione të tjera të nevojshme për vendimet e informuara të klientit janë të përcaktuara.",
    orderProcedure: "Procedura e porositjes",
    orderProcedureText:
      "Procedura në faqen e internetit brenda shportës online për porositjen e produkteve është si më poshtë: Një procedurë e detajuar e blerjes është në dispozicion këtu: Procesi i blerjes. Një përshkrim i detajuar i përdorimit të pikëve të besnikërisë është në dispozicion këtu: Pikët e besnikërisë.",
    productPrices: "Çmimet e produkteve",
    price1:
      "1. Të gjitha çmimet shprehen në € (euro). Çmimet tregojnë nëse përfshijnë TVSH-në dhe përqindjen ose nëse nuk përfshijnë TVSH-në. Klienti informohet për koston totale të produkteve të porositura në shportën e blerjeve, ku tregohet veçmas edhe shuma totale e TVSH-së.",
    price2:
      "2. Përveç çmimit, klienti është gjithashtu i vetëdijshëm për koston e dorëzimit (nëse është e përfshirë në çmim apo ngarkohet veçmas dhe vlera e kostos).",
    price3:
      "3. Ofruesi mund të ndryshojë çmimet dhe ato zbatohen menjëherë pas publikimit. Për porositë e konfirmuara tashmë, çmimet nga porosia mbeten të vlefshme.",
    price4:
      "4. Zbritjet dhe kodet promovuese nuk mblidhen, përveç nëse thuhet ndryshe.",
    paymentMethodsText:
      "Ofruesi ofron mundësinë e pagesës së produkteve me metodat e mëposhtme të pagesës:",
    paymentMethod1: "1. Porosi për pagesë/UPN (faturë pro-formë)",
    paymentMethod2:
      "2. Pagesa në dorëzim (blerësi paguan te shërbimi i dorëzimit)",
    paymentMethod3: "3. PayPal",
    paymentMethod4:
      "4. Kartë krediti: Mastercard, Visa, Diners, Activa, Maestro",
    paymentMethod5: "5. Më shumë rreth metodave të pagesës: Metodat e pagesës.",
    paymentMethodFooter:
      "Klienti merr faturën për produktet e porositura fizikisht pas marrjes së produkteve të porositura ose në formë elektronike në e-mailin e dhënë. Në rast se ofruesi ka marrëveshje me klientin për shërbimin elektronik të faturave, ofruesi nuk lëshon në formë fizike. Ofruesi do t'i mbajë faturat dhe kontratën e shitjes në adresën e regjistruar të kompanisë në formë fizike për 10 vjet. Fatura është në dispozicion për çdo klient me një kërkesë paraprake me shkrim në adresën e emailit të kontaktit ose adresën e rregullt të ofruesit.",
    giftVouchers: "Kupo dhuratash",
    giftVouchersText:
      "Ofruesi mundëson blerjen e kupove të dhuratave dhe pagesën me kupo dhuratash. Metoda e blerjes dhe pagesës me kupo dhuratash është: Një kupo dhuratë mund të blihet në dyqanin online www.proteini.si dhe mund të shlyhet vetëm në dyqanin online www.proteini.si. Një kupo dhuratë është një faturë e lëshuar nga Shitësi në formë elektronike kundrejt pagesës (Blerësi merr një e-mail që përmban një kupo dhuratë në formën pdf). Çdo kupo dhuratë shënohet me kodin e vet (numër serial unik). Blerja e një kupo dhuratë i nënshtrohet të njëjtave dispozita të këtyre Kushteve dhe Rregullave si blerja e produkteve të tjera, përveç metodës së pagesës. Kupo dhurata mund të paguhet vetëm me kartë debiti/krediti dhe paypal. Kupo dhurata është e vlefshme për 12 muaj nga data e lëshimit të saj, përveç nëse thuhet ndryshe në kupo dhuratë. Kupot e dhuratave nuk mund të shkëmbehen me para të gatshme. Kupo dhurata shlyhet vetëm në tërësi. Në rast se vlera e blerjes është më e lartë se vlera e kupo dhuratës, mbajtësi i kupo dhuratës paguan diferencën. Vlera totale e blerjes duhet të jetë më e lartë se vlera e kupo dhuratës. Për të përdorur një kupo dhuratë, Blerësi zgjedh produktet e dëshiruara dhe i shton ato në shportë. Më pas, ai/ajo plotëson të dhënat e tij/saj ose hyn në llogarinë e tij/saj online, zgjedh dorëzimin dhe metodën e pagesës. Fut kodin e kupo dhuratës në fushën e kupo dhuratës dhe konfirmon duke klikuar në butonin Ruaj. Blerësi ka mundësinë të shlyejë disa kupo dhuratash në një porosi duke përsëritur procesin për secilin numër kupo dhuratë veç e veç. Duke futur kodin, vlera e kupove të dhuratave zbritet automatikisht nga vlera totale e porosisë dhe tregohet bilanci i pagesës. Nëse Blerësi anulon porosinë ose një pjesë të saj pa i shlyer kupot, Shitësi do të zëvendësojë të njëjtën vlerë të kupove të pashlyera me kupo të reja të së njëjtës vlerë. Shitësi do t'i kthejë paratë e paguara në paypal ose kartën e kreditit të Blerësit. Blerësi vetëm duhet të komunikojë kodet e kupove të dhuratave të papërdorura dhe numrin e porosisë në adresën e emailit të Shitësit (info@proteini.si).",
    deliveryPeriod: "Periudha e dorëzimit",
    deliveryPeriodText:
      "Periudha e dorëzimit për produktet që janë në magazinë do të jetë deri në 6 ditë pune pas marrjes së pagesës (ose pas marrjes së porosisë në rast të metodës së pagesës: Pagesa në dorëzim), veçanërisht për produktet nga magazina lokale, por në asnjë rast më gjatë se 30 ditë. Në rast të problemeve me dorëzimin e produktit të zgjedhur ose zgjatjes së periudhës së dorëzimit përtej 30 ditëve, ofruesi do ta informojë klientin në përputhje me rrethanat, në mënyrë që klienti të mund të vendosë një periudhë shtesë dorëzimi. Nëse ofruesi nuk e dorëzon produktin as brenda periudhës shtesë, klienti mund të tërhiqet nga kontrata. Nëse për klientin afati i dorëzimit është një komponent thelbësor i kontratës dhe ai e ka informuar ofruesin për këtë, ose nëse kjo rrjedh qartë nga rrethanat, ai mund të tërhiqet nga kontrata pa një afat shtesë për përmbushje. Në rast të tërheqjes nga kontrata, ofruesi do t'i kthejë klientit të gjitha pagesat e bëra.",
    deliveryCosts: "Kostot e dorëzimit",
    deliveryCosts1:
      "Ofruesi i dorëzon produktet përmes një shërbimi të dorëzimit të pakove që dërgon në shtëpinë e klientit ose në adresë tjetër të dhënë. Klienti është i vetëdijshëm se kostoja e dorëzimit mund të varet nga madhësia e produktit të porositur, sasia e produkteve të porositura, metoda e zgjedhur e pagesës dhe metoda e zgjedhur e dorëzimit dhe përcaktohet sipas listës së vlefshme të çmimeve të shërbimit të dorëzimit. Ofruesi e informon klientin për koston e dorëzimit në përmbledhjen e porosisë përpara se klienti të konfirmojë porosinë.",
    deliveryCosts2:
      "Klienti është i vetëdijshëm dhe pajtohet që shërbimi i dorëzimit në përgjithësi i dorëzon produktet e porositura në mëngjes nga e hëna në të premte dhe në adresën e dhënë nga klienti kur bën porosinë.",
    deliveryCosts3:
      "Klienti është i vetëdijshëm dhe pajtohet që në rast të pamundësisë për të marrë produktet në adresën e dhënë, ai/ajo mund t'i marrë produktet në adresën e treguar në njoftimin e ngarkesës së mbërritur ose në përputhje me marrëveshjen me personin e dorëzimit.",
    deliveryCosts4:
      "Në rast të mospranimit të pajustifikuar të ngarkesës, në mënyrë që ajo t'i kthehet ofruesit, ofruesi rezervon të drejtën të çaktivizojë mundësinë e zgjedhjes së metodës së pagesës në dorëzim për një klient të tillë në blerjet e mëvonshme, për të shmangur kostot shtesë që shkaktojnë dëm biznesi.",
    deliveryCosts5:
      "Një përshkrim i detajuar i kostove të transportit dhe kohës së dorëzimit, në varësi të metodës së zgjedhur të dorëzimit dhe vendit, është në dispozicion këtu: Kostot e transportit dhe Koha e dorëzimit.",
    limitsOfLiability: "Kufijtë e përgjegjësisë",
    limitsOfLiabilityText:
      "Rreziku i humbjes ose dëmtimit të produkteve të blera kalon nga ofruesi te klienti kur produktet pranohen fizikisht nga klienti ose kur produktet pranohen nga një palë e tretë e ndryshme nga shërbimi i dorëzimit (transportuesi) i emëruar nga klienti për qëllimin e pranimit të produkteve të dorëzuara. Nëse paketimi është dukshëm i dëmtuar, klienti mund të refuzojë të pranojë produktet e dorëzuara. Klienti gjithashtu mund të fotografojë paketimin e dëmtuar dhe të informojë ofruesin për të, por nuk është i detyruar ta bëjë këtë. Ofruesi është përgjegjës për dorëzimin e produkteve në gjendje të përsosur, në sasinë e rënë dakord dhe në kohën e rënë dakord, si dhe për dorëzimin e të gjithë dokumentacionit të nevojshëm të lidhur derisa klienti t'i marrë produktet.",
    productConformityWarranty: "Garancia e konformitetit të produktit",
    warranty1:
      "Në rast të mungesës së konformitetit të produkteve, klienti ka dy muaj nga momenti kur vuri re mungesën e konformitetit për të njoftuar ofruesin. Në rast se klienti nuk e njofton ofruesin brenda dy muajve nga momenti kur vuri re mungesën e konformitetit, ai/ajo nuk mund të pretendojë pretendimet e garancisë. Gjithashtu, klienti nuk mund të pretendojë pretendimet e garancisë pasi të kenë kaluar dy vjet nga blerja.",
    warranty2:
      "Klienti mund së pari t'i kërkojë ofruesit të riparojë ose zëvendësojë produktin me një produkt të ri pa të meta. Në këtë rast, klienti duhet ta vërë produktin në dispozicion të ofruesit. Zbatimi i pretendimeve për konformitetin e produktit është pa pagesë për klientin, ofruesi mban të gjitha kostot e nevojshme (transporti, dërgesa, kostot e punës dhe materialeve).",
    warranty3:
      "Ofruesi duhet të përmbushë kërkesën brenda një periudhe të arsyeshme kohore, e cila nuk duhet të kalojë 30 ditë. Ofruesi mund ta zgjasë këtë afat për maksimum 15 ditë, me kusht që të plotësohen kushtet ligjore, dhe klienti duhet të njoftohet për zgjatjen përpara skadimit të afatit tridhjetë-ditor.",
    warranty4:
      "Ofruesi rezervon të drejtën të refuzojë kërkesën e klientit për riparim ose zëvendësim të produktit në rast se riparimi ose zëvendësimi nuk është i mundur, ose nëse riparimi ose zëvendësimi do të përfaqësonte një kosto disproporcionale të lartë për ofruesin në lidhje me rrethanat e rastit specifik të përsosshmërisë së produktit të blerë. Në këtë rast, klienti mund të kërkojë uljen e çmimit të blerjes ose të tërhiqet nga kontrata.",
    warranty5:
      "Në rast se riparimi ose zëvendësimi nuk është i mundur ose nuk është i suksesshëm dhe kanë kaluar më shumë se 30 ditë nga blerja, klienti mund të kërkojë uljen e çmimit të blerjes në përpjesëtim me mungesën e konformitetit të produktit (vlera e reduktuar e produktit në krahasim me vlerën nëse produkti ishte i përsosur), ose të tërhiqet nga kontrata. Në rast të kërkesës për ulje të çmimit të blerjes, ofruesi do të kthejë një pjesë të çmimit të blerjes brenda tetë ditëve nga marrja e kërkesës. Në rast të tërheqjes nga kontrata, ofruesi do të kthejë shumën e paguar jo më vonë se tetë ditë pas marrjes së produktit ose marrjes së provës se klienti e ka dërguar produktin te ofruesi. Nëse ofruesi provon se mungesa e konformitetit të produktit është vetëm e parëndësishme, klienti nuk mund të tërhiqet nga kontrata.",
    warranty6:
      "Në rast se kanë kaluar më pak se 30 ditë nga blerja, klienti nuk ka nevojë të kërkojë së pari një zëvendësim ose një produkt të ri pa të meta, por ka të drejtë të tërhiqet nga kontrata. Ai e informon ofruesin për këtë me një deklaratë.",
    warrantyClaims: "Pretendimet e garancisë",
    warrantyClaimsText:
      "Klienti mund të japë një njoftim ose deklaratë për pretendimin e kërkesave për të siguruar konformitetin e produkteve gojarisht në selinë e ofruesit ose me shkrim në adresën e emailit ose adresën e ofruesit, me shënimin Pretendimet e garancisë:",
    warrantyClaimsEmail: "E-mail: info@proteini.si",
    warrantyClaimsAddress:
      "Adresa: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Slloveni",
    warrantyClaimsMustInclude:
      "Njoftimi ose deklarata për zbatimin e kërkesave për të siguruar konformitetin e produkteve duhet të përfshijë:",
    warrantyClaim1: "1. informacionin e kontaktit të klientit,",
    warrantyClaim2:
      "2. një përshkrim të saktë të produktit ose produkteve për të cilat klienti po pretendon kërkesat e garancisë,",
    warrantyClaim3:
      "3. klienti duhet të përshkruajë me saktësi mungesën e konformitetit që po pretendon me kërkesën,",
    warrantyClaim4:
      "4. klienti duhet të bashkëngjisë një faturë ose provë tjetër, me të cilën provon se e ka blerë produktin nga ofruesi,",
    warrantyClaim5:
      "5. ofruesi mund të kërkojë shpjegime shtesë ose prova nga klienti për të verifikuar siç duhet deklaratat e klientit për mungesën e konformitetit të mallrave, për shembull: mënyra e përdorimit të produktit, përshtatshmëria e ndjekjes së udhëzimeve të ofruesit për përdorim ose fakte të tjera relevante.",
    guarantees: "Garancitë",
    guarantees1:
      "Kur shet produkte ku garancia është e detyrueshme, ofruesi i dorëzon klientit një notë garancie jo më vonë se në dorëzimin e produkteve, duke garantuar që produkti do të funksionojë në mënyrë të përsosur për të paktën një vit nga data e blerjes (garancia e detyrueshme) ose më gjatë nëse garancia është për një periudhë më të gjatë (garancia vullnetare).",
    guarantees2:
      "Klienti mund të kërkojë garancinë kundrejt garantuesit, d.m.th. ofruesit (shitësi i produktit) ose prodhuesit të produktit ose një shërbimi të autorizuar.",
    guarantees3:
      "Nëse produkti nuk i plotëson specifikimet ose nuk i ka vetitë e treguara në notën e garancisë, klienti mund të kërkojë së pari korrigjimin e defekteve. Nëse defektet nuk korrigjohen brenda 30 ditëve nga dita kur garantuesi merr kërkesën e klientit për korrigjimin e defekteve, garantuesi duhet ta zëvendësojë produktin me një produkt identik, të ri dhe pa të meta pa pagesë për klientin. Garantuesi mund ta zgjasë këtë periudhë për maksimum 15 ditë, me kusht që të plotësohen kushtet ligjore, dhe klienti duhet të njoftohet për zgjatjen përpara skadimit të periudhës 30-ditore.",
    guarantees4:
      "Në rast se garantuesi nuk e riparon ose zëvendëson produktin brenda këtyre afateve, klienti mund të kërkojë rimbursimin e të gjithë çmimit të blerjes ose të kërkojë një ulje proporcionale të çmimit të blerjes, e cila merr parasysh proporcionalitetin e uljes së vlerës së produktit në krahasim me vlerën nëse produkti nuk kishte defekt.",
    guarantees5:
      "Në rast se kanë kaluar më pak se 30 ditë nga blerja, klienti nuk ka nevojë të kërkojë së pari një zëvendësim ose një produkt të ri pa të meta kur kërkon garancinë, por ka të drejtë të tërhiqet nga kontrata.",
    guarantees6:
      "Në rast se garantuesi nuk i siguron klientit një produkt zëvendësues për përdorim të përkohshëm gjatë riparimit ose shkëmbimit të produktit, klienti ka të drejtë të kërkojë dëmin që pësoi sepse nuk mund ta përdorte produktin nga momenti kur kërkoi riparimin ose zëvendësimin deri në momentin kur garantuesi e ka përmbushur detyrimin e tij.",
    guarantees7:
      "Të gjitha kostot në lidhje me zbatimin e garancisë paguhen nga garantuesi.",
    guaranteeClaims: "Pretendimet e garancisë",
    guaranteeClaimsText:
      "Udhëzimet për pretendimin e garancive janë të listuara në notën e garancisë. Për informacion shtesë ose shpjegime, ose për të kërkuar garancinë nga ofruesi, klienti mund të shkruajë në adresën e emailit ose adresën e ofruesit, me shënimin Pretendimi i garancisë:",
    guaranteeClaimsEmail: "E-mail: info@proteini.si",
    guaranteeClaimsAddress:
      "Adresa: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Slloveni",
    withdrawalFromContract: "Tërheqja nga kontrata",
    withdrawal1:
      "1. Klienti mund të tërhiqet nga kontrata (blerja) brenda 14 ditëve pa dhënë arsye.",
    withdrawal2:
      "2. Periudha e tërheqjes përfundon në 14 ditë nga dita kur klienti merr posedim fizik mbi produktin ose në vend të klientit e merr ndonjë palë e tretë që nuk është transportues dhe është emëruar për këtë qëllim nga klienti. Kjo do të thotë brenda 14 ditëve nga marrja e produktit (data e dorëzimit në konfirmimin e marrjes do të konsiderohet). Për kontratat në lidhje me dorëzimin e mallrave, të përbëra nga disa pjesë ose dërgesa, periudha e dorëzimit fillon kur klienti merr posedim fizik mbi dërgesën ose pjesën e fundit ose një palë e tretë e merr atë në vend të klientit e cila nuk është transportues dhe është emëruar për këtë qëllim nga klienti.",
    withdrawal3:
      "3. Nëse klienti tërhiqet nga kontrata, ofruesi duhet, pa vonesë të panevojshme dhe në çdo rast jo më vonë se 14 ditë nga dita e marrjes së njoftimit për tërheqjen nga kontrata, të rimbursojë të gjitha pagesat e marra, duke përfshirë kostot e dorëzimit. Ofruesi e kryen rimbursimin me të njëjtën metodë pagese siç është përdorur në zbatimin e transaksionit origjinal, përveç nëse është rënë dakord ndryshe me klientin me shkrim (p.sh. kredi ose ndonjë formë tjetër shpërblimi).",
    withdrawal4:
      "4. Ofruesi mund të mbajë pagesën derisa të marrë produktet e kthyera ose derisa klienti të dërgojë një provë të dërgimit të produkteve të kthyera, në varësi të asaj se çfarë ndodh më herët. Klienti i kthen produktet pa vonesë të panevojshme dhe në çdo rast jo më vonë se 14 ditë nga dita kur klienti njoftoi ofruesin për tërheqjen nga kontrata. Afati do të merret parasysh, nëse produktet dërgohen prapa para skadimit të periudhës 14-ditore. Kostot direkte të kthimit të mallrave i ngarkohen klientit.",
    withdrawal5:
      "5. Në rast se produkti i kthyer është i dëmtuar ose vlera e tij është e dëmtuar në ndonjë mënyrë tjetër, klienti është përgjegjës për uljen e vlerës së produktit nëse ulja e vlerës është rezultat i sjelljes që nuk është domosdoshmërisht e nevojshme për të përcaktuar natyrën, vetitë dhe funksionimin e produktit.",
    withdrawalNoRight:
      "Klienti është i njohur dhe pajtohet që pas blerjes së produkteve tona ai/ajo nuk mund të ushtrojë të drejtën për t'u tërhequr nga kontrata brenda 14 ditëve pa dhënë arsye për mallrat/produktet e mëposhtme:",
    noRight1:
      "1. Mallra të mbyllura, të cilat nuk janë të përshtatshme për t'u kthyer për shkak të mbrojtjes së shëndetit ose arsyeve higjienike, nëse blerësi e hapi mbylljen pas dorëzimit.",
    noRight2:
      "2. Produkte, të cilat për shkak të natyrës së tyre janë të papërndashme të përziera me produkte të tjera.",
    noRight3:
      "3. Pije alkoolike, çmimi i të cilave është rënë dakord me hyrjen në kontratën e shitjes dhe të cilat mund të dorëzohen pas 30 ditësh dhe vlera e tyre aktuale varet nga luhatjet e tregut mbi të cilat kompania nuk ka ndikim.",
    noRight4: "4. Produkte të blera në ankande publike.",
    noRight5:
      "5. Produkte, për të cilat blerësi kërkoi në mënyrë eksplicite vizitën e operatorit në shtëpi për riparim ose mirëmbajtje urgjente. Nëse në një vizitë të tillë operatori kryen edhe shërbime shtesë, jo të kërkuara në mënyrë eksplicite nga blerësi, ose dërgon mallra që nuk përfaqësojnë pjesë zëvendësuese, të nevojshme për mirëmbajtjen ose riparimin, blerësi për shërbime dhe mallra të tilla shtesë ka të drejtë të tërhiqet nga kontrata.",
    noRight6:
      "6. Produkte të personalizuara: produkte, të bëra sipas udhëzimeve të sakta të blerësit dhe të përshtatura për nevojat e tij/saj personale.",
    noRight7:
      "7. Produkte që përkeqësohen shpejt ose kanë një periudhë të shkurtër skadence.",
    noRight8:
      "8. Regjistrime audio ose video të mbyllura dhe softuer kompjuterik, nëse blerësi hap vulën e sigurisë pas dorëzimit (zbatohet gjithashtu për kodet e aktivizimit të paketave softuerike kur shkarkohen dhe programe dhe shërbime të tjera të krahasueshme).",
    noRight9:
      "9. Gazeta, periodikë ose revista, përveç kontratave të abonimit për furnizimin e botimeve të tilla.",
    noRight10:
      "10. Produkte, çmimi i të cilave varet nga luhatja e tregut, mbi të cilën kompania nuk ka ndikim dhe e cila mund të ndodhë brenda afatit të tërheqjes nga kontrata.",
    withdrawalNoRightNote:
      "Kjo dispozitë nuk cenon dispozitat për garanci, garanci dhe/ose ankesa, të cilat klienti mund t'i zbatojë në përputhje me këto Kushte dhe Rregulla.",
    enforcementOfWithdrawal: "Zbatimi i tërheqjes nga kontrata",
    enforcementOfWithdrawalText:
      "E drejta e tërheqjes mund të ushtrohet nga persona fizikë. Për të zbatuar të drejtën e tërheqjes nga kontrata, klienti duhet ta informojë ofruesin me një deklaratë të qartë (këshillojmë me shkrim) për vendimin e tij/saj për tërheqje nga kjo kontratë. Kjo mund të bëhet duke dërguar një letër me postë të rregullt (rekomandohet letra e regjistruar) ose me postë elektronike në adresat e treguara më poshtë ose e informon ofruesin gojarisht (në këtë rast, barra e provës i takon klientit), me shënimin Tërheqja nga kontrata:",
    enforcementOfWithdrawalEmail: "E-mail: info@proteini.si",
    enforcementOfWithdrawalAddress:
      "Adresa: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Slloveni",
    formForWithdrawal: "Formulari për tërheqjen nga kontrata",
    formForWithdrawalText:
      "Ju mund ta gjeni formularin për tërheqjen nga kontrata këtu: Klikoni këtu: Formulari për tërheqje",
    addressForComplaints: "Adresa për ankesa",
    addressForComplaintsText:
      "Klienti mund të dërgojë ankesat dhe kërkesat e tjera, të cilat nuk rrjedhin nga zbatimi i garancive, garancive ose tërheqjeve nga kontrata, në e-mailin e ofruesit, me shënimin Ankesa:",
    addressForComplaintsEmail: "E-mail: info@proteini.si",
    addressForComplaintsAddress:
      "Adresa: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Slloveni",
    reviewOfProducts: "Vlerësimi i produkteve",
    reviewOfProductsText:
      "Ofruesi u mundëson klientëve të vlerësojnë produktet e porositura në faqen e internetit. Katërmbëdhjetë ditë pas blerjes, Shitësi do t'i lejojë Blerësit të vlerësojë produktet, të porositura ekskluzivisht nga Blerësi dhe të cilat nuk i nënshtrohen kthimit me tërheqje nga kontrata. Shitësi do t'i dërgojë një e-mail Blerësit duke e falënderuar për blerjen dhe duke i dhënë një lidhje, që i mundëson Blerësit të vlerësojë produktet e blera. Duke klikuar lidhjen, Blerësit do t'i paraqitet një listë e produkteve të blera. Për secilin produkt, Blerësi mund të japë një vlerësim nga 1 në 5, ku 1 do të thotë se ai/ajo nuk është plotësisht i kënaqur me produktin dhe 5 do të thotë se ai/ajo është plotësisht i kënaqur me produktin. Në rastet kur Blerësi jep një vlerësim 1 ose 2, ai/ajo merr një e-mail shtesë që i kërkon Blerësit të shpjegojë vendimin e tij/saj në lidhje me vlerësimin 1 ose 2. Shitësi do të marrë parasysh reagimet shtesë nga Blerësi, nëse vlerësimi është i arsyeshëm, i kuptueshëm dhe respektues. Në rastet kur vlerësimi është i paarsyeshëm, i pakuptueshëm dhe ofendues, dhe veçanërisht nëse Shitësi konsideron se është rast i uljes së qëllimshme të vlerësimit të përgjithshëm të një produkti të caktuar me qëllim të dëmtimit të reputacionit dhe biznesit të Shitësit, Shitësi nuk do ta marrë parasysh një vlerësim të tillë. Për çdo vlerësim të një produkti individual, Blerësi do të marrë 50 pikë besnikërie shtesë, përveç në rastet kur Shitësi nuk e merr parasysh vlerësimin për arsyet e lartpërmendura. Blerësi mund të vlerësojë të njëjtin produkt vetëm një herë. Pikët e besnikërisë u jepen përdoruesve të regjistruar. Regjistrimi këtu: Hyrja. Vlera e një pike është 1 cent. Blerësi mund t'i përdorë pikët e besnikërisë në blerjen e ardhshme. Detajet mbi pikët e besnikërisë: Pikët e besnikërisë.",
    productMaintenanceAndInstructions: "Mirëmbajtja dhe udhëzimet e produktit",
    productMaintenanceAndInstructionsText:
      "Klienti është i vetëdijshëm që të gjitha produktet janë të pajisura me udhëzime për mirëmbajtje ose përdorim, aty ku kjo është e arsyeshme dhe e nevojshme. Klienti është i detyruar t'i lexojë me kujdes udhëzimet për mirëmbajtjen dhe përdorimin e produktit. Nëse klienti ka probleme me të kuptuarit e udhëzimeve për mirëmbajtje ose përdorim, ofruesi është në dispozicion të klientit për shpjegime shtesë për të parandaluar dëmtimin që mund të shkaktohet nga mirëmbajtja ose përdorimi i gabuar.",
    specialAgreements: "Marrëveshje të veçanta",
    specialAgreements1:
      "Pavarësisht nga dispozitat e këtyre Kushteve dhe Rregullave, ofruesi dhe klienti mund të bien dakord për përmbajtjen ndryshe, në ndjekjen e përbashkët të interesave të të dyve. Ofruesi është i detyruar që marrëveshjet e veçanta në asnjë kuptim nuk mund t'i sigurojnë klientit, i cili është person fizik, më pak të drejta se ato të garantuara nga këto Kushte dhe Rregulla dhe legjislacioni.",
    specialAgreements2:
      "Ofruesi mund të ofrojë kushte të veçanta shitjeje për: mallra të caktuara, përmbajtje të caktuara dixhitale, shërbime të caktuara, grupe të caktuara abonentësh (jo-diskriminuese) dhe metoda të caktuara pagese.",
    generalRulesOfThePrizeContest:
      "RREGULLAT E PËRGJITHSHME TË KONKURSIT TË ÇMIMEVE",
    generalRulesText:
      "Këto Rregulla zbatohen për të gjitha konkurset e çmimeve të organizuara nga PROTEINI d.o.o., Ulica heroja Verdnika 22, 4270 Jesenice (Organizatori) në faqen e internetit proteini.si ose ndryshe.",
    generalRulesSupplement:
      "Organizatori mund t'i plotësojë ose modifikojë ndryshe këto Rregulla (rregulla të veçanta të konkursit të çmimeve) nëse i informon pjesëmarrësit në konkursin e çmimeve paraprakisht dhe në mënyrë të qartë direkt në kupon ose në formularin e konkursit të çmimeve në faqen e internetit www.proteini.si. Do të konsiderohet se përveç këtyre Rregullave, zbatohen çdo rregull shtesë që i njihen Pjesëmarrësit paraprakisht dhe me të cilat Pjesëmarrësi pajtohet duke konfirmuar pjesëmarrjen e tij/saj në konkursin e çmimeve.",
    participants: "Pjesëmarrësit",
    participantsText:
      "Shortet e Organizatorit janë të hapura për personat fizikë mbi moshën 16 vjeç dhe personat fizikë nën moshën 16 vjeç, në varësi të pëlqimit paraprak të kujdestarit të tyre ligjor për përpunimin e të dhënave personale.",
    conditionsForParticipation: "Kushtet për pjesëmarrje",
    conditionsForParticipationText:
      "Konkursi i çmimeve është i hapur për çdo person, i cili:",
    condition1:
      "ka plotësuar formularin për pjesëmarrje në konkursin e çmimeve me të gjitha të dhënat e kërkuara, të cilat duhet të jenë të sakta dhe të vërteta; dhe",
    condition2:
      "nuk ka marrë pjesë në përgatitjen ose zbatimin e konkursit të çmimeve; dhe",
    condition3:
      "nuk është i punësuar nga Organizatori ose Autoriteti Kontraktor dhe nuk është anëtar i familjes së menjëhershme të tyre; dhe",
    condition4:
      "i plotëson kushtet për pjesëmarrje në periudhën nga fillimi i pjesëmarrjes në konkursin e çmimeve deri në kohën e përzgjedhjes së fituesve të çmimeve.",
    methodOfParticipation: "Metoda e pjesëmarrjes",
    methodOfParticipationText:
      "Për të qenë i aftë për të hyrë në konkursin e çmimeve, Pjesëmarrësi duhet të plotësojë formularin e hyrjes së konkursit të çmimeve. Formulari duhet të plotësohet elektronikisht dhe duke klikuar në butonin e konfirmimit, Pjesëmarrësit konfirmojnë pjesëmarrjen e tyre në konkursin e çmimeve.",
    methodOfParticipation2:
      "Një Pjesëmarrës mund të hyjë në të njëjtin lloj konkursi çmimesh vetëm një herë (duke plotësuar formularin).",
    methodOfParticipation3:
      "Duke konfirmuar pjesëmarrjen në konkursin e çmimeve, Pjesëmarrësi pajtohet me Rregullat e Përgjithshme dhe të Veçanta të Konkursit të Çmimeve, me publikimin e emrit të tij/saj dhe shkronjës së parë të mbiemrit në listën e fituesve të çmimeve, dhe të regjistrohet për t'u informuar për ecurinë e konkursit të çmimeve duke përdorur adresën e emailit që ai/ajo dha kur u regjistrua për konkursin e çmimeve.",
    committee: "Komisioni",
    committeeText:
      "Organizatori do të emërojë me vendim një komision prej tre anëtarësh, i cili do të:",
    committeeTask1:
      "mbikëqyrë organizimin e konkursit të çmimeve dhe pajtueshmërinë me rregullat e konkursit të çmimeve,",
    committeeTask2:
      "hartojë një procesverbal të shortit dhe ta mbajë atë për një periudhë prej 1 viti nga data e mbylljes së shortit; dhe",
    committeeTask3:
      "marrë veprimet e duhura në rast të shkeljeve ose shkeljeve të dyshuara.",
    committeeDecision: "Vendimet e Komisionit janë përfundimtare.",
    prizeDraw: "Shorti i çmimeve",
    prizeDrawText:
      "Shorti i çmimeve do të zhvillohet në datën e përcaktuar për çdo konkurs çmimesh, siç tregohet në konkursin e publikuar ose formularin. Shorti i çmimeve mund të zhvillohet në ambientet e biznesit të Organizatorit ose në ambientet e kompanisë që jep çmimin. Shorti i çmimeve do të zhvillohet midis të gjitha hyrjeve të marra deri në datën e përcaktuar në formularin e hyrjes për secilin konkurs çmimesh. Shorti i çmimeve do të jetë sistematik, d.m.th. Fituesit do të tërhiqen duke përdorur një algoritëm të rastësishëm. Numri i Pjesëmarrësve ('Fituesit') është i njëjtë me numrin e çmimeve të parashikuara për secilin konkurs çmimesh.",
    prizeDraw2:
      "Në çdo rast, një Pjesëmarrës ka të drejtë vetëm për një çmim në secilin konkurs çmimesh.",
    publicationAndNotificationOfWinners: "Publikimi dhe njoftimi i Fituesve",
    publicationAndNotificationText:
      "Organizatori do t'i shpallë Fituesit në faqen e tij të internetit www.proteini.si dhe/ose në kanalet e tij të mediave sociale brenda 10 ditëve të punës pas shortit të çmimeve. Në rastet kur Fituesit nuk e kërkojnë çmimin brenda afatit të përcaktuar, shorti do të përsëritet dhe afati për publikimin e Fituesve do të zgjatet.",
    publicationAndNotification2:
      "Organizatori do t'i njoftojë Fituesit për marrjen e çmimit jo më vonë se dy ditë pune pas shortit të çmimeve përmes adresës së emailit që ata dhanë kur hynë në konkursin e çmimeve.",
    collectionAndTransferOfPrize: "Marrja dhe transferimi i çmimit",
    collectionAndTransferText:
      "Fituesi duhet të paraqesë kërkesën e tij/saj për të kërkuar çmimin te Organizatori me shkrim me e-mail, postë të rregullt ose SMS Mesazh, jo më vonë se 8 ditë pune nga data e marrjes së informacionit se ai/ajo ishte Fituesi.",
    collectionAndTransfer2:
      "Në mesazh, Fituesi duhet të japë të dhënat e kërkuara për dorëzimin e çmimit (p.sh. numri tatimor, adresa personale) siç specifikohet në mesazhin e Organizatorit. Nëse Fituesi nuk i jep të dhënat e nevojshme ose jep të dhëna që janë të pasakta ose të rreme, ai/ajo nuk do të ketë të drejtë për çmimin.",
    collectionAndTransfer3:
      "Fituesit do të informohen për mënyrat për të marrë çmimin e tyre, të cilat mund të jenë:",
    collectionMethod1: "personalht në adresën e regjistruar të Organizatorit,",
    collectionMethod2:
      "personalht në adresën e regjistruar të një kompanie tjetër që kontribuon me çmime, ku Organizatori lëshon një faturë për marrjen e çmimit,",
    collectionMethod3:
      "me postë të regjistruar në adresën personale të Fituesit, ku kostot postare i ngarkohen Organizatorit; ose",
    collectionMethod4:
      "me transfertë parash në llogarinë transaksionale të Fituesit, ku Fituesi pranon dhe pajtohet me dispozitat në lidhje me paradhënien e tatimit mbi të ardhurat.",
    collectionAndTransfer4:
      "Çmimi nuk mund të shlyhet tek Organizatori për një produkt tjetër ose të shkëmbehet për një çmim tjetër ose kompensim monetar.",
    collectionAndTransfer5:
      "Organizatori ka të drejtë të kërkojë nga Fituesi të sigurojë një dokument identifikimi të vlefshëm përpara se të marrë çmimin.",
    collectionAndTransfer6:
      "Fituesi është përgjegjës për të gjitha kostot që lidhen me marrjen e çmimit (kostot e udhëtimit, posta, tarifat e aeroportit, etj.).",
    incomeTaxPrepayment: "Paradhënia e tatimit mbi të ardhurat",
    incomeTaxPrepaymentText:
      "Paradhënia e tatimit mbi të ardhurat për çmimet do të paguhet nga Organizatori i konkursit të çmimeve ose nga sponsori nëse ky i fundit është i ndryshëm nga Organizatori. Fituesi është përgjegjës për tatimin mbi të ardhurat dhe duhet t'i sigurojë Organizatorit me shkrim të dhënat e sakta personale (emri dhe mbiemri, vendbanimi i përhershëm, numri i telefonit, e-mail, PIN dhe Numri Identifikues Tatimor) jo më vonë se 14 ditë pas marrjes së njoftimit për çmimin (ose ndonjë afat tjetër kohor që mund të specifikohet në njoftim). Organizatori do t'i përcjellë të dhënat e dhëna sponsorit të çmimit, nëse Organizatori nuk është paguesi i çmimit.",
    incomeTaxPrepayment2:
      "Paraqitja e të dhënave të mësipërme është kusht për të kërkuar çdo çmim, vlera e të cilit tejkalon 42.00 € përfshirë TVSH-në. Fituesit gjithashtu pajtohen dhe informohen se pas marrjes së çmimit ata mund të vendosen në një klasë tatimore më të lartë. Në këtë rast, ata mbajnë të gjithë përgjegjësinë financiare dhe pasojat.",
    limitationOfLiabilityUntilDelivery:
      "Kufizimi i përgjegjësisë deri në dorëzimin e çmimit",
    limitationOfLiabilityText:
      "Në rast se çmimet kontribuohen nga një kompani tjetër, e cila nuk është Organizatori, Organizatori nuk do të marrë përsipër përgjegjësinë në rast të ndonjë dështimi të tillë të kompanisë për të përmbushur detyrimin e saj për t'ia dorëzuar çmimin Fituesit, në masën që një kompani e tillë nuk është në gjendje të përmbushë detyrimin e saj për shkak të arsyeve jashtë kontrollit të kompanisë dhe Organizatorit, ose për shkak të arsyeve të panjohura për Organizatorin ose që nuk ekzistonin para organizimit të konkursit të çmimeve (veçanërisht në rast të falimentimit ose paaftësisë paguese të një kompanie të tillë).",
    limitationOfLiability2:
      "Në këtë rast, Organizatori u ofron Fituesve çmime të ndryshme, në dispozicion të Organizatorit. Fituesit nuk mund të kërkojnë nga Organizatori blerjen e produkteve identike ose të ngjashme (subjekt i konkursit të çmimeve), as nuk mund të kërkojnë ndonjë kompensim monetar.",
    failureToAwardPrize: "Mosdhënia e çmimit",
    failureToAwardPrizeText: "Organizatori nuk do ta japë çmimin nëse Fituesi:",
    failureReason1: "humb afatin për kërkimin e çmimit,",
    failureReason2: "nuk i përcjell të dhënat e kërkuara,",
    failureReason3:
      "nuk siguron një formë të vlefshme identifikimi nëse i kërkohet ta bëjë këtë,",
    failureReason4: "shkel dispozitat e këtyre Rregullave,",
    failureReason5:
      "shpreh vullnetin e tij/saj, me shkrim ose gojarisht, të heqë dorë nga çmimi.",
    violationOfTheRules: "Shkelja e Rregullave",
    violationOfRulesText:
      "Nëse, para shortit, vërtetohet se një person kërkon ose merr pjesëmarrje në konkursin e çmimeve ose dhënien e një çmimi në kundërshtim me këto Rregulla ose ligjin, Organizatori do ta përjashtojë atë person nga pjesëmarrja në konkursin e çmimeve.",
    violationOfRules2:
      "Nëse shkelja vërtetohet pas shortit të çmimeve, Organizatori nuk është i detyruar t'ia japë çmimin shkelësit.",
    violationOfRules3:
      "Nëse çmimi tashmë është dhënë dhe rezulton se Fituesi e ka fituar çmimin në kundërshtim me këto Rregulla, Organizatori mund të kërkojë kthimin e menjëhershëm të çmimit ose ekuivalentin e tij monetar dhe kompensimin për çdo dëm të shkaktuar.",
    protectionOfPersonalData: "Mbrojtja e të dhënave personale",
    protectionOfPersonalDataText:
      "Duke kontrolluar kutinë e duhur në kupon dhe/ose formularin e hyrjes së konkursit të çmimeve, Pjesëmarrësi jep pëlqimin e tij/saj eksplicit personal që Organizatori, si kontrollues i të dhënave personale, të mbledhë dhe përpunojë të dhëna personale për qëllimin e zhvillimit të një konkursi specifik të çmimeve dhe informimit për çmimin.",
    typesOfPersonalData:
      "Llojet e të dhënave personale të përpunuara nga Organizatori janë të përcaktuara në secilin kupon dhe/ose formular individual të konkursit të çmimeve, dhe Organizatori mund, në veçanti, të përpunojë sa vijon për qëllimet e përshkruara:",
    personalDataType1:
      "emri dhe mbiemri (për qëllim pjesëmarrjeje, njoftimi për një çmim të mundshëm, marrjeje të buletineve informative),",
    personalDataType2: "adresa (për qëllim njoftimi dhe dërgimi të çmimit),",
    personalDataType3:
      "adresa e emailit (për qëllim pjesëmarrjeje, njoftimi për një çmim të mundshëm, marrjeje të buletineve informative),",
    personalDataType4: "numri i telefonit (për qëllime njoftimi),",
    personalDataType5: "numri tatimor (për qëllim pagese të shumës së çmimit),",
    personalDataType6:
      "PIN (për qëllim të paradhënies së tatimit mbi të ardhurat dhe verifikimit të pajtueshmërisë me Kushtet e Përgjithshme për pjesëmarrje në konkursin e çmimeve).",
    personalDataType7:
      "llogaria transaksionale (për qëllim të pagesës së shumës së çmimit).",
    protectionOfPersonalData2:
      "Pjesëmarrësi pranon dhe pajtohet që në rast se ai/ajo ishte Fituesi, të dhënat e tij/saj personale (emri dhe shkronja e parë e mbiemrit) do të bëhen publike.",
    protectionOfPersonalData3:
      "Duke hyrë në konkursin e çmimeve, Pjesëmarrësi pranon dhe pajtohet që ai/ajo do të vazhdojë të marrë informacion nga Organizatori për lojëra shtesë me çmime, privilegje, promovime dhe zbritje pasi të ketë ndodhur konkursi i çmimeve dhe se ai/ajo mund të tërheqë në çdo kohë këtë pëlqim eksplicit.",
    protectionOfPersonalData4:
      "Pjesëmarrësi pranon që të dhënat e tij/saj personale mund të përpunohen gjithashtu nga përpunuesit kontraktualë të Organizatorit, të cilët u nënshtrohen të njëjtave detyrime të mbrojtjes së të dhënave si Organizatori.",
    protectionOfPersonalData5:
      "Pjesëmarrësi pranon që Organizatori i përpunon të dhënat personale në përputhje me legjislacionin slloven dhe evropian, veçanërisht në përputhje me ligjin në fuqi që rregullon mbrojtjen e të dhënave personale dhe Rregulloren e Përgjithshme të Mbrojtjes së të Dhënave (GDPR).",
    protectionOfPersonalData6:
      "Pjesëmarrësi pranon që, në rast të pjesëmarrjes në konkursin e çmimeve, Organizatori do të mbajë dhe përpunojë adresën e tij/saj të emailit dhe numrin e telefonit, nëse kërkohet si kusht për pjesëmarrje në konkursin e çmimeve, derisa Pjesëmarrësi të ketë komunikuar kërkesën e tij/saj për të tërhequr pëlqimin për përpunimin e të dhënave personale te Organizatori. Në rast se Pjesëmarrësi kërkon fshirjen e adresës së emailit dhe numrit të telefonit, nëse këto të fundit kërkoheshin si kusht për pjesëmarrje në shortin e çmimeve (çregjistrimi), gjatë konkursit të çmimeve dhe deri në shpalljen publike të Fituesve, ai/ajo do të konsiderohet se është tërhequr nga pjesëmarrja në konkursin e çmimeve.",
    protectionOfPersonalData7:
      "Pjesëmarrësi është i vetëdijshëm se ai/ajo mund t'i ushtrojë të drejtat e tij/saj sipas legjislacionit të mbrojtjes së të dhënave duke dërguar email në: gdpr@proteini.si, në veçanti:",
    gdprRight1: "e drejta për të pasur qasje në të dhënat personale,",
    gdprRight2: "e drejta për të korrigjuar të dhënat personale,",
    gdprRight3: "e drejta për transferueshmërinë e të dhënave,",
    gdprRight4:
      "e drejta për të fshirë të dhënat personale (e drejta për të harruar),",
    gdprRight5:
      "e drejta për të kufizuar përpunimin e të dhënave personale, dhe,",
    gdprRight6:
      "e drejta për të kundërshtuar përpunimin e të dhënave personale.",
    protectionOfPersonalData8:
      "Organizatori, PROTEINI.SI d.o.o., ka një përshkrim të detajuar të mbrojtjes së të dhënave personale në Politikën e Privatësisë, të publikuar në faqen e tij të internetit www.proteini.si.",
    withdrawalFromPrizeContest: "Tërheqja nga konkursi i çmimeve",
    withdrawalFromPrizeContestText:
      "Pjesëmarrësi mund të tërhiqet nga pjesëmarrja në konkursin e çmimeve në çdo fazë të konkursit të çmimeve duke dërguar kërkesën e tij/saj për të tërhequr pëlqimin për përpunimin e të dhënave personale dhe për t'u tërhequr nga pjesëmarrja në konkursin e çmimeve te Organizatori në adresën e mëposhtme të emailit: info@proteini.si. Nuk është e mundur të revokohet tërheqja nga konkursi i çmimeve.",
    limitationOfOrganizerLiability: "Kufizimi i përgjegjësisë së Organizatorit",
    limitationOfOrganizerLiabilityText:
      "Organizatori nuk do të jetë përgjegjës për zbatimin e konkursit të çmimeve, dhënien e çmimeve ose ndonjë dëm:",
    organizerLiability1:
      "nëse konkursi i çmimeve është i ndaluar ose i penguar nga autoritetet qeveritare ose mbajtësit e autoritetit publik; ose",
    organizerLiability2:
      "në rastet e forcës madhore jashtë kontrollit të Organizatorit, të cilat pengojnë mbajtjen e konkursit të çmimeve.",
    limitationOfOrganizerLiability2:
      "Në rast të një ndryshimi të rëndësishëm të rrethanave të natyrës teknike ose tregtare, Organizatori do t'i ndryshojë rregullat e konkursit të çmimeve në mënyrë të drejtë, do të njoftojë të gjithë Pjesëmarrësit dhe, pas njoftimit, do të zhvillojë ose përfundojë konkursin e çmimeve bazuar në rregullat e reja.",
    disputeSettlement: "Zgjidhja e mosmarrëveshjeve",
    disputeSettlementText:
      "Në rast të ndonjë mosmarrëveshjeje sipas këtyre Rregullave, gjykata në Jesenice do të ketë juridiksion.",
    finalProvisions: "DISPOZITAT PËRFUNDIMTARE",
    bindingNature1:
      "1. Kushtet dhe rregullat do të zbatohen për të gjithë klientët përmes faqes së internetit të ofruesit dhe në rastin e lidhjes së kontratave ose konfirmimit të porosive përmes e-mailit ose kanaleve të tjera të krahasueshme të komunikimit të ofruesit (kontrata të lidhura në distancë). Në rastin e marrëveshjeve duke përdorur telefonin, ofruesi merr konfirmimin me shkrim të porosisë nga klienti përmes e-mailit ose kanaleve të tjera të krahasueshme të komunikimit të ofruesit (konfirmimi me shkrim) dhe vetëm në këtë rast marrëdhënia kontraktuale (blerja ose porosia) konsiderohet e lidhur. Gjatë shkëmbimit të mesazheve me klientin, ofruesi e informon këtë të fundit dhe i siguron atij këto kushte biznesi në një formë të arritshme, me të cilat klienti njihet dhe pajtohet me shkrim përpara se porosia të konsiderohet e konfirmuar.",
    bindingNature2:
      "2. Kushtet dhe rregullat janë detyruese për të gjitha transaksionet ligjore të lidhura në bazë të tyre përmes kësaj faqeje interneti dhe/ose përmes përdorimit të e-mailit ose kanaleve të krahasueshme të komunikimit.",
    bindingNature3:
      "3. Kushtet dhe rregullat janë pjesë përbërëse e porosisë. Përveç nëse lidhet një kontratë e veçantë me shkrim, porosia e konfirmuar dhe kushtet dhe rregullat e zbatueshme konsiderohen si një marrëdhënie kontraktuale e rënë dakord.",
    bindingNature4:
      "4. Klienti konfirmon njohjen dhe pajtohet me këto kushte dhe rregulla përpara se të porosisë një produkt ose shërbim në shportën online ose përmes e-mailit ose kanaleve të tjera të krahasueshme të komunikimit.",
    amendments1:
      "1. Ofruesi do të përditësojë rregullisht Kushtet dhe Rregullat me ndryshimet legjislative.",
    amendments2:
      "2. Ofruesi rezervon të drejtën të bëjë herë pas here korrigjime dhe ndryshime thelbësore të Kushteve dhe Rregullave.",
    amendments3:
      "3. Ofruesi do t'i informojë klientët për çdo ndryshim të rëndësishëm në kohën e duhur, me shkrim me e-mail.",
    amendments4:
      "4. Ofruesi do të mbajë arkivat e ndryshimeve të Kushteve dhe Rregullave, të arritshme për çdo klient me një kërkesë paraprake me shkrim në e-mailin e ofruesit.",
    disputeResolutionText:
      "Ofruesi dhe klienti marrin përsipër të zgjidhin çdo mosmarrëveshje dhe mosmarrëveshje të mundshme në mënyrë paqësore dhe konsensuale. Ofruesi nuk njeh asnjë ofrues të zgjidhjes jashtëgjyqësore të mosmarrëveshjeve të konsumatorëve si kompetent për zgjidhjen e një mosmarrëveshjeje konsumatore, prandaj në rast të një mosmarrëveshjeje të pazgjidhur, konsumatori mund t'i drejtohet një autoriteti për zgjidhjen alternative të mosmarrëveshjeve.",
    disputeResolution2:
      "Pika kombëtare e kontaktit për informacion shtesë është dhënë brenda Ministrisë së Ekonomisë, Turizmit dhe Sportit: Zgjidhja e mosmarrëveshjeve të konsumatorëve",
    disputeResolution3:
      "Nëse një zgjidhje miqësore nuk është e mundur, një gjykatë në Republikën e Sllovenisë me adresën e regjistruar të ofruesit do të jetë kompetente për zgjidhjen e mosmarrëveshjes.",
    territorialValidityText:
      "Kushtet dhe Rregullat do të zbatohen për të gjithë klientët dhe porositë, pavarësisht nga shteti i qasjes së klientit.",
    temporalValidityText: "Kushtet ligjore zbatohen nga: 19.08.2024 08:52",

    // Cart
    emptyCart: "Shporta juaj është bosh.",
    emptyCartDesc:
      "Nuk ka produkte në shportën tuaj. Vazhdoni me blerjen dhe shtoni produktin në shportë.",
    keepShopping: "Vazhdoni blerjen",
    remove: "Hiq",
    subtotal: "Nëntotali",
    calculatedAtCheckout: "Llogaritet në arkë",
    proceedTocheckout: "Vazhdoni në arkë",
    total: "Totali",
    viewAll: "Shiko të gjitha",
    noProductsJFM:
      "Aktualisht nuk ka produkte 'Vetëm për mua' të disponueshme.",
    advOfShoppingOnPS: "PËRPARËSITË E BLERJES NË PROTEINI.SI",
    giftWithEveryPurchase: "Dhuratë me çdo blerje",
    weAddGiftToEveryPurchase: "Shtojmë një dhuratë me çdo blerje",
    collectLPAndBuyCheaper: "Mblidhni pikë besnikërie dhe blini më lirë",
    payWithPayPal: "Paguani me PayPal",
    pcqaswp: "Paguani në mënyrë praktike, të shpejtë dhe të sigurt me PayPal.",
    secureCardPayments: "Pagesa të sigurta me kartë",
    mastercardVisa: "Mastercard, Visa",
    fastDelivery: "Dorëzimi i shpejtë",
    ordersPlacedBy2PMWillBeShippedTheSameDay:
      "Porositë e bëra deri në orën 14:00 do të dërgohen të njëjtën ditë!",
    freeShipping2: "Transporti falas",
    forPurchasesOver3000MKD: "Për blerje mbi 3000 MKD",

    // profile
    naturalPerson: "Personi fizik",
    address: "Adresa",
    save: "Ruaj",
    saving: "Duke ruajtur",
    enotifications: "E-njoftimet",
    signUpForENews: "Regjistrohu për E-lajme",
    signUpToRecieve: "Regjistrohu për të marrë",
    userAccountCancellation: "Anulimi i llogarisë së përdoruesit",
    userAccountCancDesc:
      "Nëse nuk keni më nevojë për llogarinë tuaj të përdoruesit, mund të kërkoni anulimin dhe fshirjen e të dhënave tuaja. Do të njoftoheni me email kur procesi të përfundojë (2-3 ditë).",
    iWouldLikeToCancelMyAccount: "Dua të anuloj llogarinë time të përdoruesit",
    quicklyCompleteYourPurchase: "Përfundoni shpejt blerjen tuaj",
    createAUserDesc1:
      "Krijoni një llogari përdoruesi me të dhënat që po futni, e cila do t'ju ndihmojë të blini edhe më shpejt në të ardhmen, dhe",
    createAUserDesc2: "filloni të grumbulloni pikë besnikërie me këtë porosi!",
    createYourAccountPassword: "Krijoni fjalëkalimin për llogarinë tuaj",
    confirmPassword: "Konfirmo fjalëkalimin",
    passwordPlaceholder: "Fjalëkalimi duhet të jetë të paktën 8 karaktere",
    passwordPlaceholder2: "Konfirmo fjalëkalimin",
    deliveryAddressIsDifferentFromInvoiceAddress:
      "Adresa e dorëzimit është e ndryshme nga adresa e faturimit",
    deliveryAddress: "Adresa e dorëzimit",
    fullName: "Emri dhe mbiemri",
    enterFullName: "Shkruani emrin dhe mbiemrin",
    enterAddress: "Shkruani adresën",
    enterPostCode: "Shkruani kodin postar",
    enterCity: "Shkruani qytetin",
    enterPhoneNumber: "Shkruani numrin e telefonit",
    homeDelivery: "Dorëzimi në shtëpi (pagesa në dorëzim)",
    deliveryCourierNotice:
      "Dërgesat i dorëzojmë me ELS - Eko Logistic Service MK.",
    paymentMethod: "Metoda e pagesës",
    creditCard: "Kartë krediti",
    orderNote: "Shënim për porosinë",
    orderNoteDesc: "Shtoni kërkesa ose shënime të veçanta për porosinë tuaj...",
    subscribeNote:
      "Jini të informuar për ofertat më të mira, promovimet dhe produktet e reja. Regjistrohuni për gazetën tonë!",
    byCompletingThisForm:
      "Duke plotësuar këtë formular, ju pranoni të merrni gazeta me email.",
    subscribe: "Regjistrohu",
    productsInCart: "Produktet në shportë",
    yourLoyaltyPoints: "Pikët tuaja të besnikërisë",
    onepointonemkd: "1 pikë = 1 MKD zbritje (maks. 50% e shumës totale)",
    apply: "Apliko",
    promotionCode: "Kodi promocional",
    enterPromotionCode: "Shkruani kodin promocional",
    chooseFreeGift: "Zgjidhni një dhuratë falas",
    promotionDiscount: "Zbritje promocionale",
    shortExpiry: "Afat i shkurtër skadimi",
    bestBefore: "Më së miri para",
    promotionBadge: "PROMOCION",
    saleEnds: "Oferta vlen deri më",
    discountApplied: "Zbritja është aplikuar",
    youWillEarn1: "Ju do të fitoni",
    youWillEarn2: "pikë nga kjo",
    youWillEarn3: "blerje pas kryerjes së pagesës",
    pointEarned: "Pikë të fituara",
    delivery: "Dorëzimi",
    pointsDiscount: "Zbritje nga pikët",
    amountForPayment: "SHUMA PËR PAGESË",
    agreeToTheTerms: "Porosit me detyrim pagese. Jam i njohur dhe pajtohem me",
    and: "dhe",
    processing: "Duke përpunuar...",
    placeOrder: "Bëj porosinë",

    orderHistory: "Historia e porosive",
    favouriteProducts: "Produktet e preferuara",
    availableLoyaltyPoints: "Pikët e disponueshme të besnikërisë",
    youWillEarnFromCurrentCart: "Do të fitoni nga shporta aktuale",
    points: "pikë",
    ofOrderTotal: "e totalit të porosisë",
    completeThePurchase: "Përfundo blerjen",
    historyOfLoyaltyPoints: "Historia e pikëve të besnikërisë",
    youHaveNoLoyaltyPointTransactionsYet:
      "Ende nuk keni transaksione me pikë besnikërie.",
    totalEarned: "Totali i fituar",
    redeemed: "Të shlyera",
    noOrdersFound: "Nuk u gjetën porosi",
    startShopping: "Filloni blerjen",
    order: "Porosia",
    viewDetails: "Shiko detajet",
    orderDetails: "Detajet e porosisë",
    loadingOrderDetails: "Duke ngarkuar detajet e porosisë...",
    orderItems: "Produktet në porosi",
    size: "Madhësia",
    deliveryFee: "Tarifa e dorëzimit",
    cancellingOrder: "Duke anuluar porosinë...",
    cancelOrder: "Anulo porosinë",
    pending: "Në pritje",
    paid: "E paguar",
    completed: "E përfunduar",
    noFavoriteProductsYet: "Ende nuk ka produkte të preferuara",

    // landing page
    todaysOffer: "Oferta e sotme",
    aTrustedChoice: "Një zgjedhje e besuar për qëllimet tuaja.",
    shopHere: "Bleni këtu!",
    todaysOfferDesc:
      "Battery Nutrition – cilësi në të cilën mund të mbështeteni, rezultate që mund t'i shihni.",
    noImage: "Nuk ka foto",
    addToCart: "Shto në shportë",
    viewArticle: "Shiko artikullin",
    allProducts: "Të gjitha produktet",
    sortBy: "Rendit sipas",
    mostRecent: "Më të rejat",
    lowestPrice: "Çmimi më i ulët",
    highestPrice: "Çmimi më i lartë",
    bestSellers: "Më të shiturat",
    clearAllFilters: "Pastro të gjithë filtrat",
    bestFromThisCategory: "Më e mira nga kjo kategori",
    bestFromThisCategoryContent: "Nuk ka detaje...",
    nutritionValues: "Vlerat ushqyese",
    ingredients1: "Përbërësit",
    noNutritionInfo: "Nuk ka informacion ushqyes",
    instructionsForUse: "Udhëzimet për përdorim",
    outOfStock: "Nuk ka në magazinë",
    adding: "Duke shtuar...",
    removeProduct: "Dëshironi ta hiqni produktin?",
    product: "Produkti",

    // Admin additional
    adminGallery: "Galeria Admin",
    adminInstagramGallery: "Instagram Admin",
    adminYoutube: "YouTube Admin",
    ourLocations: "Lokacionet tona",
    shops: "Dyqanet",
    gyms: "Partnerët",
    workingHours: "Orari i punës",
    mondayToFriday: "E hënë deri të Premte",
    saturday: "E shtunë",
    sunday: "E diel",
    getDirections: "Merr udhëzime",
    ourShops: "Dyqanet tona",
    partnerGyms: "Partnerët",
    adminPartners: "Partnerët Admin",
    adminAboutCompany: "Rreth Kompanisë Admin",
    adminLanding: "Faqja Kryesore Admin",

    // Variant Manager
    productVariants: "Variantet e produktit",
    addVariant: "Shto variant",
    bulkCreate: "Krijimi në masë",
    flavor: "Shija",
    color: "Ngjyra",
    optionType: "Lloji i opsionit",
    optionTypeHint: "Zgjidhni nëse varianti përfaqëson shije apo ngjyrë.",
    variantOption: "Shije / Ngjyrë",
    colorHint: "p.sh. E zezë, Rozë",
    packaging: "Paketimi",
    basePrice: "Çmimi bazë (MKD)",
    isDefault: "Standard",
    setDefault: "Vendos si standard",
    default: "Standard",
    flavorHint: "Shkruani shijen",
    packagingHint: "Shkruani paketimin",
    comparePrice: "Çmimi i krahasimit (Opsionale)",
    stockQuantity: "Sasia në magazinë",
    sku: "SKU (Opsionale)",
    mainVariantImage: "Fotoja kryesore e variantit (Opsionale)",
    setAsDefaultVariant: "Vendos si variant standard",
    variantName: "Emri i variantit (Opsionale)",
    ingredients: "Përbërësit (Opsionale)",
    nutritionInfo: "Informacioni ushqyes (Opsionale)",
    descriptionOptional: "Përshkrimi (Opsionale)",
    nutritionTableHelperText:
      "* Marrja referuese për një të rritur (8400 kJ/2000 kcal)",
    addRow: "Shto rresht",
    addColumn: "Shto kolonë",
    variantImagesGallery: "Galeria e fotove të variantit",
    addImages: "+ Shto foto",
    uploading: "Duke ngarkuar...",
    variantImageGuidelines:
      "Mund të zgjidhni disa foto në të njëjtën kohë (JPG, PNG, WEBP, Maks 5MB për foto)",
    noVariantImages: 'Ende nuk ka foto. Klikoni "+ Shto foto" për të ngarkuar.',
    setAsMain: "Vendos si kryesore",
    main: "Kryesore",
    dynamicNutritionTable: "Tabela dinamike ushqyese",
    manageColumns: "Menaxho kolonat",
    newColumnName: "Emri i kolonës së re (p.sh. Për 100g)",
    noRowsYet: 'Ende nuk ka rreshta. Klikoni "Shto rresht" për të krijuar.',
    noColumnsYet: 'Ende nuk ka kolona. Klikoni "Shto variant" për të krijuar.',
    uploadingImage: "Duke ngarkuar foton...",
    update: "Përditëso",
    create: "Krijo",
    variant: "Varianti",
    uploadImage: "Ngarko foto",
    editVariant: "Ndrysho variant",
    addNewVariant: "Shto variant të ri",
    editProduct: "Ndrysho produkt",
    createNewProduct: "Krijo produkt të ri",
    finalPrice: "Çmimi përfundimtar",
    saving: "Duke ruajtur...",
    saveNutritionData: "Ruaj të dhënat",
    newRowNamePlaceholder: "Emri i rreshtit të ri (p.sh. Energjia, Proteina)",
    noVariantsYet:
      "Ende nuk ka variante. Klikoni 'Shto variant' për të krijuar një.",
    basePriceWithoutDDV: "Çmimi pa TVSH",
    ddvAmount: "Shuma e TVSH-së",

    //goals
    goals: "Qëllimet",
    goalsDesc:
      "Qëllimi yt, sfida jonë. Proteini.si ka nisur një mision për të sjellë dashurinë për një stil jetese aktiv dhe të shëndetshëm edhe tek ata që ende nuk janë të përfshirë aktivisht në sport. Përveç sportistëve rekreativë dhe profesionistë, dëshirojmë të ndihmojmë këdo në rrugëtimin e tyre drejt arritjes së qëllimeve që lidhen me peshën trupore, masën muskulore, fitnesin, ushqimin ose një mënyrë jetese më të shëndetshme në përgjithësi. A është ndonjë nga qëllimet e renditura më poshtë edhe qëllimi yt?",
    weAreHereForYou: "Atëherë ne jemi këtu për ty!",
    goalsQuestion: "Çfarë qëllimesh dëshiron të arrish?",
    more: "Më shumë",
    improveYourFormAndEndurance: "Përmirëso formën dhe qëndrueshmërinë tënde",
    sports: "Sportet",
    recreationAndOutdoor: "Rekreacion dhe aktivitete në natyrë",
    functionalTraining: "Stërvitje funksionale",
  },
  mk: {
    contactAssistance:
      "Доколку ви треба помош или имате прашања за производите:",
    phoneLabel: "Т",
    emailLabel: "Е",
    workingHours: "Работно време:",
    workingHoursWeekdays: "Понеделник - Петок: 10:00 - 22:00",
    workingHoursWeekend: "Сабота, Недела, државни празници: Затворено",
    businessCooperationTitle:
      "Дали барате нова деловна можност? Дали уживате во спортот и практикувате здрав живот? Тогаш ве покануваме да се придружите на приказната за успех на Proteini.si.",
    businessCooperationImageAlt: "Деловни можности",
    businessCooperationDesc1:
      "Proteini.si SHOP е дел од мрежа на продавници за спортска исхрана, додатоци и облека. Можете да најдете Proteini.si продавници низ Словенија, во земјите на поранешна Југославија и во Австрија. Во нашите продавници ќе најдете пријателски, услужлив и професионално квалификуван продажен персонал кој ќе ви помогне да го изберете вистинскиот производ за вашите цели и вашиот животен стил.",
    businessCooperationDesc2:
      "Во Proteini.si продавниците и Proteini.si веб продавницата можете да најдете само врвни квалитетни производи и брендови како што се Battery Nutrition, Olimp, Nutrend, USN, Ironmaxx и многу други брендови за спортска исхрана, бидејќи сакаме да ви понудиме само најдобро.",
    businessCooperationContact:
      "За повеќе информации ве молиме контактирајте не на",
    faqTitle: "Најчесто поставувани прашања",
    faqShippingTime: "Колку време трае испораката?",
    faqShippingTimeAnswer:
      "Стандардната испорака трае 2-4 работни дена, додека експресната испорака трае 1-2 работни дена.",
    faqReturnProduct: "Може ли да вратам производ?",
    faqReturnProductAnswer:
      "Да, можете да вратите производи во рок од 14 дена од приемот, неотворени и во оригинално пакување.",
    faqTrackOrder: "Како да ја следам мојата нарачка?",
    faqTrackOrderAnswer:
      "Ќе добиете број за следење преку е-пошта откако вашата нарачка ќе биде испратена.",
    faqInternationalShipping: "Дали испорачувате меѓународно?",
    faqInternationalShippingAnswer:
      "Моментално, испорачуваме само во Северна Македонија.",
    faqLoyaltyPoints: "Како да ги искористам моите лојалт поени?",
    faqLoyaltyPointsAnswer:
      "Лојалт поените може да се применат при наплата за моментални попусти.",
    customerSupport: "Корисничка поддршка",
    customerSupportDesc:
      "Клиентите на Protein.si секогаш можат да го проверат статусот на својата нарачка, историјата на купувања и статусот на лојалт поени во нивната корисничка сметка, како и да ги променат своите лични податоци, адреса за достава, лозинка итн.",
    howToSubmitOrder: "Како да испратите нарачка",
    howToSubmitOrderDesc:
      "Кога ќе го пронајдете производот што сакате да го купите, изберете ја количината и кликнете на зеленото копче ДОДАЈ ВО КОШНИЧКА за да го додадете производот во вашата виртуелна кошничка. Ако производот има различни параметри што треба да ги изберете, како големина, вкус итн., треба да ги дефинирате и овие параметри пред да го додадете производот во кошничката. Системот љубезно ќе ве потсети со порака прикажана во горниот десен агол, колкава вредност треба да додадете во вашата кошничка доколку сакате да добиете бесплатна испорака. Можете да продолжите со прелистување за да изберете дополнителни производи, или можете да продолжите со купувањето со кликнување на зеленото копче ЗАВРШИ ГО КУПУВАЊЕТО.",
    basketStep: "1. КОШНИЧКА",
    basketStepDesc:
      "Увидот во вашата кошничка ќе ги открие нејзините содржини, избраните производи со придружните параметри, бројот на собрани лојалт поени со ова купување, заштедените пари и вкупниот износ за плаќање. Ако сè е правилно наведено, можете да продолжите на следниот чекор.",
    promoCodeStep: "2. КОРИСТЕТЕ ПРОМО КОД",
    promoCodeStepDesc:
      "На десната страна можете да ги најдете сите промо кодови кои се моментално активни. Со кликнување на саканиот, кодот ќе се прикаже во празното поле на левата страна. Искористете го кодот со кликнување на копчето ОК. Со секое онлајн купување, може да се користи само еден промо код (комбинација на различни промо кодови не е можна). Не е потребно да го користите кодот, можете слободно да продолжите со вашиот процес на купување дури и без употреба на промо код.",
    freeGiftStep: "3. ИЗБЕРЕТЕ БЕСПЛАТЕН ПОДАРОК ОД PROTEINI.SI",
    freeGiftStepDesc:
      "Во зависност од вредноста на вашата нарачка, системот ви нуди можност да изберете бесплатен подарок што го потврдувате со кликнување на жолтото копче ИЗБЕРИ. Изборот на бесплатен подарок од Proteini.si не е задолжителен и можете да продолжите со вашето купување без да го изберете подарокот.",
    freeShippingStep:
      "4. ЗА ДА ДОБИЕТЕ БЕСПЛАТНА ИСПОРАКА ВИ НЕДОСТАСУВААТ САМО XY ЕУР",
    freeShippingStepDesc:
      "Во овој чекор, системот ќе ви предложи производи во вредност што сè уште ви недостасува за да добиете бесплатна испорака. Ако сакате да го додадете предложениот производ, кликнете на зеленото копче ДОДАЈ ВО КОШНИЧКА. Ќе се отвори нов прозорец со опис на производот, цената, лојалт поените што ги добивате во случај на купување и количината. Кликнете на зеленото копче ПРОДОЛЖИ за да продолжите со купувањето.",
    freeGiftDescription:
      "Кај Proteini.si се стремиме да им понудиме на нашите клиенти широк избор на висококвалитетни производи за спортска исхрана и производи за здрав и активен живот. Ние исто така ги наградуваме нашите клиенти, за да им се заблагодариме што ни укажаа доверба. Во зависност од вредноста на вашата нарачка, можете да изберете од различни бесплатни подароци, како што се нараквици, приврзоци, шејкери, шишиња за вода, пешкири, торби итн. Колку е поголем износот на вашата нарачка, толку е поголема вредноста на вашиот подарок.",
    paymentMethodsTitle: "Ги нудиме следните методи на плаќање:",
    paymentMethodCard:
      "Дебитна или кредитна картичка (Mastercard, Visa, Activa, Maestro)",
    paymentMethodCash: "Плаќање при достава",
    paymentMethodDescription:
      "Давателот издава фактура на траен медиум, со подробен преглед на трошоците и известување до клиентот за тоа како да се откаже од купувањето и да го врати производот, доколку е потребно и можно.",
    paymentMethodStorage:
      "Договорот за купување (нарачка) електронски се чува на сервер достапен за давателот и клиентот, во секое време на неговиот кориснички профил (Мој профил).",
    shippingInformation: "Информации за испорака",
    shippingDesc1: "Нудиме брза и сигурна испорака низ целата држава.",
    shippingDesc2:
      "Сите пратки се испраќаат преку нашиот партнер за курирски услуги ЕЛС - Еко Логистик Сервис МК.",
    shippingDesc3:
      "Порачките може да се платат со кредитна картичка или при достава преку ЕЛС.",
    shippingDesc4:
      "Сите порачки направени во работен ден до 14 часот ќе бидат испратени истиот ден!",
    shippingDesc5: "Бесплатна испорака за нарачки над 3000 денари",
    forWeightLoss: "За слабеење",
    forMuscleMass: "За мускулна маса",
    forMoreEndurance: "За поголема издржливост",
    forHealthAndWellBeing: "За здравје и благосостојба",
    bestSeller: "Најпродавано",
    // Common UI elements
    welcome: "Добредојде",
    hello: "Здраво",
    goodbye: "Пријатно",
    // Home Page
    freeShipping: "Бесплатна достава за нарачки над 3000 МКД",
    exploreOffers: "ПОГЛЕДНИ ПОНУДА",
    findAProduct: "Најди производ",
    language: "Јазик",
    branches: "Продажни места",
    myAccount: "Моја сметка",
    shoppingCart: "Кошничка",
    sportsNutrition: "Спортска исхрана",
    aminoAcids: "СПОРТСКА ИСХРАНА",
    bcaa: "BCAA",
    glutamine: "ГЛУТАМИН",
    hmb: "HMB",
    eaa: "EAA",
    aminoMix: "АМИНО МИКС",
    definition: "ДЕФИНИЦИЈА",
    thermogenics: "ТЕРМОГЕНИЦИ",
    carnitine: "КАРНИТИН",
    creatine: "КРЕАТИН",
    monohydrates: "МОНОХИДРАТИ",
    advancedTypes: "НАПРЕДНИ ФОРМУЛИ",
    protein: "Протеин",
    proteins: "ПРОТЕИНИ",
    energyBoosters: "ПОВЕЌЕ ЕНЕРГИЈА",
    carbohydrates: "ЈАГЛЕХИДРАТИ",
    energyIsotonicDrinks: "ЕНЕРГЕТСКО - ИЗОТОНИЧНИ ПИЈАЛОЦИ",
    energyBars: "ЕНЕРГЕТСКИ БАРЧИЊА",
    energyGels: "ЕНЕРГЕТСКИ ГЕЛОВИ",
    caffeinatedDrinks: "КОФЕИНСКИ ПИЈАЛОЦИ",
    whey: "СУРУТКА",
    eggWhiteProtein: "ПРОТЕИН ОД ЈАЈЦЕ",
    isolate: "ИЗОЛАТ",
    proteinBlends: "ПРОТЕИНСКИ МЕШАВИНИ",
    casein: "КАЗЕИН",
    veganProtein: "ВЕГАН ПРОТЕИН",
    beefProtein: "ГОВЕДСКИ ПРОТЕИН",
    readyToDrink: "ГОТОВИ ПИЈАЛОЦИ",
    proteinBars: "ПРОТЕИНСКИ БАРЧИЊА",
    proteinSnaks: "ПРОТЕИНСКА УЖИНА",
    gainers: "ГЕЈНЕРИ",
    muscleMassFastGain: "БРЗО ГРАДЕЊЕ МУСКУЛНА МАСА",
    muscleMassQualityGain: "КВАЛИТЕТНО ГРАДЕЊЕ МУСКУЛНА МАСА",
    strengthEnergyPump: "СИЛА / ЕНЕРГИЈА / PUMP",
    endurance: "ИЗДРЖЛИВОСТ",
    mentalFocus: "МЕНТАЛЕН ФОКУС",
    hormoneBoosters: "ХОРМОНСКИ ЗАСИЛУВАЧИ",
    tribulus: "ТРИБУЛУС",
    daa: "DAA",
    multiFormulas: "КОМБИНИРАНИ ФОРМУЛИ",
    recovery: "ОПОРАВУВАЊЕ",
    weightLoss: "Слабеење",
    fatBurners: "СОГОРУВАЧИ НА МАСТИ",
    cla: "CLA",
    greenTea: "ЗЕЛЕН ЧАЈ",
    guiltFree: "БЕЗ ГРИЖА НА СОВЕСТ",
    mealReplacement: "ЗАМЕНА ЗА ОБРОК",
    vitamins: "Витамини",
    vitaminC: "Витамин Ц",
    vitaminD: "Витамин Д",
    bComplex: "Б КОМПЛЕКС",
    minerals: "МИНЕРАЛИ",
    magnesium: "МАГНЕЗИУМ",
    zinc: "ЦИНК",
    purpose: "НАМЕНА",
    imuneSystem: "ИМУНИТЕТ",
    bonesAndJoints: "КОСКИ И ЗГЛОБОВИ",
    hairAndSkin: "КОСА И КОЖА",
    digestion: "ВАРЕЊЕ",
    sleep: "СОН",
    antiAging: "ПРОТИВ СТАРЕЕЊЕ",
    stress: "СТРЕС",
    antioxidants: "АНТИОКСИДАНСИ",
    omega3: "ОМЕГА 3",
    collagen: "КОЛАГЕН",
    snacks: "Ужина",
    muesli: "МУСЛИ",
    pancakes: "ПАЛАЧИНКИ",
    pudding: "ПУДИНГ",
    calorieFree: "БЕЗ КАЛОРИИ",
    spreads: "НАМАЗИ",
    oils: "МАСЛА",
    drinks: "ПИЈАЛОЦИ",
    drinksWithCarnitine: "ПИЈАЛОЦИ СО КАРНИТИН",
    instantDrinks: "ИНСТАНТ ПИЈАЛОЦИ",
    accessories: "Опрема",
    trainingEquipment: "ОПРЕМА ЗА ТРЕНИНГ",
    weights: "ТЕГОВИ",
    trainingBandsAndLoop: "ТРАКИ И ЛЕНТИ ЗА ТРЕНИНГ",
    gloves: "РАКАВИЦИ",
    belts: "ПОЈАСИ",
    other: "ДРУГО",
    fightGear: "БОРЕЧКА ОПРЕМА",
    boxingGloves: "БОКСЕРСКИ РАКАВИЦИ",
    handWraps: "ЗАВОИ ЗА РАЦЕ",
    punchingBags: "БОКСЕРСКИ ВРЕЌИ",
    shakers: "ШЕЈКЕРИ",
    bidons: "БИДОНИ",
    bottles: "ШИШИЊА",
    bags: "ТОРБИ",
    towels: "ПЕШКИРИ",
    clothing: "Облека",
    mensClothing: "МАШКА ОБЛЕКА",
    womensClothing: "ЖЕНСКА ОБЛЕКА",
    tShirts: "МАИЦИ",
    pulloversAndZipHoodies: "БЛУЗИ И ДУКСЕРИ СО ПАТЕНТ",
    pantsAndTights: "ПАНТАЛОНИ И ХЕЛАНКИ",
    shorts: "ШОРЦЕВИ",
    pants: "ПАНТАЛОНИ",
    jackets: "ЈАКНИ",
    hoodies: "ДУКСЕРИ",
    tights: "ХЕЛАНКИ",
    sportsTshirtsAndTops: "СПОРТСКИ ГРАДНИЦИ И ТОПЧИЊА",
    kidsClothes: "ДЕТСКА ОБЛЕКА",
    freeShippingOver: "Бесплатна достава над 3000 МКД*",
    youGainLoyaltyPoints: "Собирате лојалти поени со секое купување",
    unparalleledQuality: "Неспоредлив квалитет",
    checkTodaysOffer: "Проверете ја денешната понуда",
    noNewProductsAvailable: "Нема нови производи во моментов.",
    noProductsOnSale: "Нема производи на попуст во моментов.",
    recomendedForYou: "Препорачано за вас",
    rfydesc1:
      "Производи за кои мислиме дека може да ви се допаднат. Ако ни кажете повеќе за себе, ",
    rfydesc2: "ќе ви предложиме соодветни на вашите желби",
    rfydesc3: " Регистрирајте се!",
    registeredUsersHave: "Регистрираните корисници имаат:",
    goalOrientedProducts: "производи според целта",
    exclusiveBenefits: "ексклузивни бенефиции",
    fastOrdering: "брзо нарачување",
    listOfFavourites: "листа на омилени...",
    register: "Регистрирај се",
    registerForABetterExperience: "Регистрирај се за подобро искуство!",
    noRecommendedProducts: "Нема препорачани производи во моментов.",
    noOutletProductsAvailable: "Нема outlet производи во моментов.",
    chooseYourGoal: "Избери ја твојата цел",
    loseWeight: "Слабеење",
    gainMuscleMass: "Добивање мускулна маса",
    improveYourForm: "Подобрување на формата и издржливоста",
    vitalityAsALifestyle: "Виталност како начин на живот",
    showAll: "Прикажи сè",
    showMore: "Прикажи повеќе",
    showLess: "Прикажи помалку",
    voucherAmount: "Износ на ваучерот",
    voucherMinimum: "Минимален износ:",
    whatSportsAreYou: "За кои спортови сте заинтересирани?",
    cycling: "Велосипедизам",
    running: "Трчање",
    teamSports: "Екипни спортови",
    fitnessAndBodybuilding: "Фитнес и бодибилдинг",
    tips: "Совети",
    allTips: "СИТЕ СОВЕТИ",
    events: "НАСТАНИ",
    newProducts: "НОВИ ПРОИЗВОДИ",
    productCountLabel: "производи",
    recommendedOrder: "Препорачано",
    searchSuggestionsHint: "Предложени производи пред да пребарувате",
    northMacedonia: "Северна Македонија",
    news: "Вести",
    womensEnergyStarts: "Женската енергија започнува од внатре",
    whenTheBodyFunctions:
      "Кога телото функционира во рамнотежа, тоа се рефлектира надворешно преку стабилно...",
    liverAndDetoxification:
      "Црн дроб и детоксикација: Како природно да ги поддржите",
    didYouKnowThat:
      "Дали знаевте дека вашето тело се детоксицира 24 часа на ден - дури и...",
    noBakeProteinCheescake: "Протеински чизкејк без печење во тегла",
    doYouEverCrave:
      "Дали некогаш посакувате нешто слатко после оброк или тренинг, но...",
    video: "Видео",
    fitnessMyLife: "Фитнес - Мојот Живот!",
    hiitWorkout: "HIIT ТРЕНИНГ",
    shutUpAndBench: "Запрете и кренете",
    goHardOrGoHome: "Дај сè од себе или си оди дома",
    theUltimateBack: "Ултимативен тренинг за грб",
    readyForSummer: "Подготвени за лето?",
    outlet: "Outlet",
    purchaseProcess: "Процес на купување",
    new: "Ново",
    partners: "Партнери",
    awardsAndCertificates: "Награди и сертификати",
    proteinisi: "#proteinisi",
    shareYourExperience: "Споделете го вашето искуство",
    needHelp: "Потребна ви е помош",
    weAreAvailableForYou:
      "Достапни сме за вас од понеделник до петок помеѓу 8:00 и 16:00 часот",
    phoneNumber: "+389 71 399 036",
    email: "Е-пошта",
    companyAddress: "Адреса на компанијата",
    subscribeToENews: "Претплати се на Е-вести",
    stayInformedAboutCurrent:
      "Останете информирани за тековните промоции и новости",
    enterYourEmailAddress: "Внесете ја вашата е-пошта",
    login: "Најава",
    followUs: "Следете нè",
    aboutProteiniSi: "За Proteini.si",
    aboutTheCompanyProteiniSi: "За компанијата Proteini.si",
    businessCooperation: "Деловна соработка",
    contatto: "Контакт",
    contact: "Контакт",
    theme: "ТЕМА",
    bright: "Светла",
    dark: "Темна",
    customerService: "Корисничка поддршка",
    shipping: "Испорака",
    paymentMethods: "Начини на плаќање",
    freeGift: "Бесплатен подарок",
    loyaltyPoints: "Лојалти поени",
    loyaltyPoints1: "Лојалти поени",
    faq: "ЧПП",
    termsOfService: "Услови за користење",
    generalProvisions: "Општи одредби",
    newInTheShop: "Ново во продавница",
    perServing: "по порција",
    servings: "порции",
    moreAboutRatings: "(повеќе за оцените)",
    quickPurchase: "Брза набавка",
    productsOnSale: "Производи на продажба",
    brands: "Брендови",
    offers: "Понуди",
    upcomingPromotions: "Претстојни акции",
    sale: "Ново",
    recommended: "ПРЕПОРАЧАНО",
    productsInTheOutlet: "Производи во outlet",

    //Profile
    adminPanel: "АДМИН ПАНЕЛ",
    logout: "Одјава",
    myProfile: "Мој профил",
    accessDetails: "Детали за пристап",
    username: "Корисничко име",
    status: "Статус",
    noStatus: "Нема статус",
    changePassword: "Смени лозинка",
    currentPassword: "Тековна лозинка",
    newPassword: "Нова лозинка",
    repeatNewPassword: "Повторете ја новата лозинка",
    billingInformation: "Информации за наплата",
    userName: "Име на корисник",
    edit: "Уреди",

    //Sign in
    signInTo: "Најавете се на proteini.si",
    eMail: "Е-пошта",
    password: "Лозинка",
    signInWithGoogle: "Најави се со Google",
    signInWithFb: "Најави се со Facebook",
    signInWithApple: "Најави се со Apple",
    signInWithPaypal: "Најави се со PayPal",
    forgotPassword: "Заборавена лозинка",
    weCareAndProcess:
      "Се грижиме и ги обработуваме вашите лични податоци во согласност со",
    dontHaveAnAccountYet: "Сè уште немате сметка?",
    proteiniSiAllows: "Сметката на Proteini.si ви овозможува:",
    fasterPurchase: "Побрзо купување",
    exclusiveBenefits1: "Ексклузивни бенефиции",
    trackOrderStatus: "Следење на статусот на нарачката",
    favoriteProductList: "Листа на омилени производи",
    collectAndUseLoyalty: "Собирање и користење на лојалти поени",
    createAnAcc: "Креирај сметка",
    loggingIn: "Најавување",
    failedToFetch: "Неуспешно преземање",
    creationFailed: "Неуспешно креирање",
    creating: "Креирање",

    //Create an Account
    advatagesOfCreating: "Предности на креирање корисничка сметка",
    alreadyHaveAnAccount: "Веќе имате сметка? Најавете се",
    createYourAccount: "Креирајте ја вашата сметка",
    neutralPerson: "Физичко лице",
    company: "Компанија",
    nameAndSurname: "Име и презиме",
    email1: "Е-пошта",
    passwordShouldBeAtLeast: "Лозинката треба да има најмалку 8 карактери",
    confirmYour: "Потврдете ја вашата лозинка",
    quickRegistration: "Брза регистрација со постоечка сметка",
    companyName: "Име на компанија",
    streetName: "Улица и број",
    taxNumber: "Данок број",
    postCode: "Поштенски код",
    city: "Град",
    phone: "Телефон",
    selectACountry: "Избери држава",
    country: "Држава",

    google: "Google",
    FaFacebook: "Facebook",
    apple: "Apple",

    //Privacy Policy
    home: "Почетна",
    about: "За нас",
    services: "Услуги",
    contact: "Контакт",

    // Footer
    copyright: "Сите права се задржани",
    privacyPolicy: "Политика за приватност",
    termsOfService: "Услови за користење",
    footerInfo1: "Спортска исхрана и нутритивни додатоци како",
    footerInfo2: "протеин, амино киселини, витамини, додатоци за слабеење,",
    footerInfo3: "здрави ужина и многу повеќе",
    allRightsReserved: "Сите права се задржани",

    // Modal
    close: "Затвори",
    confirm: "Потврди",
    cancel: "Откажи",

    // Popup
    success: "Успешно!",
    error: "Се случи грешка",
    loading: "Се вчитува...",

    // Language Modal
    selectLanguage: "Избери јазик",
    slovenia: "Словенија",
    europeanUnion: "Европска Унија",
    croatia: "Хрватска",
    serbia: "Србија",
    bosnia: "Босна и Херцеговина",
    montenegro: "Црна Гора",
    macedonia: "Македонија",
    albania: "Албанија",

    // Admin Panel
    id: "ИД",
    image: "Слика",
    name: "Име",
    category: "Категорија",
    grams: "Грами",
    price: "Цена",
    ddv: "ДДВ %",
    priceWithDDV: "Цена + ДДВ",
    quantity: "Количина",
    placement: "Пласман",
    actions: "Акции",
    addNewProduct: "+ Додади нов производ",
    edit: "Уреди",
    delete: "Избриши",

    // Admin Panel - Add/Edit Product Modal
    productName: "Име на производ",
    brand: "Бренд",
    price: "Цена",
    ddvPercentage: "ДДВ процент (%)",
    quantity: "Количина",
    servings: "Порции",
    gPerServing: "Грами по порција",
    gNutrition: "Грами нутриционизам",
    productImage: "Слика на производ",
    otherDescriptionTitle: "Наслов на друг опис",
    otherDescriptionText: "Текст на друг опис",
    nutritionValuesIngredients: "Нутритивни вредности - Состојки",
    nutritionValuesIngredientsDescription: "Опис на нутритивните вредности",
    nutritionInformation: "Нутритивни информации",
    instructionsForUse: "Инструкции за употреба",
    instructionsForUseDescription: "Опис на инструкциите за употреба",
    detailedInstructions: "Детални инструкции",
    cancel: "Откажи",
    addAnotherDescription: "+ Додади уште еден опис",
    categorySelection: "Избор на категорија",
    mainCategory: "Главна категорија",
    selectMainCategory: "Избери главна категорија...",
    subcategory: "Поткатегорија",
    selectSubcategory: "Избери поткатегорија...",
    selectMainCategoryFirst: "Прво изберете главна категорија",
    selectSubcategory: "Избери поткатегорија...",
    selectMainCategoryFirst: "Прво изберете главна категорија",
    selectedCategories: "Избрани категории:",
    categorySelectionInfo:
      "Изберете главна категорија, а потоа изберете поткатегории. Главната категорија ќе биде автоматски вклучена.",
    otherFilters: "Други филтри",
    productManagement: "Управување со производи",
    newInTheShop: "Ново во продавница",
    productsOnSale: "Производи на продажба",
    recommendedForYou: "Препорачано за вас",
    productsInTheOutlet: "Производи во outlet",
    justForMe: "Само за мене",
    mainDescriptions: "Главни описи",
    descriptionPlus: "Опис",
    description: "Опис",
    categoryPlacement: "Поставување во категорија",
    enterProductName: "Внесете име на производ",
    enterCategory: "Внесете категорија",
    clickToUploadImage: "Кликни за прикачување слика",
    processing: "Се обработува...",
    updateProduct: "Ажурирај производ",
    createProduct: "Креирај производ",

    //Privacy Policy MK

    generalProvisions: "ОПШТИ ОДРЕДБИ",
    dataOfTheController: "Податоци на Контролорот",
    controllerDescription:
      "Контролорот е тој што управува со личните податоци и ги одредува целите и средствата за обработка на личните податоци. Доколку овие услови и одредби наведуваат повеќе контролори, тоа значи дека тие заеднички ги одредуваат целите и методите на обработка на вашите лични податоци (заеднички контролори).",
    controllerOfUsersData: "Контролорот на личните податоци на корисниците е:",
    legalEntityName:
      "Име на правното лице: Proteini.si, trgovina, storitve in proizvodnja d.o.o.",
    legalEntityAddress: "Адреса на правното лице: Ulica heroja Verdnika 22",
    postcodeAndPlace: "Поштенски код и место: 4270 Jesenice, Словенија",
    vatNumber: "ДДВ број: SI 44085206",
    registrationNumber: "Регистарски број: 2024691000",
    contactEmail: "Е-пошта за контакт: info@proteini.si",
    contactPhone: "Телефонски број за контакт: +386 (0)40 248 248",
    entryData:
      "Податоци за внесување во регистарот или други јавни евиденции: 18.11.2004",
    dataOfTheProcessor: "Податоци на Обработувачот",
    processorDescription:
      "Обработувачот на лични податоци е оној што обработува лични податоци во име на Контролорот. Обработувачот може да обработува само лични податоци само за целите утврдени во документирани инструкции од Контролорот. Нашите обработувачи ги обработуваат личните податоци на корисниците во согласност со важечкото законодавство, врз основа на постоечки договорен однос кој ги регулира сите области на обработка.",
    processor1:
      "Обработувач: Računalniške storitve, Matej Milošević s.p. Zgornje Pirniče 119B 1215 Medvode Регистарски број: 6924638000",
    processor2:
      "Обработувач: POŠTA SLOVENIJE d.o.o. Slomškov trg 10, Maribor, 2000 Регистарски број: 5881447000",
    processor3:
      "Обработувач: DPD d.o.o. KURIRSKA IN PAKETNA DISTRIBUCIJA, Celovška cesta 492 1210 Ljubljana Регистарски број: 1966812000",
    processor4:
      "Обработувач: GE-KO, MAJA DOLŽAN S.P. Cesta Toneta Tomšiča 71, 4270 Jesenice Регистарски број: 8732043000",
    processor5:
      "Обработувач: EDITOR Spletne komunikacije d.o.o. Velika pot 29 5250 Solkan Регистарски број: 1648098000",
    website: "Веб-страница",
    privacyPolicyIntendedFor:
      "Политиката за приватност е наменета за корисници или клиенти преку веб-страницата или веб-страниците на Контролорот или Давателот на услуги:",
    legislation: "Законодавство",
    slovenianAndEuropeanLegislations:
      "Словенечките и европските законодавства се користат за оценка на оваа политика за приватност.",
    privacyPolicyPreparedAccordingTo:
      "Оваа политика за приватност е подготвена според Законот за заштита на лични податоци (ZVOP-2, Службен весник на РС, бр. 163/22 и измен.), Регулативата (ЕУ) 2016/679 на Европскиот парламент и Советот од 27/04/2016 во врска со заштитата на поединците при обработката на лични информации и слободниот проток на такви информации и за укинување на Директивата 95/46/ЕЗ (Општа регулатива за заштита на податоци, GDPR), Законот за електронски комуникации (ZEKom-2, Службен весник на РС, бр. 133/22 и измен.), и друго словенечко и европско законодавство кое ги регулира овие области.",
    legalPrinciples: "Правни принципи",
    controllerAndProcessorsRespect:
      "Контролорот и нивните обработувачи ги почитуваат општите принципи поврзани со обработката на личните податоци на корисниците:",
    principle1:
      "Ние ги обработуваме личните податоци на корисниците на легален, фер и транспарентен начин.",
    principle2:
      "Ние собираме лични податоци за цели кои се однапред утврдени, експлицитни и легални, и не ги обработуваме понатаму податоците за други цели, освен за цели на научно или историско истражување или статистика под одредени услови.",
    principle3:
      "Ние ги обработуваме личните податоци во најмала можна мера и за целите на обработката.",
    principle4:
      "Ние се грижиме обработените лични податоци да бидат точни и редовно ажурирани, при што ги коригираме или бришеме неточните податоци.",
    principle5:
      "Ние ги чуваме личните податоци само онолку долго колку што е потребно за целите на обработката.",
    principle6:
      "Ние обезбедуваме адекватна заштита на личните податоци, која вклучува спречување на неовластена или незаконска обработка и ненамерно губење, уништување или оштетување на податоците, со спроведување на соодветни технички и организациски мерки.",
    definitionsOfTerms: "Дефиниции на поими",
    privacyPolicyApplies:
      "Политиката за приватност се применува на договори склучени преку комуникација на далечина, кога личните податоци се внесуваат директно на веб-страницата на контролорот или се добиваат преку размена на е-пошта или други споредливи канали за комуникација на давателот на услуги. Исто така се применува и на други форми на користење на веб-страницата каде корисникот внесува лични податоци (на пр., претплата на билтен, јавни објави) на веб-страницата на контролорот.",
    personalDataDefinition:
      "Лични податоци се однесува на секоја информација поврзана со идентификувано или идентификувачко лице кое е физичко лице. Идентификувано лице е некој чии лични податоци се идентификувани и обработени според целите утврдени од Контролорот.",
    identifiableIndividual:
      "Идентификувачко лице е некој кој може директно или индиректно да се идентификува и чии лични податоци може да се обработуваат според целите утврдени од Контролорот.",
    userDefinition:
      "Корисник е поединец кој е физичко лице чии лични податоци се обработуваат врз основа на правна или договорна основа што постои помеѓу контролорот и тој поединец, или врз основа на експлицитна согласност дадена од поединецот на контролорот, или врз основа на легитимните интереси на контролорот.",
    controllerDefinition:
      "Контролорот ги одредува целите и средствата за обработка во рамките на нивната регистрирана дејност и/или законски овластувања. Корисникот однапред е информиран кои се Контролорот и Обработувачот на нивните лични податоци.",
    processorDefinition:
      "Обработувачот ги обработува личните податоци на поединци во име на Контролорот, според нивните инструкции, и во рамките на легитимните цели и средства за обработка. Контролорот му обезбедува на корисникот податоци за Обработувачите на нивните лични податоци во оваа Политика за приватност.",
    subprocessorDefinition:
      "Под-обработувачот ги обработува личните податоци на поединци во име и според инструкциите на Обработувачот во рамките на легитимните цели и средства за обработка. Под-обработувачот е директно одговорен кон Обработувачот, а Обработувачот е директно одговорен кон Контролорот.",
    processingOfUsersPersonalData: "Обработка на Лични Податоци на Корисниците",
    processingDefinition:
      "Обработката на лични податоци се однесува на секоја операција или збир на операции извршени врз лични податоци или збирки на лични податоци, без разлика дали со автоматизирани средства или не, како што се собирање, евидентирање, организирање, структурирање, чување, прилагодување или менување, пронаоѓање, консултирање, користење, откривање со пренос, дистрибуирање или на друг начин ставање на располагање, усогласување или комбинирање, ограничување, бришење или уништување.",
    controllerMayProcessOnlyIf:
      "Контролорот може да обработува лични податоци само ако постои соодветна правна основа за обработката. Контролорот ги обработува личните податоци на корисниците исклучиво за цели кои се јасно дефинирани и усогласени со важечкото законодавство. За секоја цел на обработка, контролорот обезбедува транспарентност и ги информира корисниците за:",
    processingContent1: "1. содржината на целта на обработка,",
    processingContent2: "2. видот на личните податоци што се обработуваат,",
    processingContent3: "3. правната основа за обработка, и",
    processingContent4: "4. периодите на чување.",
    ifControllerProcessesForNewPurposes:
      "Ако контролорот обработува лични податоци за нови цели кои не се компатибилни со постоечката правна основа или не се засноваат на експлицитна согласност:",
    newPurposes1:
      "1. контролорот му обезбедува на корисникот целосни информации однапред, и",
    newPurposes2:
      "2. добива нова експлицитна согласност ако обработката се заснова на таква согласност.",
    controllerEnsuresPurposes:
      "Контролорот обезбедува сите цели на обработка да бидат во согласност со принципите на минимизирање на податоците, безбедност и приватност и дека личните податоци се обработуваат само до степен потребен за постигнување на наведената цел.",
    retentionPeriodsForPersonalData: "Периоди на Чување на Лични Податоци",
    retentionDescription:
      "Контролорот ги чува личните податоци на корисниците во форма што овозможува идентификација на корисниците само онолку долго колку што е потребно за да се исполнат целите за кои податоците се собрани или понатаму обработени, или за да се усогласат со законските обврски. По истекот на периодот на чување, контролорот ги брише, анонимизира или архивира податоците, освен ако постојат други правни основи за понатамошна обработка.",
    retentionPeriodsSpecified:
      "Периодите на чување на лични податоци се специфицирани за секоја цел на обработка, заедно со правната основа за обработка и видот на личните податоци што се обработуваат.",
    disclosureAndTransfer: "Откривање и Пренос на Лични Податоци",
    controllerDisclosesInFollowingCases:
      "Контролорот ги открива личните податоци на корисниците во следниве случаи:",
    disclosureRequiredByLaw: "1. Откривање Задолжително по Закон:",
    disclosureRequiredByLawText:
      "Контролорот може да открива лични податоци на трети страни само кога тоа се бара со закон (на пр., судски налози, барања од инспекциски органи или други државни власти). Откривањето се врши само до степен потребен за исполнување на законските обврски.",
    transferToThirdCountries: "2. Пренос на Податоци во Трети Земји:",
    transferToThirdCountriesText:
      "Контролорот обезбедува податоците да се пренесуваат во трети земји само ако тие обезбедуваат адекватно ниво на заштита на личните податоци во согласност со законодавството или ако постојат соодветни заштитни мерки (на пр., стандардни договорни клаузули или обврзувачки корпоративни правила).",
    disclosureToContractualProcessors:
      "3. Откривање на Договорни Обработувачи:",
    disclosureToContractualProcessorsText:
      "Контролорот може да открива лични податоци на договорни обработувачи кои обезбедуваат услуги на контролорот (на пр., ИТ поддршка, маркетинг агенции, сметководство). Таквите обработувачи дејствуваат само според инструкциите на контролорот, и се обезбедуваат соодветни безбедносни мерки за заштита на податоците на корисниците.",
    useOfCookies: "Употреба на Колачиња",
    cookiesNotice:
      "Контролорот им обезбедува на корисниците јасно и видливо известување во врска со употребата на колачиња при посета на веб-страницата. Ова известување е достапно преку посветена врска на истакнато место на веб-страницата, каде корисниците можат да најдат целиот потребен информации, вклучувајќи опции за управување со преференциите за колачиња. Контролорот обезбедува корисниците да имаат јасна опција да ја сменат својата согласност подоцна преку видливо известување или врска на веб-страницата. Корисниците исто така можат да прилагодат или одбијат колачиња при нивната прва посета и се информирани за последиците од одбивањето на колачиња, како што се потенцијални ограничувања во функционалноста или корисничкото искуство (на пр., ограничено работење на одредени функции).",
    cookiesWithoutConsent:
      "Контролорот може да користи колачиња без експлицитна согласност на корисникот ако тие се строго неопходни, потребни за пренос на комуникации преку електронска комуникациска мрежа, или колачиња неопходни за обезбедување на услуга на информациско општество експлицитно побарана од корисникот (на пр., најава на корисничка сметка, купување на производ).",
    cookiesNoticeWithConsent:
      "Во сите други случаи, контролорот обезбедува известување со согласност на корисникот и го информира корисникот за достапните опции за управување со поставките за колачиња. Известувањето ги вклучува следниве информации:",
    cookieInfo1:
      "1. Видовите и имињата на колачињата (на пр., аналитички, рекламни, функционални).",
    cookieInfo2:
      "2. Целта на секое колаче (на пр., следење на сообраќај, овозможување на корпа за купување, таргетирање на реклами).",
    cookieInfo3:
      "3. Времетраењето на чување на секое колаче (на пр., колачиња на сесија, трајни колачиња).",
    userResponsibilities: "Одговорности на Корисникот",
    accuracyAndTruthfulness: "1. Точност и Вистинитост на Податоците:",
    accuracyAndTruthfulnessText:
      "Корисниците се должни да обезбедат сите податоци што ги даваат (на пр., за време на регистрација, нарачка на производи или услуги, претплата на билтени, учество во натпревари или пополнување на контакт формулари) да бидат точни, вистинити и целосни. Употребата на лажни или лични податоци на трети страни без овластување е строго забранета.",
    confidentialityOfCredentials: "2. Доверливост на Акредитивите за Пристап:",
    confidentialityOfCredentialsText:
      "Корисниците мора внимателно да ги чуваат своите акредитиви за пристап, како што се кориснички имиња, лозинки или други идентификациски податоци, и не смеат да ги споделуваат со трети страни. Корисниците се одговорни за сите активности извршени со користење на нивните акредитиви за пристап.",
    prohibitionOfMisuse: "3. Забрана за Злоупотреба:",
    prohibitionOfMisuseText:
      "Злоупотребата на лични податоци, како што е користење на лажни или податоци на трети страни без овластување, лажно претставување или давање лажни информации, е строго забранета. Контролорот го задржува правото да покрене правни постапки против корисниците кои ја прекршуваат оваа одредба.",
    consequencesOfViolations: "4. Последици од Прекршувањата:",
    consequencesOfViolationsText:
      "Во случај на прекршувања, контролорот може да го оневозможи пристапот на корисникот до услугите, да ја избрише неговата сметка и да покрне правни постапки против корисникот што прекршил.",
    publicPostsByUsers: "Јавни Објави од Корисници",
    publicPostsExamples:
      "Контролорот може да дозволи јавни објави од корисници на веб-страницата, како што се:",
    publicPost1: "1. коментирање на објави,",
    publicPost2: "2. објавување на рецензии,",
    publicPost3: "3. учество во натпревари и други активности.",
    publicPostDataText:
      "Јавно објавените лични податоци се доброволно обезбедени од корисникот. Контролорот не ги обработува јавно објавените податоци за ниту една друга цел, освен за овозможување на функционалности поврзани со јавни објави. Контролорот не е одговорен за злоупотреба на јавно објавените податоци од страна на трети страни, бидејќи нема контрола врз таквите дејствија.",
    additionalWarnings: "Дополнителни предупредувања",
    controllerSpecificallyWarns:
      "Контролорот конкретно ги предупредува корисниците за следнава содржина:",
    rightToUnsubscribe:
      "ПРАВО НА ОТКАЖУВАЊЕ: Секоја комуникација за МАРКЕТИНГ ПРЕКУ Е-ПОШТА вклучува јасна и бесплатна опција за откажување. Можете да се откажете од примање маркетинг е-пораки во секое време: 1. со кликнување на линкот 'Откажи се' вклучен во секоја порака, или 2. со поднесување на барање за откажување од примање маркетинг комуникации на адресата за е-пошта info@proteini.si. Секоја МАРКЕТИНГ СМС порака содржи инструкции како да се откажете. Можете да се откажете од примање маркетинг СМС пораки во секое време: 1. со одговарање 'STOP' на примената СМС порака, или 2. со поднесување на барање за откажување од примање маркетинг СМС пораки на адресата за е-пошта info@proteini.si. Процес на откажување за маркетинг СМС пораки: Вашето откажување ќе стапи на сила во рок од 3 работни дена од приемот на вашето барање. По завршувањето на откажувањето, вашите контакт детали веднаш ќе бидат блокирани за цели на маркетинг комуникација и повеќе нема да се обработуваат за такви цели. Откажувањето од маркетинг комуникации не влијае на извршувањето на договорот или на други комуникации кои се строго неопходни за исполнување на вашата нарачка (на пр., потврди за нарачка, известувања за испорака).",
    legislativeBasis: "ЗАКОНОДАВНА ОСНОВА",
    contractualBasis: "Договорна Основа",
    contractualBasisForProcessing:
      "Договорната основа за обработка на лични податоци на корисниците значи дека обработката е неопходна за:",
    contractualBasis1:
      "1. исполнување на договорот чија договорна страна е корисникот на кого се однесуваат личните податоци; или",
    contractualBasis2:
      "2. спроведување на мерки на барање на таков корисник пред склучување на договорот.",
    contractualBasisInfo:
      "Контролорот му обезбедува на корисникот информации за обработката на нивните лични податоци во оваа Политика за приватност и, кога е потребно, со известувања на нивната веб-страница.",
    contractualBasisNoExplicitConsent:
      "Контролорот не бара експлицитна согласност за договорна обработка на личните податоци на корисникот.",
    contractualBasisIfUserFails:
      "Ако корисникот не ги обезбеди сите лични податоци што му се потребни на Контролорот за да ја исполни договорната обврска, Контролорот не може да ја заврши нарачката на корисникот. Контролорот се обврзува да собира и обработува само лични податоци од корисникот во обем потребен за исполнување на договорот.",
    legalBasis: "Правна основа",
    legalBasisText:
      "Контролорот ги обработува личните податоци на корисниците врз основа на легитимна правна основа кога обработката е неопходна за исполнување на законските обврски што се однесуваат на контролорот. Личните податоци се обработуваат исклучиво за целта на исполнување на законските обврски и не се предмет на понатамошна обработка за други цели што се во спротивност со законот.",
    legalObligationsInSlovenia:
      "Во Република Словенија, законските обврски за обработка на одредени лични податоци се примарно дефинирани во:",
    legalObligation1:
      "1. Законот за данок на додадена вредност (ZDDV-1), кој ја пропишува обврската за издавање и чување на фактури;",
    legalObligation2:
      "2. Правилникот за спроведување на Законот за данок на додадена вредност, кој понатаму ја регулира содржината и чувањето на фактури;",
    legalObligation3:
      "3. Законот за даночна постапка (ZDavP-2), кој ги уредува обврските во врска со водењето на евиденција за даночни цели, пропишувајќи дека контролорот мора да ги чува податоците од издадените фактури (вклучувајќи ги личните податоци на корисниците на фактурите) најмалку 10 години по завршувањето на фискалната година на која се однесува фактурата;",
    legalObligation4:
      "4. Законот за компании (ZGD-1), кој специфицира барања за деловните книги и известувањето;",
    legalObligation5:
      "5. Словенечките сметководствени стандарди (SRS), кои ги регулираат обврските за водење на сметководствени евиденции;",
    legalObligation6:
      "6. Законот за сметководство (ZR), кој ги утврдува правилата за чување на деловни документи и евиденции.",
    legalBasisNoExplicitConsent:
      "Контролорот не бара експлицитна согласност од корисникот за обработка на лични податоци врз основа на правни основи.",
    explicitConsent: "Експлицитна Согласност",
    explicitConsentText:
      "Експлицитната согласност служи како правна основа за обработка на лични податоци кога контролорот нема легитимна или договорна правна основа или легитимен интерес за обработка.",
    userConsentValidWhen:
      "Согласноста на корисникот е валидна кога ги исполнува следниве критериуми:",
    consentCriteria1:
      "1. е доброволна, специфична, информирана и недвосмислена изјава за намера, при што корисникот се согласува со обработката на нивните лични податоци за одредена цел;",
    consentCriteria2:
      "2. се обезбедува преку јасна потврда, како што е кликнување на поле за избор (не однапред избрано), потпишување, вербална потврда или друг соодветен метод;",
    consentCriteria3:
      "3. секогаш е одвоена од другите услови или одредби, каде што е технички изводливо.",
    controllerEnsuresInformationPrior:
      "Контролорот обезбедува соодветни информации за корисникот пред добивање на согласност преку следниве методи:",
    consentMethod1:
      "1. Опис на целта: Правно известување кое му претходи на полето за потврда ја специфицира целта на согласност (на пр., 'Сакам да се претплатам на билтенот за да добивам дополнителни информации, совети, промоции и други корисни вести.').",
    consentMethod2:
      "2. Право на повлекување согласност: Јасно наведено во правното известување кое му претходи на полето, додека дополнителните права се разработени во овие услови за приватност (на пр., 'Можете да се откажете од билтенот во секое време.').",
    consentMethod3:
      "3. Директна врска до условите за приватност: Правното известување кое му претходи на полето обезбедува директна врска до овие услови за приватност (на пр., 'Прочитав и се согласувам со овие Услови за приватност.').",
    controllerMaintainsRecord:
      "Контролорот води евиденција за дадените согласности, вклучувајќи информации за тоа кога и како е дадена согласност, за да обезбеди доказ за нејзината валидност во случај на проверка.",
    legitimateInterest: "Легитимен интерес",
    legitimateInterestText:
      "Контролорот може да ги обработува личните податоци на корисниците ако тоа е неопходно за легитимните интереси што ги следи контролорот. Таквата обработка е ограничена на обемот потребен за постигнување на овие легитимни интереси, притоа почитувајќи ги правата и интересите на корисниците.",
    balancingTest:
      "При утврдување на легитимните интереси, контролорот спроведува тест за балансирање за да провери дали:",
    balancingTest1:
      "1. обработката служи за легитимна цел, како што се подобрување на услугата, спречување на злоупотреба, спроведување на правни барања или директен маркетинг;",
    balancingTest2:
      "2. личните податоци се обработуваат во најмала можна мера потребна за постигнување на целта;",
    balancingTest3:
      "3. правата, слободите и интересите на корисникот не ги надминуваат легитимните интереси на контролорот.",
    examplesOfLegitimateInterests:
      "Примери на легитимни интереси што ги следи контролорот вклучуваат, но не се ограничени на:",
    legitimateInterestExample1: "1. спроведување на правни барања;",
    legitimateInterestExample2:
      "2. подобрување на корисничкото искуство преку анализа на однесувањето за оптимизирање на веб-страницата, под услов податоците да се анонимизирани или обработени со минимално влијание врз корисниците;",
    legitimateInterestExample3:
      "3. директен маркетинг со испраќање прилагодени понуди за слични производи или услуги на постоечки клиенти, обезбедувајќи корисниците секогаш да можат да се откажат од таквите комуникации и дека податоците не се користат за некомпатибилни цели.",
    parentalOrGuardianConsent: "Согласност од Родител или Старател",
    parentalConsentText:
      "За обработка на лични податоци на деца под 15-годишна возраст врз основа на согласност на детето, потребно е претходно одобрение од родителите или законските старатели. Контролорот не обработува лични податоци без таква согласност.",
    controllerMayRequestVerification:
      "Контролорот може да побара дополнителна верификација за да се осигура дека согласноста е навистина дадена од родителот или старателот, кога тоа е технички изводливо и сразмерно на ризиците вклучени во обработката на лични податоци:",
    verificationMethod1:
      "1. контролорот бара адреса за е-пошта или телефонски број на родителот/старателот за да испрати барање за согласност; или",
    verificationMethod2:
      "2. Контролорот бара директна потврда преку е-пошта што содржи линк, преку кој родителот/старателот ја потврдува согласноста, или преку телефонски повик за да го потврди идентитетот и согласноста.",
    controllerProcessesChildrenData:
      "Контролорот ги обработува личните податоци на децата исклучиво за специфични, јасно дефинирани и неопходни цели, обезбедувајќи придржување кон принципот на минимизирање на податоците.",
    parentsOrGuardiansResponsible:
      "Родителите или старателите се одговорни за точноста на дадените податоци и за давање согласност кога децата сами внесуваат податоци. Контролорот не е одговорен за неточни или лажни податоци обезбедени од корисниците.",
    personalDataAndPurposes: "ЛИЧНИ ПОДАТОЦИ И ЦЕЛИ НА ОБРАБОТКА",
    fulfillmentOfContractualObligations: "Исполнување на Договорните Обврски",
    fulfillmentText:
      "Контролорот ги обработува личните податоци на корисникот за целта на исполнување на обврските што произлегуваат од склучениот договор, што вклучува обработка на нарачки, испорака на производи или услуги, издавање фактури, решавање на потенцијални поплаки или барања и извршување на други неопходни дејствија за исполнување на договорот. Оваа обработка е од суштинско значење за успешно извршување на договорниот однос помеѓу контролорот и корисникот; затоа, не е потребна експлицитна согласност од корисникот.",
    fulfillmentLegalBasis:
      "ПРАВНА ОСНОВА: Договорна основа ЧУВАЊЕ НА ПОДАТОЦИ: 10 години од издавањето на фактурата",
    fulfillmentPersonalData: "ЛИЧНИ ПОДАТОЦИ:",
    personalDataItem1: "1. Име и Презиме",
    personalDataItem2:
      "2. Адреса на постојано и/или привремено живеење, поштенски код, град и држава",
    personalDataItem3: "3. Е-пошта адреса",
    personalDataItem4: "4. Телефонски број",
    personalDataItem5: "5. Број на трансакциска сметка",
    personalDataItem6: "6. Број на кредитна картичка",
    personalDataItem7: "7. Даночен идентификациски број",
    sendingInfoAndNotifications:
      "Испраќање информации и известувања поврзани со извршување на договорот",
    sendingInfoText:
      "Контролорот ги обработува личните податоци на корисникот за испраќање важни информации поврзани со нарачката или договорот, вклучувајќи потврда за нарачка, известувања за статусот на нарачката и други критични информации неопходни за информирање на корисникот. Таквата комуникација е од суштинско значење за обезбедување соодветна поддршка на корисниците. Експлицитна согласност не е потребна, бидејќи обработката се заснова на легитимниот интерес на контролорот и извршувањето на договорот.",
    sendingInfoLegalBasis:
      "ПРАВНА ОСНОВА: Договорна основа и легитимен интерес ЧУВАЊЕ НА ПОДАТОЦИ: До крајот на договорниот однос, а потоа дополнителни 5 години за доказ за усогласеност",
    respondingToUserInquiries: "Одговарање на прашања од корисници",
    respondingText:
      "Контролорот ги обработува личните податоци обезбедени од корисникот преку контакт формулари или прашања (вклучувајќи преку е-пошта) за целта на одговарање на корисникот и давање релевантни информации за производи, услуги или други деловни прашања. Оваа обработка се заснова на легитимниот интерес на контролорот да обезбеди квалитетна поддршка и помош на клиентите, и не е потребна согласност.",
    respondingLegalBasis:
      "ПРАВНА ОСНОВА: Договорна основа и легитимен интерес ЧУВАЊЕ НА ПОДАТОЦИ: До завршување на комуникацијата, или до 1 година по последниот контакт, освен ако не е склучен договор",
    userRegistration: "Регистрација на корисник",
    registrationText:
      "За користење на одредени функции на веб-страницата или апликацијата, вклучувајќи најавување во онлајн продавницата, пријавување за едукација, настани или услуги, коментирање, поднесување рецензии или слични дејствија, потребна е регистрација. Контролорот обработува лични податоци за целта на овозможување на овие функции, и не е потребна експлицитна согласност бидејќи обработката се заснова на договорната основа.",
    registrationLegalBasis:
      "ПРАВНА ОСНОВА: Договорна основа ЧУВАЊЕ НА ПОДАТОЦИ: До отповикување на корисничката сметка, освен ако законодавството бара подолго чување (на пр., податоците за купување се чуваат 10 години)",
    fulfillingLegalObligations: "Исполнување на законски обврски",
    fulfillingLegalText:
      "Контролорот ги обработува личните податоци на корисниците во согласност со законските барања, вклучувајќи водење сметководствени евиденции, давање податоци на надлежните органи и други форми на обработка барани со законодавството. Оваа обработка се заснова на исполнување на законските обврски и не бара согласност на корисникот.",
    fulfillingLegalLegalBasis:
      "ПРАВНА ОСНОВА: Правна основа ЧУВАЊЕ НА ПОДАТОЦИ: Во согласност со законските периоди на чување (на пр., 10 години за сметководствени податоци)",
    protectionOfLegitimateInterests:
      "Заштита на легитимните интереси на контролорот на податоци или трети страни",
    protectionText:
      "Контролорот обработува лични податоци за да ги заштити своите легитимни интереси, како што се спречување на злоупотреба, обезбедување безбедност на системот или решавање на правни спорови. Оваа обработка се врши до степен потребен за заштита на овие интереси, освен ако не преовладуваат фундаменталните права на корисниците.",
    protectionLegalBasis:
      "ПРАВНА ОСНОВА: легитимен интерес и правна основа ЧУВАЊЕ НА ПОДАТОЦИ: Се додека постои легитимен интерес за обработка (на пр., времетраење на правен спор или период потребен за истражување на злоупотреба), или во случаи на правни постапки, податоците се чуваат во согласност со законските периоди на чување за спроведување или одбрана на правни барања (на пр., периоди на застареност)",
    ipAddress: "IP адреса",
    cookieId: "ID на колаче",
    accessLogs: "Дневници за пристап",
    contentOfCommunication: "Содржина на комуникација",
    directMarketingWithoutConsent:
      "Директен маркетинг без експлицитна согласност",
    directMarketingWithoutText:
      "Контролорот може да испраќа известувања поврзани со директниот маркетинг на своите производи или услуги без експлицитна согласност на корисникот, кога: 1. известувањата се за слични производи или услуги на оние што корисникот веќе ги нарачал или користел, 2. контролорот испраќа известувања врз основа на легитимен интерес, под услов на корисникот да му се даде јасна опција да одбие таква обработка (право на приговор), и 3. контролорот обезбедува пораките да бидат јасни, ненаметливи и во согласност со законот, и дека корисникот може лесно и бесплатно да се спротивстави на обработката во секое време, во согласност со правата што се подетално дефинирани во овие услови за приватност.",
    directMarketingWithoutLegalBasis:
      "ПРАВНА ОСНОВА: легитимен интерес ЧУВАЊЕ НА ПОДАТОЦИ: До 3 години по последниот контакт, освен ако корисникот не се откаже од примање известувања",
    directMarketingWithConsent: "Директен маркетинг со експлицитна согласност",
    directMarketingWithText:
      "За сите известувања што го надминуваат опсегот на легитимен интерес, контролорот мора да добие експлицитна согласност од корисникот. Ова вклучува испраќање промотивни е-пораки, СМС пораки или други маркетинг материјали поврзани со нови производи, услуги или специјални понуди што не се поврзани со минати купувања или договорен однос, или за кои корисникот сè уште не покажал интерес.",
    directMarketingWithLegalBasis:
      "ПРАВНА ОСНОВА: согласност на корисникот ЧУВАЊЕ НА ПОДАТОЦИ: До 3 години по последниот контакт, освен ако корисникот не се откаже од примање известувања",
    profilingForTargetedAdvertising:
      "Профилирање за цели на насочено рекламирање",
    profilingForTargetedText:
      "Профилирањето за цели на насочено рекламирање значи собирање и анализа на податоци за однесувањето на корисникот, како што се посети на веб-страница, кликови, пребарувања или интеракции со содржина на веб-страницата на контролорот. Врз основа на овие податоци, контролорот создава профили на корисници кои овозможуваат прикажување на персонализирани реклами врз основа на интересите на корисникот. Целта е да се зголеми ефективноста на рекламите со достигнување на релевантната целна публика. За таа цел, контролорот користи рекламни колачиња како што се Google Ads, Facebook Pixel, DoubleClick (Google), LinkedIn Ads, Bing Ads (Microsoft) и Twitter Ads.",
    profilingForTargetedLegalBasis:
      "ПРАВНА ОСНОВА: согласност на корисникот ЧУВАЊЕ НА ПОДАТОЦИ: Како што е наведено во известувањето за колачиња за секое поединечно колаче што се користи, но не подолго од две години",
    profilingForTargetedPersonalData: "ЛИЧНИ ПОДАТОЦИ:",
    targetedPersonalData1:
      "1. Идентификатори на уред и корисник: IP адреса, ID на колаче, ID за рекламирање",
    targetedPersonalData2:
      "2. Податоци за однесување на веб-страница: посетени страници, кликови на реклами, време поминато на веб-страницата, производи во напуштена корпа (само во случај на понуди на производи)",
    targetedPersonalData3:
      "3. Податоци за интеракција со рекламна содржина: кликови на реклами, интеракции со друга содржина (прегледи на видеа, слики, итн.)",
    targetedPersonalData4: "4. Геолокација (ако е овозможена)",
    targetedPersonalData5:
      "5. Податоци за уред и прелистувач: тип на уред, оперативен систем, верзија на прелистувач",
    profilingForRemarketing: "Профилирање за цели на ремаркетинг",
    profilingForRemarketingText:
      "Профилирањето за цели на ремаркетинг вклучува собирање податоци за корисници кои веќе ја посетиле веб-страницата или покажале интерес за производите или услугите на контролорот, со цел подоцна да се прикажат персонализирани реклами на други платформи. Целта е да се поттикнат корисниците да се вратат и да завршат купување или да нарачаат услуга. За таа цел, контролорот користи ремаркетинг колачиња како што се Google Ads Remarketing, Criteo, AdRoll, Taboola, Outbrain и TikTok Pixel.",
    profilingForRemarketingLegalBasis:
      "ПРАВНА ОСНОВА: согласност на корисникот ЧУВАЊЕ НА ПОДАТОЦИ: Како што е наведено во известувањето за колачиња за секое поединечно колаче што се користи, но не подолго од две години",
    remarketingPersonalData1: "1. IP адреса",
    remarketingPersonalData2: "2. ID на колаче",
    remarketingPersonalData3:
      "3. Податоци за однесување (историја на прегледи, кликови на содржина, интеракции)",
    remarketingPersonalData4:
      "4. Податоци за купување (минати купувања и интереси)",
    remarketingPersonalData5: "5. Геолокација (ако е овозможена)",
    remarketingPersonalData6: "6. Е-пошта адреса (поврзување со други канали)",
    remarketingPersonalData7:
      "7. Податоци од социјални медиуми (интеракции со реклами од социјални медиуми)",
    executionOfPrizeCompetition: "Спроведување на натпревар за награди",
    executionOfPrizeText:
      "Обработувачот ги обработува личните податоци на корисникот за целта на организирање, спроведување и администрирање на натпреварот за награди, што вклучува проверка на критериумите за подобност за учество, известување на победниците, доделување награди и исполнување на какви било потенцијални даночни или други законски обврски. Оваа обработка е неопходна за спроведување на натпреварот за награди и за исполнување на обврските поврзани со неговата реализација; затоа, не е потребна експлицитна согласност на корисникот.",
    executionOfPrizeLegalBasis:
      "ПРАВНА ОСНОВА: договорна основа и законска обврска ЧУВАЊЕ НА ПОДАТОЦИ: до завршување на натпреварот за награди и доделување на наградите (податоци на учесниците) и до 5 години по завршувањето на календарската година во која е доделена наградата (податоци на победниците)",
    improvingUserExperience: "Подобрување на корисничкото искуство",
    improvingUserExperienceText:
      "Подобрувањето на корисничкото искуство вклучува прилагодување на веб-страницата или услугата за да им се олесни на корисниците навигацијата, да се подобри брзината на вчитување на страницата, да се обезбеди персонализирана содржина, да се интегрираат социјалните медиуми, да се зачуваат изборите на корисниците, да се користи видео и аудио содржина, да се зачуваат информациите за корпата за купување, да се прилагодат профилите на корисниците или да се обезбеди поддршка преку разговор во живо. Ова може да се постигне со следење на активностите на корисниците, обезбедување препораки и прилагодување на содржината врз основа на нивните минати интеракции.",
    improvingUserExperienceLegalBasis:
      "ПРАВНА ОСНОВА: согласност на корисникот ЧУВАЊЕ НА ПОДАТОЦИ: Како што е наведено во известувањето за колачиња за секое поединечно колаче што се користи, но не подолго од две години",
    improvingPersonalData1: "1. Име и Презиме",
    improvingPersonalData2: "2. Е-пошта адреса",
    improvingPersonalData3: "3. Корисничко име",
    improvingPersonalData4: "4. IP адреса",
    improvingPersonalData5: "5. ID на колаче",
    improvingPersonalData6:
      "6. Податоци за однесување (историја на прегледи, кликови на содржина, интеракции)",
    improvingPersonalData7:
      "7. Податоци за купување (минати купувања и интереси)",
    monitoringStatisticalData: "Следење на статистички податоци",
    monitoringStatisticalText:
      "Контролорот на податоци може да собира и анализира податоци за анонимни статистички цели за да го подобри функционирањето на веб-страницата, да го оптимизира корисничкото искуство или да развие нови услуги. Бидејќи оваа обработка не вклучува лични податоци, не е потребна согласност, а обработката се заснова на легитимниот интерес на контролорот.",
    monitoringStatisticalText2:
      "Меѓутоа, ако контролорот користи аналитички колачиња како што се Google Analytics, Hotjar, Matomo, Adobe Analytics, Mixpanel, Crazy Egg, Heap Analytics, Amplitude, Kissmetrics или Yandex Metrica за следење на посетите и однесувањето на корисниците на веб-страницата за статистички податоци и анализа, потребна е претходна согласност од поединецот.",
    monitoringStatisticalLegalBasis:
      "ПРАВНА ОСНОВА: легитимен интерес и согласност на корисникот ЧУВАЊЕ НА ПОДАТОЦИ: Како што е наведено во известувањето за колачиња за секое поединечно колаче што се користи, колачињата на сесија се бришат кога прелистувачот се затвора, додека другите не се чуваат повеќе од една година",
    monitoringPersonalData1:
      "1. Идентификатори на уред и корисник: IP адреса, ID на колаче, ID на рекламер",
    monitoringPersonalData2:
      "2. Податоци за однесување на веб-страница: посетени страници, кликови на реклами, време поминато на страницата, ставки во недовршена корпа (само во случај на понуди на производи)",
    monitoringPersonalData3:
      "3. Податоци за интеракција со рекламна содржина: кликови на реклами, интеракции со друга содржина (прегледи на видеа, слики, итн.)",
    monitoringPersonalData4: "4. Геолокација (ако е овозможена)",
    userRights: "ПРАВА НА КОРИСНИКОТ",
    generalInfoAboutRights: "Општи информации за правата",
    userMayRequest: "Корисникот може да побара од контролорот:",
    right1: "1. пристап до лични податоци,",
    right2: "2. исправка на лични податоци,",
    right3: "3. бришење на лични податоци (право да се биде заборавен),",
    right4: "4. ограничување на обработката на лични податоци,",
    right5: "5. приговор на обработката на лични податоци,",
    right6: "6. преносливост на податоци.",
    additionalRights:
      "Покрај овие шест основни права, корисникот ги има и следниве права:",
    additionalRight7:
      "7. правото да не биде предмет само на автоматизирана обработка, вклучувајќи профилирање;",
    additionalRight8:
      "8. правото да ја повлече согласноста за обработка на нивните лични податоци;",
    additionalRight9: "9. правото да поднесе жалба до надзорниот орган.",
    controllerWillRespond:
      "Контролорот ќе одговори без непотребно одложување, и најдоцна еден месец по приемот на барањето.",
    ifRequestIsComplex:
      "Ако барањето е сложено или контролорот примил повеќе барања, времето за одговор може да се продолжи за дополнителни два месеца. Контролорот ќе го извести корисникот за продолжувањето и причините за одложувањето во рок од еден месец по приемот на барањето.",
    ifControllerDoesNotAct:
      "Ако контролорот не преземе дејство по барањето на корисникот, тој ќе го извести корисникот за причините за не преземање дејство и можноста да поднесе жалба до релевантниот надзорен орган или да побара судска заштита.",
    usersMayAddressRequests:
      "Корисниците можат да ги упатат своите барања директно до контролорот преку податоците за контакт дадени во овие услови за приватност. Контролорот обезбедува правата на корисниците да се упражнуваат бесплатно, освен ако барањата се очигледно неосновани или прекумерни, особено поради нивната повторлива природа. Во такви случаи, контролорот може да наплати разумна такса или да одбие да постапи.",
    rightToAccessData: "Право на пристап до податоци",
    rightToAccessText:
      "Корисникот има право да добие потврда од Контролорот дали се обработуваат лични податоци поврзани со него.",
    controllerShallProvide: "Контролорот ќе ги обезбеди информациите за:",
    accessInfo1: "1. целите на обработката;",
    accessInfo2: "2. категориите на лични податоци што ги обработуваат;",
    accessInfo3:
      "3. обработувачите на кои им се пренесени или откриени личните податоци за обработка;",
    accessInfo4: "4. предвиденото време на чување на личните податоци;",
    accessInfo5:
      "5. правата на корисникот на бришење и исправка на податоци, и на ограничување на обработката или приговор на обработката;",
    accessInfo6: "6. правото да поднесе жалба до надзорно тело;",
    accessInfo7:
      "7. изворите од кои Контролорот ги добил податоците, под услов тие да не се доставени за обработка од корисникот; и",
    accessInfo8:
      "8. постоењето на автоматизирано донесување одлуки, вклучувајќи профилирање.",
    exerciseRightsForm:
      "За да го оствари ова право, корисникот може да го користи овој необврзувачки формулар: Остварување на права - формулар",
    rightToRectification: "Право на исправка",
    rightToRectificationText:
      "Корисникот може да побара од Контролорот без непотребно одложување:",
    rectification1:
      "1. да ги исправи неточните податоци што се однесуваат на корисникот, а кои ги обработува Контролорот (или нивните обработувачи) или",
    rectification2: "2. да ги дополни нецелосните лични податоци.",
    rightToErasure: "Право на бришење",
    rightToErasureText:
      "Корисникот може да побара од Контролорот да ги избрише личните податоци на корисникот без непотребно одложување ако е исполнет барем еден од следниве услови:",
    erasureCondition1:
      "1. Личните податоци повеќе не се потребни за целта за која се собрани или понатаму обработени.",
    erasureCondition2:
      "2. Корисникот ја повлекува согласноста дадена на Контролорот за обработката, при што не постои друга правна основа за обработката.",
    erasureCondition3:
      "3. Корисникот се спротивставува на обработката на нивните лични податоци за цели на јавен интерес или за легитимни интереси на Контролорот или за цели на директен маркетинг и/или профилирање.",
    erasureCondition4: "4. Личните податоци биле незаконски обработени.",
    erasureCondition5:
      "5. Личните податоци мора да се избришат за да се усогласат со законска обврска наметната на Контролорот од законодавството.",
    erasureCondition6:
      "6. Личните податоци биле собрани во врска со нудење услуги на информациското општество на лице помладо од 15 години.",
    rightToRestriction: "Право на ограничување на обработката",
    rightToRestrictionText:
      "Корисникот може да побара од Контролорот ограничување на обработката во еден од следниве случаи:",
    restrictionCase1:
      "1. Точноста на личните податоци е оспорена од корисникот, за период што му овозможува на Контролорот да ја провери точноста на личните податоци.",
    restrictionCase2:
      "2. Обработката на личните податоци на корисникот е незаконска, а корисникот се спротивставува на бришењето на личните податоци и бара ограничување на нивната обработка или употреба наместо тоа.",
    restrictionCase3:
      "3. Контролорот повеќе не ги потребува личните податоци за целите на обработката за кои имал правна основа или експлицитна согласност на корисникот, но тие се потребни за утврдување, остварување или одбрана на правни барања.",
    restrictionCase4:
      "4. Корисникот поднел приговор (право на приговор) во очекување на верификација дали легитимните основи на Контролорот ги надминуваат оние на корисникот на кого се однесуваат личните податоци.",
    whenUserExercisingThisRight:
      "Кога корисникот го остварува ова право, Контролорот може само да ги зачува нивните податоци и да ги обработува само ако:",
    restrictionException1:
      "1. корисникот дал (последователна) експлицитна согласност;",
    restrictionException2:
      "2. потребно за утврдување, остварување или одбрана на правни барања;",
    restrictionException3:
      "3. потребно за заштита на правата на други корисници (физички или правни лица); и",
    restrictionException4:
      "4. потребно за важен јавен интерес на Европската Унија или Република Словенија.",
    rightToDataPortability: "Право на преносливост на податоци",
    rightToDataPortabilityText:
      "Корисникот има право да добие од Контролорот личните податоци што се однесуваат на него, а кои се обработуваат од Контролорот. Контролорот мора да му ги обезбеди на корисникот овие податоци во:",
    portabilityFormat1: "1. структуриран формат;",
    portabilityFormat2: "2. најчесто користен формат;",
    portabilityFormat3:
      "3. формат што може да се чита од машина, кој му овозможува на корисникот да ги чита информациите без никакви проблеми.",
    portabilityRightText:
      "Корисникот, исто така, има право да ги пренесе добиените податоци на друг контролор без попречување од нас, Контролорот, ако:",
    portabilityCondition1:
      "1. податоците се обработуваат врз основа на експлицитна согласност и",
    portabilityCondition2: "2. обработката се врши со автоматизирани средства.",
    portabilityTechnicallyFeasible:
      "Корисникот има право неговите податоци да се пренесат од еден контролор на друг, каде што е технички изводливо.",
    rightToObject: "Право на приговор",
    rightToObjectText:
      "Корисникот може во секое време да се спротивстави на обработката на личните податоци што се однесуваат на него, кога Контролорот ги обработува нивните лични податоци:",
    objectCase1: "1. за јавен интерес или",
    objectCase2:
      "2. за легитимни интереси на Контролорот, вклучувајќи профилирање на овој корисник.",
    controllerShallNotCease:
      "Контролорот нема да престане да ги обработува личните податоци на корисникот на барање на корисникот ако:",
    objectException1:
      "1. тие можат да докажат постоење на неопходни легитимни причини за обработка кои ги надминуваат интересите, правата и слободите на корисникот; или",
    objectException2:
      "2. податоците се потребни за утврдување, остварување или одбрана на правни барања.",
    controllerShallAlwaysGrant:
      "Контролорот секогаш ќе го исполни барањето на корисникот кога корисникот се спротивставува на обработката на нивните лични податоци за цели на директен маркетинг, вклучувајќи профилирање до степен до кој е поврзано со директен маркетинг. Контролорот е должен да ја прекине обработката на таквите лични податоци за цели на директен маркетинг.",
    controllerShallProvideClearInfo:
      "За таа цел, Контролорот ќе, на местата каде што бара од корисникот да се согласи на обработка на нивните податоци за цели на директен маркетинг, му обезбеди на корисникот јасна и одделна информација за можноста дека корисникот може во секое време да ја повлече својата согласност и да се спротивстави на обработката на нивните податоци за овие цели.",
    rightRelatedToAutomatedProcessing:
      "Право поврзано со автоматизирана обработка и профилирање",
    rightRelatedToAutomatedText:
      "Корисникот има право да не биде предмет на одлука заснована само на автоматизирана обработка на нивните податоци, вклучувајќи профилирање, која произведува правни ефекти што се однесуваат на нив или слично значително влијае на нив.",
    userCannotExerciseRight:
      "Корисникот не може да го оствари правото да спречи автоматизирана обработка на нивните податоци, вклучувајќи профилирање, ако одлуката (автоматизирана обработка) е:",
    automatedException1:
      "1. неопходна за склучување или извршување на договор помеѓу корисникот и контролорот (на пр., онлајн корпа за купување),",
    automatedException2:
      "2. дозволена со закон на Европската Унија или Република Словенија и обезбедува соодветни заштитни мерки за правата и слободите, како и легитимните интереси на корисникот (на пр., обработка на податоци од Даночниот орган на Словенија),",
    automatedException3:
      "3. заснована на експлицитна согласност на корисникот (на пр., за директен маркетинг преку автоматизирани системи за испраќање маркетинг пораки).",
    whereExplicitConsentRequired:
      "Каде што е потребна експлицитна согласност, контролорот обезбедува соодветни известувања до корисникот и поле за потврда за експлицитна согласност.",
    rightToWithdrawExplicitConsent:
      "Право на повлекување на експлицитна согласност",
    rightToWithdrawText:
      "Корисникот има право да ја повлече својата согласност за обработка на лични податоци во секое време, ако обработката се заснова на согласност. Повлекувањето на согласноста не влијае на законитоста на обработката што била извршена пред повлекувањето. Повлекувањето на согласноста ќе ја прекине понатамошната обработка на лични податоци за целта за која е дадена согласност.",
    userCanWithdraw: "Корисникот може да повлече:",
    withdrawType1: "1. општа согласност за обработка, или",
    withdrawType2: "2. согласност за обработка за цели на директен маркетинг.",
    generalConsentWithdrawn:
      "Општата согласност може да се повлече со едноставно барање, на пр., преку е-пошта, контакт форма, телефон или кој било друг јасно обезбеден канал што го нуди контролорот. Контролорот мора да го обработи повлекувањето веднаш или најдоцна во рок од еден месец по приемот на барањето.",
    consentForDirectMarketing:
      "Согласноста за обработка за цели на директен маркетинг може да ја повлече корисникот во секое време со барање неговите податоци повеќе да не се користат за директен маркетинг (без оглед на правната основа). Контролорот мора да обезбеди секоја форма на директен маркетинг (на пр., е-пошта, СМС, повици) да му обезбеди на корисникот лесен и бесплатен начин да го оствари правото на повлекување согласност. Секоја маркетинг комуникација мора јасно да вклучува опција за откажување, како што е линк 'Откажи се' или друга соодветна опција што му овозможува на корисникот брзо и лесно да се откаже.",
    controllerEnablesWithdrawal:
      "Контролорот овозможува повлекување на согласноста за директен маркетинг без трошок за корисникот и на ист лесен начин како што е дадена согласноста. Контролорот мора да чува доказ за повлекувањето и да обезбеди податоците повеќе да не се користат за неовластени цели. Контролорот мора да прекине со обработка на лични податоци за цели на директен маркетинг најдоцна 15 дена по приемот на барањето на корисникот. Контролорот мора да го извести корисникот за повлекувањето во писмена форма или преку друг договорен метод во рок од 5 дена од обработката на повлекувањето.",
    rightToLodgeComplaint: "Право на поднесување жалба до надзорниот орган",
    rightToLodgeText:
      "Корисникот има право да поднесе жалба до надлежниот надзорен орган ако смета дека обработката на неговите лични податоци ја нарушува Општата регулатива за заштита на податоци (GDPR) или законодавството на Република Словенија (ZVOP-2).",
    competentAuthority:
      "Во Република Словенија, надлежен орган за заштита на лични податоци е: Информацискиот комесар на Република Словенија Dunajska cesta 22, 1000 Ljubljana Е-пошта: gp.ip@ip-rs.si Веб-страница: www.ip-rs.si",
    userMayFileComplaintIf: "Корисникот може да поднесе жалба ако контролорот:",
    complaintReason1:
      "1. не одговорил соодветно на барање за остварување на правата,",
    complaintReason2: "2. ги прекршил прописите за заштита на лични податоци,",
    complaintReason3:
      "3. не презел соодветни заштитни мерки при обработката на податоците.",
    controllerInformsUser:
      "Контролорот го информира корисникот дека тој, исто така, има право да поднесе тужба до Управниот суд ако смета дека одлуката на Информацискиот комесар не е соодветна.",
    copyright: "АВТОРСКИ ПРАВА",
    contentsAndTexts: "Содржини и текстови",
    contentsAndTextsText:
      "Забрането е копирање или друга употреба на содржините и текстовите на веб-страницата на Контролорот надвор од потребите на соработката помеѓу Контролорот и корисникот, освен ако не е поинаку наведено на веб-страницата. Секое мешање со авторските права се смета за повреда на правата на интелектуална сопственост и може да биде предмет на соодветни правни постапки иницирани од Контролорот.",
    photographsAndAudiovisual: "Фотографии и аудиовизуелни дела",
    photographsAndAudiovisualText:
      "Сите фотографии, видеа и други аудиовизуелни дела објавени на веб-страницата се авторски дела и сопственост и/или во посед на Контролорот и тие не смеат да се копираат или на друг начин користат надвор од потребите на соработката помеѓу Контролорот и корисникот, освен ако не е поинаку наведено на веб-страницата. Секое мешање со авторските права се смета за повреда на правата на интелектуална сопственост и може да биде предмет на соодветни правни постапки иницирани од Контролорот.",
    legalDocument: "Правен документ",
    legalDocumentText:
      "Текстот на оваа Политика за приватност е во сопственост на Контролорот и забрането е да се копира, дистрибуира или на друг начин ракува со овој текст за маркетинг цели без писмена согласност од сопственикот на информацискиот систем кој во име на Контролорот ја одржува Политиката за приватност, освен ако не е дозволено со закон. Секое мешање со авторските права се смета за повреда на правата на интелектуална сопственост и може да биде предмет на соодветни правни постапки иницирани од сопственикот на информацискиот систем, односно компанијата POGOJI.SI, Tjaša Vidic s.p. За дополнителни информации во врска со ова прашање, ве молиме контактирајте: podpora(at)pogoji.si.",
    legalDocumentNote:
      "Оваа одредба не влијае на правата на купувачите или примателите на услуги, кои можат да ги зачуваат или репродуцираат одредбите на овие услови за лични цели.",
    finalProvisions: "ЗАВРШНИ ОДРЕДБИ",
    bindingNature: "Обврзувачка природа",
    bindingNature1:
      "1. Политиката за приватност се применува на сите оние што ја користат веб-страницата и му даваат на Контролорот лични податоци за да може Контролорот да управува со нив и понатаму да ги обработува.",
    bindingNature2:
      "2. Политиката за приватност е обврзувачка за Контролорот, Обработувачите и корисниците во областа на доставување, управување и обработка на личните податоци на корисникот, како и во остварувањето на правата на корисниците и обврските на Контролорот и Обработувачите.",
    bindingNature3:
      "3. Политиката за приватност е составен дел на секоја обработка на лични податоци во согласност со однапред утврдените цели, основите за обработка, согласноста на корисникот и категориите на лични корисници за идна обработка.",
    bindingNature4:
      "4. Корисникот е однапред информиран со оваа Политика за приватност, која е достапна на веб-страницата на Контролорот и на сите формулари и дејствија каде корисникот може да ги достави своите лични податоци за обработка.",
    amendments: "Измени",
    amendments1:
      "1. Контролорот редовно ќе ја ажурира Политиката за приватност според промените во законодавството.",
    amendments2:
      "2. Контролорот редовно и навремено ќе ги известува корисниците за сите промени, во писмена форма со електронска порака.",
    amendments3:
      "3. Контролорот ќе обезбеди архива на промените на Политиката за приватност која ќе им биде достапна на секој корисник по неговото претходно писмено барање доставено до е-пошта адресата за контакт на Контролорот.",
    disputeResolution: "Решавање на спорови",
    disputeResolutionText:
      "Контролорот и корисникот ќе се стремат да ги решат сите потенцијални несогласувања и спорови мирно и со заемна согласност. Ако заемната согласност не е можна, споровите ќе се решаваат од надлежниот суд на седиштето на Контролорот во Република Словенија. Меѓутоа, корисникот со престој во држава членка на Европската Унија може да одлучи да го реши спорот и пред судовите на својата земја на престој. Пред тоа, страните можат да одлучат да користат алтернативни методи за решавање на спорови, како што се посредување или арбитража, во согласност со важечкиот закон.",
    territorialValidity: "Територијална валидност",
    territorialValidityText:
      "Политиката за приватност се применува на сите корисници, без оглед на нивната земја на пристап или престој, и опфаќа сите видови на обработка на лични податоци, без оглед на географската локација на корисникот или контролорот.",
    temporalValidity: "Временска валидност",
    temporalValidityText: "Правните услови се применуваат од: 25.03.2026 18:27",

    // Terms of Service MK//

    // Add these to your translations.mk object in translation.js

    // Terms of Service translations
    termsOfService: "Услови за користење",
    generalProvisions: "ОПШТИ ОДРЕДБИ",
    informationAboutTheProvider: "Информации за давателот на услуги",
    providerOfProductsAndServicesIs: "Давателот на производи и/или услуги е:",
    legalEntityName:
      "Име на правното лице: Proteini.si, trgovina, storitve in proizvodnja d.o.o.",
    legalEntityAddress: "Адреса на правното лице: Ulica heroja Verdnika 22",
    postcodeAndPlace: "Поштенски код и место: 4270 Jesenice, Словенија",
    vatNumber: "ДДВ број: SI 44085206, обврзник на ДДВ",
    registrationNumber: "Регистарски број: 2024691000",
    contactEmail: "Е-пошта за контакт: info@proteini.si",
    contactPhone: "Телефонски број за контакт: +386 40 248 248",
    entryData:
      "Податоци за внесување во регистарот или други јавни евиденции: 18.11.2004",
    additionalWarnings: "Дополнителни предупредувања",
    providerSpecificallyWarns:
      "Давателот на услуги конкретно ги предупредува клиентите за следнава содржина:",
    warningText:
      "Сите информации на веб-страницата proteini.si се само за информативни цели и на ниту еден начин не се наменети како замена за советот и медицинскиот третман на лекарот што посетува или друг медицински персонал, ниту се замена за соодветна медицинска помош. Производите и тврдењата за поединечни производи во овој онлајн продавница не се оценети од државните институции и не се наменети за било каква форма на лекување или превенција на болести. Текстуалните описи и сликовните материјали на поединечни производи се од информативен карактер и некои не се одобрени од Европскиот институт за безбедност на храна (EFSA). Ако земате какви било лекови и/или нутритивни додатоци, консултирајте се со вашиот лекар пред да ги комбинирате со спортска исхрана и додатоци.",
    webSite: "Веб-страница",
    termsAndConditionsIntendedFor:
      "Условите за користење се наменети за клиентот при склучување на договори на далечина преку е-пошта на давателот на услуги или преку веб-страницата на давателот на услуги или веб-страниците:",
    legislation: "Законодавство",
    forTheInterpretation: "За толкување",
    ofTheseTermsAndConditions: "на овие Услови за користење",
    theSlovenianLegislationShallApply:
      "се применува словенечкото законодавство",
    theseTermsAndConditionsHaveBeenDrawnUp:
      "Овие Услови за користење се изготвени во согласност со одредбите на",
    codeOfObligations: "Законот за облигации",
    oz: "OZ",
    electronicBusinessAndElectronicSignatureAct:
      "Законот за електронско работење и електронски потпис",
    zepep: "ZEPEP",
    electronicCommerceMarketAct: "Законот за пазар на електронска трговија",
    zept: "ZEPT",
    electronicCommunicationsAct: "Законот за електронски комуникации",
    zekom2: "ZEKom-2",
    copyrightAndRelatedRightsAct: "Законот за авторски права и сродни права",
    zasp: "ZASP",
    consumerProtectionAct: "Законот за заштита на потрошувачите",
    zvpot1: "ZVPot-1",
    andOtherSectoralNationalAndEuropeanLegislation:
      "и друго секторско национално и европско законодавство.",
    legalPrinciples: "Правни принципи",
    principle1Text:
      "Давателот на услуги ги почитува принципите на законитост и правичност при управувањето со веб-страницата и продажбата на производи/услуги.",
    principle2Text:
      "Давателот на услуги постапува во согласност со чесните практики и при исполнувањето на своите обврски ја зема предвид должната вештина, грижа и марливост.",
    principle3Text:
      "Давателот на услуги го почитува принципот на транспарентност и со овие Услови за користење на јасен и разбирлив начин ги информира клиентите за нивните права.",
    principle4Text:
      "Давателот на услуги го почитува принципот на пропорционалност при обработката на лични податоци. Може да обработува само податоци кои по обем се релевантни за целите за кои се собираат и, доколку е потребно, се обработуваат. Заштитата на личните податоци ја уредува давателот на услуги во Политиката за приватност, објавена на веб-страницата и клиентот е однапред информиран за тоа.",
    useOfWebsite: "КОРИСТЕЊЕ НА ВЕБ-СТРАНИЦАТА",
    meaningOfUse: "Значење на користење",
    theUseOfThisWebsiteMeans: "Користењето на оваа веб-страница значи:",
    usePoint1: "1. Прегледување на содржина на веб-страницата,",
    usePoint2: "2. Пополнување на формулари на веб-страницата,",
    usePoint3: "3. Нарачување на производи или услуги на веб-страницата,",
    usePoint4: "4. Регистрација на клиент,",
    usePoint5: "5. Користење на веб-апликација,",
    usePoint6: "6. Можност на клиентот за коментирање,",
    usePoint7:
      "7. Други видови на користење во однос на содржината на веб-страницата.",
    rulesOfUse: "Правила за користење",
    customersMustUseTheWebsiteResponsibly:
      "Клиентите мора да ја користат веб-страницата одговорно и не смеат да предизвикаат никаква штета на истата. Забрането е:",
    rule1:
      "1. Повреда на авторски права на било кое трето лице или повреда на други права на интелектуална сопственост на трети лица,",
    rule2:
      "2. Повреда на лични права на трети лица (верски, политички убедувања, медицинска состојба и други права заштитени со закон),",
    rule3: "3. Промовирање на омраза или насилнички дејствија,",
    rule4: "4. Поттикнување на земање недозволени супстанции,",
    rule5: "5. Поттикнување на фишинг,",
    rule6:
      "6. Намерно ширење на вируси, црви, недостатоци, тројански коњи, оштетени датотеки, измами или друга содржина или елементи од деструктивна или измамничка природа,",
    rule7:
      "7. Користење на веб-страницата со цел на нелегална размена на датотеки со помош на напредно peer-to-peer вмрежување,",
    rule8:
      "8. Користење на системот за рударење на биткоини и други електронски валути,",
    rule9:
      "9. Извршување на какви било други дејствија што прекршуваат или поттикнуваат дејствија што претставуваат прекршување на правилата за кривични работи или други применливи прописи и права на трети лица.",
    responsibilityOfContent: "Одговорност за содржина",
    responsibleForOperations:
      "одговорен за работењето на веб-страницата и понудената содржина, освен во случај на виша сила или други причини надвор од негова контрола",
    eliminateTechnicalAndSubstantiveErrors:
      "брзо ги отстранува техничките и суштинските грешки",
    providerDoesNotAssumeResponsibility:
      "Давателот на услуги не презема одговорност за каква било штета претрпена од клиентот, освен ако клиентот не докаже спротивно, во следниве случаи:",
    responsibilityCase1:
      "1. ако клиентот неправилно ја користи веб-страницата, и покрај јасните упатства,",
    responsibilityCase2:
      "2. ако клиентот не се придржува до условите за користење на давателот на услуги,",
    responsibilityCase3: "3. мали граматички грешки во текстовите,",
    responsibilityCase4:
      "4. ако веб-страницата не работи 24 часа на ден, 7 дена во неделата во целост (100%),",
    responsibilityCase5:
      "5. линковите до веб-страници на трети страни се само за информативни цели, освен ако не е поинаку наведено (на пр., префрлање на плаќања со кредитни картички, PayPal и други споредливи методи).",
    responsibilitiesForUse: "Одговорности за користење",
    responsibilityForUse1:
      "1. Клиентот треба да ја напушти веб-страницата, доколку не се согласува со Условите за користење.",
    responsibilityForUse2:
      "2. Клиентот ќе ја користи веб-страницата на таков начин што нема да предизвика никаква штета на веб-страницата или на давателот на услуги, било намерно или од невнимание.",
    responsibilityForUse3:
      "3. Клиентот може да го извести давателот на услуги за технички прекини или нефункционирање на веб-страницата или содржината, доколку давателот на услуги не ги признае таквите пречки или нефункционирање.",
    responsibilityForUse4:
      "4. Клиентот е должен да ја напушти веб-страницата ако содржината е погодна само за возрасни (18+ години), за што е предупреден веднаш по пристапувањето на веб-страницата.",
    responsibilityForUse5:
      "5. Во случај на понуда на производи или услуги за кои клиентот мора да биде полнолетен за да нарача, тој е конкретно предупреден за ова пред да ја стави нарачката и не може да ја стави нарачката доколку не ги исполнува возрасните услови.",
    customerRegistration: "Регистрација на клиент",
    registration1:
      "1. При регистрацијата, клиентот дава точни и вистинити податоци. Злоупотреба на лични податоци на било кое трето лице е забранета.",
    registration2:
      "2. Клиентот внимателно ќе ги чува добиеното корисничко име и лозинка и нема да ги проследува на трети лица.",
    registration3:
      "3. Клиентот е свесен дека во случај на лажни податоци или злоупотреба на лични податоци на трето лице, давателот на услуги може да покрне релевантни правни постапки против клиентот.",
    rulesOfCommenting: "Правила за коментирање",
    commentRule1:
      "1. Забрането е навредување на други корисници или клиенти и давателот на услуги на веб-страницата.",
    commentRule2:
      "2. Забранет е говор на омраза, како и секоја форма на дискриминација на другите, пошироката јавност и давателот на услуги.",
    commentRule3:
      "3. Забрането е прикачување на каква било содржина (слики, видео записи) што би можела да навреди други, да претставува говор на омраза, да поттикнува на каква било дискриминација, да промовира допинг или коцкање или што ги прекршува правата на интелектуална сопственост на трети лица или на кој било друг начин ги загрозува правата на трети лица.",
    commentRule4:
      "4. Објавувањето порнографска содржина, поттикнување кривични и други прекршоци, како и други форми на насилничко однесување е забрането.",
    commentRule5:
      "5. Давателот на услуги или неговиот модератор го задржуваат правото, без никакво претходно известување, или привремено или трајно да го спречат пристапот на клиентот до коментарите, доколку истиот ги прекршува овие правила.",
    copyrights: "АВТОРСКИ ПРАВА",
    contentsAndTexts: "Содржини и текстови",
    contentsAndTextsText:
      "Содржините и текстовите на веб-страницата на давателот на услуги не смеат да се копираат или користат на кој било друг начин надвор од потребите на правната соработка помеѓу клиентот и давателот на услуги, освен ако на веб-страницата не е поинаку наведено. Секое мешање во авторските права ќе се смета за повреда на правата на интелектуална сопственост и може да биде предмет на покренување на релевантни правни дејствија.",
    photographsAndAudiovisualWorks: "Фотографии и аудиовизуелни дела",
    photographsAndAudiovisualText:
      "Сите фотографии, видео записи и други аудиовизуелни дела објавени на веб-страницата се авторско право на давателот на услуги и не смеат да се копираат или користат на кој било друг начин надвор од потребите на правната соработка помеѓу клиентот и давателот на услуги, освен ако на веб-страницата не е поинаку наведено. Секое мешање во авторските права ќе се смета за повреда на правата на интелектуална сопственост и може да биде предмет на покренување на релевантни правни дејствија.",
    legalDocument: "Правен документ",
    legalDocumentText:
      "Текстот на овие Услови за користење е во сопственост на давателот на услуги и забрането е да се копира, дистрибуира или на друг начин ракува со овој текст за маркетинг или други цели без писмена согласност од сопственикот на информацискиот систем кој во име на давателот на услуги ги одржува Условите за користење, освен ако не е дозволено со закон. Секое мешање во авторските права се смета за повреда на правата на интелектуална сопственост и може да биде предмет на соодветни правни постапки иницирани од сопственикот на информацискиот систем, односно компанијата POGOJI.SI, Tjaša Vidic s.p. За дополнителни информации во врска со ова прашање, ве молиме контактирајте: podpora(at)pogoji.si.",
    legalDocumentNote:
      "Оваа одредба не влијае на правата на клиентите, кои можат да ги зачуваат или репродуцираат одредбите на овие Услови за користење за лични цели.",
    saleOfProducts: "ПРОДАЖБА НА ПРОИЗВОДИ",
    productOffer: "Понуда на производи",
    productOfferText:
      "Главните карактеристики на производите на давателот на услуги се детално претставени на веб-страницата. Карактеристиките и цените на производите, трошоците и времињата на испорака, можните начини на плаќање, можните попусти или промоции, начините на користење на купони, доколку давателот на услуги ги дозволува, и други информации неопходни за информирани одлуки на клиентот се дефинирани.",
    orderProcedure: "Постапка за нарачка",
    orderProcedureText:
      "Постапката на веб-страницата во рамките на онлајн корпата за нарачка на производи е следнава: Детална постапка за купување е достапна овде: Процес на купување. Детален опис за користење на лојалти поени е достапен овде: Лојалти поени.",
    productPrices: "Цени на производи",
    price1:
      "1. Сите цени се изразени во € (евра). Цените покажуваат дали вклучуваат ДДВ и процентот или дали не вклучуваат ДДВ. Клиентот се информира за вкупната цена на нарачаните производи во кошничката за купување, каде што посебно е наведен и вкупниот износ на ДДВ.",
    price2:
      "2. Покрај цената, клиентот е исто така информиран и за трошокот за испорака (дали е вклучен во цената или се наплаќа дополнително и висината на трошокот).",
    price3:
      "3. Давателот на услуги може да ги менува цените и тие важат веднаш по објавувањето. За веќе потврдени нарачки, цените од нарачката остануваат валидни.",
    price4:
      "4. Попустите и промотивните кодови не се собираат, освен ако не е поинаку наведено.",
    paymentMethods: "Начини на плаќање",
    paymentMethodsText:
      "Давателот на услуги овозможува плаќање на производите со следниве начини на плаќање:",
    paymentMethod1: "1. Платен налог/UPN (про-форма фактура)",
    paymentMethod2:
      "2. Плаќање при испорака (купувачот плаќа на услугата за достава)",
    paymentMethod3: "3. PayPal",
    paymentMethod4:
      "4. Кредитна картичка: Mastercard, Visa, Diners, Activa, Maestro",
    paymentMethod5: "5. Повеќе за начините на плаќање: Начини на плаќање.",
    paymentMethodFooter:
      "Клиентот ја добива фактурата за нарачаните производи физички по приемот на нарачаните производи или во електронска форма на дадената е-пошта. Во случај давателот на услуги да има договор со клиентот за електронско сервисирање на фактури, давателот на услуги не издава во физичка форма. Давателот на услуги ќе ги чува фактурите и договорот за продажба на регистрираната адреса на компанијата во физичка форма 10 години. Фактурата е достапна за секој клиент со претходно писмено барање до е-пошта адресата за контакт или редовната адреса на давателот на услуги.",
    giftVouchers: "ПОДАРОК - ВАУЧЕР",
    giftVouchersText:
      "Давателот на услуги овозможува купување на подарочни ваучери и плаќање со подарочни ваучери. Начинот на купување и плаќање со подарочни ваучери е: Подарочен ваучер може да се купи во онлајн продавницата www.proteini.si и може да се искористи само во онлајн продавницата www.proteini.si. Подарочниот ваучер е сметка издадена од Продавачот во електронска форма против плаќање (Купувачот добива е-пошта што содржи Подарочен ваучер во pdf форма). Секој подарочен ваучер е означен со свој код (единствен сериски број). Купувањето на подарочен ваучер подлежи на истите одредби на овие Услови за користење како и купувањето на други производи, освен начинот на плаќање. Подарочниот ваучер може да се плати само со дебитна/кредитна картичка и paypal. Подарочниот ваучер важи 12 месеци од датумот на издавање, освен ако на подарочниот ваучер не е поинаку наведено. Подарочните ваучери не можат да се заменат за готовина. Ваучерот може да се искористи само во целост. Во случај вредноста на купувањето да е поголема од вредноста на ваучерот, имателот на подарочниот ваучер плаќа разлика. Вкупната вредност на купувањето мора да биде поголема од вредноста на подарочниот ваучер. За да користи подарочен ваучер, Купувачот ги избира саканите производи и ги додава во кошницата. Потоа, тој/таа ги пополнува своите податоци или се најавува на својата онлајн сметка, го избира начинот на испорака и плаќање. Го внесува кодот на подарочниот ваучер во полето за подарочен ваучер и потврдува со кликнување на копчето Зачувај. Купувачот има можност да искористи неколку подарочни ваучери во една нарачка со повторување на процесот за секој број на подарочен ваучер посебно. Со внесување на кодот, вредноста на подарочните ваучери автоматски се одзема од вкупната вредност на нарачката и се прикажува салдото за плаќање. Ако Купувачот ја откаже нарачката или дел од неа без да ги искористи ваучерите, Продавачот ќе ја замени истата вредност на неискористените ваучери со нови ваучери со иста вредност. Продавачот ќе ги врати платените пари на paypal или кредитната картичка на Купувачот. Купувачот само треба да ги достави кодовите на неискористените подарочни ваучери и бројот на нарачката на е-пошта адресата на Продавачот (info@proteini.si).",
    deliveryPeriod: "Период на испорака",
    deliveryPeriodText:
      "Периодот на испорака за производите кои се на залиха ќе биде до 6 работни дена по приемот на плаќањето (или по приемот на нарачката во случај на начин на плаќање: Плаќање при испорака), особено за производите од локалната залиха, но во никој случај не подолго од 30 дена. Во случај на проблеми со испораката на избраниот производ или продолжување на периодот на испорака над 30 дена, давателот на услуги ќе го извести клиентот соодветно, за да може клиентот да определи дополнителен рок за испорака. Ако давателот на услуги не го испорача производот ниту во дополнителниот рок, клиентот може да се повлече од договорот. Ако за клиентот рокот за испорака е суштинска компонента на договорот и тој го известил давателот на услуги за ова, или ако тоа јасно произлегува од околностите, тој може да се повлече од договорот без дополнителен рок за исполнување. Во случај на повлекување од договорот, давателот на услуги ќе му ги врати на клиентот сите направени плаќања.",
    deliveryCosts: "Трошоци за испорака",
    deliveryCosts1:
      "Давателот на услуги ги испорачува производите преку услуга за достава на пратки што доставува до домот на клиентот или на друга дадена адреса. Клиентот е свесен дека трошокот за испорака може да зависи од големината на нарачаниот производ, количината на нарачани производи, избраниот начин на плаќање и избраниот начин на испорака и се одредува според важечката ценовна листа на услугата за достава. Давателот на услуги го информира клиентот за трошокот за испорака во прегледот на нарачката пред клиентот да ја потврди нарачката.",
    deliveryCosts2:
      "Клиентот е свесен и се согласува дека услугата за достава генерално ги испорачува нарачаните производи наутро од понеделник до петок и на адресата што ја дал клиентот при поставување на нарачката.",
    deliveryCosts3:
      "Клиентот е свесен и се согласува дека во случај на неможност да ги подигне производите на дадената адреса, тој/таа може да ги подигне производите на адресата наведена во известувањето за пристигнатата пратка или во согласност со договорот со лицето за достава.",
    deliveryCosts4:
      "Во случај на неоправдано неприфаќање на пратката, така што истата се врати до давателот на услуги, давателот на услуги го задржува правото да ја оневозможи можноста за избор на начин на плаќање при испорака за таков клиент при понатамошни купувања, со цел да се избегнат дополнителни трошоци што предизвикуваат деловна штета.",
    deliveryCosts5:
      "Детален опис на трошоците за испорака и времето на достава, во зависност од избраниот начин на испорака и земјата, е достапен овде: Трошоци за испорака и Време на достава.",
    limitsOfLiability: "Граници на одговорност",
    limitsOfLiabilityText:
      "Ризикот од загуба или оштетување на купените производи преминува од давателот на услуги на клиентот кога производите се физички примени од клиентот или кога производите се примени од трета страна различна од услугата за достава (превозник) назначена од клиентот за целите на прифаќање на испорачаните производи. Ако пакувањето е видливо оштетено, клиентот може да одбие да ги прими испорачаните производи. Клиентот исто така може да фотографира оштетено пакување и да го извести давателот на услуги за тоа, но не е должен да го стори тоа. Давателот на услуги е одговорен за испорака на производите во совршена состојба, во договорената количина и во договореното време, како и за предавање на сета потребна придружна документација додека клиентот не ги преземе производите.",
    productConformityWarranty: "Гаранција за усогласеност на производот",
    warranty1:
      "Во случај на недостаток на усогласеност на производите, клиентот има два месеци од моментот кога забележал недостаток на усогласеност да го извести давателот на услуги. Во случај клиентот да не го извести давателот на услуги во рок од два месеца од моментот кога забележал недостаток на усогласеност, тој/таа не може да ги оствари гарантните барања. Исто така, клиентот не може да ги оствари гарантните барања по истекот на две години од купувањето.",
    warranty2:
      "Клиентот може прво да побара од давателот на услуги да го поправи или замени производот со нов производ без недостатоци. Во овој случај, клиентот мора да му го стави производот на располагање на давателот на услуги. Остварувањето на барањата за усогласеност на производот е бесплатно за клиентот, давателот на услуги ги сноси сите потребни трошоци (испорака, транспорт, трошоци за работна сила и материјали).",
    warranty3:
      "Давателот на услуги мора да го исполни барањето во разумен рок, кој не смее да надмине 30 дена. Давателот на услуги може да го продолжи овој рок за најмногу 15 дена, под услов да се исполнети законските услови, а клиентот мора да биде известен за продолжувањето пред истекот на рокот од триесет дена.",
    warranty4:
      "Давателот на услуги го задржува правото да го одбие барањето на клиентот за поправка или замена на производот во случај кога поправката или замената не е можна, или ако поправката или замената би претставувала несразмерно висок трошок за давателот на услуги во однос на околностите на конкретниот случај на беспрекорност на купениот производ. Во овој случај, клиентот може да бара намалување на куповната цена или да се повлече од договорот.",
    warranty5:
      "Во случај кога поправката или замената не е можна или не е успешна и поминале повеќе од 30 дена од купувањето, клиентот може да бара намалување на куповната цена сразмерно на недостатокот на усогласеност на производот (намалена вредност на производот во споредба со вредноста ако производот бил без недостатоци), или да се повлече од договорот. Во случај на барање за намалување на куповната цена, давателот на услуги ќе врати дел од куповната цена во рок од осум дена од приемот на барањето. Во случај на повлекување од договорот, давателот на услуги ќе ја врати платената сума најдоцна осум дена по приемот на производот или по приемот на доказ дека клиентот му го испратил производот на давателот на услуги. Ако давателот на услуги докаже дека недостатокот на усогласеност на производот е само незначителен, клиентот не може да се повлече од договорот.",
    warranty6:
      "Во случај кога поминале помалку од 30 дена од купувањето, клиентот не треба прво да бара замена или нов производ без недостатоци, туку има право да се повлече од договорот. Тој го известува давателот на услуги за ова со изјава.",
    warrantyClaims: "Гарантни барања",
    warrantyClaimsText:
      "Клиентот може да даде известување или изјава за остварување на барањата за обезбедување усогласеност на производите усно во седиштето на давателот на услуги или писмено на е-пошта адресата или адресата на давателот на услуги, со забелешка Гарантни барања:",
    warrantyClaimsEmail: "Е-пошта: info@proteini.si",
    warrantyClaimsAddress:
      "Адреса: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Словенија",
    warrantyClaimsMustInclude:
      "Известувањето или изјавата за остварување на барањата за обезбедување усогласеност на производите мора да содржи:",
    warrantyClaim1: "1. контакт информации на клиентот,",
    warrantyClaim2:
      "2. точен опис на производот или производите за кои клиентот остварува гарантни барања,",
    warrantyClaim3:
      "3. клиентот мора точно да го опише недостатокот на усогласеност што го остварува со барањето,",
    warrantyClaim4:
      "4. клиентот мора да приложи фактура или друг доказ, со кој докажува дека го купил производот од давателот на услуги,",
    warrantyClaim5:
      "5. давателот на услуги може да побара дополнителни објаснувања или докази од клиентот со цел правилно да ги провери изјавите на клиентот за недостатокот на усогласеност на стоката, на пример: начинот на користење на производот, соодветноста на следење на упатствата на давателот на услуги за употреба или други релевантни факти.",
    guarantees: "Гаранции",
    guarantees1:
      "При продажба на производи каде што гаранцијата е задолжителна, давателот на услуги му предава и гарантен лист на клиентот најдоцна при испораката на производите, гарантирајќи дека производот ќе работи беспрекорно најмалку една година од датумот на купување (задолжителна гаранција) или подолго ако гаранцијата е за подолг период (доброволна гаранција).",
    guarantees2:
      "Клиентот може да ја оствари гаранцијата против гарантот, т.е. давателот на услуги (продавач на производот) или производителот на производот или овластен сервис.",
    guarantees3:
      "Ако производот не ги исполнува спецификациите или ги нема својствата наведени во гарантниот лист, клиентот може прво да побара корекција на недостатоците. Доколку недостатоците не се коригираат во рок од 30 дена од денот кога гарантот ќе го прими барањето на клиентот за корекција на недостатоците, гарантот мора да го замени производот со идентичен, нов и беспрекорен производ бесплатно за клиентот. Гарантот може да го продолжи овој рок за најмногу 15 дена, под услов да се исполнети законските услови, а клиентот мора да биде известен за продолжувањето пред истекот на рокот од 30 дена.",
    guarantees4:
      "Во случај кога гарантот не го поправи или замени производот во овие рокови, клиентот може да бара враќање на целата куповна цена или да бара сразмерно намалување на куповната цена, кое ја зема предвид сразмерноста на намалувањето на вредноста на производот во споредба со вредноста ако производот немал недостаток.",
    guarantees5:
      "Во случај кога поминале помалку од 30 дена од купувањето, клиентот не треба прво да бара замена или нов производ без недостатоци кога ја остварува гаранцијата, туку има право да се повлече од договорот.",
    guarantees6:
      "Во случај кога гарантот не му обезбеди на клиентот заменски производ за привремена употреба за време на поправката или замената на производот, клиентот има право да бара штета што ја претрпел бидејќи не можел да го користи производот од моментот кога побарал поправка или замена до моментот кога гарантот ја исполнил својата обврска.",
    guarantees7:
      "Сите трошоци поврзани со остварување на гаранцијата ги плаќа гарантот.",
    guaranteeClaims: "Остварување на гаранција",
    guaranteeClaimsText:
      "Упатствата за остварување на гаранции се наведени во гарантниот лист. За дополнителни информации или објаснувања, или за остварување на гаранцијата од давателот на услуги, клиентот може да напише на е-пошта адресата или адресата на давателот на услуги, со забелешка Остварување на гаранција:",
    guaranteeClaimsEmail: "Е-пошта: info@proteini.si",
    guaranteeClaimsAddress:
      "Адреса: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Словенија",
    withdrawalFromContract: "Повлекување од договорот",
    withdrawal1:
      "1. Клиентот може да се повлече од договорот (купувањето) во рок од 14 дена без наведување причина.",
    withdrawal2:
      "2. Рокот за повлекување истекува за 14 дена од денот кога клиентот ќе добие физички посед на производот или наместо клиентот тоа го добие трето лице кое не е превозник и е назначено за таа цел од клиентот. Ова значи во рок од 14 дена од приемот на производот (се смета датумот на испорака на потврдата за прием). За договори во врска со испорака на стоки, составени од неколку делови или пратки, рокот за испорака започнува кога клиентот ќе добие физички посед на последната пратка или дел или трето лице го добие наместо клиентот кое не е превозник и е назначено за таа цел од клиентот.",
    withdrawal3:
      "3. Ако клиентот се повлече од договорот, давателот на услуги мора, без непотребно одложување и во секој случај не подоцна од 14 дена од денот на приемот на известувањето за повлекување од договорот, да ги врати сите примени плаќања, вклучувајќи ги и трошоците за испорака. Давателот на услуги го врши враќањето со истиот начин на плаќање како што е користен при извршувањето на оригиналната трансакција, освен ако поинаку не е договорено со клиентот писмено (на пр. кредит или која било друга форма на надомест).",
    withdrawal4:
      "4. Давателот на услуги може да го задржи плаќањето додека не ги прими вратените производи или додека клиентот не испрати доказ за испраќање на вратените производи, во зависност од тоа што ќе се случи порано. Клиентот ги враќа производите без непотребно одложување и во секој случај најдоцна 14 дена од денот кога клиентот го известил давателот на услуги за повлекувањето од договорот. Рокот ќе се земе предвид, ако производите се испратени назад пред истекот на рокот од 14 дена. Директните трошоци за враќање на стоката ги сноси клиентот.",
    withdrawal5:
      "5. Во случај кога вратениот производ е оштетен или неговата вредност е на кој било друг начин нарушена, клиентот е одговорен за намалувањето на вредноста на производот ако намалувањето на вредноста е резултат на однесување што не е нужно неопходно за да се утврди природата, својствата и функционирањето на производот.",
    withdrawalNoRight:
      "Клиентот е запознаен и се согласува дека при купување на нашите производи тој/таа не може да го оствари правото да се повлече од договорот во рок од 14 дена без наведување причина за следниве добра/производи:",
    noRight1:
      "1. Запечатени добра, кои не се соодветни за враќање поради заштита на здравјето или хигиенски причини, ако купувачот ја отворил заптивката по испораката.",
    noRight2:
      "2. Производи, кои поради својата природа се неразделно измешани со други производи.",
    noRight3:
      "3. Алкохолни пијалаци, чија цена е договорена при влегување во договорот за продажба и кои можат да се испорачаат по 30 дена и нивната реална вредност зависи од пазарните флуктуации на кои компанијата нема влијание.",
    noRight4: "4. Производи купени на јавни аукции.",
    noRight5:
      "5. Производи за кои купувачот изречно побарал посета на операторот дома за итна поправка или одржување. Ако при таква посета операторот врши и дополнителни услуги, не барани изречно од купувачот, или испорачува стоки што не претставуваат резервни делови, потребни за одржување или поправка, купувачот за такви дополнителни услуги и стоки има право да се повлече од договорот.",
    noRight6:
      "6. Прилагодени производи: производи направени според точни упатства на купувачот и прилагодени на неговите/нејзините лични потреби.",
    noRight7:
      "7. Производи што брзо се расипуваат или имаат краток рок на траење.",
    noRight8:
      "8. Запечатени аудио или видео записи и компјутерски софтвер, ако купувачот ја отвори безбедносната заптивка по испораката (се однесува и на кодовите за активирање на софтверските пакети при преземање и други споредливи програми и услуги).",
    noRight9:
      "9. Весници, периодични списанија или списанија, освен договори за претплата за набавка на такви публикации.",
    noRight10:
      "10. Производи чија цена зависи од пазарни флуктуации, на кои компанијата нема влијание и кои можат да се појават во рокот за повлекување од договорот.",
    withdrawalNoRightNote:
      "Оваа одредба не влијае на одредбите за гаранција, гарантен лист и/или рекламации, кои клиентот може да ги оствари во согласност со овие Услови за користење.",
    enforcementOfWithdrawal: "Остварување на повлекување од договорот",
    enforcementOfWithdrawalText:
      "Правото на повлекување може да го остварат физички лица. За да го оствари правото на повлекување од договорот, клиентот мора да го извести давателот на услуги со недвосмислена изјава (советуваме писмено) за својата одлука за повлекување од овој договор. Ова може да се направи со испраќање на писмо по редовна пошта (се препорачува препорачано писмо) или електронска пошта на адресите наведени подолу или го известува давателот на услуги усно (во овој случај, товарот на докажување е на клиентот), со забелешка Повлекување од договорот:",
    enforcementOfWithdrawalEmail: "Е-пошта: info@proteini.si",
    enforcementOfWithdrawalAddress:
      "Адреса: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Словенија",
    formForWithdrawal: "Образец за повлекување од договорот",
    formForWithdrawalText:
      "Образецот за повлекување од договорот можете да го најдете овде: Кликнете овде: Образец за повлекување",
    addressForComplaints: "Адреса за рекламации",
    addressForComplaintsText:
      "Клиентот може да ги испрати рекламациите и другите барања, кои не произлегуваат од остварувањето на гаранции, гарантни листови или повлекувања од договорот, на е-поштата на давателот на услуги, со забелешка Рекламации:",
    addressForComplaintsEmail: "Е-пошта: info@proteini.si",
    addressForComplaintsAddress:
      "Адреса: PROTEINI.SI, Ulica heroja Verdnika 22, 4270 Jesenice, Словенија",
    reviewOfProducts: "Оценување на производи",
    reviewOfProductsText:
      "Давателот на услуги им овозможува на клиентите да ги оценат нарачаните производи на веб-страницата. Четиринаесет дена по купувањето, Продавачот ќе му овозможи на Купувачот да ги оцени производите, нарачани исклучиво од Купувачот и кои не се предмет на враќање со повлекување од договорот. Продавачот ќе испрати е-пошта до Купувачот заблагодарувајќи му се за купувањето и обезбедувајќи линк, кој му овозможува на Купувачот да ги оцени купените производи. Со кликнување на линкот, на Купувачот ќе му се прикаже список на купените производи. За секој производ, Купувачот може да даде оценка од 1 до 5, каде што 1 значи дека тој/таа не е целосно задоволен од производот, а 5 значи дека тој/таа е целосно задоволен од производот. Во случаите кога Купувачот дава оценка 1 или 2, тој/таа добива дополнителна е-пошта со која се бара од Купувачот да ја објасни својата одлука во врска со оценката 1 или 2. Продавачот ќе ги земе предвид дополнителните повратни информации од Купувачот, ако оценката е разумна, разбирлива и почитувана. Во случаите кога оценката е неразумна, неразбирлива и навредлива, и особено ако Продавачот смета дека станува збор за намерно намалување на вкупната оценка на одреден производ со цел да се оштети репутацијата и бизнисот на Продавачот, Продавачот нема да ја земе предвид таквата оценка. За секоја оценка на поединечен производ, Купувачот ќе добие дополнителни 50 лојалти поени, освен во случаите кога Продавачот не ја земе предвид оценката поради горенаведените причини. Купувачот може да го оцени истиот производ само еднаш. Лојалти поени се доделуваат на регистрирани корисници. Регистрација овде: Најава. Вредноста на еден поен е 1 цент. Купувачот може да ги искористи лојалти поените при следното купување. Детали за лојалти поени: Лојалти поени.",
    productMaintenanceAndInstructions: "Одржување и упатства за производот",
    productMaintenanceAndInstructionsText:
      "Клиентот е свесен дека сите производи се опремени со упатства за одржување или употреба, каде што тоа е разумно и неопходно. Клиентот е должен внимателно да ги прочита упатствата за одржување и употреба на производот. Ако клиентот има проблеми со разбирање на упатствата за одржување или употреба, давателот на услуги му стои на располагање на клиентот за дополнителни објаснувања со цел да се спречи штета што би можела да настане поради неправилно одржување или употреба.",
    specialAgreements: "Посебни договори",
    specialAgreements1:
      "Без оглед на одредбите на овие Услови за користење, давателот на услуги и клиентот можат да се договорат за содржината поинаку, во заедничко следење на интересите на двајцата. Давателот на услуги е должен дека посебните договори во никој случај не можат да му обезбедат на клиентот, кој е физичко лице, помалку права од оние загарантирани со овие Услови за користење и законодавството.",
    specialAgreements2:
      "Давателот на услуги може да понуди посебни услови за продажба за: одредени стоки, одредена дигитална содржина, одредени услуги, одредени групи на претплатници (недискриминаторски) и одредени начини на плаќање.",
    generalRulesOfThePrizeContest: "ОПШТИ ПРАВИЛА НА НАТПРЕВАРОТ ЗА НАГРАДИ",
    generalRulesText:
      "Овие Правила се применуваат на сите натпревари за награди организирани од PROTEINI d.o.o., Ulica heroja Verdnika 22, 4270 Jesenice (Организаторот) на веб-страницата proteini.si или на друг начин.",
    generalRulesSupplement:
      "Организаторот може да ги дополни или на друг начин да ги измени овие Правила (посебни правила на натпреварот за награди) ако ги извести учесниците во натпреварот за награди однапред и недвосмислено директно на ваучерот или на формуларот за натпревар на веб-страницата www.proteini.si. Ќе се смета дека покрај овие Правила, важат и сите дополнителни правила кои однапред му се познати на Учесникот и со кои Учесникот се согласува со потврдување на своето учество во натпреварот за награди.",
    participants: "Учесници",
    participantsText:
      "Наградните игри на Организаторот се отворени за физички лица над 16 години и физички лица под 16 години, под услов на претходна согласност од нивниот законски старател за обработка на лични податоци.",
    conditionsForParticipation: "Услови за учество",
    conditionsForParticipationText:
      "Натпреварот за награди е отворен за секое лице кое:",
    condition1:
      "го пополнило формуларот за учество во натпреварот за награди со сите потребни податоци, кои мора да бидат точни и вистинити; и",
    condition2:
      "не учествувало во подготовката или спроведувањето на натпреварот за награди; и",
    condition3:
      "не е вработен кај Организаторот или Договорниот орган и не е член на нивното потесно семејство; и",
    condition4:
      "ги исполнува условите за учество во периодот од почетокот на учеството во натпреварот за награди до времето на изборот на добитниците на наградите.",
    methodOfParticipation: "Начин на учество",
    methodOfParticipationText:
      "За да биде подобен да учествува во натпреварот за награди, Учесникот мора да го пополни формуларот за пријавување на натпреварот за награди. Формуларот мора да се пополни електронски и со кликнување на копчето за потврда, Учесниците ја потврдуваат својата пријава за учество во натпреварот за награди.",
    methodOfParticipation2:
      "Учесникот може да учествува само еднаш во ист тип на натпревар за награди (со пополнување на формуларот).",
    methodOfParticipation3:
      "Со потврдување на учеството во натпреварот за награди, Учесникот се согласува со Општите и Посебните правила на натпреварот за награди, со објавување на неговото/нејзиното име и првата буква од презимето во списокот на добитници на награди, и да се пријави за да биде информиран за напредокот на натпреварот за награди користејќи ја е-пошта адресата што ја дал при регистрацијата за натпреварот за награди.",
    committee: "Комисија",
    committeeText:
      "Организаторот со одлука ќе именува тричлена комисија, која ќе:",
    committeeTask1:
      "ја надгледува организацијата на натпреварот за награди и усогласеноста со правилата на натпреварот за награди,",
    committeeTask2:
      "изготви записник за извлекувањето и го чува во период од 1 година од датумот на затворање на извлекувањето; и",
    committeeTask3:
      "преземе соодветни мерки во случај на прекршувања или сомневања за прекршувања.",
    committeeDecision: "Одлуките на Комисијата се конечни.",
    prizeDraw: "Извлекување на награди",
    prizeDrawText:
      "Извлекувањето на наградите ќе се одржи на датумот определен за секој натпревар за награди, како што е наведено на објавениот натпревар или формулар. Извлекувањето на наградите може да се одржи во деловните простории на Организаторот или во просториите на компанијата што ја дава наградата. Извлекувањето на наградите ќе се одржи меѓу сите пријави применети до датумот наведен на формуларот за пријавување за секој натпревар за награди. Извлекувањето на наградите ќе биде систематско, т.е. Добитниците ќе бидат извлечени со користење на случаен алгоритам. Бројот на Учесници („Добитници“) е ист како и бројот на предвидени награди за секој натпревар за награди.",
    prizeDraw2:
      "Во секој случај, Учесникот има право само на една награда во секој натпревар за награди.",
    publicationAndNotificationOfWinners:
      "Објавување и известување на Добитниците",
    publicationAndNotificationText:
      "Организаторот ќе ги објави Добитниците на својата веб-страница www.proteini.si и/или на своите канали на социјалните медиуми во рок од 10 работни дена по извлекувањето на наградите. Во случаи кога Добитниците не ја побараат наградата во утврдениот рок, извлекувањето на наградите ќе се повтори и рокот за објавување на Добитниците ќе се продолжи.",
    publicationAndNotification2:
      "Организаторот ќе ги извести Добитниците за добивањето на наградата најдоцна два работни дена по извлекувањето на наградите преку е-пошта адресата што ја дале при пријавувањето на натпреварот за награди.",
    collectionAndTransferOfPrize: "Подигање и пренос на наградата",
    collectionAndTransferText:
      "Добитникот ќе го поднесе своето барање за подигање на наградата до Организаторот писмено по е-пошта, редовна пошта или СМС порака, најдоцна 8 работни дена од датумот на прием на информацијата дека бил Добитник.",
    collectionAndTransfer2:
      "Во пораката, Добитникот ќе ги даде податоците потребни за испорака на наградата (на пр. даночен број, лична адреса) како што е наведено во пораката на Организаторот. Ако Добитникот не ги даде потребните податоци или даде неточни или лажни податоци, тој/таа нема да има право на наградата.",
    collectionAndTransfer3:
      "Добитниците ќе бидат информирани за начините на подигање на нивната награда, кои можат да бидат:",
    collectionMethod1: "лично на регистрираната адреса на Организаторот,",
    collectionMethod2:
      "лично на регистрираната адреса на друга компанија што придонесува награди, при што Организаторот издава потврда за подигање на наградата,",
    collectionMethod3:
      "со препорачана пошта на личната адреса на Добитникот, при што поштенските трошоци ги сноси Организаторот; или",
    collectionMethod4:
      "со готовински трансфер на трансакциската сметка на Добитникот, при што Добитникот потврдува и се согласува со одредбите во врска со аконтацијата на данокот на доход.",
    collectionAndTransfer4:
      "Наградата не може да се замени кај Организаторот за друг производ или да се замени за друга награда или паричен надомест.",
    collectionAndTransfer5:
      "Организаторот има право да бара од Добитникот да обезбеди валиден личен документ пред подигањето на наградата.",
    collectionAndTransfer6:
      "Добитникот е одговорен за сите трошоци поврзани со подигањето на наградата (патни трошоци, поштарина, аеродромски такси и сл.).",
    incomeTaxPrepayment: "Аконтација на данок на доход",
    incomeTaxPrepaymentText:
      "Аконтацијата на данокот на доход на наградите ќе ја плати Организаторот на натпреварот за награди или спонзорот ако тој е различен од Организаторот. Добитникот е одговорен за данок на доход и мора да му обезбеди на Организаторот писмено точни лични податоци (име и презиме, постојано живеалиште, телефонски број, е-пошта, ЕМБГ и Даночен идентификациски број) најдоцна во рок од 14 дена по приемот на известувањето за наградата (или друг рок што може да биде наведен во известувањето). Организаторот ќе ги проследи дадените податоци до спонзорот на наградата, ако Организаторот не е исплатувач на наградата.",
    incomeTaxPrepayment2:
      "Доставувањето на горенаведените податоци е услов за подигање на која било награда чија вредност надминува 42,00 € вклучувајќи ДДВ. Добитниците исто така се согласуваат и се информирани дека по приемот на наградата можат да бидат ставени во повисока даночна класа. Во тој случај, тие сносат цела финансиска одговорност и последици.",
    limitationOfLiabilityUntilDelivery:
      "Ограничување на одговорноста до испораката на наградата",
    limitationOfLiabilityText:
      "Во случај наградите да се обезбедени од друга компанија, која не е Организаторот, Организаторот нема да преземе одговорност во случај на било каков неуспех на таквата компанија да ја исполни својата обврска да ја достави наградата до Добитникот, до степен до кој таквата компанија не може да ја исполни својата обврска поради причини надвор од контрола на компанијата и Организаторот, или поради причини непознати за Организаторот или кои не постоеле пред организацијата на натпреварот за награди (особено во случај на стечај или несолвентност на таква компанија).",
    limitationOfLiability2:
      "Во овој случај, Организаторот им нуди на Добитниците различни награди, достапни за Организаторот. Добитниците не можат да бараат од Организаторот купување на идентични или слични производи (предмет на натпреварот за награди), ниту можат да бараат било каков паричен надомест.",
    failureToAwardPrize: "Недавање на наградата",
    failureToAwardPrizeText:
      "Организаторот нема да ја даде наградата ако Добитникот:",
    failureReason1: "го пропушти рокот за подигање на наградата,",
    failureReason2: "не ги достави бараните податоци,",
    failureReason3:
      "не обезбеди валидна форма на идентификација ако биде побарано од него да го стори тоа,",
    failureReason4: "ги прекршува одредбите на овие Правила,",
    failureReason5:
      "ја изрази својата волја, писмено или усно, да се откаже од наградата.",
    violationOfTheRules: "Прекршување на Правилата",
    violationOfRulesText:
      "Ако, пред извлекувањето, се утврди дека некое лице бара или добива учество во натпреварот за награди или доделување на награда спротивно на овие Правила или законот, Организаторот ќе го спречи тоа лице да учествува во натпреварот за награди.",
    violationOfRules2:
      "Ако прекршувањето се утврди по извлекувањето на наградите, Организаторот не е должен да му ја додели наградата на прекршителот.",
    violationOfRules3:
      "Ако наградата е веќе доделена и се испостави дека Добитникот ја освоил наградата со прекршување на овие Правила, Организаторот може да бара итно враќање на наградата или нејзиниот паричен еквивалент и надомест за каква било причинета штета.",
    protectionOfPersonalData: "Заштита на лични податоци",
    protectionOfPersonalDataText:
      "Со штиклирање на соодветното поле на ваучерот и/или формуларот за пријавување на натпреварот за награди, Учесникот дава своја експлицитна лична согласност дека Организаторот, како контролор на лични податоци, може да собира и обработува лични податоци за целите на спроведување на одреден натпревар за награди и информирање за наградата.",
    typesOfPersonalData:
      "Видовите на лични податоци што ги обработува Организаторот се наведени во секој поединечен ваучер и/или формулар за натпревар за награди, а Организаторот може, особено, да ги обработува следниве за опишаните цели:",
    personalDataType1:
      "име и презиме (за цели на учество, известување за можна награда, примање билтени),",
    personalDataType2:
      "адреса (за цели на известување и испраќање на наградата),",
    personalDataType3:
      "е-пошта адреса (за цели на учество, известување за можна награда, примање билтени),",
    personalDataType4: "телефонски број (за цели на известување),",
    personalDataType5:
      "даночен број (за цели на исплата на паричната награда),",
    personalDataType6:
      "ЕМБГ (за цели на аконтација на данок на доход и верификација на усогласеноста со Општите услови за учество во натпреварот за награди).",
    personalDataType7:
      "трансакциска сметка (за цели на исплата на паричната награда).",
    protectionOfPersonalData2:
      "Учесникот потврдува и се согласува дека во случај да бил Добитник, неговите/нејзините лични податоци (име и прва буква од презимето) ќе бидат јавно објавени.",
    protectionOfPersonalData3:
      "Со пријавување на натпреварот за награди, Учесникот потврдува и се согласува дека ќе продолжи да добива информации од Организаторот за дополнителни наградни игри, привилегии, промоции и попусти по одржувањето на натпреварот за награди и дека може во секое време да ја повлече оваа експлицитна согласност.",
    protectionOfPersonalData4:
      "Учесникот потврдува дека неговите/нејзините лични податоци може да ги обработуваат и договорните обработувачи на Организаторот, кои подлежат на истите обврски за заштита на податоци како и Организаторот.",
    protectionOfPersonalData5:
      "Учесникот потврдува дека Организаторот ги обработува личните податоци во согласност со словенечкото и европското законодавство, особено во согласност со важечкиот закон што ја уредува заштитата на лични податоци и Општата регулатива за заштита на податоци (GDPR).",
    protectionOfPersonalData6:
      "Учесникот потврдува дека, во случај на учество во натпреварот за награди, Организаторот ќе ја чува и обработува неговата/нејзината е-пошта адреса и телефонски број, ако се бараат како услов за учество во натпреварот за награди, додека Учесникот не му го достави на Организаторот своето барање за повлекување на согласноста за обработка на лични податоци. Во случај Учесникот да побара бришење на е-пошта адресата и телефонскиот број, ако тие биле потребни како услов за учество во извлекувањето на наградите (одјавување), за време на натпреварот за награди и до јавното објавување на Добитниците, ќе се смета дека се повлекол од учество во натпреварот за награди.",
    protectionOfPersonalData7:
      "Учесникот е свесен дека може да ги оствари своите права според законодавството за заштита на податоци со испраќање е-пошта на: gdpr@proteini.si, особено:",
    gdprRight1: "право на пристап до лични податоци,",
    gdprRight2: "право на исправка на лични податоци,",
    gdprRight3: "право на преносливост на податоци,",
    gdprRight4:
      "право на бришење на лични податоци (право да се биде заборавен),",
    gdprRight5: "право на ограничување на обработката на лични податоци, и,",
    gdprRight6: "право на приговор на обработката на лични податоци.",
    protectionOfPersonalData8:
      "Организаторот, PROTEINI.SI d.o.o., има детален опис на заштитата на лични податоци во Политиката за приватност, објавена на неговата веб-страница www.proteini.si.",
    withdrawalFromPrizeContest: "Повлекување од натпреварот за награди",
    withdrawalFromPrizeContestText:
      "Учесникот може да се повлече од учеството во натпреварот за награди во која било фаза на натпреварот за награди со испраќање на своето барање за повлекување на согласноста за обработка на лични податоци и за повлекување од учеството во натпреварот за награди до Организаторот на следнава е-пошта адреса: info@proteini.si. Не е можно да се отповика повлекувањето од натпреварот за награди.",
    limitationOfOrganizerLiability:
      "Ограничување на одговорноста на Организаторот",
    limitationOfOrganizerLiabilityText:
      "Организаторот нема да биде одговорен за спроведувањето на натпреварот за награди, доделувањето на наградите или за каква било штета:",
    organizerLiability1:
      "ако натпреварот за награди е забранет или спречен од владини органи или носители на јавна власт; или",
    organizerLiability2:
      "во случаи на виша сила надвор од контрола на Организаторот, што го спречува одржувањето на натпреварот за награди.",
    limitationOfOrganizerLiability2:
      "Во случај на значителна промена на околностите од техничка или комерцијална природа, Организаторот правично ќе ги измени правилата на натпреварот за награди, ќе ги извести сите Учесници и, по известувањето, ќе го спроведе или заврши натпреварот за награди врз основа на новите правила.",
    disputeSettlement: "Решавање на спорови",
    disputeSettlementText:
      "Во случај на било какви спорови според овие Правила, надлежен е судот во Јесенице.",
    finalProvisions: "ЗАВРШНИ ОДРЕДБИ",
    bindingNature: "Обврзувачка природа",
    bindingNature1:
      "1. Условите за користење се применуваат на сите клиенти преку веб-страницата на давателот на услуги и во случај на склучување договори или потврдување на нарачки преку е-пошта или други споредливи канали за комуникација на давателот на услуги (договори склучени на далечина). Во случај на договори со користење на телефон, давателот на услуги добива писмена потврда на нарачката од клиентот преку е-пошта или други споредливи канали за комуникација на давателот на услуги (писмена потврда) и само во овој случај договорниот однос (купување или нарачка) се смета за склучен. При размена на пораки со клиентот, давателот на услуги го информира истиот и му ги обезбедува овие деловни услови во достапна форма, со кои клиентот се запознава и се согласува писмено пред нарачката да се смета за потврдена.",
    bindingNature2:
      "2. Условите за користење се обврзувачки за сите правни трансакции склучени врз основа на нив преку оваа веб-страница и/или преку користење на е-пошта или споредливи канали за комуникација.",
    bindingNature3:
      "3. Условите за користење се составен дел на нарачката. Освен ако не е склучен посебен писмен договор, потврдената нарачка и важечките услови за користење се сметаат за договорен однос.",
    bindingNature4:
      "4. Клиентот потврдува дека е запознаен и се согласува со овие услови за користење пред да нарача производ или услуга во онлајн кошницата или преку е-пошта или други споредливи канали за комуникација.",
    amendments: "Измени",
    amendments1:
      "1. Давателот на услуги редовно ќе ги ажурира Условите за користење со законодавните промени.",
    amendments2:
      "2. Давателот на услуги го задржува правото повремено да прави суштински корекции и измени на Условите за користење.",
    amendments3:
      "3. Давателот на услуги навремено ќе ги известува клиентите за сите значителни измени, писмено по е-пошта.",
    amendments4:
      "4. Давателот на услуги ќе ги чува архивите на измените на Условите за користење, достапни за секој клиент со претходно писмено барање до е-поштата на давателот на услуги.",
    disputeResolution: "Решавање на спорови",
    disputeResolutionText:
      "Давателот на услуги и клиентот се обврзуваат да ги решаваат сите можни несогласувања и спорови мирно и согласно. Давателот на услуги не признава ниту еден давател на вонсудско решавање на потрошувачки спорови како надлежен за решавање на потрошувачки спор, затоа во случај на нерешен спор, потрошувачот може да се обрати до орган за алтернативно решавање на спорови.",
    disputeResolution2:
      "Националната контакт точка за дополнителни информации е обезбедена во рамките на Министерството за економија, туризам и спорт: Решавање на потрошувачки спорови",
    disputeResolution3:
      "Ако не е можно пријателско решение, за решавање на спорот е надлежен судот во Република Словенија според регистрираната адреса на давателот на услуги.",
    territorialValidity: "Територијална валидност",
    territorialValidityText:
      "Условите за користење се применуваат за сите клиенти и нарачки, без оглед на државата на пристап на клиентот.",
    temporalValidity: "Временска валидност",
    temporalValidityText: "Правните услови се применуваат од: 19.08.2024 08:52",

    // Variant Manager
    productVariants: "Варијанти на производ",
    addVariant: "Додади варијанта",
    bulkCreate: "Масовно креирање",
    flavor: "Вкус",
    color: "Боја",
    optionType: "Тип на опција",
    optionTypeHint: "Изберете дали варијантата претставува вкус или боја.",
    variantOption: "Вкус / Боја",
    colorHint: "на пр. Црна, Розова",
    packaging: "Пакување",
    basePrice: "Основна цена (МКД)",
    isDefault: "Стандардна",
    setDefault: "Постави како стандардна",
    default: "Стандардна",
    flavorHint: "Внесете го вкусот",
    packagingHint: "Внесете го пакувањето",
    comparePrice: "Споредбена цена (Опционално)",
    stockQuantity: "Количина на залиха",
    sku: "СКУ (Опционално)",
    mainVariantImage: "Главна слика на варијанта (Опционално)",
    setAsDefaultVariant: "Постави како стандардна варијанта",
    variantName: "Име на варијанта (Опционално)",
    ingredients: "Состојки (Опционално)",
    nutritionInfo: "Нутритивни информации (Опционално)",
    descriptionOptional: "Опис (Опционално)",
    nutritionTableHelperText:
      "* Референтен внес за возрасен човек (8400 kJ/2000 kcal)",
    addRow: "Додади ред",
    addColumn: "Додади колона",
    variantImagesGallery: "Галерија на слики од варијанта",
    addImages: "+ Додади слики",
    uploading: "Се вчитува...",
    variantImageGuidelines:
      "Можете да изберете повеќе слики одеднаш (JPG, PNG, WEBP, Макс 5MB по слика)",
    noVariantImages:
      'Сè уште нема слики. Кликнете "+ Додади слики" за да прикачите.',
    setAsMain: "Постави како главна",
    main: "Главна",
    dynamicNutritionTable: "Динамична нутритивна табела",
    manageColumns: "Управувај со колони",
    newColumnName: "Име на нова колона (пр. На 100g)",
    noRowsYet: 'Сè уште нема редови. Кликнете "Додади ред" за да креирате.',
    noColumnsYet:
      'Сè уште нема колони. Кликнете "Додади варијанта" за да креирате.',
    uploadingImage: "Се вчитува слика...",
    update: "Ажурирај",
    create: "Креирај",
    variant: "Варијанта",
    uploading: "Се вчитува...",
    uploadImage: "Прикачи слика",
    editVariant: "Уреди варијанта",
    addNewVariant: "Додади нова варијанта",
    editProduct: "Уреди производ",
    createNewProduct: "Креирај нов производ",
    finalPrice: "Крајна цена",
    saving: "Зачувува...",
    saveNutritionData: "Зачувај податоци",
    newRowNamePlaceholder: "Име на нов ред (пр. Енергија, Протеин)",
    noVariantsYet:
      "Сè уште нема варијанти. Кликнете на „Додади варијанта“ за да креирате една.",
    basePriceWithoutDDV: "Цена без ДДВ",
    ddvAmount: "Износ на ДДВ",
    price: "Цена",
    basePriceWithoutDDV: "Цена без ДДВ",
    adminGallery: "Админ Галерија",
    adminInstagramGallery: "Админ Инстаграм",
    adminYoutube: "Админи YouTube",
    ourLocations: "Нашите локации",
    shops: "Продавници",
    gyms: "Партнери",
    workingHours: "Работно време",
    mondayToFriday: "Понеделник до Петок",
    saturday: "Сабота",
    sunday: "Недела",
    getDirections: "Насоки за патување",
    ourShops: "Наши продавници",
    partnerGyms: "Партнери",
    adminPartners: "Админ партнери",
    adminAboutCompany: "Админ абаут ас",
    adminLanding: "Админ Лендинг",

    // Cart
    emptyCart: "Вашата кошничка е празна.",
    emptyCartDesc:
      "Нема производи во вашата кошничка. Продолжете со купувањето и додадете го производот во кошничката.",
    keepShopping: "Продолжи со купување",
    remove: "Отстрани",
    subtotal: "Меѓузбир",
    shipping: "Испорака",
    calculatedAtCheckout: "Пресметано при наплата",
    proceedTocheckout: "Продолжете со плаќање",
    total: "Вкупно",
    viewAll: "Погледнете ги сите",
    noProductsJFM: "Моментално нема достапни производи „Само за мене“.",
    advOfShoppingOnPS: "ПРЕДНОСТИ ОД КУПУВАЊЕ НА PROTEINI.SI",
    giftWithEveryPurchase: "Подарок со секое купување",
    weAddGiftToEveryPurchase: "Додаваме подарок со секое купување",
    collectLPAndBuyCheaper: "Собирај поени за лојалност и купувај поевтино",
    payWithPayPal: "Плати со PayPal",
    pcqaswp: "Плаќај практично, брзо и безбедно со PayPal.",
    secureCardPayments: "Безбедни плаќања со картичка",
    mastercardVisa: "Mastercard, Visa",
    fastDelivery: "Брза достава",
    ordersPlacedBy2PMWillBeShippedTheSameDay:
      "Нарачките направени до 14 часот ќе бидат испратени истиот ден!",
    freeShipping2: "Бесплатна достава",
    forPurchasesOver3000MKD: "За нарачки над 3000 МКД",

    // profile
    naturalPerson: "Физичко лице",
    address: "Адреса",
    save: "Зачувај",
    saving: "Зачувување",
    enotifications: "Е-нотификации",
    signUpForENews: "Пријави се за е-новости",
    signUpToRecieve: "Пријави се за да примаш",
    userAccountCancellation: "Откажување на корисничка сметка",
    userAccountCancDesc:
      "Ако повеќе не ви е потребна вашата корисничка сметка, можете да побарате нејзино откажување и бришење на вашите податоци. Ќе бидете известени по е-пошта кога процесот ќе биде завршен (2-3 дена).",
    iWouldLikeToCancelMyAccount: "Сакам да ја откажам мојата корисничка сметка",
    quicklyCompleteYourPurchase: "Брзо заврши ја твојата нарачка",
    createAUserDesc1:
      "Креирај корисничка сметка со податоците што ги внесуваш, што ќе ти помогне да купуваш уште побрзо во иднина, и",
    createAUserDesc2: "почни да собираш поени за лојалност со оваа нарачка!",
    createYourAccountPassword: "Креирај ја лозинката за твојата сметка",
    confirmPassword: "Потврди лозинка",
    passwordPlaceholder: "Лозинката треба да има најмалку 8 карактери",
    passwordPlaceholder2: "Потврди ја лозинката",
    deliveryAddressIsDifferentFromInvoiceAddress:
      "Адресата за достава е различна од адресата на фактурата",
    deliveryAddress: "Адреса за достава",
    fullName: "Име и презиме",
    enterFullName: "Внеси име и презиме",
    enterAddress: "Внеси адреса",
    enterPostCode: "Внеси поштенски број",
    enterCity: "Внеси град",
    enterPhoneNumber: "Внеси телефонски број",
    homeDelivery: "Достава до дома (плаќање при достава)",
    deliveryCourierNotice:
      "Пратките ги доставуваме со ЕЛС - Еко Логистик Сервис МК.",
    paymentMethod: "Начин на плаќање",
    creditCard: "Кредитна картичка",
    orderNote: "Забелешка за нарачка",
    orderNoteDesc: "Додади посебни барања или забелешки за твојата нарачка...",
    subscribeNote:
      "Биди информиран за најдобрите понуди, промоции и нови производи. Пријави се за нашиот билтен!",
    byCompletingThisForm:
      "Со пополнување на формуларот, се согласуваш да примаш билтени преку е-пошта.",
    subscribe: "Претплати се",
    productsInCart: "Производи во кошничка",
    yourLoyaltyPoints: "Ваши поени за лојалност",
    onepointonemkd: "1 поен = 1 МКД попуст (макс. 50% од вкупниот износ)",
    apply: "Примени",
    promotionCode: "Промо код",
    enterPromotionCode: "Внесете промо код",
    chooseFreeGift: "Изберете бесплатен подарок",
    promotionDiscount: "Промотивен попуст",
    shortExpiry: "Краток рок на траење",
    bestBefore: "Најдобро до",
    promotionBadge: "ПРОМОЦИЈА",
    saleEnds: "Понудата важи до",
    discountApplied: "Попустот е применет",
    youWillEarn1: "Ќе добиете",
    youWillEarn2: "поени од ова",
    youWillEarn3: "купување по извршено плаќање",
    pointEarned: "Поени заработени",
    delivery: "Достава",
    pointsDiscount: "Попуст од поени",
    amountForPayment: "ИЗНОС ЗА ПЛАЌАЊЕ",
    agreeToTheTerms:
      "Нарачка со обврска за плаќање. Запознаен сум и се согласувам со",
    and: "и",
    processing: "Обработка...",
    placeOrder: "Постави нарачка",

    loyaltyPoints: "Поени за лојалност",
    orderHistory: "Историја на нарачки",
    favouriteProducts: "Омилени производи",
    // loyalty points
    availableLoyaltyPoints: "Достапни поени за лојалност",
    youWillEarnFromCurrentCart: "Ќе заработиш од тековната кошничка",
    points: "поени",
    ofOrderTotal: "од вкупниот износ на нарачката",
    completeThePurchase: "Заврши ја нарачката",
    historyOfLoyaltyPoints: "Историја на поени за лојалност",
    youHaveNoLoyaltyPointTransactionsYet:
      "Сè уште немате трансакции со поени за лојалност.",
    totalEarned: "Вкупно заработени",
    redeemed: "Искористени",
    noOrdersFound: "Не се пронајдени нарачки",
    startShopping: "Започни со купување",
    order: "Нарачка",
    paymentMethod: "Начин на плаќање",
    viewDetails: "Види детали",
    orderDetails: "Детали за нарачка",
    loadingOrderDetails: "Се вчитуваат деталите за нарачката...",
    orderItems: "Производи во нарачката",
    size: "Големина",
    deliveryFee: "Цена за достава",
    cancellingOrder: "Се откажува нарачката...",
    cancelOrder: "Откажи нарачка",
    pending: "Во тек",
    paid: "Платено",
    completed: "Завршено",
    noFavoriteProductsYet: "Сè уште нема омилени производи",

    // landing page
    todaysOffer: "Денешна понуда",
    aTrustedChoice: "Доверлив избор за твоите цели.",
    shopHere: "Купувај тука!",
    todaysOfferDesc:
      "Battery Nutrition – квалитет на кој можеш да се потпреш, резултати што можеш да ги видиш.",
    noImage: "Нема слика",
    addToCart: "Додај во кошничка",
    viewArticle: "Види напис",
    allProducts: "Сите производи",
    sortBy: "Сортирај по",
    mostRecent: "Најнови",
    lowestPrice: "Најниска цена",
    highestPrice: "Највисока цена",
    bestSellers: "Најпродавани",
    clearAllFilters: "Исчисти ги сите филтри",
    bestFromThisCategory: "Најдоброто од оваа категорија",
    bestFromThisCategoryContent: "Нема детали...",
    nutritionValues: "Нутритивни вредности",
    ingredients1: "Состојки",
    noNutritionInfo: "Нема нутритивни информации",
    instructionsForUse: "Упатство за употреба",
    outOfStock: "Нема на залиха",
    adding: "Се додава...",
    removeProduct: "Дали сакате да го отстраните производот?",
    product: "Производ",

    // goals

    goals: "Цели",
    goalsDesc:
      "Твојата цел, наш предизвик. Proteini.si започна мисија да ја пренесе својата љубов кон активниот и здрав начин на живот и на оние кои сè уште не се активно вклучени во спортот. Покрај рекреативните и професионалните спортисти, сакаме да им помогнеме на сите на нивниот пат кон постигнување цели поврзани со телесна тежина, мускулна маса, фитнес, исхрана или поздрав начин на живот воопшто. Дали некоја од целите наведени подолу е и твоја цел?",
    weAreHereForYou: "Тогаш ние сме тука за тебе!",
    goalsQuestion: "Кои цели сакаш да ги постигнеш?",
    more: "Повеќе",
    improveYourFormAndEndurance: "Подобри ја својата форма и издржливост",
    sports: "Спортови",
    recreationAndOutdoor: "Рекреација и активности на отворено",
    functionalTraining: "Функционален тренинг",
  },
};

// Current language (default: English)
let currentLanguage = "mk";

// Function to translate a key
export const t = (key) => {
  const translation = translations[currentLanguage]?.[key];

  if (!translation) {
    console.warn(`❌ MISSING: "${key}" for ${currentLanguage}`);
    // Return English as fallback if available
    if (currentLanguage !== "en" && translations.en?.[key]) {
      return translations.en[key];
    }
    return key;
  }

  return translation;
};

// Function to change language
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    // Optionally save to localStorage
    localStorage.setItem("language", lang);
    return true;
  }
  return false;
};

// Function to get current language
export const getCurrentLanguage = () => currentLanguage;

// Initialize language from localStorage (optional)
const savedLanguage = localStorage.getItem("language");
if (savedLanguage && translations[savedLanguage]) {
  currentLanguage = savedLanguage;
}

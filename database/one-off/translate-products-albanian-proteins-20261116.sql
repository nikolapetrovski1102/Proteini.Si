-- Proteini.mk: Albanian (sq) Product Translations (Batches 01-05, 50 products incl. all 47 protein products)
-- Generated: 2026-11-16
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
-- Reviewed 2026-11-16: WHERE uses Product_Id (the real key column).
-- Fixed a Macedonian word left in product 2271 ("Во ditët" -> "Në ditët").
IF COL_LENGTH('dbo.Products', 'NameAl') IS NULL
    THROW 50000, 'dbo.Products.NameAl is missing; run the translation columns migration first.', 1;
GO

BEGIN TRANSACTION;

-- ProductId: 1055 (BATTERY COMPLETE ISOLATE)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY COMPLETE ISOLATE',
    DescriptionAl = N'<ul><li><p>Izolat i pastër i proteinave të hirrës + kolagjen</p></li><li><p>Ushqyerje e avancuar për performancë dhe rikuperim</p></li><li><p>Mbështetje për lëkurën, kyçet dhe indin lidhor</p></li><li><p>I shijshëm, i pastër dhe efektiv</p></li><li><p>Pothuajse PA yndyra dhe karbohidrate</p></li><li><p>Prodhuar në kapacitetet tona prodhuese në BE</p></li></ul><p><strong>Suplement ushqimor me ëmbëlsues. Përmbajtje e lartë e proteinave.</strong></p><p><strong>Mbështetni performancën tuaj. Përmirësoni rikuperimin. Mbështetni lëkurën, kyçet dhe muskujt – GJITHÇKA NË NJË PORCION TË FUQISHËM.</strong></p><p>Ju prezantojmë <strong>izolatin tonë ultra të pastër të proteinave të hirrës me kolagjen</strong>, një formulë proteinike e nivelit të lartë e krijuar për sportistë, entuziastë të fitnesit dhe të gjithë ata që kërkojnë ushqyerje të pastër dhe efektive.</p><p><strong>PËRFITIMET KRYESORE:</strong></p><ul><li><p><strong>100% izolat premium i proteinave të hirrës</strong> – proteinë me përthithje të shpejtë dhe cilësi të lartë për ndërtimin dhe mirëmbajtjen e masës së pastër muskulore.</p></li><li><p><strong>I pasuruar me kolagjen të hidrolizuar</strong> – mbështetje për shëndetin e kyçeve, elasticitetin e lëkurës dhe indin lidhor.</p></li><li><p><strong>MINIMALISHT yndyra dhe karbohidrate</strong> – proteinë e pastër, pa mbushës të panevojshëm, sheqerna dhe kalori shtesë.</p></li><li><p><strong>Jashtëzakonisht i shijshëm</strong> – shije e lëmuar dhe e pasur që do ta shijoni vërtet.</p></li><li><p><b>Prodhuar në kapacitetet tona prodhuese në BE</b> – kontroll i plotë i cilësisë nga fillimi deri në fund, me përbërës të verifikuar dhe pa aditivë të panevojshëm.</p></li><li><p><strong>I lehtë për tretje</strong> – ideal edhe për stomak më të ndjeshëm.</p></li><li><p><strong>Përzihet menjëherë</strong> – teksturë e lëmuar, pa kokrriza dhe pa shije të pakëndshme pas konsumimit.</p></li></ul><p><strong>PSE IZOLAT I PROTEINAVE TË HIRRËS?</strong></p><p>Izolati i proteinave të hirrës është një nga format <strong>më të pastra dhe me përthithje më të shpejtë</strong> të proteinave. Ja pse sportistët dhe personat që kujdesen për ushqyerjen e zgjedhin atë:</p><ul><li><p><strong>Përthithje jashtëzakonisht e shpejtë</strong> – siguron shpejt aminoacide për muskujt dhe mbështet rikuperimin.</p></li><li><p><strong>Biodisponueshmëri e lartë</strong> – trupi mund ta shfrytëzojë në mënyrë efektive.</p></li><li><p><strong>Mbështet rritjen dhe mirëmbajtjen e masës së pastër muskulore</strong> – ideal për ndërtimin dhe ruajtjen e një figure të definuar.</p></li><li><p><strong>Përmbajtje e ulët e laktozës</strong> – i lehtë për tretje.</p></li><li><p><strong>Me pak kalori dhe jashtëzakonisht i pastër</strong> – ideal për periudhat e dobësimit, definimit dhe clean bulk.</p></li></ul><p>Pavarësisht nëse stërviteni në palestër, rikuperoheni pas stërvitjes apo thjesht dëshironi të rrisni marrjen ditore të proteinave, kjo formulë ofron <strong>mbështetje të pastër ushqyese pa kompromis.</strong></p><p><strong>Ndjeni ndryshimin. Shijoni cilësinë. Ndjeni rezultatet.</strong></p><p><strong>Porositni tani dhe ngrini ushqyerjen tuaj në një nivel më të lartë!</strong></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 600 g (20 porcione)</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (30 g).',
    InstructionsForUseDescriptionAl = N'Doza e rekomanduar ditore: 1 - 3 porcione (30 - 90 g). Konsumoni gjatë ditës ose pas stërvitjes. Doza maksimale ditore është 3 porcione (90 g). PARALAJMËRIM: Mos e tejkaloni dozën e rekomanduar ditore. Suplementet ushqimore nuk janë zëvendësim për një ushqyerje të ekuilibruar dhe të larmishme dhe një stil të shëndetshëm jetese. Mbajeni larg fëmijëve! RUAJTJA: Ruajeni në vend të errët dhe të thatë në temperaturë nën 25°C.',
    InstructionsOnHowToUseItAl = N'Tretni 1 porcion në 200 ml ujë.'
WHERE Product_Id = 1055;

-- ProductId: 1059 (BATTERY COMPLETE WHEY)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY COMPLETE WHEY',
    DescriptionAl = N'<ul><li>Proteina të hirrës të përshtatura sipas preferencave tuaja
</li>
<li>
Kontribuon në rritjen dhe rikuperimin e muskujve
</li>
<li>
Me enzima të shtuara për përthithje edhe më të mirë
</li>
<li>
Me L-leucinë dhe glicinë të shtuar
</li>
<li>
Shije të shkëlqyera
</li>
<li>
Prodhuar në BE</li></ul>
<p><strong>Suplement ushqimor me ëmbëlsues. Përmbajtje e lartë e proteinave.</strong></p>
<p><strong>BATTERY WHEY I RI – TANI ME PËRBËRJE TË PËRMIRËSUAR DHE SHIJE EDHE MË TË MIRË!</strong></p>
<p>Dëgjuam komentet tuaja dhe e bëmë proteinën tonë popullore të hirrës edhe më të mirë. COMPLETE WHEY është formuluar me kujdes për të mbështetur stilin aktiv të jetesës, me shije të reja dhe të përmirësuara, formulë të përsosur dhe të njëjtën cilësi të verifikuar me të cilën jeni mësuar.</p>
<p><strong>ÇFARË ËSHTË E RE:</strong></p>
<ul>
<li>
<strong>SHIJE TË REJA, TË PËRMIRËSUARA</strong> – Tani edhe më të shijshme dhe më të këndshme, të krijuara sipas preferencave tuaja. Sigurisht, kemi ruajtur edhe disa nga shijet tuaja të preferuara, si Wheytella dhe Luleshtrydhe me çokollatë të bardhë!
</li>
<li>
<strong>PËRBËRJE EDHE MË E MIRË</strong> – Përzierje e optimizuar për performancë më të mirë, përzierje më të lehtë dhe mbështetje më të mirë ushqyese.
</li>
<li>
<strong>KOMENTET TUAJA, VEPRIMI YNË</strong> – Morëm parasysh vërejtjet tuaja për të krijuar një formulë që u përgjigjet edhe më mirë nevojave tuaja.
</li>
</ul>
<p><strong>PËRFITIMET KRYESORE:</strong></p>
<ul>
<li>
<strong>PËRZIERJE PROTEINASH EFEKTIVE:</strong> Kombinim i balancuar i koncentratit instant të proteinave të hirrës dhe koncentratit të proteinave të qumështit, i cili siguron të gjitha aminoacidet esenciale për mbështetjen e masës muskulore dhe rikuperimin pas aktivitetit fizik.
</li>
<li>
<strong>AMINOACIDE PËR PERFORMANCË:</strong> Përmban L-leucinë, një aminoacid i rëndësishëm BCAA për stimulimin e sintezës së proteinave muskulore, dhe glicinë, e cila mbështet rigjenerimin e indeve dhe funksionet metabolike.
</li>
<li>
<strong>MBËSHTETJE ENERGJIKE ME MALTODEKSTRINË:</strong> Përmban maltodekstrinë, një karbohidrat me përthithje të shpejtë që siguron burim të shpejtë energjie – ideal për rimbushjen e rezervave të glikogjenit pas stërvitjes dhe disponueshmëri më të mirë të lëndëve ushqyese së bashku me proteinat.
</li>
<li>
<strong>TEKSTURË E LËMUAR DHE KREMOZE:</strong> Shejku përzihet lehtë dhe ofron teksturë kremoze dhe të këndshme.
</li>
<li>
<strong>MË I LEHTË PËR STOMAKUN:</strong> I pasuruar me enzimën laktazë që ndihmon në tretjen e laktozës, duke e bërë të përshtatshëm edhe për personat e ndjeshëm ndaj produkteve të qumështit.
</li>
<li>
<strong>PRODHUAR NË KAPACITETET TONA PRODHUESE NË BE</strong> nga përbërës të verifikuar, sipas standardeve të larta të cilësisë dhe sigurisë.
</li>
</ul>
<p><strong>USHQIM PËR MUSKUJT</strong></p>
<p>Proteina e hirrës përbëhet nga aminoacide që kontribuojnë në rigjenerimin dhe ndërtimin e indit muskulor. Pas aktivitetit të rëndë fizik indi muskulor ngarkohet, dhe marrja e mjaftueshme e aminoacideve me përthithje të shpejtë është e rëndësishme për mirëmbajtjen dhe rikuperimin e tij. Proteina e hirrës ka vlerë të lartë biologjike dhe shfrytëzohet lehtësisht nga organizmi.</p>
<p>BATTERY COMPLETE WHEY ju siguron dozën ditore të proteinave me cilësi të lartë.</p>
<p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p>
<p><strong>Sasia neto:</strong> 30 g / 30 x 30 g / 800 g / 1800 g / 5000 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (30 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni gjatë ditës ose pas stërvitjes. Doza maksimale ditore është 3 porcione (90 g). PARALAJMËRIM: Sasia ose doza e rekomanduar ditore nuk duhet të tejkalohet. Suplementi ushqimor nuk është zëvendësim për një ushqyerje të ekuilibruar dhe të larmishme. Mbajeni larg fëmijëve! RUAJTJA: Ruajeni në vend të errët dhe të thatë në temperaturë deri në 25°C.',
    InstructionsOnHowToUseItAl = N'Tretni 1 porcion në 250 ml ujë.'
WHERE Product_Id = 1059;

-- ProductId: 2112 (BATTERY REBEL CLEAR WHEY)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY REBEL CLEAR WHEY',
    DescriptionAl = N'<p><strong>REBEL Clear Whey Protein – I pastër, freskues dhe i fuqishëm</strong></p><p>Zbuloni kombinimin e <strong>freskimit dhe mbështetjes për rikuperimin e muskujve</strong> me REBEL Clear Whey Protein – një qasje moderne ndaj suplementimit me proteina. Kjo pije e tejdukshme, e lehtë dhe freskuese është e pasur me <strong>izolat të proteinave të hirrës me cilësi të lartë</strong>, duke siguruar 21–22 g proteinë të pastër për porcion, me <strong>0 g yndyrë</strong> dhe <strong>sasi minimale të karbohidrateve.</strong></p><p>Pse ta zgjidhni REBEL Clear Whey?</p><p><strong>ULTRA I PASTËR DHE I TEJDUKSHËM</strong></p><p>Ndryshe nga shejkët tradicionalë të qumështit me proteina, Clear Whey është i lehtë, i freskët dhe freskues – zgjedhje e shkëlqyer për pas stërvitjes.</p><p><strong>PËRMBAJTJE E LARTË E PROTEINAVE, PAK KALORI</strong></p><p>Çdo porcion siguron sasi të lartë proteinash me vetëm 97 kalori, duke e bërë ideal për personat që duan të ndërtojnë masë muskulore, të rikuperohen më shpejt ose të ruajnë një formë fizike të definuar.</p><p><strong>PËRTHITHJE E SHPEJTË</strong></p><p>Formula me izolat të proteinave të hirrës tretet lehtë dhe përthithet shpejt nga organizmi, duke siguruar mbështetje efektive për rikuperimin e muskujve pas stërvitjeve të rënda.</p><p><strong>PRAKTIK DHE I LEHTË PËR PËRDORIM</strong></p><p>Përzihet lehtë me ujë dhe mund të konsumohet në çdo kohë – pas stërvitjes, si freskim gjatë ditës ose si mënyrë praktike për të arritur marrjen ditore të proteinave.</p><p><strong>IDEAL PËR:</strong></p><ul><li>Sportistë që kërkojnë proteinë me përthithje të shpejtë për rikuperim</li><li>Entuziastë të fitnesit që kërkojnë një opsion të pastër me pak kalori</li><li>Këdo që dëshiron një alternativë të lehtë dhe freskuese ndaj shejkëve tradicionalë të proteinave</li></ul><p>Ngrini rutinën tuaj të rikuperimit në një nivel më të lartë me Clear Whey – pije proteinike e gjeneratës së re që freskon organizmin dhe e furnizon me izolat të proteinave të hirrës me cilësi të lartë me çdo gllënjkë.</p><p>I disponueshëm në dy shije të lëngshme – Çamçakëz boronice dhe Ice Pop.</p><p><strong>Pini pastër. Stërvituni fort. Rikuperohuni më shpejt.</strong></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 400 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është ¾ lugë matëse (25 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni 1 - 2 porcione në ditë: pas stërvitjes ose si pije me përmbajtje të lartë proteinash ndërmjet vakteve. Ruajeni në vend të thatë, larg nxehtësisë dhe dritës së drejtpërdrejtë të diellit.',
    InstructionsOnHowToUseItAl = N'Përzieni 1 porcion pluhur me 350 ml ujë dhe lëreni të qëndrojë disa minuta derisa të ulet shkuma natyrale.'
WHERE Product_Id = 2112;

-- ProductId: 2116 (BATTERY REBEL WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY REBEL WHEY PROTEIN',
    DescriptionAl = N'<ul><li>Mënyrë praktike, e lehtë dhe e shijshme për të rritur marrjen ditore të proteinave</li><li>Ndihmon në ndërtimin dhe mirëmbajtjen e masës muskulore</li><li>Nga koncentrati dhe izolati i proteinave të hirrës</li><li>25 g proteina të hirrës për porcion</li><li>Raport i shkëlqyer çmim / performancë / cilësi</li></ul><p><strong>Suplement ushqimor me ëmbëlsues. Përzierje për përgatitjen e pijes me përmbajtje të lartë të proteinave.</strong></p><p>Për ndërtimin e masës muskulore nevojitet ushqyerje cilësore. Përdorimi i suplementeve ushqimore mund t''ju ndihmojë të plotësoni nevojat tuaja ushqyese dhe të mbështesni objektivat tuaja të fitnesit. Kur qëllimi është rritja e masës muskulore, proteinat pluhur janë një nga mënyrat më praktike dhe më të lehta për të rritur marrjen ditore të proteinave.</p><p>Proteinat janë të rëndësishme për <strong>rritjen dhe rikuperimin e muskujve</strong> te sportistët dhe personat e tjerë fizikisht aktivë. Marrja e mjaftueshme e proteinave është veçanërisht e rëndësishme për <strong>rritjen dhe mirëmbajtjen e masës së pastër muskulore</strong>. Për rritjen e muskujve është e nevojshme të ruhet një bilanc pozitiv i proteinave. Nevojat për proteina mund të ndryshojnë ndjeshëm dhe të lëvizin nga 1,2 g deri në 3,1 g për kilogram peshë trupore në ditë.</p><p>Pija pluhur REBEL WHEY PROTEIN është një mënyrë <strong>praktike, e shijshme dhe e përballueshme</strong> për të marrë sasinë e nevojshme të proteinave. Me vetëm një porcion e rrisni marrjen ditore për <strong>25 g proteina</strong>, të përftuara nga <strong>koncentrati i proteinave të hirrës dhe izolati i proteinave të hirrës</strong>.</p><p>Proteina e hirrës është një nga burimet më të mira të <strong>proteinave me cilësi të lartë</strong> në ushqyerje. Tretet lehtë dhe përthithet shpejt në krahasim me shumë burime të tjera proteinash. Konsiderohet proteinë e plotë sepse përmban të tre aminoacidet me zinxhir të degëzuar (BCAA), si dhe të nëntë aminoacidet esenciale.</p><p>REBEL WHEY PROTEIN është i disponueshëm në 5 shije të testuara dhe të miratuara: vanilje, luleshtrydhe, çokollatë dhe lajthi, biskota dhe krem dhe çokollatë-banane.</p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 700 g / 1800 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (32 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni 1 - 2 porcione në ditë: pas zgjimit, ndërmjet vakteve, pas stërvitjes ose para gjumit. Paralajmërime: Mbajeni larg fëmijëve! Mos e tejkaloni dozën e rekomanduar ditore! Ky produkt nuk duhet të përdoret si zëvendësim për një ushqyerje të larmishme dhe të ekuilibruar. Rekomandohet ushqyerje e larmishme dhe e ekuilibruar dhe një stil i shëndetshëm jetese. Ruajeni në vend të thatë, larg nxehtësisë dhe dritës së drejtpërdrejtë të diellit.',
    InstructionsOnHowToUseItAl = N'Përzieni 1 porcion me 250 ml ujë ose qumësht.'
WHERE Product_Id = 2116;

-- ProductId: 2129 (BOUNTY HI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameAl = N'BOUNTY HI PROTEIN BAR',
    DescriptionAl = N'<ul><li>Shije fenomenale tropikale Bounty</li><li>18 g proteina për porcion (52 g)</li><li>Burime proteinash nga qumështi dhe proteina të hirrës</li><li>Më pak yndyra dhe sheqer në krahasim me çokollatën origjinale</li></ul><p><strong>Shufër me përmbajtje të lartë proteinash me kokos të tharë, e mbuluar me çokollatë qumështi.</strong></p><p>Shufra BOUNTY HI PROTEIN do t''i mahnisë adhuruesit e shijes tropikale Bounty me kokosin e saj të shijshëm dhe 18 g proteina.</p><p>BOUNTY HI PROTEIN është një meze e shkëlqyer në çdo kohë dhe kudo – si pas stërvitjes, ashtu edhe kur jeni në lëvizje, falë paketimit të vogël dhe praktik. Mund ta shijoni pas stërvitjes ose në çdo moment të ditës kur dëshironi të rrisni më tej marrjen e proteinave.</p><ul><li>204 kcal për porcion (52 g)</li><li>18 g proteina për porcion (52 g)</li><li>Paketimi përmban dy shufra nga 26 g</li></ul><p><strong>Sasia neto:</strong> 52 g / 12 x 52 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Nuk është e përshtatshme për vegjetarianë. Ruajeni në vend të freskët dhe të thatë, të mbrojtur nga drita e drejtpërdrejtë e diellit.',
    InstructionsForUseDescriptionAl = NULL,
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2129;

-- ProductId: 2132 (IRONMAXX 100% VEGAN PROTEIN ZERO, 500g)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX 100% VEGAN PROTEIN ZERO, 500g',
    DescriptionAl = N'<ul><li>100% proteinë vegane pluhur</li><li>Proteinë nga bizelet, orizi dhe kërpi</li><li>Shije e shkëlqyer kremoze</li><li>Pa sojë</li><li>Pa sheqer</li></ul><p><strong>Proteinë instant pluhur me ëmbëlsues për përgatitjen e pijes sportive.</strong></p><p>Gjatë zhvillimit të 100% Vegan Protein Zero, qëllimi i IronMaxx® ishte të krijonte një proteinë vegane pluhur pa sheqer, e cila njëkohësisht do të ofronte edhe një përvojë të shkëlqyer shijeje.</p><p>Formula inovative e 100% Vegan Protein Zero shmang në masë të madhe shijen dhe teksturën ranore karakteristike për shumë proteina konvencionale vegane pluhur. Në të njëjtën kohë, është arritur një konsistencë kremoze dhe e hollë e shejkut, e cila zakonisht është karakteristike për proteinat me origjinë shtazore.</p><p>Blerësit, punonjësit dhe adhuruesit e markës e theksojnë shijen e shkëlqyer të kësaj proteine pluhur, dhe kjo proteinë bimore premium i mahnit jo vetëm veganët.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li>100% proteinë vegane pluhur me formulë unike</li><li>E bërë nga izolat me cilësi të lartë i proteinave të bizeleve dhe proteinave të orizit</li><li>Me proteinë nga kërpi</li><li>Shije e shkëlqyer edhe kur përzihet vetëm me ujë</li><li>Konsistencë kremoze</li><li>E ëmbëlsuar me stevia, ndër të tjera</li><li>Pa sojë</li><li>Pa sheqer</li><li>Tolerancë e shkëlqyer</li><li>Prodhuar në Gjermani</li></ul><p>Proteinat kontribuojnë në rritjen e masës muskulore.</p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 500 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 30 g (rreth 3 lugë të mbushura).',
    InstructionsForUseDescriptionAl = N'Pini 1-4 porcione në ditë për të arritur efektet pozitive të përmendura. Rekomandohet të konsumohet para stërvitjes me intensitet të lartë ose garës, menjëherë pas stërvitjes dhe para gjumit. Paralajmërim: Ruajeni të mbrojtur nga nxehtësia, lagështia dhe drita e diellit.',
    InstructionsOnHowToUseItAl = N'Shtoni 1 porcion dhe 300 ml ujë të ftohtë në enën e blenderit dhe tundeni për 20 sekonda.'
WHERE Product_Id = 2132;

-- ProductId: 2133 (IRONMAXX 100% WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX 100% WHEY PROTEIN',
    DescriptionAl = N'<p></p><ul><li>Proteina të shijshme të hirrës</li><li>Për rikuperimin dhe rritjen e indit muskulor</li><li>Zgjedhje e madhe shijesh</li><li>Përzierje e shkëlqyer me ujë</li></ul><p><strong>Proteinë instant pluhur për përgatitjen e pijes sportive, me ëmbëlsues.</strong></p><ul><li>Shejk i hirrës me cilësi të lartë dhe biodisponueshmëri të lartë</li><li>Përmbajtje e lartë e proteinave</li><li>Përmban të gjitha aminoacidet esenciale dhe joesenciale, përfshirë BCAA dhe EAA</li><li>Përgatitet me ujë</li><li>Tretshmëri e shkëlqyer pa formim kokrrizash</li><li>I disponueshëm në një numër të madh shijesh të ndryshme</li><li>Pa aspartam – i ëmbëlsuar me stevia dhe sukralozë</li><li>Pa konservues</li><li>Raport i shkëlqyer çmim / performancë</li></ul><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 500 g / 900 g / 2350 g / 2700 g</p><p></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 4 lugë (50 g). Më së miri është t''i keni proteinat pranë jush në çdo kohë. Shtoni një porcion në 250 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25-30 sekonda.',
    InstructionsForUseDescriptionAl = N'Rekomandojmë të pini deri në 4 porcione në ditë. Më së miri të përdoret para stërvitjes ose garës me intensitet të lartë, menjëherë pas stërvitjes dhe para gjumit. PARALAJMËRIM: Doza e rekomanduar ditore e shënuar nuk duhet të tejkalohet. Mos e përdorni si zëvendësim për një ushqyerje të larmishme. Mbajeni larg fëmijëve të vegjël. Shtoni një porcion në 250 ml ujë, qumësht ose pije të preferuar dhe shtoni 3-4 kube akulli. Përzieni në blender për 20-30 sekonda ose derisa pija të arrijë konsistencën e dëshiruar.
Shtoni një porcion në 250 ml ujë dhe përzieni fuqishëm.',
    InstructionsOnHowToUseItAl = N'Duke shtuar fruta të freskëta ose të ngrira, gjalpë kikiriku, vaj kokosi ose përbërës dhe shtesa të tjera ushqyese, mund ta përmirësoni lehtësisht shejkun tuaj në një vakt të larmishëm dhe ushqyes.'
WHERE Product_Id = 2133;

-- ProductId: 2137 (IRONMAXX LAVA BAR)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX LAVA BAR',
    DescriptionAl = N'<ul><li>Përvoja Lava = mbështjellës i butë proteinik dhe mbushje e lëngshme, kremoze</li><li>Pa vaj palme, ngjyrues dhe konservues</li><li>Përmbajtje e lartë e proteinave</li><li>Përmbajtje e ulët e sheqerit</li></ul><p><strong>Shufër proteinike me ëmbëlsues. Përmbajtje e lartë e proteinave. Përmbajtje e ulët e sheqerit.</strong></p><p>Është arritur një gjeneratë e re e shufrave proteinike! Mbështjellës i butë proteinik me mbushje të lëngshme, kremoze që shkrihet në gojë – shije aq e mirë saqë vështirë se do të besoni se bëhet fjalë për një shufër proteinike.</p><p>Me copa krokante ose fruta arrore për një efekt të përsosur krokant, e mbuluar me çokollatë të butë me përmbajtje të ulët sheqeri.</p><ul><li>Mbushje e butë dhe vlera të shkëlqyera ushqyese: përmbajtje e lartë e proteinave (deri në 34%) dhe përmbajtje e ulët e sheqerit (maks. 3%)</li><li>Pa vaj palme, ngjyrues dhe konservues</li><li>Cilësi e shkëlqyer</li><li>Raport i shkëlqyer çmim dhe cilësi</li></ul><p><strong>Sasia neto:</strong> 40 g / 18 x 40 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 shufër (40 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni deri në 1 shufër në ditë. PARALAJMËRIM: Konsumimi i tepërt mund të shkaktojë efekte laksative.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2137;

-- ProductId: 2138 (IRONMAXX PROTEIN & NUT BAR)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX PROTEIN & NUT BAR',
    DescriptionAl = N'<p></p><ul><li>Shufër proteinike me fruta arrore të vërteta</li><li>16 g proteina për shufër</li><li>E shndërron momentin tuaj të mezes në një kënaqësi të vërtetë!</li><li>Pa sheqer të shtuar</li><li>Pa vaj palme</li><li>Pa gluten</li></ul><p><strong>Shufër proteinike me shtresë çokollate qumështi/të bardhë me maltitol, copa frutash arrore dhe ëmbëlsues.</strong></p><p><strong>CILËSI E LARTË ME SHUMË PROTEINA DHE FRUTA ARRORE TË VËRTETA</strong></p><p>Me copa të vërteta të mëdha frutash arrore dhe shtresë kremoze proteinike të mbuluar me çokollatë krokante, kjo është një nga shufrat proteinike më të preferuara. Këtë shije mund ta shijoni pa brejtje ndërgjegjeje, pasi nuk ka sheqer të shtuar. Është e përshtatshme edhe për përdorim gjatë dietës.</p><p>Përmbajtja e proteinave është deri në 16 g për shufër. Në këtë mënyrë mund të mbuloni lehtësisht dhe me shije një pjesë të nevojave tuaja ditore për proteina. Proteinat kontribuojnë në rritjen dhe mirëmbajtjen e masës muskulore.</p><p><strong>PROVONI SHUFRËN PROTEINIKË ME FRUTA ARRORE DHE BINDUNI VETË!</strong></p><p>Shufrat proteinike me fruta arrore nga IronMaxx® nuk ofrojnë vetëm një përvojë të shkëlqyer shijeje, por edhe një kombinim praktik të proteinave dhe lëndëve ushqyese për stilin aktiv të jetesës.</p><p>Shijoni kombinimin e frutave arrore krokante, shtresës kremoze proteinike dhe shtresës së çokollatës – një meze proteinike praktike që mund ta merrni lehtësisht me vete gjatë ditës.</p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 45 g / 24 x 45 g</p><p></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Konsumoni deri në 1 shufër në ditë.',
    InstructionsForUseDescriptionAl = N'PARALAJMËRIM: Konsumimi i tepërt mund të shkaktojë efekt laksativ.',
    InstructionsOnHowToUseItAl = N'Ruajeni në vend të freskët, të thatë dhe të mbrojtur nga drita e diellit.'
WHERE Product_Id = 2138;

-- ProductId: 2139 (IRONMAXX PROTEINO)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX PROTEINO',
    DescriptionAl = N'<ul><li>Vafer unik proteinik me mbushje kremoze dhe mbështjellës çokollate</li><li>Përmbajtje e lartë e proteinave</li><li>Pa gluten</li><li>Pa vaj palme</li><li>I disponueshëm në 3 shije të shkëlqyera</li></ul><p><strong>Vafer krokant i mbuluar me çokollatë dhe i mbushur me krem. Me ëmbëlsues.</strong></p><p>IronMaxx® me krenari prezanton Proteino®. Kjo shufër unike proteinike kombinon vaferin krokant, mbushjen kremoze dhe mbështjellësin e çokollatës. Kur shijoni Proteino®, mund të harroni lehtësisht se bëhet fjalë për një meze proteinike, dhe jo për një ëmbëlsirë klasike.</p><p>Proteino® vendos standarde të reja dhe tregon se shufrat e çokollatës mund të jenë edhe të shijshme edhe më mirë të ekuilibruara nga ana ushqyese. Provojeni dhe zgjidhni shijen tuaj të preferuar! Është e disponueshme në 3 shije të shkëlqyera: Karamel i kripur, Çokollatë e bardhë dhe fëstëk dhe Çokollatë e zezë e dyfishtë.</p><p>Shufra proteinike Proteino® përmban më pak se 0,5 g sheqer për shufër. Kjo e bën një zgjedhje të shkëlqyer edhe për periudhat e dietës, kur dëshironi të shijoni diçka të ëmbël pa marrje të lartë sheqeri.</p><p>Përveç përmbajtjes së ulët të sheqerit, Proteino® siguron edhe proteinë me cilësi të lartë. Me secilën nga tre shijet merrni një porcion shtesë proteinash, gjë që është veçanërisht praktike për sportistët, personat fizikisht aktivë dhe këdo që dëshiron ta rrisë më lehtë marrjen ditore të proteinave.</p><p>Që Proteino® të jetë i përshtatshëm për sa më shumë njerëz, produkti është pa gluten. Përveç kësaj, formula nuk përmban vaj palme.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li>Vafer me mbushje kremoze dhe mbështjellës çokollate</li><li>I disponueshëm në tre shije</li><li>Përmbajtje e lartë e proteinave – 28 g proteina në 100 g</li><li>Pa shtresë klasike proteinike – me mbushje kremoze proteinike që shkrihet në gojë dhe vafer krokant</li><li>Më pak se 0,5 g sheqer për shufër</li><li>Pa gluten</li><li>Pa vaj palme</li></ul><p><strong>Sasia neto:</strong> 30 g / 12 x 30 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 shufër (30 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni deri në një shufër në ditë. Ruajeni në vend të freskët dhe të thatë, larg dritës së diellit. Shënim: Konsumimi i tepërt mund të shkaktojë efekte laksative. PA SHEQER TË SHTUAR. PËRMBAN SHEQERNA TË PRANISHME NATYRALISHT. Proteinat kontribuojnë në rritjen e masës muskulore. Nuk duhet të përdoret si zëvendësim për një ushqyerje të ekuilibruar dhe të larmishme dhe një stil të shëndetshëm jetese.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2139;

-- ProductId: 2141 (IRONMAXX ZENITH PROTEIN BAR)
UPDATE dbo.Products
SET
    NameAl = N'IRONMAXX ZENITH PROTEIN BAR',
    DescriptionAl = N'<ul><li>Shufër me përmbajtje të lartë proteinash</li><li>Përmbajtje maksimale e proteinave (50%)</li><li>Përmbajtje e ulët e sheqernave</li><li>Me të gjitha aminoacidet e rëndësishme dhe esenciale</li></ul><p><strong>Shufër proteinike me shtresë çokollate me maltitol. Me ëmbëlsues.</strong></p><p><strong>50% HIGH PROTEIN BAR – NDIENI NDRYSHIMIN</strong></p><p>Shufra Zenith® nga IronMaxx® dallohet për përmbajtjen jashtëzakonisht të lartë të proteinave prej 50% dhe përmbajtjen e ulët të karbohidrateve. Falë kësaj, përbën një burim praktik dhe të thjeshtë proteinash për të gjithë ata që dëshirojnë të ndjekin një ushqyerje të pasur me proteina.</p><p>Zenith® nga IronMaxx® është një burim praktik proteinash në çdo situatë. Mund të konsumohet gjatë ditës, në punë, në kohën e lirë ose si një vakt i lehtë proteinik ndërmjet vakteve. Për sportistët është veçanërisht praktike gjatë ose pas stërvitjes, pasi proteina e qumështit është e pasur me aminoacide dhe ka vlerë të lartë biologjike.</p><p>Zenith® dallohet edhe për shijen e saj të shkëlqyer dhe përbën një alternativë të shijshme ndaj shufrave klasike të çokollatës.</p><p><strong>VETËM 3 g KARBOHIDRATE NETO PËR SHUFËR</strong></p><p>Shufrat standarde shpesh përmbajnë 10–20 herë më shumë sheqerna, gjegjësisht karbohidrate neto, ndërsa kanë vetëm rreth një të tretën e sasisë së proteinave në krahasim me këtë shufër proteinike.</p><p>Gjatë periudhave të uljes së peshës trupore dhe definicionit, Zenith® është një zgjedhje praktike për marrjen e proteinave me cilësi të lartë pa kompromis me shijen.</p><p><strong>PROTEINAT KONTRIBUOJNË NË:</strong></p><ul><li>rritjen e masës muskulore</li><li>ruajtjen e masës muskulore</li><li>ruajtjen e kockave normale</li></ul><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 100 g / 12 x 100 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Konsumoni 1-2 shufra në ditë si vakt i lehtë në çdo kohë të ditës, para, gjatë ose pas stërvitjes. Konsumi i tepërt mund të ketë efekt laksativ.',
    InstructionsForUseDescriptionAl = NULL,
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2141;

-- ProductId: 2142 (NÄNO SUPPS PROTEIN BAR)
UPDATE dbo.Products
SET
    NameAl = N'NÄNO SUPPS PROTEIN BAR',
    DescriptionAl = N'<p></p><ul><li>Përvojë ëmbëlsire pa ndjenjë faji</li><li>Përmbajtje e lartë proteinash (28%) – proteinë qumështi dhe bizeleje, kolagjen</li><li>Formulë inovative, e pastër – pa sheqer të shtuar, makronutrientë të balancuar</li><li>Shije të paharrueshme</li><li>Vakt i lehtë perfekt në çdo kohë – pas stërvitjes, në lëvizje, në punë...</li></ul><p><strong>Shufër proteinike me përmbajtje të lartë proteinash dhe ëmbëlsues.</strong></p><p><strong>SHUFËR PROTEINIKE PREMIUM SI KURRË MË PARË!</strong></p><p>Zbuloni gjeneratën e re të Nanosupps Protein Bars me mbushje të butë, të cilat jo vetëm që janë të pasura me proteina, por dallohen edhe për shijen dhe teksturën unike. Në çdo kafshatë do të gjeni përbërës me cilësi premium, teksturë perfekte dhe një përvojë të parezistueshme shijeje – sikur po hani ëmbëlsirë, por pa ndjenjë faji!</p><p><strong>SHIJET E DISPONUESHME:</strong></p><ul><li>Glazed Cinnamon Roll – role e ëmbël dhe aromatike me kanellë</li><li>Brownie Fudge – shije intensive çokollate dhe kremoze</li><li>Cookie Dough – shije e brumit amerikan të biskotave me copa krokante çokollate proteinike</li><li>Pancake Maple Syrup – petulla me shurup panje, përvojë e ëmbël si për mëngjes</li></ul><p><strong>PSE TA ZGJIDHNI NANOSUPPS PROTEIN BAR TË RE?</strong></p><ul><li><strong>Burim premium i proteinave</strong> – kombinim i proteinës së qumështit, proteinës së bizeles dhe kolagjenit për mbështetjen e muskujve.</li><li><strong>Mbushje e butë dhe kremoze</strong> – nuk është një shufër tipike e thatë proteinike. Tekstura speciale kremoze shkrihet në gojë.</li><li><strong>Formulë e re, inovative</strong> – me përbërje të balancuar të makronutrientëve dhe pa sheqer të shtuar.</li><li><strong>Përmbajtje e lartë e proteinave (28%)</strong> – kontribuon në rikuperim, ndjenjë ngopjeje dhe mbështetje të stilit aktiv të jetesës.</li><li><strong>Më pak sheqer, më shumë shije</strong> – ëmbëlsues të përzgjedhur me kujdes për ëmbëlsi të shkëlqyer pa sheqer të panevojshëm.</li><li><strong>Vakt i lehtë perfekt pas stërvitjes, në lëvizje ose në punë</strong> – ushqyese, dhe njëkohësisht me përvojë ëmbëlsire.</li></ul><p><strong>PËR KË E REKOMANDOJMË?</strong></p><ul><li>Për persona me stil aktiv jetese, sportistë dhe entuziastë të fitnesit</li><li>Për ata që duan proteinë cilësore në formë të shijshme</li><li>Për të gjithë ata që duan të shijojnë një vakt të lehtë të ëmbël, por me vetëdije</li><li>Për adhuruesit e ëmbëlsirave të cilët vështirë se do të besojnë se kjo është një shufër proteinike</li></ul><p><strong>PSE ËSHTË KAQ E VEÇANTË?</strong></p><p>Sepse kjo nuk është një shufër proteinike mesatare. Kombinimi perfekt i burimeve të përzgjedhura me kujdes të proteinave, mbushjes së butë dhe kremoze dhe shijeve të frymëzuara nga ëmbëlsirat krijon një përvojë unike.</p><p>Kjo nuk është thjesht një shufër proteinike – ky është një kapitull i ri në botën e vakteve të lehta proteinike.</p><p>Dëshironi ta ndieni ndryshimin? Zgjidhni Nanosupps Protein Bar – aty ku performanca dhe kënaqësia bashkohen.</p><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 55 g / 12 x 55 g</p><p></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 shufër (55 g).',
    InstructionsForUseDescriptionAl = N'Paralajmërim: konsumi i tepërt mund të ketë efekt laksativ. Ruajeni në vend të freskët dhe të thatë (12–22°C). Mbajeni larg nxehtësisë dhe dritës direkte.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2142;

-- ProductId: 2161 (OLIMP PURE WHEY ISOLATE 95)
UPDATE dbo.Products
SET
    NameAl = N'OLIMP PURE WHEY ISOLATE 95',
    DescriptionAl = N'<ul><li>Izolat i proteinave të hirrës (WPI) me cilësi të lartë</li><li>I përftuar me mikrofiltrim „cross-flow“</li><li>I pasuruar me aminoacide BCAA</li><li>Përmbajtje e ulët e yndyrnave dhe sheqernave</li></ul><p><strong>Izolat i proteinave të hirrës në pluhur. Suplement ushqimor me ëmbëlsues.</strong></p><p><strong>OLIMP Pure Whey Isolate 95</strong> është një formulë me cilësi të lartë e izolatit të pastër të proteinave të hirrës (WPI), pa laktozë, e destinuar për plotësimin e marrjes ditore të proteinave te personat fizikisht aktivë dhe sportistët. Izolati i proteinave të hirrës është përftuar përmes një procesi special të <strong>mikrofiltrimit „cross-flow“</strong>.</p><p>Izolati i proteinave të hirrës përbën një burim proteinash me cilësi të lartë dhe është i përshtatshëm si për sportistët profesionistë, ashtu edhe për të gjithë personat fizikisht aktivë.</p><p><strong>KARAKTERISTIKAT E PRODUKTIT:</strong></p><ul><li>I pasuruar me aminoacide BCAA</li><li>Përmbajtje e ulët e yndyrnave dhe sheqernave</li><li>Pa laktozë</li><li>Përzihet dhe përgatitet lehtësisht</li></ul><p>Proteinat kontribuojnë në <strong>rritjen dhe ruajtjen e masës muskulore</strong>, si dhe në ruajtjen e kockave normale.</p><p><em>Rekomandohet ushqyerje e larmishme dhe e balancuar dhe një stil i shëndetshëm jetese.</em></p><p><strong>Sasia neto:</strong> 600 g / 2200 g / 1800 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (35 g).',
    InstructionsForUseDescriptionAl = N'Është më së miri t''i keni proteinat pranë vetes në çdo kohë. Shtoni një porcion në 100 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25-30 sekonda.
Merrni 1-3 porcione në ditë me vakte - pas zgjimit, pas stërvitjes dhe para gjumit. PARALAJMËRIM: Doza e rekomanduar ditore nuk duhet të tejkalohet. Suplementet ushqimore nuk janë zëvendësim për një ushqyerje të balancuar dhe të larmishme. Të ruhet larg arritjes së fëmijëve! Ruajeni në vend të thatë dhe të freskët. Nxehtësia dhe drita direkte e diellit mund të dëmtojnë paketimin.

Shtoni një porcion në 100 ml ujë, qumësht ose pijen e preferuar dhe shtoni 3-4 kuba akulli. Përzieni në blender për 20-30 sekonda ose derisa pija të arrijë konsistencën e dëshiruar.
Shtoni 1 porcion në 115 ml ujë. Konsumojeni menjëherë pas përgatitjes.',
    InstructionsOnHowToUseItAl = N'Duke shtuar fruta të freskëta ose të ngrira, gjalpë kikiriku, vaj kokosi ose përbërës dhe shtesa të tjera ushqyese, mund ta shndërroni lehtësisht shejkun tuaj në një vakt të larmishëm dhe ushqyes.'
WHERE Product_Id = 2161;

-- ProductId: 2168 (OLIMP WHEY PROTEIN COMPLEX 100%)
UPDATE dbo.Products
SET
    NameAl = N'OLIMP WHEY PROTEIN COMPLEX 100%',
    DescriptionAl = N'<ul><li>Burim i lehtë dhe praktik i proteinave me cilësi të lartë</li><li>Përmbajtje e lartë e proteinave dhe aminoacideve</li><li>Vetëm 134 kcal për porcion</li><li>Vetëm 1,4 g sheqerna për porcion</li></ul><p><strong>Koncentrat proteinash në pluhur. Suplement ushqimor me sheqerna dhe ëmbëlsues.</strong></p><p><strong>Whey Protein Complex 100%</strong> është një formulë proteinike e krijuar si një mënyrë praktike për plotësimin e marrjes ditore të proteinave. Kombinon <strong>izolat të proteinave të hirrës CFM dhe koncentrat të proteinave të hirrës</strong>, duke siguruar një burim proteinash me cilësi të lartë dhe një profil të pasur aminoacidesh.</p><p>Produkti është i përshtatshëm si për personat që punojnë për <strong>rritjen e masës muskulore</strong>, ashtu edhe për ata që janë në periudhë të uljes së peshës trupore dhe duan të sigurojnë marrjen e duhur të proteinave.</p><p>Lëndët e para që përdoren për prodhimin e <strong>Whey Protein Complex 100%</strong> dallohen për shkallë të lartë pastërtie. Teknologjia moderne e prodhimit, si dhe përvoja shumëvjeçare e ekipit profesional të Olimp Labs, mundësojnë krijimin e një formule proteinike me cilësi të lartë.</p><p>Kombinimi i <strong>dy burimeve të proteinave të hirrës</strong>, përmbajtja e ulët e yndyrnave të ngopura dhe sheqernave dhe profili i pasur i aminoacideve e bëjnë Whey Protein Complex 100% një zgjedhje popullore midis sportistëve dhe rekreativëve.</p><p>Proteinat kontribuojnë në <strong>rritjen dhe ruajtjen e masës muskulore</strong>, si dhe në ruajtjen e kockave normale.</p><p>Whey Protein Complex 100% siguron:</p><ul><li>Burim praktik të proteinave me cilësi të lartë</li><li>Përmbajtje të lartë të proteinave dhe aminoacideve</li><li>Proteina që kontribuojnë në rritjen dhe ruajtjen e masës muskulore</li><li>134 kcal për porcion</li><li>Vetëm 1,4 g sheqerna për porcion</li></ul><p>Produkti është i destinuar për <strong>persona fizikisht aktivë dhe sportistë</strong>, veçanërisht për ata që punojnë në zhvillimin dhe ruajtjen e masës muskulore.</p><p>Mos e tejkaloni dozën e rekomanduar ditore të shënuar në paketim. Produkti nuk duhet të përdoret si zëvendësim për një ushqyerje të larmishme dhe të balancuar.</p><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 600 g / 700 g / 1800 g / 2270 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 35 g (1 lugë matëse). Për shijen Double Chocolate, madhësia e porcionit është 37 g (1 lugë matëse).',
    InstructionsForUseDescriptionAl = N'Merrni 1–3 porcione në ditë – para mëngjesit, ndërmjet vakteve, pas stërvitjes ose para gjumit. PARALAJMËRIM: Nuk është i përshtatshëm për diabetikët. Të ruhet larg arritjes së fëmijëve!',
    InstructionsOnHowToUseItAl = N'Shtoni 1 porcion në 150 ml ujë. Konsumojeni menjëherë pas përgatitjes.'
WHERE Product_Id = 2168;

-- ProductId: 2169 (OPTIMUM CASEIN)
UPDATE dbo.Products
SET
    NameAl = N'OPTIMUM CASEIN',
    DescriptionAl = N'<ul><li>Përthithje graduale e proteinave</li><li>Disponueshmëri afatgjatë e aminoacideve</li><li>Ndihmon në mbrojtjen e masës muskulore nga shpërbërja</li><li>Ideale për përdorim para gjumit</li></ul><p><strong>Proteinë kazeine në pluhur për përgatitjen e pijes, me ëmbëlsues.</strong></p><p><strong>100% CASEIN PROTEIN – KARAKTERISTIKAT:</strong></p><ul><li>24 g përzierje e instantizuar e proteinave të kazeinës me tretje të ngadaltë</li><li>E pasur me kazeinë micelare me veprim të theksuar antikatabolik</li><li>Mbi 9 g BCAA, glutaminë dhe prekursorë të glutaminës për lugë matëse</li><li>Vetëm 3–4 g karbohidrate për porcion</li><li>E pasuruar me AMINOGEN®</li></ul><p><strong>NDONJËHERË MË NGADALË ËSHTË MË MIRË – VEÇANËRISHT KUR BËHET FJALË PËR TRETJEN DHE PËRTHITHJEN E PROTEINAVE.</strong></p><p>Ndërsa përthithja e shpejtë e proteinave është e dëshirueshme menjëherë para ose pas stërvitjes, çlirimi gradual i aminoacideve mund të jetë veçanërisht i dobishëm gjatë pjesës tjetër të ditës dhe gjatë natës.</p><p><strong>Proteinat e kazeinës</strong> janë të ndjeshme ndaj pH-it dhe formojnë xhel në mjedisin acidik të stomakut. Për këtë arsye, zbërthimi i tyre në aminoacide mund të zgjasë dukshëm më shumë në krahasim me proteinat e hirrës dhe burimet e tjera të proteinave.</p><p>Pikërisht për shkak të kësaj tretjeje graduale dhe çlirimit të zgjatur të aminoacideve, kazeina shpesh përshkruhet si <strong>proteinë antikatabolike</strong>, gjegjësisht proteinë që ndihmon në ruajtjen dhe mbrojtjen e masës muskulore.</p><p><strong>Casein Protein</strong> është ideale për përdorim ndërmjet vakteve dhe para gjumit. Për shkak të tretjes së saj të ngadaltë dhe furnizimit gradual me aminoacide, shpesh quhet edhe <strong>„proteinë e natës“</strong> dhe është veçanërisht e përshtatshme për t''u konsumuar menjëherë para gjumit.</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse e plotë (pesha e porcionit varet nga shija).',
    InstructionsForUseDescriptionAl = N'Është më së miri t''i keni proteinat pranë vetes në çdo kohë. Shtoni një porcion në 300-350 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25-30 sekonda.
Përdorni 100% proteinë kazeine si gjënë e parë në mëngjes, menjëherë para gjumit, në vend të vakteve të vogla dhe/ose në çdo kohë tjetër kur nevojitet përthithje e vonuar e proteinave.

Shtoni një porcion në 300-350 ml ujë, qumësht ose pijen e preferuar dhe shtoni 3-4 kuba akulli. Përzieni në blender për 20-30 sekonda ose derisa pija të arrijë konsistencën e dëshiruar.
Shtoni një porcion në një gotë shaker të mbushur me 300-350 ml ujë ose pijen tuaj të preferuar.',
    InstructionsOnHowToUseItAl = N'Duke shtuar fruta të freskëta ose të ngrira, gjalpë kikiriku, vaj kokosi ose përbërës dhe shtesa të tjera ushqyese, mund ta shndërroni lehtësisht shejkun tuaj në një vakt të larmishëm dhe ushqyes.'
WHERE Product_Id = 2169;

-- ProductId: 2171 (OPTIMUM GOLD STANDARD 100% ISOLATE)
UPDATE dbo.Products
SET
    NameAl = N'OPTIMUM GOLD STANDARD 100% ISOLATE',
    DescriptionAl = N'<ul><li>25 g izolat 100% i pastër i proteinave të hirrës me cilësi të lartë për porcion</li><li>Zgjedhje e shkëlqyer si shejk proteinik, para dhe pas stërvitjes</li><li>Mbështet rritjen dhe ruajtjen e masës muskulore</li><li>Ultrafiltruar për pastërti të jashtëzakonshme</li><li>I certifikuar nga Informed Choice</li></ul><p><strong>Izolat i aromatizuar i proteinave të hirrës në pluhur për përgatitjen e pijes, me ëmbëlsues.</strong></p><p>Nëse dëshironi të rrisni marrjen ditore të proteinave, <strong>Optimum Nutrition Gold Standard 100% Isolate Whey Protein</strong> ofron një formulë me cilësi të lartë me numër minimal përbërësish shtesë.</p><p><strong>ON Gold Standard 100% Isolate</strong> është krijuar për persona fizikisht aktivë që kërkojnë një burim proteinash me cilësi të lartë. Proteinat kontribuojnë në <strong>rritjen dhe ruajtjen e masës muskulore</strong>, si dhe në ruajtjen e kockave normale.</p><p>Proteina është <strong>e ultrafiltruar për pastërti të jashtëzakonshme</strong>. Për prodhimin përdoren proteina hirre me cilësi të lartë të cilat kalojnë nëpër disa procese filtrimi me qëllim uljen e përmbajtjes së yndyrnave dhe karbohidrateve. Një pjesë e izolatit të proteinave të hirrës është e hidrolizuar më tej, gjegjësisht e zbërthyer në zinxhirë më të shkurtër aminoacidesh.</p><p>Çdo porcion siguron:</p><ul><li><strong>25 g proteina</strong></li><li>Deri në <strong>0,3 g sheqerna</strong></li><li>Deri në <strong>0,4 g yndyrna</strong></li><li><strong>83% proteina</strong></li><li><strong>5,5 g aminoacide BCAA të pranishme natyrshëm</strong></li></ul><p><strong>Optimum Nutrition Gold Standard 100% Isolate</strong> mund të përdoret para stërvitjes, pas stërvitjes ose gjatë ditës si një shejk praktik proteinik për plotësimin e marrjes ditore të proteinave.</p><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 930 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse e plotë (30 g).',
    InstructionsForUseDescriptionAl = N'Konsumojeni para stërvitjes për të nxitur rritjen e masës së pastër muskulore, pas stërvitjes për të mbështetur rikuperimin ose në çdo kohë gjatë ditës si një shejk i shijshëm proteinik.',
    InstructionsOnHowToUseItAl = N'Shtoni 30 g (1 lugë matëse e mbushur) në 200 ml ujë të ftohtë dhe përzieni, tundeni ose përzieni në blender derisa të tretet.'
WHERE Product_Id = 2171;

-- ProductId: 2172 (OPTIMUM WHEY PROTEIN GOLD STANDARD)
UPDATE dbo.Products
SET
    NameAl = N'OPTIMUM WHEY PROTEIN GOLD STANDARD',
    DescriptionAl = N'<ul><li>Proteina e hirrës më e shitur në botë</li><li>24 g proteina me cilësi të lartë – kontribuojnë në rritjen dhe ruajtjen e masës muskulore</li><li>5,5 g aminoacide BCAA të pranishme natyrshëm</li><li>Përmbajtje e ulët e sheqernave – vetëm 0,7 g për porcion**</li></ul><p><strong>Proteinë në pluhur për përgatitjen e pijes, me ëmbëlsues. Përmbajtje e lartë e proteinave. Përmbajtje e ulët e sheqernave.</strong></p><p>Për më shumë se 30 vjet, <strong>OPTIMUM NUTRITION</strong> është një markë e njohur në fushën e ushqyerjes sportive dhe është e pranishme në më shumë se 90 vende anembanë botës. Produktet zhvillohen sipas standardeve të larta të cilësisë, me qëllim që të sigurojnë mbështetje të sigurt dhe praktike për personat fizikisht aktivë dhe sportistët.</p><p><strong>Optimum Nutrition GOLD STANDARD 100% WHEY</strong> është një nga proteinat e hirrës më të njohura dhe më të shitura në botë. Çdo porcion siguron <strong>24 g proteina të hirrës me cilësi të lartë</strong>, të cilat kontribuojnë në rritjen dhe ruajtjen e masës muskulore.</p><p>Pas stërvitjes, organizmi i përdor proteinat si pjesë e procesit të rimëkëmbjes dhe rigjenerimit të indit muskulor. Çdo porcion përmban edhe <strong>5,5 g aminoacide BCAA të pranishme natyrshëm</strong>.</p><p>Në varësi të shijes së zgjedhur**, një porcion përmban përafërsisht:</p><ul><li><strong>24 g proteina</strong></li><li><strong>5,5 g aminoacide BCAA</strong></li><li><strong>1,3 g yndyrna</strong></li><li><strong>0,7 g sheqerna</strong></li><li><strong>1,3 g karbohidrate</strong></li></ul><p><strong>GOLD STANDARD 100% WHEY™</strong> mund të konsumohet në mëngjes, para stërvitjes ose menjëherë pas stërvitjes, si një mënyrë praktike për plotësimin e marrjes ditore të proteinave.</p><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 180 g / 450 g / 908 g / 2270 g / 4500 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse e plotë (~ 30 g). Pesha e porcionit varet nga shija (shihni informacionet për vlerën ushqyese).',
    InstructionsForUseDescriptionAl = N'Është më së miri t''i keni proteinat pranë vetes në çdo kohë. Shtoni një porcion në 180-240 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25-30 sekonda.
Konsumoni 1-3 shejkë në ditë në varësi të nevojave për proteina. PARALAJMËRIM: Nuk është i destinuar për përdorim nga persona me gjendje të mëparshme mjekësore ose persona që marrin barna, persona nën 18 vjeç ose gra shtatzëna ose që ushqejnë me gji.

Shtoni një porcion në 180-240 ml ujë, qumësht ose pijen e preferuar dhe shtoni 3-4 kuba akulli. Përzieni në blender për 20-30 sekonda ose derisa pija të arrijë konsistencën e dëshiruar.
Përzieni një porcion me 180-240 ml ujë të ftohtë dhe përzieni, tundeni ose përzieni në blender derisa të tretet.',
    InstructionsOnHowToUseItAl = N'Duke shtuar fruta të freskëta ose të ngrira, gjalpë kikiriku, vaj kokosi ose përbërës dhe shtesa të tjera ushqyese, mund ta shndërroni lehtësisht shejkun tuaj në një vakt të larmishëm dhe ushqyes.'
WHERE Product_Id = 2172;

-- ProductId: 2173 (PROTEINI.SI 100% NATURAL WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI 100% NATURAL WHEY PROTEIN',
    DescriptionAl = N'<ul><li>100% natyral</li><li>Pa aroma artificiale, ngjyra dhe shije të shtuara</li><li>I ëmbëlsuar me ëmbëlsues nga bima e stevias</li></ul><p><strong>Proteinë në pluhur me përmbajtje të lartë proteinash, enzimë laktazë dhe ëmbëlsues. Suplement ushqimor.</strong></p><p><strong>100% NATURAL WHEY PROTEIN</strong></p><p>100% Natural Whey Protein përmban një përzierje të <strong>koncentratit të proteinave të hirrës dhe izolatit të proteinave të hirrës</strong>, të cilat përbëjnë burime proteinash me cilësi të lartë. Produkti është plotësisht pa ëmbëlsues, aroma dhe ngjyra artificiale të shtuara.</p><p>Proteinat janë të rëndësishme për funksionimin normal të organizmit dhe kontribuojnë në <strong>rritjen dhe ruajtjen e masës muskulore</strong>, si dhe në ruajtjen e kockave normale.</p><p>Marrja e rekomanduar ditore e proteinave është 2–3 g për kilogram peshë trupore.</p><p><strong>PËRFITIMET:</strong></p><ul><li>100% natyral</li><li>Pa aroma artificiale, ngjyra dhe shije të shtuara</li><li>I ëmbëlsuar me ëmbëlsues nga bima e stevias</li><li>I disponueshëm në paketime praktike prej 400 g, 500 g, 30 g dhe 35 × 30 g</li></ul><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 400 g / 500 g / 35 × 30 g / 30 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 30 g (1 lugë matëse ose 1 qese).',
    InstructionsForUseDescriptionAl = N'Merrni 1-3 porcione në ditë - në mëngjes, gjatë ditës gjatë vakteve, pas stërvitjes ose para gjumit. Paralajmërim: Të ruhet larg arritjes së fëmijëve! Mos e tejkaloni dozën e rekomanduar ditore! Produkti nuk duhet të përdoret si zëvendësim për një ushqyerje të shëndetshme dhe të balancuar. Rekomandojmë një ushqyerje të balancuar dhe një stil të shëndetshëm jetese.',
    InstructionsOnHowToUseItAl = N'Përzieni 1 porcion me 150-200 ml ujë të ftohtë ose qumësht.'
WHERE Product_Id = 2173;

-- ProductId: 2191 (PROTEINI.SI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI PROTEIN BAR',
    DescriptionAl = N'<h2>Bombë proteinike në një botim të shijshëm</h2><p>Mbushuni me energji dhe proteina! <strong>Proteini.si Protein Bar</strong> ofron një kombinim të shkëlqyer të proteinave dhe karbohidrateve në raport 1:2, <strong>për energji dhe mbështetje të muskujve</strong>, në 12 variante të shijshme.</p><h2>Gjysmë porcion proteinë në vetëm një shufër proteinike</h2><p>Çdo <strong>Proteini.si Protein Bar</strong> përmban gjysmë porcion proteinë – <strong>12,5 g proteina</strong>, gjë që e bën ideale si <strong>vakt i lehtë i shpejtë dhe ushqyes pas stërvitjes</strong>, veçanërisht kur nuk keni shaker me vete.</p><h2>Kënaqësi e ëmbël pa ndjenjë faji</h2><p>Meritoni një pushim të shijshëm! <strong>Proteini.si Protein Bar</strong> ofron <strong>shije të shkëlqyer të pasur me proteina, vitamina dhe karbohidrate</strong> – pa ndjenjë faji.</p><p><strong>Shufër proteinike.</strong></p><p>Merrni <strong>Proteini.si Protein Bar</strong> si një mëngjes të shpejtë për një fillim të mbarë të ditës, si një vakt i lehtë praktik ndërmjet vakteve ose si burim proteinash pas aktivitetit fizik – pavarësisht nëse bëhet fjalë për vrapim, çiklizëm, alpinizëm, not, stërvitje fitnesi apo aktivitet tjetër.</p><p><strong>Proteini.si Protein Bar</strong> ka përmbajtje të lartë të proteinave, të cilat kontribuojnë në rritjen dhe ruajtjen e masës muskulore.</p><p>Falë teknologjisë moderne të prodhimit, <strong>Proteini.si Protein Bar</strong> ka teksturë të butë dhe shije të shkëlqyer. Raporti proteina : karbohidrate është <strong>1:2</strong>.</p><ul><li>Raport i shkëlqyer çmim-cilësi</li><li>23 g proteina në 100 g</li><li>Burim i fibrave bimore</li><li>Pa gluten</li></ul><p>Kjo shufër e shijshme proteinike është bërë nga përbërës me cilësi të lartë dhe përmban vitamina <strong>B1, B2, B3, acid pantotenik, B6, B7, acid folik dhe B12</strong>, në sasi prej përafërsisht <strong>16–17,5% të marrjes ditore referuese për shufër</strong>.</p><p>Pasi ta provoni, vështirë se do të dëshironi një tjetër!</p><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 55 g / 24 × 55 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'Pas hapjes, produkti është i destinuar për përdorim të menjëhershëm. PARALAJMËRIM: Nuk është i destinuar për fëmijë nën 3 vjeç. Ruajeni në vend të thatë në temperaturë që nuk kalon 25°C dhe larg rrezeve direkte të diellit. Mos e ngrini. Prodhuesi nuk mban përgjegjësi për asnjë dëm të shkaktuar nga përdorimi ose ruajtja e gabuar.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2191;

-- ProductId: 2192 (PROTEINI.SI PROTEIN BAR SPECIAL EDITION)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI PROTEIN BAR SPECIAL EDITION',
    DescriptionAl = N'<ul><li>Shufër proteinike perfekte me përmbajtje të lartë proteinash</li><li>Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore</li><li>Shije të shijshme „Special Edition“</li><li>Vakt i lehtë praktik dhe i shijshëm në çdo kohë të ditës</li><li>Zgjedhje ideale pas aktivitetit fizik</li><li>Pa gluten</li></ul><p><strong>Shufër proteinike me përmbajtje të lartë proteinash dhe ëmbëlsues.</strong></p><p>Shufra proteinike është një vakt i lehtë i shijshëm dhe praktik që mund ta konsumoni në çdo kohë të ditës – si një mëngjes i shpejtë, si një vakt i lehtë ndërmjet vakteve kryesore ose pas aktivitetit fizik për marrje shtesë të proteinave.</p><p>Proteinat kontribuojnë në <strong>rritjen dhe ruajtjen e masës muskulore</strong>.</p><p>Falë teknologjisë moderne të prodhimit, <strong>Proteini.si Protein Bar</strong> ka teksturë jashtëzakonisht të butë dhe shije të shkëlqyer. Tani është e disponueshme në paketim të ri dhe në variante të përzgjedhura posaçërisht, të shijshme „Special Edition“.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li>Shufër proteinike shumë e shijshme</li><li>Raport i shkëlqyer çmim-cilësi</li><li>23 g proteina në 100 g</li><li>Pa gluten</li><li>E disponueshme në 3 shije të shijshme „SPECIAL EDITION“: banane-kokos, çokollatë-lajthi dhe akullore vaniljeje</li></ul><p><em>Ushqyerja e balancuar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 50 g / 20 × 50 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'Pas hapjes, produkti është i destinuar për përdorim të menjëhershëm. PARALAJMËRIM: Nuk është i destinuar për fëmijë nën 3 vjeç. Ruajeni në vend të thatë në temperaturë që nuk kalon 25°C dhe larg rrezeve direkte të diellit. Mos e ngrini. Prodhuesi nuk mban përgjegjësi për asnjë dëm të shkaktuar nga përdorimi ose ruajtja e gabuar.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2192;

-- ProductId: 2194 (PROTEINI.SI PROTEIN COOKIE)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI PROTEIN COOKIE',
    DescriptionAl = N'<ul><li>Biskotë proteike perfekte</li><li>Shije e dyfishtë çokollate me copa të vërteta çokollate</li><li>20% proteina / 8 g proteina për biskotë</li><li>Përmbajtje e ulët sheqernash – vetëm 1,4 g për biskotë</li><li>E përshtatshme për vegjetarianë dhe veganë</li><li>Teksturë e shkëlqyer dhe shije e pasur</li></ul><p><strong>Biskotë proteike me kënaqësi të dyfishtë çokollate!</strong></p><p>Po kërkoni një meze të përsosur që kombinon shijen e shkëlqyer dhe përbërjen e mirë ushqyese? <strong>Biskota jonë proteike me shije të dyfishtë çokollate dhe copa të vërteta çokollate</strong> është krijuar pikërisht për këtë.</p><ul><li><strong>Shije e dyfishtë çokollate + copa çokollate</strong> – për një shije intensive që do të kënaqë edhe adhuruesit më të mëdhenj të çokollatës</li><li><strong>20% proteina</strong>, gjegjësisht <strong>8 g proteina për biskotë</strong> – zgjedhje praktike pas stërvitjes ose si meze e ngopshme gjatë ditës</li><li><strong>Përmbajtje e ulët sheqernash – vetëm 1,4 g për biskotë</strong></li><li><strong>E përshtatshme për vegjetarianë dhe veganë</strong> – formulë 100% bimore</li><li><strong>Me ëmbëlsues</strong> – ekuilibër i shkëlqyer midis shijes dhe përbërjes ushqyese</li></ul><p>Biskota jonë proteike paraqet një kombinim të shkëlqyer të shijes, teksturës dhe prakticitetit. Merreni me vete në punë, në palestër ose kur jeni në lëvizje – sa herë që keni nevojë për një meze të shpejtë dhe të shijshme.</p><p><strong>Shijoni kënaqësinë e çokollatës me marrje shtesë të proteinave!</strong></p><p><em>Ushqimi i balancuar dhe i larmishëm, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 40 g / 12 × 40 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 biskotë (40 g).',
    InstructionsForUseDescriptionAl = N'PARALAJMËRIM: Konsumi i tepërt mund të shkaktojë efekte laksative. E përshtatshme për vegjetarianë dhe veganë. Ruajeni në vend të freskët dhe të thatë, larg dritës së drejtpërdrejtë të diellit.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2194;

-- ProductId: 2209 (PROTEINI.SI PROTEIN SHAKE RTD)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI PROTEIN SHAKE RTD',
    DescriptionAl = N'<ul><li>Pije proteike e gatshme për t''u konsumuar menjëherë</li><li>25 g proteina për paketim</li><li>Përdorim praktik</li><li>Shije e shkëlqyer</li><li>Pa laktozë</li><li>Pa yndyrna</li></ul><p><strong>Pije me përmbajtje të lartë proteinash, pa laktozë, me ëmbëlsues. Pa yndyrna.</strong></p><p>Pija me përmbajtje të lartë proteinash, e bazuar në proteinën e qumështit, është e destinuar për konsum të menjëhershëm dhe mundëson marrje praktike të proteinave. Falë paketimit praktik, mund ta konsumoni në çdo kohë dhe kudo.</p><p>Shejku proteik është i destinuar për persona fizikisht aktivë që duan të sigurojnë marrje shtesë të proteinave pas stërvitjes. Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore. Shejku RTD mund të përdoret edhe si meze praktike kur jeni në lëvizje ose nuk keni kohë për një vakt të rregullt.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li>E gatshme për konsum të menjëhershëm</li><li>25 g proteina për paketim</li><li>168 kcal për paketim</li><li>Burim i shkëlqyer proteinash kur jeni në lëvizje</li><li>Me bazë proteine qumështi</li><li>Pa laktozë (&lt;0,1 g/100 ml)</li><li>Pa yndyrna (0,1 g/100 ml)</li><li>Proteinat kontribuojnë në ruajtjen dhe rritjen e masës muskulore dhe në ruajtjen e kockave normale</li></ul><p><em>Ushqimi i balancuar dhe i larmishëm, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 330 ml / 8 × 330 ml</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'E pahapur ruajeni në temperaturë nga (+ 5°C deri në + 25°C). Tundeni mirë para përdorimit. Pas hapjes, ruajeni në frigorifer (+ 3°C deri në + 9°C) dhe përdoreni brenda 24 orëve.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2209;

-- ProductId: 2210 (PROTEINI.SI PROTEIN WAFER)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI PROTEIN WAFER',
    DescriptionAl = N'<ul><li>Vafer krokant me përmbajtje të lartë proteinash, i mbushur me karamel kremoz</li><li>Ekuilibër i përsosur midis shijes dhe përbërjes ushqyese</li><li>Meze praktike kur jeni në lëvizje</li><li>Dy shije të shijshme</li></ul><p><strong>Vafer me përmbajtje të lartë proteinash, i mbuluar me çokollatë qumështi. Pa sheqer të shtuar*. Me ëmbëlsues.</strong></p><p><strong>Meze e shijshme dhe krokante për një mënyrë jetese aktive!</strong></p><p>Ju prezantojmë <strong>Protein Wafer me karamel</strong> – kombinimi i përsosur i shijes së shkëlqyer dhe përbërjes së mirë ushqyese. Çdo vafer i lehtë dhe krokant është i mbushur me një shtresë të pasur karameli kremoz dhe përmban një sasi të lartë proteinash.</p><p>Vaferi është krijuar për të ofruar një ekuilibër të shkëlqyer midis shijes dhe prakticitetit, duke e bërë atë një meze ideale në çdo kohë të ditës – pas stërvitjes, si meze pasditeje ose sa herë që dëshironi diçka të ëmbël.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li><strong>Përmbajtje e lartë proteinash:</strong> Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore.</li><li><strong>Vafer krokant dhe karamel:</strong> Kombinim i shijshëm i mbushjes me karamel kremoz dhe shtresave të lehta e krokante të vaferit.</li><li><strong>Pa sheqer të shtuar:</strong> Përmban sheqerna të pranishme natyralisht*.</li><li><strong>I përsosur kur jeni në lëvizje:</strong> I paketuar individualisht dhe praktik për ta mbajtur në çantën sportive, çantën e shpinës ose çantën e dorës.</li></ul><p><strong>IDEAL PËR:</strong></p><ul><li>Para ose pas stërvitjes</li><li>Si meze gjatë ditës ose alternativë për ëmbëlsirë</li><li>Marrje shtesë të proteinave kur jeni në lëvizje</li></ul><p>Shijoni një meze proteike praktike, të shijshme dhe krokante që përshtatet lehtësisht në mënyrën aktive të jetesës.</p><p><em>Ushqimi i balancuar dhe i larmishëm, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong></p><p>37 g / 24 × 37 g (<strong>Kokos-Karamel</strong>)</p><p>39 g / 24 × 39 g (<strong>Kikirik-Karamel</strong>)</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 vafer (37 g ose 39 g).',
    InstructionsForUseDescriptionAl = N'PARALAJMËRIM: Konsumi i tepërt mund të shkaktojë efekte laksative. Ruajeni në vend të freskët dhe të thatë.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2210;

-- ProductId: 2212 (PROTEINI.SI SNICKS)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI SNICKS',
    DescriptionAl = N'<ul><li>Bar proteik me shije të ngjashme me Snickers, me marrje shtesë të proteinave pas stërvitjes</li><li>30% proteina dhe përmbajtje e ulët sheqernash</li><li>Meze e shijshme dhe e ngopshme pa ndjenjë faji</li><li>Kënaqësi me vlerë funksionale</li></ul><p><strong>Bar proteik me ëmbëlsues.</strong></p><p><strong>SNICKS</strong> është një bar proteik me përmbajtje të lartë proteinash, i frymëzuar nga shija karakteristike e Snickers. Kombinon çokollatën, karamelin, kikirikët dhe nugatin, duke siguruar njëkohësisht <strong>15 g proteina për bar</strong>.</p><p>Pavarësisht nëse e konsumoni pas stërvitjes, kur ju hahet diçka e ëmbël ose si meze praktike kur jeni në lëvizje, SNICKS ofron një kombinim të shkëlqyer të shijes dhe përbërjes ushqyese.</p><p><strong>KARAKTERISTIKAT KRYESORE:</strong></p><ul><li><strong>Përmbajtje e lartë proteinash:</strong> Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore dhe ndihmojnë që bari të jetë më i ngopshëm.</li><li><strong>Përmbajtje e ulët sheqernash:</strong> Më pak se 3 g sheqerna për bar.</li><li><strong>Karamel dhe kikirikë:</strong> Kikirikë të vërtetë të pjekur për teksturë krokante dhe karamel për shije karakteristike të ëmbël.</li><li><strong>Mbulesë çokollate:</strong> Mbulesë e pasur me çokollatë qumështi për shije edhe më të mirë.</li></ul><p><strong>PËRFITIMET:</strong></p><ul><li><strong>Pas stërvitjes:</strong> Përmbajtja e lartë e proteinave kontribuon në ruajtjen dhe rritjen e masës muskulore.</li><li><strong>Meze e ngopshme:</strong> Kombinim i shijes së shkëlqyer dhe përmbajtjes së lartë të proteinave, i përshtatshëm midis vakteve.</li><li><strong>Praktik:</strong> Ideal kur jeni në lëvizje dhe dëshironi një meze të shpejtë proteike.</li><li><strong>Kënaqësi e ëmbël me profil më të mirë ushqyes:</strong> Zgjedhje e shkëlqyer kur dëshironi diçka me çokollatë me më pak sheqerna dhe më shumë proteina.</li></ul><p><strong>IDEAL PËR:</strong></p><ul><li><strong>Pas stërvitjes:</strong> Për marrje shtesë të proteinave pas aktivitetit fizik.</li><li><strong>Si meze gjatë ditës:</strong> Opsion praktik dhe i ngopshëm midis vakteve.</li><li><strong>Kur jeni në lëvizje:</strong> Meze proteike e shpejtë dhe praktike.</li><li><strong>Kur ju hahet diçka e ëmbël:</strong> Alternativë e shijshme me përmbajtje të lartë proteinash dhe përmbajtje të ulët sheqernash.</li></ul><p>Provoni <strong>SNICKS</strong> dhe shijoni kombinimin e çokollatës, karamelit, kikirikëve dhe proteinave!</p><p><em>Ushqimi i balancuar dhe i larmishëm, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 50 g / 28 × 50 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 bar (50 g).',
    InstructionsForUseDescriptionAl = N'Konsumojeni menjëherë pas hapjes. PARALAJMËRIM: Konsumi i tepërt mund të shkaktojë efekte laksative. Nuk është i destinuar për fëmijë nën 12 vjeç. Ruajeni në vend të thatë dhe të errët, në temperaturë nën 25°C dhe larg dritës së drejtpërdrejtë të diellit. Mos e ngrini.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2212;

-- ProductId: 2213 (PROTEINI.SI VEGAN PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI VEGAN PROTEIN',
    DescriptionAl = N'<ul><li>Shejk proteik vegan i shijshëm në pluhur</li><li>Me vitamina B5 dhe B12 dhe hekur</li><li>I pasur me aminoacide BCAA</li><li>Shije: çokollatë, çokollatë-lajthi dhe fruta mali</li></ul><p><strong>Suplement ushqimor me sheqer dhe ëmbëlsues. Koncentrat i proteinave bimore me vitaminë B5, vitaminë B12 dhe hekur të shtuar.</strong></p><p>Ky shejk proteik vegan përmban një kombinim të burimeve të ndryshme të proteinave bimore për të siguruar një spektër të gjerë të <strong>aminoacideve</strong>, si esenciale ashtu edhe joesenciale. Pjesën më të madhe e përbëjnë proteinat e bizeles dhe grurit, ndërsa proteinat e kokosit, orizit dhe kungullit janë të pranishme në sasi më të vogël.</p><p>Proteina e bizeles është veçanërisht e pasur me <strong>aminoacidet esenciale BCAA</strong> leucinë, izoleucinë dhe valinë, si dhe me argininë. Përveç kësaj, proteina e bizeles kontribuon në ndjenjën e ngopjes.</p><p>Meqenëse ushqimi vegan përjashton burimet shtazore të lëndëve ushqyese, produkti është i pasuruar me <strong>vitaminë B12</strong> dhe mineralin <strong>hekur</strong>, lëndë ushqyese burimet e rëndësishme të të cilave shpesh janë me origjinë shtazore.</p><p>Produkti është i përshtatshëm edhe për personat që kërkojnë një alternativë ndaj proteinave të qumështit ose të sojës.</p><p><em>Ushqimi i balancuar dhe i larmishëm, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 500 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 30 g (¾ lugë matëse).',
    InstructionsForUseDescriptionAl = N'Në ditët e stërvitjes, merrni 1 porcion pas stërvitjes. Në ditët e pushimit, merrni 1 porcion në çdo kohë të ditës. PARALAJMËRIM: Doza e rekomanduar ditore e shënuar nuk duhet të tejkalohet. Mos e përdorni si zëvendësim për një dietë të balancuar. Mbajeni larg arritjes së fëmijëve!',
    InstructionsOnHowToUseItAl = N'Përzieni 1 porcion me 300 ml ujë.'
WHERE Product_Id = 2213;

-- ProductId: 2220 (SNICKERS HI PROTEIN BAR (NEW))
UPDATE dbo.Products
SET
    NameAl = N'SNICKERS HI PROTEIN BAR (NEW)',
    DescriptionAl = N'<ul><li>Shije fenomenale Snickers</li><li>20 g proteina për bar (55 g)</li><li>Burime të proteinave të qumështit</li></ul><p><strong>Bar proteik me përmbajtje të lartë proteinash, me shtresë karameli dhe kikirikësh, i mbuluar me çokollatë qumështi.</strong></p><p>Bari i ri <strong>Snickers HI Protein</strong> prej 55 g është një version pak më i vogël dhe përmban:</p><ul><li>20 g proteina nga qumështi dhe proteina e hirrës (whey)</li><li>213 kcal</li></ul><p><strong>Snickers Hi Protein Bar</strong> është një kombinim i shijshëm i kikirikëve, karamelit dhe çokollatës, me qendër të butë nugati.</p><p>Falë paketimit praktik individual, mund të mbahet lehtësisht në çantën sportive dhe është një zgjedhje e shkëlqyer si meze proteike pas stërvitjes.</p><p><strong>Sasia neto:</strong> 55 g / 12 × 55 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Nuk është i përshtatshëm për vegjetarianë. Të ruhet në vend të freskët dhe të thatë, i mbrojtur nga drita e drejtpërdrejtë e diellit.',
    InstructionsForUseDescriptionAl = NULL,
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2220;

-- ProductId: 2221 (SNICKERS HI PROTEIN LOW SUGAR BAR, 57g)
UPDATE dbo.Products
SET
    NameAl = N'SNICKERS HI PROTEIN LOW SUGAR BAR, 57g',
    DescriptionAl = N'<p></p><ul><li>Bar proteik i shijshëm Snickers me përmbajtje të lartë proteinash</li><li>Përmbajtje e ulët sheqernash – 2 g</li><li>Përmbajtje e lartë proteinash – 20 g</li><li>Meze e shkëlqyer pas stërvitjes</li></ul><p><strong>Bar proteik me përmbajtje të lartë proteinash dhe përmbajtje të ulët sheqernash, me shtresa kikirikësh dhe karameli, i mbuluar me çokollatë qumështi.</strong></p><p><strong>Snickers Hi Protein Low Sugar Bar</strong> është versioni proteik i çokollatës së njohur Snickers. Ndryshe nga versioni klasik, ky është përshtatur për të përmbajtur më shumë proteina dhe një sasi minimale sheqernash. Nëse jeni adhurues i Snickers, ky është një variant që ia vlen ta provoni.</p><p>Me <strong>20 g proteina për bar</strong>, ky version përmban nugat të shijshëm, shtresë të trashë karameli dhe kikirikë, të gjitha të mbuluara me çokollatë të ëmbël qumështi.</p><p>Për adhuruesit e SNICKERS, ky është një kombinim i shkëlqyer i shijes karakteristike dhe një profili më të mirë proteinik.</p><p><strong>Sasia neto:</strong> 57 g / 12 × 57 g</p><p></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Nuk është i përshtatshëm për vegjetarianë. Të ruhet në vend të freskët dhe të thatë, i mbrojtur nga drita e drejtpërdrejtë e diellit.',
    InstructionsForUseDescriptionAl = NULL,
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2221;

-- ProductId: 2222 (USN 100% WHEY PREMIUM PROTEIN - BAG, 2000g)
UPDATE dbo.Products
SET
    NameAl = N'USN 100% WHEY PREMIUM PROTEIN - BAG, 2000g',
    DescriptionAl = N'<ul><li><p>Shejk me përmbajtje të lartë proteinash</p></li><li><p>Shije e shkëlqyer</p></li><li><p>Deri në 25 g proteina për porcion</p></li><li><p>5 g BCAA për porcion</p></li><li><p>58 porcione</p></li></ul><p><strong>Përzierje për përgatitjen e një pijeje me përmbajtje të lartë proteinash me ëmbëlsues.</strong></p><p>100% Whey Protein Premium është forma më e pastër e një kompleksi unik të proteinave të hirrës (whey). Përmban një dozë të lartë proteinash, të cilat kontribuojnë në rritjen dhe ruajtjen e masës muskulore. Produkt ideal për të mbështetur qëllimet tuaja të lidhura me forcën dhe stërvitjen.</p><ul><li><p>Deri në 25 g proteina me cilësi të lartë për porcion</p></li><li><p>5 g BCAA të pranishme natyralisht për porcion</p></li><li><p>Mbështetje optimale për muskujt dhe rikuperimin</p></li><li><p>Shije e shkëlqyer</p></li><li><p>58 porcione</p></li></ul><p><strong>Sasia neto:</strong> 2000 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'- Madhësia e një porcioni: 1 lugë matëse (34 g).',
    InstructionsForUseDescriptionAl = N'- Konsumoni 2–4 porcione në ditë, të shpërndara gjatë ditës, para dhe pas stërvitjes.',
    InstructionsOnHowToUseItAl = N'- Shtoni 1 porcion në 150–200 ml ujë të ftohtë.
- Përzieni direkt në gotë me pirun ose përzieni në blender/shejker për rreth 30 sekonda.'
WHERE Product_Id = 2222;

-- ProductId: 2226 (USN BLUE LAB 100% WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'USN BLUE LAB 100% WHEY PROTEIN',
    DescriptionAl = N'<ul><li><p>26 g proteina të hirrës (whey) të nivelit të lartë për porcion</p></li><li><p>Shije e shkëlqyer dhe formulë që tretet lehtë</p></li><li><p>Përzierje proteinash e tretshme lehtë – 100% nga proteina e hirrës</p></li><li><p>Mbështet zhvillimin dhe rikuperimin e muskujve</p></li></ul><p><strong>QËLLIME TË NDRYSHME, NJË PROTEINË WHEY</strong></p><p>E mbështetur nga shkenca, e përsosur nga ju. USN Blue Lab Whey është projekti i parë kërkimor-zhvillimor (R&amp;D) në industri i bazuar në reagimet e konsumatorëve, me qëllim që të sigurojë proteinën e hirrës me shijen më të mirë dhe cilësinë më të lartë deri më tani! E përbërë nga koncentrat, izolat dhe hidrolizat i proteinave të hirrës, USN Blue Lab Whey siguron 26 g proteina për porcion, 5800 mg aminoacide BCAA dhe vetëm 1,6 g sheqerna, duke e bërë ideale për ruajtjen e masës së pastër muskulore.</p><p><strong>E PASUR ME PROTEINA ME CILËSI TË LARTË</strong></p><p>Nëse jemi ajo që hamë, atëherë është jashtëzakonisht e rëndësishme që të gjithë të marrim mjaftueshëm proteina, sepse ato luajnë një rol të rëndësishëm në strukturën dhe funksionimin e trupit. Që muskujt të rikuperohen dhe të rriten, duke mbështetur mënyrën tuaj aktive të jetesës, trupi ka nevojë për një sasi të mjaftueshme proteinash.</p><p><strong>MASË E PASTËR MUSKULORE</strong></p><p>Proteinat e hirrës (whey) të USN janë formuluar shkencërisht për ruajtjen optimale të masës së pastër muskulore. Përdorim vetëm proteina me cilësinë më të lartë për t''ju ndihmuar të arrini qëllimet tuaja dhe të nxirrni maksimumin nga çdo stërvitje.</p><p><strong>E PASURUAR ME AMINOACIDE</strong></p><p>Të njohura si blloqet ndërtuese të proteinave, aminoacidet përbëjnë një pjesë të madhe të muskujve dhe qelizave tona dhe kryejnë shumë funksione të rëndësishme në trup. Ato janë thelbësore për shërimin dhe rigjenerimin e indeve, veçanërisht të indit muskulor. Shtimi i aminoacideve në suplementet tona ushqimore i përmirëson ndjeshëm përfitimet e lidhura me rikuperimin e muskujve.</p><p><strong>ZHVILLIMI I MUSKUJVE</strong></p><p>Formulat tona premium përmbajnë proteina të hirrës me cilësinë më të lartë, aminoacide dhe përbërës të tjerë të provuar, duke siguruar një suplement ushqimor të optimizuar për zhvillim maksimal të muskujve.</p><p><strong>TRETSHMËRI OPTIMALE</strong></p><p>Tolerase™ L është një laktazë e qëndrueshme ndaj acideve e cila zbërthen laktozën në glukozë dhe galaktozë. Është zhvilluar dhe patentuar posaçërisht për përdorim në suplemente ushqimore dhe suplemente sportive të destinuara për persona me intolerancë ndaj laktozës, duke u mundësuar atyre t''i shijojnë më lehtë këto dhe produkte të tjera të qumështit.</p><p>Burimi: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'1 dozë: 34 g (1 lugë matëse/scoop) / 2 doza: 68 g (2 lugë matëse/scoops)',
    InstructionsForUseDescriptionAl = N'Përshtatni marrjen e proteinave me 1–5 doza, në varësi të qëllimit tuaj fizik dhe nevojave individuale për proteina. Paralajmërim: Ruajeni produktin në vend të freskët dhe të thatë, jashtë arritjes së fëmijëve. Ndiqni një dietë të larmishme dhe të balancuar dhe një mënyrë të shëndetshme jetese.',
    InstructionsOnHowToUseItAl = N'Një dozë përzieni me 150–200 ml ujë të ftohtë. Dy doza përzieni me 300–400 ml ujë të ftohtë. Tundeni mirë për 30 sekonda, lëreni të qëndrojë për 60 sekonda dhe më pas tundeni përsëri para konsumimit.'
WHERE Product_Id = 2226;

-- ProductId: 2227 (USN CASEIN NIGHT TIME PROTEN, 908g, Vanilla)
UPDATE dbo.Products
SET
    NameAl = N'USN CASEIN NIGHT TIME PROTEN, 908g, Vanilla',
    DescriptionAl = N'<ul><li><p>Kazeinë micelare premium</p></li><li><p>Proteina me çlirim gradual</p></li><li><p>Para gjumit ose gjatë ditës</p></li><li><p>Për rritjen dhe ruajtjen e masës muskulore</p></li></ul><p><strong>RRITJE OPTIMALE E MUSKUJVE DHE RIKUPERIM</strong></p><p>USN Casein Night Time Protein është ideal për të gjithë ata që duan ta shfrytëzojnë maksimalisht periudhën e rikuperimit me një shejk premium me shije të shkëlqyer dhe tretje të ngadaltë. Trupi rigjenerohet më së shumti gjatë gjumit, ndërsa USN Casein ju siguron një shejk me proteinë që tretet më ngadalë se proteinat e tjera të disponueshme. Formula jonë premium përmban kazeinë micelare me cilësi të lartë dhe shije të shkëlqyer, e pasuruar me Aiminogen.</p><p><strong>E PASUR ME PROTEINA ME CILËSI TË LARTË</strong></p><p>Nëse jemi ajo që hamë, atëherë është jashtëzakonisht e rëndësishme që të gjithë të marrim mjaftueshëm proteina, sepse ato luajnë një rol të rëndësishëm në strukturën dhe funksionimin e trupit. Që muskujt të rikuperohen dhe të rriten, duke mbështetur mënyrën tuaj aktive të jetesës, trupi ka nevojë për një sasi të mjaftueshme proteinash.</p><p><strong>MASË E PASTËR MUSKULORE</strong></p><p>Proteinat e hirrës (whey) të USN janë formuluar shkencërisht për ruajtjen optimale të masës së pastër muskulore. Përdorim vetëm proteina me cilësinë më të lartë për t''ju ndihmuar të arrini qëllimet tuaja dhe të nxirrni maksimumin nga çdo stërvitje.</p><p><strong>E PASURUAR ME AMINOACIDE</strong></p><p>Të njohura si blloqet ndërtuese të proteinave, aminoacidet përbëjnë një pjesë të madhe të muskujve dhe qelizave tona dhe kryejnë shumë funksione të rëndësishme në trup. Ato janë thelbësore për shërimin dhe rigjenerimin e indeve, veçanërisht të indit muskulor. Shtimi i aminoacideve në suplementet tona ushqimore i përmirëson ndjeshëm përfitimet e lidhura me rikuperimin e muskujve.</p><p><em>Shënon datën deri në të cilën produkti ushqimor ruan vetitë e tij specifike, si shija, aroma, pamja, karakteristikat e tjera specifike të produktit dhe përmbajtja e vitaminave, me kusht që të ruhet siç duhet dhe paketimi të mos jetë i hapur.</em></p><p>Burimi: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 2 lugë matëse (30 g). Mënyra më e mirë për ta pasur gjithmonë proteinën tuaj pranë. Shtoni një porcion në 250 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25–30 sekonda.',
    InstructionsForUseDescriptionAl = N'Merrni 1 porcion para gjumit. PARALAJMËRIM: Produkti nuk është i përshtatshëm për gra shtatzëna, gra gjidhënëse dhe persona nën 18 vjeç. Mos e tejkaloni dozën e rekomanduar ditore. Produkti nuk duhet të përdoret si zëvendësim për një dietë të balancuar dhe një mënyrë të shëndetshme jetese. 
PËRGATITJA NË BLENDER
Shtoni një porcion në 250 ml ujë, qumësht ose pije sipas dëshirës, pastaj shtoni 3–4 kuba akulli. Përzieni në blender për 20–30 sekonda ose derisa pija të arrijë dendësinë e dëshiruar.',
    InstructionsOnHowToUseItAl = N'Përzieni një porcion në 250 ml ujë dhe përzieni ose tundeni mirë.'
WHERE Product_Id = 2227;

-- ProductId: 2229 (USN DYNAMIC WHEY)
UPDATE dbo.Products
SET
    NameAl = N'USN DYNAMIC WHEY',
    DescriptionAl = N'<ul><li><p>Shake proteinik i shijshëm</p></li><li><p>25 g proteina për porcion</p></li><li><p>Formulë me cilësi të lartë</p></li><li><p>Tretshmëri e shkëlqyer dhe përthithje e shpejtë</p></li></ul><p>Ne besojmë se çdokush duhet të ketë qasje në ushqyerje cilësore me çmime të përballueshme. Linja jonë Essentials bazohet në besimin se standardet e larta të USN për ushqyerje premium mund të ruhen edhe me çmime më të arsyeshme.</p><p>Kemi krijuar një suplement ushqimor bazë me proteina të hirrës (whey) që ju siguron gjithçka që ju nevojitet nga një shake proteinik për të mbështetur qëllimet tuaja, duke kombinuar lëndët ushqyese kyçe dhe cilësinë e lartë me një çmim të shkëlqyer.</p><p>Është e thjeshtë – falë biodisponibilitetit të lartë, ju sigurojmë sasinë e nevojshme të proteinave për të mbështetur rikuperimin dhe rritjen e muskujve.</p><p>Duke u udhëhequr nga kjo filozofi, kemi krijuar një shake me proteina të hirrës që jo vetëm ofron përbërje të shkëlqyer ushqyese, por ka edhe shije fantastike.</p><ul><li><p>25 g proteina për porcion</p></li><li><p>Formulë e USN me cilësi të lartë</p></li><li><p>Aroma të shijshme</p></li></ul>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Përzieni 1 lugë matëse (34 g) me 200 ml ujë të ftohtë.',
    InstructionsForUseDescriptionAl = N'Konsumoni 2–4 porcione në ditë. PARALAJMËRIM: Doza ditore e rekomanduar nuk duhet të tejkalohet. Suplementet ushqimore nuk janë zëvendësim për një dietë të ekuilibruar dhe të larmishme. Të ruhet larg arritjes së fëmijëve! Të ruhet në vend të freskët dhe të thatë. Nxehtësia dhe drita e drejtpërdrejtë e diellit mund ta dëmtojnë paketimin.',
    InstructionsOnHowToUseItAl = N'Shtoni një porcion në afërsisht 150–200 ml ujë të ftohtë. Përzieni direkt në gotë me pirun ose përzieni në blender apo shaker për rreth 30 sekonda.'
WHERE Product_Id = 2229;

-- ProductId: 2230 (USN ISOPRO 100% WHEY PROTEIN ISOLATE)
UPDATE dbo.Products
SET
    NameAl = N'USN ISOPRO 100% WHEY PROTEIN ISOLATE',
    DescriptionAl = N'<ul><li><p>Proteinë nga një burim i vetëm (izolat i pastër i proteinave të hirrës)</p></li><li><p>Përthithje e shpejtë e proteinave</p></li><li><p>Formuluar shkencërisht për të mbështetur zhvillimin e muskujve*</p></li><li><p>72 porcione</p></li></ul><p><strong>Përzierje për përgatitjen e pijes me përmbajtje të lartë proteinash dhe ëmbëlsues.</strong></p><p>Ndërtoni masë muskulore të pastër me këtë formulë me izolat të pastër dhe të ultrafiltruar të proteinave të hirrës.</p><p>IsoPro është një formulë superiore me izolat të pastër të proteinave të hirrës, e cila mbështet zhvillimin e masës muskulore të pastër dhe përshpejton rikuperimin e muskujve. Ky burim ultrapremium i proteinave ka biodisponibilitet jashtëzakonisht të lartë, përmbajtje të ulët yndyrash dhe nuk përmban sheqer të shtuar.</p><ul><li><p><strong>Izolat i proteinave të hirrës:</strong> proteinë me cilësi të lartë që ndihmon në ndërtimin e masës muskulore të pastër, rigjenerimin e muskujve dhe formimin e indeve të reja.</p></li><li><p><strong>BCAA dhe EAA:</strong> ndihmojnë në sintezën e proteinave, rritjen e muskujve dhe rritjen e forcës. Gjithashtu ndihmojnë në ruajtjen e masës muskulore.</p></li></ul><p><em>Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore.</em></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 1800 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (25 g) ose 2 lugë matëse (50 g).',
    InstructionsForUseDescriptionAl = N'Përshtatni marrjen e proteinave në varësi të qëllimeve tuaja fizike dhe nevojave për proteina. Për rezultatet më të mira, konsumoni produktin gjatë ditës, para dhe pas stërvitjes. Të ruhet në vend të freskët dhe të thatë, larg arritjes së fëmijëve të vegjël. Përmbahuni një diete të larmishme dhe të ekuilibruar dhe një stili jetese të shëndetshëm.',
    InstructionsOnHowToUseItAl = N'Përzieni 1 lugë matëse (25 g) me 150–200 ml ujë të ftohtë ose 2 lugë matëse (50 g) me 300–400 ml ujë të ftohtë. Tundeni mirë për 30 sekonda, lëreni të qëndrojë 60 sekonda dhe më pas tundeni përsëri para konsumimit.'
WHERE Product_Id = 2230;

-- ProductId: 2234 (USN TRUST CRUNCH BAR)
UPDATE dbo.Products
SET
    NameAl = N'USN TRUST CRUNCH BAR',
    DescriptionAl = N'<ul><li><p>20 g proteina</p></li><li><p>Vetëm 2 g sheqerna</p></li><li><p>Ndihmon në rigjenerimin e muskujve dhe kufizimin e marrjes së kalorive</p></li><li><p>Shijoni një meze të shijshme pa ndjenja faji, që do të plotësojë dëshirën për të ëmbla</p></li></ul><p><strong>Biskotë proteinike me përmbajtje të lartë proteinash dhe fibrash bimore, me glazurë çokollate dhe ëmbëlsues.</strong></p><p>Duke i çuar mezet e shijshme dhe të shëndetshme në një nivel tjetër, USN Trust Crunch e re kombinon shije të parezistueshme me një përbërje të shkëlqyer ushqyese.</p><p>Çdo bar i shijshëm përmban më shumë se 20 g proteina me cilësi të lartë dhe vetëm 2 g sheqer, duke ndihmuar në zhvillimin e muskujve gjatë gjithë ditës dhe duke kufizuar njëkohësisht marrjen e kalorive të panevojshme.</p><p>Trust Crunch është e disponueshme në shtatë shije joshëse: karamel i kripur dhe kikirikë, fudge brownie, brumë biskotash me çokollatë të bardhë, biskota dhe krem, çokollatë e trefishtë, cheesecake me mjedër dhe qershi dhe çokollatë. Zgjedhja perfekte për të shuar dëshirën për të ëmbla gjatë orëve të pasdites.</p><p>Mos bëni kompromis me shijen dhe gëzojuni mezes suaj të ardhshme të shëndetshme me barin e ri proteinik Trust Crunch prej 60 g, të cilin mund ta shijoni pa ndjenja faji.</p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 60 g / 12 × 60 g</p><p>Burimi: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'Ruajeni në vend të freskët dhe të thatë. Paralajmërim: Konsumimi i tepërt mund të ketë efekt laksativ. Sigurohuni që të ndiqni një stil jetese të ekuilibruar dhe të shëndetshëm.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2234;

-- ProductId: 2239 (OPTIMUM GOLD STANDARD 100% WHEY (NEW))
UPDATE dbo.Products
SET
    NameAl = N'OPTIMUM GOLD STANDARD 100% WHEY (NEW)',
    DescriptionAl = N'<ul><li><p>Mbështetje për rritjen dhe rigjenerimin e muskujve pas stërvitjes</p></li><li><p>Proteina e hirrës pluhur nr. 1 (më e shitura) në botë</p></li><li><p>24 g proteina të hirrës pluhur premium me cilësi të lartë dhe përthithje të shpejtë për porcion</p></li><li><p>5,5 g aminoacide BCAA në çdo porcion</p></li><li><p>E disponueshme në shije të ndryshme</p></li></ul><p><strong>Proteina të hirrës pluhur për përgatitjen e pijes, me ëmbëlsues.</strong></p><p><strong>Çfarë janë proteinat e hirrës (whey)?</strong></p><p>Proteinat e hirrës janë proteina me cilësi të lartë dhe përthithje të shpejtë, të përftuara nga burim qumështi dhe të pasura me aminoacide esenciale. Proteinat mbështesin rritjen dhe rigjenerimin e masës muskulore të pastër.</p><p><strong>Përfitimet për performancën fizike:</strong></p><ul><li><p>24 g proteina të hirrës premium për porcion për të mbështetur rritjen dhe ruajtjen e masës muskulore.</p></li><li><p>Më pak se 120 kalori për porcion, gjë që e bën të përshtatshme për qëllime të ndryshme ushqimore.</p></li><li><p>5,5 g aminoacide të degëzuara natyrale (BCAA) për porcion, të cilat mbështesin rigjenerimin e muskujve.</p></li></ul><p><strong>Kur ta përdorni produktin:</strong></p><ul><li><p><strong>Pas stërvitjes:</strong> Konsumojeni pas aktivitetit fizik për të nxitur rigjenerimin e muskujve dhe për të përmbushur nevojat ditore për proteina.</p></li><li><p><strong>Ndërmjet vakteve:</strong> Përdoreni si meze të ndërmjetme për të mbështetur ruajtjen e masës muskulore.</p></li><li><p><strong>Si pjesë e ushqyerjes së përditshme:</strong> Përfshijeni në dietë për të plotësuar nevojat ditore për proteina dhe për të mbështetur stilin tuaj aktiv të jetesës.</p></li></ul><p><strong>Pse ta zgjidhni këtë produkt?</strong></p><p>Shijoni më shumë se 15 aroma të shijshme, si Double Rich Chocolate ose Vanilla Ice Cream, të cilat e shndërrojnë shake-un tuaj pas stërvitjes në një shpërblim të shijshëm. Atij i besojnë sportistët në mbarë botën, dhe është zgjedhur si "Proteina më e mirë pluhur" në Men’s Health Sport Nutrition Awards 2024. Kjo është një proteinë e nivelit të lartë për ata që synojnë rezultate serioze.</p><p><em>Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore gjatë stërvitjes së rregullt me rezistencë, siç është stërvitja me pesha.</em></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><em>Pesha neto mund të ndryshojë në varësi të shijes.</em></p><p><strong>Sasia neto:</strong> 780 g / 2000 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse e rrumbullakosur (31 g***).',
    InstructionsForUseDescriptionAl = N'Konsumoni shake-un tuaj pas stërvitjes ose në çdo kohë gjatë ditës. Ruajeni në vend të freskët dhe të thatë.',
    InstructionsOnHowToUseItAl = N'Përzieni një porcion në 180-240 ml ujë të ftohtë. Mund të shtoni gjithashtu një porcion në smoothie, toptha proteinikë, muffins, qull tërshëre ose vakte të tjera.'
WHERE Product_Id = 2239;

-- ProductId: 2240 (M&M'S HI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameAl = N'M&M''S HI PROTEIN BAR',
    DescriptionAl = N'<ul><li><p>Shije e shkëlqyer e bonboneve m&amp;m’s</p></li><li><p>15 g proteina për bar (51 g)</p></li><li><p>Burime proteinash nga qumështi dhe hirra (whey)</p></li><li><p>Më pak yndyra dhe sheqer në krahasim me bonbonet origjinale</p></li></ul><p><strong>Bar proteinik me përmbajtje të lartë proteinash, me shtresa kikirikësh dhe copëza çokollate me qumësht në glazurë sheqeri, të mbuluara me çokollatë me qumësht me sheqer dhe ëmbëlsues. Shija: Kikirikë.</strong></p><p><strong>Bar proteinik me përmbajtje të lartë proteinash, me shtresë copëzash çokollate me qumësht të veshura me sheqer, të mbuluara me çokollatë me qumësht me sheqer dhe ëmbëlsues. Shija: Çokollatë.</strong></p><p>Të gjithë adhuruesit e bonboneve shumëngjyrëshe m&amp;m’s do të mahniten nga bari i ri m&amp;m’s HI PROTEIN, pasi përmban mini bonbone të vërteta m&amp;m’s dhe plot 15 g proteina.</p><p>m&amp;m’s HI PROTEIN është një meze e shkëlqyer në çdo kohë dhe kudo. Falë paketimit të vogël dhe praktik, është perfekt pas stërvitjes ose kur jeni në lëvizje. Mund ta shijoni pas stërvitjes ose në çdo moment gjatë ditës kur dëshironi të rrisni marrjen e proteinave.</p><ul><li><p>192 kcal (shija çokollatë) / 209 kcal (shija kikirikë) për bar (51 g)</p></li><li><p>15 g proteina për bar (51 g)</p></li><li><p>Përmban gjysmën e sasisë së yndyrave dhe sheqerit në krahasim me bonbonet e zakonshme m&amp;m’s (pa proteina të shtuara)</p></li><li><p>Përmban 3 herë më shumë proteina për 100 g produkt në krahasim me m&amp;m’s origjinale me kikirikë</p></li><li><p>Përmban 6 herë më shumë proteina për 100 g produkt në krahasim me m&amp;m’s origjinale me çokollatë</p></li></ul><p><strong>Sasia neto:</strong> 51 g / 12 × 51 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'Nuk është i përshtatshëm për vegjetarianë. Ruajeni në vend të freskët dhe të thatë, të mbrojtur nga drita e drejtpërdrejtë e diellit.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2240;

-- ProductId: 2241 (MARS HI PROTEIN BAR (NEW))
UPDATE dbo.Products
SET
    NameAl = N'MARS HI PROTEIN BAR (NEW)',
    DescriptionAl = N'<ul><li><p>Shije fenomenale e Mars</p></li><li><p>20 g proteina për bar (59 g)</p></li><li><p>Burime proteinash nga SOJA, QUMËSHTI, hirra (whey) dhe VEZËT</p></li></ul><p><strong>Bar proteinik me përmbajtje të lartë proteinash, me shtresë karameli dhe glazurë çokollate me qumësht.</strong></p><p>Bari i ri Mars HI Protein (59 g) është një version pak më i vogël që përmban:</p><ul><li><p>20 g proteina nga SOJA, QUMËSHTI, hirra (whey) dhe VEZËT</p></li><li><p>207 kcal</p></li></ul><p>Mars HI Protein Bar është një kombinim i shijshëm karameli dhe çokollate, me një qendër të butë nugati. Baret Mars HI Protein të paketuara individualisht përshtaten lehtësisht në çdo çantë sportive dhe përbëjnë një meze të shkëlqyer pas stërvitjes.</p><p><strong>Sasia neto:</strong> 59 g / 12 × 59 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = NULL,
    InstructionsForUseDescriptionAl = N'Nuk është i përshtatshëm për vegjetarianë. Ruajeni në vend të freskët dhe të thatë, larg dritës së drejtpërdrejtë të diellit.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2241;

-- ProductId: 2269 (PROTEINI.SI MY NEW WHEY)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI MY NEW WHEY',
    DescriptionAl = N'<ul><li><p>Koncentrat i proteinave të hirrës dhe proteinave të qumështit</p></li><li><p>Me L-leucinë dhe glicinë të shtuara</p></li><li><p>21 g proteina për porcion</p></li><li><p>Raport i shkëlqyer midis çmimit dhe cilësisë</p></li><li><p>10 porcione</p></li></ul><p><strong>Suplement ushqimor me ëmbëlsues. Përmbajtje e lartë proteinash.</strong></p><p><strong>Përzierja e shijshme proteinike Power Protein është një formulë gjithçka-në-një për forcë, rikuperim dhe shije të shkëlqyer.</strong></p><p>E formuluar me koncentrat të proteinave të hirrës dhe proteinave të qumështit, e pasuruar me L-leucinë, ajo siguron proteina me cilësi të lartë që mbështesin rritjen e muskujve dhe rikuperimin më të shpejtë. Glicina kontribuon në një ekuilibër më të mirë të aminoacideve, ndërsa laktaza** përmirëson tretshmërinë dhe mundëson përthithje më të lehtë.</p><p>Kemi shtuar qumësht pluhur instant dhe maltodekstrinë për furnizim të zgjatur me energji, duke krijuar një shake të lëmuar dhe ngopës.</p><p><strong>Shijet e disponueshme:</strong></p><ul><li><p><strong>Çokollatë</strong> – E përgatitur me kakao pluhur të pasur pa yndyrë dhe aromë natyrale çokollate, për një kënaqësi intensive, kremoze dhe luksoze çokollate.</p></li><li><p><strong>Vanilje</strong> – Shije e butë dhe klasike me karakter natyralisht të ëmbël, kremoz dhe nota delikate aromatike – e ekuilibruar në mënyrë perfekte për kënaqësi të përditshme.</p></li><li><p><strong>Biskota dhe krem</strong> – Përzierje e parezistueshme dhe e shijshme e frymëzuar nga ëmbëlsira juaj e preferuar – shije e butë kremoze e kombinuar me nota delikate biskotash për një shake të pasur dhe ngopës.</p></li></ul><p>Shake proteinik me teksturë të lëmuar dhe shije të ekuilibruar.</p><p><strong>Përmirësoni performancën. Rikuperohuni më zgjuar. Shijoni çdo gllënjkë.</strong></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Laktaza</strong> është një enzimë që përmirëson tretjen e laktozës tek personat që kanë vështirësi me tretjen e saj. Konsumoni 4500 njësi FCC me çdo vakt që përmban laktozë. Toleranca ndaj laktozës ndryshon nga personi në person, prandaj kërkoni këshillë për rolin e kësaj substance në dietën tuaj.</p><p><strong>Sasia neto:</strong> 300 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e dozës është 1 lugë matëse (30 g).',
    InstructionsForUseDescriptionAl = N'Doza ditore e rekomanduar: 1-3 porcione (30 - 90 g). Konsumoni gjatë ditës ose pas stërvitjes. Doza maksimale ditore është 3 porcione (90 g). PARALAJMËRIM: Nuk është i destinuar për fëmijë nën 12 vjeç. Rekomandohet një dietë e larmishme dhe e ekuilibruar dhe një stil jetese i shëndetshëm. Enzima laktazë përmirëson tretjen e laktozës tek individët që kanë vështirësi në tretjen e laktozës. Konsumoni 4500 njësi FCC me çdo vakt që përmban laktozë. Toleranca ndaj laktozës është e ndryshueshme dhe duhet të kërkoni këshillë për rolin e kësaj substance në dietën tuaj.',
    InstructionsOnHowToUseItAl = N'Tresni 30 g pluhur (1 lugë matëse) në 250 ml ujë.'
WHERE Product_Id = 2269;

-- ProductId: 2271 (NÄNO SUPPS EGG WHITE PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'NÄNO SUPPS EGG WHITE PROTEIN',
    DescriptionAl = N'<ul><li>Deri në 25 g proteina për porcion
</li>
<li>
Pa laktozë dhe pa gluten
</li>
<li>
Pa yndyra dhe pa sheqer të shtuar
</li>
<li>
Mbështet rritjen e muskujve dhe rikuperimin
</li>
<li>
Ideale për fitnes dhe periudha diete
</li>
</ul>
<p><strong>Pluhur proteinik me ëmbëlsues.</strong></p>
<p>NÄNO Supps Egg White Protein është një alternativë ideale ndaj proteinave klasike të hirrës. I prodhuar nga të bardhat e vezëve me cilësi të lartë, ky pluhur proteinik ka një vlerë biologjike veçanërisht të lartë dhe mbështet në mënyrë efektive rritjen e muskujve, rikuperimin dhe performancën fizike.</p>
<p>Falë formulës pa laktozë, pa gluten dhe pa yndyra, kjo proteinë tolerohet lehtësisht dhe është një zgjedhje e shkëlqyer për një dietë të planifikuar me kujdes. Me deri në 24–25 g proteina për porcion, furnizon në mënyrë optimale trupin me proteina – pas stërvitjes ose gjatë ditës.</p>
<p><strong>Përfitimet kryesore:</strong></p>
<ul>
<li>
Deri në 25 g proteina për porcion
</li>
<li>
80–82% përmbajtje proteinash
</li>
<li>
Pa laktozë dhe pa gluten
</li>
<li>
Pa yndyra
</li>
<li>
Pa sheqer të shtuar (përmban vetëm sheqerna të pranishme natyrshëm)
</li>
<li>
Vlerë e lartë biologjike
</li>
<li>
Ideale për ndërtimin e masës muskulore dhe periudha diete
</li>
</ul>
<p><strong>Pse proteina nga të bardhat e vezëve?</strong></p>
<p>Proteina nga të bardhat e vezëve është një burim proteinash me cilësi të lartë me profil të plotë aminoacidesh. Ajo mbështet rritjen e muskujve, kontribuon në rikuperim dhe siguron një ndjenjë më të zgjatur të ngopjes – ideale për periudha definimi dhe diete.</p>
<p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p>
<p><strong>Sasia neto:</strong> 750 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 1 lugë matëse (30 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni 1 porcion në ditë. Në ditët kur stërviteni, konsumoni porcionin 30 minuta pas stërvitjes, ndërsa në ditët kur nuk stërviteni, në mëngjes pas zgjimit. PARALAJMËRIM: Mos e tejkaloni dozën ditore të rekomanduar. Produkti nuk është zëvendësim për një dietë të ekuilibruar dhe të larmishme. Të ruhet larg arritjes së fëmijëve! MËNYRA E RUAJTJES: Ruajeni produktin të mbyllur mirë, në temperaturë nga 5 deri në 30°C. Të ruhet larg burimeve të drejtpërdrejta të nxehtësisë, lagështisë dhe dritës së diellit. Pas hapjes, produkti nuk duhet të ruhet më gjatë se 6 muaj.',
    InstructionsOnHowToUseItAl = N'Përzieni 1 porcion (30 g) me 250 ml ujë të ftohtë.'
WHERE Product_Id = 2271;

-- ProductId: 2297 (SPORTNAHRUNG WHEY DELUXE (NEW))
UPDATE dbo.Products
SET
    NameAl = N'SPORTNAHRUNG WHEY DELUXE (NEW)',
    DescriptionAl = N'<ul><li><p>Koncentrat i ultrafiltruar i proteinave të hirrës</p></li><li><p>25% përqendrim më i lartë i aminoacideve BCAA**</p></li><li><p>Përmbajtje e ulët sheqeri</p></li><li><p>Shije e shkëlqyer</p></li></ul><p><strong>Pije proteinike pluhur me ëmbëlsues.</strong></p><p>Whey DELUXE është një koncentrat i ultrafiltruar i proteinave të hirrës, i tretshëm lehtësisht dhe me vlerë të lartë biologjike, i cili dallohet për një profil të shkëlqyer aminoacidesh dhe përmbajtje të lartë të aminoacideve BCAA. Krahasuar me llojet e tjera të proteinave**, përmban 25% përqendrim më të lartë të BCAA, gjegjësisht të tre aminoacideve esenciale: leucinë, izoleucinë dhe valinë. Ato ndihmojnë në rritjen e masës muskulore, lehtësimin e dhimbjeve muskulore pas stërvitjes dhe uljen e lodhjes gjatë aktivitetit fizik ose fitnesit.</p><p>Whey DELUXE është gjithashtu i dobishëm për organizmin sepse përmban imunoglobulina të padenatyruara (afërsisht 10%), të cilat kontribuojnë në mbështetjen e sistemit imunitar. Përveç kësaj, produkti tretet gjithmonë në mënyrë të shkëlqyer dhe pa kokrriza në shake-un tuaj!</p><p>Me Whey DELUXE ju ofrojmë jo vetëm një proteinë të shkëlqyer, por edhe aroma veçanërisht të shijshme. Bëhuni gati ta shijoni shake-un tuaj proteinik si kurrë më parë!</p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe mënyra e shëndetshme e jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 1000 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit është 1 lugë matëse (28 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni gjatë ditës ose pas aktivitetit fizik. Doza maksimale ditore është 3 porcione (84 g). PARALAJMËRIME: Doza ditore e rekomanduar e shënuar nuk duhet të tejkalohet. Produkti nuk duhet të përdoret si zëvendësim për një dietë të ekuilibruar. Të ruhet larg arritjes së fëmijëve! RUAJTJA: Të ruhet në vend të errët dhe të thatë, në temperaturë nën 25°C.',
    InstructionsOnHowToUseItAl = N'Tresni 1 porcion në 250 ml ujë.'
WHERE Product_Id = 2297;

-- ProductId: 2298 (SPORTNAHRUNG EVERYDAY WHEY (NEW))
UPDATE dbo.Products
SET
    NameAl = N'SPORTNAHRUNG EVERYDAY WHEY (NEW)',
    DescriptionAl = N'<ul><li><p>Proteina të hirrës të ultrafiltruara</p></li><li><p>Përmban të gjitha 21 aminoacidet proteinogjene</p></li><li><p>Për rritjen dhe ruajtjen e masës muskulore</p></li><li><p>Zgjedhje e shkëlqyer pas stërvitjes ose si burim shtesë proteinash gjatë ditës</p></li><li><p>Ideale si për sportistët ashtu edhe për personat më pak aktivë</p></li></ul><p><strong>Suplement ushqimor me ëmbëlsues. Përmbajtje e lartë proteinash.</strong></p><p>Everyday Whey është një proteinë e shijshme e hirrës e ultrafiltruar me përmbajtje të lartë proteinash. Përmban të gjitha 21 aminoacidet proteinogjene dhe përbën një zgjedhje të shkëlqyer për plotësimin e përditshëm të dietës – pas stërvitjes, ndërmjet vakteve ose sa herë që dëshironi të rrisni marrjen e proteinave.</p><p>Proteinat kontribuojnë në rritjen dhe ruajtjen e masës muskulore, si dhe në ruajtjen e kockave të shëndetshme. Prandaj, Everyday Whey është e përshtatshme për persona aktivë, sportistë rekreativë dhe të gjithë ata që duan të mbështesin një stil jetese të ekuilibruar.</p><p>Është e disponueshme në tre variante të shijshme që do t''ju mahnisin që nga gllënjka e parë. Përshtatet në mënyrë të shkëlqyer në shake-ë proteinikë, qull tërshëre, smoothie, petulla dhe receta të tjera të pasura me proteina, kështu që shpejt do të bëhet një pjesë e pazëvendësueshme e kuzhinës dhe rutinës suaj të përditshme.</p><p><em>Rekomandohet një dietë e larmishme dhe e ekuilibruar dhe një stil jetese i shëndetshëm.</em></p><p><strong>Sasia neto:</strong> 900 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 1 lugë matëse (30 g).',
    InstructionsForUseDescriptionAl = N'DOZA DITORE E REKOMANDUAR: 1–3 porcione (30–90 g). Konsumoni gjatë ditës ose pas aktivitetit fizik. Doza maksimale ditore është 3 porcione (90 g). Laktaza: Enzima laktazë përmirëson tretjen e laktozës tek personat që kanë vështirësi me tretjen e saj. Konsumoni 4.500 njësi FCC me çdo vakt që përmban laktozë. Toleranca ndaj laktozës ndryshon nga personi në person, prandaj kërkoni këshillë për rolin e kësaj substance në dietën tuaj. PARALAJMËRIME: Mos e tejkaloni dozën ditore të rekomanduar. Suplementet ushqimore nuk janë zëvendësim për një dietë të ekuilibruar dhe të larmishme dhe një stil jetese të shëndetshëm. Të ruhet larg arritjes së fëmijëve të vegjël. RUAJTJA: Të ruhet në vend të errët dhe të thatë, në temperaturë nën 25°C.',
    InstructionsOnHowToUseItAl = N'Tresni 30 g pluhur (1 lugë matëse) në 250 ml ujë.'
WHERE Product_Id = 2298;

-- ProductId: 2321 (PROTEINI.SI CRUNCH WHEY BAR)
UPDATE dbo.Products
SET
    NameAl = N'PROTEINI.SI CRUNCH WHEY BAR',
    DescriptionAl = N'<ul><li><p>Meze praktike proteinike për çdo ditë</p></li><li><p>Shije e pasur çokollate me copa krokante</p></li><li><p>20 g proteina në çdo bar</p></li><li><p>Vetëm 1,5 g sheqerna për bar</p></li><li><p>Burim i fibrave bimore</p></li></ul><p><strong>Bar proteinik me një surprizë krokante</strong></p><p>Shpërblejeni veten me CRUNCH WHEY BAR, një bar i shijshëm proteinik që kombinon shijen e pasur të çokollatës me qumësht me një teksturë këndshëm krokante nga copat krokante të kakaos dhe sojës. Me përmbajtje të lartë proteinash dhe si burim i fibrave bimore, ai është zgjedhja e përsosur për të gjithë ata që kërkojnë një meze praktike në ditët dinamike dhe aktive.</p><p>Çdo bar prej 55 g përmban 20 g proteina mbresëlënëse, dhe me vetëm 1,4 g sheqerna për bar, është ideal për të gjithë ata që monitorojnë marrjen e sheqernave pa hequr dorë nga shija e pasur e çokollatës.</p><p>CRUNCH WHEY BAR është një meze praktike në lëvizje, në punë, pas stërvitjes ose sa herë që dëshironi diçka me çokollatë dhe krokante.</p><p><strong>PSE TË ZGJIDHNI CRUNCH WHEY BAR?</strong></p><ul><li><p>20 g proteina për bar për plotësimin e marrjes ditore të proteinave</p></li><li><p>Burim i fibrave bimore për plotësimin e marrjes ditore</p></li><li><p>Vetëm 1,5 g sheqerna për bar</p></li><li><p>Teksturë krokante me copa krokante kakaoje dhe soje</p></li><li><p>Shije e pasur çokollate në variantin me çokollatë me qumësht ose çokollatë të bardhë</p></li><li><p>Paketim praktik, ideal për një stil jetese aktiv</p></li></ul><p>Pavarësisht nëse jeni duke udhëtuar, në punë ose sapo keni përfunduar stërvitjen, CRUNCH WHEY BAR ofron një mënyrë praktike për të plotësuar marrjen e proteinave dhe fibrave bimore. Shijoni kombinimin e përsosur të shijes së çokollatës, teksturës krokante dhe ushqyerjes së ekuilibruar.</p><p><strong>CRUNCH WHEY BAR – aty ku kënaqësia e çokollatës takohet me fuqinë e proteinave!</strong></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 1 bar (55 g).',
    InstructionsForUseDescriptionAl = N'Konsumoni para dhe pas aktivitetit fizik, në varësi të nevojave tuaja energjetike. Produkti është i destinuar për konsum të menjëhershëm pas hapjes.

PARALAJMËRIM: Konsumimi i tepërt mund të shkaktojë efekt laksativ.

RUAJTJA: Të ruhet larg dritës së drejtpërdrejtë të diellit, ndryshimeve ekstreme të temperaturës, aromave të forta dhe lagështisë.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2321;

-- ProductId: 2323 (APPLIED NUTRITION MICELLAR CASEIN PROTEIN POWDER)
UPDATE dbo.Products
SET
    NameAl = N'APPLIED NUTRITION MICELLAR CASEIN PROTEIN POWDER',
    DescriptionAl = N'<p><strong>100% CASEIN – PROTEINË ME ÇLIRIM TË NGADALSHËM DHE KOMPLEKS TË SHTUAR TË ENZIMAVE DIGJESTIVE</strong></p><p>100% Casein Protein nga Applied Nutrition është një zgjedhje e shkëlqyer për të gjithë ata që duan t''u sigurojnë muskujve një furnizim të vazhdueshëm me aminoacide gjatë gjumit, kur marrja e ushqimit ose pijeve është jopraktike. Gjatë kësaj periudhe, organizmi mund të hyjë në gjendje urie dhe të fillojë zbërthimin e indit muskulor, gjë që mund të ndikojë negativisht në rikuperimin muskulor dhe performancën fizike.</p><p>Prandaj, 100% Casein Protein nga Applied Nutrition tretet ngadalë dhe gradualisht, në një periudhë deri në shtatë orë, duke u siguruar muskujve aminoacidet e nevojshme për sintezën e indit muskulor, rigjenerimin dhe rritjen e tij.</p><p>100% Casein Protein ka një profil të plotë aminoacidik dhe përmban aminoacide esenciale me zinxhir të degëzuar (BCAA), të cilat paraqesin blloqet bazë ndërtuese për krijimin e proteinave të reja. Me përmbajtje minimale të yndyrave dhe karbohidrateve, ky produkt përshtatet shkëlqyeshëm në një dietë me marrje të kontrolluar kalorish dhe mbështet arritjen e qëllimeve të dëshiruara të fitnesit.</p><ul><li><p>Ideal për konsumim para gjumit</p></li><li><p>Kontribuon në mirëmbajtjen dhe rritjen e masës muskulore</p></li><li><p>Proteinë me çlirim gradual</p></li><li><p>Me kompleks të shtuar të enzimave digjestive</p></li><li><p>Pa gluten</p></li><li><p>4,1 g acid glutamik i pranishëm natyrshëm për porcion</p></li></ul><p>Çdo seri e këtij produkti testohet për praninë e substancave të ndaluara në kuadër të një programi nën mbikëqyrje të vazhdueshme. Produktet i nënshtrohen testimeve rigoroze në një laborator të akredituar sipas ISO 17025, me qëllim që të sigurohet niveli më i lartë i sigurisë se janë më të sigurta për përdorim nga sportistët.<br><br>GMP<br><br>Ky produkt është prodhuar në një objekt me standarde GMP, nën kontroll të rreptë të cilësisë, me qëllim që të sigurohet cilësi e lartë e vazhdueshme që përmbush kërkesat e autorizimit për vendosje në qarkullim (MA) ose specifikimit të produktit.</p><p><strong>Sasia neto: 900g</strong></p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Përzieni 2 lugë matëse (30 g) me 500 ml ujë ose qumësht në shaker (sa më pak lëng të përdorni, aq më i trashë do të jetë shejku).',
    InstructionsForUseDescriptionAl = N'Tundeni dhe konsumoni. Për rezultate optimale, përdoreni menjëherë para gjumit, por mund të konsumohet edhe ndërmjet vakteve ose 2–3 herë në ditë.',
    InstructionsOnHowToUseItAl = N'Lugët matëse janë të përafërta, prandaj rekomandohet përdorimi i peshores për matje të saktë.'
WHERE Product_Id = 2323;

-- ProductId: 2324 (NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS)
UPDATE dbo.Products
SET
    NameAl = N'NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS',
    DescriptionAl = N'<ul><li><p>E pasur, kremoze dhe e mbushur me proteina</p></li><li><p>11 g proteina për porcion</p></li><li><p>Përmbajtje e ulët e sheqernave</p></li><li><p>Përmbajtje e lartë e fibrave bimore</p></li><li><p>Meze ideale pa ndjenjë faji</p></li></ul><p><strong>Çokollatë me qumësht me mbushje të kripur me gjalpë kikiriku, me proteina qumështi dhe ëmbëlsues.</strong></p><p>Nano Supps Protein Peanut Butter Cups janë versioni kulmor „fit“ i një prej kombinimeve më të njohura të ëmbëlsirave në botë. Të punuara me një shtresë të pasur çokollate me qumësht dhe mbushje kremoze, të kripur me gjalpë kikiriku, këto kupa proteinike ofrojnë një kënaqësi të lartë ëmbëlsirash pa marrje të tepërt të sheqernave.</p><p>Me 11 g proteina dhe vetëm 1,9 g sheqerna për porcion, ato janë meze ideale për të kënaqur dëshirën për të ëmbël, duke mbështetur njëkohësisht rikuperimin muskulor.</p><p><strong>PËRPARËSITË KRYESORE:</strong></p><ul><li><p><strong>Përmbajtje e lartë e proteinave:</strong> Çdo porcion prej 42 g siguron 11 g proteina, duke ju ndihmuar të përmbushni nevojat ditore për proteina ndërsa shijoni një kënaqësi të shijshme të ëmbël.</p></li><li><p><strong>Përmbajtje e ulët e sheqernave:</strong> Të ëmbëlsuara me maltitol dhe eritritol, këto kupa proteinike përmbajnë vetëm 1,9 g sheqerna, gjë që i bën të përshtatshme për mënyra ushqyerjeje me marrje të ulët të karbohidrateve dhe për persona që monitorojnë marrjen e sheqernave.</p></li><li><p><strong>Përmbajtje e lartë e fibrave bimore:</strong> Sigurojnë 2,8 g fibra bimore për porcion.</p></li><li><p><strong>Përbërës cilësorë:</strong> Përmbajnë gjalpë të vërtetë kikiriku, gjalpë kakaoje dhe yndyrë qumështi anhidrike, për një teksturë autentike, kremoze që shkrihet në gojë.</p></li><li><p><strong>Kënaqësi pa kompromis:</strong> Të krijuara si një mënyrë më e zgjuar për të shijuar ëmbëlsirat, duke ju lejuar të ndjeni shijen klasike të gjalpit të kripur të kikirikut dhe çokollatës pa marrje të panevojshme të lartë të sheqernave.</p></li></ul><p>Rekomandohet një ushqyerje e larmishme dhe e ekuilibruar dhe një stil jetese i shëndetshëm.</p><p><strong>Sasia neto:</strong> 42 g / 20 × 42 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 2 kupa (2 × 21 g).',
    InstructionsForUseDescriptionAl = N'PARALAJMËRIM: Konsumimi i tepërt mund të shkaktojë efekt laksativ.

RUAJTJA: Të ruhet në vend të freskët dhe të thatë, larg dritës së drejtpërdrejtë të diellit.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2324;

-- ProductId: 2328 (APPLIED NUTRITION CRITICAL WHEY)
UPDATE dbo.Products
SET
    NameAl = N'APPLIED NUTRITION CRITICAL WHEY',
    DescriptionAl = N'<p><strong>Critical Whey™ Protein</strong></p><p>Critical Whey™ Protein është një kombinim i koncentratit të proteinës së hirrës, izolatit të proteinës së hirrës dhe proteinës së hidrolizuar të hirrës. Koncentrati përftohet me ultrafiltrim, izolati me mikrofiltrim cross-flow, ndërsa proteina e hidrolizuar e hirrës zbërthehet enzimatikisht në peptide. Këto proteina sigurojnë një burim proteinash me cilësi të lartë, të cilat kontribuojnë në rritjen dhe mirëmbajtjen e masës muskulore.¹</p><p><strong>PËRPARËSITË E PRODUKTIT</strong></p><ul><li><p>24 g proteina për porcion nga një përzierje e shumë burimeve të proteinave</p></li><li><p>I testuar sipas programit Informed Protein – është kontrolluar çdo seri e çdo shijeje</p></li><li><p>Vlerë e ulët kalorike</p></li><li><p>Kontribuon në rritjen dhe mirëmbajtjen e masës muskulore</p></li><li><p>Përmbajtje e konfirmuar laboratorikisht e proteinave</p></li><li><p>Tretet menjëherë, me teksturë të lëmuar dhe shije të shkëlqyer</p></li><li><p>Pa gluten dhe sojë, i përshtatshëm për vegjetarianë</p></li><li><p>Prodhuar nga qumësht i përftuar nga lopë të ushqyera me bar</p></li><li><p>Certifikatë Halal</p></li></ul><p><strong>PSE CRITICAL WHEY™ PROTEIN?</strong></p><p>Kombinimi i koncentratit, izolatit dhe hidrolizatit të proteinës së hirrës siguron proteina të hirrës me cilësi të lartë të cilat i vihen shpejt në dispozicion organizmit. Proteinat kontribuojnë në rritjen dhe mirëmbajtjen e masës muskulore, si dhe në mirëmbajtjen e kockave normale.¹ ²</p><p>Aminoacidet janë elementet bazë ndërtuese të proteinave.</p><p><strong>CILËSIA DHE TESTIMI</strong></p><p>Çdo përbërës i kësaj serie i nënshtrohet kontrolleve dhe testimeve të rrepta për praninë e substancave të ndaluara para fillimit të prodhimit, në kuadër të një programi nën mbikëqyrje të vazhdueshme. Produktet përfundimtare më pas prodhohen dhe paketohen në një laborator të akredituar sipas standardeve ISO 22000, BRC, GMP dhe Halal, me qëllim që të sigurohet niveli më i lartë i garancisë për cilësinë e përbërësve.</p><p>Çdo seri e këtij produkti testohet për praninë e substancave të ndaluara në kuadër të programit Informed-Sport. Produktet i nënshtrohen testimeve rigoroze në një laborator të akredituar sipas ISO 17025, me qëllim që të sigurohet niveli më i lartë i sigurisë për sportistët që i përdorin.</p><p>Sasia neto: 825g; 2000g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Përzieni 33 g pluhur (afërsisht 2 lugë matëse) me 250 ml ujë të ftohtë ose qumësht. Për matje më të saktë të porcionit, përdorni peshore.',
    InstructionsForUseDescriptionAl = NULL,
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2328;

-- ProductId: 2329 (APPLIED NUTRITION CRITICAL PLANT PROTEIN)
UPDATE dbo.Products
SET
    NameAl = N'APPLIED NUTRITION CRITICAL PLANT PROTEIN',
    DescriptionAl = N'<p><strong>Critical Plant Protein</strong></p><p>Critical Plant Protein është një përzierje e përsosur proteinash bimore që kombinon izolatin e proteinës së sojës, izolatin e proteinës së bizeleve dhe proteinën e orizit kaf, duke siguruar proteinë bimore në pluhur me cilësi të lartë me spektër të plotë të aminoacideve esenciale dhe më shumë se 24 g proteina për porcion.</p><p>Critical Plant Protein është një zgjedhje e shkëlqyer për të gjithë ata që duan të rrisin marrjen ditore të proteinave. Me një profil të pasur të aminoacideve me zinxhir të degëzuar (BCAA), duke përfshirë leucinën, izoleucinën dhe valinën, ky produkt kontribuon në rritjen dhe mirëmbajtjen e masës muskulore.</p><ul><li><p>Më shumë se 24 g proteina për porcion</p></li><li><p>I përshtatshëm për veganë dhe vegjetarianë</p></li><li><p>Burim bimor i proteinave pa përbërës qumështi</p></li><li><p>Profil i shkëlqyer aminoacidik</p></li><li><p>Përmbajtje e ulët e yndyrave dhe sheqernave</p></li><li><p>Produkt i certifikuar Halal</p></li><li><p>Mbështetja e masës muskulore: Ideal për sportistët dhe adhuruesit e fitnesit që duan të ndërtojnë dhe mirëmbajnë masën muskulore.</p></li><li><p>Kontrolli i peshës trupore: Ndihmon në ruajtjen e ndjenjës së ngopjes, duke kontribuar në kontrollin e peshës trupore.</p></li><li><p>Mbështetje ushqyese: Mundëson një mënyrë praktike për rritjen e marrjes ditore të proteinave dhe mbështetjen e shëndetit të përgjithshëm.</p></li></ul><p>Sasia neto: 450g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Përzieni 1 lugë matëse (30 g) me 300 ml ujë dhe tundeni mirë për 10 sekonda, më pas lëreni të qëndrojë 30 sekonda. Konsumoni 1–3 porcione në ditë.',
    InstructionsForUseDescriptionAl = N'Lugët matëse janë të përafërta, prandaj rekomandohet përdorimi i peshores për matje të saktë.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 2329;

-- ProductId: 2332 (OLIMP Protein Complex 700 g)
UPDATE dbo.Products
SET
    NameAl = N'OLIMP Protein Complex 700 g',
    DescriptionAl = N'<p>Olimp Protein Complex</p><ul><li><p>21 g proteina për porcion – mënyrë praktike për plotësimin e marrjes së proteinave pas stërvitjes, ndërmjet vakteve ose gjatë një dite dinamike</p></li><li><p>Tre burime proteinash në një formulë – izolat i proteinës së qumështit (me kazeinë micelare), proteinë e ultrafiltruar e vezëve dhe koncentrat i proteinës së hirrës</p></li><li><p>Përmbajtje e lartë e proteinave dhe përmbajtje e ulët e sheqernave – me dallime të vogla në varësi të shijes</p></li><li><p>Përgatitje e shpejtë për 10 sekonda – nevojiten vetëm shaker dhe ujë</p></li><li><p>Paketim prej 700 g – deri në 26 porcione</p></li><li><p>Pesë shije për të zgjedhur: Vanilla Dream, Chocolate Royale, Cookies Cream, Toffee Espresso dhe Strawberry Matcha</p></li></ul><p>Olimp Protein Complex është një pije proteinike në pluhur me përmbajtje të lartë proteinash, e krijuar për persona që stërviten profesionalisht ose në mënyrë rekreative dhe duan të sigurojnë marrjen e duhur të proteinave gjatë ditës.</p><p>Një porcion (26 g pluhur) siguron afërsisht 20–21 g proteina nga tre burime plotësuese: izolat i proteinës së qumështit që përmban kazeinë micelare (proteinë me përthithje më të ngadaltë, e përshtatshme, për shembull, për konsumim para gjumit), proteinë e ultrafiltruar e vezëve me profil të favorshëm aminoacidik dhe koncentrat i proteinës së hirrës me përthithje më të shpejtë.</p><p>Formula përmban afërsisht 78–79% proteina për 100 g pluhur dhe ka përmbajtje të ulët sheqernash. Shija e këndshme e shndërron marrjen e përditshme të proteinave në një kënaqësi të vërtetë.</p><p>Produkti është i disponueshëm në pesë shije. Katër prej tyre (Vanilla Dream, Chocolate Royale, Cookies Cream dhe Toffee Espresso) kanë të njëjtën përbërje dhe të njëjtat vlera ushqyese, ndërsa varianti Strawberry Matcha është i pasuruar me çaj jeshil matcha dhe ka përbërje dhe vlera ushqyese paksa të ndryshme.</p><p>PËR KË ËSHTË I DESTINUAR?</p><p>Produkti është i destinuar për persona me nevoja të shtuara për proteina të cilët duan të rrisin masën muskulore, para së gjithash për sportistë profesionistë dhe rekreativë që duan të plotësojnë në mënyrë praktike marrjen e proteinave pas zgjimit, ndërmjet vakteve, pas stërvitjes ose para gjumit.</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'DOZA DITORE E REKOMANDUAR: 1–3 porcione në ditë – pas zgjimit, ndërmjet vakteve, pas stërvitjes ose para gjumit.',
    InstructionsForUseDescriptionAl = N'Tresni 1 porcion (26 g pluhur = ¾ lugë matëse) në 200 ml ujë. Përzieni në shaker të paktën 10 sekonda. Konsumoni menjëherë pas përgatitjes.',
    InstructionsOnHowToUseItAl = N'Për të përshtatur intensitetin e shijes sipas preferencave personale, tresni pluhurin në 200–250 ml ujë ose qumësht.'
WHERE Product_Id = 2332;

-- ProductId: 2333 (OLIMP PURE WHEY ISOLATE 95)
UPDATE dbo.Products
SET
    NameAl = N'OLIMP PURE WHEY ISOLATE 95',
    DescriptionAl = N'<ul><li><p>Izolat i proteinës së hirrës me cilësi të lartë (WPI)</p></li><li><p>I përftuar me teknologjinë e mikrofiltrimit me rrjedhje të kryqëzuar (cross-flow)</p></li><li><p>I pasuruar me aminoacide BCAA</p></li><li><p>Përmbajtje e ulët e yndyrave dhe sheqernave</p></li></ul><p><strong>Izolat i proteinës së hirrës në pluhur. Suplement ushqimor me ëmbëlsues.</strong></p><p>OLIMP Pure Whey Isolate 95 është një formulim me cilësi të lartë i izolatit të pastër të proteinës së hirrës (WPI), pa laktozë, i cili siguron mbështetje për zhvillimin normal të proceseve metabolike gjatë aktiviteteve të ndryshme fizike dhe marrjes së shtuar të proteinave. Izolati i proteinës së hirrës përftohet me një teknologji speciale të mikrofiltrimit me rrjedhje të kryqëzuar (cross-flow).</p><p>Izolati i proteinës së hirrës konsiderohet si një nga burimet më të vlefshme të proteinave në ushqyerje, si për sportistët profesionistë, ashtu edhe për të gjithë personat fizikisht aktivë.</p><p>KARAKTERISTIKAT E PRODUKTIT:</p><ul><li><p>I pasuruar me aminoacide BCAA</p></li><li><p>Përmbajtje e ulët e yndyrave dhe sheqernave</p></li><li><p>Pa laktozë</p></li><li><p>I lehtë për t''u përzier dhe përgatitur</p></li></ul><p>Proteinat kontribuojnë në rritjen dhe mirëmbajtjen e masës muskulore, si dhe në mirëmbajtjen e kockave të shëndetshme.</p><p>Rekomandohet një ushqyerje e larmishme dhe e ekuilibruar dhe një stil jetese i shëndetshëm.</p><p><strong>Sasia neto:</strong> 600 g / 1800 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'PËRDORIMI I REKOMANDUAR: Konsumoni 1–3 porcione në ditë – pas zgjimit, ndërmjet vakteve, pas stërvitjes ose para gjumit. Shtoni 1 porcion (35 g = 1 lugë matëse) në 115 ml¹ ujë. Konsumoni menjëherë pas përgatitjes.',
    InstructionsForUseDescriptionAl = N'Mos e tejkaloni dozën ditore të rekomanduar. Suplementet ushqimore nuk duhet të përdoren si zëvendësim për një ushqyerje të larmishme dhe të ekuilibruar. Rekomandohet një ushqyerje e larmishme dhe e ekuilibruar dhe një stil jetese i shëndetshëm.

Të ruhet larg arritjes së fëmijëve. Produkti i pahapur të ruhet në vend të thatë dhe të freskët.',
    InstructionsOnHowToUseItAl = N'Për të përshtatur intensitetin e shijes sipas preferencave personale, tresni në 100–200 ml ujë.'
WHERE Product_Id = 2333;

-- ProductId: 1025 (BATTERY BREAKFAST)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY BREAKFAST',
    DescriptionAl = N'<ul><li>Vakt i plotë gati në vetëm disa sekonda Mëngjes i shijshëm me vetëm 1,6 g sheqer Zgjedhje e shkëlqyer edhe gjatë humbjes së peshës Promovon rritjen dhe mirëmbajtjen e masës muskulore</li></ul><h3>Pluhur me miell tërshëre, proteina dhe taurinë. Suplement ushqimor me sheqerna dhe ëmbëlsues.</h3><p>Pluhur me miell tërshëre, proteina dhe taurinë. Suplement ushqimor me sheqerna dhe ëmbëlsues. Battery Breakfast është një përzierje e koncentratit të proteinave të hirrës dhe tërshërës së bluar imët. Kjo formulë me shije të shkëlqyer dhe përzierje të lehtë siguron 19 g proteina dhe 22 g karbohidrate me IG të ulët (indeks glicemik), 3,3 g fibra dhe vetëm 1,6 g sheqer në çdo porcion prej 50 g. Vakt i plotë për disa sekonda Mëngjesi juaj me shijen më të mirë me vetëm 1,6 g sheqer Zgjedhje e shkëlqyer edhe gjatë humbjes së peshës Proteinat kontribuojnë në rritjen dhe mirëmbajtjen e masës muskulore Battery Breakfast është gjithashtu i përsosur për personat aktivë në lëvizje të cilëve u duhen vakte të shpejta dhe të lehta plot me lëndë ushqyese. Kjo përzierje e shkëlqyer është përftuar nga tërshëra e pasur me fibra dhe proteinat e hirrës, siguron karbohidrate komplekse së bashku me proteina të hirrës me veprim të shpejtë dhe fibra që ngopin në vetëm një porcion. Proteinat që gjenden në Battery Breakfast vijnë ekskluzivisht nga koncentrati i instantizuar dhe i ultrafiltruar i proteinave të hirrës. Kjo, në kombinim me tërshërën, siguron ekuilibrin delikat të karbohidrateve dhe proteinave që u nevojitet personave të shëndetshëm dhe aktivë. Battery Breakfast mund të përdoret si për shtimin e peshës së pastër ashtu edhe gjatë humbjes së peshës. Informacionet e sakta mbi vlerën ushqyese ju mundësojnë të planifikoni ushqyerjen tuaj deri në kalorinë ose gramin e fundit. Fillojeni ditën me Battery Breakfast!! *E rëndësishme është ushqyerja e ekuilibruar dhe e larmishme dhe stili i shëndetshëm i jetesës. Sasia neto: 1100 g</p>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Më e mira është t''i keni proteinat pranë në çdo kohë. Shtoni një porcion në 200 ml ujë, qumësht ose pijen tuaj të preferuar dhe tundeni për 25-30 sekonda.',
    InstructionsForUseDescriptionAl = N'Për rezultatet më të mira, merrni tre porcione në ditë, mundësisht për/gjatë mëngjesit ose në pushimin ndërmjet vakteve.
 Battery Breakfast mund të përdoret si zëvendësim për një vakt të vërtetë.
 PËR ULJEN E PESHËS: Zëvendësoni dy nga 5 vaktet tuaja të rregullta me Battery Breakfast në ditë. PËR PESHË TË VËRTETË: Plotësoni ushqyerjen tuaj të zakonshme me 2-3 porcione Battery Breakfast në ditë.
Shtoni një porcion Battery Breakfast në 150 ml ujë, qumësht ose pije të preferuar. Përzieni në blender për 20 sekonda. Shtoni 3-4 kube akulli dhe përzieni në blender edhe 20 sekonda të tjera ose derisa pija të arrijë konsistencën e dëshiruar.
Përzieni një porcion në 200 ml ujë ose qumësht. Mund ta hani me lugë ose ta pini si shejk në çdo kohë të ditës. Përshtatni intensitetin e shijes duke e përzier me sasi të ndryshme lëngu. Për shije më të pasur me dendësi dhe ëmbëlsi më të madhe, përzieni një porcion me 100-200 ml ujë për porcion. Për shije më të lehtë, përdorni 200-500 ml ujë për porcion.',
    InstructionsOnHowToUseItAl = N'Battery Breakfast është një shoqërues i mrekullueshëm i qullit të tërshërës, kosit ose qumështit të drithërave. Rrisni përmbajtjen e proteinave në pjekurinat tuaja, mafinet, biskotat dhe braunit duke shtuar 1 porcion në recetat tuaja të preferuara.'
WHERE Product_Id = 1025;

-- ProductId: 1026 (BATTERY COMPLETE BURNER)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY COMPLETE BURNER',
    DescriptionAl = N'<ul><li><ul><li><p>Fat burner i avancuar me <em>Gymnema silvestre</em>, L-karnitinë, çaj jeshil, kafeinë dhe mikronutrientë</p></li><li><p>Për të gjithë ata që duan fokus më të mirë dhe nxitje shtesë si pjesë e rutinës së tyre stërvitore</p></li><li><p>Ndihmon në ruajtjen e energjisë kur intensiteti i stërvitjes rritet</p></li><li><p>Për stil jetese aktiv dhe ditë stërvitjeje kur ju nevojitet një nxitje shtesë</p></li><li><p>Prodhuar në kapacitetet vetanake prodhuese në BE</p></li><li><p>Sasia për 1 muaj</p></li></ul><p><strong>Suplement ushqimor.</strong> <em>Përmban kafeinë. Nuk rekomandohet për fëmijë ose gra shtatzëna (164 mg/2 kapsula).</em></p><p>Battery Complete Burner është një suplement ushqimor me efikasitet të lartë i krijuar si plotësim për një stil jetese aktiv dhe rutina intensive stërvitore. Është formuluar për ditë me stërvitje të vështira dhe përmban një kombinim të ekuilibruar me kujdes të <strong>kafeinës, ekstraktit të <em>Gymnema silvestre</em>, ekstraktit të çajit jeshil, L-karnitinës, acidit alfa-lipoik, koenzimës Q10</strong> dhe <strong>vitaminave dhe mineraleve</strong> të përzgjedhura.</p><p>Me <strong>164 mg kafeinë për porcion</strong>, formula është e destinuar për ata që duan energji shtesë dhe fokus si pjesë e rutinës së tyre stërvitore. <strong>Vitamina C</strong> dhe <strong>vitamina B3</strong> kontribuojnë në <strong>metabolizmin normal energjetik</strong> dhe <strong>ndihmojnë në uljen e lodhjes dhe rraskapitjes</strong>, ndërsa <strong>kromi</strong> kontribuon në <strong>metabolizmin normal të makronutrientëve.</strong></p><p>Prodhuar në kapacitetet vetanake prodhuese në BE dhe i krijuar për <strong>persona të fokusuar në performancë që stërviten me një qëllim të qartë.</strong></p><p><em>Ushqyerja e ekuilibruar dhe e larmishme, si dhe stili i shëndetshëm i jetesës, janë të rëndësishme.</em></p><p><strong>Sasia neto:</strong> 60 kapsula</p></li></ul>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Madhësia e porcionit: 2 kapsula.',
    InstructionsForUseDescriptionAl = N'Merrni 2 kapsula me një gotë ujë 20 minuta para stërvitjes. Nuk duhet të konsumohet me stomak bosh. 
PARALAJMËRIM: Mos e tejkaloni dozën ditore të rekomanduar. Suplementet ushqimore nuk janë zëvendësim për një ushqyerje të ekuilibruar dhe të larmishme dhe një stil jetese të shëndetshëm. Të ruhet larg arritjes së fëmijëve të vegjël. Mos konsumoni një sasi ditore prej 800 mg ose më shumë (-)-epigalokatekin-3-galat (EGCG). Nuk duhet të konsumohet nëse të njëjtën ditë përdorni produkte të tjera që përmbajnë çaj jeshil. Nuk duhet të konsumohet nga gratë shtatzëna, gratë gjidhënëse dhe personat nën 18 vjeç. Të ruhet larg arritjes së fëmijëve!',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 1026;

-- ProductId: 1040 (BATTERY CAFFEINE, 200 kapsula)
UPDATE dbo.Products
SET
    NameAl = N'BATTERY CAFFEINE, 200 kapsula',
    DescriptionAl = N'<ul><li><ul><li><p>100 mg kafeinë e pastër për kapsulë</p></li><li><p>Dozim i saktë i kafeinës</p></li><li><p>Kapsulë nga 100% xhelatinë gjedhi</p></li><li><p>Prodhuar në kapacitetet vetanake prodhuese në BE</p></li></ul><p><strong>Kapsula me kafeinë. Suplement ushqimor.</strong> <em>Përmban kafeinë. Nuk rekomandohet për fëmijë ose gra shtatzëna (100 mg/kapsulë).</em></p><p>Kafeina është një stimulues natyror që gjendet në kafe, çaj, guaranë dhe bimë të tjera. Kafeina në formë kapsulash është jashtëzakonisht e popullarizuar, jo vetëm për shkak të çmimit të mirë, por edhe për shkak të veprimit të saj efikas.</p><ul><li><p>100 mg kafeinë e pastër për kapsulë</p></li><li><p>Mundëson dozim të saktë, gjë që mund të jetë më e vështirë të arrihet me kafeinën në pluhur</p></li><li><p>Kapsulë nga 100% xhelatinë gjedhi</p></li></ul><p><strong>I sigurt dhe me cilësi të lartë – i prodhuar në kapacitetet vetanake prodhuese në BE</strong></p><ul><li><p>Përbërës të verifikuar, pa aditivë të panevojshëm.</p></li><li><p>Prodhuar në BE sipas standardeve të larta për cilësi dhe siguri.</p></li></ul><p><strong>Sasia neto:</strong> 200 kapsula</p></li></ul>',
    NutritionValuesIngredientsAl = NULL,
    NutritionValuesIngredientsDescriptionAl = NULL,
    NutritionInformationAl = NULL,
    InstructionsForUseAl = N'Doza ditore e rekomanduar: 1 kapsulë.',
    InstructionsForUseDescriptionAl = N'Merrni 1 kapsulë me një gotë ujë para stërvitjes. PARALAJMËRIM: Doza ditore e rekomanduar e cekur nuk guxon të tejkalohet. Mos e përdorni si zëvendësim për një ushqyerje të ekuilibruar. Të ruhet larg arritjes së fëmijëve! 
RUAJTJA: Ruajeni në vend të errët dhe të thatë në temperaturë nën 25°C.',
    InstructionsOnHowToUseItAl = NULL
WHERE Product_Id = 1040;

COMMIT TRANSACTION;
GO
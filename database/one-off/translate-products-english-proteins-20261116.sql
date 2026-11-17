-- Proteini.mk: English (en) Product Translations (Batches 01-05 + Gift Voucher #2282 = 51 products)
-- Generated: 2026-11-16
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
-- Reviewed 2026-11-16: WHERE uses Product_Id (the real key column).
-- Needs migrations/0032_add-product-english-translations.sql first.
IF COL_LENGTH('dbo.Products', 'NameEn') IS NULL
    THROW 50000, 'dbo.Products.NameEn is missing; run the translation columns migration first.', 1;
GO

BEGIN TRANSACTION;

-- ProductId: 1055 (BATTERY COMPLETE ISOLATE)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY COMPLETE ISOLATE',
    DescriptionEn = N'<ul><li><p>Pure whey isolate + collagen</p></li><li><p>Advanced nutrition for performance and recovery</p></li><li><p>Support for skin, joints, and connective tissue</p></li><li><p>Delicious, pure, and effective</p></li><li><p>Virtually ZERO fat and carbohydrates</p></li><li><p>Manufactured in our own EU production facilities</p></li></ul><p><strong>Food supplement with sweetener. High protein content.</strong></p><p><strong>Support your performance. Enhance your recovery. Support your skin, joints, and muscles – ALL IN ONE POWERFUL SERVING.</strong></p><p>Introducing our <strong>ultra-pure whey isolate with collagen</strong>, a premium protein formula created for athletes, fitness enthusiasts, and anyone seeking clean and effective nutrition.</p><p><strong>KEY BENEFITS:</strong></p><ul><li><p><strong>100% premium whey isolate</strong> – fast-absorbing, high-quality protein for building and maintaining lean muscle mass.</p></li><li><p><strong>Enriched with hydrolyzed collagen</strong> – supports joint health, skin elasticity, and connective tissue.</p></li><li><p><strong>MINIMAL fat and carbohydrates</strong> – pure protein, with no unnecessary fillers, sugars, or extra calories.</p></li><li><p><strong>Incredibly delicious</strong> – a smooth and rich flavor you will truly enjoy.</p></li><li><p><b>Manufactured in our own EU production facilities</b> – complete quality control from start to finish, with tested ingredients and no unnecessary additives.</p></li><li><p><strong>Easy to digest</strong> – ideal even for a sensitive stomach.</p></li><li><p><strong>Mixes instantly</strong> – smooth texture, no lumps, and no unpleasant aftertaste.</p></li></ul><p><strong>WHY WHEY ISOLATE?</strong></p><p>Whey isolate is one of the <strong>purest and fastest-absorbing</strong> forms of protein. Here is why athletes and nutrition-conscious individuals choose it:</p><ul><li><p><strong>Exceptionally fast absorption</strong> – quickly delivers amino acids to the muscles and supports recovery.</p></li><li><p><strong>High bioavailability</strong> – the body can utilize it efficiently.</p></li><li><p><strong>Supports growth and maintenance of lean muscle mass</strong> – ideal for building and maintaining a toned physique.</p></li><li><p><strong>Low lactose content</strong> – easy to digest.</p></li><li><p><strong>Low-calorie and ultra-pure</strong> – ideal for weight loss, definition, and clean bulk phases.</p></li></ul><p>Whether you are training at the gym, recovering after a workout, or simply want to increase your daily protein intake, this formula provides <strong>pure nutritional support without compromise.</strong></p><p><strong>Feel the difference. Taste the quality. Experience the results.</strong></p><p><strong>Order now and take your nutrition to the next level!</strong></p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 600 g (20 servings)</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (30 g).',
    InstructionsForUseDescriptionEn = N'Recommended daily dose: 1 - 3 servings (30 - 90 g). Consume throughout the day or after exercise. Maximum daily dose is 3 servings (90 g). WARNING: Do not exceed the recommended daily dose. Food supplements are not a substitute for a balanced and varied diet and a healthy lifestyle. Keep out of reach of children! STORAGE: Store in a dark, dry place at a temperature below 25°C.',
    InstructionsOnHowToUseItEn = N'Dissolve 1 serving in 200 ml of water.'
WHERE Product_Id = 1055;

-- ProductId: 1059 (BATTERY COMPLETE WHEY)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY COMPLETE WHEY',
    DescriptionEn = N'<ul><li>Whey protein tailored to your preferences
</li>
<li>
Contributes to muscle growth and recovery
</li>
<li>
With added enzymes for even better absorption
</li>
<li>
With added L-leucine and glycine
</li>
<li>
Great flavors
</li>
<li>
Made in the EU</li></ul>
<p><strong>Food supplement with sweetener. High protein content.</strong></p>
<p><strong>NEW BATTERY WHEY – NOW WITH AN IMPROVED FORMULA AND EVEN BETTER TASTE!</strong></p>
<p>We listened to your feedback and made our popular whey even better. COMPLETE WHEY is carefully formulated to support an active lifestyle, featuring new and improved flavors, a refined formula, and the same proven quality you are used to.</p>
<p><strong>WHAT''S NEW:</strong></p>
<ul>
<li>
<strong>NEW, IMPROVED FLAVORS</strong> – Now even more delicious and enjoyable, crafted to your preferences. Of course, we also kept some of your favorites, like Wheytella and Strawberry & White Chocolate!
</li>
<li>
<strong>EVEN BETTER FORMULA</strong> – An optimized blend for better performance, easier mixing, and superior nutritional support.
</li>
<li>
<strong>YOUR FEEDBACK, OUR ACTION</strong> – We took your comments into account to create a formula that fits your needs even better.
</li>
</ul>
<p><strong>KEY BENEFITS:</strong></p>
<ul>
<li>
<strong>EFFECTIVE PROTEIN BLEND:</strong> A balanced combination of instant whey protein concentrate and milk protein concentrate, providing all essential amino acids to support muscle mass and recovery after physical activity.
</li>
<li>
<strong>AMINO ACIDS FOR PERFORMANCE:</strong> Contains L-leucine, an important BCAA amino acid for stimulating muscle protein synthesis, and glycine, which supports tissue repair and metabolic functions.
</li>
<li>
<strong>ENERGY SUPPORT WITH MALTODEXTRIN:</strong> Contains maltodextrin, a fast-absorbing carbohydrate that provides a quick energy source – ideal for replenishing glycogen stores after training and improving nutrient availability alongside protein.
</li>
<li>
<strong>SMOOTH AND CREAMY TEXTURE:</strong> The shake mixes easily and delivers a creamy, pleasant texture.
</li>
<li>
<strong>GENTLE ON THE STOMACH:</strong> Enriched with the enzyme lactase to aid lactose digestion, making it suitable even for those sensitive to dairy products.
</li>
<li>
<strong>MANUFACTURED IN OUR OWN EU PRODUCTION FACILITIES</strong> from tested ingredients, in accordance with high quality and safety standards.
</li>
</ul>
<p><strong>FUEL FOR YOUR MUSCLES</strong></p>
<p>Whey protein consists of amino acids that contribute to repairing and building muscle tissue. After strenuous physical activity, muscle tissue is stressed, and an adequate intake of fast-absorbing amino acids is important for its maintenance and recovery. Whey protein has a high biological value and is easily utilized by the body.</p>
<p>BATTERY COMPLETE WHEY provides you with a daily dose of high-quality protein.</p>
<p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p>
<p><strong>Net quantity:</strong> 30 g / 30 x 30 g / 800 g / 1800 g / 5000 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (30 g).',
    InstructionsForUseDescriptionEn = N'Consume throughout the day or after exercise. Maximum daily dose is 3 servings (90 g). WARNING: The recommended daily amount or dose should not be exceeded. A food supplement is not a substitute for a balanced and varied diet. Keep out of reach of children! STORAGE: Store in a dark, dry place at a temperature up to 25°C.',
    InstructionsOnHowToUseItEn = N'Dissolve 1 serving in 250 ml of water.'
WHERE Product_Id = 1059;

-- ProductId: 2112 (BATTERY REBEL CLEAR WHEY)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY REBEL CLEAR WHEY',
    DescriptionEn = N'<p><strong>REBEL Clear Whey Protein – Pure, refreshing, and powerful</strong></p><p>Discover the combination of <strong>refreshment and muscle recovery support</strong> with REBEL Clear Whey Protein – a modern approach to protein supplementation. This clear, light, and refreshing drink is rich in <strong>high-quality whey protein isolate</strong>, delivering 21–22 g of pure protein per serving, with <strong>0 g fat</strong> and <strong>minimal carbohydrates.</strong></p><p>Why choose REBEL Clear Whey?</p><p><strong>ULTRA PURE AND CLEAR</strong></p><p>Unlike traditional milky protein shakes, Clear Whey is light, crisp, and refreshing – a great choice for after training.</p><p><strong>HIGH PROTEIN, LOW CALORIE</strong></p><p>Each serving delivers a high amount of protein with only 97 calories, making it ideal for those looking to build muscle mass, recover faster, or maintain a lean physique.</p><p><strong>FAST ABSORPTION</strong></p><p>The whey isolate formula is easy to digest and quickly absorbed by the body, providing effective muscle recovery support after intense workouts.</p><p><strong>CONVENIENT AND EASY TO USE</strong></p><p>Mixes easily with water and can be consumed anytime – after training, as a refreshing drink during the day, or as a convenient way to meet your daily protein intake.</p><p><strong>IDEAL FOR:</strong></p><ul><li>Athletes looking for fast-absorbing protein for recovery</li><li>Fitness enthusiasts seeking a clean, low-calorie option</li><li>Anyone wanting a light and refreshing alternative to traditional protein shakes</li></ul><p>Take your recovery routine to the next level with Clear Whey – a next-generation protein drink that refreshes your body and supplies it with high-quality whey isolate with every sip.</p><p>Available in two juicy flavors – Blueberry Bubblegum and Ice Pop.</p><p><strong>Drink clean. Train hard. Recover faster.</strong></p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 400 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is ¾ scoop (25 g).',
    InstructionsForUseDescriptionEn = N'Consume 1 - 2 servings daily: after training or as a high-protein drink between meals. Store in a dry place, away from heat and direct sunlight.',
    InstructionsOnHowToUseItEn = N'Mix 1 serving of powder with 350 ml of water and let it stand for a few minutes until the natural foam settles.'
WHERE Product_Id = 2112;

-- ProductId: 2116 (BATTERY REBEL WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY REBEL WHEY PROTEIN',
    DescriptionEn = N'<ul><li>A convenient, easy, and delicious way to increase your daily protein intake</li><li>Helps build and maintain muscle mass</li><li>From whey protein concentrate and isolate</li><li>25 g of whey protein per serving</li><li>Great price / performance / quality ratio</li></ul><p><strong>Food supplement with sweeteners. Mix for preparing a high-protein drink.</strong></p><p>Building muscle mass requires quality nutrition. Using food supplements can help you meet your nutritional needs and support your fitness goals. When the goal is increasing muscle mass, protein powders are one of the most practical and easiest ways to boost your daily protein intake.</p><p>Protein is important for <strong>muscle growth and recovery</strong> in athletes and other physically active individuals. Adequate protein intake is especially important for <strong>increasing and maintaining lean muscle mass</strong>. Muscle growth requires maintaining a positive protein balance. Protein requirements can vary significantly, ranging from 1.2 g to 3.1 g per kilogram of body weight per day.</p><p>REBEL WHEY PROTEIN drink powder is a <strong>convenient, delicious, and affordable</strong> way to get the protein you need. With just one serving, you increase your daily intake by <strong>25 g of protein</strong>, sourced from <strong>whey protein concentrate and whey protein isolate</strong>.</p><p>Whey protein is one of the best sources of <strong>high-quality protein</strong> in the diet. It is easily digested and quickly absorbed compared to many other protein sources. It is considered a complete protein as it contains all three branched-chain amino acids (BCAAs) as well as all nine essential amino acids.</p><p>REBEL WHEY PROTEIN is available in 5 tested and approved flavors: Vanilla, Strawberry, Chocolate & Hazelnut, Cookies & Cream, and Chocolate-Banana.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 700 g / 1800 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (32 g).',
    InstructionsForUseDescriptionEn = N'Consume 1 - 2 servings daily: upon waking, between meals, after training, or before bedtime. Warnings: Keep out of reach of children! Do not exceed the recommended daily dose! This product should not be used as a substitute for a varied and balanced diet. A varied and balanced diet and a healthy lifestyle are recommended. Store in a dry place, away from heat and direct sunlight.',
    InstructionsOnHowToUseItEn = N'Mix 1 serving with 250 ml of water or milk.'
WHERE Product_Id = 2116;

-- ProductId: 2129 (BOUNTY HI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameEn = N'BOUNTY HI PROTEIN BAR',
    DescriptionEn = N'<ul><li>Phenomenal tropical Bounty flavor</li><li>18 g of protein per serving (52 g)</li><li>Protein sources from milk and whey protein</li><li>Less fat and sugar compared to the original chocolate bar</li></ul><p><strong>High-protein bar with desiccated coconut, coated in milk chocolate.</strong></p><p>The BOUNTY HI PROTEIN bar will delight fans of the tropical Bounty flavor with its delicious coconut and 18 g of protein.</p><p>BOUNTY HI PROTEIN is a great snack anytime and anywhere – both after training and on the go, thanks to its small and convenient packaging. You can enjoy it after a workout or at any time of day when you want to boost your protein intake.</p><ul><li>204 kcal per serving (52 g)</li><li>18 g of protein per serving (52 g)</li><li>The pack contains two 26 g bars</li></ul><p><strong>Net quantity:</strong> 52 g / 12 x 52 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Not suitable for vegetarians. Store in a cool, dry place, protected from direct sunlight.',
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2129;

-- ProductId: 2132 (IRONMAXX 100% VEGAN PROTEIN ZERO, 500g)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX 100% VEGAN PROTEIN ZERO, 500g',
    DescriptionEn = N'<ul><li>100% vegan protein powder</li><li>Protein from pea, rice, and hemp</li><li>Great creamy taste</li><li>Soy-free</li><li>Sugar-free</li></ul><p><strong>Instant protein powder with sweeteners for preparing a sports drink.</strong></p><p>When developing 100% Vegan Protein Zero, IronMaxx® aimed to create a sugar-free vegan protein powder that also delivers an outstanding taste experience.</p><p>The innovative formula of 100% Vegan Protein Zero largely avoids the sandy taste and texture typical of many conventional vegan protein powders. At the same time, it achieves a creamy, smooth shake consistency usually characteristic of animal-derived proteins.</p><p>Customers, staff, and brand fans alike praise the great taste of this protein powder, and this premium plant-based protein delights not only vegans.</p><p><strong>KEY FEATURES:</strong></p><ul><li>100% vegan protein powder with a unique formula</li><li>Made from high-quality pea protein isolate and rice protein</li><li>With hemp protein</li><li>Great taste even when mixed only with water</li><li>Creamy consistency</li><li>Sweetened with stevia, among others</li><li>Soy-free</li><li>Sugar-free</li><li>Excellent digestibility</li><li>Made in Germany</li></ul><p>Protein contributes to the growth in muscle mass.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 500 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 30 g (approx. 3 heaped tablespoons).',
    InstructionsForUseDescriptionEn = N'Drink 1-4 servings daily to achieve the stated positive effects. It is recommended to consume before high-intensity training or competition, immediately after training, and before bedtime. Warning: Store protected from heat, moisture, and sunlight.',
    InstructionsOnHowToUseItEn = N'Add 1 serving and 300 ml of cold water to a blender bottle and shake for 20 seconds.'
WHERE Product_Id = 2132;

-- ProductId: 2133 (IRONMAXX 100% WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX 100% WHEY PROTEIN',
    DescriptionEn = N'<p></p><ul><li>Delicious whey protein</li><li>For recovery and growth of muscle tissue</li><li>Wide selection of flavors</li><li>Mixes great with water</li></ul><p><strong>Instant protein powder for preparing a sports drink, with sweeteners.</strong></p><ul><li>High-quality whey shake with high bioavailability</li><li>High protein content</li><li>Contains all essential and non-essential amino acids, including BCAAs and EAAs</li><li>Prepared with water</li><li>Excellent solubility without clumping</li><li>Available in a wide range of flavors</li><li>Aspartame-free – sweetened with stevia and sucralose</li><li>Preservative-free</li><li>Great price / performance ratio</li></ul><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 500 g / 900 g / 2350 g / 2700 g</p><p></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 4 tablespoons (50 g). It is best to have protein on hand at all times. Add one serving to 250 ml of water, milk, or your favorite beverage and shake for 25-30 seconds.',
    InstructionsForUseDescriptionEn = N'We recommend drinking up to 4 servings daily. Best used before high-intensity training or competition, immediately after training, and before bedtime. WARNING: The stated recommended daily dose must not be exceeded. Do not use as a substitute for a varied diet. Keep out of reach of young children. Add one serving to 250 ml of water, milk, or your favorite beverage and add 3-4 ice cubes. Blend for 20-30 seconds or until the drink reaches the desired consistency.
Add one serving to 250 ml of water and mix vigorously.',
    InstructionsOnHowToUseItEn = N'By adding fresh or frozen fruit, peanut butter, coconut oil, or other nutritious ingredients and toppings, you can easily upgrade your shake into a varied and nutritious meal.'
WHERE Product_Id = 2133;

-- ProductId: 2137 (IRONMAXX LAVA BAR)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX LAVA BAR',
    DescriptionEn = N'<ul><li>Lava experience = soft protein coating and liquid, creamy filling</li><li>Free from palm oil, artificial colors, and preservatives</li><li>High protein content</li><li>Low sugar content</li></ul><p><strong>Protein bar with sweeteners. High protein content. Low sugar content.</strong></p><p>A new generation of protein bars has arrived! A soft protein coating with a liquid, creamy filling that melts in your mouth – tasting so good you will hardly believe it is a protein bar.</p><p>With crunchy pieces or nuts for the perfect crunch effect, coated in smooth, low-sugar chocolate.</p><ul><li>Soft filling and great nutritional values: high protein content (up to 34%) and low sugar content (max. 3%)</li><li>Free from palm oil, artificial colors, and preservatives</li><li>Outstanding quality</li><li>Great value for money</li></ul><p><strong>Net quantity:</strong> 40 g / 18 x 40 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 bar (40 g).',
    InstructionsForUseDescriptionEn = N'Consume up to 1 bar daily. WARNING: Excessive consumption may produce laxative effects.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2137;

-- ProductId: 2138 (IRONMAXX PROTEIN & NUT BAR)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX PROTEIN & NUT BAR',
    DescriptionEn = N'<p></p><ul><li>Protein bar with real nuts</li><li>16 g of protein per bar</li><li>Turns your snack moment into a true treat!</li><li>No added sugar</li><li>Palm oil-free</li><li>Gluten-free</li></ul><p><strong>Protein bar with a milk/white chocolate coating with maltitol, nut pieces, and sweeteners.</strong></p><p><strong>HIGH QUALITY WITH PLENTY OF PROTEIN AND REAL NUTS</strong></p><p>With real, chunky nut pieces and a creamy protein layer coated in crisp chocolate, this is one of the most popular protein bars. You can enjoy this flavor guilt-free, as it has no added sugar. It is also suitable for use during a diet.</p><p>The protein content is up to 16 g per bar. This allows you to easily and deliciously cover part of your daily protein needs. Protein contributes to the growth and maintenance of muscle mass.</p><p><strong>TRY THE PROTEIN & NUT BAR AND SEE FOR YOURSELF!</strong></p><p>IronMaxx® Protein & Nut bars offer not only a great taste experience, but also a practical combination of protein and nutrients for an active lifestyle.</p><p>Enjoy the combination of crunchy nuts, a creamy protein layer, and a chocolate coating – a convenient protein snack you can easily take with you throughout the day.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 45 g / 24 x 45 g</p><p></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Consume up to 1 bar daily.',
    InstructionsForUseDescriptionEn = N'WARNING: Excessive consumption may produce a laxative effect.',
    InstructionsOnHowToUseItEn = N'Store in a cool, dry place, protected from sunlight.'
WHERE Product_Id = 2138;

-- ProductId: 2139 (IRONMAXX PROTEINO)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX PROTEINO',
    DescriptionEn = N'<ul><li>Unique protein wafer with creamy filling and chocolate coating</li><li>High protein content</li><li>Gluten-free</li><li>Palm oil-free</li><li>Available in 3 great flavors</li></ul><p><strong>Crispy wafer coated in chocolate and filled with cream. With sweeteners.</strong></p><p>IronMaxx® proudly presents Proteino®. This unique protein bar combines a crispy wafer, creamy filling, and chocolate coating. When enjoying Proteino®, it is easy to forget that it is a protein snack rather than a classic dessert.</p><p>Proteino® sets new standards and shows that chocolate bars can be both delicious and nutritionally better balanced. Try it and pick your favorite flavor! Available in 3 great flavors: Salted Caramel, White Chocolate & Pistachio, and Double Dark Chocolate.</p><p>The Proteino® protein bar contains less than 0.5 g of sugar per bar. That makes it an excellent choice even during dieting phases, when you want to enjoy something sweet without a high sugar intake.</p><p>In addition to its low sugar content, Proteino® also provides high-quality protein. With each of the three flavors, you get an extra serving of protein, which is especially practical for athletes, physically active individuals, and anyone looking to easily increase their daily protein intake.</p><p>To make Proteino® suitable for as many people as possible, the product is gluten-free. Additionally, the formula contains no palm oil.</p><p><strong>KEY FEATURES:</strong></p><ul><li>Wafer with creamy filling and chocolate coating</li><li>Available in three flavors</li><li>High protein content – 28 g of protein per 100 g</li><li>No classic protein layer – with a melt-in-your-mouth creamy protein filling and crispy wafer</li><li>Less than 0.5 g of sugar per bar</li><li>Gluten-free</li><li>Palm oil-free</li></ul><p><strong>Net quantity:</strong> 30 g / 12 x 30 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 bar (30 g).',
    InstructionsForUseDescriptionEn = N'Consume up to one bar daily. Store in a cool, dry place, away from sunlight. Note: Excessive consumption may produce laxative effects. NO ADDED SUGAR. CONTAINS NATURALLY OCCURRING SUGARS. Protein contributes to the growth in muscle mass. Should not be used as a substitute for a balanced and varied diet and a healthy lifestyle.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2139;

-- ProductId: 2141 (IRONMAXX ZENITH PROTEIN BAR)
UPDATE dbo.Products
SET
    NameEn = N'IRONMAXX ZENITH PROTEIN BAR',
    DescriptionEn = N'<ul><li>High-protein bar</li><li>Maximum protein content (50%)</li><li>Low in sugars</li><li>With all important and essential amino acids</li></ul><p><strong>Protein bar with a maltitol chocolate coating. With sweeteners.</strong></p><p><strong>50% HIGH PROTEIN BAR – FEEL THE DIFFERENCE</strong></p><p>The Zenith® bar by IronMaxx® stands out with an exceptionally high protein content of 50% and a low carbohydrate content. Thanks to this, it is a convenient and simple source of protein for anyone looking to follow a high-protein diet.</p><p>Zenith® by IronMaxx® is a convenient source of protein in any situation. It can be consumed throughout the day, at work, during your free time, or as a protein snack between meals. For athletes, it is especially practical during or after training, as milk protein is rich in amino acids and has a high biological value.</p><p>Zenith® also stands out with its great taste and offers a delicious alternative to classic chocolate bars.</p><p><strong>ONLY 3 g NET CARBS PER BAR</strong></p><p>Standard bars often contain 10–20 times more sugars, or net carbohydrates, while providing only about one-third of the protein compared to this protein bar.</p><p>During periods of weight loss and cutting, Zenith® is a practical choice for getting high-quality protein without compromising on taste.</p><p><strong>PROTEIN CONTRIBUTES TO:</strong></p><ul><li>the growth of muscle mass</li><li>the maintenance of muscle mass</li><li>the maintenance of normal bones</li></ul><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 100 g / 12 x 100 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Consume 1-2 bars daily as a snack at any time of the day, before, during, or after exercise. Excessive consumption may produce laxative effects.',
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2141;

-- ProductId: 2142 (NÄNO SUPPS PROTEIN BAR)
UPDATE dbo.Products
SET
    NameEn = N'NÄNO SUPPS PROTEIN BAR',
    DescriptionEn = N'<p></p><ul><li>A guilt-free dessert experience</li><li>High protein content (28%) – milk and pea protein, collagen</li><li>Innovative, clean formula – no added sugar, balanced macronutrients</li><li>Unforgettable flavors</li><li>The perfect snack anytime – post-workout, on the go, at work...</li></ul><p><strong>High-protein bar with sweeteners.</strong></p><p><strong>A PREMIUM PROTEIN BAR LIKE NEVER BEFORE!</strong></p><p>Discover the new generation of Nanosupps Protein Bars with a soft filling, which are not only rich in protein, but also stand out with their unique taste and texture. In every bite, you will find premium-quality ingredients, a perfect texture, and an irresistibly delicious experience – like eating a dessert, but guilt-free!</p><p><strong>AVAILABLE FLAVORS:</strong></p><ul><li>Glazed Cinnamon Roll – sweet and aromatic cinnamon roll</li><li>Brownie Fudge – intensely chocolatey and creamy flavor</li><li>Cookie Dough – American cookie dough flavor with crunchy protein chocolate pieces</li><li>Pancake Maple Syrup – pancakes with maple syrup, a sweet breakfast-style experience</li></ul><p><strong>WHY CHOOSE THE NEW NANOSUPPS PROTEIN BAR?</strong></p><ul><li><strong>Premium protein source</strong> – a combination of milk protein, pea protein, and collagen to support your muscles.</li><li><strong>Soft and creamy filling</strong> – not your typical dry protein bar. The special creamy texture melts in your mouth.</li><li><strong>New, innovative formula</strong> – with a balanced macronutrient profile and no added sugar.</li><li><strong>High protein content (28%)</strong> – contributes to recovery, satiety, and supporting an active lifestyle.</li><li><strong>Less sugar, more taste</strong> – carefully selected sweeteners for great sweetness without unnecessary sugar.</li><li><strong>Perfect snack post-workout, on the go, or at work</strong> – nutritious, while delivering a dessert-like experience.</li></ul><p><strong>WHO DO WE RECOMMEND IT FOR?</strong></p><ul><li>For people with an active lifestyle, athletes, and fitness enthusiasts</li><li>For those who want quality protein in a delicious form</li><li>For anyone who wants to enjoy a sweet snack mindfully</li><li>For sweet lovers who will find it hard to believe this is a protein bar</li></ul><p><strong>WHY IS IT SO SPECIAL?</strong></p><p>Because this is no average protein bar. The perfect combination of carefully selected protein sources, a soft and creamy filling, and dessert-inspired flavors creates a unique experience.</p><p>This is not just a protein bar – this is a new chapter in the world of protein snacks.</p><p>Want to feel the difference? Choose Nanosupps Protein Bar – where performance and indulgence come together.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 55 g / 12 x 55 g</p><p></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 bar (55 g).',
    InstructionsForUseDescriptionEn = N'Warning: excessive consumption may produce laxative effects. Store in a cool, dry place (12–22°C). Keep away from direct heat and light.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2142;

-- ProductId: 2161 (OLIMP PURE WHEY ISOLATE 95)
UPDATE dbo.Products
SET
    NameEn = N'OLIMP PURE WHEY ISOLATE 95',
    DescriptionEn = N'<ul><li>High-quality whey protein isolate (WPI)</li><li>Obtained via cross-flow microfiltration</li><li>Enriched with BCAA amino acids</li><li>Low in fat and sugars</li></ul><p><strong>Whey protein isolate powder. Food supplement with sweeteners.</strong></p><p><strong>OLIMP Pure Whey Isolate 95</strong> is a high-quality, lactose-free formula of pure whey protein isolate (WPI), designed to supplement daily protein intake in physically active individuals and athletes. The whey protein isolate is obtained through a special <strong>cross-flow microfiltration</strong> process.</p><p>Whey protein isolate is a high-quality source of protein and is suitable for both professional athletes and all physically active individuals.</p><p><strong>PRODUCT FEATURES:</strong></p><ul><li>Enriched with BCAA amino acids</li><li>Low in fat and sugars</li><li>Lactose-free</li><li>Easy to mix and prepare</li></ul><p>Protein contributes to the <strong>growth and maintenance of muscle mass</strong>, as well as the maintenance of normal bones.</p><p><em>A varied and balanced diet and a healthy lifestyle are recommended.</em></p><p><strong>Net quantity:</strong> 600 g / 2200 g / 1800 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (35 g).',
    InstructionsForUseDescriptionEn = N'It is best to keep your protein on hand at all times. Add one serving to 100 ml of water, milk, or your favorite beverage and shake for 25-30 seconds.
Take 1-3 servings daily with meals - upon waking, after training, and before bedtime. WARNING: Do not exceed the recommended daily dose. Food supplements should not be used as a substitute for a balanced and varied diet. Keep out of reach of children! Store in a cool, dry place. Heat and direct sunlight may damage the packaging.

Add one serving to 100 ml of water, milk, or your favorite beverage and add 3-4 ice cubes. Blend for 20-30 seconds or until the drink reaches the desired consistency.
Add 1 serving to 115 ml of water. Consume immediately after preparation.',
    InstructionsOnHowToUseItEn = N'By adding fresh or frozen fruit, peanut butter, coconut oil, or other nutritious ingredients and toppings, you can easily upgrade your shake into a varied and nutritious meal.'
WHERE Product_Id = 2161;

-- ProductId: 2168 (OLIMP WHEY PROTEIN COMPLEX 100%)
UPDATE dbo.Products
SET
    NameEn = N'OLIMP WHEY PROTEIN COMPLEX 100%',
    DescriptionEn = N'<ul><li>Easy and convenient source of high-quality protein</li><li>High protein and amino acid content</li><li>Only 134 kcal per serving</li><li>Only 1.4 g of sugars per serving</li></ul><p><strong>Protein concentrate powder. Food supplement with sugars and sweeteners.</strong></p><p><strong>Whey Protein Complex 100%</strong> is a protein formula created as a convenient way to supplement daily protein intake. It combines <strong>CFM whey protein isolate and whey protein concentrate</strong>, providing a high-quality source of protein and a rich amino acid profile.</p><p>The product is suitable both for individuals working on <strong>increasing muscle mass</strong> and for those in a weight-loss phase who want to ensure adequate protein intake.</p><p>The raw materials used in the production of <strong>Whey Protein Complex 100%</strong> are characterized by a high degree of purity. Modern manufacturing technology, together with the extensive experience of the expert team at Olimp Labs, enables the creation of a high-quality protein formula.</p><p>The combination of <strong>two sources of whey protein</strong>, low saturated fat and sugar content, and a rich amino acid profile make Whey Protein Complex 100% a popular choice among athletes and recreational fitness enthusiasts.</p><p>Protein contributes to the <strong>growth and maintenance of muscle mass</strong>, as well as the maintenance of normal bones.</p><p>Whey Protein Complex 100% provides:</p><ul><li>A convenient source of high-quality protein</li><li>High protein and amino acid content</li><li>Protein that contributes to the growth and maintenance of muscle mass</li><li>134 kcal per serving</li><li>Only 1.4 g of sugars per serving</li></ul><p>The product is intended for <strong>physically active individuals and athletes</strong>, especially those working on developing and maintaining muscle mass.</p><p>Do not exceed the recommended daily dose stated on the packaging. The product should not be used as a substitute for a varied and balanced diet.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 600 g / 700 g / 1800 g / 2270 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 35 g (1 scoop). For Double Chocolate flavor, the serving size is 37 g (1 scoop).',
    InstructionsForUseDescriptionEn = N'Take 1–3 servings daily – before breakfast, between meals, after training, or before bedtime. WARNING: Not suitable for diabetics. Keep out of reach of children!',
    InstructionsOnHowToUseItEn = N'Add 1 serving to 150 ml of water. Consume immediately after preparation.'
WHERE Product_Id = 2168;

-- ProductId: 2169 (OPTIMUM CASEIN)
UPDATE dbo.Products
SET
    NameEn = N'OPTIMUM CASEIN',
    DescriptionEn = N'<ul><li>Gradual protein absorption</li><li>Long-lasting amino acid availability</li><li>Helps protect muscle mass from breakdown</li><li>Ideal for use before bedtime</li></ul><p><strong>Casein protein powder for preparing a drink, with sweeteners.</strong></p><p><strong>100% CASEIN PROTEIN – FEATURES:</strong></p><ul><li>24 g of instantized blend of slow-digesting casein proteins</li><li>Rich in micellar casein with a pronounced anti-catabolic effect</li><li>Over 9 g of BCAAs, glutamine, and glutamine precursors per scoop</li><li>Only 3–4 g of carbohydrates per serving</li><li>Enriched with AMINOGEN®</li></ul><p><strong>SOMETIMES SLOWER IS BETTER – ESPECIALLY WHEN IT COMES TO PROTEIN DIGESTION AND ABSORPTION.</strong></p><p>While fast protein absorption is desirable immediately before or after training, a gradual release of amino acids can be especially beneficial throughout the rest of the day and overnight.</p><p><strong>Casein proteins</strong> are pH-sensitive and form a gel in the acidic environment of the stomach. Because of this, their breakdown into amino acids can take significantly longer compared to whey protein and other protein sources.</p><p>Precisely because of this gradual digestion and prolonged release of amino acids, casein is often described as an <strong>anti-catabolic protein</strong>, meaning a protein that helps maintain and protect muscle mass.</p><p><strong>Casein Protein</strong> is ideal for use between meals and before bedtime. Due to its slow digestion and gradual supply of amino acids, it is often referred to as a <strong>“nighttime protein”</strong> and is particularly suitable for consumption right before sleep.</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 rounded scoop (serving weight varies by flavor).',
    InstructionsForUseDescriptionEn = N'It is best to keep your protein on hand at all times. Add one serving to 300-350 ml of water, milk, or your favorite beverage and shake for 25-30 seconds.
Use 100% casein protein first thing in the morning, immediately before bed, in place of small meals, and/or at any other time when delayed protein absorption is desired.

Add one serving to 300-350 ml of water, milk, or your favorite beverage and add 3-4 ice cubes. Blend for 20-30 seconds or until the drink reaches the desired consistency.
Add one serving to a shaker cup filled with 300-350 ml of water or your preferred beverage.',
    InstructionsOnHowToUseItEn = N'By adding fresh or frozen fruit, peanut butter, coconut oil, or other nutritious ingredients and toppings, you can easily upgrade your shake into a varied and nutritious meal.'
WHERE Product_Id = 2169;

-- ProductId: 2171 (OPTIMUM GOLD STANDARD 100% ISOLATE)
UPDATE dbo.Products
SET
    NameEn = N'OPTIMUM GOLD STANDARD 100% ISOLATE',
    DescriptionEn = N'<ul><li>25 g of high-quality 100% pure whey protein isolate per serving</li><li>A great choice as a protein shake, before and after training</li><li>Supports the growth and maintenance of muscle mass</li><li>Ultrafiltered for exceptional purity</li><li>Informed Choice certified</li></ul><p><strong>Flavored whey protein isolate powder for preparing a drink, with sweetener.</strong></p><p>If you are looking to increase your daily protein intake, <strong>Optimum Nutrition Gold Standard 100% Isolate Whey Protein</strong> offers a high-quality formula with minimal additional ingredients.</p><p><strong>ON Gold Standard 100% Isolate</strong> is designed for physically active individuals seeking a high-quality source of protein. Protein contributes to the <strong>growth and maintenance of muscle mass</strong>, as well as the maintenance of normal bones.</p><p>The protein is <strong>ultrafiltered for exceptional purity</strong>. High-quality whey proteins are used in production and undergo multiple filtration processes to reduce fat and carbohydrate content. Part of the whey protein isolate is additionally hydrolyzed, meaning it is broken down into shorter chains of amino acids.</p><p>Each serving provides:</p><ul><li><strong>25 g protein</strong></li><li>Up to <strong>0.3 g sugars</strong></li><li>Up to <strong>0.4 g fat</strong></li><li><strong>83% protein</strong></li><li><strong>5.5 g naturally occurring BCAA amino acids</strong></li></ul><p><strong>Optimum Nutrition Gold Standard 100% Isolate</strong> can be used before training, after training, or throughout the day as a convenient protein shake to supplement daily protein intake.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 930 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 rounded scoop (30 g).',
    InstructionsForUseDescriptionEn = N'Consume before training to support lean muscle growth, after training to support recovery, or anytime during the day as a delicious protein shake.',
    InstructionsOnHowToUseItEn = N'Add 30 g (1 rounded scoop) to 200 ml of cold water and stir, shake, or blend until dissolved.'
WHERE Product_Id = 2171;

-- ProductId: 2172 (OPTIMUM WHEY PROTEIN GOLD STANDARD)
UPDATE dbo.Products
SET
    NameEn = N'OPTIMUM WHEY PROTEIN GOLD STANDARD',
    DescriptionEn = N'<ul><li>The world''s best-selling whey protein</li><li>24 g of high-quality protein – contributes to the growth and maintenance of muscle mass</li><li>5.5 g of naturally occurring BCAA amino acids</li><li>Low in sugars – only 0.7 g per serving**</li></ul><p><strong>Protein powder for preparing a drink, with sweetener. High protein content. Low in sugars.</strong></p><p>For more than 30 years, <strong>OPTIMUM NUTRITION</strong> has been a recognizable brand in sports nutrition, present in over 90 countries worldwide. Its products are developed according to high quality standards to provide reliable and practical support for physically active individuals and athletes.</p><p><strong>Optimum Nutrition GOLD STANDARD 100% WHEY</strong> is one of the best-known and best-selling whey proteins in the world. Each serving provides <strong>24 g of high-quality whey protein</strong>, which contributes to the growth and maintenance of muscle mass.</p><p>After training, the body uses protein as part of the muscle tissue repair and regeneration process. Each serving also contains <strong>5.5 g of naturally occurring BCAA amino acids</strong>.</p><p>Depending on the selected flavor**, one serving contains approximately:</p><ul><li><strong>24 g protein</strong></li><li><strong>5.5 g BCAA amino acids</strong></li><li><strong>1.3 g fat</strong></li><li><strong>0.7 g sugars</strong></li><li><strong>1.3 g carbohydrates</strong></li></ul><p><strong>GOLD STANDARD 100% WHEY™</strong> can be consumed in the morning, before training, or immediately after training as a convenient way to supplement daily protein intake.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 180 g / 450 g / 908 g / 2270 g / 4500 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 rounded scoop (~ 30 g). Serving weight depends on flavor (see nutrition information).',
    InstructionsForUseDescriptionEn = N'It is best to keep your protein on hand at all times. Add one serving to 180-240 ml of water, milk, or your favorite beverage and shake for 25-30 seconds.
Consume 1-3 shakes daily depending on your protein needs. WARNING: Not intended for use by persons with pre-existing medical conditions or those taking medications, persons under 18 years of age, or women who are pregnant or breastfeeding.

Add one serving to 180-240 ml of water, milk, or your favorite beverage and add 3-4 ice cubes. Blend for 20-30 seconds or until the drink reaches the desired consistency.
Mix one serving with 180-240 ml of cold water and stir, shake, or blend until dissolved.',
    InstructionsOnHowToUseItEn = N'By adding fresh or frozen fruit, peanut butter, coconut oil, or other nutritious ingredients and toppings, you can easily upgrade your shake into a varied and nutritious meal.'
WHERE Product_Id = 2172;

-- ProductId: 2173 (PROTEINI.SI 100% NATURAL WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI 100% NATURAL WHEY PROTEIN',
    DescriptionEn = N'<ul><li>100% natural</li><li>No artificial flavors, colors, or added flavorings</li><li>Sweetened with a sweetener from the stevia plant</li></ul><p><strong>High-protein powder with lactase enzyme and sweetener. Food supplement.</strong></p><p><strong>100% NATURAL WHEY PROTEIN</strong></p><p>100% Natural Whey Protein contains a blend of <strong>whey protein concentrate and whey protein isolate</strong>, which are high-quality sources of protein. The product is completely free of added artificial sweeteners, flavors, and colors.</p><p>Protein is important for the normal functioning of the body and contributes to the <strong>growth and maintenance of muscle mass</strong>, as well as the maintenance of normal bones.</p><p>The recommended daily protein intake is 2–3 g per kilogram of body weight.</p><p><strong>BENEFITS:</strong></p><ul><li>100% natural</li><li>No artificial flavors, colors, or added flavorings</li><li>Sweetened with a sweetener from the stevia plant</li><li>Available in convenient pack sizes of 400 g, 500 g, 30 g, and 35 × 30 g</li></ul><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 400 g / 500 g / 35 × 30 g / 30 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 30 g (1 scoop or 1 sachet).',
    InstructionsForUseDescriptionEn = N'Take 1-3 servings daily - in the morning, during the day with meals, after training, or before bedtime. Warning: Keep out of reach of children! Do not exceed the recommended daily dose! The product should not be used as a substitute for a healthy and balanced diet. We recommend a balanced diet and a healthy lifestyle.',
    InstructionsOnHowToUseItEn = N'Mix 1 serving with 150-200 ml of cold water or milk.'
WHERE Product_Id = 2173;

-- ProductId: 2191 (PROTEINI.SI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI PROTEIN BAR',
    DescriptionEn = N'<h2>A protein bomb in a delicious edition</h2><p>Fuel up with energy and protein! <strong>Proteini.si Protein Bar</strong> offers a great combination of protein and carbohydrates in a 1:2 ratio, <strong>for energy and muscle support</strong>, in 12 delicious varieties.</p><h2>Half a serving of protein in just one protein bar</h2><p>Each <strong>Proteini.si Protein Bar</strong> contains half a serving of protein – <strong>12.5 g of protein</strong>, making it ideal as a <strong>quick and nutritious post-workout snack</strong>, especially when you don''t have a shaker with you.</p><h2>Guilt-free sweet indulgence</h2><p>You deserve a tasty break! <strong>Proteini.si Protein Bar</strong> delivers <strong>great taste rich in protein, vitamins, and carbohydrates</strong> – without the guilt.</p><p><strong>Protein bar.</strong></p><p>Grab a <strong>Proteini.si Protein Bar</strong> as a quick breakfast for a great start to the day, as a convenient snack between meals, or as a protein source after physical activity – whether it''s running, cycling, hiking, swimming, gym training, or any other activity.</p><p><strong>Proteini.si Protein Bar</strong> has a high protein content, which contributes to the growth and maintenance of muscle mass.</p><p>Thanks to modern production technology, <strong>Proteini.si Protein Bar</strong> has a soft texture and great taste. The protein-to-carbohydrate ratio is <strong>1:2</strong>.</p><ul><li>Great value for money</li><li>23 g of protein per 100 g</li><li>Source of dietary fiber</li><li>Gluten-free</li></ul><p>This delicious protein bar is made from high-quality ingredients and contains vitamins <strong>B1, B2, B3, pantothenic acid, B6, B7, folic acid, and B12</strong>, in an amount of approximately <strong>16–17.5% of the reference daily intake per bar</strong>.</p><p>Once you try it, you''ll hardly want another!</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 55 g / 24 × 55 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Once opened, the product is intended for immediate consumption. WARNING: Not intended for children under 3 years of age. Store in a dry place at a temperature not exceeding 25°C and away from direct sunlight. Do not freeze. The manufacturer is not liable for any damage caused by improper use or storage.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2191;

-- ProductId: 2192 (PROTEINI.SI PROTEIN BAR SPECIAL EDITION)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI PROTEIN BAR SPECIAL EDITION',
    DescriptionEn = N'<ul><li>The perfect high-protein bar</li><li>Protein contributes to the growth and maintenance of muscle mass</li><li>Delicious "Special Edition" flavors</li><li>Convenient and tasty snack at any time of the day</li><li>Ideal choice after physical activity</li><li>Gluten-free</li></ul><p><strong>High-protein bar with sweetener.</strong></p><p>This protein bar is a delicious and convenient snack that you can enjoy at any time of the day – as a quick breakfast, as a snack between main meals, or after physical activity for extra protein intake.</p><p>Protein contributes to the <strong>growth and maintenance of muscle mass</strong>.</p><p>Thanks to modern production technology, <strong>Proteini.si Protein Bar</strong> has an exceptionally soft texture and great taste. It is now available in new packaging and in specially selected, delicious "Special Edition" varieties.</p><p><strong>KEY FEATURES:</strong></p><ul><li>Very tasty protein bar</li><li>Great value for money</li><li>23 g of protein per 100 g</li><li>Gluten-free</li><li>Available in 3 delicious "SPECIAL EDITION" flavors: banana-coconut, chocolate-hazelnut, and vanilla ice cream</li></ul><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 50 g / 20 × 50 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Once opened, the product is intended for immediate consumption. WARNING: Not intended for children under 3 years of age. Store in a dry place at a temperature not exceeding 25°C and away from direct sunlight. Do not freeze. The manufacturer is not liable for any damage caused by improper use or storage.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2192;

-- ProductId: 2194 (PROTEINI.SI PROTEIN COOKIE)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI PROTEIN COOKIE',
    DescriptionEn = N'<ul><li>The perfect protein cookie</li><li>Double chocolate flavor with real chocolate chunks</li><li>20% protein / 8 g protein per cookie</li><li>Low in sugar – only 1.4 g per cookie</li><li>Suitable for vegetarians and vegans</li><li>Great texture and rich flavor</li></ul><p><strong>A protein cookie with double chocolate indulgence!</strong></p><p>Looking for the perfect snack that combines great taste with a solid nutritional profile? Our <strong>double chocolate protein cookie with real chocolate chunks</strong> was created for just that.</p><ul><li><strong>Double chocolate flavor + chocolate chunks</strong> – for an intense taste that will satisfy even the biggest chocolate lovers</li><li><strong>20% protein</strong>, or <strong>8 g protein per cookie</strong> – a convenient choice after a workout or as a filling snack throughout the day</li><li><strong>Low in sugar – only 1.4 g per cookie</strong></li><li><strong>Suitable for vegetarians and vegans</strong> – 100% plant-based formula</li><li><strong>With sweeteners</strong> – a great balance between taste and nutrition</li></ul><p>Our protein cookie offers a great combination of flavor, texture, and convenience. Take it with you to work, the gym, or on the go – whenever you need a quick and delicious snack.</p><p><strong>Enjoy a chocolatey treat with an added protein boost!</strong></p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 40 g / 12 × 40 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 cookie (40 g).',
    InstructionsForUseDescriptionEn = N'WARNING: Excessive consumption may produce laxative effects. Suitable for vegetarians and vegans. Store in a cool, dry place away from direct sunlight.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2194;

-- ProductId: 2209 (PROTEINI.SI PROTEIN SHAKE RTD)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI PROTEIN SHAKE RTD',
    DescriptionEn = N'<ul><li>Ready-to-drink protein beverage</li><li>25 g protein per pack</li><li>Convenient to use</li><li>Great taste</li><li>Lactose-free</li><li>Fat-free</li></ul><p><strong>High-protein, lactose-free beverage with sweetener. Fat-free.</strong></p><p>This high-protein beverage, based on milk protein, is ready for immediate consumption and provides a convenient way to get your protein. Thanks to its practical packaging, you can enjoy it anytime, anywhere.</p><p>The protein shake is intended for physically active individuals looking for an additional protein intake after training. Protein contributes to the growth and maintenance of muscle mass. The RTD shake can also be used as a convenient snack on the go or when you don''t have time for a regular meal.</p><p><strong>KEY FEATURES:</strong></p><ul><li>Ready to drink</li><li>25 g protein per pack</li><li>168 kcal per pack</li><li>Great source of protein on the go</li><li>Milk protein-based</li><li>Lactose-free (&lt;0.1 g/100 ml)</li><li>Fat-free (0.1 g/100 ml)</li><li>Protein contributes to the maintenance and growth of muscle mass and the maintenance of normal bones</li></ul><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 330 ml / 8 × 330 ml</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Store unopened at (+5°C to +25°C). Shake well before use. Once opened, refrigerate (+3°C to +9°C) and consume within 24 hours.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2209;

-- ProductId: 2210 (PROTEINI.SI PROTEIN WAFER)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI PROTEIN WAFER',
    DescriptionEn = N'<ul><li>Crispy high-protein wafer filled with creamy caramel</li><li>The perfect balance between taste and nutrition</li><li>Convenient snack on the go</li><li>Two delicious flavors</li></ul><p><strong>High-protein wafer coated with milk chocolate. No added sugar*. With sweetener.</strong></p><p><strong>A delicious and crispy snack for an active lifestyle!</strong></p><p>Introducing our <strong>Protein Wafer with caramel</strong> – the perfect combination of great taste and a solid nutritional profile. Every light, crispy wafer is filled with a rich layer of creamy caramel and packs a high amount of protein.</p><p>The wafer is designed to offer an ideal balance between taste and convenience, making it a great snack any time of day – after a workout, as an afternoon treat, or whenever you''re craving something sweet.</p><p><strong>KEY FEATURES:</strong></p><ul><li><strong>High protein content:</strong> Protein contributes to the growth and maintenance of muscle mass.</li><li><strong>Crispy wafer and caramel:</strong> A delicious combination of creamy caramel filling and light, crispy wafer layers.</li><li><strong>No added sugar:</strong> Contains naturally occurring sugars*.</li><li><strong>Perfect on the go:</strong> Individually wrapped and convenient to carry in a gym bag, backpack, or purse.</li></ul><p><strong>IDEAL FOR:</strong></p><ul><li>Before or after a workout</li><li>As a daytime snack or dessert alternative</li><li>Extra protein intake on the go</li></ul><p>Enjoy a convenient, tasty, and crispy protein snack that fits easily into an active lifestyle.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong></p><p>37 g / 24 × 37 g (<strong>Coconut-Caramel</strong>)</p><p>39 g / 24 × 39 g (<strong>Peanut-Caramel</strong>)</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 wafer (37 g or 39 g).',
    InstructionsForUseDescriptionEn = N'WARNING: Excessive consumption may produce laxative effects. Store in a cool, dry place.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2210;

-- ProductId: 2212 (PROTEINI.SI SNICKS)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI SNICKS',
    DescriptionEn = N'<ul><li>Snickers-style protein bar with an extra protein boost after training</li><li>30% protein and low in sugar</li><li>Delicious and filling guilt-free snack</li><li>Indulgence with functional value</li></ul><p><strong>Protein bar with sweeteners.</strong></p><p><strong>SNICKS</strong> is a high-protein bar inspired by the signature taste of Snickers. It combines chocolate, caramel, peanuts, and nougat while delivering <strong>15 g of protein per bar</strong>.</p><p>Whether you enjoy it after a workout, when craving something sweet, or as a convenient snack on the go, SNICKS offers a great combination of taste and nutrition.</p><p><strong>KEY FEATURES:</strong></p><ul><li><strong>High protein content:</strong> Protein contributes to the growth and maintenance of muscle mass and helps make the bar more filling.</li><li><strong>Low in sugar:</strong> Less than 3 g of sugar per bar.</li><li><strong>Caramel and peanuts:</strong> Real roasted peanuts for a crunchy texture and caramel for that signature sweet taste.</li><li><strong>Chocolate coating:</strong> Rich milk chocolate coating for an even better taste.</li></ul><p><strong>BENEFITS:</strong></p><ul><li><strong>Post-workout:</strong> High protein content contributes to the maintenance and growth of muscle mass.</li><li><strong>Filling snack:</strong> A combination of great taste and high protein content, suitable between meals.</li><li><strong>Convenient:</strong> Ideal when you''re on the go and want a quick protein snack.</li><li><strong>Sweet treat with a better nutritional profile:</strong> A great choice when you want something chocolatey with less sugar and more protein.</li></ul><p><strong>IDEAL FOR:</strong></p><ul><li><strong>Post-workout:</strong> For extra protein intake after physical activity.</li><li><strong>As a daytime snack:</strong> A convenient and filling option between meals.</li><li><strong>On the go:</strong> A quick and practical protein snack.</li><li><strong>When craving something sweet:</strong> A tasty alternative high in protein and low in sugar.</li></ul><p>Try <strong>SNICKS</strong> and enjoy the combination of chocolate, caramel, peanuts, and protein!</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 50 g / 28 × 50 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 bar (50 g).',
    InstructionsForUseDescriptionEn = N'Consume immediately after opening. WARNING: Excessive consumption may produce laxative effects. Not intended for children under 12 years of age. Store in a dry, dark place below 25°C, away from direct sunlight. Do not freeze.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2212;

-- ProductId: 2213 (PROTEINI.SI VEGAN PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI VEGAN PROTEIN',
    DescriptionEn = N'<ul><li>Delicious vegan protein shake powder</li><li>With vitamins B5 and B12 and iron</li><li>Rich in BCAA amino acids</li><li>Flavors: chocolate, chocolate-hazelnut, and forest berries</li></ul><p><strong>Food supplement with sugar and sweeteners. Plant protein concentrate with added vitamin B5, vitamin B12, and iron.</strong></p><p>This vegan protein shake contains a blend of different plant protein sources to provide a wide spectrum of <strong>amino acids</strong>, both essential and non-essential. The majority comes from pea and wheat proteins, while coconut, rice, and pumpkin proteins are present in smaller amounts.</p><p>Pea protein is especially rich in the essential <strong>BCAA amino acids</strong> leucine, isoleucine, and valine, as well as arginine. Additionally, pea protein contributes to a feeling of fullness.</p><p>Because a vegan diet excludes animal sources of nutrients, the product is enriched with <strong>vitamin B12</strong> and the mineral <strong>iron</strong>, nutrients whose primary sources are often animal-derived.</p><p>The product is also suitable for those looking for an alternative to dairy or soy proteins.</p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net quantity:</strong> 500 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 30 g (¾ scoop).',
    InstructionsForUseDescriptionEn = N'On training days, take 1 serving after your workout. On rest days, take 1 serving at any time of day. WARNING: Do not exceed the stated recommended daily dose. Do not use as a substitute for a balanced diet. Keep out of reach of children!',
    InstructionsOnHowToUseItEn = N'Mix 1 serving with 300 ml of water.'
WHERE Product_Id = 2213;

-- ProductId: 2220 (SNICKERS HI PROTEIN BAR (NEW))
UPDATE dbo.Products
SET
    NameEn = N'SNICKERS HI PROTEIN BAR (NEW)',
    DescriptionEn = N'<ul><li>Phenomenal Snickers taste</li><li>20 g protein per bar (55 g)</li><li>Dairy protein sources</li></ul><p><strong>High-protein bar with a layer of caramel and peanuts, coated in milk chocolate.</strong></p><p>The new 55 g <strong>Snickers HI Protein</strong> bar is a slightly smaller version and contains:</p><ul><li>20 g protein from milk and whey protein</li><li>213 kcal</li></ul><p><strong>Snickers Hi Protein Bar</strong> is a delicious combination of peanuts, caramel, and chocolate with a soft nougat center.</p><p>Thanks to its convenient individual packaging, it fits easily into a gym bag and is a great choice as a post-workout protein snack.</p><p><strong>Net quantity:</strong> 55 g / 12 × 55 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Not suitable for vegetarians. Store in a cool, dry place, protected from direct sunlight.',
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2220;

-- ProductId: 2221 (SNICKERS HI PROTEIN LOW SUGAR BAR, 57g)
UPDATE dbo.Products
SET
    NameEn = N'SNICKERS HI PROTEIN LOW SUGAR BAR, 57g',
    DescriptionEn = N'<p></p><ul><li>Delicious high-protein Snickers protein bar</li><li>Low in sugar – 2 g</li><li>High in protein – 20 g</li><li>Great post-workout snack</li></ul><p><strong>High-protein, low-sugar protein bar with layers of peanuts and caramel, coated in milk chocolate.</strong></p><p><strong>Snickers Hi Protein Low Sugar Bar</strong> is the protein version of the famous Snickers chocolate bar. Unlike the classic version, this one is tailored to contain more protein and minimal sugar. If you''re a Snickers fan, this is a variation worth trying.</p><p>With <strong>20 g of protein per bar</strong>, this version features delicious nougat, a thick layer of caramel, and peanuts, all coated in sweet milk chocolate.</p><p>For SNICKERS fans, it''s a great combination of signature taste and an improved protein profile.</p><p><strong>Net quantity:</strong> 57 g / 12 × 57 g</p><p></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Not suitable for vegetarians. Store in a cool, dry place, protected from direct sunlight.',
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2221;

-- ProductId: 2222 (USN 100% WHEY PREMIUM PROTEIN - BAG, 2000g)
UPDATE dbo.Products
SET
    NameEn = N'USN 100% WHEY PREMIUM PROTEIN - BAG, 2000g',
    DescriptionEn = N'<ul><li><p>High-protein shake</p></li><li><p>Great taste</p></li><li><p>Up to 25 g protein per serving</p></li><li><p>5 g BCAAs per serving</p></li><li><p>58 servings</p></li></ul><p><strong>Mix for preparing a high-protein beverage with sweetener.</strong></p><p>100% Whey Protein Premium is the purest form of a unique whey protein complex. It contains a high dose of protein, which contributes to the growth and maintenance of muscle mass. An ideal product to support your strength and training goals.</p><ul><li><p>Up to 25 g of premium-quality protein per serving</p></li><li><p>5 g of naturally occurring BCAAs per serving</p></li><li><p>Optimal support for muscles and recovery</p></li><li><p>Great taste</p></li><li><p>58 servings</p></li></ul><p><strong>Net quantity:</strong> 2000 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'- Serving size: 1 scoop (34 g).',
    InstructionsForUseDescriptionEn = N'- Consume 2–4 servings daily, spaced throughout the day, before and after training.',
    InstructionsOnHowToUseItEn = N'- Add 1 serving to 150–200 ml of cold water.
- Stir directly in a glass with a fork or mix in a blender/shaker for about 30 seconds.'
WHERE Product_Id = 2222;

-- ProductId: 2226 (USN BLUE LAB 100% WHEY PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'USN BLUE LAB 100% WHEY PROTEIN',
    DescriptionEn = N'<ul><li><p>26 g premium whey protein per serving</p></li><li><p>Great taste and easy-to-mix formula</p></li><li><p>Easily digestible protein blend – 100% whey protein</p></li><li><p>Supports muscle development and recovery</p></li></ul><p><strong>DIFFERENT GOALS, ONE WHEY PROTEIN</strong></p><p>Backed by science, perfected by you. USN Blue Lab Whey is the industry''s first research and development (R&amp;D) project based on consumer feedback, aimed at delivering the best-tasting, highest-quality whey protein ever! Composed of whey protein concentrate, isolate, and hydrolysate, USN Blue Lab Whey provides 26 g of protein per serving, 5800 mg of BCAA amino acids, and only 1.6 g of sugar, making it ideal for maintaining lean muscle mass.</p><p><strong>RICH IN HIGH-QUALITY PROTEIN</strong></p><p>If we are what we eat, it is essential that we all get enough protein, as it plays a vital role in the body''s structure and function. For muscles to repair and grow, supporting your active lifestyle, your body needs an adequate amount of protein.</p><p><strong>LEAN MUSCLE MASS</strong></p><p>USN whey proteins are scientifically formulated for optimal maintenance of lean muscle mass. We use only the highest-quality proteins to help you reach your goals and get the most out of every workout.</p><p><strong>ENRICHED WITH AMINO ACIDS</strong></p><p>Known as the building blocks of protein, amino acids make up a large part of our muscles and cells and perform many important functions in the body. They are essential for healing and repairing tissues, especially muscle tissue. Adding amino acids to our supplements significantly enhances muscle recovery benefits.</p><p><strong>MUSCLE DEVELOPMENT</strong></p><p>Our premium formulas contain the highest-quality whey proteins, amino acids, and other proven ingredients, providing a supplement optimized for maximum muscle development.</p><p><strong>OPTIMAL DIGESTIBILITY</strong></p><p>Tolerase™ L is an acid-stable lactase that breaks down lactose into glucose and galactose. It is specially developed and patented for use in dietary and sports supplements intended for individuals with lactose intolerance, making it easier for them to enjoy these and other dairy products.</p><p>Source: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'1 serving: 34 g (1 scoop) / 2 servings: 68 g (2 scoops)',
    InstructionsForUseDescriptionEn = N'Adjust your protein intake with 1–5 servings, depending on your physical goal and individual protein needs. Warning: Store the product in a cool, dry place out of reach of children. Follow a varied and balanced diet and a healthy lifestyle.',
    InstructionsOnHowToUseItEn = N'Mix one serving with 150–200 ml of cold water. Mix two servings with 300–400 ml of cold water. Shake well for 30 seconds, let stand for 60 seconds, then shake again before consuming.'
WHERE Product_Id = 2226;

-- ProductId: 2227 (USN CASEIN NIGHT TIME PROTEN, 908g, Vanilla)
UPDATE dbo.Products
SET
    NameEn = N'USN CASEIN NIGHT TIME PROTEN, 908g, Vanilla',
    DescriptionEn = N'<ul><li><p>Premium micellar casein</p></li><li><p>Sustained-release protein</p></li><li><p>Before bed or during the day</p></li><li><p>For muscle growth and maintenance</p></li></ul><p><strong>OPTIMAL MUSCLE GROWTH AND RECOVERY</strong></p><p>USN Casein Night Time Protein is ideal for anyone looking to maximize their recovery period with a great-tasting, slow-digesting premium shake. The body repairs itself most during sleep, and USN Casein provides you with a protein shake that digests more slowly than other available proteins. Our premium formula contains top-quality, great-tasting micellar casein enriched with Aiminogen.</p><p><strong>RICH IN HIGH-QUALITY PROTEIN</strong></p><p>If we are what we eat, it is essential that we all get enough protein, as it plays a vital role in the body''s structure and function. For muscles to repair and grow, supporting your active lifestyle, your body needs an adequate amount of protein.</p><p><strong>LEAN MUSCLE MASS</strong></p><p>USN whey proteins are scientifically formulated for optimal maintenance of lean muscle mass. We use only the highest-quality proteins to help you reach your goals and get the most out of every workout.</p><p><strong>ENRICHED WITH AMINO ACIDS</strong></p><p>Known as the building blocks of protein, amino acids make up a large part of our muscles and cells and perform many important functions in the body. They are essential for healing and repairing tissues, especially muscle tissue. Adding amino acids to our supplements significantly enhances muscle recovery benefits.</p><p><em>Indicates the date until which the food product retains its specific properties, such as taste, aroma, appearance, other product-specific characteristics, and vitamin content, provided it is stored properly and the packaging remains unopened.</em></p><p>Source: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 2 scoops (30 g). The best way to always have your protein on hand. Add one serving to 250 ml of water, milk, or your favorite beverage and shake for 25–30 seconds.',
    InstructionsForUseDescriptionEn = N'Take 1 serving before bed. WARNING: Not suitable for pregnant women, breastfeeding women, or individuals under 18 years of age. Do not exceed the recommended daily dose. The product should not be used as a substitute for a balanced diet and a healthy lifestyle.
BLENDER PREPARATION
Add one serving to 250 ml of water, milk, or beverage of choice, then add 3–4 ice cubes. Blend for 20–30 seconds or until the drink reaches the desired consistency.',
    InstructionsOnHowToUseItEn = N'Mix one serving in 250 ml of water and stir or shake well.'
WHERE Product_Id = 2227;

-- ProductId: 2229 (USN DYNAMIC WHEY)
UPDATE dbo.Products
SET
    NameEn = N'USN DYNAMIC WHEY',
    DescriptionEn = N'<ul><li><p>Delicious protein shake</p></li><li><p>25 g protein per serving</p></li><li><p>High-quality formula</p></li><li><p>Excellent solubility and fast absorption</p></li></ul><p>We believe everyone should have access to quality nutrition at affordable prices. Our Essentials line is built on the belief that USN''s high standards for premium nutrition can be maintained at more accessible prices.</p><p>We created a foundational whey supplement that gives you everything you need from a protein shake to support your goals, combining key nutrients and top quality at a great price.</p><p>It''s simple – thanks to high bioavailability, we provide the protein you need to support muscle recovery and growth.</p><p>Guided by this philosophy, we created a whey protein shake that not only offers an excellent nutritional profile, but also tastes fantastic.</p><ul><li><p>25 g protein per serving</p></li><li><p>High-quality USN formula</p></li><li><p>Delicious flavors</p></li></ul>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Mix 1 scoop (34 g) with 200 ml of cold water.',
    InstructionsForUseDescriptionEn = N'Consume 2–4 servings daily. WARNING: Do not exceed the recommended daily dose. Food supplements are not a substitute for a balanced and varied diet. Keep out of reach of children! Store in a cool, dry place. Heat and direct sunlight may damage the packaging.',
    InstructionsOnHowToUseItEn = N'Add one serving to approximately 150–200 ml of cold water. Stir directly in a glass with a fork or mix in a blender or shaker for about 30 seconds.'
WHERE Product_Id = 2229;

-- ProductId: 2230 (USN ISOPRO 100% WHEY PROTEIN ISOLATE)
UPDATE dbo.Products
SET
    NameEn = N'USN ISOPRO 100% WHEY PROTEIN ISOLATE',
    DescriptionEn = N'<ul><li><p>Single-source protein (pure whey protein isolate)</p></li><li><p>Fast protein absorption</p></li><li><p>Scientifically formulated to support muscle development*</p></li><li><p>72 servings</p></li></ul><p><strong>High-protein drink mix with sweetener.</strong></p><p>Build lean muscle mass with this pure, ultrafiltered whey protein isolate formula.</p><p>IsoPro is a superior pure whey protein isolate formula that supports lean muscle development and accelerates muscle recovery. This ultra-premium protein source has exceptionally high bioavailability, low fat content, and no added sugar.</p><ul><li><p><strong>Whey protein isolate:</strong> a high-quality protein that helps build lean muscle mass, repair muscles, and form new tissue.</p></li><li><p><strong>BCAAs and EAAs:</strong> support protein synthesis, muscle growth, and strength gains. They also help maintain muscle mass.</p></li></ul><p><em>Protein contributes to the growth and maintenance of muscle mass.</em></p><p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p><p><strong>Net quantity:</strong> 1800 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (25 g) or 2 scoops (50 g).',
    InstructionsForUseDescriptionEn = N'Adjust your protein intake based on your physical goals and protein needs. For best results, consume the product throughout the day, before and after training. Store in a cool, dry place, out of reach of young children. Follow a varied and balanced diet and a healthy lifestyle.',
    InstructionsOnHowToUseItEn = N'Mix 1 scoop (25 g) with 150–200 ml of cold water or 2 scoops (50 g) with 300–400 ml of cold water. Shake well for 30 seconds, let stand for 60 seconds, then shake again before consuming.'
WHERE Product_Id = 2230;

-- ProductId: 2234 (USN TRUST CRUNCH BAR)
UPDATE dbo.Products
SET
    NameEn = N'USN TRUST CRUNCH BAR',
    DescriptionEn = N'<ul><li><p>20 g protein</p></li><li><p>Only 2 g sugars</p></li><li><p>Supports muscle recovery and calorie control</p></li><li><p>Enjoy a delicious, guilt-free snack that satisfies your sweet cravings</p></li></ul><p><strong>High-protein and high-fiber protein bar with chocolate coating and sweeteners.</strong></p><p>Taking tasty, healthy snacking to the next level, the new USN Trust Crunch combines irresistible flavors with an excellent nutritional profile.</p><p>Each delicious bar delivers over 20 g of high-quality protein and only 2 g of sugar, supporting muscle development throughout the day while keeping unnecessary calories in check.</p><p>Trust Crunch is available in seven tempting flavors: Salted Caramel Peanut, Fudge Brownie, White Chocolate Cookie Dough, Cookies &amp; Cream, Triple Chocolate, Raspberry Cheesecake, and Cherry &amp; Chocolate. The perfect choice to satisfy your afternoon sweet tooth.</p><p>Don''t compromise on taste and look forward to your next healthy snack with the new 60 g Trust Crunch protein bar that you can enjoy guilt-free.</p><p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p><p><strong>Net quantity:</strong> 60 g / 12 × 60 g</p><p>Source: https://uk.usn-sport.com</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Store in a cool, dry place. Warning: Excessive consumption may produce laxative effects. Ensure you follow a balanced and healthy lifestyle.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2234;

-- ProductId: 2239 (OPTIMUM GOLD STANDARD 100% WHEY (NEW))
UPDATE dbo.Products
SET
    NameEn = N'OPTIMUM GOLD STANDARD 100% WHEY (NEW)',
    DescriptionEn = N'<ul><li><p>Supports muscle growth and post-workout recovery</p></li><li><p>World''s No. 1 (best-selling) whey protein powder</p></li><li><p>24 g of high-quality, fast-absorbing premium whey protein powder per serving</p></li><li><p>5.5 g of BCAA amino acids per serving</p></li><li><p>Available in various flavors</p></li></ul><p><strong>Whey protein drink powder with sweeteners.</strong></p><p><strong>What is whey protein?</strong></p><p>Whey protein is a high-quality, fast-absorbing protein derived from a dairy source and rich in essential amino acids. Protein supports the growth and repair of lean muscle mass.</p><p><strong>Physical performance benefits:</strong></p><ul><li><p>24 g of premium whey protein per serving to support the growth and maintenance of muscle mass.</p></li><li><p>Under 120 calories per serving, making it suitable for various nutrition goals.</p></li><li><p>5.5 g of naturally occurring branched-chain amino acids (BCAAs) per serving to support muscle recovery.</p></li></ul><p><strong>When to use this product:</strong></p><ul><li><p><strong>Post-workout:</strong> Consume after physical activity to support muscle recovery and meet your daily protein needs.</p></li><li><p><strong>Between meals:</strong> Use as a snack to help maintain muscle mass.</p></li><li><p><strong>As part of your daily diet:</strong> Include it in your diet to meet daily protein requirements and support your active lifestyle.</p></li></ul><p><strong>Why choose this product?</strong></p><p>Enjoy over 15 delicious flavors, such as Double Rich Chocolate or Vanilla Ice Cream, turning your post-workout shake into a tasty reward. Trusted by athletes worldwide and voted "Best Protein Powder" at the Men''s Health Sport Nutrition Awards 2024. This is a top-tier protein for those aiming for serious results.</p><p><em>Protein contributes to the growth and maintenance of muscle mass alongside regular resistance training, such as weight training.</em></p><p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p><p><em>Net weight may vary depending on flavor.</em></p><p><strong>Net quantity:</strong> 780 g / 2000 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 rounded scoop (31 g***).',
    InstructionsForUseDescriptionEn = N'Enjoy your shake after exercise or at any time during the day. Store in a cool, dry place.',
    InstructionsOnHowToUseItEn = N'Mix one serving into 180–240 ml of cold water. You can also add a serving to smoothies, protein balls, muffins, porridge, or other meals.'
WHERE Product_Id = 2239;

-- ProductId: 2240 (M&M'S HI PROTEIN BAR)
UPDATE dbo.Products
SET
    NameEn = N'M&M''S HI PROTEIN BAR',
    DescriptionEn = N'<ul><li><p>Great taste of m&amp;m''s candies</p></li><li><p>15 g protein per bar (51 g)</p></li><li><p>Protein sources from milk and whey</p></li><li><p>Less fat and sugar compared to the original candies</p></li></ul><p><strong>High-protein bar with layers of peanuts and sugar-coated milk chocolate pieces, covered in milk chocolate with sugar and sweeteners. Flavor: Peanut.</strong></p><p><strong>High-protein bar with a layer of sugar-coated milk chocolate pieces, covered in milk chocolate with sugar and sweeteners. Flavor: Chocolate.</strong></p><p>All fans of colorful m&amp;m''s candies will be thrilled with the new m&amp;m''s HI PROTEIN bar, as it contains real mini m&amp;m''s candies and a full 15 g of protein.</p><p>m&amp;m''s HI PROTEIN is a great snack anytime, anywhere. Thanks to its small and convenient packaging, it''s perfect after a workout or on the go. You can enjoy it post-workout or at any moment during the day when you want to boost your protein intake.</p><ul><li><p>192 kcal (Chocolate flavor) / 209 kcal (Peanut flavor) per bar (51 g)</p></li><li><p>15 g protein per bar (51 g)</p></li><li><p>Contains half the fat and sugar compared to regular m&amp;m''s candies (without added protein)</p></li><li><p>Contains 3 times more protein per 100 g of product compared to original Peanut m&amp;m''s</p></li><li><p>Contains 6 times more protein per 100 g of product compared to original Chocolate m&amp;m''s</p></li></ul><p><strong>Net quantity:</strong> 51 g / 12 × 51 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Not suitable for vegetarians. Store in a cool, dry place, protected from direct sunlight.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2240;

-- ProductId: 2241 (MARS HI PROTEIN BAR (NEW))
UPDATE dbo.Products
SET
    NameEn = N'MARS HI PROTEIN BAR (NEW)',
    DescriptionEn = N'<ul><li><p>Phenomenal Mars taste</p></li><li><p>20 g protein per bar (59 g)</p></li><li><p>Protein sources from SOY, MILK, whey, and EGGS</p></li></ul><p><strong>High-protein bar with a caramel layer and milk chocolate coating.</strong></p><p>The new Mars HI Protein bar (59 g) is a slightly smaller version that contains:</p><ul><li><p>20 g protein from SOY, MILK, whey, and EGGS</p></li><li><p>207 kcal</p></li></ul><p>Mars HI Protein Bar is a delicious combination of caramel and chocolate with a soft nougat center. Individually wrapped Mars HI Protein bars fit easily into any gym bag and make a great post-workout snack.</p><p><strong>Net quantity:</strong> 59 g / 12 × 59 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = N'Not suitable for vegetarians. Store in a cool, dry place, away from direct sunlight.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2241;

-- ProductId: 2269 (PROTEINI.SI MY NEW WHEY)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI MY NEW WHEY',
    DescriptionEn = N'<ul><li><p>Whey protein concentrate and milk protein</p></li><li><p>With added L-leucine and glycine</p></li><li><p>21 g protein per serving</p></li><li><p>Great value for money</p></li><li><p>10 servings</p></li></ul><p><strong>Food supplement with sweetener. High protein content.</strong></p><p><strong>The delicious Power Protein blend is an all-in-one formula for strength, recovery, and great taste.</strong></p><p>Formulated with whey protein concentrate and milk protein, enriched with L-leucine, it provides high-quality protein to support muscle growth and faster recovery. Glycine contributes to a better amino acid balance, while lactase** improves digestibility and allows easier absorption.</p><p>We added instant milk powder and maltodextrin for sustained energy supply, creating a smooth and satisfying shake.</p><p><strong>Available flavors:</strong></p><ul><li><p><strong>Chocolate</strong> – Made with rich fat-reduced cocoa powder and natural chocolate flavoring for an intense, creamy, and indulgent chocolate experience.</p></li><li><p><strong>Vanilla</strong> – A smooth, classic flavor with a naturally sweet, creamy character and subtle aromatic notes – perfectly balanced for everyday enjoyment.</p></li><li><p><strong>Cookies &amp; Cream</strong> – An irresistible, delicious blend inspired by your favorite dessert – a smooth creamy taste combined with subtle cookie notes for a rich and satisfying shake.</p></li></ul><p>A protein shake with a smooth texture and balanced flavor.</p><p><strong>Boost your performance. Recover smarter. Enjoy every sip.</strong></p><p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p><p><strong>Lactase</strong> is an enzyme that improves lactose digestion in individuals who have difficulty digesting lactose. Consume 4,500 FCC units with each lactose-containing meal. Lactose tolerance varies from person to person, so seek advice on the role of this substance in your diet.</p><p><strong>Net quantity:</strong> 300 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (30 g).',
    InstructionsForUseDescriptionEn = N'Recommended daily dose: 1–3 servings (30–90 g). Consume throughout the day or after exercise. Maximum daily dose is 3 servings (90 g). WARNING: Not intended for children under 12 years of age. A varied and balanced diet and a healthy lifestyle are recommended. The lactase enzyme improves lactose digestion in individuals who have difficulty digesting lactose. Consume 4,500 FCC units with each lactose-containing meal. Lactose tolerance is variable and you should seek advice on the role of this substance in your diet.',
    InstructionsOnHowToUseItEn = N'Dissolve 30 g of powder (1 scoop) in 250 ml of water.'
WHERE Product_Id = 2269;

-- ProductId: 2271 (NÄNO SUPPS EGG WHITE PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'NÄNO SUPPS EGG WHITE PROTEIN',
    DescriptionEn = N'<ul><li>Up to 25 g protein per serving
</li>
<li>
Lactose-free and gluten-free
</li>
<li>
Fat-free and no added sugar
</li>
<li>
Supports muscle growth and recovery
</li>
<li>
Ideal for fitness and dieting phases
</li>
</ul>
<p><strong>Protein powder with sweetener.</strong></p>
<p>NÄNO Supps Egg White Protein is an ideal alternative to classic whey protein. Made from high-quality egg whites, this protein powder has a particularly high biological value and effectively supports muscle growth, recovery, and physical performance.</p>
<p>Thanks to its lactose-free, gluten-free, and fat-free formula, this protein is easy to digest and an excellent choice for a carefully planned diet. With up to 24–25 g of protein per serving, it optimally supplies your body with protein – after training or throughout the day.</p>
<p><strong>Key benefits:</strong></p>
<ul>
<li>
Up to 25 g protein per serving
</li>
<li>
80–82% protein content
</li>
<li>
Lactose-free and gluten-free
</li>
<li>
Fat-free
</li>
<li>
No added sugar (contains only naturally occurring sugars)
</li>
<li>
High biological value
</li>
<li>
Ideal for building muscle mass and dieting phases
</li>
</ul>
<p><strong>Why egg white protein?</strong></p>
<p>Egg white protein is a high-quality protein source with a complete amino acid profile. It supports muscle growth, contributes to recovery, and provides a longer-lasting feeling of fullness – ideal for cutting and dieting phases.</p>
<p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p>
<p><strong>Net quantity:</strong> 750 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 1 scoop (30 g).',
    InstructionsForUseDescriptionEn = N'Consume 1 serving daily. On training days, consume the serving 30 minutes after training, and on non-training days, in the morning upon waking. WARNING: Do not exceed the recommended daily dose. This product is not a substitute for a balanced and varied diet. Keep out of reach of children! STORAGE: Keep the product tightly closed at a temperature of 5 to 30°C. Store away from direct heat, moisture, and sunlight. Once opened, do not store the product for longer than 6 months.',
    InstructionsOnHowToUseItEn = N'Mix 1 serving (30 g) with 250 ml of cold water.'
WHERE Product_Id = 2271;

-- ProductId: 2297 (SPORTNAHRUNG WHEY DELUXE (NEW))
UPDATE dbo.Products
SET
    NameEn = N'SPORTNAHRUNG WHEY DELUXE (NEW)',
    DescriptionEn = N'<ul><li><p>Ultrafiltered whey protein concentrate</p></li><li><p>25% higher concentration of BCAA amino acids**</p></li><li><p>Low sugar content</p></li><li><p>Great taste</p></li></ul><p><strong>Protein drink powder with sweeteners.</strong></p><p>Whey DELUXE is an easily digestible, ultrafiltered whey protein concentrate with high biological value, featuring an excellent amino acid profile and high BCAA content. Compared to other protein types**, it contains a 25% higher concentration of BCAAs, namely the three essential amino acids: leucine, isoleucine, and valine. They help increase muscle mass, relieve post-workout muscle soreness, and reduce fatigue during physical activity or fitness training.</p><p>Whey DELUXE is also beneficial for the body because it contains undenatured immunoglobulins (approximately 10%), which help support the immune system. In addition, the product always dissolves smoothly and without lumps in your shake!</p><p>With Whey DELUXE, we offer you not only great protein, but also exceptionally delicious flavors. Get ready to enjoy your protein shake like never before!</p><p><em>A balanced and varied diet and a healthy lifestyle are important.</em></p><p><strong>Net quantity:</strong> 1000 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size is 1 scoop (28 g).',
    InstructionsForUseDescriptionEn = N'Consume throughout the day or after physical activity. Maximum daily dose is 3 servings (84 g). WARNINGS: Do not exceed the stated recommended daily dose. The product should not be used as a substitute for a balanced diet. Keep out of reach of children! STORAGE: Store in a dark, dry place at a temperature below 25°C.',
    InstructionsOnHowToUseItEn = N'Dissolve 1 serving in 250 ml of water.'
WHERE Product_Id = 2297;

-- ProductId: 2298 (SPORTNAHRUNG EVERYDAY WHEY (NEW))
UPDATE dbo.Products
SET
    NameEn = N'SPORTNAHRUNG EVERYDAY WHEY (NEW)',
    DescriptionEn = N'<ul><li><p>Ultrafiltered whey protein</p></li><li><p>Contains all 21 proteinogenic amino acids</p></li><li><p>For increasing and maintaining muscle mass</p></li><li><p>Great choice after training or as an additional protein source throughout the day</p></li><li><p>Ideal for both athletes and less active individuals</p></li></ul><p><strong>Food supplement with sweetener. High protein content.</strong></p><p>Everyday Whey is a delicious ultrafiltered whey protein with a high protein content. It contains all 21 proteinogenic amino acids and is an excellent choice for daily nutritional supplementation – after training, between meals, or whenever you want to increase your protein intake.</p><p>Protein contributes to the growth and maintenance of muscle mass, as well as the maintenance of normal bones. Therefore, Everyday Whey is suitable for active individuals, recreational athletes, and anyone looking to support a balanced lifestyle.</p><p>Available in three delicious varieties that will delight you from the very first sip. It blends wonderfully into protein shakes, oatmeal, smoothies, pancakes, and other protein-rich recipes, quickly becoming an indispensable part of your kitchen and daily routine.</p><p><em>A varied and balanced diet and a healthy lifestyle are recommended.</em></p><p><strong>Net quantity:</strong> 900 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 1 scoop (30 g).',
    InstructionsForUseDescriptionEn = N'RECOMMENDED DAILY DOSE: 1–3 servings (30–90 g). Consume throughout the day or after physical activity. Maximum daily dose is 3 servings (90 g). Lactase: The lactase enzyme improves lactose digestion in individuals who have difficulty digesting lactose. Consume 4,500 FCC units with each lactose-containing meal. Lactose tolerance varies from person to person, so seek advice on the role of this substance in your diet. WARNINGS: Do not exceed the recommended daily dose. Food supplements are not a substitute for a balanced and varied diet and a healthy lifestyle. Keep out of reach of young children. STORAGE: Store in a dark, dry place at a temperature below 25°C.',
    InstructionsOnHowToUseItEn = N'Dissolve 30 g of powder (1 scoop) in 250 ml of water.'
WHERE Product_Id = 2298;

-- ProductId: 2321 (PROTEINI.SI CRUNCH WHEY BAR)
UPDATE dbo.Products
SET
    NameEn = N'PROTEINI.SI CRUNCH WHEY BAR',
    DescriptionEn = N'<ul><li><p>Convenient everyday protein snack</p></li><li><p>Rich chocolate flavor with crispy pieces</p></li><li><p>20 g of protein in every bar</p></li><li><p>Only 1.5 g of sugars per bar</p></li><li><p>Source of dietary fiber</p></li></ul><p><strong>A protein bar with a crunchy surprise</strong></p><p>Treat yourself to CRUNCH WHEY BAR, a delicious protein bar that combines the rich taste of milk chocolate with a pleasantly crunchy texture from crispy cocoa and soy pieces. High in protein and a source of dietary fiber, it is the perfect choice for anyone looking for a convenient snack on busy, active days.</p><p>Each 55 g bar delivers an impressive 20 g of protein, and with only 1.4 g of sugars per bar, it is ideal for anyone watching their sugar intake without giving up rich chocolate flavor.</p><p>CRUNCH WHEY BAR is a practical snack on the go, at work, after a workout, or whenever you crave something chocolatey and crunchy.</p><p><strong>WHY CHOOSE CRUNCH WHEY BAR?</strong></p><ul><li><p>20 g of protein per bar to supplement your daily protein intake</p></li><li><p>Source of dietary fiber to support your daily intake</p></li><li><p>Only 1.5 g of sugars per bar</p></li><li><p>Crunchy texture with crispy cocoa and soy pieces</p></li><li><p>Rich chocolate flavor available in milk or white chocolate varieties</p></li><li><p>Convenient packaging, ideal for an active lifestyle</p></li></ul><p>Whether you are traveling, at work, or have just finished your workout, CRUNCH WHEY BAR offers a convenient way to top up your protein and fiber intake. Enjoy the perfect combination of chocolate flavor, crunchy texture, and balanced nutrition.</p><p><strong>CRUNCH WHEY BAR – where chocolate indulgence meets protein power!</strong></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 1 bar (55 g).',
    InstructionsForUseDescriptionEn = N'Consume before or after physical activity, depending on your energy needs. The product is intended for immediate consumption after opening.

WARNING: Excessive consumption may produce laxative effects.

STORAGE: Keep away from direct sunlight, extreme temperature changes, strong odors, and moisture.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2321;

-- ProductId: 2323 (APPLIED NUTRITION MICELLAR CASEIN PROTEIN POWDER)
UPDATE dbo.Products
SET
    NameEn = N'APPLIED NUTRITION MICELLAR CASEIN PROTEIN POWDER',
    DescriptionEn = N'<p><strong>100% CASEIN – SLOW-RELEASE PROTEIN WITH ADDED DIGESTIVE ENZYME COMPLEX</strong></p><p>Applied Nutrition 100% Casein Protein is an excellent choice for anyone looking to provide their muscles with a steady supply of amino acids during sleep, when consuming food or drink is impractical. During this period, the body can enter a fasting state and begin breaking down muscle tissue, which can negatively affect muscle recovery and physical performance.</p><p>Therefore, Applied Nutrition 100% Casein Protein is digested slowly and gradually over a period of up to seven hours, supplying muscles with the essential amino acids needed for muscle protein synthesis, recovery, and growth.</p><p>100% Casein Protein features a complete amino acid profile and contains essential branched-chain amino acids (BCAAs), which are the fundamental building blocks for creating new proteins. With minimal fat and carbohydrate content, this product fits seamlessly into a calorie-controlled diet and supports achieving your desired fitness goals.</p><ul><li><p>Ideal for consumption before bedtime</p></li><li><p>Contributes to the maintenance and growth of muscle mass</p></li><li><p>Sustained-release protein</p></li><li><p>With added digestive enzyme complex</p></li><li><p>Gluten-free</p></li><li><p>4.1 g of naturally occurring glutamic acid per serving</p></li></ul><p>Every batch of this product is tested for banned substances under a monitored program. Products undergo rigorous testing in an ISO 17025 accredited laboratory to provide the highest level of assurance that they are safer for use by athletes.<br><br>GMP<br><br>This product is manufactured in a GMP-compliant facility under strict quality control to ensure consistently high quality that meets the requirements of the Marketing Authorisation (MA) or product specification.</p><p><strong>Net weight: 900g</strong></p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Mix 2 scoops (30 g) with 500 ml of water or milk in a shaker (the less liquid you use, the thicker the shake will be).',
    InstructionsForUseDescriptionEn = N'Shake and consume. For optimal results, use immediately before bedtime, though it can also be consumed between meals or 2–3 times daily.',
    InstructionsOnHowToUseItEn = N'Scoops are approximate, so using a scale is recommended for accurate measurement.'
WHERE Product_Id = 2323;

-- ProductId: 2324 (NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS)
UPDATE dbo.Products
SET
    NameEn = N'NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS',
    DescriptionEn = N'<ul><li><p>Rich, creamy, and packed with protein</p></li><li><p>11 g of protein per serving</p></li><li><p>Low sugar content</p></li><li><p>High dietary fiber content</p></li><li><p>Ideal guilt-free snack</p></li></ul><p><strong>Milk chocolate with a salted peanut butter filling, with milk proteins and sweeteners.</strong></p><p>Nano Supps Protein Peanut Butter Cups are the ultimate “fit” version of one of the world’s most famous confectionery combinations. Crafted with a rich milk chocolate coating and a creamy, salted peanut butter filling, these protein cups deliver an indulgent treat without excessive sugar intake.</p><p>With 11 g of protein and only 1.9 g of sugars per serving, they are an ideal snack to satisfy your sweet cravings while supporting muscle recovery.</p><p><strong>KEY BENEFITS:</strong></p><ul><li><p><strong>High protein content:</strong> Each 42 g serving provides 11 g of protein, helping you meet your daily protein needs while enjoying a delicious sweet treat.</p></li><li><p><strong>Low sugar content:</strong> Sweetened with maltitol and erythritol, these protein cups contain only 1.9 g of sugars, making them suitable for low-carb diets and individuals monitoring their sugar intake.</p></li><li><p><strong>High dietary fiber content:</strong> Provides 2.8 g of dietary fiber per serving.</p></li><li><p><strong>Quality ingredients:</strong> Made with real peanut butter, cocoa butter, and anhydrous milk fat for an authentic, creamy melt-in-your-mouth texture.</p></li><li><p><strong>Indulgence without compromise:</strong> Created as a smarter way to enjoy sweets, allowing you to experience the classic taste of salted peanut butter and chocolate without unnecessarily high sugar intake.</p></li></ul><p>A varied and balanced diet and a healthy lifestyle are recommended.</p><p><strong>Net weight:</strong> 42 g / 20 × 42 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 2 cups (2 × 21 g).',
    InstructionsForUseDescriptionEn = N'WARNING: Excessive consumption may produce laxative effects.

STORAGE: Store in a cool, dry place, away from direct sunlight.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2324;

-- ProductId: 2328 (APPLIED NUTRITION CRITICAL WHEY)
UPDATE dbo.Products
SET
    NameEn = N'APPLIED NUTRITION CRITICAL WHEY',
    DescriptionEn = N'<p><strong>Critical Whey™ Protein</strong></p><p>Critical Whey™ Protein is a blend of whey protein concentrate, whey protein isolate, and hydrolyzed whey protein. The concentrate is produced via ultrafiltration, the isolate via cross-flow microfiltration, while the hydrolyzed whey protein is enzymatically broken down into peptides. These proteins provide a high-quality protein source that contributes to the growth and maintenance of muscle mass.¹</p><p><strong>PRODUCT BENEFITS</strong></p><ul><li><p>24 g of protein per serving from a multi-source protein blend</p></li><li><p>Tested under the Informed Protein program – every batch of every flavor is verified</p></li><li><p>Low calorie content</p></li><li><p>Contributes to the growth and maintenance of muscle mass</p></li><li><p>Laboratory-verified protein content</p></li><li><p>Mixes instantly, with a smooth texture and great taste</p></li><li><p>Gluten-free and soy-free, suitable for vegetarians</p></li><li><p>Made from milk from grass-fed cows</p></li><li><p>Halal certified</p></li></ul><p><strong>WHY CRITICAL WHEY™ PROTEIN?</strong></p><p>The combination of whey protein concentrate, isolate, and hydrolysate delivers high-quality whey proteins that are rapidly available to the body. Protein contributes to the growth and maintenance of muscle mass, as well as the maintenance of normal bones.¹ ²</p><p>Amino acids are the fundamental building blocks of protein.</p><p><strong>QUALITY AND TESTING</strong></p><p>Every ingredient in this batch undergoes strict controls and testing for banned substances prior to manufacturing under a continuously monitored program. Finished products are then manufactured and packaged in a facility accredited to ISO 22000, BRC, GMP, and Halal standards to ensure the highest level of ingredient quality assurance.</p><p>Every batch of this product is tested for banned substances under the Informed-Sport program. Products undergo rigorous testing in an ISO 17025 accredited laboratory to provide the highest level of assurance for athletes using them.</p><p>Net weight: 825g; 2000g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Mix 33 g of powder (approximately 2 scoops) with 250 ml of cold water or milk. For a more accurate serving measurement, use a scale.',
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2328;

-- ProductId: 2329 (APPLIED NUTRITION CRITICAL PLANT PROTEIN)
UPDATE dbo.Products
SET
    NameEn = N'APPLIED NUTRITION CRITICAL PLANT PROTEIN',
    DescriptionEn = N'<p><strong>Critical Plant Protein</strong></p><p>Critical Plant Protein is an ideal plant-based protein blend combining soy protein isolate, pea protein isolate, and brown rice protein, delivering a high-quality plant protein powder with a full spectrum of essential amino acids and over 24 g of protein per serving.</p><p>Critical Plant Protein is an excellent choice for anyone looking to increase their daily protein intake. With a rich profile of branched-chain amino acids (BCAAs), including leucine, isoleucine, and valine, this product contributes to the growth and maintenance of muscle mass.</p><ul><li><p>Over 24 g of protein per serving</p></li><li><p>Suitable for vegans and vegetarians</p></li><li><p>Dairy-free plant protein source</p></li><li><p>Excellent amino acid profile</p></li><li><p>Low in fat and sugars</p></li><li><p>Halal certified product</p></li><li><p>Muscle mass support: Ideal for athletes and fitness enthusiasts looking to build and maintain muscle mass.</p></li><li><p>Weight management: Helps maintain a feeling of fullness, supporting weight management.</p></li><li><p>Nutritional support: Provides a convenient way to increase daily protein intake and support overall health.</p></li></ul><p>Net weight: 450g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Mix 1 scoop (30 g) with 300 ml of water and shake well for 10 seconds, then let it sit for 30 seconds. Consume 1–3 servings daily.',
    InstructionsForUseDescriptionEn = N'Scoops are approximate, so using a scale is recommended for accurate measurement.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2329;

-- ProductId: 2332 (OLIMP Protein Complex 700 g)
UPDATE dbo.Products
SET
    NameEn = N'OLIMP Protein Complex 700 g',
    DescriptionEn = N'<p>Olimp Protein Complex</p><ul><li><p>21 g of protein per serving – a convenient way to supplement protein intake post-workout, between meals, or throughout a busy day</p></li><li><p>Three protein sources in one formula – milk protein isolate (with micellar casein), ultrafiltered egg protein, and whey protein concentrate</p></li><li><p>High protein content and low sugar content – with minor variations depending on flavor</p></li><li><p>Quick 10-second preparation – all you need is a shaker and water</p></li><li><p>700 g pack – up to 26 servings</p></li><li><p>Five flavors to choose from: Vanilla Dream, Chocolate Royale, Cookies Cream, Toffee Espresso, and Strawberry Matcha</p></li></ul><p>Olimp Protein Complex is a high-protein powdered drink mix created for people who train professionally or recreationally and want to ensure adequate protein intake throughout the day.</p><p>One serving (26 g of powder) provides approximately 20–21 g of protein from three complementary sources: milk protein isolate containing micellar casein (a slower-absorbing protein, suitable for example before bedtime), ultrafiltered egg protein with a favorable amino acid profile, and faster-absorbing whey protein concentrate.</p><p>The formula contains approximately 78–79% protein per 100 g of powder and is low in sugar. Its pleasant taste turns everyday protein intake into a real treat.</p><p>The product is available in five flavors. Four of them (Vanilla Dream, Chocolate Royale, Cookies Cream, and Toffee Espresso) share the same composition and nutritional values, while the Strawberry Matcha variant is enriched with green matcha tea and has a slightly different composition and nutritional values.</p><p>WHO IS IT FOR?</p><p>The product is intended for individuals with increased protein requirements who want to increase muscle mass, primarily professional athletes and recreational exercisers looking to conveniently supplement their protein intake upon waking, between meals, after training, or before bedtime.</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'RECOMMENDED DAILY DOSE: 1–3 servings daily – upon waking, between meals, post-workout, or before bedtime.',
    InstructionsForUseDescriptionEn = N'Dissolve 1 serving (26 g of powder = ¾ scoop) in 200 ml of water. Shake in a shaker for at least 10 seconds. Consume immediately after preparation.',
    InstructionsOnHowToUseItEn = N'To adjust flavor intensity to personal preference, dissolve the powder in 200–250 ml of water or milk.'
WHERE Product_Id = 2332;

-- ProductId: 2333 (OLIMP PURE WHEY ISOLATE 95)
UPDATE dbo.Products
SET
    NameEn = N'OLIMP PURE WHEY ISOLATE 95',
    DescriptionEn = N'<ul><li><p>High-quality whey protein isolate (WPI)</p></li><li><p>Produced using cross-flow microfiltration technology</p></li><li><p>Enriched with BCAA amino acids</p></li><li><p>Low in fat and sugars</p></li></ul><p><strong>Whey protein isolate powder. Food supplement with sweeteners.</strong></p><p>OLIMP Pure Whey Isolate 95 is a high-quality, lactose-free pure whey protein isolate (WPI) formulation that supports normal metabolic processes during various physical activities and increased protein intake. The whey protein isolate is obtained through a specialized cross-flow microfiltration technology.</p><p>Whey protein isolate is considered one of the most valuable dietary protein sources, both for professional athletes and for all physically active individuals.</p><p>PRODUCT FEATURES:</p><ul><li><p>Enriched with BCAA amino acids</p></li><li><p>Low in fat and sugars</p></li><li><p>Lactose-free</p></li><li><p>Easy to mix and prepare</p></li></ul><p>Protein contributes to the growth and maintenance of muscle mass, as well as the maintenance of healthy bones.</p><p>A varied and balanced diet and a healthy lifestyle are recommended.</p><p><strong>Net weight:</strong> 600 g / 1800 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'RECOMMENDED USE: Consume 1–3 servings daily – upon waking, between meals, after training, or before bedtime. Add 1 serving (35 g = 1 scoop) to 115 ml¹ of water. Consume immediately after preparation.',
    InstructionsForUseDescriptionEn = N'Do not exceed the recommended daily dose. Food supplements should not be used as a substitute for a varied and balanced diet. A varied and balanced diet and a healthy lifestyle are recommended.

Keep out of reach of children. Store the unopened product in a cool, dry place.',
    InstructionsOnHowToUseItEn = N'To adjust flavor intensity to personal preference, dissolve in 100–200 ml of water.'
WHERE Product_Id = 2333;

-- ProductId: 1025 (BATTERY BREAKFAST)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY BREAKFAST',
    DescriptionEn = N'<ul><li>Complete meal ready in just seconds Delicious breakfast with only 1.6 g of sugar Great choice during weight loss as well Promotes muscle growth and maintenance</li></ul><h3>Powder with oat flour, protein, and taurine. Food supplement with sugars and sweeteners.</h3><p>Powder with oat flour, protein, and taurine. Food supplement with sugars and sweeteners. Battery Breakfast is a blend of whey protein concentrate and finely ground oats. This great-tasting, easy-to-mix formula provides 19 g of protein and 22 g of low-GI (glycemic index) carbohydrates, 3.3 g of fiber, and only 1.6 g of sugar in every 50 g serving. Complete meal in seconds Your best-tasting breakfast with only 1.6 g of sugar Great choice during weight loss as well Protein contributes to the growth and maintenance of muscle mass Battery Breakfast is also perfect for active people on the go who need quick and easy nutrient-dense meals. This great blend is sourced from fiber-rich oats and whey protein, delivering complex carbohydrates alongside fast-acting whey protein and filling fiber in a single serving. The protein found in Battery Breakfast comes exclusively from instantized and ultrafiltered whey protein concentrate. Combined with oats, this provides the delicate balance of carbohydrates and protein that healthy, active individuals need. Battery Breakfast can be used either for gaining lean mass or during weight loss. Precise nutritional information allows you to plan your diet down to the last calorie or gram. Start your day with Battery Breakfast!! *A balanced and varied diet and a healthy lifestyle are important. Net weight: 1100 g</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'It is best to have protein on hand at all times. Add one serving to 200 ml of water, milk, or your favorite beverage and shake for 25–30 seconds.',
    InstructionsForUseDescriptionEn = N'For best results, take three servings daily, preferably at/during breakfast or as a break between meals.
Battery Breakfast can be used as a real meal replacement.
FOR WEIGHT LOSS: Replace two of your 5 regular meals with Battery Breakfast daily. FOR LEAN MASS GAIN: Supplement your regular diet with 2–3 servings of Battery Breakfast daily.
Add one serving of Battery Breakfast to 150 ml of water, milk, or your favorite beverage. Blend for 20 seconds. Add 3–4 ice cubes and blend for another 20 seconds or until the drink reaches the desired consistency.
Mix one serving in 200 ml of water or milk. You can eat it with a spoon or drink it as a shake at any time of day. Adjust flavor intensity by mixing with different amounts of liquid. For a richer taste with greater thickness and sweetness, mix one serving with 100–200 ml of water per serving. For a milder taste, use 200–500 ml of water per serving.',
    InstructionsOnHowToUseItEn = N'Battery Breakfast is a wonderful companion to oatmeal, yogurt, or cereal milk. Boost the protein content of your baked goods, muffins, cookies, and brownies by adding 1 serving to your favorite recipes.'
WHERE Product_Id = 1025;

-- ProductId: 1026 (BATTERY COMPLETE BURNER)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY COMPLETE BURNER',
    DescriptionEn = N'<ul><li><ul><li><p>Advanced fat burner with <em>Gymnema silvestre</em>, L-carnitine, green tea, caffeine, and micronutrients</p></li><li><p>For everyone who wants better focus and an extra boost as part of their training routine</p></li><li><p>Helps you maintain energy when workout intensity increases</p></li><li><p>For an active lifestyle and training days when you need an extra boost</p></li><li><p>Manufactured in in-house production facilities in the EU</p></li><li><p>1-month supply</p></li></ul><p><strong>Food supplement.</strong> <em>Contains caffeine. Not recommended for children or pregnant women (164 mg/2 capsules).</em></p><p>Battery Complete Burner is a highly effective food supplement created to complement an active lifestyle and intense training routines. Formulated for demanding workout days, it contains a carefully balanced combination of <strong>caffeine, <em>Gymnema silvestre</em> extract, green tea extract, L-carnitine, alpha-lipoic acid, coenzyme Q10</strong>, and selected <strong>vitamins and minerals.</strong></p><p>With <strong>164 mg of caffeine per serving</strong>, the formula is designed for those seeking extra energy and focus as part of their training routine. <strong>Vitamin C</strong> and <strong>vitamin B3</strong> contribute to <strong>normal energy-yielding metabolism</strong> and <strong>help reduce tiredness and fatigue</strong>, while <strong>chromium</strong> contributes to <strong>normal macronutrient metabolism.</strong></p><p>Manufactured in in-house production facilities in the EU and created for <strong>performance-focused individuals who train with a clear purpose.</strong></p><p><em>A balanced and varied diet, as well as a healthy lifestyle, are important.</em></p><p><strong>Net weight:</strong> 60 capsules</p></li></ul>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Serving size: 2 capsules.',
    InstructionsForUseDescriptionEn = N'Take 2 capsules with a glass of water 20 minutes before training. Should not be consumed on an empty stomach.
WARNING: Do not exceed the recommended daily dose. Food supplements are not a substitute for a balanced and varied diet and a healthy lifestyle. Keep out of reach of young children. Do not consume a daily amount of 800 mg or more of (-)-epigallocatechin-3-gallate (EGCG). Should not be consumed if you are using other products containing green tea on the same day. Should not be consumed by pregnant women, breastfeeding women, or individuals under 18 years of age. Keep out of reach of children!',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 1026;

-- ProductId: 1040 (BATTERY CAFFEINE, 200 capsules)
UPDATE dbo.Products
SET
    NameEn = N'BATTERY CAFFEINE, 200 capsules',
    DescriptionEn = N'<ul><li><ul><li><p>100 mg of pure caffeine per capsule</p></li><li><p>Precise caffeine dosing</p></li><li><p>100% bovine gelatin capsule</p></li><li><p>Manufactured in in-house production facilities in the EU</p></li></ul><p><strong>Caffeine capsules. Food supplement.</strong> <em>Contains caffeine. Not recommended for children or pregnant women (100 mg/capsule).</em></p><p>Caffeine is a natural stimulant found in coffee, tea, guarana, and other plants. Caffeine in capsule form is extremely popular, not only for its great value, but also for its effective action.</p><ul><li><p>100 mg of pure caffeine per capsule</p></li><li><p>Allows precise dosing, which can be harder to achieve with caffeine powder</p></li><li><p>100% bovine gelatin capsule</p></li></ul><p><strong>Safe and high-quality – manufactured in in-house production facilities in the EU</strong></p><ul><li><p>Verified ingredients, with no unnecessary additives.</p></li><li><p>Manufactured in the EU according to high quality and safety standards.</p></li></ul><p><strong>Net weight:</strong> 200 capsules</p></li></ul>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = N'Recommended daily dose: 1 capsule.',
    InstructionsForUseDescriptionEn = N'Take 1 capsule with a glass of water before training. WARNING: The stated recommended daily dose must not be exceeded. Do not use as a substitute for a balanced diet. Keep out of reach of children!
STORAGE: Store in a dark, dry place at a temperature below 25°C.',
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 1040;

-- ProductId: 2282 (Gift Voucher)
UPDATE dbo.Products
SET
    NameEn = N'Gift Voucher',
    DescriptionEn = N'<p><b>A gift that never disappoints!</b></p><p>Give a Proteini.si gift voucher and let your loved ones choose something they truly want.</p><p>The perfect choice – regardless of their goals or taste!</p>',
    NutritionValuesIngredientsEn = NULL,
    NutritionValuesIngredientsDescriptionEn = NULL,
    NutritionInformationEn = NULL,
    InstructionsForUseEn = NULL,
    InstructionsForUseDescriptionEn = NULL,
    InstructionsOnHowToUseItEn = NULL
WHERE Product_Id = 2282;

COMMIT TRANSACTION;
GO
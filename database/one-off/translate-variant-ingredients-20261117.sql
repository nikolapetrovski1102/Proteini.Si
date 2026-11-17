-- One-off: AL/EN translations of ProductVariants.Ingredients (334 distinct texts, 499 variants).
-- Requires migration 0034. Only updates a variant when its Macedonian text still matches (SHA2_256).
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;
DECLARE @n int = 0, @r int;
-- item 0
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE CAKE

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, fat-reduced cocoa powder, L-leucine, flavouring (chocolate flavouring), thickener (xanthan gum), sodium chloride, sweetener (sucralose), lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (CHOCOLATE CAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'TORTË ME ÇOKOLLATË

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, kakao pluhur me pak yndyrë, L-leucinë, aromë (aromë çokollate), trashës (gomë ksantani), klorur natriumi, ëmbëlsues (sukralozë), enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (TORTË ME ÇOKOLLATË)'
WHERE Variant_Id IN (1048,1074,1081,1090,1095) AND HASHBYTES('SHA2_256', Ingredients) = 0x7BB0A58D23D4E5EDF68D35A397C96E0574C65164CBB47B5BC07EA8C0CB9B535F;
SET @n += @@ROWCOUNT;
-- item 1
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, flavouring, L-leucine, thickeners (guar gum, xanthan gum), salt, natural flavouring, colour (ammonia caramel), lactase enzyme powder, sweetener (sucralose).

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, trashës (gomë guar, gomë ksantani), kripë, aromë natyrale, ngjyrues (karamel amoniaku), enzimë laktazë pluhur, ëmbëlsues (sukralozë).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1049,1075,1082,1091,1096) AND HASHBYTES('SHA2_256', Ingredients) = 0x41AF138C4A6B52E6F04450AA20826CE0847018617FAAB8D864EDC28CE3FA2CD1;
SET @n += @@ROWCOUNT;
-- item 2
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA ICE CREAM

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, flavouring, thickener (guar gum), L-leucine, thickener (xanthan gum), salt, natural flavouring, lactase enzyme powder, sweetener (sucralose).

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE VANILJE

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, aromë, trashës (gomë guar), L-leucinë, trashës (gomë ksantani), kripë, aromë natyrale, enzimë laktazë pluhur, ëmbëlsues (sukralozë).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (AKULLORE VANILJE)'
WHERE Variant_Id IN (1052,1078,1085,1092,1098) AND HASHBYTES('SHA2_256', Ingredients) = 0xAD3FF3B7244D1916CEDDE3C9462F972A122966B80AF2E87425412A39832A2AFC;
SET @n += @@ROWCOUNT;
-- item 3
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA ICE CREAM

INGREDIENTS: maltodextrin, MILK protein concentrate (contains MILK protein), whey protein concentrate (contains MILK protein), MILK powder, creatine monohydrate, flavouring: vanilla, thickener: xanthan gum, sweetener: sucralose.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE GAINER (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE VANILJE

PËRBËRËSIT: maltodekstrinë, koncentrat i proteinës së QUMËSHTIT (përmban proteinë QUMËSHTI), koncentrat i proteinës së hirrës (përmban proteinë QUMËSHTI), QUMËSHT pluhur, kreatinë monohidrat, aromë: vanilje, trashës: gomë ksantani, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE GAINER (AKULLORE VANILJE)'
WHERE Variant_Id IN (1035,1040,1070,1519) AND HASHBYTES('SHA2_256', Ingredients) = 0x16B4E34DA79DC67C67D8AF750CF7560214A5E8AA3EE6B7725B218B471197975A;
SET @n += @@ROWCOUNT;
-- item 4
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BANANA PANCAKES

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, flavouring, L-leucine, thickeners (guar gum, xanthan gum), salt, natural flavouring, colour (beta-carotene), lactase enzyme powder, sweetener (sucralose).

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (BANANA PANCAKES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PETULLA ME BANANE

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, trashës (gomë guar, gomë ksantani), kripë, aromë natyrale, ngjyrues (beta-karoten), enzimë laktazë pluhur, ëmbëlsues (sukralozë).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (PETULLA ME BANANE)'
WHERE Variant_Id IN (1047,1073,1089,1094) AND HASHBYTES('SHA2_256', Ingredients) = 0x15CF02D0190FA570D7EB3EBC751C513E5656AF18A3B9EB68162E49DB0390EF14;
SET @n += @@ROWCOUNT;
-- item 5
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MILK CHOCOLATE

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, fat-reduced cocoa powder, instant MILK powder, maltodextrin, flavouring, L-leucine, salt, thickener (xanthan gum), natural flavouring, sweetener (sucralose), thickener (guar gum), lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (MILK CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË QUMËSHTI

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, kakao pluhur me pak yndyrë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, kripë, trashës (gomë ksantani), aromë natyrale, ëmbëlsues (sukralozë), trashës (gomë guar), enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (ÇOKOLLATË QUMËSHTI)'
WHERE Variant_Id IN (1050,1076,1083,1097) AND HASHBYTES('SHA2_256', Ingredients) = 0x82EFFC8637F01B7DA4D4214CF12792D6FCD9C0E0F9EFD670E6FDD07EBEF78119;
SET @n += @@ROWCOUNT;
-- item 6
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'WAFERS (CHOCO-HAZELNUT)

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, fat-reduced cocoa powder, instant MILK powder, maltodextrin, flavouring, L-leucine, salt, thickeners (guar gum, xanthan gum), natural flavouring (MILK), sweetener (sucralose), natural flavouring, lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (WAFERS (CHOCO-HAZELNUT))',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VAFLA (ÇOKO-LAJTHI)

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, kakao pluhur me pak yndyrë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, kripë, trashës (gomë guar, gomë ksantani), aromë natyrale (QUMËSHT), ëmbëlsues (sukralozë), aromë natyrale, enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (VAFLA (ÇOKO-LAJTHI))'
WHERE Variant_Id IN (1053,1079,1086,1093) AND HASHBYTES('SHA2_256', Ingredients) = 0x196342BA93C82B468B9813831D47334E1839EAB068269F1E80313AA6FEF8C8A3;
SET @n += @@ROWCOUNT;
-- item 7
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'WHITE CHOCOLATE AND COCONUT

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, flavouring, thickener (guar gum), L-leucine, natural flavouring, thickener (xanthan gum), salt, sweetener (sucralose), lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (WHITE CHOCOLATE AND COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E BARDHË DHE KOKOS

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, aromë, trashës (gomë guar), L-leucinë, aromë natyrale, trashës (gomë ksantani), kripë, ëmbëlsues (sukralozë), enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (ÇOKOLLATË E BARDHË DHE KOKOS)'
WHERE Variant_Id IN (1054,1080,1087,1100) AND HASHBYTES('SHA2_256', Ingredients) = 0x015775EE77F81973D48D07CB21906B5BFA34FFFD528969BBD3FB5EC0545AFDCE;
SET @n += @@ROWCOUNT;
-- item 8
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRIES AND CREAM

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, natural flavouring, colour (beetroot red), L-leucine, thickener (xanthan gum), salt, sweetener (sucralose), thickener (guar gum), lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (STRAWBERRIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE DHE KREM

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, aromë natyrale, ngjyrues (e kuqe panxhari), L-leucinë, trashës (gomë ksantani), kripë, ëmbëlsues (sukralozë), trashës (gomë guar), enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (LULESHTRYDHE DHE KREM)'
WHERE Variant_Id IN (1055,1077,1088,1101) AND HASHBYTES('SHA2_256', Ingredients) = 0x0A095134CF1648A2390A6F03DBEFA70E5B2C5F91F1A3335A742EAA0964650220;
SET @n += @@ROWCOUNT;
-- item 9
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE CAKE

INGREDIENTS: maltodextrin, MILK protein concentrate (contains MILK protein), whey protein concentrate (contains MILK protein), MILK powder, fat-reduced cocoa powder, creatine monohydrate, flavouring: chocolate, thickener: xanthan gum, sweetener: sucralose.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE GAINER (CHOCOLATE CAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'TORTË ME ÇOKOLLATË

PËRBËRËSIT: maltodekstrinë, koncentrat i proteinës së QUMËSHTIT (përmban proteinë QUMËSHTI), koncentrat i proteinës së hirrës (përmban proteinë QUMËSHTI), QUMËSHT pluhur, kakao pluhur me pak yndyrë, kreatinë monohidrat, aromë: çokollatë, trashës: gomë ksantani, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE GAINER (TORTË ME ÇOKOLLATË)'
WHERE Variant_Id IN (1036,1071,1520) AND HASHBYTES('SHA2_256', Ingredients) = 0x2CAF62EC037A5D36ECF33F4C5E1E4BB386DA83029038388774839C857B4B8D77;
SET @n += @@ROWCOUNT;
-- item 10
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: maltodextrin, MILK protein concentrate (contains MILK protein), whey protein concentrate (contains MILK protein), MILK powder, creatine monohydrate, flavouring: cookies, thickener: xanthan gum, flavouring: caramel, sweetener: sucralose.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE GAINER (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: maltodekstrinë, koncentrat i proteinës së QUMËSHTIT (përmban proteinë QUMËSHTI), koncentrat i proteinës së hirrës (përmban proteinë QUMËSHTI), QUMËSHT pluhur, kreatinë monohidrat, aromë: biskota, trashës: gomë ksantani, aromë: karamel, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE GAINER (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1037,1072,1521) AND HASHBYTES('SHA2_256', Ingredients) = 0x3153CAB6B8E32985EF5331A3AE10BC26411CDA051205C270BF3ED0B4D42430FA;
SET @n += @@ROWCOUNT;
-- item 11
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FRENCH VANILLA

INGREDIENTS: whey protein concentrate (96%) (whey protein (MILK), emulsifier (lecithins)), flavouring, white chocolate powder (sugar, cocoa butter, whole MILK powder, emulsifier (lecithins (SOY)), vanilla extract), thickener (xanthan gum), sweeteners (sucralose, steviol glycosides), colour (carotenes).

May contain traces of LUPIN, EGGS and GLUTEN.

Nutrition information for 100% WHEY PROTEIN (FRENCH VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE FRANCEZE

PËRBËRËSIT: koncentrat i proteinës së hirrës (96%) (proteinë hirre (QUMËSHT), emulsifikues (lecitina)), aromë, çokollatë e bardhë pluhur (sheqer, gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina (SOJE)), ekstrakt vaniljeje), trashës (gomë ksantani), ëmbëlsues (sukralozë, glikozide steviolike), ngjyrues (karotene).

Mund të përmbajë gjurmë të LUPINËS, VEZËVE dhe GLUTENIT.

Informacione ushqyese për 100% WHEY PROTEIN (VANILJE FRANCEZE)'
WHERE Variant_Id IN (1141,1143,1147) AND HASHBYTES('SHA2_256', Ingredients) = 0x87183F804650174B05E9018A53E41273A849B612AF3758AA5E30EF7677B8419B;
SET @n += @@ROWCOUNT;
-- item 12
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: whey protein blend (98%) (MILK) (whey protein isolate, whey protein concentrate, hydrolysed whey protein isolate, emulsifier: SOY lecithin), flavourings, sweeteners (sucralose, acesulfame K), thickener (xanthan gum), colour (beetroot red).

May contain GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: përzierje proteinash hirre (98%) (QUMËSHT) (izolat i proteinës së hirrës, koncentrat i proteinës së hirrës, izolat i hidrolizuar i proteinës së hirrës, emulsifikues: lecitinë SOJE), aroma, ëmbëlsues (sukralozë, acesulfam K), trashës (gomë ksantani), ngjyrues (e kuqe panxhari).

Mund të përmbajë GLUTEN, VEZË, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (LULESHTRYDHE)'
WHERE Variant_Id IN (1229,1232,1237) AND HASHBYTES('SHA2_256', Ingredients) = 0x9DCE58EC7A0D9003A20D66E6B4BAD64C3F951041F93ECED476EC57DBD7C31829;
SET @n += @@ROWCOUNT;
-- item 13
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DOUBLE RICH CHOCOLATE

INGREDIENTS: whey protein blend (93%) (MILK) (whey protein isolate, whey protein concentrate, hydrolysed whey protein isolate, emulsifier: SOY lecithin), fat-reduced cocoa powder, flavourings, thickener (xanthan gum), sweeteners (sucralose, acesulfame K).

May contain GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (DOUBLE RICH CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E DYFISHTË E PASUR

PËRBËRËSIT: përzierje proteinash hirre (93%) (QUMËSHT) (izolat i proteinës së hirrës, koncentrat i proteinës së hirrës, izolat i hidrolizuar i proteinës së hirrës, emulsifikues: lecitinë SOJE), kakao pluhur me pak yndyrë, aroma, trashës (gomë ksantani), ëmbëlsues (sukralozë, acesulfam K).

Mund të përmbajë GLUTEN, VEZË, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (ÇOKOLLATË E DYFISHTË E PASUR)'
WHERE Variant_Id IN (1230,1233,1236) AND HASHBYTES('SHA2_256', Ingredients) = 0xCE48AFF51D6A2C89F9CCAB3527AD3DBE3D7DF3C864A0904D43BF77896C111C54;
SET @n += @@ROWCOUNT;
-- item 14
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA ICE CREAM

INGREDIENTS: whey protein blend (98%) (MILK) (whey protein isolate, whey protein concentrate, hydrolysed whey protein isolate, emulsifier: SOY lecithin), flavourings (MILK), thickener (xanthan gum), sweetener (sucralose), colour (curcumin).

May contain GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE VANILJE

PËRBËRËSIT: përzierje proteinash hirre (98%) (QUMËSHT) (izolat i proteinës së hirrës, koncentrat i proteinës së hirrës, izolat i hidrolizuar i proteinës së hirrës, emulsifikues: lecitinë SOJE), aroma (QUMËSHT), trashës (gomë ksantani), ëmbëlsues (sukralozë), ngjyrues (kurkuminë).

Mund të përmbajë GLUTEN, VEZË, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM WHEY PROTEIN GOLD STANDARD 100% (AKULLORE VANILJE)'
WHERE Variant_Id IN (1231,1234,1235) AND HASHBYTES('SHA2_256', Ingredients) = 0x307D46F9DA978AFF3F6152ED56A8AA8EB1C7F72AC46776FD6EDD56FCA316F069;
SET @n += @@ROWCOUNT;
-- item 15
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: whey protein concentrate, MILK chocolate (sugar, cocoa powder, whole MILK powder, cocoa butter, natural flavouring, salt), fat-reduced cocoa powder (3.5%), salt, sweetener (steviol glycosides), whey protein isolate, lactase enzyme.

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH and CRUSTACEANS.

Nutrition information for 100% NATURAL WHEY PROTEIN (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: koncentrat i proteinës së hirrës, çokollatë QUMËSHTI (sheqer, kakao pluhur, QUMËSHT i plotë pluhur, gjalpë kakaoje, aromë natyrale, kripë), kakao pluhur me pak yndyrë (3,5%), kripë, ëmbëlsues (glikozide steviolike), izolat i proteinës së hirrës, enzimë laktazë.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për 100% NATURAL WHEY PROTEIN (ÇOKOLLATË)'
WHERE Variant_Id IN (1238,1273,1277) AND HASHBYTES('SHA2_256', Ingredients) = 0x5B4A633D1B93938893AD2E65BDBD4EDFF73D0667AAF61EF9961376CFD086E120;
SET @n += @@ROWCOUNT;
-- item 16
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA

INGREDIENTS: whey protein concentrate (MILK), white chocolate powder (sugar, cocoa butter, whole MILK powder), flavouring (vanilla), salt, yoghurt powder (MILK), sweetener (steviol glycosides), thickener (xanthan gum), whey protein isolate (MILK), lactase enzyme.

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH and CRUSTACEANS.

Nutrition information for 100% NATURAL WHEY PROTEIN (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE

PËRBËRËSIT: koncentrat i proteinës së hirrës (QUMËSHT), çokollatë e bardhë pluhur (sheqer, gjalpë kakaoje, QUMËSHT i plotë pluhur), aromë (vanilje), kripë, kos pluhur (QUMËSHT), ëmbëlsues (glikozide steviolike), trashës (gomë ksantani), izolat i proteinës së hirrës (QUMËSHT), enzimë laktazë.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për 100% NATURAL WHEY PROTEIN (VANILJE)'
WHERE Variant_Id IN (1239,1274,1276) AND HASHBYTES('SHA2_256', Ingredients) = 0xE4133DFC69DE13BF7FF894A5F66E0184C509D786B4B12E7BFA2818167C45E633;
SET @n += @@ROWCOUNT;
-- item 17
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY AND WHITE CHOCOLATE

INGREDIENTS: whey protein concentrate (MILK), flavouring (strawberry), white chocolate powder (sugar, cocoa butter, whole MILK powder), salt, yoghurt powder (MILK), colour (beetroot red), sweetener (steviol glycosides), thickener (xanthan gum), acidity regulator (citric acid), whey protein isolate (MILK), lactase enzyme.

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH and CRUSTACEANS.

Nutrition information for 100% NATURAL WHEY PROTEIN (STRAWBERRY AND WHITE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE DHE ÇOKOLLATË E BARDHË

PËRBËRËSIT: koncentrat i proteinës së hirrës (QUMËSHT), aromë (luleshtrydhe), çokollatë e bardhë pluhur (sheqer, gjalpë kakaoje, QUMËSHT i plotë pluhur), kripë, kos pluhur (QUMËSHT), ngjyrues (e kuqe panxhari), ëmbëlsues (glikozide steviolike), trashës (gomë ksantani), rregullues aciditeti (acid citrik), izolat i proteinës së hirrës (QUMËSHT), enzimë laktazë.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për 100% NATURAL WHEY PROTEIN (LULESHTRYDHE DHE ÇOKOLLATË E BARDHË)'
WHERE Variant_Id IN (1240,1275,1278) AND HASHBYTES('SHA2_256', Ingredients) = 0xD6688D2B9E3D46447143655DF29FC937248664B5FF1215A4B9690949E3A40EA9;
SET @n += @@ROWCOUNT;
-- item 18
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'NATURAL FLAVOUR (UNFLAVOURED)

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, instant MILK powder, maltodextrin, L-leucine, thickener (xanthan gum), lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJE NATYRALE (PA SHIJE)

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, QUMËSHT pluhur instant, maltodekstrinë, L-leucinë, trashës (gomë ksantani), enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (PA SHIJE)'
WHERE Variant_Id IN (1051,1084) AND HASHBYTES('SHA2_256', Ingredients) = 0xD6B643B9ED4065F302506588F995A1F6121E90D038B98D98336806908A95E418;
SET @n += @@ROWCOUNT;
-- item 19
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CITRUS MIX

INGREDIENTS: L-citrulline 33%, micronised creatine monohydrate 19%, beta-alanine 17%, acids (citric acid, malic acid), flavourings, inulin, sweeteners (sucralose, acesulfame K), caffeine anhydrous 1.4%, anti-caking agent (silicon dioxide), bitter orange fruit extract (Citrus aurantium) 0.8%, microencapsulated caffeine 0.4% (caffeine, emulsifier: mono- and diglycerides of fatty acids), colours (riboflavins, copper complexes of chlorophylls and chlorophyllins), cyanocobalamin.

May contain traces of MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for BATTERY LIMITLESS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MIKS AGRUMESH

PËRBËRËSIT: L-citrulinë 33%, kreatinë monohidrat e mikronizuar 19%, beta-alaninë 17%, acide (acid citrik, acid malik), aroma, inulinë, ëmbëlsues (sukralozë, acesulfam K), kafeinë anhidre 1,4%, agjent kundër ngjizjes (dioksid silici), ekstrakt i frutit të portokallit të hidhur (Citrus aurantium) 0,8%, kafeinë e mikrokapsuluar 0,4% (kafeinë, emulsifikues: mono- dhe digliceride të acideve yndyrore), ngjyrues (riboflavina, komplekse bakri të klorofileve dhe klorofilinave), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për BATTERY LIMITLESS'
WHERE Variant_Id IN (1056,1109) AND HASHBYTES('SHA2_256', Ingredients) = 0x896C6DF59C790449DA69F39DB9D86D94DF0D3334DEF3D615454AE1E3B85352D9;
SET @n += @@ROWCOUNT;
-- item 20
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GREEN TEA - STRAWBERRY

INGREDIENTS: L-citrulline 33%, micronised creatine monohydrate 19%, beta-alanine 17%, flavourings, acids (citric acid, malic acid), inulin, sweeteners (sucralose, acesulfame K), caffeine anhydrous 1.4%, anti-caking agent (silicon dioxide), bitter orange fruit extract (Citrus aurantium) 0.8%, microencapsulated caffeine 0.4% (caffeine, emulsifier: mono- and diglycerides of fatty acids), colours (sulphite ammonia caramel, copper complexes of chlorophylls and chlorophyllins), cyanocobalamin.

May contain traces of MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for BATTERY LIMITLESS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇAJ JESHIL - LULESHTRYDHE

PËRBËRËSIT: L-citrulinë 33%, kreatinë monohidrat e mikronizuar 19%, beta-alaninë 17%, aroma, acide (acid citrik, acid malik), inulinë, ëmbëlsues (sukralozë, acesulfam K), kafeinë anhidre 1,4%, agjent kundër ngjizjes (dioksid silici), ekstrakt i frutit të portokallit të hidhur (Citrus aurantium) 0,8%, kafeinë e mikrokapsuluar 0,4% (kafeinë, emulsifikues: mono- dhe digliceride të acideve yndyrore), ngjyrues (karamel amoniaku me sulfit, komplekse bakri të klorofileve dhe klorofilinave), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për BATTERY LIMITLESS'
WHERE Variant_Id IN (1057,1110) AND HASHBYTES('SHA2_256', Ingredients) = 0xF1E35AD679441C105F1569AFF72E8C1DFAF41D8686E705B6437AB9D52DB6B4D0;
SET @n += @@ROWCOUNT;
-- item 21
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA

INGREDIENTS: whey protein blend (whey protein concentrate from MILK {instantised with sunflower lecithin}, whey protein isolate from MILK {instantised with sunflower lecithin}), L-glycine, skimmed MILK powder, maltodextrin, flavourings, sodium chloride, thickener (xanthan gum), sweeteners (acesulfame K, sucralose), DigeZyme® enzyme complex (alpha-amylase, neutral protease, cellulase, lactase, lipase).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL WHEY PROTEIN (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE

PËRBËRËSIT: përzierje proteinash hirre (koncentrat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}, izolat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}), L-glicinë, QUMËSHT i skremuar pluhur, maltodekstrinë, aroma, klorur natriumi, trashës (gomë ksantani), ëmbëlsues (acesulfam K, sukralozë), kompleks enzimatik DigeZyme® (alfa-amilazë, proteazë neutrale, celulazë, laktazë, lipazë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL WHEY PROTEIN (VANILJE)'
WHERE Variant_Id IN (1113,1118) AND HASHBYTES('SHA2_256', Ingredients) = 0x747AD09ABBA8B081F030ED15759B6CAEF90A6F62781F33FBBC60B347E592996C;
SET @n += @@ROWCOUNT;
-- item 22
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE AND HAZELNUT

INGREDIENTS: whey protein blend (whey protein concentrate from MILK {instantised with sunflower lecithin}, whey protein isolate from MILK {instantised with sunflower lecithin}), L-glycine, skimmed MILK powder, maltodextrin, fat-reduced cocoa powder (10–12%), flavourings, sodium chloride, thickener (xanthan gum), sweeteners (acesulfame K, sucralose), DigeZyme® enzyme complex (alpha-amylase, neutral protease, cellulase, lactase, lipase).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL WHEY PROTEIN (CHOCOLATE AND HAZELNUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË DHE LAJTHI

PËRBËRËSIT: përzierje proteinash hirre (koncentrat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}, izolat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}), L-glicinë, QUMËSHT i skremuar pluhur, maltodekstrinë, kakao pluhur me pak yndyrë (10–12%), aroma, klorur natriumi, trashës (gomë ksantani), ëmbëlsues (acesulfam K, sukralozë), kompleks enzimatik DigeZyme® (alfa-amilazë, proteazë neutrale, celulazë, laktazë, lipazë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL WHEY PROTEIN (ÇOKOLLATË DHE LAJTHI)'
WHERE Variant_Id IN (1114,1122) AND HASHBYTES('SHA2_256', Ingredients) = 0xF28918E0E7B9485464F415C9EBBDFAB1D780FC5213BA3A3662D10D388466C9CC;
SET @n += @@ROWCOUNT;
-- item 23
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: whey protein blend (whey protein concentrate from MILK {instantised with sunflower lecithin}, whey protein isolate from MILK {instantised with sunflower lecithin}), L-glycine, skimmed MILK powder, maltodextrin, flavouring, sodium chloride, colour (beetroot red), sweeteners (acesulfame K, sucralose), thickener (xanthan gum), DigeZyme® enzyme complex (alpha-amylase, neutral protease, cellulase, lactase, lipase).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL WHEY PROTEIN (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: përzierje proteinash hirre (koncentrat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}, izolat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}), L-glicinë, QUMËSHT i skremuar pluhur, maltodekstrinë, aromë, klorur natriumi, ngjyrues (e kuqe panxhari), ëmbëlsues (acesulfam K, sukralozë), trashës (gomë ksantani), kompleks enzimatik DigeZyme® (alfa-amilazë, proteazë neutrale, celulazë, laktazë, lipazë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL WHEY PROTEIN (LULESHTRYDHE)'
WHERE Variant_Id IN (1115,1120) AND HASHBYTES('SHA2_256', Ingredients) = 0xC9629E0BDB173B28FBE6E5E7989A4392D1ED7698A63B2D4B07DD2C9BE3D64F84;
SET @n += @@ROWCOUNT;
-- item 24
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: whey protein blend (whey protein concentrate from MILK {instantised with sunflower lecithin}, whey protein isolate from MILK {instantised with sunflower lecithin}), L-glycine, skimmed MILK powder, maltodextrin, flavouring (cookies and cream), fat-reduced cocoa powder, sodium chloride, thickener (xanthan gum), sweeteners (acesulfame K, sucralose), DigeZyme® enzyme complex (alpha-amylase, neutral protease, cellulase, lactase, lipase).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL WHEY PROTEIN (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: përzierje proteinash hirre (koncentrat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}, izolat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}), L-glicinë, QUMËSHT i skremuar pluhur, maltodekstrinë, aromë (biskota dhe krem), kakao pluhur me pak yndyrë, klorur natriumi, trashës (gomë ksantani), ëmbëlsues (acesulfam K, sukralozë), kompleks enzimatik DigeZyme® (alfa-amilazë, proteazë neutrale, celulazë, laktazë, lipazë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL WHEY PROTEIN (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1116,1119) AND HASHBYTES('SHA2_256', Ingredients) = 0x7634514B3B75368015936F27267566A98872C67BC587604A1530432B2AB05FBF;
SET @n += @@ROWCOUNT;
-- item 25
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCO-BANANA

INGREDIENTS: whey protein blend (whey protein concentrate from MILK {instantised with sunflower lecithin}, whey protein isolate from MILK {instantised with sunflower lecithin}), L-glycine, skimmed MILK powder, maltodextrin, fat-reduced cocoa powder, flavourings (chocolate, banana), sodium chloride, thickener (xanthan gum), sweeteners (acesulfame K, sucralose), DigeZyme® enzyme complex (alpha-amylase, neutral protease, cellulase, lactase, lipase).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL WHEY PROTEIN (CHOCO-BANANA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKO-BANANE

PËRBËRËSIT: përzierje proteinash hirre (koncentrat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}, izolat i proteinës së hirrës nga QUMËSHTI {i instantizuar me lecitinë luledielli}), L-glicinë, QUMËSHT i skremuar pluhur, maltodekstrinë, kakao pluhur me pak yndyrë, aroma (çokollatë, banane), klorur natriumi, trashës (gomë ksantani), ëmbëlsues (acesulfam K, sukralozë), kompleks enzimatik DigeZyme® (alfa-amilazë, proteazë neutrale, celulazë, laktazë, lipazë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL WHEY PROTEIN (ÇOKO-BANANE)'
WHERE Variant_Id IN (1117,1121) AND HASHBYTES('SHA2_256', Ingredients) = 0x7F630B23FC6F86FA9C2575EE5BE9C7F03DA5F13B663DB74E35C21DC07C7ED1C6;
SET @n += @@ROWCOUNT;
-- item 26
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: MILK chocolate (27%) (sugar, cocoa butter, skimmed MILK powder, cocoa mass, lactose and whey protein (MILK), palm fat, whey powder (MILK), MILK fat, emulsifier (SOY lecithin), natural vanilla flavouring), MILK protein, hydrolysed collagen, polydextrose, humectant (glycerol), desiccated coconut (8%), water, palm fat, flavouring.

May contain GLUTEN, EGGS, PEANUTS and NUTS.

Nutrition information for BOUNTY HI PROTEIN BAR',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: çokollatë QUMËSHTI (27%) (sheqer, gjalpë kakaoje, QUMËSHT i skremuar pluhur, masë kakaoje, laktozë dhe proteinë hirre (QUMËSHT), yndyrë palme, hirrë pluhur (QUMËSHT), yndyrë QUMËSHTI, emulsifikues (lecitinë SOJE), aromë natyrale vaniljeje), proteinë QUMËSHTI, kolagjen i hidrolizuar, polidekstrozë, lagështues (glicerol), kokos i tharë (8%), ujë, yndyrë palme, aromë.

Mund të përmbajë GLUTEN, VEZË, KIKIRIKË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për BOUNTY HI PROTEIN BAR'
WHERE Variant_Id IN (1134,1135) AND HASHBYTES('SHA2_256', Ingredients) = 0x42CDC85613EC1D3DA4A3E27654F84A0C836046164812B8BDE1A4F5AFA68FCE0B;
SET @n += @@ROWCOUNT;
-- item 27
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY

INGREDIENTS: whey protein concentrate (MILK) (93%) (contains emulsifier (lecithins)), food colouring (beetroot powder), acidity regulator (citric acid), flavouring, thickener (xanthan gum), sweeteners (sucralose, steviol glycosides from stevia), raspberry powder (0.10%) (raspberries, maltodextrin, acidity regulator (citric acid)).

May contain traces of EGGS, SOY, GLUTEN and LUPIN.

Nutrition information for 100% WHEY PROTEIN (RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR

PËRBËRËSIT: koncentrat i proteinës së hirrës (QUMËSHT) (93%) (përmban emulsifikues (lecitina)), ngjyrues ushqimor (panxhar pluhur), rregullues aciditeti (acid citrik), aromë, trashës (gomë ksantani), ëmbëlsues (sukralozë, glikozide steviolike nga stevia), mjedër pluhur (0,10%) (mjedra, maltodekstrinë, rregullues aciditeti (acid citrik)).

Mund të përmbajë gjurmë të VEZËVE, SOJES, GLUTENIT dhe LUPINËS.

Informacione ushqyese për 100% WHEY PROTEIN (MJEDËR)'
WHERE Variant_Id IN (1142,1144) AND HASHBYTES('SHA2_256', Ingredients) = 0xFD308B3F177A372050236ED40E9281D6E169B9A2484BA808EC661E95AAA8201F;
SET @n += @@ROWCOUNT;
-- item 28
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: white chocolate with maltitol (32%) (sweetener (maltitol), cocoa butter, whole MILK powder, emulsifier (lecithins (SOY)), natural flavouring), MILK protein, humectant (glycerol), hydrolysed collagen (bovine), plant fibre (polydextrose), water, SOY protein pieces (4.5%) (SOY protein isolate, cocoa, tapioca starch), sunflower oil, fat-reduced alkalised cocoa powder, flavourings, sweetener (sucralose).

May contain traces of GLUTEN, PEANUTS and NUTS.

Nutrition information for IRONMAXX LAVA BAR (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: çokollatë e bardhë me maltitol (32%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina (SOJE)), aromë natyrale), proteinë QUMËSHTI, lagështues (glicerol), kolagjen i hidrolizuar (gjedhi), fibra bimore (polidekstrozë), ujë, copa proteine SOJE (4,5%) (izolat i proteinës së SOJES, kakao, niseshte tapioke), vaj luledielli, kakao pluhur e alkalizuar me pak yndyrë, aroma, ëmbëlsues (sukralozë).

Mund të përmbajë gjurmë të GLUTENIT, KIKIRIKËVE dhe FRUTAVE ME LËVOZHGË.

Informacione ushqyese për IRONMAXX LAVA BAR (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1154,1156) AND HASHBYTES('SHA2_256', Ingredients) = 0x55D2FBE90B7D269E0508050FF91ABC9E5259C77D04AC76F39F9132FDC608B0D9;
SET @n += @@ROWCOUNT;
-- item 29
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FUDGE BROWNIE

INGREDIENTS: whole MILK chocolate with maltitol (sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins (SOY)), natural flavouring), MILK protein, humectant (glycerol), hydrolysed collagen (bovine), plant fibre (polydextrose), dark chocolate with maltitol (5%) (cocoa mass, sweetener (maltitol), cocoa butter, emulsifier (sunflower lecithin), natural flavouring), water, HAZELNUT pieces (roasted) (4.5%), sunflower oil, fat-reduced alkalised cocoa powder (1.6%), natural flavouring, flavourings, sweetener (sucralose).

May contain traces of GLUTEN, PEANUTS and OTHER NUTS.

Nutrition information for IRONMAXX LAVA BAR (FUDGE BROWNIE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'FUDGE BROWNIE

PËRBËRËSIT: çokollatë QUMËSHTI e plotë me maltitol (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina (SOJE)), aromë natyrale), proteinë QUMËSHTI, lagështues (glicerol), kolagjen i hidrolizuar (gjedhi), fibra bimore (polidekstrozë), çokollatë e zezë me maltitol (5%) (masë kakaoje, ëmbëlsues (maltitol), gjalpë kakaoje, emulsifikues (lecitinë luledielli), aromë natyrale), ujë, copa LAJTHIE (të pjekura) (4,5%), vaj luledielli, kakao pluhur e alkalizuar me pak yndyrë (1,6%), aromë natyrale, aroma, ëmbëlsues (sukralozë).

Mund të përmbajë gjurmë të GLUTENIT, KIKIRIKËVE dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për IRONMAXX LAVA BAR (FUDGE BROWNIE)'
WHERE Variant_Id IN (1155,1157) AND HASHBYTES('SHA2_256', Ingredients) = 0x8C2FC941EAE93C7B807CD68A9B3A194A7D8885E43D8D74EDD1F2E8B151493C96;
SET @n += @@ROWCOUNT;
-- item 30
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PISTACHIO AND WHITE CHOCOLATE

INGREDIENTS: white chocolate with maltitol (16%) [sweetener (maltitol), cocoa butter, whole MILK powder, emulsifier (sunflower lecithin), flavouring], PISTACHIOS (12.3%), humectant (glycerol), whey protein concentrate (MILK), caramel-flavoured paste (10%) [sweetener (sorbitol), bulking agent (polydextrose), coconut oil, water, humectant (glycerol), skimmed MILK powder, emulsifier (mono- and diglycerides of fatty acids), acidity regulator (trisodium citrate), salt, natural flavouring], MILK protein, hydrolysed collagen, fructo-oligosaccharides, flavouring, coconut fat (refined), chocolate with maltitol (2%) [cocoa mass, sweetener (maltitol), cocoa butter, emulsifiers (sunflower lecithin, polyglycerol polyricinoleate), flavouring], emulsifier (sunflower lecithin), salt, antioxidant (alpha-tocopherol), sweetener (sucralose), colours (E104, E131).

E104 may have '
  + N'an adverse effect on activity and attention in children.

May contain traces of EGGS, SOY and OTHER NUTS.

Nutrition information for IRONMAXX PROTEIN & NUT BAR (PISTACHIO AND WHITE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'FISTIK DHE ÇOKOLLATË E BARDHË

PËRBËRËSIT: çokollatë e bardhë me maltitol (16%) [ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitinë luledielli), aromë], FISTIKË (12,3%), lagështues (glicerol), koncentrat i proteinës së hirrës (QUMËSHT), pastë me shije karameli (10%) [ëmbëlsues (sorbitol), agjent për rritjen e vëllimit (polidekstrozë), vaj kokosi, ujë, lagështues (glicerol), QUMËSHT i skremuar pluhur, emulsifikues (mono- dhe digliceride të acideve yndyrore), rregullues aciditeti (citrat trinatriumi), kripë, aromë natyrale], proteinë QUMËSHTI, kolagjen i hidrolizuar, frukto-oligosakaride, aromë, yndyrë kokosi (e rafinuar), çokollatë me maltitol (2%) [masë kakaoje, ëmbëlsues (maltitol), gjalpë kakaoje, emulsifikues (lecitinë luledielli, poliricinoleat poliglicerol), aromë], emulsifikues (lecitinë luledielli), kripë,'
  + N' antioksidant (alfa-tokoferol), ëmbëlsues (sukralozë), ngjyrues (E104, E131).

E104 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Mund të përmbajë gjurmë të VEZËVE, SOJES dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për IRONMAXX PROTEIN & NUT BAR (FISTIK DHE ÇOKOLLATË E BARDHË)'
WHERE Variant_Id IN (1158,1159) AND HASHBYTES('SHA2_256', Ingredients) = 0x3E0ACA40BD7939219A0FB9E154E1E7000451B34766E95BE3119266148EEF0C45;
SET @n += @@ROWCOUNT;
-- item 31
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'SALTED CARAMEL

INGREDIENTS: salted caramel-flavoured creamy filling (56%) (sweetener (maltitol), whey protein (MILK), vegetable fats (shea butter, cocoa butter), vegetable oils (sunflower oil, safflower oil), SOY protein isolate, colour (caramel), emulsifier (lecithin (SOY)), flavouring, salt (0.17%)), MILK chocolate (15%) (MILK protein, cocoa butter, hydrolysed collagen (bovine), HAZELNUT paste (4%), cocoa mass (3.8%), sweetener (maltitol), whole MILK powder, fructo-oligosaccharides, sweeteners (erythritol, steviol glycosides from stevia), sunflower oil, emulsifier (lecithins), emulsifier (lecithin (SOY)), natural vanilla flavouring, vanillin), rice flour, potato starch, MILK protein, corn starch, quinoa flour, raising agents (sodium bicarbonate, ammonium bicarbonate).

May contain traces of EGGS, PEANUTS and OTHER NUTS.

Nutrition information for IRONMAXX PROTEINO (SALTED CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KARAMEL I KRIPUR

PËRBËRËSIT: mbushje kremoze me shije karameli të kripur (56%) (ëmbëlsues (maltitol), proteinë hirre (QUMËSHT), yndyrna bimore (gjalpë shea, gjalpë kakaoje), vajra bimore (vaj luledielli, vaj shafrani), izolat i proteinës së SOJES, ngjyrues (karamel), emulsifikues (lecitinë (SOJE)), aromë, kripë (0,17%)), çokollatë QUMËSHTI (15%) (proteinë QUMËSHTI, gjalpë kakaoje, kolagjen i hidrolizuar (gjedhi), pastë LAJTHIE (4%), masë kakaoje (3,8%), ëmbëlsues (maltitol), QUMËSHT i plotë pluhur, frukto-oligosakaride, ëmbëlsues (eritritol, glikozide steviolike nga stevia), vaj luledielli, emulsifikues (lecitina), emulsifikues (lecitinë (SOJE)), aromë natyrale vaniljeje, vanilinë), miell orizi, niseshte patatesh, proteinë QUMËSHTI, niseshte misri, miell kinoje, agjentë mbirës (bikarbonat natriumi, bikarbonat amoniumi).

Mund të përmbajë gjurmë të '
  + N'VEZËVE, KIKIRIKËVE dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për IRONMAXX PROTEINO (KARAMEL I KRIPUR)'
WHERE Variant_Id IN (1160,1163) AND HASHBYTES('SHA2_256', Ingredients) = 0x4C0970C127FBDC9F1F965450CA77D4BADFF16BA3296E32F9C29038F406A3EDC0;
SET @n += @@ROWCOUNT;
-- item 32
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DOUBLE DARK CHOCOLATE

INGREDIENTS: chocolate-flavoured creamy filling (56%) (sweetener (maltitol), vegetable fats (shea butter, cocoa butter), vegetable oils (sunflower oil, safflower oil), whey protein (MILK), fat-reduced cocoa powder, HAZELNUT paste (2.8%), SOY protein isolate, emulsifier (lecithin (SOY)), flavouring), chocolate with sweetener (22.6%) (cocoa mass (9%), inulin, cocoa butter, sweetener (erythritol), fat-reduced cocoa powder, emulsifier (lecithin (SOY)), natural vanilla flavouring, sweetener (steviol glycosides from stevia)), MILK protein, cocoa butter, rice flour, potato starch, corn starch, sunflower oil, emulsifier (lecithins), quinoa flour, sweetener (sucralose), raising agents (sodium bicarbonate, ammonium bicarbonate).

May contain traces of EGGS, PEANUTS and OTHER NUTS.

Nutrition information for IRONMAXX PROTEINO (DOUBLE DARK CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E ZEZË E DYFISHTË

PËRBËRËSIT: mbushje kremoze me shije çokollate (56%) (ëmbëlsues (maltitol), yndyrna bimore (gjalpë shea, gjalpë kakaoje), vajra bimore (vaj luledielli, vaj shafrani), proteinë hirre (QUMËSHT), kakao pluhur me pak yndyrë, pastë LAJTHIE (2,8%), izolat i proteinës së SOJES, emulsifikues (lecitinë (SOJE)), aromë), çokollatë me ëmbëlsues (22,6%) (masë kakaoje (9%), inulinë, gjalpë kakaoje, ëmbëlsues (eritritol), kakao pluhur me pak yndyrë, emulsifikues (lecitinë (SOJE)), aromë natyrale vaniljeje, ëmbëlsues (glikozide steviolike nga stevia)), proteinë QUMËSHTI, gjalpë kakaoje, miell orizi, niseshte patatesh, niseshte misri, vaj luledielli, emulsifikues (lecitina), miell kinoje, ëmbëlsues (sukralozë), agjentë mbirës (bikarbonat natriumi, bikarbonat amoniumi).

Mund të përmbajë gjurmë të VEZËVE, KIKIRIKËVE dhe FRUTAVE TË '
  + N'TJERA ME LËVOZHGË.

Informacione ushqyese për IRONMAXX PROTEINO (ÇOKOLLATË E ZEZË E DYFISHTË)'
WHERE Variant_Id IN (1161,1164) AND HASHBYTES('SHA2_256', Ingredients) = 0xA84D4969635DF6A668FF50B83CFB933F457419C51E8F4B20D9378A5518612E42;
SET @n += @@ROWCOUNT;
-- item 33
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'WHITE CHOCOLATE AND PISTACHIO

INGREDIENTS: PISTACHIO-flavoured creamy filling (56%) (sweetener (maltitol), protein blend (whey protein isolate (MILK), SOY protein isolate), vegetable fats (cocoa butter, shea butter), PISTACHIO paste (15%), vegetable oils (sunflower oil, safflower oil), emulsifier (lecithin), flavourings), white chocolate with sweetener (11.9%) (cocoa butter, whole MILK powder, emulsifier (lecithin (SOY)), sweetener (maltitol), natural vanilla flavouring), hydrolysed collagen (bovine), cocoa butter, MILK protein, rice flour, potato starch, corn starch, sunflower oil, emulsifier (lecithins), quinoa flour, raising agents (sodium bicarbonate, ammonium bicarbonate).

May contain traces of EGGS, PEANUTS and OTHER NUTS.

Nutrition information for IRONMAXX PROTEINO (WHITE CHOCOLATE AND PISTACHIO)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E BARDHË DHE FISTIK

PËRBËRËSIT: mbushje kremoze me shije FISTIKU (56%) (ëmbëlsues (maltitol), përzierje proteinash (izolat i proteinës së hirrës (QUMËSHT), izolat i proteinës së SOJES), yndyrna bimore (gjalpë kakaoje, gjalpë shea), pastë FISTIKU (15%), vajra bimore (vaj luledielli, vaj shafrani), emulsifikues (lecitinë), aroma), çokollatë e bardhë me ëmbëlsues (11,9%) (gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitinë (SOJE)), ëmbëlsues (maltitol), aromë natyrale vaniljeje), kolagjen i hidrolizuar (gjedhi), gjalpë kakaoje, proteinë QUMËSHTI, miell orizi, niseshte patatesh, niseshte misri, vaj luledielli, emulsifikues (lecitina), miell kinoje, agjentë mbirës (bikarbonat natriumi, bikarbonat amoniumi).

Mund të përmbajë gjurmë të VEZËVE, KIKIRIKËVE dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për IRONMAXX PROTEINO '
  + N'(ÇOKOLLATË E BARDHË DHE FISTIK)'
WHERE Variant_Id IN (1162,1165) AND HASHBYTES('SHA2_256', Ingredients) = 0x5DD215B6DB3BB5D90F048FF689C7945FD2E33247605F7D601C09BB4EFE5E181D;
SET @n += @@ROWCOUNT;
-- item 34
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'WHITE CRISPY CHOCOLATE

Protein blend (48.1%) (MILK PROTEIN, collagen hydrolysate, SOY protein isolate), humectant (glycerol), white maltitol chocolate (15%) (sweetener [maltitol], cocoa butter, whole MILK powder, emulsifier [lecithins], flavouring), SOY PROTEIN CRISPIES (5%) (SOY PROTEIN, rice semolina, SOY FLOUR, salt), palm fat, flavouring, inulin, vanilla powder (0.1%), salt, antioxidants (DL-alpha-tocopherol), sweetener (sucralose), emulsifier (lecithins).

May contain traces of EGGS and NUTS. Excessive consumption may have a laxative effect.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E BARDHË KRANÇ

Përzierje proteinash (48,1%) (PROTEINË QUMËSHTI, hidrolizat kolagjeni, izolat i proteinës së SOJES), lagështues (glicerol), çokollatë e bardhë me maltitol (15%) (ëmbëlsues [maltitol], gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues [lecitina], aromë), KRISPI PROTEINE SOJE (5%) (PROTEINË SOJE, bollgur orizi, MIELL SOJE, kripë), yndyrë palme, aromë, inulinë, vanilje pluhur (0,1%), kripë, antioksidantë (DL-alfa-tokoferol), ëmbëlsues (sukralozë), emulsifikues (lecitina).

Mund të përmbajë gjurmë të VEZËVE dhe FRUTAVE ME LËVOZHGË. Konsumimi i tepërt mund të ketë efekt laksativ.'
WHERE Variant_Id IN (1169,1170) AND HASHBYTES('SHA2_256', Ingredients) = 0x85CAE53495558D0B53942BE6780A5CBD2884D15752FAC3D5325EE6D73F8ADE17;
SET @n += @@ROWCOUNT;
-- item 35
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIE DOUGH

INGREDIENTS: milk chocolate with sweetener (22%) (maltitols, cocoa butter, whole MILK powder, emulsifier [lecithins], flavouring), MILK protein, maltitols, humectant (glycerol), hydrolysed bovine collagen, SOY crispy pieces (SOY protein, cocoa, tapioca starch), vegetable fats (sunflower oil, shea butter, coconut oil), cocoa powder, MILK powder, pea protein isolate, starch (potato, corn), flavouring, emulsifier (lecithins), vanilla extract, sweetener (sucralose).

ALLERGENS: Contains MILK and SOY. May contain PEANUTS, GLUTEN, EGGS and NUTS.

Nutrition information for NÄNO SUPPS PROTEIN BAR (COOKIE DOUGH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BRUMË BISKOTASH

PËRBËRËSIT: çokollatë qumështi me ëmbëlsues (22%) (maltitole, gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues [lecitina], aromë), proteinë QUMËSHTI, maltitole, lagështues (glicerol), kolagjen gjedhi i hidrolizuar, copa krokante SOJE (proteinë SOJE, kakao, niseshte tapioke), yndyrna bimore (vaj luledielli, gjalpë shea, vaj kokosi), kakao pluhur, QUMËSHT pluhur, izolat i proteinës së bizeles, niseshte (patatesh, misri), aromë, emulsifikues (lecitina), ekstrakt vaniljeje, ëmbëlsues (sukralozë).

ALERGJENËT: Përmban QUMËSHT dhe SOJE. Mund të përmbajë KIKIRIKË, GLUTEN, VEZË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS PROTEIN BAR (BRUMË BISKOTASH)'
WHERE Variant_Id IN (1173,1177) AND HASHBYTES('SHA2_256', Ingredients) = 0xAAAF7B9839F3ED9F64BA179CC0F9D65825EB20B151690729206947B10E336FD8;
SET @n += @@ROWCOUNT;
-- item 36
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE BROWNIE

INGREDIENTS: milk chocolate with sweetener (20%) (maltitols, cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins [SOY]), vanilla extract), MILK protein, maltitols, hydrolysed bovine collagen, humectant (glycerol), cocoa powder, pea protein isolate, cocoa butter, vegetable fats (sunflower, rapeseed, shea), starch (corn, potato), WHEAT flour, HAZELNUTS (1.4%), flavouring, emulsifier (lecithins), sweeteners (sucralose, isomalt, erythritol), oligofructose, raising agent (sodium hydrogen carbonate), salt.

ALLERGENS: Contains MILK, SOY, GLUTEN and HAZELNUTS. May contain PEANUTS, EGGS and OTHER NUTS.

Nutrition information for NÄNO SUPPS PROTEIN BAR (CHOCOLATE BROWNIE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BROWNIE ME ÇOKOLLATË

PËRBËRËSIT: çokollatë qumështi me ëmbëlsues (20%) (maltitole, gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina [SOJE]), ekstrakt vaniljeje), proteinë QUMËSHTI, maltitole, kolagjen gjedhi i hidrolizuar, lagështues (glicerol), kakao pluhur, izolat i proteinës së bizeles, gjalpë kakaoje, yndyrna bimore (luledielli, rapsi, shea), niseshte (misri, patatesh), miell GRURI, LAJTHI (1,4%), aromë, emulsifikues (lecitina), ëmbëlsues (sukralozë, izomalt, eritritol), oligofruktozë, agjent mbirës (hidrogjenkarbonat natriumi), kripë.

ALERGJENËT: Përmban QUMËSHT, SOJE, GLUTEN dhe LAJTHI. Mund të përmbajë KIKIRIKË, VEZË dhe FRUTA TË TJERA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS PROTEIN BAR (BROWNIE ME ÇOKOLLATË)'
WHERE Variant_Id IN (1174,1179) AND HASHBYTES('SHA2_256', Ingredients) = 0x9E6C6B23FFC94E00C5D1943019CB6CC3CF42DB200A723CCDFA855769DF8A54B2;
SET @n += @@ROWCOUNT;
-- item 37
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MAPLE SYRUP PANCAKE

INGREDIENTS: MILK chocolate with sweeteners (20%) (maltitol, cocoa butter, whole MILK powder, emulsifier (lecithins), flavouring), MILK proteins, maltitol, hydrolysed bovine collagen, humectant (glycerol), vegetable oils (shea, coconut, sunflower), pea protein isolate, skimmed MILK powder, starch (corn, potato), emulsifier (lecithins), salt, cocoa powder, flavouring, colour (beta-carotene), sweetener (sucralose).

May contain PEANUTS, GLUTEN, SOY, EGGS and NUTS.

Nutrition information for NÄNO SUPPS PROTEIN BAR (MAPLE SYRUP PANCAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PETULLË ME SHURUP PANJE

PËRBËRËSIT: çokollatë QUMËSHTI me ëmbëlsues (20%) (maltitol, gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina), aromë), proteina QUMËSHTI, maltitol, kolagjen gjedhi i hidrolizuar, lagështues (glicerol), vajra bimore (shea, kokosi, luledielli), izolat i proteinës së bizeles, QUMËSHT i skremuar pluhur, niseshte (misri, patatesh), emulsifikues (lecitina), kripë, kakao pluhur, aromë, ngjyrues (beta-karoten), ëmbëlsues (sukralozë).

Mund të përmbajë KIKIRIKË, GLUTEN, SOJE, VEZË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS PROTEIN BAR (PETULLË ME SHURUP PANJE)'
WHERE Variant_Id IN (1175,1178) AND HASHBYTES('SHA2_256', Ingredients) = 0xFEFF38AB4C57070ACAB140CC6A52D75996A024485BB40B669BAE0C0C04CFF5D5;
SET @n += @@ROWCOUNT;
-- item 38
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CINNAMON TOPPING

INGREDIENTS: MILK protein, sweetener (maltitol), hydrolysed bovine collagen, MILK powder, humectant (glycerol), pea protein isolate, vegetable fats (cocoa butter, coconut oil, sunflower oil), starch (corn, potato), SOY protein isolate, cocoa powder, emulsifier (SOY lecithins), flavouring, vanilla extract, sweeteners (sucralose, erythritol, stevia), inulin, cinnamon powder.

ALLERGENS: Contains MILK and SOY. May contain PEANUTS, GLUTEN, EGGS and NUTS.

Nutrition information for NÄNO SUPPS PROTEIN BAR (CINNAMON TOPPING)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MBULESË ME KANELLË

PËRBËRËSIT: proteinë QUMËSHTI, ëmbëlsues (maltitol), kolagjen gjedhi i hidrolizuar, QUMËSHT pluhur, lagështues (glicerol), izolat i proteinës së bizeles, yndyrna bimore (gjalpë kakaoje, vaj kokosi, vaj luledielli), niseshte (misri, patatesh), izolat i proteinës së SOJES, kakao pluhur, emulsifikues (lecitina SOJE), aromë, ekstrakt vaniljeje, ëmbëlsues (sukralozë, eritritol, stevia), inulinë, kanellë pluhur.

ALERGJENËT: Përmban QUMËSHT dhe SOJE. Mund të përmbajë KIKIRIKË, GLUTEN, VEZË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS PROTEIN BAR (MBULESË ME KANELLË)'
WHERE Variant_Id IN (1176,1180) AND HASHBYTES('SHA2_256', Ingredients) = 0x2C4AF9B79A28F02228434F1E87095B7E3C8DA7A4A91E7FB265B27794CB346943;
SET @n += @@ROWCOUNT;
-- item 39
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'LEMON

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), lemon emulsion (flavouring, colour E104), taurine, L-carnitine, basic white emulsion (E1450, E445, E300, E307), preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), caffeine.

E104 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMON

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), emulsion limoni (aromë, ngjyrues E104), taurinë, L-karnitinë, emulsion bazë i bardhë (E1450, E445, E300, E307), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), kafeinë.

E104 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (LIMON)'
WHERE Variant_Id IN (1183,1622) AND HASHBYTES('SHA2_256', Ingredients) = 0xD8D83EB1E0CE3F7050A24575DCBD71954EC9CC405F13423AF7E2DBF67151C296;
SET @n += @@ROWCOUNT;
-- item 40
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: water, acidity regulators (citric acid, malic acid), magnesium bisglycinate (as Albion® magnesium amino acid chelate), acidity regulator (magnesium oxide), flavourings, sweeteners (acesulfame K, sucralose), preservative (E200), pyridoxine hydrochloride (vitamin B6), colour (carotenes).

Nutrition information for OLIMP CHELA-MAG B6 FORTE SHOT (NEW) (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: ujë, rregullues aciditeti (acid citrik, acid malik), bisglicinat magnezi (si kelat aminoacidik magnezi Albion®), rregullues aciditeti (oksid magnezi), aroma, ëmbëlsues (acesulfam K, sukralozë), konservues (E200), pirodoksinë hidroklorur (vitamina B6), ngjyrues (karotene).

Informacione ushqyese për OLIMP CHELA-MAG B6 FORTE SHOT (NEW) (PORTOKALL)'
WHERE Variant_Id IN (1200,1202) AND HASHBYTES('SHA2_256', Ingredients) = 0x8C85FF2010A310CC731168E684A754A6759531F2CA4E2CDAF1E00572E142C079;
SET @n += @@ROWCOUNT;
-- item 41
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHERRY

INGREDIENTS: water, reconstituted apple juice from concentrated apple juice (20%), acidity regulators (citric acid, malic acid), magnesium bisglycinate (Albion® magnesium amino acid chelate), acidity regulator (magnesium lactate), sweeteners (acesulfame K, sucralose), preservative (E200), pyridoxine hydrochloride (vitamin B6), flavouring.

Nutrition information for OLIMP CHELA-MAG B6 FORTE SHOT (NEW) (CHERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'QERSHI

PËRBËRËSIT: ujë, lëng molle i rindërtuar nga lëng molle i koncentruar (20%), rregullues aciditeti (acid citrik, acid malik), bisglicinat magnezi (kelat aminoacidik magnezi Albion®), rregullues aciditeti (laktat magnezi), ëmbëlsues (acesulfam K, sukralozë), konservues (E200), pirodoksinë hidroklorur (vitamina B6), aromë.

Informacione ushqyese për OLIMP CHELA-MAG B6 FORTE SHOT (NEW) (QERSHI)'
WHERE Variant_Id IN (1201,1203) AND HASHBYTES('SHA2_256', Ingredients) = 0xE5F7F7892153795629193424C94235C04A7A72BB37F2CB4F34E93F3F982973E6;
SET @n += @@ROWCOUNT;
-- item 42
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: water, carbon dioxide, acid (citric acid), taurine (0.15%), magnesium lactate, green tea leaf extract – Matcha (Camellia sinensis (L.) Kuntze) (0.1%), colour (E150a), flavourings, natural caffeine (from green coffee beans) (0.03%), sweeteners (sucralose, acesulfame K), pyridoxine hydrochloride (vitamin B6).

Nutrition information for OLIMP R-WEILER FOCUS DRINK ZERO',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ujë, dioksid karboni, acid (acid citrik), taurinë (0,15%), laktat magnezi, ekstrakt gjethesh çaji jeshil – Matcha (Camellia sinensis (L.) Kuntze) (0,1%), ngjyrues (E150a), aroma, kafeinë natyrale (nga kokrra kafeje jeshile) (0,03%), ëmbëlsues (sukralozë, acesulfam K), pirodoksinë hidroklorur (vitamina B6).

Informacione ushqyese për OLIMP R-WEILER FOCUS DRINK ZERO'
WHERE Variant_Id IN (1213,1214) AND HASHBYTES('SHA2_256', Ingredients) = 0x2D4FC62CCCF23B690F9AD4BF1E0F280F4AAEC39BAFBCEA591CDE3741ACEF1A3B;
SET @n += @@ROWCOUNT;
-- item 43
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COLA

INGREDIENTS: water, beta-alanine, taurine, acidity regulator (citric acid), caffeine, flavourings, N-acetyl-L-tyrosine, sweeteners (steviol glycosides from stevia, acesulfame K, sucralose), salt, cayenne pepper fruit extract (Capsicum annuum L.), colour (E150d).

Nutrition information for OLIMP R-WEILER SHOT (NEW) (COLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOLA

PËRBËRËSIT: ujë, beta-alaninë, taurinë, rregullues aciditeti (acid citrik), kafeinë, aroma, N-acetil-L-tirozinë, ëmbëlsues (glikozide steviolike nga stevia, acesulfam K, sukralozë), kripë, ekstrakt i frutit të specit djegës kajen (Capsicum annuum L.), ngjyrues (E150d).

Informacione ushqyese për OLIMP R-WEILER SHOT (NEW) (KOLA)'
WHERE Variant_Id IN (1216,1218) AND HASHBYTES('SHA2_256', Ingredients) = 0x1BF8E99F398DAC5D486C8888204B6209650B863164F046DC8C88FD4484EB1D5D;
SET @n += @@ROWCOUNT;
-- item 44
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: water, beta-alanine, taurine, acidity regulator (citric acid), caffeine, flavourings, N-acetyl-L-tyrosine, sweeteners (steviol glycosides from stevia, acesulfame K, sucralose), salt, cayenne pepper fruit extract (Capsicum annuum L.), colour (carotenes).

Nutrition information for OLIMP R-WEILER SHOT (NEW) (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: ujë, beta-alaninë, taurinë, rregullues aciditeti (acid citrik), kafeinë, aroma, N-acetil-L-tirozinë, ëmbëlsues (glikozide steviolike nga stevia, acesulfam K, sukralozë), kripë, ekstrakt i frutit të specit djegës kajen (Capsicum annuum L.), ngjyrues (karotene).

Informacione ushqyese për OLIMP R-WEILER SHOT (NEW) (PORTOKALL)'
WHERE Variant_Id IN (1217,1219) AND HASHBYTES('SHA2_256', Ingredients) = 0x2DC0C591346771C94709F2BBD7A12091B9F09AFD69DC55F3F342FF0F395532FD;
SET @n += @@ROWCOUNT;
-- item 45
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA

INGREDIENTS: 95% protein blend (WHEY protein concentrate (from MILK), WHEY protein isolate (from MILK)), flavourings, acidity regulators (citric acid, sodium citrates), thickeners (gum arabic, xanthan gum, sodium carboxymethyl cellulose), sweeteners (acesulfame K, sucralose), emulsifier (lecithins from SOY), salt.

The product may contain EGGS, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP WHEY PROTEIN COMPLEX 100% (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE

PËRBËRËSIT: 95% përzierje proteinash (koncentrat i proteinës së HIRRËS (nga QUMËSHTI), izolat i proteinës së HIRRËS (nga QUMËSHTI)), aroma, rregullues aciditeti (acid citrik, citrate natriumi), trashës (gomë arabike, gomë ksantani, karboksimetil celulozë natriumi), ëmbëlsues (acesulfam K, sukralozë), emulsifikues (lecitina nga SOJA), kripë.

Produkti mund të përmbajë VEZË, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP WHEY PROTEIN COMPLEX 100% (VANILJE)'
WHERE Variant_Id IN (1222,1224) AND HASHBYTES('SHA2_256', Ingredients) = 0x1AAA70A759618E02AE6D04C47336FDB9FD50648F2D0A4A76CDFC3584A89A46C4;
SET @n += @@ROWCOUNT;
-- item 46
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DOUBLE CHOCOLATE

INGREDIENTS: 89% protein blend (ultrafiltered WHEY protein concentrate WPC (from MILK), WHEY protein isolate (from MILK)), 8% fat-reduced cocoa powder, flavouring, salt, medium-chain triglyceride oil (MCT oil), thickeners (xanthan gum, gum arabic, sodium carboxymethyl cellulose), sweeteners (acesulfame K, sucralose, cyclamate), acidity regulators (sodium citrate, malic acid), fructose, emulsifier (lecithins from SOY).

May contain traces of PEANUTS.

Nutrition information for OLIMP WHEY PROTEIN COMPLEX 100% (DOUBLE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E DYFISHTË

PËRBËRËSIT: 89% përzierje proteinash (koncentrat i ultrafiltruar i proteinës së HIRRËS WPC (nga QUMËSHTI), izolat i proteinës së HIRRËS (nga QUMËSHTI)), 8% kakao pluhur me pak yndyrë, aromë, kripë, vaj trigliceridesh me zinxhir të mesëm (vaj MCT), trashës (gomë ksantani, gomë arabike, karboksimetil celulozë natriumi), ëmbëlsues (acesulfam K, sukralozë, ciklamat), rregullues aciditeti (citrat natriumi, acid malik), fruktozë, emulsifikues (lecitina nga SOJA).

Mund të përmbajë gjurmë të KIKIRIKËVE.

Informacione ushqyese për OLIMP WHEY PROTEIN COMPLEX 100% (ÇOKOLLATË E DYFISHTË)'
WHERE Variant_Id IN (1223,1225) AND HASHBYTES('SHA2_256', Ingredients) = 0xCB15C8E6F41DD6F6F2A7C39EA43891ECF3D16FD451325BDF6FAAC926913753D1;
SET @n += @@ROWCOUNT;
-- item 47
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'APPLE

INGREDIENTS: sugar, water, glucose syrup, fructose syrup, pectin (pectin, acidity regulators: sodium potassium tartrate and polyphosphate, maltodextrin), concentrated apple juice (5%), natural flavouring, sea salt, acidity regulator (citric acid), potassium citrate, magnesium citrate, glazing oil (coconut oil, glazing agent: carnauba wax).

May contain traces of EGGS, FISH, SOY, MILK and CEREALS CONTAINING GLUTEN.

Nutrition information for PROTEINI.SI ENERGY+ JELLY BAR (APPLE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MOLLË

PËRBËRËSIT: sheqer, ujë, shurup glukoze, shurup fruktoze, pektinë (pektinë, rregullues aciditeti: tartrat natriumi-kaliumi dhe polifosfat, maltodekstrinë), lëng molle i koncentruar (5%), aromë natyrale, kripë deti, rregullues aciditeti (acid citrik), citrat kaliumi, citrat magnezi, vaj për lustrim (vaj kokosi, agjent lustrues: dyll karnaube).

Mund të përmbajë gjurmë të VEZËVE, PESHKUT, SOJES, QUMËSHTIT dhe DRITHËRAVE QË PËRMBAJNË GLUTEN.

Informacione ushqyese për PROTEINI.SI ENERGY+ JELLY BAR (MOLLË)'
WHERE Variant_Id IN (1253,1256) AND HASHBYTES('SHA2_256', Ingredients) = 0x2D8E94A5F375CCCBC429D474E825E7D85CAB6524DA4C2EF2E0C2564B478906F9;
SET @n += @@ROWCOUNT;
-- item 48
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: glucose syrup, sugar, water, pectin (pectin, acidity regulators: sodium potassium tartrate and polyphosphates, maltodextrin), natural flavouring, acidity regulator (citric acid), sea salt, potassium citrate, magnesium salts of citric acid, glazing oil (coconut oil, glazing agent: carnauba wax), food colouring (carrot and blackcurrant concentrate).

May contain traces of GLUTEN, SOY and MILK and/or their products.

Nutrition information for PROTEINI.SI ENERGY+ JELLY BAR (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: shurup glukoze, sheqer, ujë, pektinë (pektinë, rregullues aciditeti: tartrat natriumi-kaliumi dhe polifosfate, maltodekstrinë), aromë natyrale, rregullues aciditeti (acid citrik), kripë deti, citrat kaliumi, kripëra magnezi të acidit citrik, vaj për lustrim (vaj kokosi, agjent lustrues: dyll karnaube), ngjyrues ushqimor (koncentrat karote dhe rrush pa fara i zi).

Mund të përmbajë gjurmë të GLUTENIT, SOJES dhe QUMËSHTIT dhe/ose produkteve të tyre.

Informacione ushqyese për PROTEINI.SI ENERGY+ JELLY BAR (LULESHTRYDHE)'
WHERE Variant_Id IN (1254,1258) AND HASHBYTES('SHA2_256', Ingredients) = 0x6FC8FE423134A8C702546B808B71E2A90BBE25C2EC946CF11F70940972606FAB;
SET @n += @@ROWCOUNT;
-- item 49
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: glucose syrup, sugar, water, pectin (pectin, acidity regulators: sodium potassium tartrate and polyphosphates, maltodextrin), acidity regulator (citric acid), sea salt, colour (carotenes), natural flavouring, potassium citrate, magnesium salts of citric acid, glazing oil (coconut oil, glazing agent: carnauba wax).

May contain traces of GLUTEN, SOY and MILK and/or their products.

Nutrition information for PROTEINI.SI ENERGY+ JELLY BAR (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: shurup glukoze, sheqer, ujë, pektinë (pektinë, rregullues aciditeti: tartrat natriumi-kaliumi dhe polifosfate, maltodekstrinë), rregullues aciditeti (acid citrik), kripë deti, ngjyrues (karotene), aromë natyrale, citrat kaliumi, kripëra magnezi të acidit citrik, vaj për lustrim (vaj kokosi, agjent lustrues: dyll karnaube).

Mund të përmbajë gjurmë të GLUTENIT, SOJES dhe QUMËSHTIT dhe/ose produkteve të tyre.

Informacione ushqyese për PROTEINI.SI ENERGY+ JELLY BAR (PORTOKALL)'
WHERE Variant_Id IN (1255,1257) AND HASHBYTES('SHA2_256', Ingredients) = 0xCD37A1D660C38275D7C931AAE6738F2A6BCE0934B1FE58BE7778503FDFC4EC94;
SET @n += @@ROWCOUNT;
-- item 50
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE-BANANA + MILK CHOCOLATE COATING

INGREDIENTS: gluten-free OAT FLAKES 34%, milk chocolate 15% [sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifier (SOY lecithin, polyglycerol linoleate), vanilla extract], glucose-fructose syrup, glucose syrup, HAZELNUT cream [sugar, palm and shea oil, WHEY powder, HAZELNUTS, cocoa, emulsifier (sunflower lecithin), flavouring], candied banana 5% (banana 55%, coconut oil, sugar, flavouring), gum arabic, vegetable fat (palm kernel, palm, shea), sweetened condensed whole MILK (MILK, sugar), cocoa, humectant (glycerine), emulsifier (rapeseed lecithin), natural flavouring, natural antioxidant (Origanum vulgare extract), mixed natural tocopherol antioxidants.

May contain traces of other NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI ENERGY BAR (CHOCOLATE-BANANA + MILK CHOCOLATE COATING)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË-BANANE + VESHJE ME ÇOKOLLATË QUMËSHTI

PËRBËRËSIT: FLOKË TËRSHËRE pa gluten 34%, çokollatë qumështi 15% [sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitinë SOJE, linoleat poliglicerol), ekstrakt vaniljeje], shurup glukozë-fruktozë, shurup glukoze, krem me LAJTHI [sheqer, vaj palme dhe shea, HIRRË pluhur, LAJTHI, kakao, emulsifikues (lecitinë luledielli), aromë], banane e sheqerosur 5% (banane 55%, vaj kokosi, sheqer, aromë), gomë arabike, yndyrë bimore (bërthamë palme, palmë, shea), QUMËSHT i plotë i kondensuar i ëmbëlsuar (QUMËSHT, sheqer), kakao, lagështues (glicerinë), emulsifikues (lecitinë rapsi), aromë natyrale, antioksidant natyral (ekstrakt Origanum vulgare), përzierje antioksidantësh nga tokoferole natyrale.

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.
'
  + N'
Informacione ushqyese për PROTEINI.SI ENERGY BAR (ÇOKOLLATË-BANANE + VESHJE ME ÇOKOLLATË QUMËSHTI)'
WHERE Variant_Id IN (1259,1262) AND HASHBYTES('SHA2_256', Ingredients) = 0x9CE9CE5303F32D6E105E7A35858F3415E1B1481C61FDAB1404305F91B778A680;
SET @n += @@ROWCOUNT;
-- item 51
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLUEBERRY-CRANBERRY + YOGHURT COATING

INGREDIENTS: gluten-free OAT FLAKES 34%, yoghurt coating 15% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder and YOGHURT, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], glucose-fructose syrup, glucose syrup, vanilla-flavoured cream [sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier (sunflower lecithin), flavouring, colour (paprika extract)], vegetable fat (palm kernel, palm, shea), candied American cranberries 4% (cranberries 60%, sugar, sunflower oil), candied blueberries 4% (blueberries 64%, sugar, sunflower oil), gum arabic, sweetened condensed whole MILK (MILK, sugar), humectant (glycerine), emulsifier (rapeseed lecithin), natural blueberry flavouring, natural antioxidant (Origanum vulgare extract), mixed natural tocopherol antioxidants, natural cranberry flavouring.

May contain traces '
  + N'of other NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI ENERGY BAR (BLUEBERRY-CRANBERRY + YOGHURT COATING)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BORONICË-MANAFERRË E KUQE + VESHJE ME KOS

PËRBËRËSIT: FLOKË TËRSHËRE pa gluten 34%, veshje me kos 15% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur dhe KOS, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], shurup glukozë-fruktozë, shurup glukoze, krem me shije vaniljeje [sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues (lecitinë luledielli), aromë, ngjyrues (ekstrakt speci)], yndyrë bimore (bërthamë palme, palmë, shea), boronica të kuqe amerikane të sheqerosura 4% (boronica të kuqe 60%, sheqer, vaj luledielli), boronica të sheqerosura 4% (boronica 64%, sheqer, vaj luledielli), gomë arabike, QUMËSHT i plotë i kondensuar i ëmbëlsuar (QUMËSHT, sheqer), lagështues (glicerinë), emulsifikues (lecitinë rapsi), aromë natyrale boronice, antioksidant natyral (ekstrakt Origanum '
  + N'vulgare), përzierje antioksidantësh nga tokoferole natyrale, aromë natyrale boronice të kuqe.

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI ENERGY BAR (BORONICË-MANAFERRË E KUQE + VESHJE ME KOS)'
WHERE Variant_Id IN (1260,1261) AND HASHBYTES('SHA2_256', Ingredients) = 0xA54CAB137A214D5B9E25065DFBD7C55CBAA317711D3C9DD9DA2E89CEA7C421AE;
SET @n += @@ROWCOUNT;
-- item 52
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: sucrose, 33% isomaltulose¹, potassium gluconate, 11% magnesium citrate, flavouring, acidity regulator (citric acid), sodium chloride, inulin, L-ascorbic acid, anti-caking agent (silicon dioxide), sweetener (steviol glycosides), pyridoxine hydrochloride, colour (beta-carotene).

May contain traces of SOY and MILK.

¹Isomaltulose is a source of glucose and fructose.

Nutrition information for PROTEINI.SI MAGNESIUM (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: sakarozë, 33% izomaltulozë¹, glukonat kaliumi, 11% citrat magnezi, aromë, rregullues aciditeti (acid citrik), klorur natriumi, inulinë, acid L-askorbik, agjent kundër ngjizjes (dioksid silici), ëmbëlsues (glikozide steviolike), pirodoksinë hidroklorur, ngjyrues (beta-karoten).

Mund të përmbajë gjurmë të SOJES dhe QUMËSHTIT.

¹Izomaltuloza është burim glukoze dhe fruktoze.

Informacione ushqyese për PROTEINI.SI MAGNESIUM (PORTOKALL)'
WHERE Variant_Id IN (1265,1268) AND HASHBYTES('SHA2_256', Ingredients) = 0xBF453FAD1A889FB28FEF076581F5F3E4F1454AD20B8BB2C119A03F062BEF2EBA;
SET @n += @@ROWCOUNT;
-- item 53
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'LEMON

INGREDIENTS: sucrose, 33% isomaltulose¹, potassium gluconate, 11% magnesium citrate, acidity regulator (citric acid), flavouring, sodium chloride, inulin, L-ascorbic acid, anti-caking agent (silicon dioxide), sweetener (steviol glycosides), pyridoxine hydrochloride, colour (beta-carotene).

May contain traces of SOY and MILK.

¹Isomaltulose is a source of glucose and fructose.

Nutrition information for PROTEINI.SI MAGNESIUM (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMON

PËRBËRËSIT: sakarozë, 33% izomaltulozë¹, glukonat kaliumi, 11% citrat magnezi, rregullues aciditeti (acid citrik), aromë, klorur natriumi, inulinë, acid L-askorbik, agjent kundër ngjizjes (dioksid silici), ëmbëlsues (glikozide steviolike), pirodoksinë hidroklorur, ngjyrues (beta-karoten).

Mund të përmbajë gjurmë të SOJES dhe QUMËSHTIT.

¹Izomaltuloza është burim glukoze dhe fruktoze.

Informacione ushqyese për PROTEINI.SI MAGNESIUM (LIMON)'
WHERE Variant_Id IN (1266,1267) AND HASHBYTES('SHA2_256', Ingredients) = 0x968ACE0B045917D01DCACAB4FB6C8740B344570D4303E92A6D146BE9DB92EBA2;
SET @n += @@ROWCOUNT;
-- item 54
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BELGIAN BISCUIT AND WHITE CREAM

INGREDIENTS: EGG white, speculaas biscuit-flavoured cream (15%) [humectant (isomalt), vegetable oils (sunflower, coconut), skimmed MILK powder, WHEY protein concentrate, HAZELNUTS (5%), sugar syrup, raising agent (sodium bicarbonate), salt, cinnamon, emulsifier (sunflower lecithin), vanilla flavouring], humectants (maltitol, glycerol), wholegrain flour (GLUTEN) [wholegrain spelt flour (50%), wholegrain oat flakes (50%)], vegetable oils (sunflower, SOY), speculaas biscuit [caramelised biscuit (50%) (wheat flour (GLUTEN), sugar, vegetable oils (palm, rapeseed oil), sugar syrup, raising agent (sodium bicarbonate), salt, cinnamon)], raising agents (disodium diphosphate, sodium bicarbonate).

May contain traces of MUSTARD and other NUTS.

Nutrition information for PROTEINI.SI MUFFIN (BELGIAN BISCUIT AND WHITE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTË BELGE DHE KREM I BARDHË

PËRBËRËSIT: e bardhë VEZE, krem me shije biskote speculaas (15%) [lagështues (izomalt), vajra bimore (luledielli, kokosi), QUMËSHT i skremuar pluhur, koncentrat i proteinës së HIRRËS, LAJTHI (5%), shurup sheqeri, agjent mbirës (bikarbonat natriumi), kripë, kanellë, emulsifikues (lecitinë luledielli), aromë vaniljeje], lagështues (maltitol, glicerol), miell integral (GLUTEN) [miell integral speltë (50%), flokë tërshëre integrale (50%)], vajra bimore (luledielli, SOJE), biskotë speculaas [biskotë e karamelizuar (50%) (miell gruri (GLUTEN), sheqer, vajra bimore (palme, vaj rapsi), shurup sheqeri, agjent mbirës (bikarbonat natriumi), kripë, kanellë)], agjentë mbirës (difosfat dinatriumi, bikarbonat natriumi).

Mund të përmbajë gjurmë të MUSTARDËS dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI MUFFIN '
  + N'(BISKOTË BELGE DHE KREM I BARDHË)'
WHERE Variant_Id IN (1269,1272) AND HASHBYTES('SHA2_256', Ingredients) = 0xBB8C4D498DC88656F6F42F352D25E14BFD5C4A39A744FA92305A42765C13F531;
SET @n += @@ROWCOUNT;
-- item 55
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DOUBLE CHOCOLATE WITH WHIPPED CREAM

INGREDIENTS: wheat flour (GLUTEN), EGG whites, vegetable oils (sunflower, SOY), white chocolate-flavoured cream (15%) [humectant (isomalt), vegetable oils (sunflower, coconut), skimmed MILK powder, WHEY protein concentrate, cocoa (5%), HAZELNUTS (4%), emulsifier (sunflower lecithin), vanilla flavouring], humectant (maltitol), WHEY protein concentrate, chocolate pieces (7.5%) [sugar, cocoa mass, cocoa butter, sunflower lecithin, vanilla flavouring], cocoa powder (5%), raising agents (disodium diphosphate, sodium hydrogen carbonate).

May contain traces of MUSTARD and other NUTS.

Nutrition information for PROTEINI.SI MUFFIN (DOUBLE CHOCOLATE WITH WHIPPED CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E DYFISHTË ME KREM TË RRAHUR

PËRBËRËSIT: miell gruri (GLUTEN), të bardha VEZE, vajra bimore (luledielli, SOJE), krem me shije çokollate të bardhë (15%) [lagështues (izomalt), vajra bimore (luledielli, kokosi), QUMËSHT i skremuar pluhur, koncentrat i proteinës së HIRRËS, kakao (5%), LAJTHI (4%), emulsifikues (lecitinë luledielli), aromë vaniljeje], lagështues (maltitol), koncentrat i proteinës së HIRRËS, copa çokollate (7,5%) [sheqer, masë kakaoje, gjalpë kakaoje, lecitinë luledielli, aromë vaniljeje], kakao pluhur (5%), agjentë mbirës (difosfat dinatriumi, hidrogjenkarbonat natriumi).

Mund të përmbajë gjurmë të MUSTARDËS dhe FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI MUFFIN (ÇOKOLLATË E DYFISHTË ME KREM TË RRAHUR)'
WHERE Variant_Id IN (1270,1271) AND HASHBYTES('SHA2_256', Ingredients) = 0x7DBABC0943597F1CBF1F32ABD3DD844A6C3816DD37630C4062CE5A1734BFBC6D;
SET @n += @@ROWCOUNT;
-- item 56
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCO - BANANA

INGREDIENTS: OATS 42%, vegetable oils (palm, rapeseed, coconut, partially hydrogenated palm oil – in varying proportions), water, emulsifiers (mono- and diglycerides of fatty acids, lecithins), acidity regulator (citric acid), flavouring, colour (carotenes), golden syrup, dark chocolate coating 10% [sugar, hydrogenated palm kernel oil, fat-reduced cocoa powder, emulsifiers (lecithins, sorbitan tristearate), flavouring], demerara sugar, OAT FLOUR 4.2%, banana chips 2% (banana, coconut oil, sugar, banana flavouring), iodised salt (salt, potassium iodate), flavourings.

May contain traces of GLUTEN, MILK, SOY, NUTS and PEANUTS.

Nutrition information for PROTEINI.SI OAT CAKE (CHOCO - BANANA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKO - BANANE

PËRBËRËSIT: TËRSHËRË 42%, vajra bimore (palme, rapsi, kokosi, vaj palme pjesërisht i hidrogjenizuar – në përpjesëtime të ndryshme), ujë, emulsifikues (mono- dhe digliceride të acideve yndyrore, lecitina), rregullues aciditeti (acid citrik), aromë, ngjyrues (karotene), shurup i artë, veshje me çokollatë të zezë 10% [sheqer, vaj bërthame palme i hidrogjenizuar, kakao pluhur me pak yndyrë, emulsifikues (lecitina, tristearat sorbitani), aromë], sheqer demerara, MIELL TËRSHËRE 4,2%, çipsa banane 2% (banane, vaj kokosi, sheqer, aromë banane), kripë e jodizuar (kripë, jodat kaliumi), aroma.

Mund të përmbajë gjurmë të GLUTENIT, QUMËSHTIT, SOJES, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për PROTEINI.SI OAT CAKE (ÇOKO - BANANE)'
WHERE Variant_Id IN (1281,1284) AND HASHBYTES('SHA2_256', Ingredients) = 0xDA2C409B128058C989EF770EDA550DC148D0BEAF92409612078F2384EDDD8F81;
SET @n += @@ROWCOUNT;
-- item 57
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TOFFEE CARAMEL

INGREDIENTS: OATS 45%, vegetable oils (palm, rapeseed, coconut, partially hydrogenated palm oil – in varying proportions), water, emulsifiers (mono- and diglycerides of fatty acids, lecithins), acidity regulator (citric acid), flavouring, colour (carotenes), golden syrup, caramel and chocolate-flavoured cocoa coating 10% [sugar, palm oil, WHEY powder (MILK), fortified WHEAT flour (calcium carbonate, niacin, iron, thiamine), fat-reduced cocoa powder, cocoa butter, emulsifiers (SOY lecithin, polyglycerol polyricinoleate), flavouring, colour (beta-carotene)], demerara sugar, OAT FLOUR 4%, iodised salt (salt, potassium iodate), flavourings.

May contain traces of GLUTEN, MILK, SOY, NUTS and PEANUTS.

Nutrition information for PROTEINI.SI OAT CAKE (TOFFEE CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KARAMEL TOFI

PËRBËRËSIT: TËRSHËRË 45%, vajra bimore (palme, rapsi, kokosi, vaj palme pjesërisht i hidrogjenizuar – në përpjesëtime të ndryshme), ujë, emulsifikues (mono- dhe digliceride të acideve yndyrore, lecitina), rregullues aciditeti (acid citrik), aromë, ngjyrues (karotene), shurup i artë, veshje kakaoje me shije karameli dhe çokollate 10% [sheqer, vaj palme, HIRRË pluhur (QUMËSHT), miell GRURI i pasuruar (karbonat kalciumi, niacinë, hekur, tiaminë), kakao pluhur me pak yndyrë, gjalpë kakaoje, emulsifikues (lecitinë SOJE, poliricinoleat poliglicerol), aromë, ngjyrues (beta-karoten)], sheqer demerara, MIELL TËRSHËRE 4%, kripë e jodizuar (kripë, jodat kaliumi), aroma.

Mund të përmbajë gjurmë të GLUTENIT, QUMËSHTIT, SOJES, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për PROTEINI.SI OAT CAKE (KARAMEL TOFI)'
WHERE Variant_Id IN (1282,1285) AND HASHBYTES('SHA2_256', Ingredients) = 0x2C1470A59575071853806A6BF697E517C758DDACCFA77C06A429C2B201144917;
SET @n += @@ROWCOUNT;
-- item 58
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CREAMY YOGHURT

INGREDIENTS: OATS 45%, vegetable oils (palm, rapeseed, coconut, partially hydrogenated palm oil – in varying proportions), water, emulsifiers (mono- and diglycerides of fatty acids, lecithins), acidity regulator (citric acid), flavouring, colour (carotenes), golden syrup, creamy coating 10% [sugar, partially hydrogenated palm kernel oil, WHEY powder (MILK), skimmed MILK, emulsifier (SOY lecithin), flavouring], demerara sugar, OAT FLOUR 3.5%, iodised salt (salt, potassium iodate), flavourings.

May contain traces of GLUTEN, MILK, SOY, NUTS and PEANUTS.

Nutrition information for PROTEINI.SI OAT CAKE (CREAMY YOGHURT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOS KREMOZ

PËRBËRËSIT: TËRSHËRË 45%, vajra bimore (palme, rapsi, kokosi, vaj palme pjesërisht i hidrogjenizuar – në përpjesëtime të ndryshme), ujë, emulsifikues (mono- dhe digliceride të acideve yndyrore, lecitina), rregullues aciditeti (acid citrik), aromë, ngjyrues (karotene), shurup i artë, veshje kremoze 10% [sheqer, vaj bërthame palme pjesërisht i hidrogjenizuar, HIRRË pluhur (QUMËSHT), QUMËSHT i skremuar, emulsifikues (lecitinë SOJE), aromë], sheqer demerara, MIELL TËRSHËRE 3,5%, kripë e jodizuar (kripë, jodat kaliumi), aroma.

Mund të përmbajë gjurmë të GLUTENIT, QUMËSHTIT, SOJES, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për PROTEINI.SI OAT CAKE (KOS KREMOZ)'
WHERE Variant_Id IN (1283,1286) AND HASHBYTES('SHA2_256', Ingredients) = 0xCF26DA2F4FEB796EE85BCEFFE7484EB273445DDAE0EDA7E6ACDFFA2034C46296;
SET @n += @@ROWCOUNT;
-- item 59
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: 100% roasted PEANUTS.

May contain traces of NUTS, MUSTARD and SESAME.

Nutrition information for PROTEINI.SI PEANUT BUTTER (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: 100% KIKIRIKË të pjekur.

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, MUSTARDËS dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PEANUT BUTTER (I RI)'
WHERE Variant_Id IN (1288,1289) AND HASHBYTES('SHA2_256', Ingredients) = 0xA312E9B492D661182A447F1BF6E55B99B9187037EF7519C361CCBEADAA836E01;
SET @n += @@ROWCOUNT;
-- item 60
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY

INGREDIENTS: water, maltodextrin (38%), flavouring, acidity regulator (citric acid), thickener (xanthan gum), vitamin blend (L-ascorbic acid, DL-alpha-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), preservatives (potassium sorbate, sodium benzoate), sweetener (sucralose), colour (E122).

E122 may have an adverse effect on activity and attention in children.

Nutrition information for PROTEINI.SI ENERGY+ ENERGY GEL (RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR

PËRBËRËSIT: ujë, maltodekstrinë (38%), aromë, rregullues aciditeti (acid citrik), trashës (gomë ksantani), përzierje vitaminash (acid L-askorbik, DL-alfa-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë), ngjyrues (E122).

E122 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për PROTEINI.SI ENERGY+ ENERGY GEL (MJEDËR)'
WHERE Variant_Id IN (1290,1317) AND HASHBYTES('SHA2_256', Ingredients) = 0x3A26098FD6703262300D3F0FBE653AD5059B796723D259BD00CC85D6F9EA7495;
SET @n += @@ROWCOUNT;
-- item 61
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CITRUS

INGREDIENTS: water, maltodextrin (38%), flavouring, acidity regulator (citric acid), thickener (xanthan gum), vitamin blend (L-ascorbic acid, DL-alpha-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), preservatives (potassium sorbate, sodium benzoate), sweetener (sucralose).

Nutrition information for PROTEINI.SI ENERGY+ ENERGY GEL (CITRUS)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AGRUME

PËRBËRËSIT: ujë, maltodekstrinë (38%), aromë, rregullues aciditeti (acid citrik), trashës (gomë ksantani), përzierje vitaminash (acid L-askorbik, DL-alfa-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë).

Informacione ushqyese për PROTEINI.SI ENERGY+ ENERGY GEL (AGRUME)'
WHERE Variant_Id IN (1291,1318) AND HASHBYTES('SHA2_256', Ingredients) = 0xC202025B9A1A09687E8352C11514C77B6E791F55BC66B442FB0FAD2E58F03107;
SET @n += @@ROWCOUNT;
-- item 62
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COLA (WITH CAFFEINE)

INGREDIENTS: water, maltodextrin (38%), flavouring, acidity regulator (citric acid), cola emulsion (flavouring, colour E150d), thickener (xanthan gum), caffeine, vitamin blend (L-ascorbic acid, DL-alpha-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), preservatives (potassium sorbate, sodium benzoate), sweetener (sucralose).

Nutrition information for PROTEINI.SI ENERGY+ ENERGY GEL (COLA - WITH CAFFEINE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOLA (ME KAFEINË)

PËRBËRËSIT: ujë, maltodekstrinë (38%), aromë, rregullues aciditeti (acid citrik), emulsion kole (aromë, ngjyrues E150d), trashës (gomë ksantani), kafeinë, përzierje vitaminash (acid L-askorbik, DL-alfa-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë).

Informacione ushqyese për PROTEINI.SI ENERGY+ ENERGY GEL (KOLA - ME KAFEINË)'
WHERE Variant_Id IN (1292,1319) AND HASHBYTES('SHA2_256', Ingredients) = 0xED44CEF8A1AFEE220591E03BFA4BAE03234B221777F7356CB8BEEADE4219D62E;
SET @n += @@ROWCOUNT;
-- item 63
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BANANA

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate (MILK), invert syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: SOY lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), gum arabic, emulsifier (rapeseed lecithin), flavouring, mixed natural tocopherol antioxidants, vitamin blend (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative (sorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI '
  + N'PROTEIN BAR (BANANA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BANANE

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS (QUMËSHT), shurup i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë SOJE, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), gomë arabike, emulsifikues (lecitinë rapsi), aromë, përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant '
  + N'(acid L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (BANANE)'
WHERE Variant_Id IN (1293,1305) AND HASHBYTES('SHA2_256', Ingredients) = 0x14B14C643D9BC8745E507EBBE8974D5F72D5FD8B91C1C8E74D33F8FE66C4AF51;
SET @n += @@ROWCOUNT;
-- item 64
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLACKCURRANT AND CRANBERRY

INGREDIENTS: glucose-fructose syrup, yoghurt coating 16% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder, YOGHURT powder 2%, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream [sugar, palm and shea oil, WHEY powder, whole MILK powder, emulsifier (sunflower lecithin), flavouring, colour E160c], thickener (gum arabic), candied cranberries 2% (cranberries 78%, sugar, sunflower oil), extrudate (MILK protein isolate), emulsifier (rapeseed lecithin), blackcurrant emulsion (flavouring, colours E122 and E133), acidity regulator (citric acid), natural tocopherol antioxidants, vitamins (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine '
  + N'mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), flavouring, antioxidant (L-ascorbic acid), preservative (sorbic acid).

E122 may have an adverse effect on activity and attention in children.

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (BLACKCURRANT AND CRANBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'RRUSH PA FARA I ZI DHE BORONICË E KUQE

PËRBËRËSIT: shurup glukozë-fruktozë, veshje me kos 16% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur, KOS pluhur 2%, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje [sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i plotë pluhur, emulsifikues (lecitinë luledielli), aromë, ngjyrues E160c], trashës (gomë arabike), boronica të kuqe të sheqerosura 2% (boronica të kuqe 78%, sheqer, vaj luledielli), ekstrudat (izolat i proteinës së QUMËSHTIT), emulsifikues (lecitinë rapsi), emulsion rrushi pa fara të zi (aromë, ngjyrues E122 dhe E133), rregullues aciditeti (acid citrik), antioksidantë nga tokoferole '
  + N'natyrale, vitamina (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), aromë, antioksidant (acid L-askorbik), konservues (acid sorbik).

E122 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (RRUSH PA FARA I ZI DHE BORONICË E KUQE)'
WHERE Variant_Id IN (1294,1308) AND HASHBYTES('SHA2_256', Ingredients) = 0x78DA0E1DF8F0E1ACCFC1668F036B11C98E6C73DF98E4FF92083CFA9BF666E5E0;
SET @n += @@ROWCOUNT;
-- item 65
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COCONUT

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate (MILK), invert syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: SOY lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), gum arabic, emulsifier (rapeseed lecithin), flavouring, mixed natural tocopherol antioxidants, vitamin blend (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative (sorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for '
  + N'PROTEINI.SI PROTEIN BAR (COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOKOS

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS (QUMËSHT), shurup i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë SOJE, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), gomë arabike, emulsifikues (lecitinë rapsi), aromë, përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid '
  + N'L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (KOKOS)'
WHERE Variant_Id IN (1295,1307) AND HASHBYTES('SHA2_256', Ingredients) = 0x5A8D44430CEB0E73B5ED29EF31E8F7A22E3ED9225C9C1E31D2846DD023B7E26E;
SET @n += @@ROWCOUNT;
-- item 66
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MANGO

INGREDIENTS: glucose-fructose syrup, yoghurt coating 16% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder, YOGHURT powder 2%, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream [sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier (sunflower lecithin), flavouring, colour E160c], thickener (gum arabic), extrudates (rice, MILK protein isolate, emulsifier E471), emulsifier (rapeseed lecithin), acidity regulator (citric acid), natural tocopherol antioxidants, flavouring, vitamins (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative '
  + N'(sorbic acid), colour (beta-carotene).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (MANGO)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANGO

PËRBËRËSIT: shurup glukozë-fruktozë, veshje me kos 16% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur, KOS pluhur 2%, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje [sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues (lecitinë luledielli), aromë, ngjyrues E160c], trashës (gomë arabike), ekstrudate (oriz, izolat i proteinës së QUMËSHTIT, emulsifikues E471), emulsifikues (lecitinë rapsi), rregullues aciditeti (acid citrik), antioksidantë nga tokoferole natyrale, aromë, vitamina (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat,'
  + N' acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid L-askorbik), konservues (acid sorbik), ngjyrues (beta-karoten).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (MANGO)'
WHERE Variant_Id IN (1296,1309) AND HASHBYTES('SHA2_256', Ingredients) = 0xAD92B9B844C836A947659405701BAF678ECA3CE0E2F2113AC4F13D8306D48E66;
SET @n += @@ROWCOUNT;
-- item 67
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MILK CHOCOLATE

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate (MILK), SOY flakes, invert syrup, vegetable fat (palm kernel, palm, shea), HAZELNUT cream (sugar, palm and shea oil, WHEY powder (MILK), HAZELNUTS, cocoa, emulsifier: SOY lecithin, flavouring), extrudates (rice, MILK protein isolate, inulin), gum arabic, emulsifier (rapeseed lecithin), cocoa, flavouring, mixed natural tocopherol antioxidants, vitamin blend (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative (sorbic acid).

May contain traces of OTHER NUTS, PEANUTS and SESAME.

Nutrition information for '
  + N'PROTEINI.SI PROTEIN BAR (MILK CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË QUMËSHTI

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS (QUMËSHT), flokë SOJE, shurup i invertuar, yndyrë bimore (bërthamë palme, palmë, shea), krem me LAJTHI (sheqer, vaj palme dhe shea, HIRRË pluhur (QUMËSHT), LAJTHI, kakao, emulsifikues: lecitinë SOJE, aromë), ekstrudate (oriz, izolat i proteinës së QUMËSHTIT, inulinë), gomë arabike, emulsifikues (lecitinë rapsi), kakao, aromë, përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid '
  + N'L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (ÇOKOLLATË QUMËSHTI)'
WHERE Variant_Id IN (1297,1306) AND HASHBYTES('SHA2_256', Ingredients) = 0x4D82A87C2FAFB5B1653CB22FB5D82D170D4CF38B34F2CC2861731FC9D25B505F;
SET @n += @@ROWCOUNT;
-- item 68
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), thickener (gum arabic), emulsifier (rapeseed lecithin), cocoa, flavouring, natural tocopherol antioxidants, vitamins (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative (sorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information '
  + N'for PROTEINI.SI PROTEIN BAR (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), trashës (gomë arabike), emulsifikues (lecitinë rapsi), kakao, aromë, antioksidantë nga tokoferole natyrale, vitamina (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid '
  + N'L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (PORTOKALL)'
WHERE Variant_Id IN (1298,1311) AND HASHBYTES('SHA2_256', Ingredients) = 0x378FB420EC8B0F28E359156AAF21B6FBC0D0149F1FE616F732F3F213540B96A4;
SET @n += @@ROWCOUNT;
-- item 69
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY CHEESECAKE

INGREDIENTS: glucose-fructose syrup, yoghurt coating 16% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder, YOGHURT powder, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), thickener (gum arabic), emulsifier (rapeseed lecithin), flavouring, acidity regulator (citric acid), natural tocopherol antioxidants, beetroot concentrate, vitamins (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant '
  + N'(L-ascorbic acid), preservative (sorbic acid).

May contain traces of OTHER NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (RASPBERRY CHEESECAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'CHEESECAKE ME MJEDËR

PËRBËRËSIT: shurup glukozë-fruktozë, veshje me kos 16% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur, KOS pluhur, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), trashës (gomë arabike), emulsifikues (lecitinë rapsi), aromë, rregullues aciditeti (acid citrik), antioksidantë nga tokoferole natyrale, koncentrat panxhari, vitamina (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë,'
  + N' tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (CHEESECAKE ME MJEDËR)'
WHERE Variant_Id IN (1299,1312) AND HASHBYTES('SHA2_256', Ingredients) = 0x0B9CEC15B8579748F394F0EDDE20125D29A5AF93C669AE60A5812E844C161C60;
SET @n += @@ROWCOUNT;
-- item 70
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate (MILK), SOY flakes, invert syrup, vegetable fat (palm kernel, palm, shea), HAZELNUT cream (sugar, palm and shea oil, WHEY powder (MILK), HAZELNUTS, cocoa, emulsifier: SOY lecithin, flavouring), extrudates (rice, MILK protein isolate, emulsifier E471), gum arabic, emulsifier (rapeseed lecithin), cocoa, flavouring, mixed natural tocopherol antioxidants, vitamin blend (L-ascorbic acid, DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), preservative (sorbic acid).

May contain traces of OTHER NUTS, PEANUTS and SESAME.

Nutrition information for '
  + N'PROTEINI.SI PROTEIN BAR (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS (QUMËSHT), flokë SOJE, shurup i invertuar, yndyrë bimore (bërthamë palme, palmë, shea), krem me LAJTHI (sheqer, vaj palme dhe shea, HIRRË pluhur (QUMËSHT), LAJTHI, kakao, emulsifikues: lecitinë SOJE, aromë), ekstrudate (oriz, izolat i proteinës së QUMËSHTIT, emulsifikues E471), gomë arabike, emulsifikues (lecitinë rapsi), kakao, aromë, përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (acid L-askorbik, DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë),'
  + N' konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1300,1310) AND HASHBYTES('SHA2_256', Ingredients) = 0x9D0B180936F056AA1C8518100C3A1AC699E95D96B32C9E9C597F7C4AE5D13F1C;
SET @n += @@ROWCOUNT;
-- item 71
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TIRAMISU

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), thickener (gum arabic), emulsifier (rapeseed lecithin), mixed natural tocopherol antioxidants, vitamin blend (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid), preservative (sorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information '
  + N'for PROTEINI.SI PROTEIN BAR (TIRAMISU)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'TIRAMISU

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), trashës (gomë arabike), emulsifikues (lecitinë rapsi), përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant '
  + N'(acid L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (TIRAMISU)'
WHERE Variant_Id IN (1301,1313) AND HASHBYTES('SHA2_256', Ingredients) = 0xA87B94BBCCE934FF7D146D09A8C76CBD4A35F6CD81B2EB6F4E35171AACC54148;
SET @n += @@ROWCOUNT;
-- item 72
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'APPLE CINNAMON STRUDEL (WINTER EDITION)

INGREDIENTS: glucose-fructose syrup, yoghurt coating 15% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder, YOGHURT powder, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], SOY protein isolate, WHEY protein concentrate, invert sugar syrup, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), thickener (gum arabic), emulsifier (rapeseed lecithin), flavouring, acidity regulator (citric acid), mixed natural tocopherol antioxidants, vitamin blend (DL-α-tocopheryl acetate, nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant '
  + N'(L-ascorbic acid), preservative (sorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (APPLE CINNAMON STRUDEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHTRUDEL ME MOLLË DHE KANELLË (EDICION DIMËROR)

PËRBËRËSIT: shurup glukozë-fruktozë, veshje me kos 15% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur, KOS pluhur, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, shurup sheqeri i invertuar, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), trashës (gomë arabike), emulsifikues (lecitinë rapsi), aromë, rregullues aciditeti (acid citrik), përzierje antioksidantësh nga tokoferole natyrale, përzierje vitaminash (DL-α-tokoferil acetat, nikotinamid, D-pantotenat kalciumi, pirodoksinë '
  + N'hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid L-askorbik), konservues (acid sorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (SHTRUDEL ME MOLLË DHE KANELLË)'
WHERE Variant_Id IN (1302,1314) AND HASHBYTES('SHA2_256', Ingredients) = 0x8D479FD9165FCF1B7FB42CE6BD257923D8FA2073DB2A7700330C6A7961061BAD;
SET @n += @@ROWCOUNT;
-- item 73
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'LEMON (SUMMER EDITION)

INGREDIENTS: glucose-fructose syrup, MILK chocolate 16% (sugar, cocoa butter, cocoa mass, whole MILK powder, emulsifiers: SOY lecithin and E476, vanilla extract), fructose-glucose syrup, SOY protein isolate, WHEY protein concentrate, SOY flakes, vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), vegetable fat (palm kernel, palm, shea), extrudate (rice, MILK protein isolate, inulin), humectant (glycerine), thickener (gum arabic), emulsifier (rapeseed lecithin), flavouring, acidity regulator (citric acid), antioxidant (tocopherol-rich extract), vitamin blend (nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid).

May contain traces of NUTS, PEANUTS and '
  + N'SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMON (EDICION VEROR)

PËRBËRËSIT: shurup glukozë-fruktozë, çokollatë QUMËSHTI 16% (sheqer, gjalpë kakaoje, masë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitinë SOJE dhe E476, ekstrakt vaniljeje), shurup fruktozë-glukozë, izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, flokë SOJE, krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), yndyrë bimore (bërthamë palme, palmë, shea), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), lagështues (glicerinë), trashës (gomë arabike), emulsifikues (lecitinë rapsi), aromë, rregullues aciditeti (acid citrik), antioksidant (ekstrakt i pasur me tokoferole), përzierje vitaminash (nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik,'
  + N' D-biotinë, cianokobalaminë), antioksidant (acid L-askorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (LIMON)'
WHERE Variant_Id IN (1303,1315) AND HASHBYTES('SHA2_256', Ingredients) = 0xC6E8771328E4A13C8EFD4CE8BAC2931516ED029813A2FD1AC284E9D576C8AE3F;
SET @n += @@ROWCOUNT;
-- item 74
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PINEAPPLE AND COCONUT (SUMMER EDITION)

INGREDIENTS: glucose-fructose syrup, yoghurt coating 15% [sugar, vegetable fat (palm kernel, palm, shea), WHEY powder, YOGHURT powder 2%, emulsifier (SOY lecithin), acidity regulator (citric acid), flavouring, salt], fructose-glucose syrup, SOY protein isolate, WHEY protein concentrate, SOY flakes, vegetable fat (palm kernel, palm, shea), vanilla-flavoured cream (sugar, palm and shea oil, WHEY powder, skimmed MILK powder, emulsifier: sunflower lecithin, flavouring, colour E160c), extrudate (rice, MILK protein isolate, inulin), thickener (gum arabic), humectant (glycerine), candied pineapple 1% (pineapple 51%, sugar, antioxidant: citric acid, preservative: SULPHUR DIOXIDE), emulsifier (rapeseed lecithin), flavouring, antioxidant (tocopherol-rich extract), vitamin blend (nicotinamide, calcium D-pantothenate, pyridoxine hydrochloride, riboflavin, thiamine '
  + N'mononitrate, pteroylmonoglutamic acid, D-biotin, cyanocobalamin), antioxidant (L-ascorbic acid).

May contain traces of NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN BAR (PINEAPPLE AND COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ANANAS DHE KOKOS (EDICION VEROR)

PËRBËRËSIT: shurup glukozë-fruktozë, veshje me kos 15% [sheqer, yndyrë bimore (bërthamë palme, palmë, shea), HIRRË pluhur, KOS pluhur 2%, emulsifikues (lecitinë SOJE), rregullues aciditeti (acid citrik), aromë, kripë], shurup fruktozë-glukozë, izolat i proteinës së SOJES, koncentrat i proteinës së HIRRËS, flokë SOJE, yndyrë bimore (bërthamë palme, palmë, shea), krem me shije vaniljeje (sheqer, vaj palme dhe shea, HIRRË pluhur, QUMËSHT i skremuar pluhur, emulsifikues: lecitinë luledielli, aromë, ngjyrues E160c), ekstrudat (oriz, izolat i proteinës së QUMËSHTIT, inulinë), trashës (gomë arabike), lagështues (glicerinë), ananas i sheqerosur 1% (ananas 51%, sheqer, antioksidant: acid citrik, konservues: DIOKSID SQUFURI), emulsifikues (lecitinë rapsi), aromë, antioksidant (ekstrakt i pasur me tokoferole), përzierje vitaminash '
  + N'(nikotinamid, D-pantotenat kalciumi, pirodoksinë hidroklorur, riboflavinë, tiaminë mononitrat, acid pteroilmonoglutamik, D-biotinë, cianokobalaminë), antioksidant (acid L-askorbik).

Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, KIKIRIKËVE dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR (ANANAS DHE KOKOS)'
WHERE Variant_Id IN (1304,1316) AND HASHBYTES('SHA2_256', Ingredients) = 0xF91F0161963E70D42B7D05F58BE94C40D095F83BDF5C50B90D5D311872383227;
SET @n += @@ROWCOUNT;
-- item 75
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA ICE CREAM

INGREDIENTS: protein blend (MILK protein, SOY protein), maltose syrup, sweetener (maltitol), cocoa butter, glycerine, rapeseed oil, whole MILK powder, fat-reduced cocoa powder, millet flour, corn flour, rice flour, skimmed WHEY powder, cane sugar, flavourings, salt, emulsifier (lecithins), vanilla powder, HAZELNUTS, PEANUTS.

May contain traces of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN BAR SPECIAL EDITION (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE VANILJE

PËRBËRËSIT: përzierje proteinash (proteinë QUMËSHTI, proteinë SOJE), shurup maltoze, ëmbëlsues (maltitol), gjalpë kakaoje, glicerinë, vaj rapsi, QUMËSHT i plotë pluhur, kakao pluhur me pak yndyrë, miell meli, miell misri, miell orizi, HIRRË e skremuar pluhur, sheqer kallami, aroma, kripë, emulsifikues (lecitina), vanilje pluhur, LAJTHI, KIKIRIKË.

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR SPECIAL EDITION (AKULLORE VANILJE)'
WHERE Variant_Id IN (1320,1323) AND HASHBYTES('SHA2_256', Ingredients) = 0x459D741ACD4A90F115BAA8FDD0696E671A8E4CF628CA8BB1130217DE30CD071C;
SET @n += @@ROWCOUNT;
-- item 76
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BANANA - COCONUT

INGREDIENTS: protein blend (MILK protein, SOY protein), maltose syrup, sweetener (maltitol), cocoa butter, humectant (glycerol), rapeseed oil, whole MILK powder, fat-reduced cocoa powder, coconut, skimmed WHEY powder, millet flour, flavourings, corn flour, rice flour, cane sugar, emulsifier (lecithins), salt, natural banana flavouring, PEANUTS, HAZELNUTS.

May contain traces of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN BAR SPECIAL EDITION (BANANA - COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BANANE - KOKOS

PËRBËRËSIT: përzierje proteinash (proteinë QUMËSHTI, proteinë SOJE), shurup maltoze, ëmbëlsues (maltitol), gjalpë kakaoje, lagështues (glicerol), vaj rapsi, QUMËSHT i plotë pluhur, kakao pluhur me pak yndyrë, kokos, HIRRË e skremuar pluhur, miell meli, aroma, miell misri, miell orizi, sheqer kallami, emulsifikues (lecitina), kripë, aromë natyrale banane, KIKIRIKË, LAJTHI.

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR SPECIAL EDITION (BANANE - KOKOS)'
WHERE Variant_Id IN (1321,1324) AND HASHBYTES('SHA2_256', Ingredients) = 0x49823C7A64741F1BA06693864311DC2C09D93B667D179C1C681C6C0B7B637BA7;
SET @n += @@ROWCOUNT;
-- item 77
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCO - HAZELNUT

INGREDIENTS: protein blend (MILK protein, SOY protein), maltose syrup, sweetener (maltitol), cocoa butter, humectant (glycerol), rapeseed oil, whole MILK powder, fat-reduced cocoa powder, skimmed WHEY powder, millet flour, corn flour, rice flour, cane sugar, flavourings, emulsifier (lecithins), salt, HAZELNUTS, PEANUTS.

May contain traces of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN BAR SPECIAL EDITION (CHOCO - HAZELNUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKO - LAJTHI

PËRBËRËSIT: përzierje proteinash (proteinë QUMËSHTI, proteinë SOJE), shurup maltoze, ëmbëlsues (maltitol), gjalpë kakaoje, lagështues (glicerol), vaj rapsi, QUMËSHT i plotë pluhur, kakao pluhur me pak yndyrë, HIRRË e skremuar pluhur, miell meli, miell misri, miell orizi, sheqer kallami, aroma, emulsifikues (lecitina), kripë, LAJTHI, KIKIRIKË.

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN BAR SPECIAL EDITION (ÇOKO - LAJTHI)'
WHERE Variant_Id IN (1322,1325) AND HASHBYTES('SHA2_256', Ingredients) = 0x4C0E1224306B2C04AF776C4BF310D0C66FC55EF0FB7ACF124A0BD947BEE7C71E;
SET @n += @@ROWCOUNT;
-- item 78
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: protein blend (hydrolysed WHEAT protein, pea protein, SOY protein), sweetener (maltitol), WHEAT flour, humectant (vegetable glycerol), dark chocolate pieces with sweetener (9%) (cocoa mass, sweetener (maltitol), emulsifier (SOY lecithin), flavouring), olive oil, cocoa powder, dates, emulsifier (gum arabic), corn fibre, raising agent (sodium bicarbonate), flavouring.

May also contain MILK, EGGS, NUTS and PEANUTS.

Nutrition information for PROTEINI.SI PROTEIN COOKIE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: përzierje proteinash (proteinë GRURI e hidrolizuar, proteinë bizeleje, proteinë SOJE), ëmbëlsues (maltitol), miell GRURI, lagështues (glicerol bimor), copa çokollate të zezë me ëmbëlsues (9%) (masë kakaoje, ëmbëlsues (maltitol), emulsifikues (lecitinë SOJE), aromë), vaj ulliri, kakao pluhur, hurma, emulsifikues (gomë arabike), fibra misri, agjent mbirës (bikarbonat natriumi), aromë.

Mund të përmbajë gjithashtu QUMËSHT, VEZË, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për PROTEINI.SI PROTEIN COOKIE'
WHERE Variant_Id IN (1327,1328) AND HASHBYTES('SHA2_256', Ingredients) = 0x87D12D3F4FB0B38A3BA14AADFB73E01B7819F241EC524B32ED2489297A3D205C;
SET @n += @@ROWCOUNT;
-- item 79
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TRIPLE CHOCOLATE

INGREDIENTS: EGG white, vegetable oil (sunflower, SOY), humectant (glycerine), WHEAT flour, WHEY protein concentrate, chocolate cream [sweetener (maltitol), vegetable oil (sunflower), fat-reduced cocoa powder 11%, HAZELNUT paste 4%, emulsifier (SOY lecithin), non-hydrogenated vegetable fat (sunflower), flavouring], chocolate pieces 10% [sugar, cocoa mass, cocoa butter, emulsifier (sunflower oil), vanilla flavouring], wholegrain OAT flour, sweetener (maltitol) 5%, raising agents (sodium hydrogen carbonate, disodium diphosphate).

May contain traces of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN DONUT (TRIPLE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E TRIFISHTË

PËRBËRËSIT: e bardhë VEZE, vaj bimor (luledielli, SOJE), lagështues (glicerinë), miell GRURI, koncentrat i proteinës së HIRRËS, krem çokollate [ëmbëlsues (maltitol), vaj bimor (luledielli), kakao pluhur me pak yndyrë 11%, pastë LAJTHIE 4%, emulsifikues (lecitinë SOJE), yndyrë bimore e pahidrogjenizuar (luledielli), aromë], copa çokollate 10% [sheqer, masë kakaoje, gjalpë kakaoje, emulsifikues (vaj luledielli), aromë vaniljeje], miell TËRSHËRE integral, ëmbëlsues (maltitol) 5%, agjentë mbirës (hidrogjenkarbonat natriumi, difosfat dinatriumi).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN DONUT (ÇOKOLLATË E TRIFISHTË)'
WHERE Variant_Id IN (1329,1330) AND HASHBYTES('SHA2_256', Ingredients) = 0xEF00E3E452E587A420B2CE7CE483B0BE941B3D4F2087B49D1CCBFF4F7B833843;
SET @n += @@ROWCOUNT;
-- item 80
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DARK CHOCOLATE AND HAZELNUT CREAM

INGREDIENTS: EGG white, chocolate and HAZELNUT cream 16.6% [sweetener (maltitol), vegetable oil (sunflower), fat-reduced cocoa powder 11%, HAZELNUT paste 4%, LACTOSE, emulsifier (SOY lecithin), flavouring (vanilla)], wholegrain OAT flour (GLUTEN), humectant (glycerine), vegetable oil (sunflower, SOY), orange peel, sweetener (maltitol) 5%, raising agents (sodium bicarbonate, sodium pyrophosphate).

May contain traces of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN DONUT (DARK CHOCOLATE AND HAZELNUT CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË E ZEZË DHE KREM LAJTHIE

PËRBËRËSIT: e bardhë VEZE, krem çokollate dhe LAJTHIE 16,6% [ëmbëlsues (maltitol), vaj bimor (luledielli), kakao pluhur me pak yndyrë 11%, pastë LAJTHIE 4%, LAKTOZË, emulsifikues (lecitinë SOJE), aromë (vanilje)], miell TËRSHËRE integral (GLUTEN), lagështues (glicerinë), vaj bimor (luledielli, SOJE), lëvore portokalli, ëmbëlsues (maltitol) 5%, agjentë mbirës (bikarbonat natriumi, pirofosfat natriumi).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN DONUT (ÇOKOLLATË E ZEZË DHE KREM LAJTHIE)'
WHERE Variant_Id IN (1333,1334) AND HASHBYTES('SHA2_256', Ingredients) = 0x23532D057C0E2CC68860B43998346C10435F908BE1C473753EFA0B9EF7F69C84;
SET @n += @@ROWCOUNT;
-- item 81
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLACK COOKIE AND SPECULOOS CREAM

INGREDIENTS: EGG white, black cookie powder 17% [WHEAT flour, sugar, vegetable oil (sunflower), antioxidants (tocopherol, ascorbic acid), lecithin, citric acid, fat-reduced cocoa powder, stabilisers (potassium carbonate, sodium hydroxide), glucose-fructose syrup, emulsifier (cassia gum), flavouring (vanilla)], speculoos cream 10% [sweetener (maltitol), vegetable oil (sunflower), HAZELNUT cream 9%, WHEY powder, LACTOSE, emulsifier (E322), flavouring (vanilla)], vegetable oils (sunflower, SOY), speculoos cookie flour [WHEAT flour, sugar, vegetable oils (palm, rapeseed oil), sugar syrup, raising agent (sodium hydrogen carbonate), salt, cinnamon], OAT flour 8%, vegetable oils (sunflower, SOY), humectant (glycerine), WHEY protein concentrate, orange peel, sweetener (maltitol) 5%, raising agents (sodium hydrogen carbonate, disodium diphosphate).

May contain traces '
  + N'of other NUTS.

Nutrition information for PROTEINI.SI PROTEIN DONUT (BLACK COOKIE AND SPECULOOS CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTË E ZEZË DHE KREM SPEKULOS

PËRBËRËSIT: e bardhë VEZE, pluhur biskote të zezë 17% [miell GRURI, sheqer, vaj bimor (luledielli), antioksidantë (tokoferol, acid askorbik), lecitinë, acid citrik, kakao pluhur me pak yndyrë, stabilizues (karbonat kaliumi, hidroksid natriumi), shurup glukozë-fruktozë, emulsifikues (gomë kasie), aromë (vanilje)], krem spekulos 10% [ëmbëlsues (maltitol), vaj bimor (luledielli), krem LAJTHIE 9%, HIRRË pluhur, LAKTOZË, emulsifikues (E322), aromë (vanilje)], vajra bimore (luledielli, SOJE), miell biskotash spekulos [miell GRURI, sheqer, vajra bimore (palme, vaj rapsi), shurup sheqeri, agjent mbirës (hidrogjenkarbonat natriumi), kripë, kanellë], miell TËRSHËRE 8%, vajra bimore (luledielli, SOJE), lagështues (glicerinë), koncentrat i proteinës së HIRRËS, lëvore portokalli, ëmbëlsues (maltitol) 5%, agjentë mbirës (hidrogjenkarbonat '
  + N'natriumi, difosfat dinatriumi).

Mund të përmbajë gjurmë të FRUTAVE TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI PROTEIN DONUT (BISKOTË E ZEZË DHE KREM SPEKULOS)'
WHERE Variant_Id IN (1335,1336) AND HASHBYTES('SHA2_256', Ingredients) = 0x0A20BAF09814676BB7B6332F569D54AF0E2508686C37EE881C844B2B7D4CA865;
SET @n += @@ROWCOUNT;
-- item 82
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY

INGREDIENTS: GLUTEN-free OAT flakes, MILK protein isolate, cane sugar, buckwheat porridge, chia seeds (Salvia hispanica), inulin 5%, rice flour, fructose, freeze-dried raspberries 2.5%, thickener (gum arabic), flavouring, acidity regulator (citric acid), sodium chloride, anti-caking agents (calcium phosphate, silicon dioxide), menaquinone-7 (vitamin K2), cholecalciferol (vitamin D).

May contain traces of SOY.

Nutrition information for PROTEINI.SI PROTEIN PORRIDGE (RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR

PËRBËRËSIT: flokë TËRSHËRE pa GLUTEN, izolat i proteinës së QUMËSHTIT, sheqer kallami, qull hikërror, fara chia (Salvia hispanica), inulinë 5%, miell orizi, fruktozë, mjedra të liofilizuara 2,5%, trashës (gomë arabike), aromë, rregullues aciditeti (acid citrik), klorur natriumi, agjentë kundër ngjizjes (fosfat kalciumi, dioksid silici), menakinon-7 (vitamina K2), kolekalciferol (vitamina D).

Mund të përmbajë gjurmë të SOJES.

Informacione ushqyese për PROTEINI.SI PROTEIN PORRIDGE (MJEDËR)'
WHERE Variant_Id IN (1340,1342) AND HASHBYTES('SHA2_256', Ingredients) = 0x8055C943C0B0D942393E91FE2319A058D411A235A73515B51879F628513798D8;
SET @n += @@ROWCOUNT;
-- item 83
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: GLUTEN-free OAT flakes, MILK protein isolate, cane sugar, buckwheat porridge, chia seeds (Salvia hispanica), inulin 5%, rice flour, fructose, dark chocolate pieces 2.5% [cocoa mass, sugar, vegetable fat (palm, shea, illipe, sal, kokum, mango), cocoa, emulsifier (SOY lecithin)], cocoa, thickener (gum arabic), flavouring, sodium chloride, anti-caking agents (calcium phosphate, silicon dioxide), menaquinone-7 (vitamin K2), cholecalciferol (vitamin D).

Nutrition information for PROTEINI.SI PROTEIN PORRIDGE (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: flokë TËRSHËRE pa GLUTEN, izolat i proteinës së QUMËSHTIT, sheqer kallami, qull hikërror, fara chia (Salvia hispanica), inulinë 5%, miell orizi, fruktozë, copa çokollate të zezë 2,5% [masë kakaoje, sheqer, yndyrë bimore (palmë, shea, illipe, sal, kokum, mango), kakao, emulsifikues (lecitinë SOJE)], kakao, trashës (gomë arabike), aromë, klorur natriumi, agjentë kundër ngjizjes (fosfat kalciumi, dioksid silici), menakinon-7 (vitamina K2), kolekalciferol (vitamina D).

Informacione ushqyese për PROTEINI.SI PROTEIN PORRIDGE (ÇOKOLLATË)'
WHERE Variant_Id IN (1341,1343) AND HASHBYTES('SHA2_256', Ingredients) = 0x3158072468FEC5A230790951437B10F58AB23E2E37D4CD2A4566C292756292AE;
SET @n += @@ROWCOUNT;
-- item 84
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: skimmed MILK, MILK protein, cocoa powder 1.1%, stabilisers (gellan gum, carrageenan), sweetener (sucralose), flavouring, enzyme (lactase).

Nutrition information for PROTEINI.SI PROTEIN SHAKE (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: QUMËSHT i skremuar, proteinë QUMËSHTI, kakao pluhur 1,1%, stabilizues (gomë gelani, karragjenan), ëmbëlsues (sukralozë), aromë, enzimë (laktazë).

Informacione ushqyese për PROTEINI.SI PROTEIN SHAKE (ÇOKOLLATË)'
WHERE Variant_Id IN (1344,1346) AND HASHBYTES('SHA2_256', Ingredients) = 0x8342F7B62AAEE8DD76AD2B7EED23D122BD8D68C9024331C0E500FC25F74D3175;
SET @n += @@ROWCOUNT;
-- item 85
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA

INGREDIENTS: skimmed MILK, MILK protein 5%, water, flavouring, sweetener (sucralose), colour (riboflavin), stabilisers (carrageenan, gellan gum), lactase (enzyme).

Nutrition information for PROTEINI.SI PROTEIN SHAKE (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE

PËRBËRËSIT: QUMËSHT i skremuar, proteinë QUMËSHTI 5%, ujë, aromë, ëmbëlsues (sukralozë), ngjyrues (riboflavinë), stabilizues (karragjenan, gomë gelani), laktazë (enzimë).

Informacione ushqyese për PROTEINI.SI PROTEIN SHAKE (VANILJE)'
WHERE Variant_Id IN (1345,1347) AND HASHBYTES('SHA2_256', Ingredients) = 0x4D70CA3E0CA1631975AE36AFD685EDA2F3D8D9196C0AE338F887EF3F7C426120;
SET @n += @@ROWCOUNT;
-- item 86
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COCONUT - CARAMEL

INGREDIENTS: wafer with cocoa cream [WHEAT flour, WHEY protein concentrate powder (from MILK), palm fat, sweetener (maltitol), fat-reduced cocoa powder 4% in the cocoa cream, rapeseed oil, emulsifier (lecithins), salt, raising agent (sodium carbonates)], WHEY protein concentrate powder (from MILK), caramel filling [apple extract, WHEY protein concentrate powder (from MILK), unsweetened condensed MILK, coconut fat, colour (caramel), emulsifier (mono- and diglycerides of fatty acids), salt, natural flavouring], cocoa butter, sweetener (maltitol), palm fat, skimmed MILK powder, cocoa mass, whole MILK powder, roasted coconut, HAZELNUT pieces 1%, MILK fat, emulsifier (SOY lecithin), salt, natural coconut flavouring, NUT paste (HAZELNUTS, PEANUTS), vanilla extract.

*Cocoa solids minimum 32%. Milk solids minimum 14%.

May contain other NUTS, EGGS and other cereals containing '
  + N'GLUTEN.

Nutrition information for PROTEINI.SI PROTEIN WAFER (COCONUT - CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOKOS - KARAMEL

PËRBËRËSIT: vafër me krem kakaoje [miell GRURI, koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), yndyrë palme, ëmbëlsues (maltitol), kakao pluhur me pak yndyrë 4% në kremin e kakaos, vaj rapsi, emulsifikues (lecitina), kripë, agjent mbirës (karbonate natriumi)], koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), mbushje karameli [ekstrakt molle, koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), QUMËSHT i kondensuar pa sheqer, yndyrë kokosi, ngjyrues (karamel), emulsifikues (mono- dhe digliceride të acideve yndyrore), kripë, aromë natyrale], gjalpë kakaoje, ëmbëlsues (maltitol), yndyrë palme, QUMËSHT i skremuar pluhur, masë kakaoje, QUMËSHT i plotë pluhur, kokos i pjekur, copa LAJTHIE 1%, yndyrë QUMËSHTI, emulsifikues (lecitinë SOJE), kripë, aromë natyrale kokosi, pastë FRUTASH ME LËVOZHGË (LAJTHI, KIKIRIKË), ekstrakt '
  + N'vaniljeje.

*Lëndë të thata kakaoje minimumi 32%. Lëndë të thata qumështi minimumi 14%.

Mund të përmbajë FRUTA TË TJERA ME LËVOZHGË, VEZË dhe drithëra të tjera që përmbajnë GLUTEN.

Informacione ushqyese për PROTEINI.SI PROTEIN WAFER (KOKOS - KARAMEL)'
WHERE Variant_Id IN (1348,1350) AND HASHBYTES('SHA2_256', Ingredients) = 0x144C38B6DC3895BB4188FEFE399F7D83837189A45802A93532964C82C0260372;
SET @n += @@ROWCOUNT;
-- item 87
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEANUT - CARAMEL

INGREDIENTS: wafer with cocoa cream [WHEAT flour, WHEY protein concentrate powder (from MILK), palm fat, sweetener (maltitol), fat-reduced cocoa powder 4% in the cocoa cream, rapeseed oil, emulsifier (lecithins), salt, raising agent (sodium carbonates)], WHEY protein concentrate powder (from MILK), caramel filling [apple extract, WHEY protein concentrate powder (from MILK), unsweetened condensed MILK, coconut fat, colour (caramel), emulsifier (mono- and diglycerides of fatty acids), salt, natural flavouring], cocoa butter, sweetener (maltitol), PEANUT pieces, skimmed MILK powder, PEANUTS 4.2%, cocoa mass, palm fat, whole MILK powder, MILK fat, emulsifier (SOY lecithin), salt, natural peanut flavouring (contains PEANUTS), NUT paste (HAZELNUTS, PEANUTS), vanilla extract.

*Cocoa solids minimum 32%. Milk solids minimum 14%.

May contain other NUTS, EGGS and other cereals containing '
  + N'GLUTEN.

Nutrition information for PROTEINI.SI PROTEIN WAFER (PEANUT - CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KIKIRIKË - KARAMEL

PËRBËRËSIT: vafër me krem kakaoje [miell GRURI, koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), yndyrë palme, ëmbëlsues (maltitol), kakao pluhur me pak yndyrë 4% në kremin e kakaos, vaj rapsi, emulsifikues (lecitina), kripë, agjent mbirës (karbonate natriumi)], koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), mbushje karameli [ekstrakt molle, koncentrat i proteinës së HIRRËS pluhur (nga QUMËSHTI), QUMËSHT i kondensuar pa sheqer, yndyrë kokosi, ngjyrues (karamel), emulsifikues (mono- dhe digliceride të acideve yndyrore), kripë, aromë natyrale], gjalpë kakaoje, ëmbëlsues (maltitol), copa KIKIRIKU, QUMËSHT i skremuar pluhur, KIKIRIKË 4,2%, masë kakaoje, yndyrë palme, QUMËSHT i plotë pluhur, yndyrë QUMËSHTI, emulsifikues (lecitinë SOJE), kripë, aromë natyrale kikiriku (përmban KIKIRIKË), pastë FRUTASH ME LËVOZHGË '
  + N'(LAJTHI, KIKIRIKË), ekstrakt vaniljeje.

*Lëndë të thata kakaoje minimumi 32%. Lëndë të thata qumështi minimumi 14%.

Mund të përmbajë FRUTA TË TJERA ME LËVOZHGË, VEZË dhe drithëra të tjera që përmbajnë GLUTEN.

Informacione ushqyese për PROTEINI.SI PROTEIN WAFER (KIKIRIKË - KARAMEL)'
WHERE Variant_Id IN (1349,1351) AND HASHBYTES('SHA2_256', Ingredients) = 0x0DA7B9E6108059A97803D1C6D3EB635F60526AE9869BB5CA857E5AACB2129490;
SET @n += @@ROWCOUNT;
-- item 88
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEANUT BUTTER AND CARAMEL

INGREDIENTS: MILK chocolate 22% (sweetener: maltitol, cocoa butter, cocoa mass, MILK powder, cocoa, emulsifier: sunflower lecithin), protein blend (MILK protein, SOY protein isolate), humectant (glycerol), collagen peptides, PEANUTS 9%, polydextrose, sunflower oil, skimmed MILK powder, oligofructose, vegetable fats (palm kernel, palm, shea), emulsifier (rapeseed lecithin), water, flavouring, sodium chloride, emulsifier (sodium citrate), colours E150c and E160b, sweetener (sucralose).

The product may contain traces of NUTS and SESAME.

Nutrition information for PROTEINI.SI SNICKS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'GJALPË KIKIRIKU DHE KARAMEL

PËRBËRËSIT: çokollatë QUMËSHTI 22% (ëmbëlsues: maltitol, gjalpë kakaoje, masë kakaoje, QUMËSHT pluhur, kakao, emulsifikues: lecitinë luledielli), përzierje proteinash (proteinë QUMËSHTI, izolat i proteinës së SOJES), lagështues (glicerol), peptide kolagjeni, KIKIRIKË 9%, polidekstrozë, vaj luledielli, QUMËSHT i skremuar pluhur, oligofruktozë, yndyrna bimore (bërthamë palme, palmë, shea), emulsifikues (lecitinë rapsi), ujë, aromë, klorur natriumi, emulsifikues (citrat natriumi), ngjyrues E150c dhe E160b, ëmbëlsues (sukralozë).

Produkti mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË dhe SUSAMIT.

Informacione ushqyese për PROTEINI.SI SNICKS'
WHERE Variant_Id IN (1352,1353) AND HASHBYTES('SHA2_256', Ingredients) = 0x9AEA418CB92DD6502AEA44121AAD51A3369AECFC9DB05F67397D4346954B013B;
SET @n += @@ROWCOUNT;
-- item 89
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: protein blend 20% [MILK protein isolate, MILK protein, WHEY protein concentrate (MILK), emulsifier (SOY lecithin)], MILK chocolate 15% [sugar, cocoa butter, skimmed MILK powder, cocoa mass, lactose and WHEY protein (MILK), palm fat, WHEY powder (MILK), MILK fat, emulsifiers (SOY lecithin, E476), natural vanilla extract], hydrolysed collagen 14%, caramel 12% [sweetened condensed skimmed MILK, glucose syrup, invert sugar syrup, palm oil, BUTTER (MILK), sugar, emulsifier (E471), stabiliser (pectin), salt, natural flavouring], humectant (maltitol), PEANUTS 10%, humectant (glycerol), PEANUT flour, fructo-oligosaccharides, natural flavouring (PEANUT), salt, colour (caramel), antioxidant (mixed natural tocopherols).

May contain ALMONDS, HAZELNUTS, PECAN NUTS, GLUTEN and EGGS.

Nutrition information for SNICKERS HI PROTEIN BAR (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: përzierje proteinash 20% [izolat i proteinës së QUMËSHTIT, proteinë QUMËSHTI, koncentrat i proteinës së HIRRËS (QUMËSHT), emulsifikues (lecitinë SOJE)], çokollatë QUMËSHTI 15% [sheqer, gjalpë kakaoje, QUMËSHT i skremuar pluhur, masë kakaoje, laktozë dhe proteinë HIRRE (QUMËSHT), yndyrë palme, HIRRË pluhur (QUMËSHT), yndyrë QUMËSHTI, emulsifikues (lecitinë SOJE, E476), ekstrakt natyral vaniljeje], kolagjen i hidrolizuar 14%, karamel 12% [QUMËSHT i skremuar i kondensuar i ëmbëlsuar, shurup glukoze, shurup sheqeri i invertuar, vaj palme, GJALPË (QUMËSHT), sheqer, emulsifikues (E471), stabilizues (pektinë), kripë, aromë natyrale], lagështues (maltitol), KIKIRIKË 10%, lagështues (glicerol), miell KIKIRIKU, frukto-oligosakaride, aromë natyrale (KIKIRIKË), kripë, ngjyrues (karamel), antioksidant (përzierje tokoferolesh natyrale).

Mund të '
  + N'përmbajë BAJAME, LAJTHI, ARRA PEKAN, GLUTEN dhe VEZË.

Informacione ushqyese për SNICKERS HI PROTEIN BAR (NEW)'
WHERE Variant_Id IN (1366,1367) AND HASHBYTES('SHA2_256', Ingredients) = 0x8E06541865D7E024361F7691BED7FC809AC1F25E90827CE3F0DB82464B639A7C;
SET @n += @@ROWCOUNT;
-- item 90
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: MILK chocolate with sweetener 19% [sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (SOY lecithin), vanilla extract], MILK protein, hydrolysed collagen, roasted PEANUTS 11%, caramel-flavoured layer 11% [sweetener (maltitol), condensed MILK, cocoa butter, humectant (sorbitol), emulsifier (mono- and diglycerides of fatty acids), natural flavouring, salt, colour (caramel), humectant (glycerol), water, oligofructose, PEANUT paste, WHEY protein (MILK), palm fat, sea salt, flavouring, natural flavouring, colour (caramel)].

May contain NUTS, EGGS and GLUTEN.

Nutrition information for SNICKERS HI PROTEIN LOW SUGAR BAR',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: çokollatë QUMËSHTI me ëmbëlsues 19% [ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitinë SOJE), ekstrakt vaniljeje], proteinë QUMËSHTI, kolagjen i hidrolizuar, KIKIRIKË të pjekur 11%, shtresë me shije karameli 11% [ëmbëlsues (maltitol), QUMËSHT i kondensuar, gjalpë kakaoje, lagështues (sorbitol), emulsifikues (mono- dhe digliceride të acideve yndyrore), aromë natyrale, kripë, ngjyrues (karamel), lagështues (glicerol), ujë, oligofruktozë, pastë KIKIRIKU, proteinë HIRRE (QUMËSHT), yndyrë palme, kripë deti, aromë, aromë natyrale, ngjyrues (karamel)].

Mund të përmbajë FRUTA ME LËVOZHGË, VEZË dhe GLUTEN.

Informacione ushqyese për SNICKERS HI PROTEIN LOW SUGAR BAR'
WHERE Variant_Id IN (1368,1369) AND HASHBYTES('SHA2_256', Ingredients) = 0xE72687BB09E996A0C84818018C8874063F68B1AE572EC61B7607305C6AEED5C8;
SET @n += @@ROWCOUNT;
-- item 91
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: BERRIES

INGREDIENTS: water, beta-alanine, L-arginine, acidity regulators (citric acid, malic acid, phosphoric acid, trisodium citrate), citrulline DL-malate 2:1, acetyl L-tyrosine, caffeine anhydrous, preservatives (potassium sorbate, sodium benzoate), flavouring, sweeteners (acesulfame K, sucralose, steviol glycosides), Siberian ginseng, niacin (vitamin B3), L-theanine, pyridoxine hydrochloride (vitamin B6), colour (Ponceau 4R), folic acid (vitamin B9), cyanocobalamin (vitamin B12).

Ponceau 4R may have an adverse effect on activity and attention in children.

Nutrition information for USN ATOM BOMB INTENSE PRE-WORKOUT (BERRIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MANAFERRA

PËRBËRËSIT: ujë, beta-alaninë, L-argininë, rregullues aciditeti (acid citrik, acid malik, acid fosforik, citrat trinatriumi), citrulinë DL-malat 2:1, acetil L-tirozinë, kafeinë anhidre, konservues (sorbat kaliumi, benzoat natriumi), aromë, ëmbëlsues (acesulfam K, sukralozë, glikozide steviolike), xhensen siberian, niacinë (vitamina B3), L-teaninë, pirodoksinë hidroklorur (vitamina B6), ngjyrues (Ponceau 4R), acid folik (vitamina B9), cianokobalaminë (vitamina B12).

Ponceau 4R mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për USN ATOM BOMB INTENSE PRE-WORKOUT (MANAFERRA)'
WHERE Variant_Id IN (1373,1374) AND HASHBYTES('SHA2_256', Ingredients) = 0xDD3D71ED192B892DF03B6CF1D6F1A8975A0F861C93BE56025505CA352CDFBBBF;
SET @n += @@ROWCOUNT;
-- item 92
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: premium protein blend (whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK) (emulsifier: sunflower lecithin)), inulin, flavouring, thickeners (guar gum, xanthan gum), sodium chloride, sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN BLUE LAB 100% WHEY PROTEIN (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: përzierje premium proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT) (emulsifikues: lecitinë luledielli)), inulinë, aromë, trashës (gomë guar, gomë ksantani), klorur natriumi, ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN BLUE LAB 100% WHEY PROTEIN (VANILJE)'
WHERE Variant_Id IN (1379,1382) AND HASHBYTES('SHA2_256', Ingredients) = 0x2C4C59F4F119A8DE838AED385D32AFBDA2D382421B71DC900EFF58784ADD8FD8;
SET @n += @@ROWCOUNT;
-- item 93
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: STRAWBERRY

INGREDIENTS: premium protein blend (whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK)), inulin, flavouring, colour (beetroot red), stabilisers (guar gum, xanthan gum), sodium chloride, sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see ingredients in bold.

Nutrition information for USN BLUE LAB 100% WHEY PROTEIN (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LULESHTRYDHE

PËRBËRËSIT: përzierje premium proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), inulinë, aromë, ngjyrues (e kuqe panxhari), stabilizues (gomë guar, gomë ksantani), klorur natriumi, ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara.

Informacione ushqyese për USN BLUE LAB 100% WHEY PROTEIN (LULESHTRYDHE)'
WHERE Variant_Id IN (1380,1383) AND HASHBYTES('SHA2_256', Ingredients) = 0xD5CC51D5D49F50EC5FDD598A394E2FF0325CC7B58F8715292B87F5F37ECAD97A;
SET @n += @@ROWCOUNT;
-- item 94
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: premium protein blend (whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK)), cocoa powder, inulin, flavouring, sodium chloride, stabilisers (guar gum, xanthan gum), sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see ingredients in bold.

Nutrition information for USN BLUE LAB 100% WHEY PROTEIN (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: përzierje premium proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), kakao pluhur, inulinë, aromë, klorur natriumi, stabilizues (gomë guar, gomë ksantani), ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara.

Informacione ushqyese për USN BLUE LAB 100% WHEY PROTEIN (ÇOKOLLATË)'
WHERE Variant_Id IN (1381,1499) AND HASHBYTES('SHA2_256', Ingredients) = 0xA8C9085F0C4AE5E444EEEFBDE19105522B1EABAE7B8D1693DAD4BA5F428B2F90;
SET @n += @@ROWCOUNT;
-- item 95
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: BLUEBERRY MUFFIN

INGREDIENTS: white chocolate with sweetener (33%) (sweetener (maltitol), cocoa butter, whole MILK powder, emulsifier (lecithins)), milk protein (MILK), humectant (glycerol), collagen hydrolysate, soy protein crispy pieces (SOY protein, fat-reduced cocoa powder, starch), oligofructose, polydextrose syrup, sweeteners (maltitol, sucralose), soy protein (SOY), flavourings, sunflower oil, acidity regulator (citric acid), freeze-dried blueberry pieces, emulsifier (lecithins), salt.

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN TRUST CRUNCH BAR (BLUEBERRY MUFFIN)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MAFIN ME BORONICA

PËRBËRËSIT: çokollatë e bardhë me ëmbëlsues (33%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina)), proteinë qumështi (QUMËSHT), lagështues (glicerol), hidrolizat kolagjeni, copa krokante proteine soje (proteinë SOJE, kakao pluhur me pak yndyrë, niseshte), oligofruktozë, shurup polidekstroze, ëmbëlsues (maltitol, sukralozë), proteinë soje (SOJE), aroma, vaj luledielli, rregullues aciditeti (acid citrik), copa boronice të liofilizuar, emulsifikues (lecitina), kripë.

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN TRUST CRUNCH BAR (MAFIN ME BORONICA)'
WHERE Variant_Id IN (1396,1397) AND HASHBYTES('SHA2_256', Ingredients) = 0x37A5FB31EFF407BDA7C9D2DFD2AAFCD70878399B60ACA93B62D4DEC6C05D492D;
SET @n += @@ROWCOUNT;
-- item 96
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: WHITE CHOCOLATE AND COOKIE DOUGH

INGREDIENTS: white chocolate (28%) (sweetener (maltitol), cocoa butter, whole MILK powder, emulsifiers (lecithins)), protein blend (milk protein (MILK), soy protein (SOY)), collagen peptides, humectant (glycerol), bulking agent (polydextrose), oligofructose, soy protein (SOY), sunflower oil, tapioca starch, cocoa butter, cocoa powder, emulsifiers (lecithins), flavouring, salt, colour (plain caramel), sweetener (sucralose).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN TRUST CRUNCH BAR (WHITE CHOCOLATE AND COOKIE DOUGH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË E BARDHË DHE BRUMË BISKOTASH

PËRBËRËSIT: çokollatë e bardhë (28%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina)), përzierje proteinash (proteinë qumështi (QUMËSHT), proteinë soje (SOJE)), peptide kolagjeni, lagështues (glicerol), agjent për rritjen e vëllimit (polidekstrozë), oligofruktozë, proteinë soje (SOJE), vaj luledielli, niseshte tapioke, gjalpë kakaoje, kakao pluhur, emulsifikues (lecitina), aromë, kripë, ngjyrues (karamel i thjeshtë), ëmbëlsues (sukralozë).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN TRUST CRUNCH BAR (ÇOKOLLATË E BARDHË DHE BRUMË BISKOTASH)'
WHERE Variant_Id IN (1398,1399) AND HASHBYTES('SHA2_256', Ingredients) = 0x05F8F4A3BE2C17FD130AB819FCF645B9D8BCE40F72D6EBAED7E97F0B18C6DD34;
SET @n += @@ROWCOUNT;
-- item 97
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: COOKIES AND CREAM

INGREDIENTS: milk chocolate (18%) (sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins), flavouring), milk protein (MILK), soy protein (SOY), collagen peptides, humectant (glycerol), bulking agent (polydextrose), oligofructose, sweeteners (maltitol, sucralose), cocoa mass, sunflower oil, flavouring, cocoa butter, tapioca starch, emulsifier (lecithins), milk fat (MILK), colour (plain caramel).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN TRUST CRUNCH BAR (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: BISKOTA DHE KREM

PËRBËRËSIT: çokollatë qumështi (18%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina), aromë), proteinë qumështi (QUMËSHT), proteinë soje (SOJE), peptide kolagjeni, lagështues (glicerol), agjent për rritjen e vëllimit (polidekstrozë), oligofruktozë, ëmbëlsues (maltitol, sukralozë), masë kakaoje, vaj luledielli, aromë, gjalpë kakaoje, niseshte tapioke, emulsifikues (lecitina), yndyrë qumështi (QUMËSHT), ngjyrues (karamel i thjeshtë).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN TRUST CRUNCH BAR (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1400,1401) AND HASHBYTES('SHA2_256', Ingredients) = 0x71824868F601BE7247519306578D72B4FB30BAF41F2CF0F2F28838C98F78DEBE;
SET @n += @@ROWCOUNT;
-- item 98
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE BROWNIE

INGREDIENTS: milk chocolate (18%) (sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifiers (lecithins (SOY)), flavouring), protein blend (milk protein (MILK), soy protein (SOY)), collagen peptides, humectant (glycerol), bulking agent (polydextrose), oligofructose, soy protein (SOY), sweeteners (maltitol, sucralose), cocoa mass, cocoa powder, cocoa butter, sunflower oil, tapioca starch, emulsifiers (lecithins, E442), flavouring, salt, milk fat (MILK), colour (plain caramel).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN TRUST CRUNCH BAR (CHOCOLATE BROWNIE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: BROWNIE ME ÇOKOLLATË

PËRBËRËSIT: çokollatë qumështi (18%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina (SOJE)), aromë), përzierje proteinash (proteinë qumështi (QUMËSHT), proteinë soje (SOJE)), peptide kolagjeni, lagështues (glicerol), agjent për rritjen e vëllimit (polidekstrozë), oligofruktozë, proteinë soje (SOJE), ëmbëlsues (maltitol, sukralozë), masë kakaoje, kakao pluhur, gjalpë kakaoje, vaj luledielli, niseshte tapioke, emulsifikues (lecitina, E442), aromë, kripë, yndyrë qumështi (QUMËSHT), ngjyrues (karamel i thjeshtë).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN TRUST CRUNCH BAR (BROWNIE ME ÇOKOLLATË)'
WHERE Variant_Id IN (1402,1403) AND HASHBYTES('SHA2_256', Ingredients) = 0x0DCDADDBD3EDB01AF3FC1D42C775DAF9E104CF630FB14036FEAC4C9E8EDE415E;
SET @n += @@ROWCOUNT;
-- item 99
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: SALTED CARAMEL

INGREDIENTS: milk chocolate with sweetener (28%) [sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins), natural vanilla flavouring], milk protein (MILK), collagen hydrolysate, humectant (glycerol), soy protein (SOY), oligofructose, polydextrose syrup, soy protein crispy pieces (SOY protein, starch, fat-reduced cocoa powder), sunflower oil, cocoa butter, flavouring (MILK), emulsifier (lecithins), starch, salt, fat-reduced cocoa powder, colour (plain caramel), sweetener (sucralose).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, PEANUTS and NUTS.

Nutrition information for USN TRUST CRUNCH BAR (SALTED CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: KARAMEL I KRIPUR

PËRBËRËSIT: çokollatë qumështi me ëmbëlsues (28%) [ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina), aromë natyrale vaniljeje], proteinë qumështi (QUMËSHT), hidrolizat kolagjeni, lagështues (glicerol), proteinë soje (SOJE), oligofruktozë, shurup polidekstroze, copa krokante proteine soje (proteinë SOJE, niseshte, kakao pluhur me pak yndyrë), vaj luledielli, gjalpë kakaoje, aromë (QUMËSHT), emulsifikues (lecitina), niseshte, kripë, kakao pluhur me pak yndyrë, ngjyrues (karamel i thjeshtë), ëmbëlsues (sukralozë).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, KIKIRIKËVE dhe FRUTAVE ME LËVOZHGË.

Informacione ushqyese për USN TRUST CRUNCH BAR (KARAMEL I KRIPUR)'
WHERE Variant_Id IN (1404,1405) AND HASHBYTES('SHA2_256', Ingredients) = 0x719134DD2BFACA18AA00073A67EC69C0703D72707E646AFE911D1EEC20799B59;
SET @n += @@ROWCOUNT;
-- item 100
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: TRIPLE CHOCOLATE

INGREDIENTS: white chocolate (28%) (sweetener (maltitol), cocoa butter, whole MILK powder, emulsifier (lecithins)), protein blend (milk protein (MILK), soy protein (SOY)), collagen peptides, humectant (glycerol), bulking agent (polydextrose), oligofructose, soy protein (SOY), cocoa powder, sunflower oil, tapioca starch, cocoa butter, emulsifier (lecithins), flavourings, salt, colour (plain caramel), sweetener (sucralose).

ALLERGENS: For allergens, see ingredients in bold. May contain traces of GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for USN TRUST CRUNCH BAR (TRIPLE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË E TRIFISHTË

PËRBËRËSIT: çokollatë e bardhë (28%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues (lecitina)), përzierje proteinash (proteinë qumështi (QUMËSHT), proteinë soje (SOJE)), peptide kolagjeni, lagështues (glicerol), agjent për rritjen e vëllimit (polidekstrozë), oligofruktozë, proteinë soje (SOJE), kakao pluhur, vaj luledielli, niseshte tapioke, gjalpë kakaoje, emulsifikues (lecitina), aroma, kripë, ngjyrues (karamel i thjeshtë), ëmbëlsues (sukralozë).

ALERGJENËT: Për alergjenët, shihni përbërësit e shkruar me shkronja të theksuara. Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, FRUTAVE ME LËVOZHGË dhe KIKIRIKËVE.

Informacione ushqyese për USN TRUST CRUNCH BAR (ÇOKOLLATË E TRIFISHTË)'
WHERE Variant_Id IN (1406,1407) AND HASHBYTES('SHA2_256', Ingredients) = 0x29D3E5A34A9D3C5FC7637D8B3F02CF7CB5A04850044B1168529C738DB4841D0C;
SET @n += @@ROWCOUNT;
-- item 101
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: LEMON

INGREDIENTS: maltodextrin, water, fructose, sodium citrate, acidity regulator (citric acid), sodium chloride, acidity regulator (tartaric acid), preservatives (sorbic acid, sodium benzoate), thickener (guar gum), flavouring.

Nutrition information for PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY GEL (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LIMON

PËRBËRËSIT: maltodekstrinë, ujë, fruktozë, citrat natriumi, rregullues aciditeti (acid citrik), klorur natriumi, rregullues aciditeti (acid tartarik), konservues (acid sorbik, benzoat natriumi), trashës (gomë guar), aromë.

Informacione ushqyese për PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY GEL (LIMON)'
WHERE Variant_Id IN (1411,1413) AND HASHBYTES('SHA2_256', Ingredients) = 0x7D2F6CDECCAEAD307474567332DAB03A6F667B61231256895334B2E79740058D;
SET @n += @@ROWCOUNT;
-- item 102
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: STRAWBERRY

INGREDIENTS: maltodextrin, water, fructose, sodium citrate, acidity regulator (citric acid), sodium chloride, flavouring, acidity regulator (tartaric acid), preservatives (sorbic acid, sodium benzoate), thickener (guar gum).

Nutrition information for PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY GEL (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LULESHTRYDHE

PËRBËRËSIT: maltodekstrinë, ujë, fruktozë, citrat natriumi, rregullues aciditeti (acid citrik), klorur natriumi, aromë, rregullues aciditeti (acid tartarik), konservues (acid sorbik, benzoat natriumi), trashës (gomë guar).

Informacione ushqyese për PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY GEL (LULESHTRYDHE)'
WHERE Variant_Id IN (1412,1414) AND HASHBYTES('SHA2_256', Ingredients) = 0xB80319642CC99F050406025DF46E601A0FABA1673435A4EA02BBD92BDEE072C7;
SET @n += @@ROWCOUNT;
-- item 103
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA ICE CREAM

INGREDIENTS: WHEY protein blend (98%) [MILK] (WHEY protein isolate (MILK), WHEY protein concentrate (MILK), WHEY protein hydrolysate (MILK), emulsifier: SOY lecithin), flavourings [MILK], thickener (xanthan gum), sweetener (sucralose).

ALLERGENS: May contain GLUTEN, EGGS and PEANUTS.

Nutrition information for OPTIMUM GOLD STANDARD 100% WHEY (NEW) (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: AKULLORE VANILJE

PËRBËRËSIT: përzierje proteinash HIRRE (98%) [QUMËSHT] (izolat i proteinës së HIRRËS (QUMËSHT), koncentrat i proteinës së HIRRËS (QUMËSHT), hidrolizat i proteinës së HIRRËS (QUMËSHT), emulsifikues: lecitinë SOJE), aroma [QUMËSHT], trashës (gomë ksantani), ëmbëlsues (sukralozë).

ALERGJENËT: Mund të përmbajë GLUTEN, VEZË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM GOLD STANDARD 100% WHEY (NEW) (AKULLORE VANILJE)'
WHERE Variant_Id IN (1415,1416) AND HASHBYTES('SHA2_256', Ingredients) = 0x4B3381E46F9CB67E6641ADAB9709E9756A3230503FD95CB6C34BBD2657009E96;
SET @n += @@ROWCOUNT;
-- item 104
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: DOUBLE CHOCOLATE

INGREDIENTS: WHEY protein blend (93%) [MILK] (WHEY protein isolate, WHEY protein concentrate, hydrolysed WHEY protein isolate, emulsifier: SOY lecithin), fat-reduced cocoa powder, flavourings, thickener (xanthan gum), sweeteners (sucralose, acesulfame K).

ALLERGENS: May contain GLUTEN, EGGS and PEANUTS.

Nutrition information for OPTIMUM GOLD STANDARD 100% WHEY (NEW) (DOUBLE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË E DYFISHTË

PËRBËRËSIT: përzierje proteinash HIRRE (93%) [QUMËSHT] (izolat i proteinës së HIRRËS, koncentrat i proteinës së HIRRËS, izolat i hidrolizuar i proteinës së HIRRËS, emulsifikues: lecitinë SOJE), kakao pluhur me pak yndyrë, aroma, trashës (gomë ksantani), ëmbëlsues (sukralozë, acesulfam K).

ALERGJENËT: Mund të përmbajë GLUTEN, VEZË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM GOLD STANDARD 100% WHEY (NEW) (ÇOKOLLATË E DYFISHTË)'
WHERE Variant_Id IN (1417,1418) AND HASHBYTES('SHA2_256', Ingredients) = 0xFAA5DC0CD6451797EFCBB65172B5AD8646C0634305F2F2A37F6EE8FD7A0EDAAA;
SET @n += @@ROWCOUNT;
-- item 105
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: PEANUT

INGREDIENTS: milk chocolate (16%) (sugar, cocoa butter, skimmed MILK powder, cocoa mass, lactose and whey protein (MILK), palm fat, whey powder (MILK), milk fat (MILK), emulsifiers (E322 (SOY), E476), vanilla extract), protein blend (milk protein (MILK), whey protein concentrate (MILK), emulsifier (E322 (SOY))), caramel (10%) (sweetened condensed skimmed MILK (MILK, sugar), glucose syrup, invert sugar syrup, palm oil, butter (MILK), sugar, emulsifier (E471), stabiliser (E440), salt, flavouring), PEANUTS (10%), humectant (glycerol), sweetener (maltitol), hydrolysed collagen, mini M&M’s candies (7%) (sugar, cocoa mass, whole MILK powder, lactose (MILK), cocoa butter, starch, palm fat, shea fat, glucose syrup, emulsifier (E322 (SOY)), stabiliser (E414), colours (E100, E133, E160a, E162, E170, E172), dextrin, glazing agent (E903), palm kernel oil, salt, vanilla extract), soy '
  + N'protein isolate (SOY), PEANUT flour, glucose syrup, sunflower oil, flavourings (PEANUT), salt, colour (E150a), antioxidant (E306).

ALLERGENS: May contain traces of ALMONDS, HAZELNUTS, CASHEWS, PECAN NUTS, PISTACHIOS, EGGS, WHEAT, BARLEY and OATS.

Nutrition information for M&M’S HI PROTEIN BAR (PEANUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: KIKIRIKË

PËRBËRËSIT: çokollatë qumështi (16%) (sheqer, gjalpë kakaoje, QUMËSHT i skremuar pluhur, masë kakaoje, laktozë dhe proteinë hirre (QUMËSHT), yndyrë palme, hirrë pluhur (QUMËSHT), yndyrë qumështi (QUMËSHT), emulsifikues (E322 (SOJE), E476), ekstrakt vaniljeje), përzierje proteinash (proteinë qumështi (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT), emulsifikues (E322 (SOJE))), karamel (10%) (QUMËSHT i skremuar i kondensuar i ëmbëlsuar (QUMËSHT, sheqer), shurup glukoze, shurup sheqeri i invertuar, vaj palme, gjalpë (QUMËSHT), sheqer, emulsifikues (E471), stabilizues (E440), kripë, aromë), KIKIRIKË (10%), lagështues (glicerol), ëmbëlsues (maltitol), kolagjen i hidrolizuar, karamele mini M&M’s (7%) (sheqer, masë kakaoje, QUMËSHT i plotë pluhur, laktozë (QUMËSHT), gjalpë kakaoje, niseshte, yndyrë palme, yndyrë shea, shurup '
  + N'glukoze, emulsifikues (E322 (SOJE)), stabilizues (E414), ngjyrues (E100, E133, E160a, E162, E170, E172), dekstrinë, agjent lustrues (E903), vaj bërthame palme, kripë, ekstrakt vaniljeje), izolat i proteinës së sojes (SOJE), miell KIKIRIKU, shurup glukoze, vaj luledielli, aroma (KIKIRIKË), kripë, ngjyrues (E150a), antioksidant (E306).

ALERGJENËT: Mund të përmbajë gjurmë të BAJAMEVE, LAJTHIVE, SHQEMEVE, ARRAVE PEKAN, FISTIKËVE, VEZËVE, GRURIT, ELBIT dhe TËRSHËRËS.

Informacione ushqyese për M&M’S HI PROTEIN BAR (KIKIRIKË)'
WHERE Variant_Id IN (1421,1422) AND HASHBYTES('SHA2_256', Ingredients) = 0x6066B54481B6DCF6A7238C10E7A569610D841A3054DCA04D7DC0C4A8420097F6;
SET @n += @@ROWCOUNT;
-- item 106
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: protein blend (27%) (soy protein isolate (SOY), milk protein isolate (MILK), skimmed MILK powder, whey protein concentrate (MILK), EGG white, emulsifier (SOY lecithin)), caramel (16%) (sweetened condensed skimmed MILK, glucose syrup, invert sugar syrup, palm oil, butter (MILK), sugar, emulsifier (E471), stabiliser (pectin), salt, natural flavouring), milk chocolate (15%) (sugar, cocoa butter, skimmed MILK powder, cocoa mass, lactose and whey protein (MILK), palm fat, whey powder (MILK), milk fat (MILK), emulsifiers (SOY lecithin, E476), natural vanilla extract), hydrolysed collagen (12%), humectant (glycerol), fructo-oligosaccharide, humectant (maltitol), flavourings, fat-reduced cocoa powder, BARLEY malt extract, salt.

ALLERGENS: May contain traces of PEANUTS, ALMONDS, HAZELNUTS and PECAN NUTS.

Nutrition information for MARS HI PROTEIN BAR',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: përzierje proteinash (27%) (izolat i proteinës së sojes (SOJE), izolat i proteinës së qumështit (QUMËSHT), QUMËSHT i skremuar pluhur, koncentrat i proteinës së hirrës (QUMËSHT), e bardhë VEZE, emulsifikues (lecitinë SOJE)), karamel (16%) (QUMËSHT i skremuar i kondensuar i ëmbëlsuar, shurup glukoze, shurup sheqeri i invertuar, vaj palme, gjalpë (QUMËSHT), sheqer, emulsifikues (E471), stabilizues (pektinë), kripë, aromë natyrale), çokollatë qumështi (15%) (sheqer, gjalpë kakaoje, QUMËSHT i skremuar pluhur, masë kakaoje, laktozë dhe proteinë hirre (QUMËSHT), yndyrë palme, hirrë pluhur (QUMËSHT), yndyrë qumështi (QUMËSHT), emulsifikues (lecitinë SOJE, E476), ekstrakt natyral vaniljeje), kolagjen i hidrolizuar (12%), lagështues (glicerol), frukto-oligosakarid, lagështues (maltitol), aroma, kakao pluhur me pak yndyrë, ekstrakt malti ELBI, '
  + N'kripë.

ALERGJENËT: Mund të përmbajë gjurmë të KIKIRIKËVE, BAJAMEVE, LAJTHIVE dhe ARRAVE PEKAN.

Informacione ushqyese për MARS HI PROTEIN BAR'
WHERE Variant_Id IN (1423,1424) AND HASHBYTES('SHA2_256', Ingredients) = 0x64E1EAB5597411DD75D2E089D48DA11F6730A8A6601D6AEAA2C5F5CA8C2FFCA8;
SET @n += @@ROWCOUNT;
-- item 107
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Active component: bioactive hydrolysed collagen peptide.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësi aktiv: peptid bioaktiv i kolagjenit të hidrolizuar.'
WHERE Variant_Id IN (1505,1506) AND HASHBYTES('SHA2_256', Ingredients) = 0x905BC7CB4AE33B9EBE20B6E4988E91F8A6EA4438D495CA9802E969EA91848DD7;
SET @n += @@ROWCOUNT;
-- item 108
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DARK CHOCOLATE BROWNIE

INGREDIENTS: EGG WHITE (27%), vegetable oil (15%) (sunflower and SOY), dark chocolate cream (15%): (sweetener: isomalt, vegetable oil (sunflower and coconut), MILK protein, skimmed MILK powder, fat-reduced cocoa powder (5%), HAZELNUT paste 4%, emulsifier (sunflower lecithin), chocolate and vanilla flavouring), sweetener: erythritol, ALMOND flour (9%), WHEAT GLUTEN (5%), WHEY PROTEIN concentrate (5%), chocolate pieces (5%): (sugar, cocoa mass, cocoa butter, emulsifier E322, natural vanilla flavouring), emulsifiers: sodium bicarbonate, sodium pyrophosphate.

May also contain other nuts.

Nutrition information for PROTEINI.SI PROTEIN BROWNIE (DARK CHOCOLATE BROWNIE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BROWNIE ME ÇOKOLLATË TË ZEZË

PËRBËRËSIT: E BARDHË VEZE (27%), vaj bimor (15%) (luledielli dhe SOJE), krem çokollate të zezë (15%): (ëmbëlsues: izomalt, vaj bimor (luledielli dhe kokosi), proteinë QUMËSHTI, QUMËSHT i skremuar pluhur, kakao pluhur me pak yndyrë (5%), pastë LAJTHIE 4%, emulsifikues (lecitinë luledielli), aromë çokollate dhe vaniljeje), ëmbëlsues: eritritol, miell BAJAMESH (9%), GLUTEN GRURI (5%), koncentrat i PROTEINËS SË HIRRËS (5%), copa çokollate (5%): (sheqer, masë kakaoje, gjalpë kakaoje, emulsifikues E322, aromë natyrale vaniljeje), emulsifikues: bikarbonat natriumi, pirofosfat natriumi.

Mund të përmbajë edhe fruta të tjera me lëvozhgë.

Informacione ushqyese për PROTEINI.SI PROTEIN BROWNIE (BROWNIE ME ÇOKOLLATË TË ZEZË)'
WHERE Variant_Id IN (1515,1517) AND HASHBYTES('SHA2_256', Ingredients) = 0x42E8179022EF099564A290CB508FC403BA0CA2A8608E2CA64CA7DB6143AE3408;
SET @n += @@ROWCOUNT;
-- item 109
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE BROWNIE WITH WHITE CHOCOLATE CHUNKS

INGREDIENTS: EGG WHITE (27%), vegetable oil (15%) (sunflower and SOY), dark chocolate cream (15%): (sweetener: isomalt, vegetable oil (sunflower and coconut), MILK protein, skimmed MILK powder, fat-reduced cocoa powder (5%), HAZELNUT paste 4%, emulsifier (sunflower lecithin), chocolate and vanilla flavouring), sweetener: erythritol, ALMOND flour (9%), WHEAT GLUTEN (5%), WHEY PROTEIN concentrate (5%), white chocolate pieces (5%): (cocoa butter, whole MILK powder (25%), sweetener: erythritol, skimmed MILK powder (10%), inulin, emulsifier (lecithins), natural vanilla flavouring), emulsifiers: sodium bicarbonate, sodium pyrophosphate.

May also contain other nuts.

Nutrition information for PROTEINI.SI PROTEIN BROWNIE (CHOCOLATE BROWNIE WITH WHITE CHOCOLATE CHUNKS)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BROWNIE ME ÇOKOLLATË ME COPA ÇOKOLLATE TË BARDHË

PËRBËRËSIT: E BARDHË VEZE (27%), vaj bimor (15%) (luledielli dhe SOJE), krem çokollate të zezë (15%): (ëmbëlsues: izomalt, vaj bimor (luledielli dhe kokosi), proteinë QUMËSHTI, QUMËSHT i skremuar pluhur, kakao pluhur me pak yndyrë (5%), pastë LAJTHIE 4%, emulsifikues (lecitinë luledielli), aromë çokollate dhe vaniljeje), ëmbëlsues: eritritol, miell BAJAMESH (9%), GLUTEN GRURI (5%), koncentrat i PROTEINËS SË HIRRËS (5%), copa çokollate të bardhë (5%): (gjalpë kakaoje, QUMËSHT i plotë pluhur (25%), ëmbëlsues: eritritol, QUMËSHT i skremuar pluhur (10%), inulinë, emulsifikues (lecitina), aromë natyrale vaniljeje), emulsifikues: bikarbonat natriumi, pirofosfat natriumi.

Mund të përmbajë edhe fruta të tjera me lëvozhgë.

Informacione ushqyese për PROTEINI.SI PROTEIN BROWNIE (BROWNIE ME ÇOKOLLATË ME '
  + N'COPA ÇOKOLLATE TË BARDHË)'
WHERE Variant_Id IN (1516,1518) AND HASHBYTES('SHA2_256', Ingredients) = 0x7CFB2A5ED260A3AFB0C7B800D4C605673703AC14879DB2470CF02B7F9D1F09DC;
SET @n += @@ROWCOUNT;
-- item 110
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE AND ORANGE

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, fat-reduced cocoa powder, instant MILK powder, maltodextrin, flavouring, L-leucine, salt, thickener: xanthan gum, natural flavouring, sweetener: sucralose, lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (CHOCOLATE AND ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË DHE PORTOKALL

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, kakao pluhur me pak yndyrë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, kripë, trashës: gomë ksantani, aromë natyrale, ëmbëlsues: sukralozë, enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (ÇOKOLLATË DHE PORTOKALL)'
WHERE Variant_Id IN (1522,1523) AND HASHBYTES('SHA2_256', Ingredients) = 0x8A87FB84798D4A534C786B0C83C6BB4785CBCD7AF5FB8E91F41D356F7BE62707;
SET @n += @@ROWCOUNT;
-- item 111
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: protein blend (49%) (hydrolysed collagen (bovine), MILK protein, SOY protein isolate), humectant (glycerol), chocolate coating with maltitol (13%) (cocoa mass, sweetener [maltitol], cocoa butter, emulsifier [sunflower lecithin], natural vanilla flavouring), palm fat, chocolate SOY protein pieces (2%) (SOY protein isolate, cocoa, tapioca starch), flavouring, fat-reduced cocoa powder (1.5%), inulin, salt, emulsifier (sunflower lecithin), sweetener (sucralose), antioxidant (DL-alpha-tocopherol).

May contain traces of EGGS and NUTS.

Excessive consumption may have a laxative effect.

Nutrition information for IRONMAXX ZENITH PROTEIN BAR (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: përzierje proteinash (49%) (kolagjen i hidrolizuar (gjedhi), proteinë QUMËSHTI, izolat i proteinës së SOJES), lagështues (glicerol), veshje çokollate me maltitol (13%) (masë kakaoje, ëmbëlsues [maltitol], gjalpë kakaoje, emulsifikues [lecitinë luledielli], aromë natyrale vaniljeje), yndyrë palme, copa çokollate me proteinë SOJE (2%) (izolat i proteinës së SOJES, kakao, niseshte tapioke), aromë, kakao pluhur me pak yndyrë (1,5%), inulinë, kripë, emulsifikues (lecitinë luledielli), ëmbëlsues (sukralozë), antioksidant (DL-alfa-tokoferol).

Mund të përmbajë gjurmë të VEZËVE dhe FRUTAVE ME LËVOZHGË.

Konsumimi i tepërt mund të ketë efekt laksativ.

Informacione ushqyese për IRONMAXX ZENITH PROTEIN BAR (ÇOKOLLATË)'
WHERE Variant_Id IN (1524,1525) AND HASHBYTES('SHA2_256', Ingredients) = 0xD28A5B8B7B64EBFA087BE19302928CABDF20E9F0F2078282666A13410F62C061;
SET @n += @@ROWCOUNT;
-- item 112
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRACCIATELLA

INGREDIENTS: MILK protein blend (MILK protein, MILK protein concentrate), hydrolysed collagen (bovine), dark chocolate coating with maltitol (16.5%) (sweetener (maltitol), cocoa butter, cocoa mass, highly fat-reduced cocoa powder, emulsifier (lecithins)), humectant (glycerol), rapeseed oil, SOY crispy pieces (4%) (SOY protein isolate, tapioca starch, salt), cocoa nib pieces (1.8%), emulsifier (lecithins), flavouring, antioxidant (alpha-tocopherol), sweetener (steviol glycosides from stevia).

May contain traces of PEANUTS and NUTS.

Nutrition information for IRONMAXX ZENITH PROTEIN BAR (STRACCIATELLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'STRAÇATELA

PËRBËRËSIT: përzierje proteinash QUMËSHTI (proteinë QUMËSHTI, koncentrat i proteinës së QUMËSHTIT), kolagjen i hidrolizuar (gjedhi), veshje çokollate të zezë me maltitol (16,5%) (ëmbëlsues (maltitol), gjalpë kakaoje, masë kakaoje, kakao pluhur me shumë pak yndyrë, emulsifikues (lecitina)), lagështues (glicerol), vaj rapsi, copa krokante SOJE (4%) (izolat i proteinës së SOJES, niseshte tapioke, kripë), copa kokrrash kakaoje (1,8%), emulsifikues (lecitina), aromë, antioksidant (alfa-tokoferol), ëmbëlsues (glikozide steviolike nga stevia).

Mund të përmbajë gjurmë të KIKIRIKËVE dhe FRUTAVE ME LËVOZHGË.

Informacione ushqyese për IRONMAXX ZENITH PROTEIN BAR (STRAÇATELA)'
WHERE Variant_Id IN (1526,1527) AND HASHBYTES('SHA2_256', Ingredients) = 0xD7F7B921CA69FA633485BFFA68C21BBDAF90C1FA39BB8BE3CE563248520A698C;
SET @n += @@ROWCOUNT;
-- item 113
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PISTACHIO

INGREDIENTS: wholegrain OAT blend 43.1% (fine OAT flakes, jumbo OAT flakes, OAT flour), margarine [vegetable oils (palm, rapeseed, coconut, partially hydrogenated palm oil – in varying proportions), water, emulsifiers (mono- and diglycerides of fatty acids, lecithins), acidity regulator (citric acid), flavouring, colour (carotenes)], cocoa-MILK coating 15% [sugar, partially and fully hydrogenated vegetable fat (palm kernel oil), sweet WHEY powder (MILK), fat-reduced cocoa powder, whole MILK powder, emulsifiers (E492, sunflower lecithin), flavourings], glucose-fructose syrup, demerara sugar, PISTACHIO pieces 3.4%, iodised salt (salt, potassium iodate), flavourings.

May contain SOY and other NUTS.

Nutrition information for PROTEINI.SI OAT CAKE (PISTACHIO)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'FISTIK

PËRBËRËSIT: përzierje TËRSHËRE integrale 43,1% (flokë TËRSHËRE të imëta, flokë TËRSHËRE të mëdha, miell TËRSHËRE), margarinë [vajra bimore (palme, rapsi, kokosi, vaj palme pjesërisht i hidrogjenizuar – në përpjesëtime të ndryshme), ujë, emulsifikues (mono- dhe digliceride të acideve yndyrore, lecitina), rregullues aciditeti (acid citrik), aromë, ngjyrues (karotene)], veshje kakao-QUMËSHTI 15% [sheqer, yndyrë bimore pjesërisht dhe plotësisht e hidrogjenizuar (vaj bërthame palme), HIRRË e ëmbël pluhur (QUMËSHT), kakao pluhur me pak yndyrë, QUMËSHT i plotë pluhur, emulsifikues (E492, lecitinë luledielli), aroma], shurup glukozë-fruktozë, sheqer demerara, copa FISTIKU 3,4%, kripë e jodizuar (kripë, jodat kaliumi), aroma.

Mund të përmbajë SOJE dhe FRUTA TË TJERA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI OAT CAKE (FISTIK)'
WHERE Variant_Id IN (1531,1532) AND HASHBYTES('SHA2_256', Ingredients) = 0x3D21443BD43C0634B34F63BBE5409435B8D0496B8CB7A637511812CD024AB4B5;
SET @n += @@ROWCOUNT;
-- item 114
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: ORIGINAL

INGREDIENTS: water, taurine, acidity regulators (trisodium citrate, citric acid, malic acid), L-carnitine tartrate, flavouring, vitamin B3 (niacinamide), preservatives (potassium sorbate, sodium benzoate), sweeteners (sucralose, acesulfame K), caffeine anhydrous, antifoaming agent (E436), calcium D-pantothenate, cyanocobalamin, vitamin B6 (pyridoxine hydrochloride).

Produced in a facility that processes products containing SOY, NUTS (PEANUTS), GLUTEN (WHEAT AND OATS), MILK and FISH.

Nutrition information for USN QHUSH ENERGY (ORIGINAL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ORIGINAL

PËRBËRËSIT: ujë, taurinë, rregullues aciditeti (citrat trinatriumi, acid citrik, acid malik), L-karnitinë tartrat, aromë, vitamina B3 (niacinamid), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë, acesulfam K), kafeinë anhidre, agjent kundër shkumës (E436), D-pantotenat kalciumi, cianokobalaminë, vitamina B6 (piridoksinë hidroklorur).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë SOJE, FRUTA ME LËVOZHGË (KIKIRIKË), GLUTEN (GRURË DHE TËRSHËRË), QUMËSHT dhe PESHK.

Informacione ushqyese për USN QHUSH ENERGY (ORIGINAL)'
WHERE Variant_Id IN (1556,1557) AND HASHBYTES('SHA2_256', Ingredients) = 0xF95CCF1C13B68497533479D579DE6965A2FA306D7111A224D51DEDF25EF20F07;
SET @n += @@ROWCOUNT;
-- item 115
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: HAVANA JUICY

INGREDIENTS: water, acidity regulators (citric acid, malic acid, trisodium citrate), taurine, flavourings, L-carnitine tartrate, vitamin B3 (niacinamide), preservatives (potassium sorbate, sodium benzoate), caffeine anhydrous, sweeteners (sucralose, acesulfame K), antifoaming agent (E436), cyanocobalamin (vitamin B12), calcium D-pantothenate (vitamin B5), colours (quinoline yellow*, brilliant blue), vitamin B6 (pyridoxine hydrochloride).

*Quinoline yellow may have an adverse effect on activity and attention in children.

Produced in a facility that processes products containing SOY, NUTS (PEANUTS), OATS AND WHEAT (GLUTEN), MILK and FISH.

Nutrition information for USN QHUSH ENERGY (HAVANA JUICY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: HAVANA JUICY

PËRBËRËSIT: ujë, rregullues aciditeti (acid citrik, acid malik, citrat trinatriumi), taurinë, aroma, L-karnitinë tartrat, vitamina B3 (niacinamid), konservues (sorbat kaliumi, benzoat natriumi), kafeinë anhidre, ëmbëlsues (sukralozë, acesulfam K), agjent kundër shkumës (E436), cianokobalaminë (vitamina B12), D-pantotenat kalciumi (vitamina B5), ngjyrues (e verdhë kinoline*, blu brilante), vitamina B6 (piridoksinë hidroklorur).

*E verdha kinoline mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë SOJE, FRUTA ME LËVOZHGË (KIKIRIKË), TËRSHËRË DHE GRURË (GLUTEN), QUMËSHT dhe PESHK.

Informacione ushqyese për USN QHUSH ENERGY (HAVANA JUICY)'
WHERE Variant_Id IN (1558,1559) AND HASHBYTES('SHA2_256', Ingredients) = 0x0929BCCA7173EAEA81E6DA7D9A1EE0DA156E9E42B9CB4A7071FE86F5F94998F5;
SET @n += @@ROWCOUNT;
-- item 116
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: ELECTRIC BLUE GAMING

INGREDIENTS: carbonated water, acids (citric acid, malic acid), taurine, preservative (trisodium citrate), L-carnitine tartrate, flavouring, ascorbic acid (vitamin C), caffeine anhydrous, L-theanine, niacinamide (vitamin B3), ginseng extract (Panax ginseng) 5:1, preservatives (potassium sorbate, sodium benzoate), sweeteners (sucralose, acesulfame K), antifoaming agent, pyridoxine hydrochloride (vitamin B6), calcium D-pantothenate (vitamin B5), cyanocobalamin (vitamin B12).

Produced in a facility that processes products containing SOY, NUTS (PEANUTS), OATS AND WHEAT (GLUTEN), MILK and FISH.

Nutrition information for USN QHUSH ENERGY (ELECTRIC BLUE GAMING)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ELECTRIC BLUE GAMING

PËRBËRËSIT: ujë i gazuar, acide (acid citrik, acid malik), taurinë, konservues (citrat trinatriumi), L-karnitinë tartrat, aromë, acid askorbik (vitamina C), kafeinë anhidre, L-teaninë, niacinamid (vitamina B3), ekstrakt xhenseni (Panax ginseng) 5:1, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë, acesulfam K), agjent kundër shkumës, piridoksinë hidroklorur (vitamina B6), D-pantotenat kalciumi (vitamina B5), cianokobalaminë (vitamina B12).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë SOJE, FRUTA ME LËVOZHGË (KIKIRIKË), TËRSHËRË DHE GRURË (GLUTEN), QUMËSHT dhe PESHK.

Informacione ushqyese për USN QHUSH ENERGY (ELECTRIC BLUE GAMING)'
WHERE Variant_Id IN (1560,1561) AND HASHBYTES('SHA2_256', Ingredients) = 0x200F03EE54F3F2DC7FA7F89BD45378393C437232A5CA2851C78119AA1FF32D1A;
SET @n += @@ROWCOUNT;
-- item 117
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: GLACIER

INGREDIENTS: water, taurine, acidity regulator (trisodium citrate), acids (citric acid, malic acid), flavouring, L-carnitine tartrate, caffeine anhydrous, N-acetyl L-tyrosine, niacinamide (vitamin B3), ginseng extract (Panax ginseng) 5:1, preservatives (potassium sorbate, sodium benzoate), sweeteners (sucralose, acesulfame K), L-theanine, phosphatidylserine 20%, pyridoxine hydrochloride (vitamin B6), calcium D-pantothenate (vitamin B5), cyanocobalamin (vitamin B12).

Produced in a facility that processes products containing SOY, NUTS (PEANUTS), GLUTEN (OATS), MILK and FISH.

Nutrition information for USN QHUSH ENERGY (GLACIER)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: GLACIER

PËRBËRËSIT: ujë, taurinë, rregullues aciditeti (citrat trinatriumi), acide (acid citrik, acid malik), aromë, L-karnitinë tartrat, kafeinë anhidre, N-acetil L-tirozinë, niacinamid (vitamina B3), ekstrakt xhenseni (Panax ginseng) 5:1, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (sukralozë, acesulfam K), L-teaninë, fosfatidilserinë 20%, piridoksinë hidroklorur (vitamina B6), D-pantotenat kalciumi (vitamina B5), cianokobalaminë (vitamina B12).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë SOJE, FRUTA ME LËVOZHGË (KIKIRIKË), GLUTEN (TËRSHËRË), QUMËSHT dhe PESHK.

Informacione ushqyese për USN QHUSH ENERGY (GLACIER)'
WHERE Variant_Id IN (1562,1563) AND HASHBYTES('SHA2_256', Ingredients) = 0x0B211F71538F4D3C1B04C53F5E757825B67CED25ABF220E6615FD1FD64521BCF;
SET @n += @@ROWCOUNT;
-- item 118
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: MILK CHOCOLATE AND CARAMEL

INGREDIENTS: milk chocolate 26% (sweetener: maltitol, cocoa butter, whole MILK powder, cocoa mass, emulsifier: lecithins (SOY), natural flavouring), milk protein (MILK), hydrolysed collagen, humectant: glycerol, water, cocoa and SOY crispy pieces (SOY protein, cocoa powder, tapioca starch), bulking agent: polydextrose, SOY protein, palm oil, sweetener: maltitol, cocoa butter, fat-reduced cocoa powder, whole MILK powder, flavourings, emulsifier: lecithins (SOY).

ALLERGENS: May contain cereals containing GLUTEN, PEANUTS and NUTS.

Nutrition information for PROTEINI.SI CRUNCH WHEY BAR (MILK CHOCOLATE AND CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË QUMËSHTI DHE KARAMEL

PËRBËRËSIT: çokollatë qumështi 26% (ëmbëlsues: maltitol, gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues: lecitina (SOJE), aromë natyrale), proteinë qumështi (QUMËSHT), kolagjen i hidrolizuar, lagështues: glicerol, ujë, copa krokante kakaoje dhe SOJE (proteinë SOJE, kakao pluhur, niseshte tapioke), agjent për rritjen e vëllimit: polidekstrozë, proteinë SOJE, vaj palme, ëmbëlsues: maltitol, gjalpë kakaoje, kakao pluhur me pak yndyrë, QUMËSHT i plotë pluhur, aroma, emulsifikues: lecitina (SOJE).

ALERGJENËT: Mund të përmbajë drithëra që përmbajnë GLUTEN, KIKIRIKË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI CRUNCH WHEY BAR (ÇOKOLLATË QUMËSHTI DHE KARAMEL)'
WHERE Variant_Id IN (1616,1617) AND HASHBYTES('SHA2_256', Ingredients) = 0x5E7DF665FF5AB77BCD3020ECD419EE61795237DAD493DEF8F0E687C323FE47FD;
SET @n += @@ROWCOUNT;
-- item 119
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CARAMEL AND COOKIE DOUGH

Ingredients: milk chocolate 26% (sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins (SOY)), natural flavouring), MILK proteins, humectant (glycerol), hydrolysed collagen, cocoa SOY crispy pieces (SOY protein, cocoa powder, tapioca starch), water, bulking agent (polydextrose), SOY protein, sweetener (maltitol), palm oil, cocoa butter, whole MILK powder, flavourings, cocoa mass, emulsifier (lecithins (SOY)).

May contain cereals containing GLUTEN, PEANUTS and NUTS.

Nutrition information for PROTEINI.SI CRUNCH WHEY BAR (Caramel and cookie dough)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KARAMEL DHE BRUMË BISKOTASH

Përbërësit: çokollatë qumështi 26% (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina (SOJE)), aromë natyrale), proteina QUMËSHTI, lagështues (glicerol), kolagjen i hidrolizuar, copa krokante kakaoje me SOJE (proteinë SOJE, kakao pluhur, niseshte tapioke), ujë, agjent për rritjen e vëllimit (polidekstrozë), proteinë SOJE, ëmbëlsues (maltitol), vaj palme, gjalpë kakaoje, QUMËSHT i plotë pluhur, aroma, masë kakaoje, emulsifikues (lecitina (SOJE)).

Mund të përmbajë drithëra që përmbajnë GLUTEN, KIKIRIKË dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për PROTEINI.SI CRUNCH WHEY BAR (Karamel dhe brumë biskotash)'
WHERE Variant_Id IN (1618,1619) AND HASHBYTES('SHA2_256', Ingredients) = 0x69C3E573A5B5615F8BD28EAE015A80CF09E70CF79D24569B9300A2E29AA60710;
SET @n += @@ROWCOUNT;
-- item 120
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: milk chocolate (50%) [cocoa butter, MILK proteins, sweeteners (maltitol, erythritol), cocoa mass, skimmed MILK powder, anhydrous MILK fat, emulsifier (sunflower lecithin), vanilla extract, salt], salted peanut filling [MILK proteins, PEANUT butter (18%), sweetener (erythritol), shea butter, resistant dextrin, vegetable oils (coconut oil, sunflower oil), whole MILK powder, emulsifier (sunflower lecithin), salt, natural PEANUT flavouring].

The milk chocolate contains: cocoa solids – at least 53%. Milk solids – at least 14%.

ALLERGENS: May contain SOY and NUTS, including ALMONDS, HAZELNUTS, WALNUTS, CASHEWS, PECAN NUTS, BRAZIL NUTS, PISTACHIOS and MACADAMIA NUTS.

Nutrition information for NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: çokollatë qumështi (50%) [gjalpë kakaoje, proteina QUMËSHTI, ëmbëlsues (maltitol, eritritol), masë kakaoje, QUMËSHT i skremuar pluhur, yndyrë QUMËSHTI anhidre, emulsifikues (lecitinë luledielli), ekstrakt vaniljeje, kripë], mbushje kikiriku të kripur [proteina QUMËSHTI, gjalpë KIKIRIKU (18%), ëmbëlsues (eritritol), gjalpë shea, dekstrinë rezistente, vajra bimore (vaj kokosi, vaj luledielli), QUMËSHT i plotë pluhur, emulsifikues (lecitinë luledielli), kripë, aromë natyrale KIKIRIKU].

Çokollata e qumështit përmban: lëndë kakaoje – të paktën 53%. Lëndë qumështi – të paktën 14%.

ALERGJENËT: Mund të përmbajë SOJE dhe FRUTA ME LËVOZHGË, përfshirë BAJAME, LAJTHI, ARRA, SHQEME, ARRA PEKAN, ARRA BRAZILIANE, FISTIKË dhe ARRA MAKADAMIA.

Informacione ushqyese për NÄNO SUPPS PROTEIN PEANUT BUTTER CUPS'
WHERE Variant_Id IN (1625,1626) AND HASHBYTES('SHA2_256', Ingredients) = 0x519E30FD3A9D6EEA1770F8C5468F43F895AB5DEE2C3CF584DC1946FEE5D6D76E;
SET @n += @@ROWCOUNT;
-- item 121
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: 100% micronised creatine monohydrate.

Contains no common allergens.

Nutrition information for APPLIED NUTRITION CREATINE (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: 100% kreatinë monohidrat e mikronizuar.

Nuk përmban alergjenë të zakonshëm.

Informacione ushqyese për APPLIED NUTRITION CREATINE (PA SHIJE)'
WHERE Variant_Id IN (1628,1629) AND HASHBYTES('SHA2_256', Ingredients) = 0x04876F06C76B6F79FD06EC89E507F6CC8BB19FE967A5E0069C63B6C309EF4AE2;
SET @n += @@ROWCOUNT;
-- item 122
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

CHOCOLATE MILKSHAKE

INGREDIENTS: protein blend [whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), milk protein concentrate (MILK)], cocoa powder, flavouring, salt, thickeners (carboxymethyl cellulose, guar gum), emulsifier (sunflower lecithin), sweetener (sucralose).

Nutrition information for APPLIED NUTRITION CRITICAL WHEY PROTEIN (CHOCOLATE MILKSHAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

MILKSHAKE ME ÇOKOLLATË

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT)], kakao pluhur, aromë, kripë, trashës (karboksimetil celulozë, gomë guar), emulsifikues (lecitinë luledielli), ëmbëlsues (sukralozë).

Informacione ushqyese për APPLIED NUTRITION CRITICAL WHEY PROTEIN (MILKSHAKE ME ÇOKOLLATË)'
WHERE Variant_Id IN (1630,1631) AND HASHBYTES('SHA2_256', Ingredients) = 0xC9AC53B4D93BAF6308262427C59A737C047EAEC1D42E6472EB5D0A63A66A4C37;
SET @n += @@ROWCOUNT;
-- item 123
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

VANILLA ICE CREAM

INGREDIENTS: protein blend [whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), milk protein concentrate (MILK)], flavouring, salt, emulsifier (sunflower lecithin), thickeners (carboxymethyl cellulose, guar gum), sweetener (sucralose).

Nutrition information for APPLIED NUTRITION CRITICAL WHEY PROTEIN (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

AKULLORE VANILJE

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT)], aromë, kripë, emulsifikues (lecitinë luledielli), trashës (karboksimetil celulozë, gomë guar), ëmbëlsues (sukralozë).

Informacione ushqyese për APPLIED NUTRITION CRITICAL WHEY PROTEIN (AKULLORE VANILJE)'
WHERE Variant_Id IN (1632,1633) AND HASHBYTES('SHA2_256', Ingredients) = 0x178763647E9FE97135956D91E6BD4C5D4B9858B51CDF834272F4B63A8A6E2A0B;
SET @n += @@ROWCOUNT;
-- item 124
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

COOKIES AND CREAM

INGREDIENTS: protein blend [whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), milk protein concentrate (MILK)], flavourings, salt, colour (plain caramel), emulsifier (sunflower lecithin), thickeners (carboxymethyl cellulose, guar gum), sweetener (sucralose).

Nutrition information for APPLIED NUTRITION CRITICAL WHEY PROTEIN (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

BISKOTA DHE KREM

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT)], aroma, kripë, ngjyrues (karamel i thjeshtë), emulsifikues (lecitinë luledielli), trashës (karboksimetil celulozë, gomë guar), ëmbëlsues (sukralozë).

Informacione ushqyese për APPLIED NUTRITION CRITICAL WHEY PROTEIN (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1634,1635) AND HASHBYTES('SHA2_256', Ingredients) = 0xDA76C75CBB7E041891FB1A8FA86ECB55E898BECD30E8888C10F4AF35C414094F;
SET @n += @@ROWCOUNT;
-- item 125
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

SALTED CARAMEL

INGREDIENTS: protein blend [whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), milk protein concentrate (MILK)], salt, flavouring, emulsifier (sunflower lecithin), thickeners (carboxymethyl cellulose, guar gum), sweetener (sucralose), colour (caramel).

Nutrition information for APPLIED NUTRITION CRITICAL WHEY PROTEIN (SALTED CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

KARAMEL I KRIPUR

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT)], kripë, aromë, emulsifikues (lecitinë luledielli), trashës (karboksimetil celulozë, gomë guar), ëmbëlsues (sukralozë), ngjyrues (karamel).

Informacione ushqyese për APPLIED NUTRITION CRITICAL WHEY PROTEIN (KARAMEL I KRIPUR)'
WHERE Variant_Id IN (1636,1637) AND HASHBYTES('SHA2_256', Ingredients) = 0x8DC6AB7BD725BA2A2F63F6C3D8CB7240A3565113C20A04AA77AE7342E57CBFAC;
SET @n += @@ROWCOUNT;
-- item 126
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

STRAWBERRY MILKSHAKE

INGREDIENTS: protein blend [whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), milk protein concentrate (MILK)], flavouring, salt, thickeners (carboxymethyl cellulose, guar gum), emulsifier (sunflower lecithin), colour (beetroot red), sweetener (sucralose).

Nutrition information for APPLIED NUTRITION CRITICAL WHEY PROTEIN (STRAWBERRY MILKSHAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

MILKSHAKE ME LULESHTRYDHE

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT)], aromë, kripë, trashës (karboksimetil celulozë, gomë guar), emulsifikues (lecitinë luledielli), ngjyrues (e kuqe panxhari), ëmbëlsues (sukralozë).

Informacione ushqyese për APPLIED NUTRITION CRITICAL WHEY PROTEIN (MILKSHAKE ME LULESHTRYDHE)'
WHERE Variant_Id IN (1638,1639) AND HASHBYTES('SHA2_256', Ingredients) = 0x33B8C802542FBC2BE7A2EDC0636907DC7A93E40753362280100ED3C07093DC8E;
SET @n += @@ROWCOUNT;
-- item 127
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

LIME

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: copper complexes of chlorophylls and chlorophyllins, curcumin.

Nutrition information for BOLERO (LIME)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

LIME

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: komplekse bakri të klorofileve dhe klorofilinave, kurkuminë.

Informacione ushqyese për BOLERO (LIME)'
WHERE Variant_Id IN (1651,1652) AND HASHBYTES('SHA2_256', Ingredients) = 0x5F4E97C7D05EAF9E3F99579CB9BFCC298B754CC3FA74BF02C1568ADF3C38FEF5;
SET @n += @@ROWCOUNT;
-- item 128
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

APPLE

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: apple colouring concentrate.

Nutrition information for BOLERO (APPLE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

MOLLË

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: koncentrat ngjyrues nga molla.

Informacione ushqyese për BOLERO (MOLLË)'
WHERE Variant_Id IN (1653,1654) AND HASHBYTES('SHA2_256', Ingredients) = 0x244C30919BC46451D66FEBF6E59863C6F34ED173AAE692ADEED2D80C3F66968C;
SET @n += @@ROWCOUNT;
-- item 129
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

LEMON

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: curcumin.

Nutrition information for BOLERO (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

LIMON

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: kurkuminë.

Informacione ushqyese për BOLERO (LIMON)'
WHERE Variant_Id IN (1655,1656) AND HASHBYTES('SHA2_256', Ingredients) = 0x50DEF0DDDE9E13BBB4D7E63C3F1A3A6983B893308E67FC1CC9DE9CA9C69D2919;
SET @n += @@ROWCOUNT;
-- item 130
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

WATERMELON

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: carrot colouring concentrate.

Nutrition information for BOLERO (WATERMELON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

SHALQI

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: koncentrat ngjyrues nga karota.

Informacione ushqyese për BOLERO (SHALQI)'
WHERE Variant_Id IN (1657,1658) AND HASHBYTES('SHA2_256', Ingredients) = 0x16151C26B8E909D2130B9D63354FBAC0A3E11C2A28ECFF5A3F3FA79E4DA45B5E;
SET @n += @@ROWCOUNT;
-- item 131
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

ORANGE

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: beta-apo-8''-carotenal (C30).

Nutrition information for BOLERO (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

PORTOKALL

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: beta-apo-8''-karotenal (C30).

Informacione ushqyese për BOLERO (PORTOKALL)'
WHERE Variant_Id IN (1659,1660) AND HASHBYTES('SHA2_256', Ingredients) = 0xED49FA6AF5B474EDEA161792A6A742322EF814BA339B9BF3E35CBC71F8BD0BA9;
SET @n += @@ROWCOUNT;
-- item 132
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

PEACH ICED TEA

INGREDIENTS: acid: citric acid; black tea extract (22.5%); bulking agent: maltodextrin; flavouring; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C).

Nutrition information for BOLERO ICE TEA (PEACH ICED TEA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

ÇAJ I FTOHTË ME PJESHKË

PËRBËRËSIT: acid: acid citrik; ekstrakt çaji të zi (22,5%); agjent mbushës: maltodekstrinë; aromë; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C).

Informacione ushqyese për BOLERO ICE TEA (ÇAJ I FTOHTË ME PJESHKË)'
WHERE Variant_Id IN (1661,1662) AND HASHBYTES('SHA2_256', Ingredients) = 0xE12B25CDEF74237C71FBA8FDC11FF36C8C4C5CBFE31722ED1835842E62AEF2CF;
SET @n += @@ROWCOUNT;
-- item 133
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

STRAWBERRY

INGREDIENTS: acids: citric acid, malic acid; bulking agent: maltodextrin; flavourings; natural flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: trisodium citrate; anti-caking agent: tricalcium phosphate; thickeners: guar gum, gum arabic; L-ascorbic acid (vitamin C); colour: carrot colouring concentrate.

Nutrition information for BOLERO (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

LULESHTRYDHE

PËRBËRËSIT: acide: acid citrik, acid malik; agjent mbushës: maltodekstrinë; aroma; aroma natyrale; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat trinatriumi; agjent kundër ngjizjes: fosfat trikalciumi; trashës: gomë guar, gomë arabike; acid L-askorbik (vitamina C); ngjyrues: koncentrat ngjyrues nga karota.

Informacione ushqyese për BOLERO (LULESHTRYDHE)'
WHERE Variant_Id IN (1663,1664) AND HASHBYTES('SHA2_256', Ingredients) = 0x466048BBA7E917EB71C24712001BBA60980186F150621D1F7C54F58432747720;
SET @n += @@ROWCOUNT;
-- item 134
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

PEAR

INGREDIENTS: acids: citric acid, malic acid; inulin (plant fibre); flavourings; sweeteners: acesulfame K, sucralose, steviol glycosides (stevia extracts); acidity regulator: sodium citrate; anti-caking agent: calcium phosphate; thickeners: guar gum, gum arabic (acacia gum); L-ascorbic acid (vitamin C); colour: beta-carotene.

Nutrition information for BOLERO (PEAR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

DARDHË

PËRBËRËSIT: acide: acid citrik, acid malik; inulinë (fibër bimore); aroma; ëmbëlsues: acesulfam K, sukralozë, glikozide steviolike (ekstrakte stevie); rregullues aciditeti: citrat natriumi; agjent kundër ngjizjes: fosfat kalciumi; trashës: gomë guar, gomë arabike (gomë akacie); acid L-askorbik (vitamina C); ngjyrues: beta-karoten.

Informacione ushqyese për BOLERO (DARDHË)'
WHERE Variant_Id IN (1665,1667) AND HASHBYTES('SHA2_256', Ingredients) = 0x38845E5C940D04BF106AE0BC33241425ED3319D6A62A88988D24FEDE62D6505B;
SET @n += @@ROWCOUNT;
-- item 135
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CITRUS

Ingredients: hydrolysed collagen (type I and III) 45%, glycine 15%, glucosamine sulphate KCl (CRUSTACEANS) 10%, acids (citric acid, malic acid), inulin, chondroitin sulphate 5.6%, flavourings, MSM [methylsulfonylmethane, anti-caking agent (silicon dioxide)] 1.5%, sweeteners (sucralose, acesulfame K), L-ascorbic acid, thickener (xanthan gum), turmeric rhizome extract (Curcuma longa) 0.12%, colour (copper complexes of chlorophylls and chlorophyllins).

May contain traces of milk, eggs, gluten, soy, peanuts, nuts, celery, fish and sulphur dioxide.

Nutrition information for BATTERY COLLAGEN VITAL (CITRUS)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AGRUME

Përbërësit: kolagjen i hidrolizuar (tipi I dhe III) 45%, glicinë 15%, sulfat glukozamine KCl (KRUSTACE) 10%, acide (acid citrik, acid malik), inulinë, sulfat kondroitine 5,6%, aroma, MSM [metilsulfonilmetan, agjent kundër ngjizjes (dioksid silici)] 1,5%, ëmbëlsues (sukralozë, acesulfam K), acid L-askorbik, trashës (gomë ksantani), ekstrakt rizome shafrani të Indisë (Curcuma longa) 0,12%, ngjyrues (komplekse bakri të klorofileve dhe klorofilinave).

Mund të përmbajë gjurmë të qumështit, vezëve, glutenit, sojes, kikirikëve, frutave me lëvozhgë, selinos, peshkut dhe dioksidit të squfurit.

Informacione ushqyese për BATTERY COLLAGEN VITAL (AGRUME)'
WHERE Variant_Id IN (1026) AND HASHBYTES('SHA2_256', Ingredients) = 0xCDF9D01B5AE078FFB879351C496019701B226729D4E8CB6DE2FE47B2E31C99B1;
SET @n += @@ROWCOUNT;
-- item 136
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: Gymnema sylvestre extract, L-carnitine L-tartrate, caffeine anhydrous, green tea leaf extract (Camellia sinensis (L.) Kuntze), capsule (bovine gelatine, colour: yellow iron oxide), alpha-lipoic acid, coenzyme Q10, vitamin C (L-ascorbic acid), cinnamon powder, maltodextrin, vitamin B3 (nicotinamide), black pepper extract, chromium (chromium picolinate).

Produced in a facility that processes products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE BURNER',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ekstrakt Gymnema sylvestre, L-karnitinë L-tartrat, kafeinë anhidre, ekstrakt gjethesh çaji jeshil (Camellia sinensis (L.) Kuntze), kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), acid alfa-lipoik, koenzima Q10, vitamina C (acid L-askorbik), kanellë pluhur, maltodekstrinë, vitamina B3 (nikotinamid), ekstrakt piperi të zi, krom (pikolinat kromi).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE BURNER'
WHERE Variant_Id IN (1029) AND HASHBYTES('SHA2_256', Ingredients) = 0x0DE095E543072BAD2AE75D9FDE24E3FAE2AE7EDFFBABF9663D4361DDDBC680C3;
SET @n += @@ROWCOUNT;
-- item 137
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: maltodextrin, capsule (bovine gelatine, colour: yellow iron oxide), caffeine anhydrous.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY CAFFEINE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: maltodekstrinë, kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), kafeinë anhidre.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY CAFFEINE'
WHERE Variant_Id IN (1030) AND HASHBYTES('SHA2_256', Ingredients) = 0xA921683DD21D4BD229CC18EA05935D85FF927B886E4CD56E19F422AF615244F2;
SET @n += @@ROWCOUNT;
-- item 138
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'**INGREDIENTS:** L-carnitine tartrate, capsule (bovine gelatine, colour: yellow iron oxide), anti-caking agent: magnesium salts of fatty acids.

**Produced in a facility that manufactures products containing milk, eggs, gluten and soy.**

**Nutrition information for BATTERY CARNITINE 500**',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'**PËRBËRËSIT:** L-karnitinë tartrat, kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), agjent kundër ngjizjes: kripëra magnezi të acideve yndyrore.

**Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.**

**Informacione ushqyese për BATTERY CARNITINE 500**'
WHERE Variant_Id IN (1031) AND HASHBYTES('SHA2_256', Ingredients) = 0x9832B32D2E6D94FC0E8A45820F7B67B70AAFC38338E21553D5646B21E4CAFE32;
SET @n += @@ROWCOUNT;
-- item 139
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GRAPE

Ingredients: L-leucine, acidity regulator: citric acid, L-glutamine, magnesium salts of citric acid, maltodextrin, glycine, L-isoleucine, L-valine, L-taurine, flavouring: grape, L-lysine, sodium chloride, sweetener: sucralose, L-histidine, L-methionine, L-phenylalanine, L-threonine, L-tryptophan.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE AMINOS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'RRUSH

Përbërësit: L-leucinë, rregullues aciditeti: acid citrik, L-glutaminë, kripëra magnezi të acidit citrik, maltodekstrinë, glicinë, L-izoleucinë, L-valinë, L-taurinë, aromë: rrush, L-lizinë, klorur natriumi, ëmbëlsues: sukralozë, L-histidinë, L-metioninë, L-fenilalaninë, L-treoninë, L-triptofan.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE AMINOS'
WHERE Variant_Id IN (1033) AND HASHBYTES('SHA2_256', Ingredients) = 0x788AA7CBF5F1E8F3E032CBF2C7DAEA1FE188658032FAAAF07E0F75A47CA57559;
SET @n += @@ROWCOUNT;
-- item 140
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Tropical flavour

Ingredients: L-leucine, acidity regulator: citric acid, L-glutamine, magnesium salts of citric acid, maltodextrin, glycine, L-isoleucine, L-valine, L-taurine, flavouring: orange (contains colours: tartrazine* and sunset yellow FCF*), flavouring: pineapple, flavouring: lemon, L-lysine, sodium chloride, sweetener: sucralose, L-histidine, L-methionine, L-phenylalanine, L-threonine, L-tryptophan.

*May have an adverse effect on activity and attention in children.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE AMINOS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Shije tropikale

Përbërësit: L-leucinë, rregullues aciditeti: acid citrik, L-glutaminë, kripëra magnezi të acidit citrik, maltodekstrinë, glicinë, L-izoleucinë, L-valinë, L-taurinë, aromë: portokall (përmban ngjyrues: tartrazinë* dhe sunset yellow FCF*), aromë: ananas, aromë: limon, L-lizinë, klorur natriumi, ëmbëlsues: sukralozë, L-histidinë, L-metioninë, L-fenilalaninë, L-treoninë, L-triptofan.

*Mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE AMINOS'
WHERE Variant_Id IN (1034) AND HASHBYTES('SHA2_256', Ingredients) = 0xC05AF1E49E3C070339CE34AD7D8358FC20585874B6EAF6F72FD61F96CE6B8FF0;
SET @n += @@ROWCOUNT;
-- item 141
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: maltodextrin, milk protein concentrate (contains milk protein), whey protein concentrate (contains milk protein), milk powder, fat-reduced cocoa powder, creatine monohydrate, flavouring: chocolate flavour, thickener: xanthan gum, sweetener: sucralose.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: maltodekstrinë, koncentrat i proteinave të qumështit (përmban proteinë qumështi), koncentrat i proteinave të hirrës (përmban proteinë qumështi), qumësht pluhur, kakao pluhur me pak yndyrë, kreatinë monohidrat, aromë: aromë çokollate, trashës: gomë ksantani, ëmbëlsues: sukralozë.'
WHERE Variant_Id IN (1038) AND HASHBYTES('SHA2_256', Ingredients) = 0x3074833A0CFCE09FB5246A30A79D4D89514B00A30252E8ADB9BB7EBD2CB7FA5A;
SET @n += @@ROWCOUNT;
-- item 142
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: maltodextrin, milk protein concentrate (contains milk protein), whey protein concentrate (contains milk protein), milk powder, creatine monohydrate, flavouring: cookie flavour, thickener: xanthan gum, flavouring: caramel flavour, sweetener: sucralose.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: maltodekstrinë, koncentrat i proteinës së qumështit (përmban proteinë qumështi), koncentrat i proteinës së hirrës (përmban proteinë qumështi), qumësht pluhur, kreatinë monohidrat, aromë: aromë biskotash, trashës: gomë ksantani, aromë: aromë karameli, ëmbëlsues: sukralozë.'
WHERE Variant_Id IN (1039) AND HASHBYTES('SHA2_256', Ingredients) = 0xA9A7DB4028B4C57107999678C4C105772CA69B6D6F3A93DD02943C22A44BCD6A;
SET @n += @@ROWCOUNT;
-- item 143
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PINK GRAPEFRUIT

Ingredients: acidity regulator: citric acid, magnesium salts of citric acid, calcium carbonate, potassium salts of orthophosphoric acid, sodium citrate, maltodextrin, sodium chloride, flavouring: grapefruit, L-ascorbic acid, sweetener: sucralose, flavouring: lemon, zinc oxide, colour: tartrazine*. *Tartrazine may have an adverse effect on activity and attention in children.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE HYDRATION',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'GREJPFRUT ROZË

Përbërësit: rregullues aciditeti: acid citrik, kripëra magnezi të acidit citrik, karbonat kalciumi, kripëra kaliumi të acidit ortofosforik, citrat natriumi, maltodekstrinë, klorur natriumi, aromë: grejpfrut, acid L-askorbik, ëmbëlsues: sukralozë, aromë: limon, oksid zinku, ngjyrues: tartrazinë*. *Tartrazina mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE HYDRATION'
WHERE Variant_Id IN (1041) AND HASHBYTES('SHA2_256', Ingredients) = 0x9BA2440A9D95B9862DC6C0B2657631748694CCDB1B3CAB891023C1DAD5D2C3B7;
SET @n += @@ROWCOUNT;
-- item 144
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHERRY AND BERRIES

Ingredients: acidity regulator: citric acid, magnesium salts of citric acid, calcium carbonate, potassium salts of orthophosphoric acid, sodium citrate, maltodextrin, sodium chloride, flavouring: strawberry, L-ascorbic acid, flavouring: cherry, sweetener: sucralose, zinc oxide, colour: Allura red AC*. *Allura red AC may have an adverse effect on activity and attention in children.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE HYDRATION',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'QERSHI DHE MANAFERRA

Përbërësit: rregullues aciditeti: acid citrik, kripëra magnezi të acidit citrik, karbonat kalciumi, kripëra kaliumi të acidit ortofosforik, citrat natriumi, maltodekstrinë, klorur natriumi, aromë: luleshtrydhe, acid L-askorbik, aromë: qershi, ëmbëlsues: sukralozë, oksid zinku, ngjyrues: Allura red AC*. *Allura red AC mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE HYDRATION'
WHERE Variant_Id IN (1042) AND HASHBYTES('SHA2_256', Ingredients) = 0xDBE862FD1FDE05723622A342B8D8CCB48A40DF42118AE3DA1A01A5F3AA1958AE;
SET @n += @@ROWCOUNT;
-- item 145
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA ICE CREAM

INGREDIENTS: instant whey protein isolate (MILK), hydrolysed collagen (bovine), flavouring: vanilla, thickener: xanthan gum, sweetener: sucralose, sodium chloride.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE ISOLATE (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE VANILJE

PËRBËRËSIT: izolat instant i proteinës së hirrës (QUMËSHT), kolagjen i hidrolizuar (gjedhi), aromë: vanilje, trashës: gomë ksantani, ëmbëlsues: sukralozë, klorur natriumi.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE ISOLATE (AKULLORE VANILJE)'
WHERE Variant_Id IN (1043) AND HASHBYTES('SHA2_256', Ingredients) = 0x58B83AA3A9529BF810814134561BF20E2E11AA45C116EFA6D52292B04DBF037D;
SET @n += @@ROWCOUNT;
-- item 146
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: instant whey protein isolate (MILK), hydrolysed collagen (bovine), flavouring: cookies, flavouring: caramel, thickener: xanthan gum, sweetener: sucralose, sodium chloride.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE ISOLATE (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: izolat instant i proteinës së hirrës (QUMËSHT), kolagjen i hidrolizuar (gjedhi), aromë: biskota, aromë: karamel, trashës: gomë ksantani, ëmbëlsues: sukralozë, klorur natriumi.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE ISOLATE (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1044) AND HASHBYTES('SHA2_256', Ingredients) = 0xDCFCFA11BDFA32E214546BE42BADDD11C500DCE43109961F1A1D2A7FFAC7CFBD;
SET @n += @@ROWCOUNT;
-- item 147
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE CAKE

INGREDIENTS: instant whey protein isolate (MILK), hydrolysed collagen (bovine), fat-reduced cocoa powder, flavouring: chocolate, thickener: xanthan gum, sodium chloride, sweetener: sucralose.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY COMPLETE ISOLATE (CHOCOLATE CAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'TORTË ME ÇOKOLLATË

PËRBËRËSIT: izolat instant i proteinës së hirrës (QUMËSHT), kolagjen i hidrolizuar (gjedhi), kakao pluhur me pak yndyrë, aromë: çokollatë, trashës: gomë ksantani, klorur natriumi, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY COMPLETE ISOLATE (TORTË ME ÇOKOLLATË)'
WHERE Variant_Id IN (1045) AND HASHBYTES('SHA2_256', Ingredients) = 0x47159D2645D275EB0D96BA2DD17E447B183B6177FFD7EADCCB4C7B2C70629E27;
SET @n += @@ROWCOUNT;
-- item 148
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: vitamin C, capsule (gelatine, colour: yellow iron oxide), vitamin E, choline (choline bitartrate), magnesium oxide, calcium carbonate, bitter orange extract (Citrus aurantium), ginseng extract (Panax ginseng), inositol, iron (iron gluconate), pantothenic acid, niacin, zinc (zinc gluconate), manganese gluconate, vitamin B6, emulsifiers (SOY lecithin, magnesium salts of fatty acids), riboflavin, thiamine, anti-caking agent (magnesium salts of fatty acids), vitamin A (beta-carotene), selenium (sodium selenite), biotin, folic acid, copper gluconate, vitamin B12, vitamin D, coenzyme Q10.

Produced in a facility that manufactures products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY COMPLETE VIT&MIN',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: vitamina C, kapsulë (xhelatinë, ngjyrues: oksid hekuri i verdhë), vitamina E, kolinë (bitartrat koline), oksid magnezi, karbonat kalciumi, ekstrakt portokalli të hidhur (Citrus aurantium), ekstrakt xhenseni (Panax ginseng), inozitol, hekur (glukonat hekuri), acid pantotenik, niacinë, zink (glukonat zinku), glukonat mangani, vitamina B6, emulsifikues (lecitinë SOJE, kripëra magnezi të acideve yndyrore), riboflavinë, tiaminë, agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore), vitamina A (beta-karoten), selen (selenit natriumi), biotinë, acid folik, glukonat bakri, vitamina B12, vitamina D, koenzima Q10.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY COMPLETE VIT&MIN'
WHERE Variant_Id IN (1046) AND HASHBYTES('SHA2_256', Ingredients) = 0x273A929036D139B21EB6AE486458E7F27AE8198F385548518B3C17B8885F8FC4;
SET @n += @@ROWCOUNT;
-- item 149
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CITRUS MIX

INGREDIENTS: L-citrulline 33%, micronised creatine monohydrate 19%, beta-alanine 17%, acids (citric acid, malic acid), flavourings, inulin, sweeteners (sucralose, acesulfame K), caffeine anhydrous 1.4%, bitter orange fruit extract (Citrus aurantium) 0.8%, microencapsulated caffeine 0.4% (caffeine, emulsifier: mono- and diglycerides of fatty acids), colours (riboflavins, copper complexes of chlorophylls and chlorophyllins), cyanocobalamin.

May contain traces of MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for BATTERY LIMITLESS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MIKS AGRUMESH

PËRBËRËSIT: L-citrulinë 33%, kreatinë monohidrat e mikronizuar 19%, beta-alaninë 17%, acide (acid citrik, acid malik), aroma, inulinë, ëmbëlsues (sukralozë, acesulfam K), kafeinë anhidre 1,4%, ekstrakt fruti portokalli të hidhur (Citrus aurantium) 0,8%, kafeinë e mikrokapsuluar 0,4% (kafeinë, emulsifikues: mono- dhe digliceride të acideve yndyrore), ngjyrues (riboflavina, komplekse bakri të klorofileve dhe klorofilinave), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për BATTERY LIMITLESS'
WHERE Variant_Id IN (1058) AND HASHBYTES('SHA2_256', Ingredients) = 0x56F11953DF25C2C9D90A27418258CAB781CF5C557E0FF23A4B2E2AD5F4A3BBEB;
SET @n += @@ROWCOUNT;
-- item 150
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GREEN TEA AND STRAWBERRY

INGREDIENTS: L-citrulline 33%, micronised creatine monohydrate 19%, beta-alanine 17%, flavourings, acids (citric acid, malic acid), inulin, sweeteners (sucralose, acesulfame K), caffeine anhydrous 1.4%, bitter orange fruit extract (Citrus aurantium) 0.8%, microencapsulated caffeine 0.4% (caffeine, emulsifier: mono- and diglycerides of fatty acids), colours (sulphite ammonia caramel, copper complexes of chlorophylls and chlorophyllins), cyanocobalamin.

May contain traces of MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for BATTERY LIMITLESS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇAJ JESHIL DHE LULESHTRYDHE

PËRBËRËSIT: L-citrulinë 33%, kreatinë monohidrat e mikronizuar 19%, beta-alaninë 17%, aroma, acide (acid citrik, acid malik), inulinë, ëmbëlsues (sukralozë, acesulfam K), kafeinë anhidre 1,4%, ekstrakt fruti portokalli të hidhur (Citrus aurantium) 0,8%, kafeinë e mikrokapsuluar 0,4% (kafeinë, emulsifikues: mono- dhe digliceride të acideve yndyrore), ngjyrues (karamel sulfit-amoniakal, komplekse bakri të klorofileve dhe klorofilinave), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për BATTERY LIMITLESS'
WHERE Variant_Id IN (1059) AND HASHBYTES('SHA2_256', Ingredients) = 0x9161A7BDFF2F8818831A1A0E907912ED2EF64C11F46C3637C8A8973AA1BD5234;
SET @n += @@ROWCOUNT;
-- item 151
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: maltodextrin

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY MALTODEXTRIN',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: maltodekstrinë

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY MALTODEXTRIN'
WHERE Variant_Id IN (1060) AND HASHBYTES('SHA2_256', Ingredients) = 0x79924AE88877CE8D7A4A22480EFBF11FA892FEA5AAD65F0AAFC7E348AB596716;
SET @n += @@ROWCOUNT;
-- item 152
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: FISH oil with 18% EPA and 12% DHA, capsule (gelatine, humectants: glycerol and water), antioxidant: alpha-tocopherol.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY OMEGA 3',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: vaj PESHKU me 18% EPA dhe 12% DHA, kapsulë (xhelatinë, lagështues: glicerol dhe ujë), antioksidant: alfa-tokoferol.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY OMEGA 3'
WHERE Variant_Id IN (1061) AND HASHBYTES('SHA2_256', Ingredients) = 0x46D72FBC1D2820D42265DF8F7FE50E1F9AFD142A5AA6E10AC5719709FFAF220B;
SET @n += @@ROWCOUNT;
-- item 153
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ICE POP

INGREDIENTS: whey protein isolate (MILK), glycine, acids (malic acid, citric acid), flavourings, salt, sweeteners (sucralose, acesulfame K, steviol glycosides from stevia), antifoaming agents (dimethyl polysiloxane, silicon dioxide), colour (Brilliant Blue FCF).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH, CRUSTACEANS and foods containing SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL CLEAR WHEY (ICE POP)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AKULLORE ME SHKOP

PËRBËRËSIT: izolat i proteinës së hirrës (QUMËSHT), glicinë, acide (acid malik, acid citrik), aroma, kripë, ëmbëlsues (sukralozë, acesulfam K, glikozide steviolike nga stevia), agjentë kundër shkumës (dimetil polisiloksan, dioksid silici), ngjyrues (Brilliant Blue FCF).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT, KRUSTACEVE dhe ushqimeve që përmbajnë DIOKSID SQUFURI.

Informacione ushqyese për BATTERY REBEL CLEAR WHEY (AKULLORE ME SHKOP)'
WHERE Variant_Id IN (1064) AND HASHBYTES('SHA2_256', Ingredients) = 0xE1090C1753443F2B4ED8567D3D6C915D9C00AEA75DEA27B1169DBE9A176A0AA7;
SET @n += @@ROWCOUNT;
-- item 154
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLUEBERRY GUMMIES

INGREDIENTS: whey protein isolate (MILK), glycine, flavourings, acids (malic acid, citric acid), salt, colours (ammonia caramel, carmine), sweeteners (sucralose, acesulfame K, steviol glycosides from stevia), antifoaming agents (dimethyl polysiloxane, silicon dioxide).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH, CRUSTACEANS and foods containing SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL CLEAR WHEY (BLUEBERRY GUMMIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KARAMELE GOME ME BORONICË

PËRBËRËSIT: izolat i proteinës së hirrës (QUMËSHT), glicinë, aroma, acide (acid malik, acid citrik), kripë, ngjyrues (karamel amoniakal, karminë), ëmbëlsues (sukralozë, acesulfam K, glikozide steviolike nga stevia), agjentë kundër shkumës (dimetil polisiloksan, dioksid silici).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT, KRUSTACEVE dhe ushqimeve që përmbajnë DIOKSID SQUFURI.

Informacione ushqyese për BATTERY REBEL CLEAR WHEY (KARAMELE GOME ME BORONICË)'
WHERE Variant_Id IN (1065) AND HASHBYTES('SHA2_256', Ingredients) = 0x46EA0A69885D052847E2192A72FC591009BC072A11779D810F54305114484290;
SET @n += @@ROWCOUNT;
-- item 155
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'UNFLAVOURED

INGREDIENTS: creatine monohydrate.

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL CREATINE (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PA SHIJE

PËRBËRËSIT: kreatinë monohidrat.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL CREATINE (PA SHIJE)'
WHERE Variant_Id IN (1066) AND HASHBYTES('SHA2_256', Ingredients) = 0x2602D36606DB5740BFDA9CA04136BBE60C3A153595B9A5A75C3E3BBAD9EABFD8;
SET @n += @@ROWCOUNT;
-- item 156
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: L-glutamine, flavouring (orange juice), acidity regulator (anhydrous citric acid), sweetener (sucralose).

ALLERGEN INFORMATION: Produced in a facility that processes products containing MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH AND CRUSTACEANS.

Nutrition information for BATTERY GLUTAMINE (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: L-glutaminë, aromë (lëng portokalli), rregullues aciditeti (acid citrik anhidër), ëmbëlsues (sukralozë).

INFORMACION PËR ALERGJENËT: Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN, SOJE, KIKIRIKË, FRUTA ME LËVOZHGË, PESHK DHE KRUSTACE.

Informacione ushqyese për BATTERY GLUTAMINE (PORTOKALL)'
WHERE Variant_Id IN (1067) AND HASHBYTES('SHA2_256', Ingredients) = 0x7EF3D3F962A85F247F5587BC0184C3FA30A788AE412388588FEEE20F3FAC1B54;
SET @n += @@ROWCOUNT;
-- item 157
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: carbohydrate blend (maltodextrin, OAT flour, dextrose, palatinose, fructose, waxy maize starch), protein blend (whey protein concentrate from MILK {emulsified with sunflower lecithin}, glutamine peptide (GLUTEN), whey protein isolate from MILK {emulsified with sunflower lecithin}, micellar casein from MILK), L-glycine, fat-reduced cocoa powder (10–12%), flavouring (chocolate), CEREAL balls coated with dark chocolate (GLUTEN), fenugreek extract (Trigonella Foenum Graecum) 4:1, thickener (xanthan gum), sweeteners (acesulfame K, sucralose).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL MASS GAINER (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: përzierje karbohidratesh (maltodekstrinë, miell TËRSHËRE, dekstrozë, palatinozë, fruktozë, niseshte misri dyllore), përzierje proteinash (koncentrat i proteinës së hirrës nga QUMËSHTI {i emulsifikuar me lecitinë luledielli}, peptid glutamine (GLUTEN), izolat i proteinës së hirrës nga QUMËSHTI {i emulsifikuar me lecitinë luledielli}, kazeinë micelare nga QUMËSHTI), L-glicinë, kakao pluhur me pak yndyrë (10–12%), aromë (çokollatë), topa DRITHËRASH të veshur me çokollatë të zezë (GLUTEN), ekstrakt kopre greke (Trigonella Foenum Graecum) 4:1, trashës (gomë ksantani), ëmbëlsues (acesulfam K, sukralozë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL MASS GAINER (ÇOKOLLATË)'
WHERE Variant_Id IN (1068) AND HASHBYTES('SHA2_256', Ingredients) = 0x07704B1E90097FFD05BCD4C2DCED8E52F28AD18545B4136E6A869F6E28F640F1;
SET @n += @@ROWCOUNT;
-- item 158
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MANGO

INGREDIENTS: L-citrulline malate 2:1, beta-alanine, inulin, acidity regulators (malic acid, citric acid), L-tyrosine, L-glycine, L-choline bitartrate, flavouring (mango), caffeine anhydrous, beetroot extract (Beta vulgaris linn.) (root) 4:1, sweeteners (acesulfame K, sucralose), cayenne pepper extract (Capsicum annuum) (fruit) 8:1, silicon dioxide, colours (beta-carotenes), Bioperine (Piper nigrum (fruit) extract 50:1) [5 mg, of which at least 95% piperine].

May contain traces of MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for BATTERY REBEL PRE-WORKOUT',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANGO

PËRBËRËSIT: L-citrulinë malat 2:1, beta-alaninë, inulinë, rregullues aciditeti (acid malik, acid citrik), L-tirozinë, L-glicinë, L-kolinë bitartrat, aromë (mango), kafeinë anhidre, ekstrakt panxhari (Beta vulgaris linn.) (rrënjë) 4:1, ëmbëlsues (acesulfam K, sukralozë), ekstrakt piperi kajen (Capsicum annuum) (frut) 8:1, dioksid silici, ngjyrues (beta-karotene), Bioperine (ekstrakt Piper nigrum (frut) 50:1) [5 mg, nga të cilat minimumi 95% piperinë].

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për BATTERY REBEL PRE-WORKOUT'
WHERE Variant_Id IN (1069) AND HASHBYTES('SHA2_256', Ingredients) = 0xE5BE74D95A0EF4A827B1DE1E20C2E724633ABD80EA7A9CD4647B36E9A3B54994;
SET @n += @@ROWCOUNT;
-- item 159
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'WAFERS (CHOCO-HAZELNUT)

INGREDIENTS: instant whey protein concentrate (MILK), MILK protein concentrate, glycine, fat-reduced cocoa powder, instant MILK powder, maltodextrin, flavouring, L-leucine, salt, thickeners (guar gum, xanthan gum), natural flavouring (MILK), sweetener (sucralose), natural flavouring, lactase enzyme powder.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY COMPLETE WHEY (WAFERS (CHOCO-HAZELNUT))',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VAFERA (ÇOKO-LAJTHI)

PËRBËRËSIT: koncentrat instant i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së QUMËSHTIT, glicinë, kakao pluhur me pak yndyrë, QUMËSHT pluhur instant, maltodekstrinë, aromë, L-leucinë, kripë, trashës (gomë guar, gomë ksantani), aromë natyrale (QUMËSHT), ëmbëlsues (sukralozë), aromë natyrale, enzimë laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY COMPLETE WHEY (VAFERA (ÇOKO-LAJTHI))'
WHERE Variant_Id IN (1099) AND HASHBYTES('SHA2_256', Ingredients) = 0xD8B348A033A8E9C560A3907BF5079C4046F0D05FFB5CF82BBB19FB01B61D0517;
SET @n += @@ROWCOUNT;
-- item 160
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'**YUZU AND LIME**

**INGREDIENTS:** creatine monohydrate, acidity regulator: citric acid, glycine, flavouring: yuzu [contains antioxidant: E 320], sweetener: sucralose.

**Produced in a facility that processes products containing milk, eggs, gluten and soy.**

**Nutrition information for BATTERY CREATINE (FLAVOURED)**',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'**JUZU DHE LIME**

**PËRBËRËSIT:** kreatinë monohidrat, rregullues aciditeti: acid citrik, glicinë, aromë: juzu [përmban antioksidant: E 320], ëmbëlsues: sukralozë.

**Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.**

**Informacione ushqyese për BATTERY CREATINE (ME SHIJE)**'
WHERE Variant_Id IN (1102) AND HASHBYTES('SHA2_256', Ingredients) = 0xB182A4DA510B3834368EE344667CE8A619FE6DFF73D88508BCBB10419ABC16FF;
SET @n += @@ROWCOUNT;
-- item 161
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE
INGREDIENTS: creatine monohydrate, acidity regulator: citric acid, flavouring: orange [contains colours: tartrazine and Sunset Yellow], sweetener: sucralose, glycine. May have an adverse effect on activity and attention in children.
Produced in a facility that processes products containing milk, eggs, gluten and soy.
Nutrition information for BATTERY CREATINE (FLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL
PËRBËRËSIT: kreatinë monohidrat, rregullues aciditeti: acid citrik, aromë: portokall [përmban ngjyrues: tartrazinë dhe Sunset Yellow], ëmbëlsues: sukralozë, glicinë. Mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.
Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.
Informacione ushqyese për BATTERY CREATINE (ME SHIJE)'
WHERE Variant_Id IN (1103) AND HASHBYTES('SHA2_256', Ingredients) = 0x51EBE21E644BB9CEC83FBDC8CFBF75712573FFC86E6D59FB21777F9E0FDCE160;
SET @n += @@ROWCOUNT;
-- item 162
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY CREATINE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY CREATINE'
WHERE Variant_Id IN (1104) AND HASHBYTES('SHA2_256', Ingredients) = 0xB6919CF2FFE55767C4013A831FC824EF83E1B86A5375C267D8C3EA1804BA4634;
SET @n += @@ROWCOUNT;
-- item 163
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: olive oil, softgel capsule [bovine gelatine, humectant: glycerol], menaquinone-7 (SOY), cholecalciferol.

Produced in a facility that manufactures products containing milk, eggs, gluten and soy. May contain gluten.

Nutrition information for BATTERY D3 + K2',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: vaj ulliri, kapsulë e butë [xhelatinë gjedhi, lagështues: glicerol], menakinon-7 (SOJE), kolekalciferol.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë qumësht, vezë, gluten dhe soje. Mund të përmbajë gluten.

Informacione ushqyese për BATTERY D3 + K2'
WHERE Variant_Id IN (1106) AND HASHBYTES('SHA2_256', Ingredients) = 0x3E1004702598AFE48189FD88F1D8CCDCAC00ECA84076BDC661EEDB1EC30B8208;
SET @n += @@ROWCOUNT;
-- item 164
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: L-carnitine L-tartrate, hydroxypropyl methylcellulose with colour sodium copper chlorophyllin (capsule shell), coffee seed extract (Coffea robusta (L.) Linden) with 99% natural caffeine, maize starch, green tea (Camellia sinensis (L.) Kuntze) with 95% total polyphenols, 45–48% EGCG and 1% caffeine, cayenne pepper fruit extract (Capsicum annuum L.) with 2% capsaicinoids, anti-caking agent: magnesium salts of fatty acids; nicotinamide, black pepper fruit extract (Piper nigrum L.) with 95% piperine.
Nutrition information for BATTERY EXTREME BURN',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: L-karnitinë L-tartrat, hidroksipropil metilcelulozë me ngjyrues klorofilinë bakri natriumi (mbështjellësi i kapsulës), ekstrakt farash kafeje (Coffea robusta (L.) Linden) me 99% kafeinë natyrale, niseshte misri, çaj jeshil (Camellia sinensis (L.) Kuntze) me 95% polifenole gjithsej, 45–48% EGCG dhe 1% kafeinë, ekstrakt fruti piperi kajen (Capsicum annuum L.) me 2% kapsaicinoide, agjent kundër ngjizjes: kripëra magnezi të acideve yndyrore; nikotinamid, ekstrakt fruti piperi të zi (Piper nigrum L.) me 95% piperinë.
Informacione ushqyese për BATTERY EXTREME BURN'
WHERE Variant_Id IN (1107) AND HASHBYTES('SHA2_256', Ingredients) = 0x392241473B41FBB7FBB84FA6FD075AD49BE3A5CC36BEA0C3136707AB99790FC2;
SET @n += @@ROWCOUNT;
-- item 165
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: D-glucosamine sulphate 2KCl (from CRAB shells), capsule (bovine gelatine, colour: yellow iron oxide), anti-caking agent: magnesium salts of fatty acids.

Produced in a facility that processes products containing milk, eggs, gluten and soy.

Nutrition information for BATTERY GLUCOSAMINE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: D-glukozaminë sulfat 2KCl (nga guaska GAFORJESH), kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), agjent kundër ngjizjes: kripëra magnezi të acideve yndyrore.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë qumësht, vezë, gluten dhe soje.

Informacione ushqyese për BATTERY GLUCOSAMINE'
WHERE Variant_Id IN (1108) AND HASHBYTES('SHA2_256', Ingredients) = 0xDB0AE11B4925A68C68C1296E6ABF98FDB4C14450D2D9D2C6D00090427560CF02;
SET @n += @@ROWCOUNT;
-- item 166
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEACH

INGREDIENTS: BCAA blend (L-leucine, L-isoleucine, L-valine, emulsifier (sunflower lecithin)), L-glutamine, L-taurine, acidity regulators (citric acid, malic acid), flavouring (peach), L-citrulline malate 1:1, sweeteners (acesulfame K, sucralose), inulin, colours (curcumin, beta-carotene).

May contain traces of MILK, EGGS, GLUTEN, SOY, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL BCAA (PEACH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PJESHKË

PËRBËRËSIT: përzierje BCAA (L-leucinë, L-izoleucinë, L-valinë, emulsifikues (lecitinë luledielli)), L-glutaminë, L-taurinë, rregullues aciditeti (acid citrik, acid malik), aromë (pjeshkë), L-citrulinë malat 1:1, ëmbëlsues (acesulfam K, sukralozë), inulinë, ngjyrues (kurkuminë, beta-karoten).

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, GLUTENIT, SOJES, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL BCAA (PJESHKË)'
WHERE Variant_Id IN (1111) AND HASHBYTES('SHA2_256', Ingredients) = 0xA599504115402EB3CBE0935D5A5C80D165DE6F8C7699CF3ECCC6555685061BD5;
SET @n += @@ROWCOUNT;
-- item 167
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY

INGREDIENTS: BCAA blend (L-leucine, L-isoleucine, L-valine), L-glutamine, L-taurine, inulin, acidity regulator (citric acid), flavouring (raspberry), L-citrulline malate 1:1, colour (beetroot red), sweeteners (acesulfame K, sucralose).

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH, CRUSTACEANS and SULPHUR DIOXIDE.

Nutrition information for BATTERY REBEL BCAA (RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR

PËRBËRËSIT: përzierje BCAA (L-leucinë, L-izoleucinë, L-valinë), L-glutaminë, L-taurinë, inulinë, rregullues aciditeti (acid citrik), aromë (mjedër), L-citrulinë malat 1:1, ngjyrues (e kuqe panxhari), ëmbëlsues (acesulfam K, sukralozë).

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT, KRUSTACEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për BATTERY REBEL BCAA (MJEDËR)'
WHERE Variant_Id IN (1112) AND HASHBYTES('SHA2_256', Ingredients) = 0xB9A54155DD7F3C2A90594B3FC83ED5DE80FD5882F35AB6AB226D37A2182B97E4;
SET @n += @@ROWCOUNT;
-- item 168
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: maltodextrin, capsule (bovine gelatine, colour: yellow iron oxide), zinc bisglycinate.

Produced in a facility that manufactures products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY ZINC',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: maltodekstrinë, kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), bisglicinat zinku.

Prodhuar në një objekt ku prodhohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY ZINC'
WHERE Variant_Id IN (1123) AND HASHBYTES('SHA2_256', Ingredients) = 0x320D3505135FDF47681A0CFEA202488A3C0A29A5A72B4E48E8EBBF5D5EFEF192;
SET @n += @@ROWCOUNT;
-- item 169
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: magnesium oxide, capsule (bovine gelatine, colour: yellow iron oxide), zinc bisglycinate, vitamin B6 (pyridoxine hydrochloride).

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY ZMA',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: oksid magnezi, kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë), bisglicinat zinku, vitamina B6 (piridoksinë hidroklorur).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY ZMA'
WHERE Variant_Id IN (1124) AND HASHBYTES('SHA2_256', Ingredients) = 0xAA3A873C53D2330D70BD4F77624E553808F3A1B46CFC85C266F4046FEE0D1A54;
SET @n += @@ROWCOUNT;
-- item 170
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'HOT SAUCE

INGREDIENTS: water, sweeteners (erythritol, sucralose), spirit vinegar (3%), plant fibre (bamboo), stabiliser (xanthan gum), flavouring, acidity regulator (lactic acid), preservative (sodium benzoate), table salt, colour (sulphite ammonia caramel).

Nutrition information for BODY ATTACK BBQ SAUCE (HOT SAUCE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SALCË DJEGËSE

PËRBËRËSIT: ujë, ëmbëlsues (eritritol, sukralozë), uthull alkooli (3%), fibra bimore (bambu), stabilizues (gomë ksantani), aromë, rregullues aciditeti (acid laktik), konservues (benzoat natriumi), kripë kuzhine, ngjyrues (karamel sulfit-amoniakal).

Informacione ushqyese për BODY ATTACK BBQ SAUCE (SALCË DJEGËSE)'
WHERE Variant_Id IN (1125) AND HASHBYTES('SHA2_256', Ingredients) = 0xD37A9F012B30C9333880B6CF2AF5D9706ED920E115BDCA83D87AF37E152B5B88;
SET @n += @@ROWCOUNT;
-- item 171
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'KETCHUP

INGREDIENTS: water, spirit vinegar (10%), tomato concentrate (3%), plant fibre (bamboo), stabiliser (xanthan gum), flavourings, onion powder (0.3%), preservative (potassium sorbate), table salt, sweetener (sucralose), red cabbage extract, carrot extract, colours (turmeric extract, sulphite ammonia caramel).

Nutrition information for BODY ATTACK BBQ SAUCE (KETCHUP)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KEÇAP

PËRBËRËSIT: ujë, uthull alkooli (10%), koncentrat domateje (3%), fibra bimore (bambu), stabilizues (gomë ksantani), aroma, qepë pluhur (0,3%), konservues (sorbat kaliumi), kripë kuzhine, ëmbëlsues (sukralozë), ekstrakt lakre të kuqe, ekstrakt karote, ngjyrues (ekstrakt shafrani të Indisë, karamel sulfit-amoniakal).

Informacione ushqyese për BODY ATTACK BBQ SAUCE (KEÇAP)'
WHERE Variant_Id IN (1126) AND HASHBYTES('SHA2_256', Ingredients) = 0x4637CCCA543DAEF103B3F93EFE5DD571F2012536FC3970923F42D952091AB8D1;
SET @n += @@ROWCOUNT;
-- item 172
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'KEBAB

INGREDIENTS: water, plant fibre (bamboo), spirit vinegar, stabiliser (xanthan gum), salt, flavourings, acidity regulator (citric acid), preservative (potassium sorbate), sweetener (sucralose), spices.

Nutrition information for BODY ATTACK BBQ SAUCE (KEBAB)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'QEBAP

PËRBËRËSIT: ujë, fibra bimore (bambu), uthull alkooli, stabilizues (gomë ksantani), kripë, aroma, rregullues aciditeti (acid citrik), konservues (sorbat kaliumi), ëmbëlsues (sukralozë), erëza.

Informacione ushqyese për BODY ATTACK BBQ SAUCE (QEBAP)'
WHERE Variant_Id IN (1128) AND HASHBYTES('SHA2_256', Ingredients) = 0x9B41309E1D8A7B9BF0044512D78FF45E158680605A96BFA7ABC9D08C089D2A07;
SET @n += @@ROWCOUNT;
-- item 173
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'HONEY AND MUSTARD

INGREDIENTS: water, sweeteners (erythritol, sucralose), spirit vinegar, salt, plant fibre (bamboo), MUSTARD (1.3%), stabiliser (xanthan gum), flavourings (contain MUSTARD), acidity regulator (citric acid), preservative (potassium sorbate), honey (0.01%), colours (turmeric extract, sulphite ammonia caramel).

Nutrition information for BODY ATTACK BBQ SAUCE (HONEY AND MUSTARD)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJALTË DHE MUSTARDË

PËRBËRËSIT: ujë, ëmbëlsues (eritritol, sukralozë), uthull alkooli, kripë, fibra bimore (bambu), MUSTARDË (1,3%), stabilizues (gomë ksantani), aroma (përmbajnë MUSTARDË), rregullues aciditeti (acid citrik), konservues (sorbat kaliumi), mjaltë (0,01%), ngjyrues (ekstrakt shafrani të Indisë, karamel sulfit-amoniakal).

Informacione ushqyese për BODY ATTACK BBQ SAUCE (MJALTË DHE MUSTARDË)'
WHERE Variant_Id IN (1129) AND HASHBYTES('SHA2_256', Ingredients) = 0x57F44F9FF1B28BFC4B737CEB52362B416E70B37F60B5E013B853FA3EE638D53B;
SET @n += @@ROWCOUNT;
-- item 174
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'AMERICAN

INGREDIENTS: water, plant fibre (bamboo), spirit vinegar (5%), tomato concentrate (3%), lemon juice concentrate (1.5%), salt, stabiliser (xanthan gum), onion powder (0.3%), garlic powder (0.14%), flavourings, spices (0.11%), preservative (potassium sorbate), sweetener (sucralose), colour (beta-carotene).

Nutrition information for BODY ATTACK DRESSING (AMERICAN)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'AMERIKAN

PËRBËRËSIT: ujë, fibra bimore (bambu), uthull alkooli (5%), koncentrat domateje (3%), koncentrat lëngu limoni (1,5%), kripë, stabilizues (gomë ksantani), qepë pluhur (0,3%), hudhër pluhur (0,14%), aroma, erëza (0,11%), konservues (sorbat kaliumi), ëmbëlsues (sukralozë), ngjyrues (beta-karoten).

Informacione ushqyese për BODY ATTACK DRESSING (AMERIKAN)'
WHERE Variant_Id IN (1130) AND HASHBYTES('SHA2_256', Ingredients) = 0xA5DC861BEB6DB01C84AD5DD2C385F53A4ECFEC57FF33F32832E3E09998CBBA1E;
SET @n += @@ROWCOUNT;
-- item 175
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CAESAR

INGREDIENTS: water, wine vinegar (3.2%), plant fibre (bamboo), salt, stabiliser (xanthan gum), acidity regulator (lactic acid), spices, flavourings, onion powder (0.1%), preservative (potassium sorbate), garlic powder, sweetener (sucralose).

Nutrition information for BODY ATTACK DRESSING (CAESAR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'CEZAR

PËRBËRËSIT: ujë, uthull vere (3,2%), fibra bimore (bambu), kripë, stabilizues (gomë ksantani), rregullues aciditeti (acid laktik), erëza, aroma, qepë pluhur (0,1%), konservues (sorbat kaliumi), hudhër pluhur, ëmbëlsues (sukralozë).

Informacione ushqyese për BODY ATTACK DRESSING (CEZAR)'
WHERE Variant_Id IN (1131) AND HASHBYTES('SHA2_256', Ingredients) = 0xA2F84902AB8F0007629A5961823B4FEEA53F43C30FD158DC3DACE4048EE04415;
SET @n += @@ROWCOUNT;
-- item 176
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MAYONNAISE

INGREDIENTS: water, sweeteners (erythritol, sucralose), plant fibre (bamboo), modified starch, wine vinegar, salt, stabiliser (xanthan gum), flavourings, preservative (potassium sorbate), colour (beta-carotene).

Nutrition information for BODY ATTACK DRESSING (MAYONNAISE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MAJONEZË

PËRBËRËSIT: ujë, ëmbëlsues (eritritol, sukralozë), fibra bimore (bambu), niseshte e modifikuar, uthull vere, kripë, stabilizues (gomë ksantani), aroma, konservues (sorbat kaliumi), ngjyrues (beta-karoten).

Informacione ushqyese për BODY ATTACK DRESSING (MAJONEZË)'
WHERE Variant_Id IN (1133) AND HASHBYTES('SHA2_256', Ingredients) = 0x9832095B519397B8E8D080C637B21EA24EE16B3697FE151EE11AE78DB7EB1260;
SET @n += @@ROWCOUNT;
-- item 177
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: guanidinoacetic acid, creatine monohydrate, acidity regulator (citric acid), orange flavouring, colour (carotenes), anti-caking agent (silicon dioxide), sweetener (steviol glycosides), beetroot juice concentrate, pyridoxine hydrochloride (vitamin B6), calcium L-methylfolate (vitamin B9), methylcobalamin (vitamin B12).

Nutrition information for CREGAATINE (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: acid guanidinoacetik, kreatinë monohidrat, rregullues aciditeti (acid citrik), aromë portokalli, ngjyrues (karotene), agjent kundër ngjizjes (dioksid silici), ëmbëlsues (glikozide steviolike), koncentrat lëngu panxhari, piridoksinë hidroklorur (vitamina B6), L-metilfolat kalciumi (vitamina B9), metilkobalaminë (vitamina B12).

Informacione ushqyese për CREGAATINE (PORTOKALL)'
WHERE Variant_Id IN (1136) AND HASHBYTES('SHA2_256', Ingredients) = 0xA02F4ED9D834EF4AD76E57F3A4FEE91B48BB130DAE8346C1ABBBE68048691604;
SET @n += @@ROWCOUNT;
-- item 178
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GREEN APPLE

INGREDIENTS: amino acid blend (L-leucine, L-lysine hydrochloride, L-valine, L-isoleucine, L-phenylalanine, L-threonine, L-histidine hydrochloride monohydrate, L-methionine, L-tryptophan), acidity regulator (citric acid), flavouring, inulin, thickener (xanthan gum), colours (beta-carotene, patent blue), sweeteners (sucralose, steviol glycosides).

May contain traces of SOY, LUPIN, MILK, GLUTEN and EGGS.

Nutrition information for IRONMAXX 100% EAAS ZERO (GREEN APPLE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MOLLË JESHILE

PËRBËRËSIT: përzierje aminoacidesh (L-leucinë, L-lizinë hidroklorur, L-valinë, L-izoleucinë, L-fenilalaninë, L-treoninë, L-histidinë hidroklorur monohidrat, L-metioninë, L-triptofan), rregullues aciditeti (acid citrik), aromë, inulinë, trashës (gomë ksantani), ngjyrues (beta-karoten, blu patente), ëmbëlsues (sukralozë, glikozide steviolike).

Mund të përmbajë gjurmë të SOJES, LUPINËS, QUMËSHTIT, GLUTENIT dhe VEZËVE.

Informacione ushqyese për IRONMAXX 100% EAAS ZERO (MOLLË JESHILE)'
WHERE Variant_Id IN (1137) AND HASHBYTES('SHA2_256', Ingredients) = 0x48DEA5218422C262A337B68BFE706CE80D9FFBFD683C3E2011BF88BE7DF8D269;
SET @n += @@ROWCOUNT;
-- item 179
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEACH ICED TEA

INGREDIENTS: amino acid blend (L-leucine, L-lysine hydrochloride, L-valine, L-isoleucine, L-threonine, L-phenylalanine, L-methionine, L-histidine hydrochloride, L-tryptophan, emulsifier (lecithins)), inulin, acidity regulator (citric acid), flavouring, thickener (xanthan gum), sweeteners (sucralose, steviol glycosides), colour (E150d).

May contain traces of LUPIN, EGGS, GLUTEN, MILK and SOY.

Nutrition information for IRONMAXX 100% EAAS ZERO (PEACH ICED TEA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇAJ I FTOHTË ME PJESHKË

PËRBËRËSIT: përzierje aminoacidesh (L-leucinë, L-lizinë hidroklorur, L-valinë, L-izoleucinë, L-treoninë, L-fenilalaninë, L-metioninë, L-histidinë hidroklorur, L-triptofan, emulsifikues (lecitina)), inulinë, rregullues aciditeti (acid citrik), aromë, trashës (gomë ksantani), ëmbëlsues (sukralozë, glikozide steviolike), ngjyrues (E150d).

Mund të përmbajë gjurmë të LUPINËS, VEZËVE, GLUTENIT, QUMËSHTIT dhe SOJES.

Informacione ushqyese për IRONMAXX 100% EAAS ZERO (ÇAJ I FTOHTË ME PJESHKË)'
WHERE Variant_Id IN (1138) AND HASHBYTES('SHA2_256', Ingredients) = 0x739438CAA593321A9D08B3890D283AA2D682D47C3C347727375C14A3528B145F;
SET @n += @@ROWCOUNT;
-- item 180
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: amino acid blend (L-leucine, L-lysine hydrochloride, L-valine, L-isoleucine, L-threonine, L-phenylalanine, L-methionine, L-histidine hydrochloride, L-tryptophan, emulsifier (lecithins)), acidity regulator (citric acid), inulin, flavouring, thickener (xanthan gum), colour (carotenes), sweeteners (sucralose, steviol glycosides).

May contain traces of LUPIN, EGGS, GLUTEN, MILK and SOY.

Nutrition information for IRONMAXX 100% EAAS ZERO (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: përzierje aminoacidesh (L-leucinë, L-lizinë hidroklorur, L-valinë, L-izoleucinë, L-treoninë, L-fenilalaninë, L-metioninë, L-histidinë hidroklorur, L-triptofan, emulsifikues (lecitina)), rregullues aciditeti (acid citrik), inulinë, aromë, trashës (gomë ksantani), ngjyrues (karotene), ëmbëlsues (sukralozë, glikozide steviolike).

Mund të përmbajë gjurmë të LUPINËS, VEZËVE, GLUTENIT, QUMËSHTIT dhe SOJES.

Informacione ushqyese për IRONMAXX 100% EAAS ZERO (PORTOKALL)'
WHERE Variant_Id IN (1139) AND HASHBYTES('SHA2_256', Ingredients) = 0x21344347D02A2202D6F2490240E8475A4EA14973F35C2FF4ACCFF3C8750A594E;
SET @n += @@ROWCOUNT;
-- item 181
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA DREAM

INGREDIENTS: protein blend (93%) (pea protein, fava bean protein, sunflower protein, rice protein, hemp seed protein), flavouring, thickener (sodium carboxymethyl cellulose), iodised sea salt (sea salt, potassium iodide), sweeteners (sucralose, steviol glycosides from stevia), colour (carotene), vanilla powder (0.1%).

May contain traces of GLUTEN, EGGS, SOY, MILK and LUPIN.

Nutrition information for IRONMAXX 100% VEGAN PROTEIN ZERO (VANILLA DREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA DREAM

PËRBËRËSIT: përzierje proteinash (93%) (proteinë bizeleje, proteinë fasule fava, proteinë luledielli, proteinë orizi, proteinë farash kërpi), aromë, trashës (karboksimetil celulozë natriumi), kripë deti e jodizuar (kripë deti, jodur kaliumi), ëmbëlsues (sukralozë, glikozide steviolike nga stevia), ngjyrues (karoten), vanilje pluhur (0,1%).

Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, SOJES, QUMËSHTIT dhe LUPINËS.

Informacione ushqyese për IRONMAXX 100% VEGAN PROTEIN ZERO (VANILLA DREAM)'
WHERE Variant_Id IN (1140) AND HASHBYTES('SHA2_256', Ingredients) = 0x5F9A6C00D97741D07799C077BB123B0DA099B913964DF61338431194AE06DFE6;
SET @n += @@ROWCOUNT;
-- item 182
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLUEBERRY CHEESECAKE

INGREDIENTS: whey protein concentrate (94%) (whey protein (MILK)), flavouring, acidity regulator (citric acid), thickener (xanthan gum), blueberry pieces (0.4%), salt, colour (anthocyanin), sweeteners (sucralose, steviol glycosides).

May contain traces of EGGS, SOY, GLUTEN and LUPIN.

Nutrition information for 100% WHEY PROTEIN (BLUEBERRY CHEESECAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'CHEESECAKE ME BORONICË

PËRBËRËSIT: koncentrat i proteinës së hirrës (94%) (proteinë hirre (QUMËSHT)), aromë, rregullues aciditeti (acid citrik), trashës (gomë ksantani), copa boronice (0,4%), kripë, ngjyrues (antocianinë), ëmbëlsues (sukralozë, glikozide steviolike).

Mund të përmbajë gjurmë të VEZËVE, SOJES, GLUTENIT dhe LUPINËS.

Informacione ushqyese për 100% WHEY PROTEIN (CHEESECAKE ME BORONICË)'
WHERE Variant_Id IN (1145) AND HASHBYTES('SHA2_256', Ingredients) = 0xAF697906152AA6301C4A150B86146F35A92BEC6FB91779C782F873DD653FF424;
SET @n += @@ROWCOUNT;
-- item 183
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MILK CHOCOLATE

INGREDIENTS: whey protein concentrate (93%) (whey protein (MILK), emulsifier (lecithins)), fat-reduced cocoa powder (5.5%), flavouring, sweeteners (sucralose, steviol glycosides).

May contain traces of SOY, LUPIN, EGGS and GLUTEN.

Nutrition information for 100% WHEY PROTEIN (MILK CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË QUMËSHTI

PËRBËRËSIT: koncentrat i proteinës së hirrës (93%) (proteinë hirre (QUMËSHT), emulsifikues (lecitina)), kakao pluhur me pak yndyrë (5,5%), aromë, ëmbëlsues (sukralozë, glikozide steviolike).

Mund të përmbajë gjurmë të SOJES, LUPINËS, VEZËVE dhe GLUTENIT.

Informacione ushqyese për 100% WHEY PROTEIN (ÇOKOLLATË QUMËSHTI)'
WHERE Variant_Id IN (1146) AND HASHBYTES('SHA2_256', Ingredients) = 0xA800DFE1F4F5FAE5C5D7D718B9BF27D2966E5546673A834221A407D477A87218;
SET @n += @@ROWCOUNT;
-- item 184
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'DUBAI CHOCOLATE (PISTACHIO AND CHOCOLATE)

INGREDIENTS: whey protein concentrate (92%) (MILK) (contains emulsifier (lecithins)), flavouring, chocolate powder (2%) (cocoa mass, sugar, fat-reduced cocoa powder, emulsifier (lecithin (SOY))), kadaif (2%) (WHEAT flour, water), thickener (xanthan gum), colour (sodium copper chlorophyllin), sweeteners (sucralose, steviol glycosides from stevia).

May contain EGGS, CRUSTACEANS, FISH and SULPHITES.

Nutrition information for IRONMAXX 100% WHEY PROTEIN (DUBAI CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË DUBAI (FISTIK DHE ÇOKOLLATË)

PËRBËRËSIT: koncentrat i proteinës së hirrës (92%) (QUMËSHT) (përmban emulsifikues (lecitina)), aromë, çokollatë pluhur (2%) (masë kakaoje, sheqer, kakao pluhur me pak yndyrë, emulsifikues (lecitinë (SOJE))), kadaif (2%) (miell GRURI, ujë), trashës (gomë ksantani), ngjyrues (klorofilinë bakri natriumi), ëmbëlsues (sukralozë, glikozide steviolike nga stevia).

Mund të përmbajë VEZË, KRUSTACE, PESHK dhe SULFITE.

Informacione ushqyese për IRONMAXX 100% WHEY PROTEIN (ÇOKOLLATË DUBAI)'
WHERE Variant_Id IN (1148) AND HASHBYTES('SHA2_256', Ingredients) = 0xBB30507FAD991AB7FB44F36157040413686F36389370CDD564BA589C5CC18A9F;
SET @n += @@ROWCOUNT;
-- item 185
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: water, L-carnitine, strawberry purée (3%), acidity regulator (lactic acid), thickener (xanthan gum), preservative (potassium sorbate), sweeteners (steviol glycosides, sucralose), salt, emulsifier (E471), pyridoxine hydrochloride, colour (E129).

E129 may have an adverse effect on activity and attention in children.

Nutrition information for CARNITIN PRO LIQUID (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: ujë, L-karnitinë, pure luleshtrydheje (3%), rregullues aciditeti (acid laktik), trashës (gomë ksantani), konservues (sorbat kaliumi), ëmbëlsues (glikozide steviolike, sukralozë), kripë, emulsifikues (E471), piridoksinë hidroklorur, ngjyrues (E129).

E129 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për CARNITIN PRO LIQUID (LULESHTRYDHE)'
WHERE Variant_Id IN (1149) AND HASHBYTES('SHA2_256', Ingredients) = 0xEA326819DB5566A4710C6BE68E5E39A3B487834254D3CD7C956EFDD904331A8C;
SET @n += @@ROWCOUNT;
-- item 186
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: water, L-carnitine, strawberry purée (3%), acidity regulator (lactic acid), thickener (xanthan gum), preservative (potassium sorbate), sweeteners (steviol glycosides, sucralose), salt, emulsifier (E471), pyridoxine hydrochloride, colour (E129).

E129 may have an adverse effect on activity and attention in children.

Nutrition information for CARNITIN PRO LIQUID',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: ujë, L-karnitinë, pure luleshtrydheje (3%), rregullues aciditeti (acid laktik), trashës (gomë ksantani), konservues (sorbat kaliumi), ëmbëlsues (glikozide steviolike, sukralozë), kripë, emulsifikues (E471), piridoksinë hidroklorur, ngjyrues (E129).

E129 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për CARNITIN PRO LIQUID'
WHERE Variant_Id IN (1150) AND HASHBYTES('SHA2_256', Ingredients) = 0xA2EACDFE615F87B0B34222A723598785CDF8B6EDCE7F60767899A529F9FA3C3F;
SET @n += @@ROWCOUNT;
-- item 187
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GREEN TEA AND LEMON

INGREDIENTS: hydrolysed collagen (bovine) (83%), acidity regulator (citric acid), flavouring, colour, inulin, sweetener (sucralose), L-ascorbic acid.

May contain traces of EGGS, GLUTEN, LUPIN, MILK and SOY.

Nutrition information for IRONMAXX COLLAGEN POWDER ZERO (GREEN TEA AND LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇAJ JESHIL DHE LIMON

PËRBËRËSIT: kolagjen i hidrolizuar (gjedhi) (83%), rregullues aciditeti (acid citrik), aromë, ngjyrues, inulinë, ëmbëlsues (sukralozë), acid L-askorbik.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, LUPINËS, QUMËSHTIT dhe SOJES.

Informacione ushqyese për IRONMAXX COLLAGEN POWDER ZERO (ÇAJ JESHIL DHE LIMON)'
WHERE Variant_Id IN (1151) AND HASHBYTES('SHA2_256', Ingredients) = 0x2A153799DA055484EA014B9065CD797542F0B1CD7F555CC42497E78F3562CDBF;
SET @n += @@ROWCOUNT;
-- item 188
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TROPICAL FLAVOUR

INGREDIENTS: hydrolysed collagen (bovine) (83%), acidity regulator (citric acid), flavouring, colour (beta-carotene), inulin, sweetener (sucralose), L-ascorbic acid.

May contain traces of EGGS, GLUTEN, LUPIN, MILK and SOY.

Nutrition information for IRONMAXX COLLAGEN POWDER ZERO (TROPICAL FLAVOUR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJE TROPIKALE

PËRBËRËSIT: kolagjen i hidrolizuar (gjedhi) (83%), rregullues aciditeti (acid citrik), aromë, ngjyrues (beta-karoten), inulinë, ëmbëlsues (sukralozë), acid L-askorbik.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, LUPINËS, QUMËSHTIT dhe SOJES.

Informacione ushqyese për IRONMAXX COLLAGEN POWDER ZERO (SHIJE TROPIKALE)'
WHERE Variant_Id IN (1152) AND HASHBYTES('SHA2_256', Ingredients) = 0x85031ED8756AF7A87B2510DC5536B33863A506F0D83066792FD91FB303D8FF5A;
SET @n += @@ROWCOUNT;
-- item 189
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: rice flour.

May contain traces of GLUTEN, EGGS, SOY, MILK, NUTS and SESAME.

Nutrition information for IRONMAXX INSTANT RICE PUDDING',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: miell orizi.

Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, SOJES, QUMËSHTIT, FRUTAVE ME LËVOZHGË dhe SUSAMIT.

Informacione ushqyese për IRONMAXX INSTANT RICE PUDDING'
WHERE Variant_Id IN (1153) AND HASHBYTES('SHA2_256', Ingredients) = 0x3606E264D5ED4A02EC05741FF1029FEF787DC1A2678947D555BDA735B34F44BF;
SET @n += @@ROWCOUNT;
-- item 190
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: Tribulus terrestris extract (83.3%), zinc gluconate (6.3%), coating (glazing agents (hydroxypropyl methylcellulose, hydroxypropyl cellulose), stabiliser (isomalt, stearic acid), colour (calcium carbonate)), anti-caking agents (magnesium stearate, silicon dioxide, talc), apple, blackcurrant and radish concentrate*, colours (carminic acid, riboflavin), MCT powder.

*Food colouring.

May contain traces of SOY, GLUTEN, MILK, CRASH and EGGS.

Nutrition information for TT ULTRA STRONG 100% TRIBULUS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ekstrakt Tribulus terrestris (83,3%), glukonat zinku (6,3%), veshje (agjentë lustrues (hidroksipropilmetilcelulozë, hidroksipropilcelulozë), stabilizues (izomalt, acid stearik), ngjyrues (karbonat kalciumi)), agjentë kundër ngjizjes (stearat magnezi, dioksid silici, talk), koncentrat molle, rrush pa fara të zi dhe rrepke*, ngjyrues (acid karminik, riboflavinë), MCT pluhur.

*Ngjyrues ushqimor.

Mund të përmbajë gjurmë të SOJES, GLUTENIT, QUMËSHTIT, CRASH dhe VEZËVE.

Informacione ushqyese për TT ULTRA STRONG 100% TRIBULUS'
WHERE Variant_Id IN (1166) AND HASHBYTES('SHA2_256', Ingredients) = 0x525FC41E1E1537F902ACD76E24249A8E19205499A86BA47BA2FBC8D6E1CF5591;
SET @n += @@ROWCOUNT;
-- item 191
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COCONUT

INGREDIENTS: protein blend (48%) (hydrolysed collagen (bovine), MILK protein, SOY protein isolate), humectant (glycerol), whole MILK chocolate coating with maltitol (13%) (sweetener [maltitol], cocoa butter, whole MILK powder, cocoa mass, emulsifier [lecithins], natural vanilla flavouring), palm fat, SOY protein crispies (3%) (SOY protein, rice semolina, SOY flour, salt), flavouring, coconut powder (1%) (coconut 87%, maltodextrin, sodium CASEINATE), inulin, salt, emulsifier (lecithins), sweetener (sucralose), antioxidant (DL-alpha-tocopherol).

May contain traces of EGGS and NUTS.

Excessive consumption may have a laxative effect.

Nutrition information for IRONMAXX ZENITH PROTEIN BAR (COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOKOS

PËRBËRËSIT: përzierje proteinash (48%) (kolagjen i hidrolizuar (gjedhi), proteinë QUMËSHTI, izolat i proteinës së SOJES), lagështues (glicerol), veshje çokollate me QUMËSHT të plotë me maltitol (13%) (ëmbëlsues [maltitol], gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues [lecitina], aromë natyrale vaniljeje), yndyrë palme, copa krokante proteine SOJE (3%) (proteinë SOJE, bollgur orizi, miell SOJE, kripë), aromë, kokos pluhur (1%) (kokos 87%, maltodekstrinë, KAZEINAT natriumi), inulinë, kripë, emulsifikues (lecitina), ëmbëlsues (sukralozë), antioksidant (DL-alfa-tokoferol).

Mund të përmbajë gjurmë të VEZËVE dhe FRUTAVE ME LËVOZHGË.

Konsumimi i tepërt mund të ketë efekt laksativ.

Informacione ushqyese për IRONMAXX ZENITH PROTEIN BAR (KOKOS)'
WHERE Variant_Id IN (1167) AND HASHBYTES('SHA2_256', Ingredients) = 0x80E3D47166452D88E79C708DE74AB94B8FB739972882328050931EBF42992671;
SET @n += @@ROWCOUNT;
-- item 192
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEANUT

INGREDIENTS: protein blend (50%) (hydrolysed collagen (bovine), MILK protein, SOY protein isolate), humectant (glycerol), MILK chocolate coating with maltitol (13%) (sweetener (maltitol), cocoa butter, whole MILK powder, cocoa mass, emulsifier (lecithins), natural vanilla flavouring), palm fat, chocolate SOY protein pieces (3%) (SOY protein isolate, cocoa, tapioca starch), flavouring, inulin, salt, emulsifier (lecithins), sweetener (sucralose), antioxidant (DL-alpha-tocopherol).

May contain traces of EGGS and NUTS.

Excessive consumption may have a laxative effect.

Nutrition information for IRONMAXX ZENITH PROTEIN BAR (PEANUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KIKIRIKË

PËRBËRËSIT: përzierje proteinash (50%) (kolagjen i hidrolizuar (gjedhi), proteinë QUMËSHTI, izolat i proteinës së SOJES), lagështues (glicerol), veshje çokollate QUMËSHTI me maltitol (13%) (ëmbëlsues (maltitol), gjalpë kakaoje, QUMËSHT i plotë pluhur, masë kakaoje, emulsifikues (lecitina), aromë natyrale vaniljeje), yndyrë palme, copa çokollate me proteinë SOJE (3%) (izolat i proteinës së SOJES, kakao, niseshte tapioke), aromë, inulinë, kripë, emulsifikues (lecitina), ëmbëlsues (sukralozë), antioksidant (DL-alfa-tokoferol).

Mund të përmbajë gjurmë të VEZËVE dhe FRUTAVE ME LËVOZHGË.

Konsumimi i tepërt mund të ketë efekt laksativ.

Informacione ushqyese për IRONMAXX ZENITH PROTEIN BAR (KIKIRIKË)'
WHERE Variant_Id IN (1168) AND HASHBYTES('SHA2_256', Ingredients) = 0xBB63224AEE7BF62781121A1A9D149AA0E0AA2FD202659FE3EBC5A9269D89EEBE;
SET @n += @@ROWCOUNT;
-- item 193
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEANUT

Protein blend (50%) (collagen hydrolysate (bovine), MILK protein, soy protein isolate), humectant (glycerol), maltitol, milk chocolate coating (13%) (sweetener (maltitol), cocoa butter, whole milk powder, cocoa mass, emulsifier (lecithins), natural vanilla flavouring), palm fat, chocolate soy protein crisps (3%) (soy protein isolate, cocoa, tapioca starch), flavouring, inulin, salt, emulsifier (lecithins), sweetener (sucralose), antioxidant (DL-alpha-tocopherol).

May contain traces of EGG and NUTS. Excessive consumption may have a laxative effect.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KIKIRIKË

Përzierje proteinash (50%) (hidrolizat kolagjeni (gjedhi), proteinë QUMËSHTI, izolat i proteinës së sojes), lagështues (glicerol), maltitol, veshje çokollate qumështi (13%) (ëmbëlsues (maltitol), gjalpë kakaoje, qumësht i plotë pluhur, masë kakaoje, emulsifikues (lecitina), aromë natyrale vaniljeje), yndyrë palme, copa çokollate me proteinë soje (3%) (izolat i proteinës së sojes, kakao, niseshte tapioke), aromë, inulinë, kripë, emulsifikues (lecitina), ëmbëlsues (sukralozë), antioksidant (DL-alfa-tokoferol).

Mund të përmbajë gjurmë të VEZËS dhe FRUTAVE ME LËVOZHGË. Konsumimi i tepërt mund të ketë efekt laksativ.'
WHERE Variant_Id IN (1171) AND HASHBYTES('SHA2_256', Ingredients) = 0xF01F2DF21AB9D9D1F2E2C0AF96B9A46989189017AEA2C24BB7B6C9AAC18C975F;
SET @n += @@ROWCOUNT;
-- item 194
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COCONUT

Protein blend (48%) (collagen hydrolysate (bovine), MILK protein, SOY protein isolate), humectant (glycerol), whole milk maltitol chocolate coating (13%) (sweetener [maltitol], cocoa butter, whole milk powder, cocoa mass, emulsifier [lecithins], natural vanilla flavouring), palm fat, soy protein crispy sticks (3%) (SOY protein, rice semolina, SOY flour, salt), flavouring, coconut powder (1%) (coconut 87%, maltodextrin, sodium CASEINATE), inulin, salt, emulsifier (lecithins), sweetener (sucralose), antioxidant (DL-alpha-tocopherol).

May contain traces of EGGS and NUTS. Excessive consumption may have a laxative effect.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOKOS

Përzierje proteinash (48%) (hidrolizat kolagjeni (gjedhi), proteinë QUMËSHTI, izolat i proteinës së SOJES), lagështues (glicerol), veshje çokollate me qumësht të plotë me maltitol (13%) (ëmbëlsues [maltitol], gjalpë kakaoje, qumësht i plotë pluhur, masë kakaoje, emulsifikues [lecitina], aromë natyrale vaniljeje), yndyrë palme, shkopinj krokantë proteine soje (3%) (proteinë SOJE, bollgur orizi, miell SOJE, kripë), aromë, kokos pluhur (1%) (kokos 87%, maltodekstrinë, KAZEINAT natriumi), inulinë, kripë, emulsifikues (lecitina), ëmbëlsues (sukralozë), antioksidant (DL-alfa-tokoferol).

Mund të përmbajë gjurmë të VEZËVE dhe FRUTAVE ME LËVOZHGË. Konsumimi i tepërt mund të ketë efekt laksativ.'
WHERE Variant_Id IN (1172) AND HASHBYTES('SHA2_256', Ingredients) = 0xCD56CD1735E82CD166B81F87ED8147F4247A29CA11576165C913F2F878CF4075;
SET @n += @@ROWCOUNT;
-- item 195
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLACKCURRANT

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), blackcurrant emulsion (glucose-fructose syrup, okra and carrot colouring concentrates, flavouring), taurine, L-carnitine, white emulsion (stabilisers E1450 and E445), preservatives (potassium sorbate, sodium benzoate), antioxidant (ascorbic acid), sweeteners (acesulfame K, sucralose), caffeine.

Nutrition information for NUTREND CARNITINE DRINK (BLACKCURRANT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'RRUSH PA FARA I ZI

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), emulsion rrushi pa fara të zi (shurup glukozë-fruktozë, koncentrate ngjyruese nga bamja dhe karota, aromë), taurinë, L-karnitinë, emulsion i bardhë (stabilizues E1450 dhe E445), konservues (sorbat kaliumi, benzoat natriumi), antioksidant (acid askorbik), ëmbëlsues (acesulfam K, sukralozë), kafeinë.

Informacione ushqyese për NUTREND CARNITINE DRINK (RRUSH PA FARA I ZI)'
WHERE Variant_Id IN (1181) AND HASHBYTES('SHA2_256', Ingredients) = 0xFA115A3F5D925AE0B4605D952C67EEC1AB0E45194607260336DB6F2BC8CB702F;
SET @n += @@ROWCOUNT;
-- item 196
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COLA (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), carbon dioxide, cola emulsion (flavouring, colour E150d), L-carnitine, taurine, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), caffeine.

Nutrition information for NUTREND CARNITINE DRINK (COLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOLA (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), dioksid karboni, emulsion kole (aromë, ngjyrues E150d), L-karnitinë, taurinë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), kafeinë.

Informacione ushqyese për NUTREND CARNITINE DRINK (KOLA)'
WHERE Variant_Id IN (1182) AND HASHBYTES('SHA2_256', Ingredients) = 0xA84595778797416C59E9EDCECC4D7151F38B00BE9BB12D3D44A54DC39A17B09B;
SET @n += @@ROWCOUNT;
-- item 197
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MANGO AND COCONUT (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), carbon dioxide, mango emulsion (flavouring, colours Sunset Yellow (E110), Tartrazine (E102)), L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweetener (acesulfame K), caffeine, sweetener (sucralose).

E110 and E102 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (MANGO-COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANGO DHE KOKOS (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), dioksid karboni, emulsion mango (aromë, ngjyrues Sunset Yellow (E110), Tartrazine (E102)), L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K), kafeinë, ëmbëlsues (sukralozë).

E110 dhe E102 mund të kenë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (MANGO-KOKOS)'
WHERE Variant_Id IN (1184) AND HASHBYTES('SHA2_256', Ingredients) = 0xCD51FAA944BF389F64338D123A62C1A971F90242BB0D24D67BFEAC3739325141;
SET @n += @@ROWCOUNT;
-- item 198
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MIXED BERRIES

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), taurine, L-carnitine, black carrot concentrate, base white emulsion (E1450, E445, E300, E307), preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucrose), caffeine, flavouring.

Nutrition information for NUTREND CARNITINE DRINK (MIXED BERRIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MIKS MANAFERRASH

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), taurinë, L-karnitinë, koncentrat karote të zezë, emulsion bazë i bardhë (E1450, E445, E300, E307), konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, saharozë), kafeinë, aromë.

Informacione ushqyese për NUTREND CARNITINE DRINK (MIKS MANAFERRASH)'
WHERE Variant_Id IN (1185) AND HASHBYTES('SHA2_256', Ingredients) = 0x52E0B048EE4D34703103DD248BD0ABDEBAC4E121E02B7802EEA84B2360613476;
SET @n += @@ROWCOUNT;
-- item 199
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'MOJITO (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), carbon dioxide, taurine, L-carnitine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweetener (acesulfame K), caffeine, sweetener (sucralose), colour (E104).

E104 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (MOJITO)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MOJITO (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), dioksid karboni, taurinë, L-karnitinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K), kafeinë, ëmbëlsues (sukralozë), ngjyrues (E104).

E104 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (MOJITO)'
WHERE Variant_Id IN (1186) AND HASHBYTES('SHA2_256', Ingredients) = 0x2A9E47C3E3D2AE11974DB8F1F27844B310AD579F1404EFDEE91E29C9D128D4A5;
SET @n += @@ROWCOUNT;
-- item 200
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PINEAPPLE

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), pineapple emulsion (flavouring, colours E102 and E110), taurine, L-carnitine, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), caffeine.

E102 and E110 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (PINEAPPLE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ANANAS

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), emulsion ananasi (aromë, ngjyrues E102 dhe E110), taurinë, L-karnitinë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), kafeinë.

E102 dhe E110 mund të kenë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (ANANAS)'
WHERE Variant_Id IN (1187) AND HASHBYTES('SHA2_256', Ingredients) = 0x91457ACD43395BD6C2186556E96634F9A989923CB94B4ED54A9D7150F021B86E;
SET @n += @@ROWCOUNT;
-- item 201
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), carbon dioxide, L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweetener (acesulfame K), caffeine, sweetener (sucralose), colour (E122).

E122 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), dioksid karboni, L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K), kafeinë, ëmbëlsues (sukralozë), ngjyrues (E122).

E122 mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (MJEDËR)'
WHERE Variant_Id IN (1188) AND HASHBYTES('SHA2_256', Ingredients) = 0x0B45E92371EBFDB1099594F43B66F48CC93B80C09C5CAAA2D9BF0EEE1D3A5D76;
SET @n += @@ROWCOUNT;
-- item 202
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLOOD ORANGE

INGREDIENTS: water, orange emulsion (flavouring, colours E129 and E104), stabiliser (polydextrose), acidity regulator (citric acid), taurine, L-carnitine, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), caffeine.

E129 and E104 may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (BLOOD ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL I KUQ

PËRBËRËSIT: ujë, emulsion portokalli (aromë, ngjyrues E129 dhe E104), stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), taurinë, L-karnitinë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), kafeinë.

E129 dhe E104 mund të kenë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (PORTOKALL I KUQ)'
WHERE Variant_Id IN (1189) AND HASHBYTES('SHA2_256', Ingredients) = 0x8D4D90FB6C468EE4E8A3D1B5212C25EFE1491CBB14FB888EEB9CEB7C4A753873;
SET @n += @@ROWCOUNT;
-- item 203
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY AND MINT (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), carbon dioxide, L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), caffeine, colours (E150c, azorubine).

Azorubine may have an adverse effect on activity and attention in children.

Nutrition information for NUTREND CARNITINE DRINK (STRAWBERRY AND MINT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE DHE MENTË (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), dioksid karboni, L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), kafeinë, ngjyrues (E150c, azorubinë).

Azorubina mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Informacione ushqyese për NUTREND CARNITINE DRINK (LULESHTRYDHE DHE MENTË)'
WHERE Variant_Id IN (1190) AND HASHBYTES('SHA2_256', Ingredients) = 0x10D801A85976A0DDF894916EB7D9C6A064E31CFF0B725E510357E506769DF628;
SET @n += @@ROWCOUNT;
-- item 204
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GREEN APPLE (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), carbon dioxide, acidity regulator (malic acid), L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), nicotinamide.

Nutrition information for NUTREND CARNITINE DRINK (CAFFEINE FREE) (GREEN APPLE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MOLLË JESHILE (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), dioksid karboni, rregullues aciditeti (acid malik), L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), nikotinamid.

Informacione ushqyese për NUTREND CARNITINE DRINK (CAFFEINE FREE) (MOLLË JESHILE)'
WHERE Variant_Id IN (1191) AND HASHBYTES('SHA2_256', Ingredients) = 0x6686F75EAD3CB292929B99F8D9BD92E417423CD4A1FF63272FB0A89041A8EB5B;
SET @n += @@ROWCOUNT;
-- item 205
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLACKBERRY - LIME

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), vitamin B3 (nicotinamide).

Nutrition information for NUTREND CARNITINE DRINK (CAFFEINE FREE) (BLACKBERRY - LIME)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANAFERRË E ZEZË - LIME

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), vitamina B3 (nikotinamid).

Informacione ushqyese për NUTREND CARNITINE DRINK (CAFFEINE FREE) (MANAFERRË E ZEZË - LIME)'
WHERE Variant_Id IN (1192) AND HASHBYTES('SHA2_256', Ingredients) = 0x3B85447833F4904B1E9E68D3130AE6955034D4201BE45C867CED3DEE1A6C70C4;
SET @n += @@ROWCOUNT;
-- item 206
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ELDERFLOWER AND MINT

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), magnesium citrate – Aquamin, carbon dioxide, L-carnitine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), pyridoxine hydrochloride.

Nutrition information for NUTREND CARNITINE DRINK (ELDERFLOWER AND MINT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULE SHTOGU DHE MENTË

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), citrat magnezi – Aquamin, dioksid karboni, L-karnitinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), piridoksinë hidroklorur.

Informacione ushqyese për NUTREND CARNITINE DRINK (LULE SHTOGU DHE MENTË)'
WHERE Variant_Id IN (1193) AND HASHBYTES('SHA2_256', Ingredients) = 0x636C483B1C00393C06EA3AF17042844311F644683ADE433126C8D3A0526EE38D;
SET @n += @@ROWCOUNT;
-- item 207
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: L-arginine hydrochloride, anti-caking agent (magnesium salts of fatty acids); capsule (gelatine).

Nutrition information for OLIMP ARGI POWER',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: L-argininë hidroklorur, agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore); kapsulë (xhelatinë).

Informacione ushqyese për OLIMP ARGI POWER'
WHERE Variant_Id IN (1194) AND HASHBYTES('SHA2_256', Ingredients) = 0x1E3B4C9B66468017E4AEA558B3B7A62F092B905B2F04B2789BDFD83306CEDF81;
SET @n += @@ROWCOUNT;
-- item 208
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: ashwagandha root extract (Withania somnifera (L.) Dunal), bulking agent (microcrystalline cellulose), anti-caking agents (magnesium salts of fatty acids, silicon dioxide); capsule (gelatine).

Nutrition information for OLIMP ASHWAGANDHA 600 SPORT',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ekstrakt rrënje ashwagandha (Withania somnifera (L.) Dunal), agjent për rritjen e vëllimit (celulozë mikrokristaline), agjentë kundër ngjizjes (kripëra magnezi të acideve yndyrore, dioksid silici); kapsulë (xhelatinë).

Informacione ushqyese për OLIMP ASHWAGANDHA 600 SPORT'
WHERE Variant_Id IN (1195) AND HASHBYTES('SHA2_256', Ingredients) = 0xD2E4D2E3F34A3D36C4C3D6DF3C3F03530F871A863124F008CBAAF693A15406DC;
SET @n += @@ROWCOUNT;
-- item 209
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: free-form BCAA amino acids (L-leucine, L-valine, L-isoleucine), acidity regulators (citric acid, sodium citrates), L-glutamine, flavourings, thickener (gum arabic), sweeteners (acesulfame K, sucralose), anti-caking agents (calcium phosphates, silicon dioxide), emulsifier (SOY lecithins), vitamin B6 (pyridoxine hydrochloride), colour (carotenes).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP BCAA XPLODE POWDER (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: aminoacide BCAA të lira (L-leucinë, L-valinë, L-izoleucinë), rregullues aciditeti (acid citrik, citrate natriumi), L-glutaminë, aroma, trashës (gomë arabike), ëmbëlsues (acesulfam K, sukralozë), agjentë kundër ngjizjes (fosfate kalciumi, dioksid silici), emulsifikues (lecitina SOJE), vitamina B6 (piridoksinë hidroklorur), ngjyrues (karotene).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP BCAA XPLODE POWDER (PORTOKALL)'
WHERE Variant_Id IN (1196) AND HASHBYTES('SHA2_256', Ingredients) = 0x263379B2F4E9740CC0135137A25CAEEBA8A28BBF6C5B584FCCB37FE68FA1A607;
SET @n += @@ROWCOUNT;
-- item 210
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients: free-form BCAA amino acids (L-leucine, L-valine, L-isoleucine), whey protein hydrolysate (from MILK), acidity regulators (citric acid, sodium citrates, malic acid), flavourings, thickeners (gum arabic, xanthan gum, sodium carboxymethyl cellulose), colour - E150d (for cola flavour), sweeteners (acesulfame K, sucralose, cyclamates (for cola flavour)), anti-caking agents (calcium phosphates, silicon dioxide), emulsifier (lecithins (from soy)), vitamin B6 (pyridoxine hydrochloride), colours: beta-carotene (for orange flavour), carmine (for orange and fruit punch flavours).',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit: aminoacide BCAA të lira (L-leucinë, L-valinë, L-izoleucinë), hidrolizat i proteinës së hirrës (nga QUMËSHTI), rregullues aciditeti (acid citrik, citrate natriumi, acid malik), aroma, trashës (gomë arabike, gomë ksantani, karboksimetil celulozë natriumi), ngjyrues - E150d (për shijen kola), ëmbëlsues (acesulfam K, sukralozë, ciklamate (për shijen kola)), agjentë kundër ngjizjes (fosfate kalciumi, dioksid silici), emulsifikues (lecitina (nga soja)), vitamina B6 (piridoksinë hidroklorur), ngjyrues: beta-karoten (për shijen portokall), karminë (për shijet portokall dhe punch frutash).'
WHERE Variant_Id IN (1197) AND HASHBYTES('SHA2_256', Ingredients) = 0xB1D1495AAF15894712081829FABCEAF4F3B4E758F43EE7B2A4FD54F1FD35D6E2;
SET @n += @@ROWCOUNT;
-- item 211
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: bulking agent (cellulose), beta-alanine, sodium citrate, L-histidine hydrochloride, anti-caking agent (magnesium salts of fatty acids), thickener (cross-linked sodium carboxymethyl cellulose), anti-caking agent (silicon dioxide), pyridoxine hydrochloride (vitamin B6).

Nutrition information for BETA ALANINE CARNO RUSH',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: agjent për rritjen e vëllimit (celulozë), beta-alaninë, citrat natriumi, L-histidinë hidroklorur, agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore), trashës (karboksimetil celulozë natriumi e ndërlidhur), agjent kundër ngjizjes (dioksid silici), piridoksinë hidroklorur (vitamina B6).

Informacione ushqyese për BETA ALANINE CARNO RUSH'
WHERE Variant_Id IN (1198) AND HASHBYTES('SHA2_256', Ingredients) = 0x7602CEE81865B29128391432C3DD4F01031541E794F88FC106130728C48E156F;
SET @n += @@ROWCOUNT;
-- item 212
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: beta-alanine, acidity regulators (citric acid, malic acid), sodium bicarbonate, potassium salts of orthophosphoric acid, flavourings, anti-caking agent (silicon dioxide), L-histidine hydrochloride, pyridoxine hydrochloride (vitamin B6), sweeteners (acesulfame K, sucralose), colour (carotenes).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for BETA-ALANINE XPLODE POWDER (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: beta-alaninë, rregullues aciditeti (acid citrik, acid malik), bikarbonat natriumi, kripëra kaliumi të acidit ortofosforik, aroma, agjent kundër ngjizjes (dioksid silici), L-histidinë hidroklorur, piridoksinë hidroklorur (vitamina B6), ëmbëlsues (acesulfam K, sukralozë), ngjyrues (karotene).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për BETA-ALANINE XPLODE POWDER (PORTOKALL)'
WHERE Variant_Id IN (1199) AND HASHBYTES('SHA2_256', Ingredients) = 0x97715DF6A27D535C55836CE819DD15C3BF7D425FC46712FACC03829E3E5F078F;
SET @n += @@ROWCOUNT;
-- item 213
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOL SOUR LEMONADE

INGREDIENTS: citrulline malate, acidity regulator (sodium citrate), natural lemon flavouring, natural mint flavouring, sweeteners (acesulfame K, sucralose), anti-caking agent (silicon dioxide), pyridoxine hydrochloride (vitamin B6).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP CITRULLINE MALATE (COOL SOUR LEMONADE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMONADË E THARTË E FTOHTË

PËRBËRËSIT: citrulinë malat, rregullues aciditeti (citrat natriumi), aromë natyrale limoni, aromë natyrale mente, ëmbëlsues (acesulfam K, sukralozë), agjent kundër ngjizjes (dioksid silici), piridoksinë hidroklorur (vitamina B6).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP CITRULLINE MALATE (LIMONADË E THARTË E FTOHTË)'
WHERE Variant_Id IN (1204) AND HASHBYTES('SHA2_256', Ingredients) = 0x71F257EDE9279F8BEB95A044B2572E915955582D8E03E7F1532AFAFC57B07E00;
SET @n += @@ROWCOUNT;
-- item 214
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: 100% micronised creatine monohydrate.

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP CREATINE MONOHYDRATE POWDER',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: 100% kreatinë monohidrat e mikronizuar.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP CREATINE MONOHYDRATE POWDER'
WHERE Variant_Id IN (1205) AND HASHBYTES('SHA2_256', Ingredients) = 0x686204F8F9E53403F82D862DB34AB8FDB19A03BB830935F78A092EDCC930BA6A;
SET @n += @@ROWCOUNT;
-- item 215
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: MATRIX 6 STRONG BLEND (creatine citrate, creatine malate, creatine ethyl ester HCl, Creatine MagnaPower™ (creatine, magnesium salts of citric acid, magnesium salts of orthophosphoric acid), creatine alpha-ketoglutarate, creatine pyruvate), taurine, flavourings, acidity regulator (sodium citrates), anti-caking agent (silicon dioxide), sweeteners (acesulfame K, sucralose), colour (carotenes).

Nutrition information for OLIMP CREATINE XPLODE (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: MATRIX 6 STRONG BLEND (citrat kreatine, malat kreatine, etil ester kreatine HCl, Creatine MagnaPower™ (kreatinë, kripëra magnezi të acidit citrik, kripëra magnezi të acidit ortofosforik), alfa-ketoglutarat kreatine, piruvat kreatine), taurinë, aroma, rregullues aciditeti (citrate natriumi), agjent kundër ngjizjes (dioksid silici), ëmbëlsues (acesulfam K, sukralozë), ngjyrues (karotene).

Informacione ushqyese për OLIMP CREATINE XPLODE (PORTOKALL)'
WHERE Variant_Id IN (1206) AND HASHBYTES('SHA2_256', Ingredients) = 0x57784E0DD342FF1C2F6DF28DCD3A5E6D52AB952DF2595D573560EA13611EED85;
SET @n += @@ROWCOUNT;
-- item 216
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: L-glutamine, L-leucine, thickener (gum arabic), acidity regulators (citric acid, sodium citrates), flavourings, colour E109 (for cola flavour), cystine, microencapsulated L-ascorbic acid (PureWay-C®) (L-ascorbic acid – vitamin C, citrus bioflavonoids), sweeteners (acesulfame K, sucralose), nicotinamide (niacin), sodium selenite, citrus bioflavonoids, cyanocobalamin (vitamin B12), pyridoxine hydrochloride (vitamin B6), pteroylmonoglutamic acid (folic acid), colours: carotenes (A), carmine (B), riboflavins (C), E150c (D), E150d (E), E133 (F), Patent Blue V (G), indigo carmine (H), chlorophylls and chlorophyllins (I), curcumin (J), anthocyanins (K), paprika extract (L), betanin (M), vegetable carbon (N).

(A)–(Z): Depending on the product flavour. For the ingredients used, see the symbols (A–Z) printed next to the minimum durability date ("best before").

Produced in a facility '
  + N'that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP GLUTAMINE XPLODE POWDER',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: L-glutaminë, L-leucinë, trashës (gomë arabike), rregullues aciditeti (acid citrik, citrate natriumi), aroma, ngjyrues E109 (për shijen kola), cistinë, acid L-askorbik i mikrokapsuluar (PureWay-C®) (acid L-askorbik – vitamina C, bioflavonoide agrumesh), ëmbëlsues (acesulfam K, sukralozë), nikotinamid (niacinë), selenit natriumi, bioflavonoide agrumesh, cianokobalaminë (vitamina B12), piridoksinë hidroklorur (vitamina B6), acid pteroilmonoglutamik (acid folik), ngjyrues: karotene (A), karminë (B), riboflavina (C), E150c (D), E150d (E), E133 (F), Patent Blue V (G), karminë indigo (H), klorofile dhe klorofiline (I), kurkuminë (J), antocianine (K), ekstrakt paprike (L), betaninë (M), karbon bimor (N).

(A)–(Z): Në varësi të shijes së produktit. Për përbërësit e përdorur shihni simbolet (A–Z) të shënuara pranë datës së qëndrueshmërisë minimale '
  + N'("më mirë para").

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP GLUTAMINE XPLODE POWDER'
WHERE Variant_Id IN (1207) AND HASHBYTES('SHA2_256', Ingredients) = 0x4455B20B33965E9F4131A14547EEADA2AFBBAA4136278BC30CE4B94432312CC8;
SET @n += @@ROWCOUNT;
-- item 217
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: hydrolysed collagen, bulking agent (sorbitols), minerals (calcium carbonate, magnesium carbonate), acidity regulator (malic acid), maltodextrin, flavourings, anti-caking agent (magnesium salts of fatty acids), vitamins (L-ascorbic acid – vitamin C, pyridoxine hydrochloride – vitamin B6), sweeteners (sucralose, acesulfame K).

Nutrition information for KOLAGEN ACTIV PLUS (CITRUS)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kolagjen i hidrolizuar, agjent për rritjen e vëllimit (sorbitole), minerale (karbonat kalciumi, karbonat magnezi), rregullues aciditeti (acid malik), maltodekstrinë, aroma, agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore), vitamina (acid L-askorbik – vitamina C, piridoksinë hidroklorur – vitamina B6), ëmbëlsues (sukralozë, acesulfam K).

Informacione ushqyese për KOLAGEN ACTIV PLUS (AGRUME)'
WHERE Variant_Id IN (1208) AND HASHBYTES('SHA2_256', Ingredients) = 0x5EB3A171A471BDA2E6E48B590FF62D029754FF24DB6D81C409AC35122CBF1544;
SET @n += @@ROWCOUNT;
-- item 218
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: L-glutamine powder.

Nutrition information for L-GLUTAMINE POWDER (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: L-glutaminë pluhur.

Informacione ushqyese për L-GLUTAMINE POWDER (PA SHIJE)'
WHERE Variant_Id IN (1209) AND HASHBYTES('SHA2_256', Ingredients) = 0x5B6D39BE914D2D127B899737850621A0E44DABE1193F8F70A43205B99CA91F20;
SET @n += @@ROWCOUNT;
-- item 219
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: 97.5% whey protein isolate (from MILK), flavourings, acidity regulators (citric acid, malic acid), thickeners (gum arabic, xanthan gum, sodium carboxymethyl cellulose), sweeteners (acesulfame K, sucralose), salt, vitamins (L-ascorbic acid – vitamin C, DL-alpha-tocopheryl acetate – vitamin E, nicotinamide – niacin, D-biotin, retinyl acetate – vitamin A, calcium D-pantothenate – pantothenic acid, pyridoxine hydrochloride – vitamin B6, cholecalciferol – vitamin D, pteroylmonoglutamic acid – folate, thiamine mononitrate – vitamin B1, riboflavin – vitamin B2, cyanocobalamin – vitamin B12), emulsifier (SOY lecithins), colour (E150c).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP PURE WHEY ISOLATE 95 (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: 97,5% izolat i proteinës së hirrës (nga QUMËSHTI), aroma, rregullues aciditeti (acid citrik, acid malik), trashës (gomë arabike, gomë ksantani, karboksimetil celulozë natriumi), ëmbëlsues (acesulfam K, sukralozë), kripë, vitamina (acid L-askorbik – vitamina C, DL-alfa-tokoferil acetat – vitamina E, nikotinamid – niacinë, D-biotinë, retinil acetat – vitamina A, D-pantotenat kalciumi – acid pantotenik, piridoksinë hidroklorur – vitamina B6, kolekalciferol – vitamina D, acid pteroilmonoglutamik – folat, tiaminë mononitrat – vitamina B1, riboflavinë – vitamina B2, cianokobalaminë – vitamina B12), emulsifikues (lecitina SOJE), ngjyrues (E150c).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

'
  + N'Informacione ushqyese për OLIMP PURE WHEY ISOLATE 95 (ÇOKOLLATË)'
WHERE Variant_Id IN (1210) AND HASHBYTES('SHA2_256', Ingredients) = 0xD8444D7FD8657C995552089EB375010BEA3B07D2FD1E0CF53FCDF6E6A5A6A382;
SET @n += @@ROWCOUNT;
-- item 220
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'VANILLA

INGREDIENTS: 97.5% whey protein isolate (from MILK), flavourings, acidity regulators (citric acid, malic acid), thickeners (gum arabic, xanthan gum, sodium carboxymethyl cellulose), sweeteners (acesulfame K, sucralose), salt, vitamins (L-ascorbic acid – vitamin C, DL-alpha-tocopheryl acetate – vitamin E, nicotinamide – niacin, D-biotin, retinyl acetate – vitamin A, calcium D-pantothenate – pantothenic acid, pyridoxine hydrochloride – vitamin B6, cholecalciferol – vitamin D, pteroylmonoglutamic acid – folate, thiamine mononitrate – vitamin B1, riboflavin – vitamin B2, cyanocobalamin – vitamin B12), emulsifier (SOY lecithins).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP PURE WHEY ISOLATE 95 (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VANILJE

PËRBËRËSIT: 97,5% izolat i proteinës së hirrës (nga QUMËSHTI), aroma, rregullues aciditeti (acid citrik, acid malik), trashës (gomë arabike, gomë ksantani, karboksimetil celulozë natriumi), ëmbëlsues (acesulfam K, sukralozë), kripë, vitamina (acid L-askorbik – vitamina C, DL-alfa-tokoferil acetat – vitamina E, nikotinamid – niacinë, D-biotinë, retinil acetat – vitamina A, D-pantotenat kalciumi – acid pantotenik, piridoksinë hidroklorur – vitamina B6, kolekalciferol – vitamina D, acid pteroilmonoglutamik – folat, tiaminë mononitrat – vitamina B1, riboflavinë – vitamina B2, cianokobalaminë – vitamina B12), emulsifikues (lecitina SOJE).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese '
  + N'për OLIMP PURE WHEY ISOLATE 95 (VANILJE)'
WHERE Variant_Id IN (1211) AND HASHBYTES('SHA2_256', Ingredients) = 0xCBBA75B15FE8F010D9C538806F6746DC8B97CC0ADDBBB48A7D53BF74D48A08C3;
SET @n += @@ROWCOUNT;
-- item 221
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Red punch

INGREDIENTS: L-arginine alpha-ketoglutarate, beta-alanine, citrulline malate, creatine monohydrate, anti-caking agents (calcium phosphates, silicon dioxide), sodium citrate, creatine malate, acidity regulator (citric acid), flavouring, L-tyrosine, caffeine, sweeteners (acesulfame K, sucralose), nicotinamide (niacin), cayenne pepper fruit extract (Capsicum annuum L.), black pepper fruit extract (Piper nigrum L.), thickener (sodium carboxymethyl cellulose), pyridoxine hydrochloride (vitamin B6), thiamine hydrochloride (vitamin B1), colour (carmine).

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP REDWEILER (Red punch)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Punch i kuq

PËRBËRËSIT: L-argininë alfa-ketoglutarat, beta-alaninë, citrulinë malat, kreatinë monohidrat, agjentë kundër ngjizjes (fosfate kalciumi, dioksid silici), citrat natriumi, malat kreatine, rregullues aciditeti (acid citrik), aromë, L-tirozinë, kafeinë, ëmbëlsues (acesulfam K, sukralozë), nikotinamid (niacinë), ekstrakt fruti speci djegës kajen (Capsicum annuum L.), ekstrakt fruti piperi të zi (Piper nigrum L.), trashës (karboksimetil celulozë natriumi), piridoksinë hidroklorur (vitamina B6), tiaminë hidroklorur (vitamina B1), ngjyrues (karminë).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP REDWEILER (Punch i kuq)'
WHERE Variant_Id IN (1212) AND HASHBYTES('SHA2_256', Ingredients) = 0x5762EC446D62769278907BAAF29DFCCE6F2485FEB5E5883A97E60FE04897284A;
SET @n += @@ROWCOUNT;
-- item 222
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate, L-citrulline, L-arginine hydrochloride, taurine, acidity regulator (citric acid), flavourings, beta-alanine, thickener (gum arabic), N-acetyl-L-tyrosine, anti-caking agent (silicon dioxide), Rhodiola rosea root extract (Rhodiola rosea L.), Bacopa monnieri herb extract (Bacopa monnieri (L.) Wettst.), caffeine, sweeteners (acesulfame K, sucralose), emulsifiers (SOY lecithins, polyoxyethylene sorbitan monooleate – polysorbate 80), Schisandra chinensis fruit extract (Schisandra chinensis (Turcz.) Baill.), colours: carotenes (A), carmine (B), riboflavins (C), E150c (D), E150d (E), E133 (F), Patent Blue V (G), indigo carmine (H), chlorophylls and chlorophyllins (I), curcumin (J), anthocyanins (K), paprika extract (L), betanin (M), vegetable carbon (N).

(A)–(Z): Depending on the product flavour. For the colours used, see the symbols (A–Z) printed next to '
  + N'the minimum durability date ("best before").

Produced in a facility that processes products containing MILK, EGGS, SOY, NUTS, PEANUTS, CEREALS CONTAINING GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP R-WEILER FOCUS (CRANBERRY JUICE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat, L-citrulinë, L-argininë hidroklorur, taurinë, rregullues aciditeti (acid citrik), aroma, beta-alaninë, trashës (gomë arabike), N-acetil-L-tirozinë, agjent kundër ngjizjes (dioksid silici), ekstrakt rrënje Rhodiola rosea (Rhodiola rosea L.), ekstrakt bime Bacopa monnieri (Bacopa monnieri (L.) Wettst.), kafeinë, ëmbëlsues (acesulfam K, sukralozë), emulsifikues (lecitina SOJE, polioksietilen sorbitan monooleat – polisorbat 80), ekstrakt fruti Schisandra chinensis (Schisandra chinensis (Turcz.) Baill.), ngjyrues: karotene (A), karminë (B), riboflavina (C), E150c (D), E150d (E), E133 (F), Patent Blue V (G), karminë indigo (H), klorofile dhe klorofiline (I), kurkuminë (J), antocianine (K), ekstrakt paprike (L), betaninë (M), karbon bimor (N).

(A)–(Z): Në varësi të shijes së produktit. Për ngjyruesit e përdorur shihni simbolet (A–Z) '
  + N'të shënuara pranë datës së qëndrueshmërisë minimale ("më mirë para").

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, SOJE, FRUTA ME LËVOZHGË, KIKIRIKË, DRITHËRA QË PËRMBAJNË GLUTEN, PESHK, KRUSTACE dhe MOLUSQE.

Informacione ushqyese për OLIMP R-WEILER FOCUS (LËNG BORONICE)'
WHERE Variant_Id IN (1215) AND HASHBYTES('SHA2_256', Ingredients) = 0x375160DE31642079855F9381DA6124CBFC3B3243213F71B6CF0A7EB547D04FC9;
SET @n += @@ROWCOUNT;
-- item 223
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: taurine, bulking agent (microcrystalline cellulose), anti-caking agent (magnesium salts of fatty acids); capsule (gelatine).

Nutrition information for OLIMP TAURINE MEGA CAPS',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: taurinë, agjent për rritjen e vëllimit (celulozë mikrokristaline), agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore); kapsulë (xhelatinë).

Informacione ushqyese për OLIMP TAURINE MEGA CAPS'
WHERE Variant_Id IN (1220) AND HASHBYTES('SHA2_256', Ingredients) = 0x7591E12CE2B3CAE3CEEA30FC6B294C87845A94D7FB3F80607C0D1DD3ACD8C7E6;
SET @n += @@ROWCOUNT;
-- item 224
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: 80.6% Tribulus terrestris extract, bulking agent (microcrystalline cellulose), anti-caking agent (magnesium salts of fatty acids); capsule (gelatine, colour E172).

Nutrition information for OLIMP TRIBUSTERON 90',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: 80,6% ekstrakt Tribulus terrestris, agjent për rritjen e vëllimit (celulozë mikrokristaline), agjent kundër ngjizjes (kripëra magnezi të acideve yndyrore); kapsulë (xhelatinë, ngjyrues E172).

Informacione ushqyese për OLIMP TRIBUSTERON 90'
WHERE Variant_Id IN (1221) AND HASHBYTES('SHA2_256', Ingredients) = 0xDCB025773646C58C51B6F1CC461164CB7D4D63119C352FD9719830ED03367ACD;
SET @n += @@ROWCOUNT;
-- item 225
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: micellar casein (88%) (MILK) (emulsifier: sunflower lecithin), fat-reduced cocoa powder, flavourings, sodium chloride, stabiliser (sodium carboxymethyl cellulose), magnesium oxide, sweeteners (sucralose, acesulfame K), zinc oxide.

May contain GLUTEN, EGGS, SOY, NUTS and PEANUTS.

Nutrition information for OPTIMUM CASEIN (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: kazeinë micelare (88%) (QUMËSHT) (emulsifikues: lecitinë luledielli), kakao pluhur me pak yndyrë, aroma, klorur natriumi, stabilizues (karboksimetil celulozë natriumi), oksid magnezi, ëmbëlsues (sukralozë, acesulfam K), oksid zinku.

Mund të përmbajë GLUTEN, VEZË, SOJE, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM CASEIN (ÇOKOLLATË)'
WHERE Variant_Id IN (1226) AND HASHBYTES('SHA2_256', Ingredients) = 0x92E772565EF50459A662538EB8209E52509621B80CFB0ED57ABB5FB9A14725D5;
SET @n += @@ROWCOUNT;
-- item 226
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate.

May contain MILK, GLUTEN, EGGS, SOY, NUTS and PEANUTS.

Nutrition information for OPTIMUM CREATINE POWDER (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat.

Mund të përmbajë QUMËSHT, GLUTEN, VEZË, SOJE, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM CREATINE POWDER (PA SHIJE)'
WHERE Variant_Id IN (1227) AND HASHBYTES('SHA2_256', Ingredients) = 0x46CFEE8C23B311DCDE807D28191F028887E1C973D1F9C7B0912DE270F9FA0E28;
SET @n += @@ROWCOUNT;
-- item 227
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE

INGREDIENTS: whey protein isolates (MILK) (94%) (whey protein isolate, hydrolysed whey protein isolate, emulsifier: SOY lecithin), flavourings (MILK), fat-reduced cocoa powder, sodium chloride, thickener (xanthan gum), sweetener (sucralose).

May contain GLUTEN, EGGS, NUTS and PEANUTS.

Nutrition information for OPTIMUM GOLD STANDARD 100% ISOLATE (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË

PËRBËRËSIT: izolate të proteinës së hirrës (QUMËSHT) (94%) (izolat i proteinës së hirrës, izolat i hidrolizuar i proteinës së hirrës, emulsifikues: lecitinë SOJE), aroma (QUMËSHT), kakao pluhur me pak yndyrë, klorur natriumi, trashës (gomë ksantani), ëmbëlsues (sukralozë).

Mund të përmbajë GLUTEN, VEZË, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM GOLD STANDARD 100% ISOLATE (ÇOKOLLATË)'
WHERE Variant_Id IN (1228) AND HASHBYTES('SHA2_256', Ingredients) = 0x64F7D8CE4E09D59FC237959F239BE9B51CD229B45327D9705FE98F66690CEAE3;
SET @n += @@ROWCOUNT;
-- item 228
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COOKIES AND CREAM

INGREDIENTS: whey protein concentrate, MILK chocolate (sugar, cocoa powder, whole MILK powder, cocoa butter 20%, natural flavouring), flavourings (biscuit, cream), salt, sweetener (steviol glycosides), thickener (xanthan gum), whey protein isolate, lactase enzyme.

May contain traces of EGGS, GLUTEN, SOY, PEANUTS, NUTS, CELERY, FISH and CRUSTACEANS.

Nutrition information for 100% NATURAL WHEY PROTEIN (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTA DHE KREM

PËRBËRËSIT: koncentrat i proteinës së hirrës, çokollatë QUMËSHTI (sheqer, kakao pluhur, QUMËSHT i plotë pluhur, gjalpë kakaoje 20%, aromë natyrale), aroma (biskotë, krem), kripë, ëmbëlsues (glikozide steviolike), trashës (gomë ksantani), izolat i proteinës së hirrës, enzimë laktazë.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për 100% NATURAL WHEY PROTEIN (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1241) AND HASHBYTES('SHA2_256', Ingredients) = 0x01F3C729029040E8D85ED210757FA12D0423BEAD12AF4C7C91799613366F5C74;
SET @n += @@ROWCOUNT;
-- item 229
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ICED COFFEE

INGREDIENTS: whey protein concentrate (from MILK), flavourings (iced coffee, coffee, cream), instant coffee (emulsifier: SOY lecithin), white chocolate powder (sugar, cocoa butter 33.4%, whole MILK powder), salt, sweetener (steviol glycosides), thickener (xanthan gum), whey protein isolate (from MILK), lactase enzyme.

May contain traces of EGGS, GLUTEN, PEANUTS, NUTS, CELERY, FISH and CRUSTACEANS.

Contains caffeine (17 mg/30 g). Not recommended for children or pregnant women.

Nutrition information for 100% NATURAL WHEY PROTEIN (ICED COFFEE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KAFE E FTOHTË

PËRBËRËSIT: koncentrat i proteinës së hirrës (nga QUMËSHTI), aroma (kafe e ftohtë, kafe, krem), kafe e çastit (emulsifikues: lecitinë SOJE), çokollatë e bardhë pluhur (sheqer, gjalpë kakaoje 33,4%, QUMËSHT i plotë pluhur), kripë, ëmbëlsues (glikozide steviolike), trashës (gomë ksantani), izolat i proteinës së hirrës (nga QUMËSHTI), enzimë laktazë.

Mund të përmbajë gjurmë të VEZËVE, GLUTENIT, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT dhe KRUSTACEVE.

Përmban kafeinë (17 mg/30 g). Nuk rekomandohet për fëmijë ose gra shtatzëna.

Informacione ushqyese për 100% NATURAL WHEY PROTEIN (KAFE E FTOHTË)'
WHERE Variant_Id IN (1242) AND HASHBYTES('SHA2_256', Ingredients) = 0xC6A2B5E78E798316B1AB78558F3EC2A626A20D98286C96752871F8375BB7354A;
SET @n += @@ROWCOUNT;
-- item 230
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: blend of microbial cultures (Lactobacillus acidophilus, Lactobacillus bulgaricus, Lactobacillus casei, Lactobacillus plantarum, Lactobacillus brevis, Lactobacillus paracasei, Lactobacillus rhamnosus, Bifidobacterium breve, Bifidobacterium lactis, Bifidobacterium longum, Lactococcus lactis, Streptococcus thermophilus, Lactobacillus reuteri, Lactobacillus salivarius, Lactobacillus helveticus, Lactobacillus gasseri, Lactobacillus crispatus, Lactobacillus fermentum, Bifidobacterium infantis, Bifidobacterium bifidum, Bifidobacterium animalis, Pendiococcus acidilactici), plant-based capsule (hydroxypropyl methylcellulose), fructooligosaccharides, plant inulin, maltodextrin.

Nutrition information for PROTEINI.SI 100% PURE BIOTICS PRO',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: përzierje kulturash mikrobiale (Lactobacillus acidophilus, Lactobacillus bulgaricus, Lactobacillus casei, Lactobacillus plantarum, Lactobacillus brevis, Lactobacillus paracasei, Lactobacillus rhamnosus, Bifidobacterium breve, Bifidobacterium lactis, Bifidobacterium longum, Lactococcus lactis, Streptococcus thermophilus, Lactobacillus reuteri, Lactobacillus salivarius, Lactobacillus helveticus, Lactobacillus gasseri, Lactobacillus crispatus, Lactobacillus fermentum, Bifidobacterium infantis, Bifidobacterium bifidum, Bifidobacterium animalis, Pendiococcus acidilactici), kapsulë bimore (hidroksipropil metilcelulozë), fruktooligosakaride, inulinë bimore, maltodekstrinë.

Informacione ushqyese për PROTEINI.SI 100% PURE BIOTICS PRO'
WHERE Variant_Id IN (1243) AND HASHBYTES('SHA2_256', Ingredients) = 0xD229C22EFC6B44FFFEE8D4F2D2F4FBBA288DB9FBAF72F6914149ECE7971BF749;
SET @n += @@ROWCOUNT;
-- item 231
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for PROTEINI.SI 100% PURE CREATINE (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për PROTEINI.SI 100% PURE CREATINE (PA SHIJE)'
WHERE Variant_Id IN (1244) AND HASHBYTES('SHA2_256', Ingredients) = 0xEDFFB0A0F4A84D792D2B634607769D34B1DE4B10643F13B39607882156D0955B;
SET @n += @@ROWCOUNT;
-- item 232
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: L-glutamine.

Nutrition information for PROTEINI.SI GLUTAMINE (UNFLAVOURED)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: L-glutaminë.

Informacione ushqyese për PROTEINI.SI GLUTAMINE (PA SHIJE)'
WHERE Variant_Id IN (1246) AND HASHBYTES('SHA2_256', Ingredients) = 0x9701759E93EDBDFDA00D8675C03737947A55FA16FDADA20725CBB868CCBE8798;
SET @n += @@ROWCOUNT;
-- item 233
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE CREAM

INGREDIENTS: rice flour, fat-reduced cocoa powder, flavouring, natural flavouring, salt, sweetener (sucralose), thickener (cellulose gum).

Produced in a facility that manufactures products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI CREMRISO (CHOCOLATE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KREM ÇOKOLLATE

PËRBËRËSIT: miell orizi, kakao pluhur me pak yndyrë, aromë, aromë natyrale, kripë, ëmbëlsues (sukralozë), trashës (gomë celuloze).

Prodhuar në një objekt ku prodhohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI CREMRISO (KREM ÇOKOLLATE)'
WHERE Variant_Id IN (1247) AND HASHBYTES('SHA2_256', Ingredients) = 0xE07E892DEC98D727EA92A5F5FCE4508E369BFC87564304752760837D9FE002E8;
SET @n += @@ROWCOUNT;
-- item 234
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FRENCH VANILLA CAKE

INGREDIENTS: rice flour, flavouring, salt, natural flavouring, thickener (cellulose gum), sweetener (sucralose), colour (beta-carotene).

Produced in a facility that manufactures products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI CREMRISO (FRENCH VANILLA CAKE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KEK FRANCEZ ME VANILJE

PËRBËRËSIT: miell orizi, aromë, kripë, aromë natyrale, trashës (gomë celuloze), ëmbëlsues (sukralozë), ngjyrues (beta-karoten).

Prodhuar në një objekt ku prodhohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI CREMRISO (KEK FRANCEZ ME VANILJE)'
WHERE Variant_Id IN (1248) AND HASHBYTES('SHA2_256', Ingredients) = 0x49A676F0DAB26A859A278871E28B3C591EABA97C6909737832430768A9B1FA33;
SET @n += @@ROWCOUNT;
-- item 235
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BUTTER BISCUIT

INGREDIENTS: rice flour, natural flavouring, flavouring, salt, sweetener (sucralose), colour (ammonia caramel).

Produced in a facility that manufactures products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI CREMRISO (BUTTER BISCUIT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BISKOTË ME GJALPË

PËRBËRËSIT: miell orizi, aromë natyrale, aromë, kripë, ëmbëlsues (sukralozë), ngjyrues (karamel amoniaku).

Prodhuar në një objekt ku prodhohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI CREMRISO (BISKOTË ME GJALPË)'
WHERE Variant_Id IN (1249) AND HASHBYTES('SHA2_256', Ingredients) = 0xD53F894F8387480A33057175DE27397E16D8DC42A47A018E844FFBF2A93E92B5;
SET @n += @@ROWCOUNT;
-- item 236
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'LEMON

INGREDIENTS: glucose, sucrose, maltodextrin, isomaltulose¹ – Palatinose™, acid (citric acid), calcium citrate, non-iodised sea salt, magnesium citrate, potassium citrate, natural flavouring, Aquamin™ Mg (magnesium from red algae), sodium ascorbate.

¹Isomaltulose is a source of glucose and fructose.

Nutrition information for PROTEINI.SI PREMIUM ISOTONIC (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMON

PËRBËRËSIT: glukozë, saharozë, maltodekstrinë, izomaltulozë¹ – Palatinose™, acid (acid citrik), citrat kalciumi, kripë deti e pajoduar, citrat magnezi, citrat kaliumi, aromë natyrale, Aquamin™ Mg (magnez nga algat e kuqe), askorbat natriumi.

¹Izomaltuloza është burim glukoze dhe fruktoze.

Informacione ushqyese për PROTEINI.SI PREMIUM ISOTONIC (LIMON)'
WHERE Variant_Id IN (1250) AND HASHBYTES('SHA2_256', Ingredients) = 0x14773FA2B8CA95ADFEDEB508F190AFF686545A8DE251E55EF1EE547A9F6FC456;
SET @n += @@ROWCOUNT;
-- item 237
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ORANGE

INGREDIENTS: glucose, sucrose, maltodextrin, isomaltulose¹ – Palatinose™, acid (citric acid), calcium citrate, non-iodised sea salt, magnesium citrate, potassium citrate, natural flavouring, Aquamin™ Mg (magnesium from red algae), beta-carotene, sodium ascorbate.

¹Isomaltulose is a source of glucose and fructose.

Nutrition information for PROTEINI.SI PREMIUM ISOTONIC (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PORTOKALL

PËRBËRËSIT: glukozë, saharozë, maltodekstrinë, izomaltulozë¹ – Palatinose™, acid (acid citrik), citrat kalciumi, kripë deti e pajoduar, citrat magnezi, citrat kaliumi, aromë natyrale, Aquamin™ Mg (magnez nga algat e kuqe), beta-karoten, askorbat natriumi.

¹Izomaltuloza është burim glukoze dhe fruktoze.

Informacione ushqyese për PROTEINI.SI PREMIUM ISOTONIC (PORTOKALL)'
WHERE Variant_Id IN (1251) AND HASHBYTES('SHA2_256', Ingredients) = 0x0D796BD7BB44CCA0EAE171BEAB4B723559B9C87A60563FDC475DB1EDE58AC50F;
SET @n += @@ROWCOUNT;
-- item 238
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'SOUR CHERRY

INGREDIENTS: glucose, sucrose, maltodextrin, isomaltulose¹ – Palatinose™, acid (citric acid), calcium citrate, non-iodised sea salt, magnesium citrate, potassium citrate, natural flavouring, Aquamin™ Mg (magnesium from red algae), beetroot powder, sodium ascorbate.

¹Isomaltulose is a source of glucose and fructose.

Nutrition information for PROTEINI.SI PREMIUM ISOTONIC (SOUR CHERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'VISHNJE

PËRBËRËSIT: glukozë, saharozë, maltodekstrinë, izomaltulozë¹ – Palatinose™, acid (acid citrik), citrat kalciumi, kripë deti e pajoduar, citrat magnezi, citrat kaliumi, aromë natyrale, Aquamin™ Mg (magnez nga algat e kuqe), panxhar pluhur, askorbat natriumi.

¹Izomaltuloza është burim glukoze dhe fruktoze.

Informacione ushqyese për PROTEINI.SI PREMIUM ISOTONIC (VISHNJE)'
WHERE Variant_Id IN (1252) AND HASHBYTES('SHA2_256', Ingredients) = 0x83E38150641C43F66A6643D090F46241B78C2F22631A1A270D249566A357E825;
SET @n += @@ROWCOUNT;
-- item 239
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'LEMON

INGREDIENTS: 49% maltodextrin, 39% fructose, acidity regulator (citric acid), calcium gluconate, potassium gluconate, sodium chloride, magnesium bisglycinate, natural flavouring, acidity regulator (malic acid), anti-caking agent (silicon dioxide), colour (beta-carotene).

May contain traces of SOY and MILK protein.

Nutrition information for PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY DRINK (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LIMON

PËRBËRËSIT: 49% maltodekstrinë, 39% fruktozë, rregullues aciditeti (acid citrik), glukonat kalciumi, glukonat kaliumi, klorur natriumi, bisglicinat magnezi, aromë natyrale, rregullues aciditeti (acid malik), agjent kundër ngjizjes (dioksid silici), ngjyrues (beta-karoten).

Mund të përmbajë gjurmë të SOJES dhe proteinës së QUMËSHTIT.

Informacione ushqyese për PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY DRINK (LIMON)'
WHERE Variant_Id IN (1263) AND HASHBYTES('SHA2_256', Ingredients) = 0xDE9A1629590AE58E59F7BE80B83AF927A294E5BEB7E70AB4459577348B887BC1;
SET @n += @@ROWCOUNT;
-- item 240
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TROPICAL

INGREDIENTS: 49% maltodextrin, 39% fructose, acidity regulator (citric acid), calcium gluconate, potassium gluconate, sodium chloride, magnesium bisglycinate, natural flavouring, acidity regulator (malic acid), anti-caking agent (silicon dioxide).

May contain traces of SOY and MILK protein.

Nutrition information for PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY DRINK (TROPICAL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'TROPIKALE

PËRBËRËSIT: 49% maltodekstrinë, 39% fruktozë, rregullues aciditeti (acid citrik), glukonat kalciumi, glukonat kaliumi, klorur natriumi, bisglicinat magnezi, aromë natyrale, rregullues aciditeti (acid malik), agjent kundër ngjizjes (dioksid silici).

Mund të përmbajë gjurmë të SOJES dhe proteinës së QUMËSHTIT.

Informacione ushqyese për PROTEINI.SI ENERGY+ SUPERCHARGED ENERGY DRINK (TROPIKALE)'
WHERE Variant_Id IN (1264) AND HASHBYTES('SHA2_256', Ingredients) = 0xDC59C50726B11E1EAFDD10F1C1D55CE4D266773EC85CBD3A59CD24C201414AAD;
SET @n += @@ROWCOUNT;
-- item 241
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PASSION FRUIT

INGREDIENTS: L-leucine, L-isoleucine, L-valine, flavouring (passion fruit), acidity regulator (anhydrous citric acid), sweeteners (sucralose, steviol glycosides), thickener (xanthan gum).

Produced in a facility that processes ingredients containing MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for PROTEINI.SI NATURAL BCAA (PASSION FRUIT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'FRUT PASIONI

PËRBËRËSIT: L-leucinë, L-izoleucinë, L-valinë, aromë (frut pasioni), rregullues aciditeti (acid citrik anhidër), ëmbëlsues (sukralozë, glikozide steviolike), trashës (gomë ksantani).

Prodhuar në një objekt ku përpunohen përbërës që përmbajnë QUMËSHT, VEZË, GLUTEN, SOJE, KIKIRIKË, FRUTA ME LËVOZHGË, PESHK dhe KRUSTACE.

Informacione ushqyese për PROTEINI.SI NATURAL BCAA (FRUT PASIONI)'
WHERE Variant_Id IN (1279) AND HASHBYTES('SHA2_256', Ingredients) = 0x1A2462E61704CA1AF395AF29913739845BD4744E568585B5E8C0ADCC4C5D0A29;
SET @n += @@ROWCOUNT;
-- item 242
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: FISH oil MEG-3™, bovine gelatine, glycerine, water.

Nutrition information for PROTEINI.SI OMEGA-3',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: vaj PESHKU MEG-3™, xhelatinë gjedhi, glicerinë, ujë.

Informacione ushqyese për PROTEINI.SI OMEGA-3'
WHERE Variant_Id IN (1287) AND HASHBYTES('SHA2_256', Ingredients) = 0x6C2AEDAD0B6C34835820183749DA70C9FEF970C50CFA96230D1FE8770774BEBD;
SET @n += @@ROWCOUNT;
-- item 243
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'PEANUT WITH COCOA

INGREDIENTS: roasted PEANUTS 55%, sweetener (xylitol), desiccated coconut, cocoa powder 3%, sweetener (steviol glycosides).

Produced in a facility that processes ingredients containing MILK, EGGS, GLUTEN, SOY, NUTS, FISH and CRUSTACEANS.

Nutrition information for PROTEINI.SI CHOCOTELLA (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KIKIRIKË ME KAKAO

PËRBËRËSIT: KIKIRIKË të pjekur 55%, ëmbëlsues (ksilitol), kokos i tharë, kakao pluhur 3%, ëmbëlsues (glikozide steviolike).

Prodhuar në një objekt ku përpunohen përbërës që përmbajnë QUMËSHT, VEZË, GLUTEN, SOJE, FRUTA ME LËVOZHGË, PESHK dhe KRUSTACE.

Informacione ushqyese për PROTEINI.SI CHOCOTELLA (NEW)'
WHERE Variant_Id IN (1326) AND HASHBYTES('SHA2_256', Ingredients) = 0xDD30719B54F346191FD104F461A0E4D22774D64902F465FC245A6884E61E3736;
SET @n += @@ROWCOUNT;
-- item 244
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'RASPBERRY - WHITE CHOCOLATE

INGREDIENTS: OAT flakes 54%, extrudate (pea protein isolate, WHEAT protein concentrate, tapioca starch, rice flour, corn grits, WHEAT semolina, fat-reduced cocoa powder, salt), SOY flakes, white chocolate pieces 5% (sugar, cocoa butter, whole MILK powder, emulsifier: SOY lecithins, flavouring), honey 4.3%, linseed, freeze-dried raspberry pieces 0.5%, flavouring.

The product may contain NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN MUESLI (RASPBERRY - WHITE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR - ÇOKOLLATË E BARDHË

PËRBËRËSIT: thekon TËRSHËRE 54%, ekstrudat (izolat i proteinës së bizeles, koncentrat i proteinës së GRURIT, niseshte tapioke, miell orizi, bollgur misri, bollgur GRURI, kakao pluhur me pak yndyrë, kripë), thekon SOJE, copa çokollate të bardhë 5% (sheqer, gjalpë kakaoje, QUMËSHT i plotë pluhur, emulsifikues: lecitina SOJE, aromë), mjaltë 4,3%, fara liri, copa mjedre të liofilizuara 0,5%, aromë.

Produkti mund të përmbajë FRUTA ME LËVOZHGË, KIKIRIKË dhe SUSAM.

Informacione ushqyese për PROTEINI.SI PROTEIN MUESLI (MJEDËR - ÇOKOLLATË E BARDHË)'
WHERE Variant_Id IN (1337) AND HASHBYTES('SHA2_256', Ingredients) = 0x1849980B8CA0095502BCD300F014F509A9B145FADEF18149E27090F54BC77645;
SET @n += @@ROWCOUNT;
-- item 245
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE - CARAMEL

INGREDIENTS: OAT flakes 48%, SOY flakes, extrudate (pea protein isolate, WHEAT protein concentrate, tapioca starch, rice flour, corn grits, WHEAT semolina, fat-reduced cocoa powder, salt), chocolate pieces 10% (sugar, cocoa mass, cocoa butter, emulsifier: SOY lecithins, flavouring), caramel powder 3% [sugar, glucose syrup, sweetened condensed MILK, BUTTER (from MILK), salt], honey 3%, linseed, natural flavouring.

The product may contain NUTS, PEANUTS and SESAME.

Nutrition information for PROTEINI.SI PROTEIN MUESLI (CHOCOLATE - CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË - KARAMEL

PËRBËRËSIT: thekon TËRSHËRE 48%, thekon SOJE, ekstrudat (izolat i proteinës së bizeles, koncentrat i proteinës së GRURIT, niseshte tapioke, miell orizi, bollgur misri, bollgur GRURI, kakao pluhur me pak yndyrë, kripë), copa çokollate 10% (sheqer, masë kakaoje, gjalpë kakaoje, emulsifikues: lecitina SOJE, aromë), karamel pluhur 3% [sheqer, shurup glukoze, QUMËSHT i kondensuar i ëmbëlsuar, GJALPË (nga QUMËSHTI), kripë], mjaltë 3%, fara liri, aromë natyrale.

Produkti mund të përmbajë FRUTA ME LËVOZHGË, KIKIRIKË dhe SUSAM.

Informacione ushqyese për PROTEINI.SI PROTEIN MUESLI (ÇOKOLLATË - KARAMEL)'
WHERE Variant_Id IN (1338) AND HASHBYTES('SHA2_256', Ingredients) = 0xF525F20E74C3E13DB0CF0C35B2200F005C38067F5BD41D0AE3C906A1FB5FC744;
SET @n += @@ROWCOUNT;
-- item 246
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY AND WHITE CHOCOLATE

INGREDIENTS: oat flour (GLUTEN), WHEY protein concentrate from MILK (contains the protein fractions lactoglobulin, lactoferrin, lactalbumin and immunoglobulin), WHEY powder (MILK), maltodextrin, dried fruit pieces (strawberry), white chocolate powder (MILK), EGG white protein, micellar casein concentrate (MILK), curd powder (MILK), yoghurt powder (MILK), raising agent (sodium bicarbonate), flavour enhancer (sodium chloride), sweetener (sucralose).

The product may contain traces of SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for PROTEINI.SI PROTEIN PANCAKES (STRAWBERRY AND WHITE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE DHE ÇOKOLLATË E BARDHË

PËRBËRËSIT: miell tërshëre (GLUTEN), koncentrat i proteinës së HIRRËS nga QUMËSHTI (përmban fraksionet proteinike laktoglobulinë, laktoferinë, laktalbuminë dhe imunoglobulinë), HIRRË pluhur (QUMËSHT), maltodekstrinë, copa frutash të thata (luleshtrydhe), çokollatë e bardhë pluhur (QUMËSHT), proteinë e të bardhës së VEZËS, koncentrat kazeine micelare (QUMËSHT), gjizë pluhur (QUMËSHT), kos pluhur (QUMËSHT), agjent brumëzimi (bikarbonat natriumi), përforcues shijeje (klorur natriumi), ëmbëlsues (sukralozë).

Produkti mund të përmbajë gjurmë të SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, PESHKUT dhe KRUSTACEVE.

Informacione ushqyese për PROTEINI.SI PROTEIN PANCAKES (LULESHTRYDHE DHE ÇOKOLLATË E BARDHË)'
WHERE Variant_Id IN (1339) AND HASHBYTES('SHA2_256', Ingredients) = 0x2DFF528112FDA316C7078C92D3D676B49011430B223A1B07C6FD2934582F4C5D;
SET @n += @@ROWCOUNT;
-- item 247
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE - HAZELNUT

INGREDIENTS: pea protein 39%, WHEAT protein (GLUTEN) 39%, fat-reduced cocoa powder, HAZELNUT pieces (Corylus avellana), flavourings, coconut protein 1%, rice protein 1%, pumpkin protein 1%, salt, D-pantothenate, calcium, sweeteners (sucralose, steviol glycosides from stevia), ferrous fumarate, bromelain from pineapple 0.08% (1200 GDU/g), papain from papaya 0.08% (1.5 FIP U/mg), cyanocobalamin.

May contain traces of MILK, EGGS, SOY, PEANUTS, OTHER NUTS, CELERY, FISH, CRUSTACEANS, MOLLUSCS and SULPHUR DIOXIDE.

Nutrition information for PROTEINI.SI VEGAN PROTEIN (CHOCOLATE - HAZELNUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË - LAJTHI

PËRBËRËSIT: proteinë bizeleje 39%, proteinë GRURI (GLUTEN) 39%, kakao pluhur me pak yndyrë, copa LAJTHIE (Corylus avellana), aroma, proteinë kokosi 1%, proteinë orizi 1%, proteinë kungulli 1%, kripë, D-pantotenat, kalcium, ëmbëlsues (sukralozë, glikozide steviolike nga stevia), fumarat hekuri, bromelainë nga ananasi 0,08% (1200 GDU/g), papainë nga papaja 0,08% (1,5 FIP U/mg), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, SOJES, KIKIRIKËVE, FRUTAVE TË TJERA ME LËVOZHGË, SELINOS, PESHKUT, KRUSTACEVE, MOLUSQEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për PROTEINI.SI VEGAN PROTEIN (ÇOKOLLATË - LAJTHI)'
WHERE Variant_Id IN (1354) AND HASHBYTES('SHA2_256', Ingredients) = 0xC5C874D45998898C6F595DBA2FC1406C57C15E82AF6A4CA98F6140AE24961F69;
SET @n += @@ROWCOUNT;
-- item 248
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CHOCOLATE - COCONUT

INGREDIENTS: pea protein 38%, WHEAT protein (GLUTEN) 38%, flavourings, fat-reduced cocoa powder, coconut flakes, coconut protein 1%, rice protein 1%, pumpkin protein 1%, salt, sweeteners (sucralose, steviol glycosides from stevia), D-pantothenate, calcium, ferrous fumarate, bromelain from pineapple 0.08% (1200 GDU/g), papain from papaya 0.8% (1.5 FIP U/mg), cyanocobalamin.

May contain traces of MILK, EGGS, SOY, PEANUTS, NUTS, CELERY, FISH, CRUSTACEANS, MOLLUSCS and SULPHUR DIOXIDE.

Nutrition information for PROTEINI.SI VEGAN PROTEIN (CHOCOLATE - COCONUT)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'ÇOKOLLATË - KOKOS

PËRBËRËSIT: proteinë bizeleje 38%, proteinë GRURI (GLUTEN) 38%, aroma, kakao pluhur me pak yndyrë, ashkla kokosi, proteinë kokosi 1%, proteinë orizi 1%, proteinë kungulli 1%, kripë, ëmbëlsues (sukralozë, glikozide steviolike nga stevia), D-pantotenat, kalcium, fumarat hekuri, bromelainë nga ananasi 0,08% (1200 GDU/g), papainë nga papaja 0,8% (1,5 FIP U/mg), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT, KRUSTACEVE, MOLUSQEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për PROTEINI.SI VEGAN PROTEIN (ÇOKOLLATË - KOKOS)'
WHERE Variant_Id IN (1355) AND HASHBYTES('SHA2_256', Ingredients) = 0x8DB485B6779CE48A4AFD4918B938D3624A0CB4BAF22D0C3F9D80C2EE59C96072;
SET @n += @@ROWCOUNT;
-- item 249
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BERRIES

INGREDIENTS: pea protein 44%, WHEAT protein (GLUTEN) 44%, freeze-dried sour cherry pieces, flavourings, coconut protein 1%, rice protein 1%, pumpkin protein 1%, salt, beetroot concentrate powder [maltodextrin, beetroot concentrate, acid (citric acid)], D-pantothenate, calcium, sweeteners (sucralose, steviol glycosides from stevia), ferrous fumarate, bromelain from pineapple 0.08% (1200 GDU/g), papain from papaya 0.08% (1.5 FIP U/mg), cyanocobalamin.

May contain traces of MILK, EGGS, SOY, PEANUTS, NUTS, CELERY, FISH, CRUSTACEANS, MOLLUSCS and SULPHUR DIOXIDE.

Nutrition information for PROTEINI.SI VEGAN PROTEIN (BERRIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANAFERRA

PËRBËRËSIT: proteinë bizeleje 44%, proteinë GRURI (GLUTEN) 44%, copa vishnjeje të liofilizuara, aroma, proteinë kokosi 1%, proteinë orizi 1%, proteinë kungulli 1%, kripë, koncentrat panxhari pluhur [maltodekstrinë, koncentrat panxhari, acid (acid citrik)], D-pantotenat, kalcium, ëmbëlsues (sukralozë, glikozide steviolike nga stevia), fumarat hekuri, bromelainë nga ananasi 0,08% (1200 GDU/g), papainë nga papaja 0,08% (1,5 FIP U/mg), cianokobalaminë.

Mund të përmbajë gjurmë të QUMËSHTIT, VEZËVE, SOJES, KIKIRIKËVE, FRUTAVE ME LËVOZHGË, SELINOS, PESHKUT, KRUSTACEVE, MOLUSQEVE dhe DIOKSIDIT TË SQUFURIT.

Informacione ushqyese për PROTEINI.SI VEGAN PROTEIN (MANAFERRA)'
WHERE Variant_Id IN (1356) AND HASHBYTES('SHA2_256', Ingredients) = 0xBD8A3E4420DA31B91ECDD895115F56DF2FC2CA53695FCC4FC9773FACAA03BFB5;
SET @n += @@ROWCOUNT;
-- item 250
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: sweeteners (sorbitol, xylitol, sucralose), sodium L-ascorbate, L-ascorbic acid, anti-caking agents (magnesium salts of fatty acids, silicon dioxide), natural orange flavouring, rosehip extract 1.27%, vitamin D3 Quali®-D (modified corn starch, sugar, antioxidants [sodium L-ascorbate, alpha-tocopherol], medium-chain triglyceride fatty acids, anti-caking agent [silicon dioxide], cholecalciferol), bulking agent (hydroxypropyl methylcellulose), colour (turmeric extract).

Nutrition information for PROTEINI.SI VIT. C (1000MG) + VIT. D3',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ëmbëlsues (sorbitol, ksilitol, sukralozë), L-askorbat natriumi, acid L-askorbik, agjentë kundër ngjizjes (kripëra magnezi të acideve yndyrore, dioksid silici), aromë natyrale portokalli, ekstrakt trëndafili të egër 1,27%, vitamina D3 Quali®-D (niseshte misri e modifikuar, sheqer, antioksidantë [L-askorbat natriumi, alfa-tokoferol], acide yndyrore nga trigliceride me zinxhir të mesëm, agjent kundër ngjizjes [dioksid silici], kolekalciferol), agjent për rritjen e vëllimit (hidroksipropil metilcelulozë), ngjyrues (ekstrakt shafrani i Indisë).

Informacione ushqyese për PROTEINI.SI VIT. C (1000MG) + VIT. D3'
WHERE Variant_Id IN (1357) AND HASHBYTES('SHA2_256', Ingredients) = 0x3825D1CD61DA3B3233C58052915EFEFB46D2AD7F5BCF1C30C35932816AF24139;
SET @n += @@ROWCOUNT;
-- item 251
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: medium-chain triglyceride fatty acids, capsule shell (gelatine, purified water), humectant (glycerine), cholecalciferol (vitamin D3), antioxidants (alpha-tocopherol, tocopherol-rich extract).

Nutrition information for PROTEINI.SI VITAMIN D3 (2000IU)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: acide yndyrore nga trigliceride me zinxhir të mesëm, mbështjellës kapsule (xhelatinë, ujë i pastruar), lagështues (glicerinë), kolekalciferol (vitamina D3), antioksidantë (alfa-tokoferol, ekstrakt i pasur me tokoferole).

Informacione ushqyese për PROTEINI.SI VITAMIN D3 (2000IU)'
WHERE Variant_Id IN (1358) AND HASHBYTES('SHA2_256', Ingredients) = 0x848A444A73302D0DED523DC6717A50A94C4A81A5135A0E052CDA51B664D8F8A7;
SET @n += @@ROWCOUNT;
-- item 252
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS – OMEGA 3: FISH oil, gelatine capsule (gelatine, humectant: glycerol, purified water).


INGREDIENTS – VITAMINS AND MINERALS: calcium phosphate, bulking agent (microcrystalline cellulose), magnesium oxide, potassium chloride, ascorbic acid, stabiliser (polyvinylpolypyrrolidone), glazing agent (hydroxypropyl methylcellulose), DL-alpha-tocopheryl acetate, copper sulphate, niacin, anti-caking agent (magnesium stearate), ferrous fumarate, anti-caking agent (stearic acid), lutein, retinyl acetate, sodium molybdate, calcium pantothenate, chromium chloride, manganese sulphate, zinc oxide, anti-caking agent (talc), coenzyme Q10, pyridoxine hydrochloride, stabiliser (polyethylene glycol), sodium selenite, thiamine hydrochloride, riboflavin, cholecalciferol, phylloquinone, folic acid, cyanocobalamin, biotin, colour (black iron oxide), colour (red iron oxide), potassium iodide, silicon '
  + N'dioxide.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT – OMEGA 3: vaj PESHKU, kapsulë xhelatine (xhelatinë, lagështues: glicerol, ujë i pastruar).


PËRBËRËSIT – VITAMINA DHE MINERALE: fosfat kalciumi, agjent për rritjen e vëllimit (celulozë mikrokristaline), oksid magnezi, klorur kaliumi, acid askorbik, stabilizues (polivinilpolipirrolidon), agjent lustrues (hidroksipropil metilcelulozë), DL-alfa-tokoferil acetat, sulfat bakri, niacinë, agjent kundër ngjizjes (stearat magnezi), fumarat hekuri, agjent kundër ngjizjes (acid stearik), luteinë, retinil acetat, molibdat natriumi, pantotenat kalciumi, klorur kromi, sulfat mangani, oksid zinku, agjent kundër ngjizjes (talk), koenzima Q10, piridoksinë hidroklorur, stabilizues (polietilen glikol), selenit natriumi, tiaminë hidroklorur, riboflavinë, kolekalciferol, filokinon, acid folik, cianokobalaminë, biotinë, ngjyrues (oksid hekuri i zi), ngjyrues (oksid hekuri '
  + N'i kuq), jodur kaliumi, dioksid silici.'
WHERE Variant_Id IN (1359) AND HASHBYTES('SHA2_256', Ingredients) = 0xA86AFA536BB8EA174EB073CA7BA8EF76CD8D52E6DF5FCBA198370AE84BB8576F;
SET @n += @@ROWCOUNT;
-- item 253
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: water, sweeteners (erythritol, maltitol, sucralose), fat-reduced cocoa powder (1.5%), bamboo plant fibre, stabiliser (xanthan gum), salt, flavouring, preservative (potassium sorbate), acidity regulator (lactic acid), colours (ammonia sulphite caramel, ammonia caramel).

Nutrition information for PROTEINI.SI ZERO SYRUP (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: ujë, ëmbëlsues (eritritol, maltitol, sukralozë), kakao pluhur me pak yndyrë (1,5%), fibra bimore nga bambuja, stabilizues (gomë ksantani), kripë, aromë, konservues (sorbat kaliumi), rregullues aciditeti (acid laktik), ngjyrues (karamel amoniak-sulfit, karamel amoniaku).

Informacione ushqyese për PROTEINI.SI ZERO SYRUP (ÇOKOLLATË)'
WHERE Variant_Id IN (1360) AND HASHBYTES('SHA2_256', Ingredients) = 0x77A402AA7760951CC66FD120DCAC0207BF1BE646878DF9018092B88172897A15;
SET @n += @@ROWCOUNT;
-- item 254
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: zinc gluconate, bulking agents (microcrystalline cellulose, dicalcium phosphate, hydroxypropyl methylcellulose, hydroxypropyl cellulose), anti-caking agents (silicon dioxide, magnesium salts of fatty acids [magnesium stearate]), glazing agent (fatty acid [stearic acid]), coating agent, including humectant (glycerol).

Nutrition information for PROTEINI.SI ZINC',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: glukonat zinku, agjentë për rritjen e vëllimit (celulozë mikrokristaline, fosfat dikalciumi, hidroksipropil metilcelulozë, hidroksipropil celulozë), agjentë kundër ngjizjes (dioksid silici, kripëra magnezi të acideve yndyrore [stearat magnezi]), agjent lustrues (acid yndyror [acid stearik]), agjent veshës, përfshirë lagështues (glicerol).

Informacione ushqyese për PROTEINI.SI ZINC'
WHERE Variant_Id IN (1361) AND HASHBYTES('SHA2_256', Ingredients) = 0x3E61B663E55A2345F2CEBDD9403E6868AD5B85126F0B68ECF12A86DEE13FC6C1;
SET @n += @@ROWCOUNT;
-- item 255
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BUTTER

INGREDIENTS: refined rapeseed oil 97%, stabiliser (rapeseed lecithin E322) 3%, butter flavouring 0.2%.

Propellant: compressed air (does not come into contact with the other ingredients, "bag-on-valve" system).

Nutrition information for RABEKO NON-STICK ZERO COOKING SPRAY (BUTTER)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'GJALPË

PËRBËRËSIT: vaj ree i rafinuar 97%, stabilizues (lecitinë ree E322) 3%, aromë gjalpi 0,2%.

Gaz shtytës: ajër i kompresuar (nuk bie në kontakt me përbërësit e tjerë, sistemi "bag-on-valve").

Informacione ushqyese për RABEKO NON-STICK ZERO COOKING SPRAY (GJALPË)'
WHERE Variant_Id IN (1362) AND HASHBYTES('SHA2_256', Ingredients) = 0x9F73326C81DE7AA4CF1C057CD46EF2FD46F9BB86E4F461AC61FB1969A5A28206;
SET @n += @@ROWCOUNT;
-- item 256
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'NATURAL

INGREDIENTS: refined rapeseed oil 97.5%, stabiliser (rapeseed lecithin E322) 2.5%.

Propellant: compressed air (does not come into contact with the other ingredients, "bag-on-valve" system).

Nutrition information for RABEKO NON-STICK ZERO COOKING SPRAY (NATURAL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'NATYRALE

PËRBËRËSIT: vaj ree i rafinuar 97,5%, stabilizues (lecitinë ree E322) 2,5%.

Gaz shtytës: ajër i kompresuar (nuk bie në kontakt me përbërësit e tjerë, sistemi "bag-on-valve").

Informacione ushqyese për RABEKO NON-STICK ZERO COOKING SPRAY (NATYRALE)'
WHERE Variant_Id IN (1364) AND HASHBYTES('SHA2_256', Ingredients) = 0xD243DA390FB6ABD746D3687A4748060D47AA3544C7903B03E5FC001D4D1AA1CB;
SET @n += @@ROWCOUNT;
-- item 257
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'ITALIAN HERBS

INGREDIENTS: refined rapeseed oil 97%, stabiliser (rapeseed lecithin E322) 3%, Italian herb flavouring 0.2%.

Propellant: compressed air (does not come into contact with the other ingredients, "bag-on-valve" system).

Nutrition information for RABEKO NON-STICK ZERO COOKING SPRAY (ITALIAN HERBS)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'BARISHTE ITALIANE

PËRBËRËSIT: vaj ree i rafinuar 97%, stabilizues (lecitinë ree E322) 3%, aromë barishtesh italiane 0,2%.

Gaz shtytës: ajër i kompresuar (nuk bie në kontakt me përbërësit e tjerë, sistemi "bag-on-valve").

Informacione ushqyese për RABEKO NON-STICK ZERO COOKING SPRAY (BARISHTE ITALIANE)'
WHERE Variant_Id IN (1365) AND HASHBYTES('SHA2_256', Ingredients) = 0x9D2BB23FECFFD0AC962526FBE47586F18AAFD4BB13B22CF24321A94372F51535;
SET @n += @@ROWCOUNT;
-- item 258
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: WHEYTELLA (CHOCO - HAZELNUT)

INGREDIENTS: protein blend (whey protein isolate (MILK), whey protein isolate hydrolysate (MILK), whey protein concentrate (MILK)), polydextrose, fat-reduced cocoa powder, flavouring, emulsifiers (sunflower lecithin, SOY lecithin), salt, acidity regulator (potassium carbonate), sweetener (sucralose).

Nutrition information for USN WHEY PREMIUM PROTEIN - BAG (WHEYTELLA (CHOCO - HAZELNUT))',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: WHEYTELLA (ÇOKO - LAJTHI)

PËRBËRËSIT: përzierje proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i izolatit të proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), polidekstrozë, kakao pluhur me pak yndyrë, aromë, emulsifikues (lecitinë luledielli, lecitinë SOJE), kripë, rregullues aciditeti (karbonat kaliumi), ëmbëlsues (sukralozë).

Informacione ushqyese për USN WHEY PREMIUM PROTEIN - BAG (WHEYTELLA (ÇOKO - LAJTHI))'
WHERE Variant_Id IN (1370) AND HASHBYTES('SHA2_256', Ingredients) = 0x3760159D41B50E56BE7280A086ABBF66919F2709C7E4BD283AFBCFA55C4DFE58;
SET @n += @@ROWCOUNT;
-- item 259
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: protein blend (whey protein isolate (MILK), whey protein isolate hydrolysate (MILK), whey protein concentrate (MILK)), polydextrose, fat-reduced cocoa powder, flavouring, emulsifiers (sunflower lecithin, SOY lecithin), salt, acidity regulator (potassium carbonate), sweetener (sucralose).

Nutrition information for USN WHEY PREMIUM PROTEIN - BAG (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: përzierje proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i izolatit të proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), polidekstrozë, kakao pluhur me pak yndyrë, aromë, emulsifikues (lecitinë luledielli, lecitinë SOJE), kripë, rregullues aciditeti (karbonat kaliumi), ëmbëlsues (sukralozë).

Informacione ushqyese për USN WHEY PREMIUM PROTEIN - BAG (ÇOKOLLATË)'
WHERE Variant_Id IN (1371) AND HASHBYTES('SHA2_256', Ingredients) = 0x3EEF138F9C269D8C6B3C5ADA48D21CA1E1DF2ACFED42CCC9EB90061B7EE77B80;
SET @n += @@ROWCOUNT;
-- item 260
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: protein blend (whey protein isolate (MILK), whey protein isolate hydrolysate (MILK), whey protein concentrate (MILK)), polydextrose, flavouring, emulsifiers (sunflower lecithin, SOY lecithin), salt, sweetener (sucralose).

Nutrition information for USN WHEY PREMIUM PROTEIN - BAG (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: përzierje proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i izolatit të proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), polidekstrozë, aromë, emulsifikues (lecitinë luledielli, lecitinë SOJE), kripë, ëmbëlsues (sukralozë).

Informacione ushqyese për USN WHEY PREMIUM PROTEIN - BAG (VANILJE)'
WHERE Variant_Id IN (1372) AND HASHBYTES('SHA2_256', Ingredients) = 0x83E287BA60C9078EA6DC12C980AFE3F4EEF7E2579BD04F1017F7ADBAACFFF80F;
SET @n += @@ROWCOUNT;
-- item 261
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: COLA

INGREDIENTS: L-citrulline-DL-malate (2:1), creatine monohydrate, beta-alanine, acidity regulators (sodium citrates, potassium citrates), natural flavouring, colour (sulphite ammonia caramel), anti-caking agents (calcium silicate, silicon dioxide), sweeteners (sucralose, acesulfame K), sodium chloride, natural anhydrous caffeine (plant extract from green coffee beans), Bacowize® bacopa extract (20:1) (from the leaves of Bacopa monnieri) (20% bacosides), Zynamite® mango extract (15–20:1) (from the leaves of Mangifera indica) (60% mangiferin), Rhodiola rosea extract (5:1) (from the roots of Rhodiola rosea L.) (3% rosavins, 1% salidrosides), nicotinic acid, pyridoxine hydrochloride, methylcobalamin.

Nutrition information for USN B4-BOMB (COLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: KOLA

PËRBËRËSIT: L-citrulinë-DL-malat (2:1), kreatinë monohidrat, beta-alaninë, rregullues aciditeti (citrate natriumi, citrate kaliumi), aromë natyrale, ngjyrues (karamel sulfit-amoniaku), agjentë kundër ngjizjes (silikat kalciumi, dioksid silici), ëmbëlsues (sukralozë, acesulfam K), klorur natriumi, kafeinë natyrale anhidre (ekstrakt bimor nga kokrrat e gjelbra të kafesë), ekstrakt bakope Bacowize® (20:1) (nga gjethet e Bacopa monnieri) (20% bakozide), ekstrakt mango Zynamite® (15–20:1) (nga gjethet e Mangifera indica) (60% mangiferinë), ekstrakt Rhodiola rosea (5:1) (nga rrënjët e Rhodiola rosea L.) (3% rozavine, 1% salidrozide), acid nikotinik, piridoksinë hidroklorur, metilkobalaminë.

Informacione ushqyese për USN B4-BOMB (KOLA)'
WHERE Variant_Id IN (1375) AND HASHBYTES('SHA2_256', Ingredients) = 0x65B2D2F23BE1E097BE0A48842BD766A194680A6F9AC5EE221B72D6721E07B752;
SET @n += @@ROWCOUNT;
-- item 262
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: BLUE RASPBERRY

INGREDIENTS: L-citrulline-DL-malate (2:1), creatine monohydrate, beta-alanine, acidity regulators (trisodium citrate, tripotassium citrates), anti-caking agents (calcium silicate, silicon dioxide), flavouring, sweeteners (sucralose, acesulfame K), sodium chloride, natural anhydrous caffeine (plant extract from green coffee beans), Bacowize® bacopa extract (20:1) (from the leaves of *Bacopa monnieri*) (20% bacosides), Zynamite® mango extract (15–20:1) (from the leaves of *Mangifera indica*) (60% mangiferin), *Rhodiola rosea* extract (5:1) (from the roots of *Rhodiola rosea* L.) (3% rosavins, 1% salidrosides), nicotinic acid, colour (brilliant blue FCF), pyridoxine hydrochloride, methylcobalamin.

Nutrition information for USN B4-BOMB (BLUE RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MJEDËR BLU

PËRBËRËSIT: L-citrulinë-DL-malat (2:1), kreatinë monohidrat, beta-alaninë, rregullues aciditeti (citrat trinatriumi, citrate trikaliumi), agjentë kundër ngjizjes (silikat kalciumi, dioksid silici), aromë, ëmbëlsues (sukralozë, acesulfam K), klorur natriumi, kafeinë natyrale anhidre (ekstrakt bimor nga kokrrat e gjelbra të kafesë), ekstrakt bakope Bacowize® (20:1) (nga gjethet e *Bacopa monnieri*) (20% bakozide), ekstrakt mango Zynamite® (15–20:1) (nga gjethet e *Mangifera indica*) (60% mangiferinë), ekstrakt *Rhodiola rosea* (5:1) (nga rrënjët e *Rhodiola rosea* L.) (3% rozavine, 1% salidrozide), acid nikotinik, ngjyrues (blu brilante FCF), piridoksinë hidroklorur, metilkobalaminë.

Informacione ushqyese për USN B4-BOMB (MJEDËR BLU)'
WHERE Variant_Id IN (1376) AND HASHBYTES('SHA2_256', Ingredients) = 0xC7AE5328675708C9E07CFDF4A6DE9F0CFC640CF79DF180A57F4A1469889B02C8;
SET @n += @@ROWCOUNT;
-- item 263
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'BLUE RASPBERRY

INGREDIENTS: BCAA amino acids (L-leucine, L-isoleucine, L-valine), L-glutamine, acidity regulator (citric acid), sodium bicarbonate, L-citrulline malate, flavouring, sweeteners (sucralose, acesulfame K), potassium bicarbonate, monopotassium phosphate, pyridoxine hydrochloride, BioPerine (from black pepper or long pepper fruit), colour (E133).

Nutrition information for USN BCAA POWER PUNCH (BLUE RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MJEDËR BLU

PËRBËRËSIT: aminoacide BCAA (L-leucinë, L-izoleucinë, L-valinë), L-glutaminë, rregullues aciditeti (acid citrik), bikarbonat natriumi, L-citrulinë malat, aromë, ëmbëlsues (sukralozë, acesulfam K), bikarbonat kaliumi, fosfat monokaliumi, piridoksinë hidroklorur, BioPerine (nga fruti i piperit të zi ose piperit të gjatë), ngjyrues (E133).

Informacione ushqyese për USN BCAA POWER PUNCH (MJEDËR BLU)'
WHERE Variant_Id IN (1377) AND HASHBYTES('SHA2_256', Ingredients) = 0x6EF4B6272041B69BF5C1F79E2CFA7EF5A9E4CB347F7F08B7EA4E1AC90466A2F2;
SET @n += @@ROWCOUNT;
-- item 264
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'TANGERINE

INGREDIENTS: BCAA amino acids (L-leucine, L-isoleucine, L-valine), L-glutamine, acidity regulator (citric acid), L-citrulline malate, flavouring, colour (E160), sweeteners (sucralose, acesulfame K), monopotassium phosphate, pyridoxine hydrochloride, BioPerine (from black pepper or long pepper fruit).

Nutrition information for USN BCAA POWER PUNCH (TANGERINE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'MANDARINË

PËRBËRËSIT: aminoacide BCAA (L-leucinë, L-izoleucinë, L-valinë), L-glutaminë, rregullues aciditeti (acid citrik), L-citrulinë malat, aromë, ngjyrues (E160), ëmbëlsues (sukralozë, acesulfam K), fosfat monokaliumi, piridoksinë hidroklorur, BioPerine (nga fruti i piperit të zi ose piperit të gjatë).

Informacione ushqyese për USN BCAA POWER PUNCH (MANDARINË)'
WHERE Variant_Id IN (1378) AND HASHBYTES('SHA2_256', Ingredients) = 0xC1A4E8365EA6B3D3183670FB4F552C5F90AB5F03B9820C19EF20947345F635BE;
SET @n += @@ROWCOUNT;
-- item 265
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: WHEYTELLA (CHOCO - HAZELNUT)

INGREDIENTS: premium protein blend (whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK)), cocoa powder, inulin, flavouring (MILK), stabilisers (guar gum, xanthan gum), sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold.

Nutrition information for USN BLUE LAB 100% WHEY PROTEIN (WHEYTELLA (CHOCO - HAZELNUT))',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: WHEYTELLA (ÇOKO - LAJTHI)

PËRBËRËSIT: përzierje premium proteinash (izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT)), kakao pluhur, inulinë, aromë (QUMËSHT), stabilizues (gomë guar, gomë ksantani), ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara.

Informacione ushqyese për USN BLUE LAB 100% WHEY PROTEIN (WHEYTELLA (ÇOKO - LAJTHI))'
WHERE Variant_Id IN (1384) AND HASHBYTES('SHA2_256', Ingredients) = 0x166BBB51B5EE250F61D711AFDC5BF3561EE1D17D33EFA61072A88215BA547F27;
SET @n += @@ROWCOUNT;
-- item 266
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: milk protein concentrate [95%], flavouring [3%], thickeners (guar gum and xanthan gum) [1%], sodium chloride [0.4%], Aminogen® (patented blend of digestive proteases from Aspergillus niger and Aspergillus oryzae) [0.3%], sweeteners (sucralose, acesulfame K) [0.3%].

ALLERGENS: May contain traces of MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS, SULPHITES and NUTS. Produced in a facility that processes products containing MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS, SULPHITES and NUTS.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: koncentrat i proteinave të qumështit [95%], aromë [3%], trashës (gomë guar dhe gomë ksantani) [1%], klorur natriumi [0,4%], Aminogen® (përzierje e patentuar e proteazave tretëse nga Aspergillus niger dhe Aspergillus oryzae) [0,3%], ëmbëlsues (sukralozë, acesulfam K) [0,3%].

ALERGJENËT: Mund të përmbajë gjurmë të QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE, SULFITEVE dhe FRUTAVE ME LËVOZHGË. Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, SOJE, GLUTEN, VEZË, PESHK, KRUSTACE, SULFITE dhe FRUTA ME LËVOZHGË.'
WHERE Variant_Id IN (1385) AND HASHBYTES('SHA2_256', Ingredients) = 0xD7A3A459F78C81F2D68074930B7919C17D4EC28287113DBA24B4C6B89F1004B8;
SET @n += @@ROWCOUNT;
-- item 267
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate.

Nutrition information for USN CREATINE MONOHYDRATE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat.

Informacione ushqyese për USN CREATINE MONOHYDRATE'
WHERE Variant_Id IN (1386) AND HASHBYTES('SHA2_256', Ingredients) = 0x788213EEF6E948CF0A5F21DF760AC63200C5396EDF6AADD69CF035D55BC8AA1A;
SET @n += @@ROWCOUNT;
-- item 268
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: protein blend [whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK), emulsifier (sunflower lecithin)], inulin, flavourings, sodium chloride, thickeners (xanthan gum, guar gum), sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold. May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN DYNAMIC WHEY 500 g (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: përzierje proteinash [izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT), emulsifikues (lecitinë luledielli)], inulinë, aroma, klorur natriumi, trashës (gomë ksantani, gomë guar), ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara. Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN DYNAMIC WHEY 500 g (ÇOKOLLATË)'
WHERE Variant_Id IN (1388) AND HASHBYTES('SHA2_256', Ingredients) = 0x94CD1A3801EC280481757B77C5A3CB997BFB42856057A3449C8665C7FF60A678;
SET @n += @@ROWCOUNT;
-- item 269
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: protein blend [whey protein isolate (MILK), whey protein hydrolysate (MILK), whey protein concentrate (MILK), emulsifier (sunflower lecithin)], inulin, flavourings, sodium chloride, thickeners (xanthan gum, guar gum), sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold. May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN DYNAMIC WHEY 500 g (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: përzierje proteinash [izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së hirrës (QUMËSHT), emulsifikues (lecitinë luledielli)], inulinë, aroma, klorur natriumi, trashës (gomë ksantani, gomë guar), ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara. Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN DYNAMIC WHEY 500 g (VANILJE)'
WHERE Variant_Id IN (1389) AND HASHBYTES('SHA2_256', Ingredients) = 0xB8E16B47E4F1268A06B3833C0803FE4ACA27B476A736C544CA0830619A932A74;
SET @n += @@ROWCOUNT;
-- item 270
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: whey protein isolate (contains MILK), flavourings, thickener: xanthan gum, salt, emulsifier: SOY lecithin, sweetener: sucralose.

ALLERGENS: May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN ISOPRO 100% WHEY PROTEIN ISOLATE (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: izolat i proteinës së hirrës (përmban QUMËSHT), aroma, trashës: gomë ksantani, kripë, emulsifikues: lecitinë SOJE, ëmbëlsues: sukralozë.

ALERGJENËT: Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN ISOPRO 100% WHEY PROTEIN ISOLATE (VANILJE)'
WHERE Variant_Id IN (1390) AND HASHBYTES('SHA2_256', Ingredients) = 0x83241425B45894B33291F7E6C3A6596EAA5EDB7A48795581D679F9B11A955136;
SET @n += @@ROWCOUNT;
-- item 271
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: whey protein isolate (contains MILK), fat-reduced cocoa powder (*Theobroma cacao*) (10–12% cocoa butter), flavourings, thickener: xanthan gum, salt, emulsifier: sunflower lecithin, sweetener: sucralose.

ALLERGENS: May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN ISOPRO 100% WHEY PROTEIN ISOLATE (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: izolat i proteinës së hirrës (përmban QUMËSHT), kakao pluhur me pak yndyrë (*Theobroma cacao*) (10–12% gjalpë kakaoje), aroma, trashës: gomë ksantani, kripë, emulsifikues: lecitinë luledielli, ëmbëlsues: sukralozë.

ALERGJENËT: Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN ISOPRO 100% WHEY PROTEIN ISOLATE (ÇOKOLLATË)'
WHERE Variant_Id IN (1391) AND HASHBYTES('SHA2_256', Ingredients) = 0x57C98BC165CC4D431641791BC8CF66A3FF9DB6BF1A1F0DF8BFF0C3770EFF63E6;
SET @n += @@ROWCOUNT;
-- item 272
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: MANGO AND ORANGE

INGREDIENTS: collagen hydrolysate, natural flavouring, acidity regulator: citric acid, flavouring, colour: beta-carotene, sweeteners: sucralose, acesulfame K, vitamin C (ascorbic acid).

Nutrition information for USN LIV.SMART COLLAGEN (MANGO AND ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MANGO DHE PORTOKALL

PËRBËRËSIT: hidrolizat kolagjeni, aromë natyrale, rregullues aciditeti: acid citrik, aromë, ngjyrues: beta-karoten, ëmbëlsues: sukralozë, acesulfam K, vitamina C (acid askorbik).

Informacione ushqyese për USN LIV.SMART COLLAGEN (MANGO DHE PORTOKALL)'
WHERE Variant_Id IN (1392) AND HASHBYTES('SHA2_256', Ingredients) = 0x33D59B094F6259E39979D745C0B7DB80E91C54C6F508F77E26B99006C58880FB;
SET @n += @@ROWCOUNT;
-- item 273
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: whey protein isolate (MILK), hydrolysed whey protein isolate (MILK), milk protein isolate (MILK), rice protein, soy protein isolate (SOY), maltodextrin, pea protein isolate, polydextrose, medium-chain triglycerides from coconut oil, SOY oil powder (refined SOY oil, glucose syrup, milk protein (MILK), stabiliser (sodium triphosphate), anti-caking agent (silicon dioxide), natural flavouring), inulin, high-amylose corn starch, flavouring, tripotassium citrate, thickeners (guar gum, cellulose gum, xanthan gum), milk mineral concentrate (MILK), sunflower oil powder [high-oleic sunflower oil, glucose syrup, modified starch sodium octenyl succinate, anti-caking agent (silicon dioxide)], sodium chloride, magnesium oxide, sweeteners (sucralose, acesulfame K), vitamin C (ascorbic acid), ferrous fumarate, zinc citrate dihydrate, vitamin E (D-alpha-tocopheryl acetate), '
  + N'emulsifier (sunflower lecithin), vitamin B3 (nicotinamide), manganese bisglycinate, Tolerase L (pH-stable lactase), vitamin B5 (calcium D-pantothenate), vitamin A (retinyl acetate), copper bisglycinate, vitamin B12 (cyanocobalamin), vitamin B8 (D-biotin), vitamin D3 (cholecalciferol), vitamin B6 (pyridoxine hydrochloride), vitamin B2 (riboflavin), vitamin K1 (phylloquinone), vitamin B1 (thiamine hydrochloride), chromium picolinate, potassium iodate, vitamin B9 (folic acid), sodium selenite.

ALLERGENS: For allergens, see the ingredients in bold.

Nutrition information for USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: izolat i proteinës së hirrës (QUMËSHT), izolat i hidrolizuar i proteinës së hirrës (QUMËSHT), izolat i proteinës së qumështit (QUMËSHT), proteinë orizi, izolat i proteinës së sojes (SOJE), maltodekstrinë, izolat i proteinës së bizeles, polidekstrozë, trigliceride me zinxhir të mesëm nga vaji i kokosit, vaj SOJE pluhur (vaj SOJE i rafinuar, shurup glukoze, proteinë qumështi (QUMËSHT), stabilizues (trifosfat natriumi), agjent kundër ngjizjes (dioksid silici), aromë natyrale), inulinë, niseshte misri me përmbajtje të lartë amiloze, aromë, citrat trikaliumi, trashës (gomë guar, gomë celuloze, gomë ksantani), koncentrat mineralesh qumështi (QUMËSHT), vaj luledielli pluhur [vaj luledielli me përmbajtje të lartë oleike, shurup glukoze, niseshte e modifikuar oktenil sukcinat natriumi, agjent kundër ngjizjes (dioksid silici)],'
  + N' klorur natriumi, oksid magnezi, ëmbëlsues (sukralozë, acesulfam K), vitamina C (acid askorbik), fumarat hekuri, citrat zinku dihidrat, vitamina E (D-alfa-tokoferil acetat), emulsifikues (lecitinë luledielli), vitamina B3 (nikotinamid), bisglicinat mangani, Tolerase L (laktazë e qëndrueshme ndaj pH), vitamina B5 (D-pantotenat kalciumi), vitamina A (retinil acetat), bisglicinat bakri, vitamina B12 (cianokobalaminë), vitamina B8 (D-biotinë), vitamina D3 (kolekalciferol), vitamina B6 (piridoksinë hidroklorur), vitamina B2 (riboflavinë), vitamina K1 (filokinon), vitamina B1 (tiaminë hidroklorur), pikolinat kromi, jodat kaliumi, vitamina B9 (acid folik), selenit natriumi.

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara.

Informacione ushqyese për USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (VANILJE)'
WHERE Variant_Id IN (1393) AND HASHBYTES('SHA2_256', Ingredients) = 0xB7F2A00DD052133C95C02E944AC3F84A675F3B093E93F7FBD13D4878606915AB;
SET @n += @@ROWCOUNT;
-- item 274
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: STRAWBERRIES AND CREAM

INGREDIENTS: protein blend [whey protein concentrate (MILK), SOY protein isolate, milk protein isolate (MILK), milk protein (MILK), whey protein isolate (MILK) (emulsifier: sunflower lecithin), hydrolysed whey protein isolate (MILK) (emulsifier: sunflower lecithin)], maltodextrin, polydextrose, oil powder (refined SOY oil, glucose syrup, milk protein (MILK), stabiliser (pentasodium triphosphate), flow agent (silicon dioxide), natural flavouring), inulin, high-amylose corn starch, thickeners (guar gum, cellulose gum, xanthan gum), tripotassium citrate, milk mineral complex (MILK), natural flavouring, creamer [high-oleic sunflower oil, glucose syrup, flow agent (silicon dioxide), modified starch sodium octenyl succinate], sodium chloride, sweetener (sucralose), colour (beetroot red), vitamin and mineral blend (magnesium oxide, ascorbic acid, ferrous fumarate,'
  + N' zinc citrate, D-alpha-tocopheryl acetate, nicotinamide, manganese bisglycinate, calcium D-pantothenate, retinyl acetate, copper bisglycinate, cyanocobalamin, D-biotin, cholecalciferol, pyridoxine hydrochloride, riboflavin, phylloquinone, thiamine hydrochloride, chromium picolinate, potassium iodate, folic acid, sodium selenite), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold.

Nutrition information for USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (STRAWBERRIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LULESHTRYDHE DHE KREM

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së SOJES, izolat i proteinës së qumështit (QUMËSHT), proteinë qumështi (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT) (emulsifikues: lecitinë luledielli), izolat i hidrolizuar i proteinës së hirrës (QUMËSHT) (emulsifikues: lecitinë luledielli)], maltodekstrinë, polidekstrozë, vaj pluhur (vaj SOJE i rafinuar, shurup glukoze, proteinë qumështi (QUMËSHT), stabilizues (trifosfat pentanatriumi), agjent rrjedhshmërie (dioksid silici), aromë natyrale), inulinë, niseshte misri me përmbajtje të lartë amiloze, trashës (gomë guar, gomë celuloze, gomë ksantani), citrat trikaliumi, kompleks mineralesh qumështi (QUMËSHT), aromë natyrale, kremues [vaj luledielli me përmbajtje të lartë oleike, shurup glukoze, agjent rrjedhshmërie '
  + N'(dioksid silici), niseshte e modifikuar oktenil sukcinat natriumi], klorur natriumi, ëmbëlsues (sukralozë), ngjyrues (e kuqe panxhari), përzierje vitaminash dhe mineralesh (oksid magnezi, acid askorbik, fumarat hekuri, citrat zinku, D-alfa-tokoferil acetat, nikotinamid, bisglicinat mangani, D-pantotenat kalciumi, retinil acetat, bisglicinat bakri, cianokobalaminë, D-biotinë, kolekalciferol, piridoksinë hidroklorur, riboflavinë, filokinon, tiaminë hidroklorur, pikolinat kromi, jodat kaliumi, acid folik, selenit natriumi), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara.

Informacione ushqyese për USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (LULESHTRYDHE DHE KREM)'
WHERE Variant_Id IN (1394) AND HASHBYTES('SHA2_256', Ingredients) = 0x197B6EA3E4221AAC82B31C51CC2D0AA25843E9C65E3756CC2788886FB6E75068;
SET @n += @@ROWCOUNT;
-- item 275
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate.

ALLERGENS: May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN PURE CREATINE MONOHYDRATE (SACHET)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat.

ALERGJENËT: Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN PURE CREATINE MONOHYDRATE (SACHET)'
WHERE Variant_Id IN (1395) AND HASHBYTES('SHA2_256', Ingredients) = 0x841D978E3809C61640E70BB441F03721A34F13E02DCE3A4162819A224C4BEBDD;
SET @n += @@ROWCOUNT;
-- item 276
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: magnesium bisglycinate, hydroxypropyl methylcellulose (capsule).

Nutrition information for VAST MAGNESIUM BISGLYCINATE 200',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: bisglicinat magnezi, hidroksipropil metilcelulozë (kapsulë).

Informacione ushqyese për VAST MAGNESIUM BISGLYCINATE 200'
WHERE Variant_Id IN (1408) AND HASHBYTES('SHA2_256', Ingredients) = 0x56CDC17689A86F9D9DA405E7A67111D3AB72FF9415DF38BF465879F1B1B32AD9;
SET @n += @@ROWCOUNT;
-- item 277
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'The product formulation itself contains carefully selected components:

Tryptophan is an essential amino acid that must be obtained through the diet and is a precursor of serotonin and melatonin, influencing circadian rhythms. Although only a small percentage of dietary tryptophan is used for serotonin synthesis, it significantly affects mood, behaviour and cognition. Adding L-tryptophan can increase non-REM sleep and reduce REM sleep, which suggests that tryptophan may be effective as a sleep aid.
Glycine improves sleep quality, and taking it before bed lowers body temperature, which is key to falling asleep.
Magnesium regulates the excitability of the central nervous system and is essential for neurotransmitter function, and it also has relaxing and antidepressant effects. Magnesium deficiency is associated with sleep disorders and conditions such as diabetes and cardiovascular disease.
'
  + N'Taurine is an amino acid that protects excitable tissues and mitochondria, reduces ER stress and regulates neurotransmitter receptors. It supports cardiovascular health by managing Ca2+ transport and ROS generation.
Theanine improves sleep and reduces wakefulness without causing daytime sleepiness. It increases the concentration of neurotransmitters such as dopamine, serotonin, tryptophan and GABA, thereby promoting sleep and providing anti-stress benefits.

5-Hydroxytryptophan (5-HTP) is a precursor of serotonin; it improves sleep quality and raises serum serotonin levels. It may especially improve sleep quality in older adults, and it may also improve the composition of the gut microbiota in people who sleep poorly.
S-adenosyl-L-methionine (SAMe) plays a key role in cell membrane function and in the synthesis of serotonin, noradrenaline and dopamine.
Myo-inositol may influence sleep processes. '
  + N'A randomised controlled trial showed that myo-inositol supplementation improves sleep quality and duration. Its mechanism involves activating serotonin receptors. Clinically, inositol levels are lower in patients with sleep disorders.
Chamomile is believed to ease anxiety and generalised anxiety disorder (GAD) and to improve sleep quality and insomnia through the binding of flavonoids and apigenin to GABA-A receptors in the brain, producing anxiolytic and hypnotic effects.
Vitamin B6 helps in the synthesis of macronutrients and neurotransmitters, including serotonin. It helps with dream recall and makes dreams more vivid and colourful.

Vitamin C indirectly supports sleep by helping to produce neurotransmitters such as serotonin, regulating mood and sleep, acting as a powerful antioxidant to reduce stress and supporting immune function, all of which contribute to overall well-being and healthy '
  + N'sleep habits.The product formulation itself contains carefully selected components:

Tryptophan is an essential amino acid that must be obtained through the diet and is a precursor of serotonin and melatonin, influencing circadian rhythms. Although only a small percentage of dietary tryptophan is used for serotonin synthesis, it significantly affects mood, behaviour and cognition. Adding L-tryptophan can increase non-REM sleep and reduce REM sleep, which suggests that tryptophan may be effective as a sleep aid.
Glycine improves sleep quality, and taking it before bed lowers body temperature, which is key to falling asleep.
Magnesium regulates the excitability of the central nervous system and is essential for neurotransmitter function, and it also has relaxing and antidepressant effects. Magnesium deficiency is associated with sleep disorders and conditions such as diabetes and cardiovascular '
  + N'disease.
Taurine is an amino acid that protects excitable tissues and mitochondria, reduces ER stress and regulates neurotransmitter receptors. It supports cardiovascular health by managing Ca2+ transport and ROS generation.
Theanine improves sleep and reduces wakefulness without causing daytime sleepiness. It increases the concentration of neurotransmitters such as dopamine, serotonin, tryptophan and GABA, thereby promoting sleep and providing anti-stress benefits.

5-Hydroxytryptophan (5-HTP) is a precursor of serotonin; it improves sleep quality and raises serum serotonin levels. It may especially improve sleep quality in older adults, and it may also improve the composition of the gut microbiota in people who sleep poorly.
S-adenosyl-L-methionine (SAMe) plays a key role in cell membrane function and in the synthesis of serotonin, noradrenaline and dopamine.
Myo-inositol may influence '
  + N'sleep processes. A randomised controlled trial showed that myo-inositol supplementation improves sleep quality and duration. Its mechanism involves activating serotonin receptors. Clinically, inositol levels are lower in patients with sleep disorders.
Chamomile is believed to ease anxiety and generalised anxiety disorder (GAD) and to improve sleep quality and insomnia through the binding of flavonoids and apigenin to GABA-A receptors in the brain, producing anxiolytic and hypnotic effects.
Vitamin B6 helps in the synthesis of macronutrients and neurotransmitters, including serotonin. It helps with dream recall and makes dreams more vivid and colourful.

Vitamin C indirectly supports sleep by helping to produce neurotransmitters such as serotonin, regulating mood and sleep, acting as a powerful antioxidant to reduce stress and supporting immune function, all of which contribute to overall '
  + N'well-being and healthy sleep habits.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Vetë formulimi i produktit përmban përbërës të zgjedhur me kujdes:

Triptofani është një aminoacid esencial që duhet marrë përmes ushqimit dhe është pararendës i serotoninës dhe melatoninës, duke ndikuar në ritmet cirkadiane. Edhe pse vetëm një përqindje e vogël e triptofanit nga ushqimi përdoret për sintezën e serotoninës, ai ndikon ndjeshëm në humor, sjellje dhe njohje. Shtimi i L-triptofanit mund të rrisë gjumin jo-REM dhe të ulë gjumin REM, gjë që tregon se triptofani mund të jetë efektiv si ndihmës për gjumin.
Glicina përmirëson cilësinë e gjumit, dhe marrja e saj para gjumit ul temperaturën e trupit, gjë që është thelbësore për fillimin e gjumit.
Magnezi rregullon ngacmueshmërinë e sistemit nervor qendror dhe është i domosdoshëm për funksionin e neurotransmetuesve, si dhe ka efekt relaksues dhe antidepresiv. Mungesa e magnezit lidhet '
  + N'me çrregullime të gjumit dhe gjendje si diabeti dhe sëmundjet kardiovaskulare.
Taurina është një aminoacid që mbron indet e ngacmueshme dhe mitokondritë, ul stresin e ER dhe rregullon receptorët e neurotransmetuesve. Ajo mbështet shëndetin kardiovaskular duke menaxhuar transportin e Ca2+ dhe gjenerimin e ROS.
Teanina përmirëson gjumin dhe ul zgjueshmërinë pa shkaktuar përgjumje gjatë ditës. Ajo rrit përqendrimin e neurotransmetuesve si dopamina, serotonina, triptofani dhe GABA, duke nxitur gjumin dhe duke ofruar përfitime kundër stresit.

5-hidroksitriptofani (5-HTP) është pararendës i serotoninës, përmirëson cilësinë e gjumit dhe rrit nivelet e serotoninës në serum. Ai mund të përmirësojë veçanërisht cilësinë e gjumit te të moshuarit, si dhe mund të përmirësojë përbërjen e mikrobiotës së zorrëve te personat me gjumë të dobët.
S-adenozil-L-metionina '
  + N'(SAMe) luan një rol kyç në funksionin e membranës qelizore dhe në sintezën e serotoninës, noradrenalinës dhe dopaminës.
Mio-inozitoli mund të ndikojë në proceset e gjumit. Një studim i rastësishëm i kontrolluar tregoi se suplementimi me mio-inozitol përmirëson cilësinë dhe kohëzgjatjen e gjumit. Mekanizmi i tij përfshin aktivizimin e receptorëve të serotoninës. Klinikisht, nivelet e inozitolit janë më të ulëta te pacientët me çrregullime të gjumit.
Besohet se kamomili lehtëson ankthin dhe çrregullimin e ankthit të përgjithësuar (GAD) dhe përmirëson cilësinë e gjumit dhe pagjumësinë përmes lidhjes së flavonoideve dhe apigeninës me receptorët GABA-A në tru, duke krijuar efekte anksiolitike dhe hipnotike.
Vitamina B6 ndihmon në sintezën e makronutrientëve dhe neurotransmetuesve, përfshirë serotoninën. Ajo ndihmon në kujtimin e ëndrrave dhe '
  + N'i bën ato më të gjalla dhe më shumëngjyrëshe.

Vitamina C e mbështet gjumin në mënyrë indirekte duke ndihmuar në prodhimin e neurotransmetuesve si serotonina, duke rregulluar humorin dhe gjumin, duke vepruar si antioksidant i fuqishëm për uljen e stresit dhe duke mbështetur funksionin imunitar, të gjitha këto kontribuojnë në mirëqenien e përgjithshme dhe në zakone të shëndetshme gjumi.Vetë formulimi i produktit përmban përbërës të zgjedhur me kujdes:

Triptofani është një aminoacid esencial që duhet marrë përmes ushqimit dhe është pararendës i serotoninës dhe melatoninës, duke ndikuar në ritmet cirkadiane. Edhe pse vetëm një përqindje e vogël e triptofanit nga ushqimi përdoret për sintezën e serotoninës, ai ndikon ndjeshëm në humor, sjellje dhe njohje. Shtimi i L-triptofanit mund të rrisë gjumin jo-REM dhe të ulë gjumin REM, gjë që '
  + N'tregon se triptofani mund të jetë efektiv si ndihmës për gjumin.
Glicina përmirëson cilësinë e gjumit, dhe marrja e saj para gjumit ul temperaturën e trupit, gjë që është thelbësore për fillimin e gjumit.
Magnezi rregullon ngacmueshmërinë e sistemit nervor qendror dhe është i domosdoshëm për funksionin e neurotransmetuesve, si dhe ka efekt relaksues dhe antidepresiv. Mungesa e magnezit lidhet me çrregullime të gjumit dhe gjendje si diabeti dhe sëmundjet kardiovaskulare.
Taurina është një aminoacid që mbron indet e ngacmueshme dhe mitokondritë, ul stresin e ER dhe rregullon receptorët e neurotransmetuesve. Ajo mbështet shëndetin kardiovaskular duke menaxhuar transportin e Ca2+ dhe gjenerimin e ROS.
Teanina përmirëson gjumin dhe ul zgjueshmërinë pa shkaktuar përgjumje gjatë ditës. Ajo rrit përqendrimin e neurotransmetuesve si dopamina, serotonina, triptofani '
  + N'dhe GABA, duke nxitur gjumin dhe duke ofruar përfitime kundër stresit.

5-hidroksitriptofani (5-HTP) është pararendës i serotoninës, përmirëson cilësinë e gjumit dhe rrit nivelet e serotoninës në serum. Ai mund të përmirësojë veçanërisht cilësinë e gjumit te të moshuarit, si dhe mund të përmirësojë përbërjen e mikrobiotës së zorrëve te personat me gjumë të dobët.
S-adenozil-L-metionina (SAMe) luan një rol kyç në funksionin e membranës qelizore dhe në sintezën e serotoninës, noradrenalinës dhe dopaminës.
Mio-inozitoli mund të ndikojë në proceset e gjumit. Një studim i rastësishëm i kontrolluar tregoi se suplementimi me mio-inozitol përmirëson cilësinë dhe kohëzgjatjen e gjumit. Mekanizmi i tij përfshin aktivizimin e receptorëve të serotoninës. Klinikisht, nivelet e inozitolit janë më të ulëta te pacientët me çrregullime të gjumit.
'
  + N'Besohet se kamomili lehtëson ankthin dhe çrregullimin e ankthit të përgjithësuar (GAD) dhe përmirëson cilësinë e gjumit dhe pagjumësinë përmes lidhjes së flavonoideve dhe apigeninës me receptorët GABA-A në tru, duke krijuar efekte anksiolitike dhe hipnotike.
Vitamina B6 ndihmon në sintezën e makronutrientëve dhe neurotransmetuesve, përfshirë serotoninën. Ajo ndihmon në kujtimin e ëndrrave dhe i bën ato më të gjalla dhe më shumëngjyrëshe.

Vitamina C e mbështet gjumin në mënyrë indirekte duke ndihmuar në prodhimin e neurotransmetuesve si serotonina, duke rregulluar humorin dhe gjumin, duke vepruar si antioksidant i fuqishëm për uljen e stresit dhe duke mbështetur funksionin imunitar, të gjitha këto kontribuojnë në mirëqenien e përgjithshme dhe në zakone të shëndetshme gjumi.'
WHERE Variant_Id IN (1409) AND HASHBYTES('SHA2_256', Ingredients) = 0x029BEA7841F439DAA585BF05C5FEFEDEFE3070DA81467E5F62BD492EEAA99497;
SET @n += @@ROWCOUNT;
-- item 278
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: 100% Creapure® creatine monohydrate.

Nutrition information for VAST CREATINE CREAPURE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: 100% Creapure® kreatinë monohidrat.

Informacione ushqyese për VAST CREATINE CREAPURE'
WHERE Variant_Id IN (1410) AND HASHBYTES('SHA2_256', Ingredients) = 0x626B8BBF74697958F96882249DD850A703CE2EC35B7D7DC55B34427CC55D8871;
SET @n += @@ROWCOUNT;
-- item 279
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY

INGREDIENTS: water, plant fibre (bamboo), stabiliser (xanthan gum), table salt, flavouring, preservative (sodium benzoate), acidity regulator (citric acid), colours (carrot extract, carmine red), sweetener (sucralose).

Nutrition information for BODY ATTACK DESSERT SAUCE (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE

PËRBËRËSIT: ujë, fibra bimore (bambu), stabilizues (gomë ksantani), kripë kuzhine, aromë, konservues (benzoat natriumi), rregullues aciditeti (acid citrik), ngjyrues (ekstrakt karote, karminë e kuqe), ëmbëlsues (sukralozë).

Informacione ushqyese për BODY ATTACK DESSERT SAUCE (LULESHTRYDHE)'
WHERE Variant_Id IN (1419) AND HASHBYTES('SHA2_256', Ingredients) = 0x2D78CD999FBFE999FE8D89AAAB020B839C6A6EFF4600C9C20173F87392711468;
SET @n += @@ROWCOUNT;
-- item 280
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'CARAMEL

INGREDIENTS: water, sweeteners (erythritol, sucralose), colour (ammonia caramel), stabiliser (xanthan gum), flavouring (contains RYE), acidity regulator (lactic acid), preservative (sodium benzoate), salt, sweetener (sucralose).

NOTE: Excessive consumption may have a laxative effect.

Nutrition information for BODY ATTACK DESSERT SAUCE (CARAMEL)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KARAMEL

PËRBËRËSIT: ujë, ëmbëlsues (eritritol, sukralozë), ngjyrues (karamel amoniaku), stabilizues (gomë ksantani), aromë (përmban THEKËR), rregullues aciditeti (acid laktik), konservues (benzoat natriumi), kripë, ëmbëlsues (sukralozë).

SHËNIM: Konsumimi i tepërt mund të ketë efekt laksativ.

Informacione ushqyese për BODY ATTACK DESSERT SAUCE (KARAMEL)'
WHERE Variant_Id IN (1420) AND HASHBYTES('SHA2_256', Ingredients) = 0x24C410ABD2389F8E7C6DAFDDF72951EA5521EF4A57337B9722D2745693D4C1A8;
SET @n += @@ROWCOUNT;
-- item 281
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: STRAWBERRY

INGREDIENTS: WHEY protein blend (98%) [MILK] (WHEY protein isolate (MILK), WHEY protein concentrate (MILK), WHEY protein hydrolysate (MILK), emulsifier: SOY lecithin), flavourings, sweeteners (sucralose, acesulfame K), thickener (xanthan gum), beetroot concentrate.

ALLERGENS: May contain GLUTEN, EGGS and PEANUTS.

Nutrition information for OPTIMUM GOLD STANDARD 100% WHEY (NEW) (STRAWBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LULESHTRYDHE

PËRBËRËSIT: përzierje proteinash HIRRE (98%) [QUMËSHT] (izolat i proteinës së HIRRËS (QUMËSHT), koncentrat i proteinës së HIRRËS (QUMËSHT), hidrolizat i proteinës së HIRRËS (QUMËSHT), emulsifikues: lecitinë SOJE), aroma, ëmbëlsues (sukralozë, acesulfam K), trashës (gomë ksantani), koncentrat panxhari.

ALERGJENËT: Mund të përmbajë GLUTEN, VEZË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM GOLD STANDARD 100% WHEY (NEW) (LULESHTRYDHE)'
WHERE Variant_Id IN (1490) AND HASHBYTES('SHA2_256', Ingredients) = 0x4CE2085833321D495BC3ADA73ABFB850A07BF1EA1453EFCDD4B7CA5C1F121492;
SET @n += @@ROWCOUNT;
-- item 282
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: FRUIT PUNCH

INGREDIENTS: L-citrulline, betaine anhydrous, taurine, WATTS''UP™ (*Citrus sinensis* extract), pine bark extract (*Pinus pinaster*) (standardised to 95% procyanidins), S7® (extracts of green tea, green coffee beans, turmeric, tart cherry, blueberry, kale and broccoli), AstraGin (*Astragalus membranaceus* and *Panax notoginseng* root), nicotinamide, ascorbic acid, acid (citric acid), maltodextrin, flavouring, anti-caking agents (magnesium stearate, silicon dioxide), bulking agent (microcrystalline cellulose), sweetener (sucralose), beetroot powder.

Nutrition information for DEDICATED UNSTOPPABLE PUMP (FRUIT PUNCH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PUNCH FRUTASH

PËRBËRËSIT: L-citrulinë, betainë anhidre, taurinë, WATTS''UP™ (ekstrakt *Citrus sinensis*), ekstrakt lëvoreje pishe (*Pinus pinaster*) (i standardizuar në 95% procianidina), S7® (ekstrakte çaji jeshil, kokrrash të gjelbra kafeje, shafrani të Indisë, vishnjeje, boronice, lakre jeshile dhe brokoli), AstraGin (*Astragalus membranaceus* dhe rrënjë *Panax notoginseng*), nikotinamid, acid askorbik, acid (acid citrik), maltodekstrinë, aromë, agjentë kundër ngjizjes (stearat magnezi, dioksid silici), agjent për rritjen e vëllimit (celulozë mikrokristaline), ëmbëlsues (sukralozë), panxhar pluhur.

Informacione ushqyese për DEDICATED UNSTOPPABLE PUMP (PUNCH FRUTASH)'
WHERE Variant_Id IN (1492) AND HASHBYTES('SHA2_256', Ingredients) = 0x09C10BA257D36ACBB57681EFFA30D99B6968BD77608D1BF4CC566531540D218C;
SET @n += @@ROWCOUNT;
-- item 283
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: FRUIT PUNCH

INGREDIENTS: L-citrulline, beta-alanine, betaine anhydrous, taurine, L-tyrosine, acid (citric acid), sweeteners (sucralose, acesulfame K), flavouring, maltodextrin, anti-caking agent (silicon dioxide), Zynamite® 15WS, caffeine, vitamins and minerals (nicotinamide (B3), ascorbic acid (C)), beetroot powder, AstraGin®.

Nutrition information for DEDICATED UNSTOPPABLE PRE-WORKOUT (FRUIT PUNCH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PUNCH FRUTASH

PËRBËRËSIT: L-citrulinë, beta-alaninë, betainë anhidre, taurinë, L-tirozinë, acid (acid citrik), ëmbëlsues (sukralozë, acesulfam K), aromë, maltodekstrinë, agjent kundër ngjizjes (dioksid silici), Zynamite® 15WS, kafeinë, vitamina dhe minerale (nikotinamid (B3), acid askorbik (C)), panxhar pluhur, AstraGin®.

Informacione ushqyese për DEDICATED UNSTOPPABLE PRE-WORKOUT (PUNCH FRUTASH)'
WHERE Variant_Id IN (1493) AND HASHBYTES('SHA2_256', Ingredients) = 0x419FAE0FCE07D54781D6384F64F7493BD430EAF0A79B258D40BBAA6AD6DBB830;
SET @n += @@ROWCOUNT;
-- item 284
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: TROPICAL FLAVOUR

INGREDIENTS: L-citrulline, beta-alanine, betaine anhydrous, taurine, L-tyrosine, acids (citric acid, malic acid), flavouring, maltodextrin, sweeteners (sucralose, acesulfame K), anti-caking agent (silicon dioxide), Zynamite® 15WS, caffeine, vitamins and minerals (nicotinamide (B3), ascorbic acid (C)), colour (beta-carotene), AstraGin®.

Nutrition information for DEDICATED UNSTOPPABLE PRE-WORKOUT (TROPICAL FLAVOUR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: SHIJE TROPIKALE

PËRBËRËSIT: L-citrulinë, beta-alaninë, betainë anhidre, taurinë, L-tirozinë, acide (acid citrik, acid malik), aromë, maltodekstrinë, ëmbëlsues (sukralozë, acesulfam K), agjent kundër ngjizjes (dioksid silici), Zynamite® 15WS, kafeinë, vitamina dhe minerale (nikotinamid (B3), acid askorbik (C)), ngjyrues (beta-karoten), AstraGin®.

Informacione ushqyese për DEDICATED UNSTOPPABLE PRE-WORKOUT (SHIJE TROPIKALE)'
WHERE Variant_Id IN (1494) AND HASHBYTES('SHA2_256', Ingredients) = 0xE950C2AF80225C3CC2B6D456513805EB3939D8D2B0B1167B825AD396DF5A34F7;
SET @n += @@ROWCOUNT;
-- item 285
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: instant whey protein concentrate, milk protein concentrate (MILK), glycine, instant MILK powder, maltodextrin, fat-reduced cocoa powder, L-leucine, chocolate flavouring, thickener: xanthan gum, sodium chloride, sweetener: sucralose, lactase powder.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI MY NEW WHEY (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës, koncentrat i proteinës së qumështit (QUMËSHT), glicinë, QUMËSHT pluhur i çastit, maltodekstrinë, kakao pluhur me pak yndyrë, L-leucinë, aromë çokollate, trashës: gomë ksantani, klorur natriumi, ëmbëlsues: sukralozë, laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI MY NEW WHEY (ÇOKOLLATË)'
WHERE Variant_Id IN (1495) AND HASHBYTES('SHA2_256', Ingredients) = 0xA08A8AD835AA0F3E78EE51418867DAD26FB8C874E028A14E9A1F5ED0D79E25B2;
SET @n += @@ROWCOUNT;
-- item 286
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: instant whey protein concentrate (MILK), milk protein concentrate (MILK), glycine, instant MILK powder, maltodextrin, flavouring, thickener: guar gum, L-leucine, thickener: xanthan gum, salt, natural flavouring, lactase powder, sweetener: sucralose.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI MY NEW WHEY (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT), glicinë, QUMËSHT pluhur i çastit, maltodekstrinë, aromë, trashës: gomë guar, L-leucinë, trashës: gomë ksantani, kripë, aromë natyrale, laktazë pluhur, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI MY NEW WHEY (VANILJE)'
WHERE Variant_Id IN (1496) AND HASHBYTES('SHA2_256', Ingredients) = 0x137EDA3A363E5DFB6386E57D7E1E00294DF4C493C8681D8BD093284858DDF78A;
SET @n += @@ROWCOUNT;
-- item 287
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: COOKIES AND CREAM

INGREDIENTS: instant whey protein concentrate, milk protein concentrate (MILK), glycine, maltodextrin, instant MILK powder, cookie flavouring, L-leucine, thickener: xanthan gum, caramel flavouring, sweetener: sucralose, lactase powder, sodium chloride.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI MY NEW WHEY (COOKIES AND CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: BISKOTA DHE KREM

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës, koncentrat i proteinës së qumështit (QUMËSHT), glicinë, maltodekstrinë, QUMËSHT pluhur i çastit, aromë biskotash, L-leucinë, trashës: gomë ksantani, aromë karameli, ëmbëlsues: sukralozë, laktazë pluhur, klorur natriumi.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI MY NEW WHEY (BISKOTA DHE KREM)'
WHERE Variant_Id IN (1497) AND HASHBYTES('SHA2_256', Ingredients) = 0xA22CE7C22D5F03C8A4E7A42F431B71E21BE23E53CB8C4EDF67623DBE656E56AE;
SET @n += @@ROWCOUNT;
-- item 288
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'GARLIC

INGREDIENTS: refined rapeseed oil 97%, stabiliser (rapeseed lecithin E322) 3%, garlic flavouring 0.2%.

Propellant: compressed air (does not come into contact with the other ingredients, "bag-on-valve" system).

Nutrition information for RABEKO NON-STICK ZERO COOKING SPRAY (GARLIC)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'HUDHËR

PËRBËRËSIT: vaj ree i rafinuar 97%, stabilizues (lecitinë ree E322) 3%, aromë hudhre 0,2%.

Gaz shtytës: ajër i kompresuar (nuk bie në kontakt me përbërësit e tjerë, sistemi "bag-on-valve").

Informacione ushqyese për RABEKO NON-STICK ZERO COOKING SPRAY (HUDHËR)'
WHERE Variant_Id IN (1498) AND HASHBYTES('SHA2_256', Ingredients) = 0x7F8912472578CB8DC5668C1E9576B5B91BDC21B4369B35C64B9228BF5ADF30BF;
SET @n += @@ROWCOUNT;
-- item 289
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: creatine monohydrate (100%).

Nutrition information for BODY ATTACK 100% PURE CREATINE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: kreatinë monohidrat (100%).

Informacione ushqyese për BODY ATTACK 100% PURE CREATINE'
WHERE Variant_Id IN (1500) AND HASHBYTES('SHA2_256', Ingredients) = 0xA87FBC46EC8EA626969B520A837C33186719775CDDB351AA38C8ACE571DBC70F;
SET @n += @@ROWCOUNT;
-- item 290
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: EGG protein isolate (92%), fat-reduced cocoa powder (9%), flavourings, emulsifier (sodium carboxymethyl cellulose), salt, sweetener (sucralose), anti-foaming agent (silicon dioxide).

Produced in a facility that processes products containing GLUTEN, SOY, MILK and NUTS.

Nutrition information for NÄNO SUPPS EGG WHITE PROTEIN (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: izolat i proteinës së VEZËS (92%), kakao pluhur me pak yndyrë (9%), aroma, emulsifikues (karboksimetil celulozë natriumi), kripë, ëmbëlsues (sukralozë), agjent kundër shkumës (dioksid silici).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë GLUTEN, SOJE, QUMËSHT dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS EGG WHITE PROTEIN (ÇOKOLLATË)'
WHERE Variant_Id IN (1501) AND HASHBYTES('SHA2_256', Ingredients) = 0x747CAB0A89DBDE88369D42DCD067D626198DA0D417BC6BE3996B6911C0F545F8;
SET @n += @@ROWCOUNT;
-- item 291
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: EGG protein isolate (92%), flavourings, salt, emulsifier (sodium carboxymethyl cellulose), salt, sweetener (sucralose), anti-foaming agent (silicon dioxide), vanilla crystals.

Produced in a facility that processes products containing GLUTEN, SOY, MILK and NUTS.

Nutrition information for NÄNO SUPPS EGG WHITE PROTEIN (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: izolat i proteinës së VEZËS (92%), aroma, kripë, emulsifikues (karboksimetil celulozë natriumi), kripë, ëmbëlsues (sukralozë), agjent kundër shkumës (dioksid silici), kristale vaniljeje.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë GLUTEN, SOJE, QUMËSHT dhe FRUTA ME LËVOZHGË.

Informacione ushqyese për NÄNO SUPPS EGG WHITE PROTEIN (VANILJE)'
WHERE Variant_Id IN (1502) AND HASHBYTES('SHA2_256', Ingredients) = 0x5813AE028BE07CF5EAE66959935D9B0CFE9DE0FAD8C552EE0B2D5A7A39169AA9;
SET @n += @@ROWCOUNT;
-- item 292
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: bulking agent – microcrystalline cellulose, nicotinamide – niacin (vitamin B3), LACTOSE, calcium D-pantothenate – pantothenic acid (vitamin B5), binding agent – calcium phosphates; coating (glazing agent – polyvinyl alcohol (PVA), magnesium phosphates, talc, polyethylene glycol, colour – iron oxides and hydroxides; glazing agent – polysorbate 80); firming agent – calcium phosphates; pyridoxine hydrochloride – vitamin B6, cyanocobalamin – vitamin B12, riboflavin – vitamin B2, bulking agent – cross-linked sodium carmellose; thiamine hydrochloride – thiamine (vitamin B1), anti-caking agent – magnesium salts of fatty acids; pteroylmonoglutamic acid – folic acid (vitamin B9), D-biotin – biotin (vitamin B8).

Nutrition information for OLIMP GOLD-VIT B FORTE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: agjent për rritjen e vëllimit – celulozë mikrokristaline, nikotinamid – niacinë (vitamina B3), LAKTOZË, D-pantotenat kalciumi – acid pantotenik (vitamina B5), agjent lidhës – fosfate kalciumi; veshje (agjent lustrues – alkool polivinilik (PVA), fosfate magnezi, talk, polietilen glikol, ngjyrues – okside dhe hidrokside hekuri; agjent lustrues – polisorbat 80); agjent forcues – fosfate kalciumi; piridoksinë hidroklorur – vitamina B6, cianokobalaminë – vitamina B12, riboflavinë – vitamina B2, agjent për rritjen e vëllimit – karmelozë natriumi e ndërlidhur; tiaminë hidroklorur – tiaminë (vitamina B1), agjent kundër ngjizjes – kripëra magnezi të acideve yndyrore; acid pteroilmonoglutamik – acid folik (vitamina B9), D-biotinë – biotinë (vitamina B8).

Informacione ushqyese për OLIMP GOLD-VIT B FORTE'
WHERE Variant_Id IN (1504) AND HASHBYTES('SHA2_256', Ingredients) = 0x22363454D9F51443C51D8746339BB12FA844B1C83966A4B98AFC03DCDDF4DAE0;
SET @n += @@ROWCOUNT;
-- item 293
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: YUZU PEACH

INGREDIENTS: L-citrulline DL-malate (2:1), BetaPower® (natural betaine anhydrous), VitaCholine® (choline bitartrate), TriBsyn™ (beta-alanine), N-acetyl-L-tyrosine, Peak ATP® (adenosine 5′-triphosphate), anti-caking agent (silicon dioxide), potassium citrate, PurCaf® (organic caffeine from green coffee beans), magnesium citrate, pink Himalayan salt, flavouring, colour (curcumin), Senactiv® (*Panax notoginseng* extract and *Rosa roxburghii* fruit extract), S7® (green coffee bean extract, green tea extract, turmeric extract, tart cherry extract, blueberry extract, broccoli extract, kale extract), vitamin B12 (methylcobalamin), sweeteners (sucralose, steviol glycosides).

ALLERGENS: May contain MILK, SOY, GLUTEN and EGGS.

Nutrition information for VAST V8 ULTRA (YUZU PEACH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: JUZU PJESHKË

PËRBËRËSIT: L-citrulinë DL-malat (2:1), BetaPower® (betainë natyrale anhidre), VitaCholine® (bitartrat koline), TriBsyn™ (beta-alaninë), N-acetil-L-tirozinë, Peak ATP® (adenozinë 5′-trifosfat), agjent kundër ngjizjes (dioksid silici), citrat kaliumi, PurCaf® (kafeinë organike nga kokrrat e gjelbra të kafesë), citrat magnezi, kripë rozë e Himalajeve, aromë, ngjyrues (kurkuminë), Senactiv® (ekstrakt *Panax notoginseng* dhe ekstrakt fruti *Rosa roxburghii*), S7® (ekstrakt kokrrash të gjelbra kafeje, ekstrakt çaji jeshil, ekstrakt shafrani të Indisë, ekstrakt vishnjeje, ekstrakt boronice, ekstrakt brokoli, ekstrakt lakre jeshile), vitamina B12 (metilkobalaminë), ëmbëlsues (sukralozë, glikozide steviolike).

ALERGJENËT: Mund të përmbajë QUMËSHT, SOJE, GLUTEN dhe VEZË.

Informacione ushqyese për VAST V8 ULTRA (JUZU PJESHKË)'
WHERE Variant_Id IN (1507) AND HASHBYTES('SHA2_256', Ingredients) = 0xEABDF7AAC8228E64610655908691CFCFC81F10B2D6D1EB29ECCE42695E4C9165;
SET @n += @@ROWCOUNT;
-- item 294
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: BLUE RASPBERRY

INGREDIENTS: L-citrulline DL-malate (2:1), BetaPower® (natural betaine anhydrous), VitaCholine® (choline bitartrate), TriBsyn™ (beta-alanine), N-acetyl-L-tyrosine, Peak ATP® (adenosine 5′-triphosphate), anti-caking agent (silicon dioxide), potassium citrate, PurCaf® (organic caffeine from green coffee beans), magnesium citrate, pink Himalayan salt, flavouring, colour (spirulina extract), Senactiv® (*Panax notoginseng* extract and *Rosa roxburghii* fruit extract), S7® (green coffee bean extract, green tea extract, turmeric extract, tart cherry extract, blueberry extract, broccoli extract, kale extract), vitamin B12 (methylcobalamin), sweeteners (sucralose, steviol glycosides).

ALLERGENS: May contain MILK, SOY, GLUTEN and EGGS.

Nutrition information for VAST V8 ULTRA (BLUE RASPBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MJEDËR BLU

PËRBËRËSIT: L-citrulinë DL-malat (2:1), BetaPower® (betainë natyrale anhidre), VitaCholine® (bitartrat koline), TriBsyn™ (beta-alaninë), N-acetil-L-tirozinë, Peak ATP® (adenozinë 5′-trifosfat), agjent kundër ngjizjes (dioksid silici), citrat kaliumi, PurCaf® (kafeinë organike nga kokrrat e gjelbra të kafesë), citrat magnezi, kripë rozë e Himalajeve, aromë, ngjyrues (ekstrakt spiruline), Senactiv® (ekstrakt *Panax notoginseng* dhe ekstrakt fruti *Rosa roxburghii*), S7® (ekstrakt kokrrash të gjelbra kafeje, ekstrakt çaji jeshil, ekstrakt shafrani të Indisë, ekstrakt vishnjeje, ekstrakt boronice, ekstrakt brokoli, ekstrakt lakre jeshile), vitamina B12 (metilkobalaminë), ëmbëlsues (sukralozë, glikozide steviolike).

ALERGJENËT: Mund të përmbajë QUMËSHT, SOJE, GLUTEN dhe VEZË.

Informacione ushqyese për VAST V8 ULTRA (MJEDËR BLU)'
WHERE Variant_Id IN (1508) AND HASHBYTES('SHA2_256', Ingredients) = 0xE36E02D4EE5240B4292C0213DC022341490065A88956651D85711E10CA257DF7;
SET @n += @@ROWCOUNT;
-- item 295
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: PINK LEMONADE

INGREDIENTS: L-citrulline DL-malate (2:1), BetaPower® (natural betaine anhydrous), VitaCholine® (choline bitartrate), TriBsyn™ (beta-alanine), N-acetyl-L-tyrosine, Peak ATP® (adenosine 5′-triphosphate), anti-caking agent (silicon dioxide), potassium citrate, PurCaf® (organic caffeine from green coffee beans), magnesium citrate, pink Himalayan salt, flavouring, colour (beetroot extract), Senactiv® (*Panax notoginseng* extract and *Rosa roxburghii* fruit extract), S7® (green coffee bean extract, green tea extract, turmeric extract, tart cherry extract, blueberry extract, broccoli extract, kale extract), vitamin B12 (methylcobalamin), sweeteners (sucralose, steviol glycosides).

ALLERGENS: May contain MILK, SOY, GLUTEN and EGGS.

Nutrition information for VAST V8 ULTRA (PINK LEMONADE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LIMONADË ROZË

PËRBËRËSIT: L-citrulinë DL-malat (2:1), BetaPower® (betainë natyrale anhidre), VitaCholine® (bitartrat koline), TriBsyn™ (beta-alaninë), N-acetil-L-tirozinë, Peak ATP® (adenozinë 5′-trifosfat), agjent kundër ngjizjes (dioksid silici), citrat kaliumi, PurCaf® (kafeinë organike nga kokrrat e gjelbra të kafesë), citrat magnezi, kripë rozë e Himalajeve, aromë, ngjyrues (ekstrakt panxhari), Senactiv® (ekstrakt *Panax notoginseng* dhe ekstrakt fruti *Rosa roxburghii*), S7® (ekstrakt kokrrash të gjelbra kafeje, ekstrakt çaji jeshil, ekstrakt shafrani të Indisë, ekstrakt vishnjeje, ekstrakt boronice, ekstrakt brokoli, ekstrakt lakre jeshile), vitamina B12 (metilkobalaminë), ëmbëlsues (sukralozë, glikozide steviolike).

ALERGJENËT: Mund të përmbajë QUMËSHT, SOJE, GLUTEN dhe VEZË.

Informacione ushqyese për VAST V8 ULTRA (LIMONADË ROZË)'
WHERE Variant_Id IN (1509) AND HASHBYTES('SHA2_256', Ingredients) = 0x70CE984F6D2DE249877A9CF5B9C26B480BB89EE00D2E18F5AB36AB852C922FED;
SET @n += @@ROWCOUNT;
-- item 296
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHERRY AND BERRIES

INGREDIENTS: acidity regulator: citric acid, L-leucine, maltodextrin, L-glutamine, magnesium salts of citric acid, glycine, L-isoleucine, L-valine, taurine, EAA amino acid powder blend [L-threonine, L-methionine, L-phenylalanine, L-tryptophan, L-histidine, emulsifier: sunflower lecithin], strawberry flavouring, L-lysine, sodium chloride, cherry flavouring, sweetener (sucralose), pyridoxine hydrochloride (vitamin B6).

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for SPORTNAHRUNG EAA LOADED (CHERRY AND BERRIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: QERSHI DHE MANAFERRA

PËRBËRËSIT: rregullues aciditeti: acid citrik, L-leucinë, maltodekstrinë, L-glutaminë, kripëra magnezi të acidit citrik, glicinë, L-izoleucinë, L-valinë, taurinë, përzierje pluhuri aminoacidesh EAA [L-treoninë, L-metioninë, L-fenilalaninë, L-triptofan, L-histidinë, emulsifikues: lecitinë luledielli], aromë luleshtrydheje, L-lizinë, klorur natriumi, aromë qershie, ëmbëlsues (sukralozë), piridoksinë hidroklorur (vitamina B6).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për SPORTNAHRUNG EAA LOADED (QERSHI DHE MANAFERRA)'
WHERE Variant_Id IN (1511) AND HASHBYTES('SHA2_256', Ingredients) = 0x906425F6D93389471C2FC236906205FAB365DC40EFA1123B19320E1D840F7599;
SET @n += @@ROWCOUNT;
-- item 297
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: PEACH

INGREDIENTS: acidity regulator: citric acid, L-leucine, maltodextrin, L-glutamine, magnesium salts of citric acid, glycine, L-isoleucine, L-valine, taurine, EAA amino acid powder blend [L-threonine, L-methionine, L-phenylalanine, L-tryptophan, L-histidine, emulsifier: sunflower lecithin], peach flavouring (contains dried glucose syrup), L-lysine, sodium chloride, sweetener (sucralose), pyridoxine hydrochloride (vitamin B6).

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for SPORTNAHRUNG EAA LOADED (PEACH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PJESHKË

PËRBËRËSIT: rregullues aciditeti: acid citrik, L-leucinë, maltodekstrinë, L-glutaminë, kripëra magnezi të acidit citrik, glicinë, L-izoleucinë, L-valinë, taurinë, përzierje pluhuri aminoacidesh EAA [L-treoninë, L-metioninë, L-fenilalaninë, L-triptofan, L-histidinë, emulsifikues: lecitinë luledielli], aromë pjeshke (përmban shurup glukoze të tharë), L-lizinë, klorur natriumi, ëmbëlsues (sukralozë), piridoksinë hidroklorur (vitamina B6).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për SPORTNAHRUNG EAA LOADED (PJESHKË)'
WHERE Variant_Id IN (1512) AND HASHBYTES('SHA2_256', Ingredients) = 0x1551AA2DD6B24EBB952D6A31EF1D70489FE44E19C3AADD6E3E1706F96E470D15;
SET @n += @@ROWCOUNT;
-- item 298
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: acidity regulator – citric acid, potassium carbonate, acidity regulator – sodium carbonates, bulking agent – sorbitol, magnesium bisglycinate (Albion magnesium amino acid chelate), flavourings, magnesium oxide, vitamins (pyridoxine hydrochloride – vitamin B6, cyanocobalamin – vitamin B12, riboflavin – vitamin B2, thiamine mononitrate – vitamin B1, D-biotin – biotin), stabiliser – polyethylene glycol, sweeteners (acesulfame K, sucralose), colour – cochineal (for grapefruit flavour).

Nutrition information for OLIMP CHELA-MAG B6 CRAMP',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: rregullues aciditeti – acid citrik, karbonat kaliumi, rregullues aciditeti – karbonate natriumi, agjent për rritjen e vëllimit – sorbitol, bisglicinat magnezi (kelat aminoacid magnezi Albion), aroma, oksid magnezi, vitamina (piridoksinë hidroklorur – vitamina B6, cianokobalaminë – vitamina B12, riboflavinë – vitamina B2, tiaminë mononitrat – vitamina B1, D-biotinë – biotinë), stabilizues – polietilen glikol, ëmbëlsues (acesulfam K, sukralozë), ngjyrues – koshinil (për shijen grejpfrut).

Informacione ushqyese për OLIMP CHELA-MAG B6 CRAMP'
WHERE Variant_Id IN (1513) AND HASHBYTES('SHA2_256', Ingredients) = 0x89A23BF8B5D8C1A9A24244AA8FE7088DB583CA74B17EE06D20F43FDD3306B4D6;
SET @n += @@ROWCOUNT;
-- item 299
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: ORANGE

INGREDIENTS: creatine monohydrate, sweetener (sorbitol), starch, anti-caking agents (silicon dioxide and magnesium salts of fatty acids), flavouring, acidity regulator (citric acid), sweetener (sucralose).

ALLERGENS: May contain traces of GLUTEN, EGGS, SOY and MILK.

*Excessive consumption may have a laxative effect.*

Nutrition information for SPORTNAHRUNG CREATINE CHEWABLE TABLETS (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PORTOKALL

PËRBËRËSIT: kreatinë monohidrat, ëmbëlsues (sorbitol), niseshte, agjentë kundër ngjizjes (dioksid silici dhe kripëra magnezi të acideve yndyrore), aromë, rregullues aciditeti (acid citrik), ëmbëlsues (sukralozë).

ALERGJENËT: Mund të përmbajë gjurmë të GLUTENIT, VEZËVE, SOJES dhe QUMËSHTIT.

*Konsumimi i tepërt mund të ketë efekt laksativ.*

Informacione ushqyese për SPORTNAHRUNG CREATINE CHEWABLE TABLETS (PORTOKALL)'
WHERE Variant_Id IN (1514) AND HASHBYTES('SHA2_256', Ingredients) = 0xE0D2D264114B85D7B6BF86F447241F69EA35A21C3D69C6E3E9D9D4F1D602A0D8;
SET @n += @@ROWCOUNT;
-- item 300
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'COCONUT AND BLUEBERRY (CARBONATED)

INGREDIENTS: water, stabiliser (polydextrose), carbon dioxide, acidity regulator (malic acid), L-carnitine, taurine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), nicotinamide.

Nutrition information for NUTREND CARNITINE DRINK (CAFFEINE FREE) (COCONUT AND BLUEBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'KOKOS DHE BORONICË (E GAZUAR)

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), dioksid karboni, rregullues aciditeti (acid malik), L-karnitinë, taurinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), nikotinamid.

Informacione ushqyese për NUTREND CARNITINE DRINK (CAFFEINE FREE) (KOKOS DHE BORONICË)'
WHERE Variant_Id IN (1528) AND HASHBYTES('SHA2_256', Ingredients) = 0xA0CD66C94562F36869E338D9F17F4BD10BA191C1618C97CB91A2CA7A455773FF;
SET @n += @@ROWCOUNT;
-- item 301
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'YUZU

INGREDIENTS: water, stabiliser (polydextrose), acidity regulator (citric acid), taurine, L-carnitine, flavouring, preservatives (potassium sorbate, sodium benzoate), sweeteners (acesulfame K, sucralose), vitamin B3 (nicotinamide).

Nutrition information for NUTREND CARNITINE DRINK (CAFFEINE FREE) (YUZU)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'JUZU

PËRBËRËSIT: ujë, stabilizues (polidekstrozë), rregullues aciditeti (acid citrik), taurinë, L-karnitinë, aromë, konservues (sorbat kaliumi, benzoat natriumi), ëmbëlsues (acesulfam K, sukralozë), vitamina B3 (nikotinamid).

Informacione ushqyese për NUTREND CARNITINE DRINK (CAFFEINE FREE) (JUZU)'
WHERE Variant_Id IN (1529) AND HASHBYTES('SHA2_256', Ingredients) = 0x40BD51FDEA2D4AA529655102B1043A985BCC78E1426890CEF9B65D7109056C3E;
SET @n += @@ROWCOUNT;
-- item 302
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'STRAWBERRY KIWI

INGREDIENTS: L-leucine, L-isoleucine, L-valine, flavourings (kiwi, strawberry), acidity regulator (anhydrous citric acid), sweeteners (sucralose, steviol glycosides), thickener (xanthan gum).

Produced in a facility that processes ingredients containing MILK, EGGS, GLUTEN, SOY, PEANUTS, NUTS, FISH and CRUSTACEANS.

Nutrition information for PROTEINI.SI NATURAL BCAA (STRAWBERRY KIWI)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'LULESHTRYDHE KIVI

PËRBËRËSIT: L-leucinë, L-izoleucinë, L-valinë, aroma (kivi, luleshtrydhe), rregullues aciditeti (acid citrik anhidër), ëmbëlsues (sukralozë, glikozide steviolike), trashës (gomë ksantani).

Prodhuar në një objekt ku përpunohen përbërës që përmbajnë QUMËSHT, VEZË, GLUTEN, SOJE, KIKIRIKË, FRUTA ME LËVOZHGË, PESHK dhe KRUSTACE.

Informacione ushqyese për PROTEINI.SI NATURAL BCAA (LULESHTRYDHE KIVI)'
WHERE Variant_Id IN (1530) AND HASHBYTES('SHA2_256', Ingredients) = 0xC71BC05317BF65B5E14C9959DF3C7A6A61AF65842765DCDB0CC84B4530B501AE;
SET @n += @@ROWCOUNT;
-- item 303
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: LEMON

INGREDIENTS: maltodextrin, acid (citric acid), sodium chloride, potassium chloride, flavourings, tricalcium phosphate, magnesium oxide, sweetener (sucralose), colour (riboflavins).

May contain MILK, GLUTEN, EGGS, SOY, NUTS and PEANUTS.

Nutrition information for OPTIMUM ELECTROLYTE POWDER (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LIMON

PËRBËRËSIT: maltodekstrinë, acid (acid citrik), klorur natriumi, klorur kaliumi, aroma, fosfat trikalciumi, oksid magnezi, ëmbëlsues (sukralozë), ngjyrues (riboflavina).

Mund të përmbajë QUMËSHT, GLUTEN, VEZË, SOJE, FRUTA ME LËVOZHGË dhe KIKIRIKË.

Informacione ushqyese për OPTIMUM ELECTROLYTE POWDER (LIMON)'
WHERE Variant_Id IN (1533) AND HASHBYTES('SHA2_256', Ingredients) = 0x116460C5DFC2E3D60D7D188BDBE2E322964AFA03BF01D815F493EAB3C74E0AC3;
SET @n += @@ROWCOUNT;
-- item 304
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE AND BLUEBERRY

INGREDIENTS: protein blend (whey protein concentrate (MILK), whey protein isolate (MILK), whey protein hydrolysate (MILK), emulsifier (sunflower lecithin)), fat-reduced cocoa powder (*Theobroma cacao*) 12%, inulin, flavouring, thickeners (xanthan gum, guar gum), sodium chloride, natural flavouring, sweetener (sucralose), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold. May contain traces of NUTS, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition values for USN BLUE LAB 100% WHEY PROTEIN (CHOCOLATE AND BLUEBERRY)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË DHE BORONICË

PËRBËRËSIT: përzierje proteinash (koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT), hidrolizat i proteinës së hirrës (QUMËSHT), emulsifikues (lecitinë luledielli)), kakao pluhur me pak yndyrë (*Theobroma cacao*) 12%, inulinë, aromë, trashës (gomë ksantani, gomë guar), klorur natriumi, aromë natyrale, ëmbëlsues (sukralozë), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara. Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Vlerat ushqyese për USN BLUE LAB 100% WHEY PROTEIN (ÇOKOLLATË DHE BORONICË)'
WHERE Variant_Id IN (1534) AND HASHBYTES('SHA2_256', Ingredients) = 0x18E875C518955FED9D0CE507D79CF24AB3BE62FFA34B2DDE879477EFC7547AD3;
SET @n += @@ROWCOUNT;
-- item 305
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: RED FRUIT PUNCH

INGREDIENTS: creatine monohydrate, acidity regulators (malic acid, citric acid, trisodium citrate, disodium phosphate), natural flavouring, colours (beetroot red, beta-carotene), sweeteners (sucralose, acesulfame K).

ALLERGENS: May contain traces of NUTS, MILK, SOY, GLUTEN, EGGS, FISH, CRUSTACEANS and SULPHITES.

Nutrition information for USN CREATINE MONOHYDRATE (RED FRUIT PUNCH)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PUNCH FRUTASH TË KUQE

PËRBËRËSIT: kreatinë monohidrat, rregullues aciditeti (acid malik, acid citrik, citrat trinatriumi, fosfat dinatriumi), aromë natyrale, ngjyrues (e kuqe panxhari, beta-karoten), ëmbëlsues (sukralozë, acesulfam K).

ALERGJENËT: Mund të përmbajë gjurmë të FRUTAVE ME LËVOZHGË, QUMËSHTIT, SOJES, GLUTENIT, VEZËVE, PESHKUT, KRUSTACEVE dhe SULFITEVE.

Informacione ushqyese për USN CREATINE MONOHYDRATE (PUNCH FRUTASH TË KUQE)'
WHERE Variant_Id IN (1535) AND HASHBYTES('SHA2_256', Ingredients) = 0xE6CD693D75E8623CEE36C706594E0F682E27C76FD29EF50348BC172E4E1DA805;
SET @n += @@ROWCOUNT;
-- item 306
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: protein blend [whey protein concentrate (MILK), SOY protein isolate, milk protein isolate (MILK), milk protein (MILK), whey protein isolate (MILK) (emulsifier: sunflower lecithin), hydrolysed whey protein isolate (MILK) (emulsifier: sunflower lecithin)], maltodextrin, polydextrose, fat-reduced cocoa powder, oil powder (refined SOY oil, glucose syrup, milk protein (MILK), stabiliser (pentasodium triphosphate), flow agent (silicon dioxide), natural flavouring), inulin, high-amylose corn starch, thickeners (guar gum, cellulose gum, xanthan gum), tripotassium citrate, milk mineral complex (MILK), flavouring, creamer [high-oleic sunflower oil, glucose syrup, flow agent (silicon dioxide), modified starch sodium octenyl succinate], sodium chloride, sweetener (sucralose), vitamin and mineral blend (magnesium oxide, ascorbic acid, ferrous fumarate, zinc citrate, D-alpha-tocopheryl '
  + N'acetate, nicotinamide, manganese bisglycinate, calcium D-pantothenate, retinyl acetate, copper bisglycinate, cyanocobalamin, D-biotin, cholecalciferol, pyridoxine hydrochloride, riboflavin, phylloquinone, thiamine hydrochloride, chromium picolinate, potassium iodate, folic acid, sodium selenite), Tolerase L (pH-stable lactase).

ALLERGENS: For allergens, see the ingredients in bold.

Nutrition information for USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: përzierje proteinash [koncentrat i proteinës së hirrës (QUMËSHT), izolat i proteinës së SOJES, izolat i proteinës së qumështit (QUMËSHT), proteinë qumështi (QUMËSHT), izolat i proteinës së hirrës (QUMËSHT) (emulsifikues: lecitinë luledielli), izolat i hidrolizuar i proteinës së hirrës (QUMËSHT) (emulsifikues: lecitinë luledielli)], maltodekstrinë, polidekstrozë, kakao pluhur me pak yndyrë, vaj pluhur (vaj SOJE i rafinuar, shurup glukoze, proteinë qumështi (QUMËSHT), stabilizues (trifosfat pentanatriumi), agjent rrjedhshmërie (dioksid silici), aromë natyrale), inulinë, niseshte misri me përmbajtje të lartë amiloze, trashës (gomë guar, gomë celuloze, gomë ksantani), citrat trikaliumi, kompleks mineralesh qumështi (QUMËSHT), aromë, kremues [vaj luledielli me përmbajtje të lartë oleike, shurup glukoze, agjent rrjedhshmërie '
  + N'(dioksid silici), niseshte e modifikuar oktenil sukcinat natriumi], klorur natriumi, ëmbëlsues (sukralozë), përzierje vitaminash dhe mineralesh (oksid magnezi, acid askorbik, fumarat hekuri, citrat zinku, D-alfa-tokoferil acetat, nikotinamid, bisglicinat mangani, D-pantotenat kalciumi, retinil acetat, bisglicinat bakri, cianokobalaminë, D-biotinë, kolekalciferol, piridoksinë hidroklorur, riboflavinë, filokinon, tiaminë hidroklorur, pikolinat kromi, jodat kaliumi, acid folik, selenit natriumi), Tolerase L (laktazë e qëndrueshme ndaj pH).

ALERGJENËT: Për alergjenët, shihni përbërësit e shënuar me shkronja të theksuara.

Informacione ushqyese për USN LIV.SMART SLIM SHAKE MEAL REPLACEMENT (ÇOKOLLATË)'
WHERE Variant_Id IN (1536) AND HASHBYTES('SHA2_256', Ingredients) = 0xDB6AA61124C5EC5D12D91862D76C129CBF60D567D3FC473C0E7A83F6609DCE50;
SET @n += @@ROWCOUNT;
-- item 307
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: APPLE

INGREDIENTS: maltodextrin, L-citrulline DL-malate 2:1, beta-alanine, creatine monohydrate, acidity regulator: citric acid, apple flavouring, potassium salts of orthophosphoric acid, L-arginine, magnesium salts of citric acid, L-tyrosine, L-taurine, sodium citrate, caffeine anhydrous, sweetener: sucralose, L-ascorbic acid (vitamin C), black pepper extract (*Piper nigrum* L.), nicotinamide (vitamin B3).

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for SPORTNAHRUNG SUPER BOOST (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MOLLË

PËRBËRËSIT: maltodekstrinë, L-citrulinë DL-malat 2:1, beta-alaninë, kreatinë monohidrat, rregullues aciditeti: acid citrik, aromë molle, kripëra kaliumi të acidit ortofosforik, L-argininë, kripëra magnezi të acidit citrik, L-tirozinë, L-taurinë, citrat natriumi, kafeinë anhidre, ëmbëlsues: sukralozë, acid L-askorbik (vitamina C), ekstrakt piperi të zi (*Piper nigrum* L.), nikotinamid (vitamina B3).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për SPORTNAHRUNG SUPER BOOST (NEW)'
WHERE Variant_Id IN (1537) AND HASHBYTES('SHA2_256', Ingredients) = 0xA76D07DAADB8CC143A5917864D7716B8F6E1C9DEC7B6D9EF8172B438B8881AE5;
SET @n += @@ROWCOUNT;
-- item 308
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: AMERICAN

INGREDIENTS: water, sweeteners (erythritol, sucralose), spirit vinegar (3%), plant fibre (bamboo), stabiliser (xanthan gum), flavouring, acidity regulator (lactic acid), preservative (sodium benzoate), table salt, colour (sulphite ammonia caramel).

Nutrition information for BODY ATTACK BBQ SAUCE (AMERICAN)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: AMERIKANE

PËRBËRËSIT: ujë, ëmbëlsues (eritritol, sukralozë), uthull alkooli (3%), fibra bimore (bambu), stabilizues (gomë ksantani), aromë, rregullues aciditeti (acid laktik), konservues (benzoat natriumi), kripë kuzhine, ngjyrues (karamel sulfit-amoniaku).

Informacione ushqyese për BODY ATTACK BBQ SAUCE (AMERIKANE)'
WHERE Variant_Id IN (1547) AND HASHBYTES('SHA2_256', Ingredients) = 0x0F3FAAD01572F7BACC519A3E30371AE59970401A48526771EF2F72A004115EEB;
SET @n += @@ROWCOUNT;
-- item 309
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE

INGREDIENTS: instant whey protein concentrate (MILK), instant whey protein isolate (MILK), fat-reduced cocoa powder, chocolate flavouring, thickener: xanthan gum, sodium chloride, sweetener: sucralose, lactase powder.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for SPORTNAHRUNG WHEY DELUXE (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: ÇOKOLLATË

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës (QUMËSHT), izolat i çastit i proteinës së hirrës (QUMËSHT), kakao pluhur me pak yndyrë, aromë çokollate, trashës: gomë ksantani, klorur natriumi, ëmbëlsues: sukralozë, laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për SPORTNAHRUNG WHEY DELUXE (ÇOKOLLATË)'
WHERE Variant_Id IN (1548) AND HASHBYTES('SHA2_256', Ingredients) = 0xA4BADA9059AD1E4F838184BD90F21236DE7F8BE56098FB6D0D536DF90C9E8710;
SET @n += @@ROWCOUNT;
-- item 310
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA ICE CREAM

INGREDIENTS: instant whey protein concentrate (MILK), instant whey protein isolate (MILK), vanilla flavouring, thickener: xanthan gum, sodium chloride, sweetener: sucralose, lactase powder.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for SPORTNAHRUNG WHEY DELUXE (VANILLA ICE CREAM)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: AKULLORE VANILJE

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës (QUMËSHT), izolat i çastit i proteinës së hirrës (QUMËSHT), aromë vaniljeje, trashës: gomë ksantani, klorur natriumi, ëmbëlsues: sukralozë, laktazë pluhur.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për SPORTNAHRUNG WHEY DELUXE (AKULLORE VANILJE)'
WHERE Variant_Id IN (1549) AND HASHBYTES('SHA2_256', Ingredients) = 0xC5381413269E49F073731CAF4A2827F861DFF155B82924DB907B4FDE4613EEED;
SET @n += @@ROWCOUNT;
-- item 311
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA

INGREDIENTS: instant whey protein concentrate (MILK), milk protein concentrate (MILK), instant MILK powder, maltodextrin, flavouring, thickener: guar gum, L-leucine, thickener: xanthan gum, salt, natural flavouring, lactase powder, sweetener: sucralose.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for SPORTNAHRUNG EVERYDAY WHEY (NEW) (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: VANILJE

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT), QUMËSHT pluhur i çastit, maltodekstrinë, aromë, trashës: gomë guar, L-leucinë, trashës: gomë ksantani, kripë, aromë natyrale, laktazë pluhur, ëmbëlsues: sukralozë.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për SPORTNAHRUNG EVERYDAY WHEY (NEW) (VANILJE)'
WHERE Variant_Id IN (1550) AND HASHBYTES('SHA2_256', Ingredients) = 0x75CE0FE66F68DA5AA2FD7F9073D44863F33C4ABB6050B68400EBF70AC86E7F2D;
SET @n += @@ROWCOUNT;
-- item 312
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: STRAWBERRY AND WHITE CHOCOLATE

INGREDIENTS: instant whey protein concentrate (MILK), milk protein concentrate (MILK), instant MILK powder, maltodextrin, flavouring, L-leucine, thickeners: guar gum, xanthan gum, colour: beetroot red, natural flavouring, salt, sweetener: sucralose, lactase powder.

Nutrition information for SPORTNAHRUNG EVERYDAY WHEY (NEW) (STRAWBERRY AND WHITE CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LULESHTRYDHE DHE ÇOKOLLATË E BARDHË

PËRBËRËSIT: koncentrat i çastit i proteinës së hirrës (QUMËSHT), koncentrat i proteinës së qumështit (QUMËSHT), QUMËSHT pluhur i çastit, maltodekstrinë, aromë, L-leucinë, trashës: gomë guar, gomë ksantani, ngjyrues: e kuqe panxhari, aromë natyrale, kripë, ëmbëlsues: sukralozë, laktazë pluhur.

Informacione ushqyese për SPORTNAHRUNG EVERYDAY WHEY (NEW) (LULESHTRYDHE DHE ÇOKOLLATË E BARDHË)'
WHERE Variant_Id IN (1551) AND HASHBYTES('SHA2_256', Ingredients) = 0x5A85F3FA51984662F079D23F6ED6A8E5577AB9BB22C38BE916DA1A636796C4DE;
SET @n += @@ROWCOUNT;
-- item 313
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: TROPICAL FLAVOUR

INGREDIENTS: L-citrulline DL-malate 2:1, beta-alanine, creatine monohydrate, L-arginine, acidity regulator: citric acid, L-tyrosine, maltodextrin, orange flavouring (contains colours: tartrazine and Sunset Yellow FCF), lemon flavouring, pineapple flavouring, caffeine anhydrous, sweetener: sucralose, bitter orange extract (Citrus aurantium) with 30% synephrine.

Tartrazine and Sunset Yellow may have an adverse effect on activity and attention in children.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for BATTERY SUPERCHARGED PUMP (TROPICAL FLAVOUR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: SHIJE TROPIKALE

PËRBËRËSIT: L-citrulinë DL-malat 2:1, beta-alaninë, kreatinë monohidrat, L-argininë, rregullues aciditeti: acid citrik, L-tirozinë, maltodekstrinë, aromë portokalli (përmban ngjyrues: tartrazinë dhe Sunset Yellow FCF), aromë limoni, aromë ananasi, kafeinë anhidre, ëmbëlsues: sukralozë, ekstrakt portokalli të hidhur (Citrus aurantium) me 30% sinefrinë.

Tartrazina dhe Sunset Yellow mund të kenë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për BATTERY SUPERCHARGED PUMP (SHIJE TROPIKALE)'
WHERE Variant_Id IN (1552) AND HASHBYTES('SHA2_256', Ingredients) = 0x9AD2CFFAEE86C6424B0759E776A6028C548A52241BB7BCC6B05E71942500645C;
SET @n += @@ROWCOUNT;
-- item 314
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: ORANGE

INGREDIENTS: L-citrulline DL-malate 2:1, beta-alanine, creatine monohydrate, L-arginine, acidity regulator: citric acid, maltodextrin, L-tyrosine, orange flavouring (contains colours: tartrazine and Sunset Yellow FCF), lemon flavouring, sweetener: sucralose.

Tartrazine and Sunset Yellow FCF may have an adverse effect on activity and attention in children.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for BATTERY STIM-FREE PUMP (ORANGE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: PORTOKALL

PËRBËRËSIT: L-citrulinë DL-malat 2:1, beta-alaninë, kreatinë monohidrat, L-argininë, rregullues aciditeti: acid citrik, maltodekstrinë, L-tirozinë, aromë portokalli (përmban ngjyrues: tartrazinë dhe Sunset Yellow FCF), aromë limoni, ëmbëlsues: sukralozë.

Tartrazina dhe Sunset Yellow FCF mund të kenë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për BATTERY STIM-FREE PUMP (PORTOKALL)'
WHERE Variant_Id IN (1553) AND HASHBYTES('SHA2_256', Ingredients) = 0xE094A399D64742604561C06AC4792227E3D2C310B5EA3C158C752374915FC6B7;
SET @n += @@ROWCOUNT;
-- item 315
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: BERRIES

INGREDIENTS: L-citrulline-DL-malate (2:1), beta-alanine, polydextrose, L-arginine HCl (L-arginine hydrochloride), anti-caking agents: silicon dioxide, calcium silicate, potassium bicarbonate, L-theanine from green tea leaf extract (Camellia sinensis (L.) Kuntze), caffeine, flavouring, natural flavouring, sweeteners: acesulfame K, sucralose, vitamin B3 (nicotinamide), trimagnesium citrate, colour: beetroot red (Beta vulgaris), black pepper extract (Piper nigrum), vitamin B6 (pyridoxine HCl), vitamin B12 (cyanocobalamin).

Nutrition information for USN QHUSH PRE-WORKOUT (BERRIES)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: MANAFERRA

PËRBËRËSIT: L-citrulinë-DL-malat (2:1), beta-alaninë, polidekstrozë, L-argininë HCl (L-argininë hidroklorur), agjentë kundër ngjizjes: dioksid silici, silikat kalciumi, bikarbonat kaliumi, L-teaninë nga ekstrakti i gjetheve të çajit jeshil (Camellia sinensis (L.) Kuntze), kafeinë, aromë, aromë natyrale, ëmbëlsues: acesulfam K, sukralozë, vitamina B3 (nikotinamid), citrat trimagnezi, ngjyrues: e kuqe panxhari (Beta vulgaris), ekstrakt piperi të zi (Piper nigrum), vitamina B6 (piridoksinë HCl), vitamina B12 (cianokobalaminë).

Informacione ushqyese për USN QHUSH PRE-WORKOUT (MANAFERRA)'
WHERE Variant_Id IN (1554) AND HASHBYTES('SHA2_256', Ingredients) = 0xB3EA379AC46EE355E8EB9B01C9135A2ED25363E254BB0D9E88A0266E480BA321;
SET @n += @@ROWCOUNT;
-- item 316
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: ICED LEMONADE

INGREDIENTS: L-citrulline-DL-malate (2:1), beta-alanine, polydextrose, L-arginine HCl (L-arginine hydrochloride), anti-caking agents: silicon dioxide, calcium silicate, potassium bicarbonate, L-theanine from green tea leaf extract (Camellia sinensis (L.) Kuntze), caffeine, natural flavouring, flavouring, sweeteners: acesulfame K, sucralose, vitamin B3 (nicotinamide), trimagnesium citrate, colour: beta-carotene, black pepper extract (Piper nigrum), vitamin B6 (pyridoxine HCl), vitamin B12 (cyanocobalamin).

Nutrition information for USN QHUSH PRE-WORKOUT (ICED LEMONADE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LIMONADË E AKULLT

PËRBËRËSIT: L-citrulinë-DL-malat (2:1), beta-alaninë, polidekstrozë, L-argininë HCl (L-argininë hidroklorur), agjentë kundër ngjizjes: dioksid silici, silikat kalciumi, bikarbonat kaliumi, L-teaninë nga ekstrakti i gjetheve të çajit jeshil (Camellia sinensis (L.) Kuntze), kafeinë, aromë natyrale, aromë, ëmbëlsues: acesulfam K, sukralozë, vitamina B3 (nikotinamid), citrat trimagnezi, ngjyrues: beta-karoten, ekstrakt piperi të zi (Piper nigrum), vitamina B6 (piridoksinë HCl), vitamina B12 (cianokobalaminë).

Informacione ushqyese për USN QHUSH PRE-WORKOUT (LIMONADË E AKULLT)'
WHERE Variant_Id IN (1555) AND HASHBYTES('SHA2_256', Ingredients) = 0x976A8EF23DB5ECA62729AE977412BC158A4EB069FF1824DFB1FE43E1859D08F1;
SET @n += @@ROWCOUNT;
-- item 317
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: magnesium bisglycinate anhydrous.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for SPORTNAHRUNG MAGNESIUM BISGLYCINATE (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: bisglicinat magnezi anhidër.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për SPORTNAHRUNG MAGNESIUM BISGLYCINATE (NEW)'
WHERE Variant_Id IN (1564) AND HASHBYTES('SHA2_256', Ingredients) = 0x317588EEAE58808497881D1CA11C13E5AD39B9CCFD15FB4E1D4820A0C297C09B;
SET @n += @@ROWCOUNT;
-- item 318
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: magnesium bisglycinate anhydrous, capsule (bovine gelatine, colour: yellow iron oxide).

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for BATTERY MAGNESIUM BISGLYCINATE (NEW)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: bisglicinat magnezi anhidër, kapsulë (xhelatinë gjedhi, ngjyrues: oksid hekuri i verdhë).

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për BATTERY MAGNESIUM BISGLYCINATE (NEW)'
WHERE Variant_Id IN (1565) AND HASHBYTES('SHA2_256', Ingredients) = 0x16FBF4448757BBB52CD9B774105B34F4FAEC707E1CFFC6D2CBF2EA113FE30BC5;
SET @n += @@ROWCOUNT;
-- item 319
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'INGREDIENTS: Creatine monohydrate.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY.

Nutrition information for BATTERY CREATINE',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'PËRBËRËSIT: Kreatinë monohidrat.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE.

Informacione ushqyese për BATTERY CREATINE'
WHERE Variant_Id IN (1604) AND HASHBYTES('SHA2_256', Ingredients) = 0xB42E08738A76116643BE6EAA84A0FAA5E83AF5145F2225E4921E9C9601DCA90A;
SET @n += @@ROWCOUNT;
-- item 320
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: LEMON

INGREDIENTS: creatine monohydrate, acidity regulator: citric acid, lemon flavouring, sweetener: sucralose, glycine, colour: tartrazine.

Tartrazine may have an adverse effect on activity and attention in children.

Produced in a facility that processes products containing MILK, EGGS, GLUTEN and SOY. May contain GLUTEN.

Nutrition information for PROTEINI.SI 100% PURE CREATINE (FLAVOURED) (LEMON)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: LIMON

PËRBËRËSIT: kreatinë monohidrat, rregullues aciditeti: acid citrik, aromë limoni, ëmbëlsues: sukralozë, glicinë, ngjyrues: tartrazinë.

Tartrazina mund të ketë ndikim negativ në aktivitetin dhe vëmendjen e fëmijëve.

Prodhuar në një objekt ku përpunohen produkte që përmbajnë QUMËSHT, VEZË, GLUTEN dhe SOJE. Mund të përmbajë GLUTEN.

Informacione ushqyese për PROTEINI.SI 100% PURE CREATINE (FLAVOURED) (LIMON)'
WHERE Variant_Id IN (1605) AND HASHBYTES('SHA2_256', Ingredients) = 0x1E59A094E80C630C51CAB83A2EA3F2D2EC101C3FFEEB845D20B25F95C4E78ECF;
SET @n += @@ROWCOUNT;
-- item 321
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: CHOCOLATE CREAM

INGREDIENTS: micellar casein (89%) (MILK), fat-reduced cocoa powder, natural flavouring, thickener (xanthan gum), LactoSpore® (Bacillus coagulans), sweeteners (sucralose, steviol glycosides from stevia), DigeZyme® enzyme complex (amylase, protease, cellulase, lactase, lipase).',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: KREM ÇOKOLLATE

PËRBËRËSIT: kazeinë micelare (89%) (QUMËSHT), kakao pluhur me pak yndyrë, aromë natyrale, trashës (gomë ksantani), LactoSpore® (Bacillus coagulans), ëmbëlsues (sukralozë, glikozide steviolike nga stevia), kompleks enzimatik DigeZyme® (amilazë, proteazë, celulazë, laktazë, lipazë).'
WHERE Variant_Id IN (1623) AND HASHBYTES('SHA2_256', Ingredients) = 0xA01AD3F2CA52F75DBAB41F3FDCBC1A671E45F7F26969CE34A0300875CF0CF161;
SET @n += @@ROWCOUNT;
-- item 322
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'FLAVOUR: VANILLA CREAM

INGREDIENTS: micellar casein (96%) (MILK), natural flavouring, thickener (xanthan gum), LactoSpore® (Bacillus coagulans), sweeteners (sucralose, steviol glycosides from stevia), DigeZyme® enzyme complex (amylase, protease, cellulase, lactase, lipase).',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'SHIJA: KREM VANILJE

PËRBËRËSIT: kazeinë micelare (96%) (QUMËSHT), aromë natyrale, trashës (gomë ksantani), LactoSpore® (Bacillus coagulans), ëmbëlsues (sukralozë, glikozide steviolike nga stevia), kompleks enzimatik DigeZyme® (amilazë, proteazë, celulazë, laktazë, lipazë).'
WHERE Variant_Id IN (1624) AND HASHBYTES('SHA2_256', Ingredients) = 0x877115F088919191B177D9C60C20C6C3C560E55AC86BB9828F0298C05ED6CE24;
SET @n += @@ROWCOUNT;
-- item 323
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Creatine monohydrate.

May contain: EGGS, SOY and MILK.',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Kreatinë monohidrat.

Mund të përmbajë: VEZË, SOJE dhe QUMËSHT.'
WHERE Variant_Id IN (1627) AND HASHBYTES('SHA2_256', Ingredients) = 0xE34310F2BA30DD196A5B724D9BE06BF51455EF3632AB3FAA9253CF547CD75BBE;
SET @n += @@ROWCOUNT;
-- item 324
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

CHOCOLATE

INGREDIENTS: soy protein isolate (SOY), pea protein isolate, brown rice protein, cocoa powder, natural flavouring, thickener (xanthan gum), sweeteners (sucralose, steviol glycosides from stevia).

Nutrition information for APPLIED NUTRITION PLANT PROTEIN (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

ÇOKOLLATË

PËRBËRËSIT: izolat i proteinës së sojes (SOJE), izolat i proteinës së bizeles, proteinë orizi kafe, kakao pluhur, aromë natyrale, trashës (gomë ksantani), ëmbëlsues (sukralozë, glikozide steviolike nga stevia).

Informacione ushqyese për APPLIED NUTRITION PLANT PROTEIN (ÇOKOLLATË)'
WHERE Variant_Id IN (1640) AND HASHBYTES('SHA2_256', Ingredients) = 0xCB973DA94070E390842EC287A61E3E5B45C42F87AE6F9C888753DD5061EA2CC3;
SET @n += @@ROWCOUNT;
-- item 325
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

VANILLA

INGREDIENTS: soy protein isolate (SOY), pea protein isolate, brown rice protein, natural flavouring, thickener (xanthan gum), sweeteners (sucralose, steviol glycosides from stevia).

Nutrition information for APPLIED NUTRITION PLANT PROTEIN (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

VANILJE

PËRBËRËSIT: izolat i proteinës së sojes (SOJE), izolat i proteinës së bizeles, proteinë orizi kafe, aromë natyrale, trashës (gomë ksantani), ëmbëlsues (sukralozë, glikozide steviolike nga stevia).

Informacione ushqyese për APPLIED NUTRITION PLANT PROTEIN (VANILJE)'
WHERE Variant_Id IN (1641) AND HASHBYTES('SHA2_256', Ingredients) = 0xFF90422D5FB02C7BBE3A63DABC20BE3A84DADD778C49AC1D3AB6387A46362DFB;
SET @n += @@ROWCOUNT;
-- item 326
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

KETCHUP

INGREDIENTS: water, tomato purée, modified corn starch, salt, acids (citric acid, acetic acid), onion, preservative: potassium sorbate, chilli, sage, nutmeg, cinnamon, sweetener: sucralose.

Nutrition information for RABEKO ZERO SAUCE KETCHUP (KETCHUP)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

KEÇAP

PËRBËRËSIT: ujë, pure domatesh, niseshte misri e modifikuar, kripë, acide (acid citrik, acid acetik), qepë, konservues: sorbat kaliumi, djegës, sherebelë, arrë muskati, kanellë, ëmbëlsues: sukralozë.

Informacione ushqyese për RABEKO ZERO SAUCE KETCHUP (KEÇAP)'
WHERE Variant_Id IN (1642) AND HASHBYTES('SHA2_256', Ingredients) = 0x4D05E815133BD039AA5AFF5CE468C3FE40BECD0F81246408E00711B03D876290;
SET @n += @@ROWCOUNT;
-- item 327
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

MAYONNAISE

INGREDIENTS: water, modified corn starch, vegetable oil (rapeseed), MUSTARD (water, MUSTARD, vinegar, spices), salt, rice flour, emulsifier: E473, thickeners (guar gum, xanthan gum), vinegar, preservatives (potassium sorbate, sodium benzoate), acid: citric acid, pepper, colour: lutein, sweetener: sucralose.

Nutrition information for RABEKO ZERO SAUCE MAYO (MAYONNAISE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

MAJONEZË

PËRBËRËSIT: ujë, niseshte misri e modifikuar, vaj bimor (ree), MUSTARDË (ujë, MUSTARDË, uthull, erëza), kripë, miell orizi, emulsifikues: E473, trashës (gomë guar, gomë ksantani), uthull, konservues (sorbat kaliumi, benzoat natriumi), acid: acid citrik, piper, ngjyrues: luteinë, ëmbëlsues: sukralozë.

Informacione ushqyese për RABEKO ZERO SAUCE MAYO (MAJONEZË)'
WHERE Variant_Id IN (1643) AND HASHBYTES('SHA2_256', Ingredients) = 0x9D531C0D545DC1EF84FCD026AE0C04A765F5ECD403A38F33A79F1694F6C3B24C;
SET @n += @@ROWCOUNT;
-- item 328
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

BBQ

INGREDIENTS: water, tomato purée, modified corn starch, salt, burnt sugar syrup, onion, acids (acetic acid and citric acid), bell pepper, vinegar, garlic, thickener: guar gum, smoke flavouring, chilli, preservative: potassium sorbate, parsley, sweetener: sucralose.

Nutrition information for RABEKO ZERO SAUCE BBQ (BBQ)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

BBQ

PËRBËRËSIT: ujë, pure domatesh, niseshte misri e modifikuar, kripë, shurup sheqeri të djegur, qepë, acide (acid acetik dhe acid citrik), spec, uthull, hudhër, trashës: gomë guar, aromë tymi, djegës, konservues: sorbat kaliumi, majdanoz, ëmbëlsues: sukralozë.

Informacione ushqyese për RABEKO ZERO SAUCE BBQ (BBQ)'
WHERE Variant_Id IN (1644) AND HASHBYTES('SHA2_256', Ingredients) = 0x8DC8DF4489E46D4F5FF3C2D29890CD3F7519B056FE2B15142912D08D09C35EF9;
SET @n += @@ROWCOUNT;
-- item 329
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

CAESAR

INGREDIENTS: water, rapeseed oil, modified starch, inulin, parmesan (MILK) (1.5%), extract (FISH, MUSTARD), vinegar, salt, MUSTARD, EGG yolk, flavouring, acidity regulators (citric acid, lactic acid), thickener (xanthan gum), colour (beta-carotene), sweetener (sucralose), preservatives (potassium sorbate, sodium benzoate), antioxidant (EDTA), green tea extract, rosemary extract.

Nutrition information for RABEKO ZERO DRESSING CAESAR (CAESAR)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

CEZAR

PËRBËRËSIT: ujë, vaj ree, niseshte e modifikuar, inulinë, parmixhano (QUMËSHT) (1,5%), ekstrakt (PESHK, MUSTARDË), uthull, kripë, MUSTARDË, e verdhë VEZE, aromë, rregullues aciditeti (acid citrik, acid laktik), trashës (gomë ksantani), ngjyrues (beta-karoten), ëmbëlsues (sukralozë), konservues (sorbat kaliumi, benzoat natriumi), antioksidant (EDTA), ekstrakt çaji jeshil, ekstrakt rozmarine.

Informacione ushqyese për RABEKO ZERO DRESSING CAESAR (CEZAR)'
WHERE Variant_Id IN (1645) AND HASHBYTES('SHA2_256', Ingredients) = 0xE506A57F0DF33BE8AEA7A139D1CDC9DF897494D98F226B74C6BA5DD0F0A83B55;
SET @n += @@ROWCOUNT;
-- item 330
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

CHOCOLATE

INGREDIENTS: 96% protein blend (milk protein isolate (MILK) (including micellar casein), ultrafiltered EGG protein, whey protein concentrate (from MILK)), flavourings, medium-chain triglyceride oil (MCT oil), sweeteners – acesulfame K, sucralose; emulsifier – lecithins (from SOY).

Produced in a facility that uses milk, eggs, soy, nuts, peanuts, cereals containing gluten, fish, crustaceans and molluscs.

Nutrition information for OLIMP PROTEIN COMPLEX (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

ÇOKOLLATË

PËRBËRËSIT: 96% përzierje proteinash (izolat i proteinës së qumështit (QUMËSHT) (përfshirë kazeinë micelare), proteinë VEZE e ultrafiltruar, koncentrat i proteinës së hirrës (nga QUMËSHTI)), aroma, vaj nga trigliceride me zinxhir të mesëm (vaj MCT), ëmbëlsues – acesulfam K, sukralozë; emulsifikues – lecitina (nga SOJA).

Prodhuar në një objekt ku përdoren qumësht, vezë, soje, fruta me lëvozhgë, kikirikë, drithëra që përmbajnë gluten, peshk, krustace dhe molusqe.

Informacione ushqyese për OLIMP PROTEIN COMPLEX (ÇOKOLLATË)'
WHERE Variant_Id IN (1647) AND HASHBYTES('SHA2_256', Ingredients) = 0xD9A4D448091BB15528929D382671A474715DAF8F4EAE5F1AA5C3369FF664BF10;
SET @n += @@ROWCOUNT;
-- item 331
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

VANILLA

INGREDIENTS: 96% protein blend (milk protein isolate (MILK) (including micellar casein), ultrafiltered EGG protein, whey protein concentrate (from MILK)), flavourings, medium-chain triglyceride oil (MCT oil), sweeteners – acesulfame K, sucralose; emulsifier – lecithins (from SOY).

Produced in a facility that uses milk, eggs, soy, nuts, peanuts, cereals containing gluten, fish, crustaceans and molluscs.

Nutrition information for OLIMP PROTEIN COMPLEX (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

VANILJE

PËRBËRËSIT: 96% përzierje proteinash (izolat i proteinës së qumështit (QUMËSHT) (përfshirë kazeinë micelare), proteinë VEZE e ultrafiltruar, koncentrat i proteinës së hirrës (nga QUMËSHTI)), aroma, vaj nga trigliceride me zinxhir të mesëm (vaj MCT), ëmbëlsues – acesulfam K, sukralozë; emulsifikues – lecitina (nga SOJA).

Prodhuar në një objekt ku përdoren qumësht, vezë, soje, fruta me lëvozhgë, kikirikë, drithëra që përmbajnë gluten, peshk, krustace dhe molusqe.

Informacione ushqyese për OLIMP PROTEIN COMPLEX (VANILJE)'
WHERE Variant_Id IN (1648) AND HASHBYTES('SHA2_256', Ingredients) = 0x78F70736A304129C097AD775BC2715A5F1E6A0EF25A5FCBACC6B9D89E36E208E;
SET @n += @@ROWCOUNT;
-- item 332
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

CHOCOLATE

INGREDIENTS: 97.5% WHEY protein isolate (from MILK), flavourings, acidity regulators – citric acid, malic acid; thickeners – gum arabic, xanthan gum, sodium carboxymethyl cellulose; sweeteners – acesulfame K, sucralose; salt, vitamins (L-ascorbic acid – vit. C, DL-alpha-tocopheryl acetate – vit. E, nicotinamide – niacin, D-biotin, retinyl acetate – vit. A, calcium D-pantothenate – pantothenic acid, pyridoxine hydrochloride – vit. B6, cholecalciferol – vit. D, pteroylmonoglutamic acid – folate, thiamine mononitrate – vit. B1, riboflavin – vit. B2, cyanocobalamin – vit. B12), emulsifier – lecithins (from SOY), colours: carotenes (A), carmine (B), riboflavins (C), E 150c (D), E 150d (E), E 133 (F). (A) - (F) - The colours used depend on the product flavour and are marked with the letters (A-F); the marking for each flavour is located next '
  + N'to the minimum durability date.

Produced in a facility that processes ingredients from MILK, EGGS, SOY, NUTS, PEANUTS, cereals containing GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP PURE WHEY ISOLATE 95 (CHOCOLATE)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

ÇOKOLLATË

PËRBËRËSIT: 97,5% izolat i proteinës së HIRRËS (nga QUMËSHTI), aroma, rregullues aciditeti – acid citrik, acid malik; trashës – gomë arabike, gomë ksantani, karboksimetil celulozë natriumi; ëmbëlsues – acesulfam K, sukralozë; kripë, vitamina (acid L-askorbik – vit. C, DL-alfa-tokoferil acetat – vit. E, nikotinamid – niacinë, D-biotinë, retinil acetat – vit. A, D-pantotenat kalciumi – acid pantotenik, piridoksinë hidroklorur – vit. B6, kolekalciferol – vit. D, acid pteroilmonoglutamik – folat, tiaminë mononitrat – vit. B1, riboflavinë – vit. B2, cianokobalaminë – vit. B12), emulsifikues – lecitina (nga SOJA), ngjyrues: karotene (A), karminë (B), riboflavina (C), E 150c (D), E 150d (E), E 133 (F). (A) - (F) - Ngjyruesit e përdorur varen nga shija e produktit dhe shënohen me shkronjat (A-F); shënimi për çdo '
  + N'shije gjendet pranë datës së qëndrueshmërisë minimale.

Prodhuar në një objekt ku përpunohen përbërës nga QUMËSHTI, VEZËT, SOJA, FRUTAT ME LËVOZHGË, KIKIRIKËT, drithërat që përmbajnë GLUTEN, PESHKU, KRUSTACET dhe MOLUSQET.

Informacione ushqyese për OLIMP PURE WHEY ISOLATE 95 (ÇOKOLLATË)'
WHERE Variant_Id IN (1649) AND HASHBYTES('SHA2_256', Ingredients) = 0xCF81C0180674864171B0731B27496A95BAC753F83AF9AF7272DB69691A0679EF;
SET @n += @@ROWCOUNT;
-- item 333
UPDATE dbo.ProductVariants SET IngredientsEn =
  CAST(N'' AS nvarchar(max))
  + N'Ingredients

VANILLA

INGREDIENTS: 97.5% WHEY protein isolate (from MILK), flavourings, acidity regulators – citric acid, malic acid; thickeners – gum arabic, xanthan gum, sodium carboxymethyl cellulose; sweeteners – acesulfame K, sucralose; salt, vitamins (L-ascorbic acid – vit. C, DL-alpha-tocopheryl acetate – vit. E, nicotinamide – niacin, D-biotin, retinyl acetate – vit. A, calcium D-pantothenate – pantothenic acid, pyridoxine hydrochloride – vit. B6, cholecalciferol – vit. D, pteroylmonoglutamic acid – folate, thiamine mononitrate – vit. B1, riboflavin – vit. B2, cyanocobalamin – vit. B12), emulsifier – lecithins (from SOY), colours: carotenes (A), carmine (B), riboflavins (C), E 150c (D), E 150d (E), E 133 (F). (A) - (F) - The colours used depend on the product flavour and are marked with the letters (A-F); the marking for each flavour is located next to '
  + N'the minimum durability date.

Produced in a facility that processes ingredients from MILK, EGGS, SOY, NUTS, PEANUTS, cereals containing GLUTEN, FISH, CRUSTACEANS and MOLLUSCS.

Nutrition information for OLIMP PURE WHEY ISOLATE 95 (VANILLA)',
 IngredientsAl =
  CAST(N'' AS nvarchar(max))
  + N'Përbërësit

VANILJE

PËRBËRËSIT: 97,5% izolat i proteinës së HIRRËS (nga QUMËSHTI), aroma, rregullues aciditeti – acid citrik, acid malik; trashës – gomë arabike, gomë ksantani, karboksimetil celulozë natriumi; ëmbëlsues – acesulfam K, sukralozë; kripë, vitamina (acid L-askorbik – vit. C, DL-alfa-tokoferil acetat – vit. E, nikotinamid – niacinë, D-biotinë, retinil acetat – vit. A, D-pantotenat kalciumi – acid pantotenik, piridoksinë hidroklorur – vit. B6, kolekalciferol – vit. D, acid pteroilmonoglutamik – folat, tiaminë mononitrat – vit. B1, riboflavinë – vit. B2, cianokobalaminë – vit. B12), emulsifikues – lecitina (nga SOJA), ngjyrues: karotene (A), karminë (B), riboflavina (C), E 150c (D), E 150d (E), E 133 (F). (A) - (F) - Ngjyruesit e përdorur varen nga shija e produktit dhe shënohen me shkronjat (A-F); shënimi për çdo shije '
  + N'gjendet pranë datës së qëndrueshmërisë minimale.

Prodhuar në një objekt ku përpunohen përbërës nga QUMËSHTI, VEZËT, SOJA, FRUTAT ME LËVOZHGË, KIKIRIKËT, drithërat që përmbajnë GLUTEN, PESHKU, KRUSTACET dhe MOLUSQET.

Informacione ushqyese për OLIMP PURE WHEY ISOLATE 95 (VANILJE)'
WHERE Variant_Id IN (1650) AND HASHBYTES('SHA2_256', Ingredients) = 0xFB22A710A277A9108DAC177265923CAB3216C4045EDEC849D626E4BAE17291C2;
SET @n += @@ROWCOUNT;
PRINT CONCAT('Variants updated: ', @n);
SELECT @r = COUNT(*) FROM dbo.ProductVariants WHERE Ingredients IS NOT NULL AND LTRIM(RTRIM(Ingredients)) <> '' AND (IngredientsEn IS NULL OR IngredientsAl IS NULL);
PRINT CONCAT('Variants with ingredients still untranslated: ', @r);
COMMIT;

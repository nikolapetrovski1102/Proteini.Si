-- Countries (phone dial codes + shipping), delivery cities and their post codes.
-- City/post-code seed: GeoNames postal codes for MK (CC-BY 4.0, download.geonames.org/export/zip/MK.zip).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Country', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Country (
        Country_Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Country PRIMARY KEY,
        Iso2 CHAR(2) NOT NULL CONSTRAINT UX_Country_Iso2 UNIQUE,
        Name_En NVARCHAR(100) NOT NULL,
        Name_Mk NVARCHAR(100) NOT NULL,
        Dial_Code VARCHAR(5) NOT NULL,              -- digits only, e.g. '389'
        Phone_Min_Digits TINYINT NOT NULL,          -- national number without the trunk 0
        Phone_Max_Digits TINYINT NOT NULL,
        Phone_Pattern VARCHAR(100) NULL,            -- optional regex for the national number
        Strip_Leading_Zero BIT NOT NULL CONSTRAINT DF_Country_Strip DEFAULT (1),
        Allow_Phone BIT NOT NULL CONSTRAINT DF_Country_AllowPhone DEFAULT (0),  -- may order with this prefix
        Allow_Shipping BIT NOT NULL CONSTRAINT DF_Country_AllowShipping DEFAULT (0),
        Sort_Order INT NOT NULL CONSTRAINT DF_Country_Sort DEFAULT (100),
        CONSTRAINT CK_Country_PhoneDigits CHECK (Phone_Min_Digits BETWEEN 4 AND 15 AND Phone_Max_Digits BETWEEN Phone_Min_Digits AND 15)
    );
END
GO

MERGE dbo.Country AS t
USING (VALUES
    ('MK', N'North Macedonia', N'Северна Македонија', '389', 8, 8, '^[2-7][0-9]{7}$', 1, 1, 1, 1),
    ('AL', N'Albania',         N'Албанија',           '355', 8, 9, NULL, 1, 1, 0, 10),
    ('RS', N'Serbia',          N'Србија',             '381', 8, 9, NULL, 1, 1, 0, 11),
    ('XK', N'Kosovo',          N'Косово',             '383', 8, 8, NULL, 1, 1, 0, 12),
    ('BG', N'Bulgaria',        N'Бугарија',           '359', 8, 9, NULL, 1, 1, 0, 13),
    ('GR', N'Greece',          N'Грција',             '30',  10, 10, NULL, 1, 1, 0, 14),
    ('ME', N'Montenegro',      N'Црна Гора',          '382', 8, 8, NULL, 1, 1, 0, 15),
    ('HR', N'Croatia',         N'Хрватска',           '385', 8, 9, NULL, 1, 1, 0, 16),
    ('SI', N'Slovenia',        N'Словенија',          '386', 8, 8, NULL, 1, 1, 0, 17),
    ('BA', N'Bosnia and Herzegovina', N'Босна и Херцеговина', '387', 8, 9, NULL, 1, 1, 0, 18),
    ('TR', N'Turkey',          N'Турција',            '90',  10, 10, NULL, 1, 1, 0, 19),
    ('DE', N'Germany',         N'Германија',          '49',  10, 11, NULL, 1, 1, 0, 20),
    ('AT', N'Austria',         N'Австрија',           '43',  10, 13, NULL, 1, 1, 0, 21),
    ('CH', N'Switzerland',     N'Швајцарија',         '41',  9, 9,  NULL, 1, 1, 0, 22),
    ('IT', N'Italy',           N'Италија',            '39',  9, 11, NULL, 0, 1, 0, 23),
    ('SE', N'Sweden',          N'Шведска',            '46',  9, 9,  NULL, 1, 1, 0, 24),
    ('GB', N'United Kingdom',  N'Велика Британија',   '44',  10, 10, NULL, 1, 1, 0, 25),
    ('US', N'United States',   N'САД',                '1',   10, 10, NULL, 0, 1, 0, 26)
) AS s (Iso2, Name_En, Name_Mk, Dial_Code, MinD, MaxD, Pattern, Strip, AllowPhone, AllowShip, SortOrder)
ON t.Iso2 = s.Iso2
WHEN NOT MATCHED THEN
    INSERT (Iso2, Name_En, Name_Mk, Dial_Code, Phone_Min_Digits, Phone_Max_Digits, Phone_Pattern, Strip_Leading_Zero, Allow_Phone, Allow_Shipping, Sort_Order)
    VALUES (s.Iso2, s.Name_En, s.Name_Mk, s.Dial_Code, s.MinD, s.MaxD, s.Pattern, s.Strip, s.AllowPhone, s.AllowShip, s.SortOrder);
GO

IF OBJECT_ID('dbo.City', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.City (
        City_Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_City PRIMARY KEY,
        Country_Id INT NOT NULL CONSTRAINT FK_City_Country REFERENCES dbo.Country (Country_Id),
        Name_Latin NVARCHAR(100) NOT NULL,
        Name_Mk NVARCHAR(100) NULL,
        Is_Town BIT NOT NULL CONSTRAINT DF_City_IsTown DEFAULT (0),
        Deliver BIT NOT NULL CONSTRAINT DF_City_Deliver DEFAULT (1),  -- only Deliver = 1 is offered in forms
        Sort_Order INT NOT NULL CONSTRAINT DF_City_Sort DEFAULT (100),
        CONSTRAINT UX_City_Name UNIQUE (Country_Id, Name_Latin)
    );
END
GO

IF OBJECT_ID('dbo.City_PostCode', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.City_PostCode (
        Post_Code VARCHAR(10) NOT NULL,
        City_Id INT NOT NULL CONSTRAINT FK_CityPostCode_City REFERENCES dbo.City (City_Id) ON DELETE CASCADE,
        Post_Office NVARCHAR(100) NULL,
        CONSTRAINT PK_City_PostCode PRIMARY KEY (City_Id, Post_Code)
    );
    CREATE INDEX IX_City_PostCode_Code ON dbo.City_PostCode (Post_Code) INCLUDE (City_Id);
END
GO

DECLARE @Mk INT = (SELECT Country_Id FROM dbo.Country WHERE Iso2 = 'MK');
DECLARE @Cities TABLE (Name_Latin NVARCHAR(100), Name_Mk NVARCHAR(100), Is_Town BIT, Post_Code VARCHAR(10), Post_Office NVARCHAR(100));
INSERT INTO @Cities (Name_Latin, Name_Mk, Is_Town, Post_Code, Post_Office) VALUES
    (N'Skopje', N'Скопје', 1, '1000', N'Скопје - Центар (Centar)'),
    (N'Skopje', N'Скопје', 1, '1001', N'Скопје - Пошта 2 (Posta 2)'),
    (N'Skopje', N'Скопје', 1, '1010', N'Скопје - Чаир / Бутел (Cair / Butel)'),
    (N'Skopje', N'Скопје', 1, '1014', N'Скопје - Автокоманда (Avtokomanda)'),
    (N'Skopje', N'Скопје', 1, '1020', N'Скопје - Карпош (Karpos)'),
    (N'Skopje', N'Скопје', 1, '1030', N'Скопје - Гази Баба (Gazi Baba)'),
    (N'Skopje', N'Скопје', 1, '1040', N'Скопје - Маџари / Ченто (Madzari / Cento)'),
    (N'Skopje', N'Скопје', 1, '1050', N'Скопје - Драчево (Dracevo)'),
    (N'Skopje', N'Скопје', 1, '1051', N'Скопје - Кисела Вода (Kisela Voda)'),
    (N'Skopje', N'Скопје', 1, '1052', N'Скопје - Аеродром / Ново Лисиче (Aerodrom / Novo Lisice)'),
    (N'Skopje', N'Скопје', 1, '1060', N'Скопје - Ѓорче Петров / Влае (Gjorce Petrov / Vlae)'),
    (N'Skopje', N'Скопје', 1, '1061', N'Скопје - Сарај (Saraj)'),
    (N'Skopje', N'Скопје', 1, '1064', N'Скопје - Кондово (Kondovo)'),
    (N'Skopje', N'Скопје', 1, '1065', N'Скопје - Шуто Оризари (Suto Orizari)'),
    (N'Skopje', N'Скопје', 1, '1066', N'Скопје - Радишани (Radisani)'),
    (N'Skopje', N'Скопје', 1, '1067', N'Скопје - Волково (Volkovo)'),
    (N'Kuceviste', N'Кучевиште', 0, '1011', N'Kuceviste'),
    (N'Ilinden', N'Илинден', 1, '1041', N'Ilinden'),
    (N'Miladinovci', N'Миладиновци', 0, '1042', N'Miladinovci'),
    (N'Petrovec', N'Петровец', 1, '1043', N'Petrovec'),
    (N'Katlanovo', N'Катланово', 0, '1044', N'Katlanovo'),
    (N'Aracinovo', N'Арачиново', 1, '1045', N'Aracinovo'),
    (N'Jurumleri', N'Јурумлери', 0, '1047', N'Jurumleri'),
    (N'Zelenikovo', N'Зелениково', 1, '1053', N'Zelenikovo'),
    (N'Rakotnici', N'Ракотинци', 0, '1054', N'Rakotnici'),
    (N'Radusa', N'Радуша', 0, '1062', N'Radusa'),
    (N'Bukovik', N'Буковиќ', 0, '1063', N'Bukovik'),
    (N'Tetovo', N'Тетово', 1, '1200', N'Tetovo'),
    (N'Mala Recica', N'Мала Речица', 0, '1201', N'Mala Recica'),
    (N'Nerashte', N'Нераште', 0, '1203', N'Nerashte'),
    (N'Jazince', N'Јажинце', 0, '1206', N'Jazince'),
    (N'Dobroste', N'Доброште', 0, '1211', N'Dobroste'),
    (N'Dzepciste', N'Џепчиште', 0, '1212', N'Dzepciste'),
    (N'Zerovjane', N'Жеровјане', 0, '1213', N'Zerovjane'),
    (N'Pirok', N'Пирок', 0, '1214', N'Pirok'),
    (N'Jegunovce', N'Јегуновце', 1, '1215', N'Jegunovce'),
    (N'Brvenica', N'Брвеница', 1, '1216', N'Brvenica'),
    (N'Grupcin', N'Групчин', 0, '1218', N'Grupcin'),
    (N'Golema Recica', N'Голема Речица', 0, '1219', N'Golema Recica'),
    (N'Bogovinje', N'Боговиње', 1, '1220', N'Bogovinje'),
    (N'Kamenjane', N'Камењане', 0, '1221', N'Kamenjane'),
    (N'Tearce', N'Теарце', 1, '1224', N'Tearce'),
    (N'Vratnica', N'Вратница', 0, '1225', N'Vratnica'),
    (N'Zelino', N'Желино', 1, '1226', N'Zelino'),
    (N'Celopek', N'Челопек', 0, '1227', N'Celopek'),
    (N'Shemshevo', N'Шемшево', 0, '1228', N'Shemshevo'),
    (N'Gostivar', N'Гостивар', 1, '1230', N'Gostivar'),
    (N'Vrutok', N'Вруток', 0, '1231', N'Vrutok'),
    (N'Debreshe', N'Дебреше', 0, '1234', N'Debreshe'),
    (N'Negotino-Gostivarsko', N'Неготино-Полошко', 0, '1235', N'Negotino-Gostivarsko'),
    (N'Dobri Dol', N'Добри Дол', 0, '1236', N'Dobri Dol'),
    (N'Cegrane', N'Чегране', 0, '1237', N'Cegrane'),
    (N'Vrapciste', N'Врапчиште', 1, '1238', N'Vrapciste'),
    (N'Srbinovo', N'Србиново', 0, '1239', N'Srbinovo'),
    (N'Debar', N'Дебар', 1, '1250', N'Debar'),
    (N'Rostusa', N'Ростуша', 0, '1254', N'Rostusa'),
    (N'Zirovnica', N'Жировница', 0, '1255', N'Zirovnica'),
    (N'Mavrovi Anovi', N'Маврови Анови', 1, '1256', N'Mavrovi Anovi'),
    (N'Skudrinje', N'Скудриње', 0, '1257', N'Skudrinje'),
    (N'Golem Papradnik', N'Голем Папрадник', 0, '1258', N'Golem Papradnik'),
    (N'Kumanovo', N'Куманово', 1, '1300', N'Kumanovo'),
    (N'Zeglane', N'Жегљане', 0, '1302', N'Zeglane'),
    (N'Staro Negoricane', N'Старо Нагоричане', 1, '1303', N'Staro Negoricane'),
    (N'Klecovce', N'Клечовце', 0, '1304', N'Klecovce'),
    (N'Orasec', N'Орашац', 0, '1305', N'Orasec'),
    (N'Matejce', N'Матејче', 0, '1306', N'Matejce'),
    (N'Lipkovo', N'Липково', 1, '1307', N'Lipkovo'),
    (N'Tabanovce', N'Табановце', 0, '1308', N'Tabanovce'),
    (N'Gradiste', N'Градиште', 0, '1309', N'Gradiste'),
    (N'Mlado Nagoricane', N'Младо Нагоричане', 0, '1312', N'Mlado Nagoricane'),
    (N'Oblavce', N'Облавце', 0, '1314', N'Oblavce'),
    (N'Otlja', N'Отља', 0, '1315', N'Otlja'),
    (N'Rankovce', N'Ранковце', 1, '1316', N'Rankovce'),
    (N'Romanovce', N'Романовце', 0, '1322', N'Romanovce'),
    (N'Pcinja', N'Пчиња', 0, '1323', N'Pcinja'),
    (N'Vaksince', N'Ваксинце', 0, '1324', N'Vaksince'),
    (N'Slupcane', N'Слупчане', 0, '1325', N'Slupcane'),
    (N'Kriva Palanka', N'Крива Паланка', 1, '1330', N'Kriva Palanka'),
    (N'Petralnica', N'Петралица', 0, '1332', N'Petralnica'),
    (N'Mozdivnjak', N'Мождивњак', 0, '1333', N'Mozdivnjak'),
    (N'Dubrovnica', N'Дубровница', 0, '1334', N'Dubrovnica'),
    (N'Zidilovo', N'Жидилово', 0, '1335', N'Zidilovo'),
    (N'Kratovo', N'Кратово', 1, '1360', N'Kratovo'),
    (N'Stracin', N'Страцин', 0, '1361', N'Stracin'),
    (N'Veles', N'Велес', 1, '1400', N'Veles'),
    (N'Basino Selo', N'Башино Село', 0, '1406', N'Basino Selo'),
    (N'Ivankovci', N'Иванковци', 1, '1407', N'Ivankovci'),
    (N'Gorno Orizari', N'Горно Оризари', 0, '1408', N'Gorno Orizari'),
    (N'Caska', N'Чашка', 0, '1413', N'Caska'),
    (N'Izvor (Veles)', N'Извор (Велес)', 0, '1414', N'Izvor'),
    (N'Izvor (Kicevo)', N'Извор (Кичево)', 0, '6256', N'Izvor'),
    (N'Bogomila', N'Богомила', 0, '1415', N'Bogomila'),
    (N'Gradsko', N'Градско', 1, '1420', N'Gradsko'),
    (N'Sirkovo', N'Сирково', 0, '1421', N'Sirkovo'),
    (N'Rosoman', N'Росоман', 1, '1422', N'Rosoman'),
    (N'Drenovo', N'Дреново', 0, '1423', N'Drenovo'),
    (N'Vozarci', N'Возарци', 0, '1424', N'Vozarci'),
    (N'Marena', N'Марена', 0, '1426', N'Marena'),
    (N'Sopot', N'Сопот', 0, '1427', N'Sopot'),
    (N'Kavadarci', N'Кавадарци', 1, '1430', N'Kavadarci'),
    (N'Resava', N'Ресава', 0, '1434', N'Resava'),
    (N'Konopiste', N'Конопиште', 0, '1437', N'Konopiste'),
    (N'Negotino', N'Неготино', 1, '1440', N'Negotino'),
    (N'Pepeliste', N'Пепелиште', 0, '1441', N'Pepeliste'),
    (N'Demir Kapija', N'Демир Капија', 1, '1442', N'Demir Kapija'),
    (N'Dolni Disan', N'Долни Дисан', 0, '1443', N'Dolni Disan'),
    (N'Gevgelija', N'Гевгелија', 1, '1480', N'Gevgelija'),
    (N'Negorci', N'Негорци', 0, '1483', N'Negorci'),
    (N'Bogdanci', N'Богданци', 1, '1484', N'Bogdanci'),
    (N'Nov Dojran', N'Нов Дојран', 1, '1485', N'Nov Dojran'),
    (N'Star Dojran', N'Стар Дојран', 0, '1487', N'Star Dojran'),
    (N'Stojakovo', N'Стојаково', 0, '1488', N'Stojakovo'),
    (N'Miravci', N'Миравци', 0, '1489', N'Miravci'),
    (N'Stip', N'Штип', 1, '2000', N'Stip'),
    (N'Karbinci', N'Карбинци', 1, '2207', N'Karbinci'),
    (N'Lozovo', N'Лозово', 1, '2208', N'Lozovo'),
    (N'Probishtip', N'Пробиштип', 1, '2210', N'Probishtip'),
    (N'Zletovo', N'Злетово', 0, '2212', N'Zletovo'),
    (N'Sveti Nikole', N'Свети Николе', 1, '2220', N'Sveti Nikole'),
    (N'Erdzelija', N'Ерџелија', 0, '2225', N'Erdzelija'),
    (N'Amzabegovo', N'Амзабегово', 0, '2227', N'Amzabegovo'),
    (N'Kocani', N'Кочани', 1, '2300', N'Kocani'),
    (N'Oblesevo', N'Облешево', 0, '2301', N'Oblesevo'),
    (N'Orizari', N'Оризари', 0, '2302', N'Orizari'),
    (N'Makedonska Kamenica', N'Македонска Каменица', 1, '2304', N'Makedonska Kamenica'),
    (N'Zrnovci', N'Зрновци', 0, '2305', N'Zrnovci'),
    (N'Gorni Podlog', N'Горни Подлог', 0, '2307', N'Gorni Podlog'),
    (N'Vinica', N'Виница', 1, '2310', N'Vinica'),
    (N'Istibanja', N'Истибања', 0, '2312', N'Istibanja'),
    (N'Blatec', N'Блатец', 0, '2314', N'Blatec'),
    (N'Rusinovo', N'Русиново', 0, '2315', N'Rusinovo'),
    (N'Dragobraste', N'Драгобраште', 0, '2316', N'Dragobraste'),
    (N'Delcevo', N'Делчево', 1, '2320', N'Delcevo'),
    (N'Trabotiviste', N'Тработивиште', 0, '2325', N'Trabotiviste'),
    (N'Pehcevo', N'Пехчево', 1, '2326', N'Pehcevo'),
    (N'Berovo', N'Берово', 1, '2330', N'Berovo'),
    (N'Vladimirovo', N'Владимирово', 0, '2331', N'Vladimirovo'),
    (N'Budinarci', N'Будинарци', 0, '2332', N'Budinarci'),
    (N'Cesinovo', N'Чешиново', 0, '2333', N'Cesinovo'),
    (N'Strumica', N'Струмица', 1, '2400', N'Strumica'),
    (N'Kuklis', N'Куклиш', 0, '2410', N'Kuklis'),
    (N'Vasilevo', N'Василево', 1, '2411', N'Vasilevo'),
    (N'Vladevci / Radicevo sobiraliste', N'Владевци / Радичево', 0, '2412', N'Vladevci / Radicevo sobiraliste'),
    (N'Kosturino', N'Костурино', 0, '2413', N'Kosturino'),
    (N'Veljusa', N'Вељуса', 0, '2414', N'Veljusa'),
    (N'Dobrasinci', N'Добрашинци', 0, '2416', N'Dobrasinci'),
    (N'Radovis', N'Радовиш', 1, '2420', N'Radovis'),
    (N'Podares', N'Подареш', 0, '2423', N'Podares'),
    (N'Konce', N'Конче', 1, '2424', N'Konce'),
    (N'Petralinci', N'Петралинци', 0, '2430', N'Petralinci'),
    (N'Bosilovo', N'Босилово', 1, '2431', N'Bosilovo'),
    (N'Murtino', N'Муртино', 0, '2432', N'Murtino'),
    (N'Turnovo', N'Турново', 0, '2433', N'Turnovo'),
    (N'Novo Selo', N'Ново Село', 1, '2434', N'Novo Selo'),
    (N'Mokrievo', N'Мокриево', 0, '2435', N'Mokrievo'),
    (N'Dracevo', N'Драчево (Струмичко)', 0, '2436', N'Dracevo'),
    (N'Valandovo', N'Валандово', 1, '2460', N'Valandovo'),
    (N'Calakli', N'Чалакли', 0, '2461', N'Calakli'),
    (N'Udovo', N'Удово', 0, '2464', N'Udovo'),
    (N'Ohrid', N'Охрид', 1, '6000', N'Ohrid'),
    (N'Ohrid', N'Охрид', 1, '6322', N'Ohrid'),
    (N'Malo Crsko', N'Мало Црско', 0, '6245', N'Malo Crsko'),
    (N'Kicevo', N'Кичево', 1, '6250', N'Kicevo'),
    (N'Zajas', N'Зајас', 1, '6253', N'Zajas'),
    (N'Oslomej', N'Осломеј', 1, '6254', N'Oslomej'),
    (N'Brzdani', N'Брждани', 0, '6255', N'Brzdani'),
    (N'Dlapkin Dol', N'Длапкин Дол', 0, '6257', N'Dlapkin Dol'),
    (N'Vranestica', N'Вранештица', 0, '6258', N'Vranestica'),
    (N'Celopeci', N'Челопеци', 0, '6259', N'Celopeci'),
    (N'Rastanski Pat', N'Раштански Пат', 0, '6260', N'Rastanski Pat'),
    (N'Drugovo', N'Другово', 1, '6261', N'Drugovo'),
    (N'Strelci', N'Стрелци', 0, '6262', N'Strelci'),
    (N'Leskovec', N'Лесковец', 0, '6306', N'Leskovec'),
    (N'Struga', N'Струга', 1, '6330', N'Struga'),
    (N'Radolista', N'Радолишта', 0, '6333', N'Radolista'),
    (N'Velesta', N'Велешта', 0, '6334', N'Velesta'),
    (N'Vevcani', N'Вевчани', 1, '6335', N'Vevcani'),
    (N'Labunista', N'Лабуништа', 0, '6336', N'Labunista'),
    (N'Lukovo', N'Луково', 0, '6337', N'Lukovo'),
    (N'Delgozda', N'Делогожда', 0, '6338', N'Delgozda'),
    (N'Oktisi', N'Октиси', 0, '6339', N'Oktisi'),
    (N'Trebenista', N'Требеништа', 0, '6341', N'Trebenista'),
    (N'Meseista', N'Мешеишта', 0, '6342', N'Meseista'),
    (N'Belcista', N'Белчишта', 1, '6344', N'Belcista'),
    (N'Slivovo', N'Сливово', 0, '6346', N'Slivovo'),
    (N'Makedonski Brod', N'Македонски Брод', 1, '6530', N'Makedonski Brod'),
    (N'Dolni Manastirec', N'Долни Манастирец', 0, '6533', N'Dolni Manastirec'),
    (N'Samokov', N'Самоков', 0, '6535', N'Samokov'),
    (N'Dvorci', N'Дворци', 0, '6539', N'Dvorci'),
    (N'Bitola', N'Битола', 1, '7000', N'Bitola'),
    (N'Smilevo', N'Смилево', 0, '7202', N'Smilevo'),
    (N'Dolno Orizari', N'Долно Оризари', 0, '7204', N'Dolno Orizari'),
    (N'Dihovo', N'Дихово', 0, '7205', N'Dihovo'),
    (N'Novaci', N'Новаци', 1, '7211', N'Novaci'),
    (N'Dedebalci', N'Дедебалци', 0, '7212', N'Dedebalci'),
    (N'Makovo', N'Маково', 0, '7213', N'Makovo'),
    (N'Staravina', N'Старавина', 0, '7214', N'Staravina'),
    (N'Dobrusevo', N'Добрушево', 0, '7215', N'Dobrusevo'),
    (N'Mogila', N'Могила', 1, '7216', N'Mogila'),
    (N'Bistrica', N'Бистрица', 0, '7221', N'Bistrica'),
    (N'Porodin', N'Породин', 0, '7223', N'Porodin'),
    (N'Keremenica', N'Кременица', 0, '7224', N'Keremenica'),
    (N'Bac', N'Бач', 0, '7225', N'Bac'),
    (N'Demir Hisar', N'Демир Хисар', 1, '7240', N'Demir Hisar'),
    (N'Kukurecani', N'Кукуречани', 0, '7241', N'Kukurecani'),
    (N'Lopatica', N'Лопатица', 0, '7242', N'Lopatica'),
    (N'Zvan', N'Жван', 0, '7244', N'Zvan'),
    (N'Ivanjevci', N'Ивањевци', 0, '7245', N'Ivanjevci'),
    (N'Resen', N'Ресен', 1, '7310', N'Resen'),
    (N'Capari', N'Цапари', 0, '7313', N'Capari'),
    (N'Kazani', N'Кажани', 0, '7314', N'Kazani'),
    (N'Carev Dvor', N'Царев Двор', 0, '7315', N'Carev Dvor'),
    (N'Asamati', N'Асамати', 0, '7316', N'Asamati'),
    (N'Krani', N'Крани', 0, '7317', N'Krani'),
    (N'Ljubojno', N'Љубојно', 0, '7318', N'Ljubojno'),
    (N'Otesevo', N'Отешево', 0, '7319', N'Otesevo'),
    (N'Jankovec', N'Јанковец', 0, '7320', N'Jankovec'),
    (N'Prilep', N'Прилеп', 1, '7500', N'Prilep'),
    (N'Dolneni', N'Долнени', 1, '7504', N'Dolneni'),
    (N'Kostinci', N'Костинци', 0, '7505', N'Kostinci'),
    (N'Dunje', N'Дуње', 0, '7506', N'Dunje'),
    (N'Lazani', N'Лажани', 0, '7507', N'Lazani'),
    (N'Vitoliste', N'Витолиште', 0, '7508', N'Vitoliste'),
    (N'Golemo Konjari', N'Големо Коњари', 0, '7509', N'Golemo Konjari'),
    (N'Topolcani', N'Тополчани', 0, '7512', N'Topolcani'),
    (N'Kanatlarci', N'Канатларци', 0, '7514', N'Kanatlarci'),
    (N'Krivogastani', N'Кривогаштани', 1, '7524', N'Krivogastani'),
    (N'Vodani', N'Воѓани', 0, '7525', N'Vodani'),
    (N'Debreste', N'Дебреште', 0, '7537', N'Debreste'),
    (N'Krusevo', N'Крушево', 1, '7550', N'Krusevo');

INSERT dbo.City (Country_Id, Name_Latin, Name_Mk, Is_Town, Sort_Order)
SELECT @Mk, c.Name_Latin, MAX(c.Name_Mk), MAX(CAST(c.Is_Town AS INT)), CASE WHEN c.Name_Latin = N'Skopje' THEN 0 WHEN MAX(CAST(c.Is_Town AS INT)) = 1 THEN 10 ELSE 100 END
FROM @Cities c
WHERE NOT EXISTS (SELECT 1 FROM dbo.City x WHERE x.Country_Id = @Mk AND x.Name_Latin = c.Name_Latin)
GROUP BY c.Name_Latin;

UPDATE ci
SET ci.Name_Mk = src.Name_Mk
FROM dbo.City ci
JOIN (SELECT Name_Latin, MAX(Name_Mk) AS Name_Mk FROM @Cities GROUP BY Name_Latin) src
    ON ci.Country_Id = @Mk AND ci.Name_Latin = src.Name_Latin
WHERE ci.Name_Mk IS NULL OR ci.Name_Mk <> src.Name_Mk;

INSERT dbo.City_PostCode (Post_Code, City_Id, Post_Office)
SELECT c.Post_Code, ci.City_Id, c.Post_Office
FROM @Cities c
JOIN dbo.City ci ON ci.Country_Id = @Mk AND ci.Name_Latin = c.Name_Latin
WHERE NOT EXISTS (SELECT 1 FROM dbo.City_PostCode p WHERE p.City_Id = ci.City_Id AND p.Post_Code = c.Post_Code);
GO

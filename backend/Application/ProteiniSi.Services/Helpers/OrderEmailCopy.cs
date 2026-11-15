namespace ProteiniSi.Services.Helpers;

/// <summary>Customer-facing text of the order emails (confirmation, status updates, cancellation) in Macedonian and Albanian.</summary>
public sealed record OrderEmailCopy
{
    public required string Language { get; init; }
    public required string Location { get; init; }
    public required string AutomatedFooter { get; init; }
    public required string ContactNote { get; init; }

    // ---- order confirmation ----
    public required string PaidTitle { get; init; }
    public required string PaidLabel { get; init; }
    /// <summary>{0} = order number.</summary>
    public required string PaidDescription { get; init; }
    public required string PaidSubject { get; init; }
    public required string CodTitle { get; init; }
    public required string CodLabel { get; init; }
    public required string CodDescription { get; init; }
    public required string CodSubject { get; init; }
    public required string PaidOnline { get; init; }
    public required string CashOnDelivery { get; init; }
    /// <summary>{0} = customer name.</summary>
    public required string Greeting { get; init; }
    /// <summary>{0} = title, {1} = order number.</summary>
    public required string ConfirmationPreheader { get; init; }

    public required string SectionOrder { get; init; }
    public required string SectionBuyer { get; init; }
    public required string SectionDelivery { get; init; }
    public required string OrderNumber { get; init; }
    public required string OrderDate { get; init; }
    public required string Payment { get; init; }
    public required string Name { get; init; }
    public required string Phone { get; init; }
    public required string Email { get; init; }
    public required string Address { get; init; }
    public required string City { get; init; }

    public required string ItemsOrdered { get; init; }
    public required string ColSku { get; init; }
    public required string ColProduct { get; init; }
    public required string ColQty { get; init; }
    public required string ColPrice { get; init; }
    public required string ColTotal { get; init; }

    public required string Subtotal { get; init; }
    public required string Delivery { get; init; }
    public required string DeliveredBy { get; init; }
    public required string Promotion { get; init; }
    public required string GiftVoucher { get; init; }
    public required string PointsDiscount { get; init; }
    public required string Rounding { get; init; }
    public required string FreeGift { get; init; }
    public required string Total { get; init; }

    public required string VoucherCodesTitle { get; init; }
    public required string VoucherNoExpiry { get; init; }
    /// <summary>{0} = date.</summary>
    public required string VoucherExpires { get; init; }
    public required string VoucherKeepPrivate { get; init; }
    public required string VoucherSentSeparately { get; init; }

    public required string YourNote { get; init; }
    public required string ViewOrder { get; init; }
    public required string ThankYou { get; init; }

    public required string CourierTitle { get; init; }
    /// <summary>{0} = threshold, {1} = fixed fee, {2} = percentage.</summary>
    public required string CourierText { get; init; }
    /// <summary>{0} = commission for this order.</summary>
    public required string CourierThisOrder { get; init; }

    // ---- status updates ----
    /// <summary>{0} = customer name.</summary>
    public required string Dear { get; init; }
    public required string DefaultCustomerName { get; init; }
    public required IReadOnlyDictionary<string, string> StatusTitles { get; init; }
    public required string StatusTitleFallback { get; init; }
    public required IReadOnlyDictionary<string, string> StatusLabels { get; init; }
    public required IReadOnlyDictionary<string, string> PaymentLabels { get; init; }
    public required IReadOnlyDictionary<string, string> StatusMessages { get; init; }
    public required string StatusMessageFallback { get; init; }
    public required string OrderStatus { get; init; }
    public required string PaymentStatus { get; init; }
    public required string TrackingNumber { get; init; }
    public required string TrackShipment { get; init; }

    // ---- cancellation ----
    public required string CancelledTitle { get; init; }
    public required string CancelledLabel { get; init; }
    /// <summary>{0} = name, {1} = order number (HTML).</summary>
    public required string CancelledIntro { get; init; }
    /// <summary>{0} = points (HTML).</summary>
    public required string PointsRefunded { get; init; }
    public required string NotRequested { get; init; }
    public required string SeeYouSoon { get; init; }
    public required string ContinueShopping { get; init; }
    /// <summary>{0} = order number.</summary>
    public required string CancelledSubject { get; init; }

    public static OrderEmailCopy For(string? language) =>
        EmailLanguage.IsAlbanian(language) ? Albanian : Macedonian;

    private const string Contact = "<a href='mailto:info@proteini.mk' style='color:#141409; font-weight:700;'>info@proteini.mk</a>";

    public static readonly OrderEmailCopy Macedonian = new()
    {
        Language = EmailLanguage.Macedonian,
        Location = "Proteini.si · Скопје, Македонија",
        AutomatedFooter = "Ова е автоматска порака за вашата нарачка.",
        ContactNote = $"Доколку имате прашања, контактирајте не на {Contact} или на +389 71 399 036.",

        PaidTitle = "Плаќањето е потврдено",
        PaidLabel = "Платено онлајн",
        PaidDescription = "Вашето плаќање за нарачката #{0} е прифатено. Ги подготвуваме производите и ќе ве известиме кога нарачката ќе продолжи понатаму.",
        PaidSubject = "Плаќањето е потврдено - #{0} | Proteini.mk",
        CodTitle = "Нарачката е примена",
        CodLabel = "Плаќање при достава",
        CodDescription = "Вашата нарачка е примена и наскоро ќе биде подготвена. Плаќањето се врши при достава, кога ELS - Eko Logistic Service MK ќе ви ја донесе пратката.",
        CodSubject = "Нарачката е примена - #{0} | Proteini.mk",
        PaidOnline = "Платено онлајн",
        CashOnDelivery = "Плаќање при достава",
        Greeting = "Здраво {0},",
        ConfirmationPreheader = "{0} · нарачка #{1}",

        SectionOrder = "Нарачка",
        SectionBuyer = "Купувач",
        SectionDelivery = "Достава",
        OrderNumber = "Број на нарачка",
        OrderDate = "Датум",
        Payment = "Плаќање",
        Name = "Име",
        Phone = "Телефон",
        Email = "Е-пошта",
        Address = "Адреса",
        City = "Град",

        ItemsOrdered = "Нарачани производи",
        ColSku = "Шифра",
        ColProduct = "Производ",
        ColQty = "Кол.",
        ColPrice = "Цена",
        ColTotal = "Вкупно",

        Subtotal = "Меѓузбир",
        Delivery = "Достава",
        DeliveredBy = "Доставува ELS - Eko Logistic Service MK",
        Promotion = "Промоција",
        GiftVoucher = "Ваучер за подарок",
        PointsDiscount = "Попуст со поени",
        Rounding = "Заокружување",
        FreeGift = "Бесплатен подарок",
        Total = "Вкупно",

        VoucherCodesTitle = "Вашите кодови за ваучер за подарок",
        VoucherNoExpiry = "Без рок на важење",
        VoucherExpires = "Важи до {0}",
        VoucherKeepPrivate = "Чувајте ги кодовите за себе. Може да се користат делумно, сè додека не се потроши целиот износ.",
        VoucherSentSeparately = "Кодот на ваучерот ви го испративме во посебна порака (и на примачот на подарокот, ако внесовте).",

        YourNote = "Ваша забелешка",
        ViewOrder = "Погледни ја нарачката",
        ThankYou = "Ви благодариме што избравте Proteini.si. Вашата нарачка ќе ја подготвиме со најголемо внимание.",

        CourierTitle = "Провизија на курирот за откупнина",
        CourierText = "Курирската служба наплаќа провизија за откупнина, која ја плаќа купувачот директно на курирот: до {0}: {1}, над {0}: {2}% од износот (важи и за готовинско и за картично плаќање кај курирот).",
        CourierThisOrder = "За оваа нарачка: {0}, дополнително на вкупниот износ погоре.",

        Dear = "Почитувани {0},",
        DefaultCustomerName = "купувачу",
        StatusTitles = new Dictionary<string, string>
        {
            ["confirmed"] = "Нарачката е потврдена",
            ["shipped"] = "Нарачката е испратена",
            ["delivered"] = "Нарачката е доставена",
            ["rejected"] = "Нарачката е одбиена",
            ["cancelled"] = "Нарачката е откажана"
        },
        StatusTitleFallback = "Статус на нарачка",
        StatusLabels = new Dictionary<string, string>
        {
            ["pending"] = "Во чекање",
            ["confirmed"] = "Потврдена",
            ["processing"] = "Во обработка",
            ["shipped"] = "Испратена",
            ["delivered"] = "Доставена",
            ["rejected"] = "Одбиена",
            ["cancelled"] = "Откажана",
            ["refunded"] = "Вратени средства"
        },
        PaymentLabels = new Dictionary<string, string>
        {
            ["paid"] = "Платено",
            ["completed"] = "Платено",
            ["pending"] = "Во чекање",
            ["unpaid"] = "Неплатено",
            ["failed"] = "Неуспешно",
            ["refunded"] = "Вратено"
        },
        StatusMessages = new Dictionary<string, string>
        {
            ["confirmed"] = "Вашата нарачка е потврдена и наскоро ќе биде подготвена за испорака.",
            ["processing"] = "Вашата нарачка е во обработка.",
            ["shipped"] = "Вашата нарачка е испратена и е на пат кон вас.",
            ["delivered"] = "Вашата нарачка е доставена. Ви благодариме што купувате кај нас и уживајте во производите!",
            ["rejected"] = "За жал, вашата нарачка е одбиена. Доколку веќе сте платиле, износот ќе ви биде вратен.",
            ["cancelled"] = "Вашата нарачка е откажана.",
            ["refunded"] = "Повратот за вашата нарачка е означен како обработен."
        },
        StatusMessageFallback = "Статусот на вашата нарачка е ажуриран.",
        OrderStatus = "Статус на нарачка",
        PaymentStatus = "Статус на плаќање",
        TrackingNumber = "Број за следење",
        TrackShipment = "Следи ја пратката",

        CancelledTitle = "Нарачката е откажана",
        CancelledLabel = "Откажана",
        CancelledIntro = "Почитувани {0}, вашата нарачка <strong>#{1}</strong> е успешно откажана.",
        PointsRefunded = "Вашите <strong>{0}</strong> поени за лојалност се вратени на вашата сметка.",
        NotRequested = $"Доколку не сте го побарале ова откажување, веднаш контактирајте не на {Contact}.",
        SeeYouSoon = "Се надеваме дека наскоро повторно ќе се видиме!<br>Вашиот тим на Proteini.si",
        ContinueShopping = "Продолжи со купување",
        CancelledSubject = "Нарачката е откажана - #{0} | Proteini.mk"
    };

    public static readonly OrderEmailCopy Albanian = new()
    {
        Language = EmailLanguage.Albanian,
        Location = "Proteini.si · Shkup, Maqedoni",
        AutomatedFooter = "Ky është një mesazh automatik për porosinë tuaj.",
        ContactNote = $"Nëse keni pyetje, na kontaktoni në {Contact} ose në +389 71 399 036.",

        PaidTitle = "Pagesa u konfirmua",
        PaidLabel = "Paguar online",
        PaidDescription = "Pagesa juaj për porosinë #{0} u pranua. Po i përgatisim produktet dhe do t'ju njoftojmë kur porosia të vazhdojë më tej.",
        PaidSubject = "Pagesa u konfirmua - #{0} | Proteini.mk",
        CodTitle = "Porosia u pranua",
        CodLabel = "Pagesë në dorëzim",
        CodDescription = "Porosia juaj u pranua dhe së shpejti do të përgatitet. Pagesa bëhet në dorëzim, kur ELS - Eko Logistic Service MK t'jua sjellë pakon.",
        CodSubject = "Porosia u pranua - #{0} | Proteini.mk",
        PaidOnline = "Paguar online",
        CashOnDelivery = "Pagesë në dorëzim",
        Greeting = "Përshëndetje {0},",
        ConfirmationPreheader = "{0} · porosia #{1}",

        SectionOrder = "Porosia",
        SectionBuyer = "Blerësi",
        SectionDelivery = "Dorëzimi",
        OrderNumber = "Numri i porosisë",
        OrderDate = "Data",
        Payment = "Pagesa",
        Name = "Emri",
        Phone = "Telefoni",
        Email = "Email",
        Address = "Adresa",
        City = "Qyteti",

        ItemsOrdered = "Produktet e porositura",
        ColSku = "Kodi",
        ColProduct = "Produkti",
        ColQty = "Sasia",
        ColPrice = "Çmimi",
        ColTotal = "Gjithsej",

        Subtotal = "Nëntotali",
        Delivery = "Dorëzimi",
        DeliveredBy = "Dorëzon ELS - Eko Logistic Service MK",
        Promotion = "Promocioni",
        GiftVoucher = "Kuponi dhuratë",
        PointsDiscount = "Zbritje me pikë",
        Rounding = "Rrumbullakim",
        FreeGift = "Dhuratë falas",
        Total = "Gjithsej",

        VoucherCodesTitle = "Kodet e kuponit tuaj dhuratë",
        VoucherNoExpiry = "Pa afat skadimi",
        VoucherExpires = "Vlen deri më {0}",
        VoucherKeepPrivate = "Mbajini kodet vetëm për vete. Mund të përdoren pjesërisht, derisa të harxhohet e gjithë shuma.",
        VoucherSentSeparately = "Kodin e kuponit jua dërguam në një mesazh të veçantë (edhe marrësit të dhuratës, nëse e shënuat).",

        YourNote = "Shënimi juaj",
        ViewOrder = "Shiko porosinë",
        ThankYou = "Faleminderit që zgjodhët Proteini.si. Porosinë tuaj do ta përgatisim me kujdesin më të madh.",

        CourierTitle = "Provizioni i korrierit për pagesën në dorëzim",
        CourierText = "Shërbimi korrier ngarkon një provizion për mbledhjen e pagesës, të cilin blerësi e paguan drejtpërdrejt te korrieri: deri në {0}: {1}, mbi {0}: {2}% e shumës (vlen si për pagesë me para në dorë ashtu edhe me kartelë te korrieri).",
        CourierThisOrder = "Për këtë porosi: {0}, shtesë mbi shumën totale më lart.",

        Dear = "I/E nderuar {0},",
        DefaultCustomerName = "blerës",
        StatusTitles = new Dictionary<string, string>
        {
            ["confirmed"] = "Porosia u konfirmua",
            ["shipped"] = "Porosia u dërgua",
            ["delivered"] = "Porosia u dorëzua",
            ["rejected"] = "Porosia u refuzua",
            ["cancelled"] = "Porosia u anulua"
        },
        StatusTitleFallback = "Statusi i porosisë",
        StatusLabels = new Dictionary<string, string>
        {
            ["pending"] = "Në pritje",
            ["confirmed"] = "E konfirmuar",
            ["processing"] = "Në përpunim",
            ["shipped"] = "E dërguar",
            ["delivered"] = "E dorëzuar",
            ["rejected"] = "E refuzuar",
            ["cancelled"] = "E anuluar",
            ["refunded"] = "Mjetet u kthyen"
        },
        PaymentLabels = new Dictionary<string, string>
        {
            ["paid"] = "Paguar",
            ["completed"] = "Paguar",
            ["pending"] = "Në pritje",
            ["unpaid"] = "E papaguar",
            ["failed"] = "E pasuksesshme",
            ["refunded"] = "E kthyer"
        },
        StatusMessages = new Dictionary<string, string>
        {
            ["confirmed"] = "Porosia juaj u konfirmua dhe së shpejti do të përgatitet për dërgim.",
            ["processing"] = "Porosia juaj është në përpunim.",
            ["shipped"] = "Porosia juaj u dërgua dhe është në rrugë drejt jush.",
            ["delivered"] = "Porosia juaj u dorëzua. Faleminderit që blini te ne dhe shijojini produktet!",
            ["rejected"] = "Fatkeqësisht, porosia juaj u refuzua. Nëse keni paguar tashmë, shuma do t'ju kthehet.",
            ["cancelled"] = "Porosia juaj u anulua.",
            ["refunded"] = "Kthimi i mjeteve për porosinë tuaj është shënuar si i përfunduar."
        },
        StatusMessageFallback = "Statusi i porosisë suaj u përditësua.",
        OrderStatus = "Statusi i porosisë",
        PaymentStatus = "Statusi i pagesës",
        TrackingNumber = "Numri i gjurmimit",
        TrackShipment = "Gjurmo dërgesën",

        CancelledTitle = "Porosia u anulua",
        CancelledLabel = "E anuluar",
        CancelledIntro = "I/E nderuar {0}, porosia juaj <strong>#{1}</strong> u anulua me sukses.",
        PointsRefunded = "<strong>{0}</strong> pikët tuaja të besnikërisë u kthyen në llogarinë tuaj.",
        NotRequested = $"Nëse nuk e keni kërkuar këtë anulim, na kontaktoni menjëherë në {Contact}.",
        SeeYouSoon = "Shpresojmë t'ju shohim përsëri së shpejti!<br>Ekipi juaj i Proteini.si",
        ContinueShopping = "Vazhdo blerjen",
        CancelledSubject = "Porosia u anulua - #{0} | Proteini.mk"
    };
}

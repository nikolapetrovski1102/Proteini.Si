namespace ProteiniSi.Services.Helpers;

/// <summary>Text of the two gift voucher emails (buyer + gift recipient) in Macedonian and Albanian.</summary>
public sealed record GiftVoucherEmailCopy
{
    public required string Badge { get; init; }
    /// <summary>{0} = name.</summary>
    public required string Greeting { get; init; }
    public required string DefaultName { get; init; }
    public required string Footer { get; init; }

    // ---- buyer ----
    /// <summary>{0} = order number.</summary>
    public required string BuyerSubject { get; init; }
    public required string BuyerTitle { get; init; }
    public required string BuyerPreheader { get; init; }
    public required string BuyerIntroSelf { get; init; }
    /// <summary>{0} = recipient (name or email).</summary>
    public required string BuyerIntroGift { get; init; }
    public required string SentTo { get; init; }
    public required string ShopButton { get; init; }

    // ---- gift recipient ----
    /// <summary>{0} = buyer name.</summary>
    public required string GiftSubject { get; init; }
    public required string GiftTitle { get; init; }
    /// <summary>{0} = buyer name.</summary>
    public required string GiftPreheader { get; init; }
    /// <summary>{0} = buyer name, {1} = total value.</summary>
    public required string GiftIntro { get; init; }
    /// <summary>{0} = buyer name.</summary>
    public required string MessageFrom { get; init; }
    public required string GiftButton { get; init; }
    public required string SomeoneSpecial { get; init; }

    // ---- shared ----
    public required string CodeTitle { get; init; }
    public required string Value { get; init; }
    public required string HowTitle { get; init; }
    public required string HowOnline { get; init; }
    public required string HowPartial { get; init; }
    public required string KeepPrivate { get; init; }

    public static GiftVoucherEmailCopy For(string? language) =>
        EmailLanguage.IsAlbanian(language) ? Albanian : Macedonian;

    public static readonly GiftVoucherEmailCopy Macedonian = new()
    {
        Badge = "Ваучер за подарок",
        Greeting = "Здраво {0},",
        DefaultName = "купувач",
        Footer = "Ова е автоматска порака од Proteini.mk.",

        BuyerSubject = "Вашиот ваучер за подарок - #{0} | Proteini.mk",
        BuyerTitle = "Ваучерот е подготвен",
        BuyerPreheader = "Кодот на вашиот ваучер за подарок е во оваа порака.",
        BuyerIntroSelf = "Ви благодариме за купувањето. Подолу е кодот на вашиот ваучер.",
        BuyerIntroGift = "Ви благодариме за купувањето. Ваучерот го испративме на {0} во посебна порака. Кодот е и подолу, ако сакате да го предадете лично.",
        SentTo = "Испратено до",
        ShopButton = "Пазарувај сега",

        GiftSubject = "{0} ви подари ваучер за Proteini.mk",
        GiftTitle = "Имате подарок",
        GiftPreheader = "{0} ви подари ваучер за подарок. Кодот е во оваа порака.",
        GiftIntro = "{0} ви подари ваучер за Proteini.mk во вредност од {1}.",
        MessageFrom = "Порака од {0}",
        GiftButton = "Искористи го ваучерот",
        SomeoneSpecial = "Некој посебен",

        CodeTitle = "Вашиот код",
        Value = "Вредност",
        HowTitle = "Како се користи",
        HowOnline = "Кодот може да се искористи само онлајн на proteini.mk: при плаќање внесете го во полето „Подарок ваучер“.",
        HowPartial = "Износот може да се троши во повеќе наврати, сè додека не се искористи целиот.",
        KeepPrivate = "Кодот вреди како готовина, чувајте го за себе."
    };

    public static readonly GiftVoucherEmailCopy Albanian = new()
    {
        Badge = "Kupon dhuratë",
        Greeting = "Përshëndetje {0},",
        DefaultName = "blerës",
        Footer = "Ky është një mesazh automatik nga Proteini.mk.",

        BuyerSubject = "Kuponi juaj dhuratë - #{0} | Proteini.mk",
        BuyerTitle = "Kuponi është gati",
        BuyerPreheader = "Kodi i kuponit tuaj dhuratë është në këtë mesazh.",
        BuyerIntroSelf = "Faleminderit për blerjen. Më poshtë është kodi i kuponit tuaj.",
        BuyerIntroGift = "Faleminderit për blerjen. Kuponin ia dërguam {0} në një mesazh të veçantë. Kodi është edhe më poshtë, nëse dëshironi ta jepni personalisht.",
        SentTo = "Dërguar te",
        ShopButton = "Bli tani",

        GiftSubject = "{0} ju dhuroi një kupon për Proteini.mk",
        GiftTitle = "Keni një dhuratë",
        GiftPreheader = "{0} ju dhuroi një kupon dhuratë. Kodi është në këtë mesazh.",
        GiftIntro = "{0} ju dhuroi një kupon për Proteini.mk në vlerë prej {1}.",
        MessageFrom = "Mesazh nga {0}",
        GiftButton = "Përdore kuponin",
        SomeoneSpecial = "Dikush i veçantë",

        CodeTitle = "Kodi juaj",
        Value = "Vlera",
        HowTitle = "Si përdoret",
        HowOnline = "Kodi mund të përdoret vetëm online në proteini.mk: gjatë pagesës shkruajeni në fushën „Kupon dhuratë“.",
        HowPartial = "Shuma mund të shpenzohet në disa herë, derisa të harxhohet e gjitha.",
        KeepPrivate = "Kodi vlen si para në dorë, mbajeni vetëm për vete."
    };
}

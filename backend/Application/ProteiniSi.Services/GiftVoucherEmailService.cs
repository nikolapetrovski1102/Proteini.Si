using System.Text;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;
using static ProteiniSi.Services.Helpers.EmailLayout;

namespace ProteiniSi.Services;

/// <summary>
/// After a gift voucher order is paid: the buyer gets their codes (and who they were sent to), and the gift recipient,
/// when the buyer named someone else, gets a separate gift email with the code and the buyer's message.
/// </summary>
public class GiftVoucherEmailService(
    IOrderProvider orderProvider,
    IEmailSender emailSender,
    ILogger<GiftVoucherEmailService> logger) : IGiftVoucherEmailService
{
    public async Task SendForOrderAsync(int orderId)
    {
        List<IssuedVoucher> vouchers;
        try
        {
            vouchers = await orderProvider.GetIssuedVouchersAsync(orderId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not load the gift vouchers of order {OrderId}", orderId);
            return;
        }
        if (vouchers.Count == 0) return;

        var first = vouchers[0];
        var copy = GiftVoucherEmailCopy.For(first.Language);
        var orderCopy = OrderEmailCopy.For(first.Language);
        var buyerName = string.IsNullOrWhiteSpace(first.PurchaserName) ? copy.DefaultName : first.PurchaserName.Trim();

        // All vouchers of one order go to the same recipient (set once at checkout).
        var recipientEmail = first.RecipientEmail?.Trim();
        var isGift = !string.IsNullOrWhiteSpace(recipientEmail)
            && !string.Equals(recipientEmail, first.PurchaserEmail?.Trim(), StringComparison.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(first.PurchaserEmail))
        {
            try
            {
                var recipientLabel = string.IsNullOrWhiteSpace(first.RecipientName)
                    ? recipientEmail!
                    : $"{first.RecipientName!.Trim()} ({recipientEmail})";
                var subject = string.Format(copy.BuyerSubject, first.Order_Number);
                var intro = isGift ? string.Format(copy.BuyerIntroGift, recipientLabel) : copy.BuyerIntroSelf;
                var rows =
                    Hero(copy.BuyerTitle, copy.Badge, Tone.Yellow,
                        Encode(string.Format(copy.Greeting, buyerName)), Encode(intro)) +
                    Row(Callout(CodesHtml(vouchers, copy, orderCopy))) +
                    (isGift ? Row(Panel(Field(copy.SentTo, Encode(recipientLabel), last: !HasMessage(first)) +
                        (HasMessage(first) ? Field(string.Format(copy.MessageFrom, buyerName), MessageHtml(first.GiftMessage!), last: true) : ""))) : "") +
                    Row(HowToHtml(copy)) +
                    Row(Button(SiteUrl, copy.ShopButton) + Note(orderCopy.ContactNote, "20px 0 0 0"), "4px 36px 34px 36px");

                var body = Page(subject, copy.BuyerPreheader, rows, copy.Footer, orderCopy.Location, language: orderCopy.Language);
                var result = await emailSender.SendDetailedAsync([first.PurchaserEmail.Trim()], [], subject, body);
                Log(result.Success, "buyer", first.PurchaserEmail, orderId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Gift voucher buyer email failed for order {OrderId}", orderId);
            }
        }

        if (!isGift) return;

        try
        {
            var recipientName = string.IsNullOrWhiteSpace(first.RecipientName) ? null : first.RecipientName.Trim();
            var total = vouchers.Sum(v => v.InitialValue);
            var subject = string.Format(copy.GiftSubject, buyerName);
            var rows =
                Hero(copy.GiftTitle, copy.Badge, Tone.Yellow,
                    Encode(string.Format(copy.Greeting, recipientName ?? copy.SomeoneSpecial)),
                    Encode(string.Format(copy.GiftIntro, buyerName, PriceFormat.Mkd(total)))) +
                (HasMessage(first)
                    ? Row(Panel(Field(string.Format(copy.MessageFrom, buyerName), MessageHtml(first.GiftMessage!), last: true)))
                    : "") +
                Row(Callout(CodesHtml(vouchers, copy, orderCopy))) +
                Row(HowToHtml(copy)) +
                Row(Button(SiteUrl, copy.GiftButton) + Note(orderCopy.ContactNote, "20px 0 0 0"), "4px 36px 34px 36px");

            var body = Page(subject, string.Format(copy.GiftPreheader, buyerName), rows, copy.Footer, orderCopy.Location, language: orderCopy.Language);
            var result = await emailSender.SendDetailedAsync([recipientEmail!], [], subject, body);
            Log(result.Success, "recipient", recipientEmail, orderId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Gift voucher recipient email failed for order {OrderId}", orderId);
        }
    }

    private static bool HasMessage(IssuedVoucher voucher) => !string.IsNullOrWhiteSpace(voucher.GiftMessage);

    private static string MessageHtml(string message) =>
        $"<span style='font-weight:400; font-style:italic; color:{Body}; white-space:pre-line;'>“{Encode(message.Trim())}”</span>";

    private static string CodesHtml(IEnumerable<IssuedVoucher> vouchers, GiftVoucherEmailCopy copy, OrderEmailCopy orderCopy)
    {
        var sb = new StringBuilder(SectionTitle(copy.CodeTitle));
        foreach (var voucher in vouchers)
        {
            var expiry = voucher.ExpiresAt == null
                ? orderCopy.VoucherNoExpiry
                : string.Format(orderCopy.VoucherExpires, $"{voucher.ExpiresAt:dd.MM.yyyy}");
            sb.Append("<p style='margin:12px 0 0 0;'>")
              .Append($"<span style='display:inline-block; padding:10px 16px; background:{Ink}; color:{Yellow}; border-radius:8px; font-family:\"Courier New\", Courier, monospace; font-size:20px; line-height:24px; font-weight:700; letter-spacing:2px; word-break:break-all;'>{Encode(voucher.Code)}</span>")
              .Append($"</p><p style='margin:6px 0 0 0; font-size:14px; line-height:20px; color:{Ink};'>{Encode(copy.Value)}: <strong>{PriceFormat.Mkd(voucher.InitialValue)}</strong>")
              .Append($" &nbsp;·&nbsp; <span style='color:{Muted}; font-size:12px;'>{Encode(expiry)}</span></p>");
        }
        sb.Append(Note(Encode(copy.KeepPrivate), "14px 0 0 0"));
        return sb.ToString();
    }

    private static string HowToHtml(GiftVoucherEmailCopy copy) =>
        SectionTitle(copy.HowTitle) +
        $"<p style='margin:0 0 8px 0; font-size:14px; line-height:22px; color:{Body};'>{Encode(copy.HowOnline)}</p>" +
        $"<p style='margin:0; font-size:14px; line-height:22px; color:{Body};'>{Encode(copy.HowPartial)}</p>";

    private void Log(bool sent, string who, string? email, int orderId)
    {
        if (sent)
            logger.LogInformation("Gift voucher {Who} email sent to {Email} for order {OrderId}", who, EmailMask.Mask(email ?? ""), orderId);
        else
            logger.LogWarning("Gift voucher {Who} email failed for {Email}, order {OrderId}", who, EmailMask.Mask(email ?? ""), orderId);
    }
}

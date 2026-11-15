using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

/**
 * Automatic discounts (no code). Saving only stores the rule; usp_Discount_Sync then writes the discounted
 * prices into the products' sale fields, so every page and the checkout use them as normal sale prices.
 */
public class DiscountService(IDiscountProvider provider) : IDiscountService
{
    private static readonly string[] Scopes = ["products", "brands", "categories"];

    public Task<List<Discount>> GetAllAsync() => provider.GetAllAsync();

    public Task<List<DiscountItemOption>> GetItemOptionsAsync() => provider.GetItemOptionsAsync();

    public async Task<int> CreateAsync(DiscountWriteDto discount)
    {
        var id = await SaveAsync(null, discount);
        await provider.SyncAsync();
        return id;
    }

    public async Task UpdateAsync(int id, DiscountWriteDto discount)
    {
        await SaveAsync(id, discount);
        await provider.SyncAsync();
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeleteAsync(id))
            throw NotFound();
        await provider.SyncAsync();
    }

    public Task<int> SyncAsync() => provider.SyncAsync();

    private async Task<int> SaveAsync(int? id, DiscountWriteDto discount)
    {
        var name = discount.Name?.Trim() ?? "";
        if (name.Length == 0)
            throw ErrorBody("Внесете име на попустот.");
        if (name.Length > 150)
            throw ErrorBody("Името може да има најмногу 150 знаци.");

        var appliesTo = (discount.AppliesTo ?? "").Trim().ToLowerInvariant();
        if (!Scopes.Contains(appliesTo))
            throw ErrorBody("Изберете производи, брендови или категории.");

        var type = (discount.Type ?? "percent").Trim().ToLowerInvariant();
        if (type is not ("percent" or "price"))
            throw ErrorBody("Изберете процент попуст или нова цена.");
        if (type == "price" && appliesTo != "products")
            throw ErrorBody("Нова цена може да се постави само на избрани производи.");

        decimal? percentage = null;
        if (type == "percent")
        {
            percentage = Math.Round(discount.Percentage ?? 0, 2);
            if (percentage <= 0 || percentage >= 100)
                throw ErrorBody("Попустот мора да е поголем од 0% и помал од 100%.");
        }

        List<int> targets = [];
        List<DiscountItem> items = [];
        if (appliesTo == "products")
        {
            items = (discount.Items ?? [])
                .Where(i => i.ProductId > 0 && i.VariantId >= 0)
                .GroupBy(i => (i.ProductId, i.VariantId))
                .Select(g => new DiscountItem
                {
                    Product_Id = g.Key.ProductId,
                    Variant_Id = g.Key.VariantId,
                    // Whole denars, rounded up like every other sale price.
                    New_Price = type == "price" && g.Last().NewPrice is { } price ? Math.Ceiling(price) : null
                })
                .ToList();
            if (items.Count == 0)
                throw ErrorBody("Изберете барем еден производ.");

            if (type == "price")
            {
                if (items.Any(i => i.New_Price is not > 0))
                    throw ErrorBody("Внесете нова цена за секоја избрана ставка.");

                var prices = (await provider.GetItemOptionsAsync())
                    .ToDictionary(o => (o.Product_Id, o.Variant_Id), o => o.Price);
                foreach (var item in items)
                    if (prices.TryGetValue((item.Product_Id, item.Variant_Id), out var normal) && normal is > 0 && item.New_Price >= normal)
                        throw ErrorBody($"Секоја нова цена мора да е пониска од редовната ({normal:0} MKD).");
            }
        }
        else
        {
            targets = (discount.TargetIds ?? []).Where(t => t > 0).Distinct().ToList();
            if (targets.Count == 0)
                throw ErrorBody(appliesTo == "brands" ? "Изберете барем еден бренд." : "Изберете барем една категорија.");
        }

        var startsOn = discount.StartsOn?.Date;
        var endsOn = discount.EndsOn?.Date;
        if (startsOn != null && endsOn != null && startsOn > endsOn)
            throw ErrorBody("Крајниот датум мора да е ист или по почетниот.");

        return await provider.SaveAsync(new DiscountSave(id, name, type, percentage, appliesTo, startsOn, endsOn, discount.IsActive, targets, items))
            ?? throw NotFound();
    }

    private static NotFoundException NotFound() => new("Попустот не е пронајден.", new { error = "Попустот не е пронајден." });

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}

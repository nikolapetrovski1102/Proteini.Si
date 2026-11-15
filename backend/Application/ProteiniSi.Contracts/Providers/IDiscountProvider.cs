using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IDiscountProvider
{
    Task<List<Discount>> GetAllAsync();

    /** Every variant (and product without variants) a product discount can pick, with its normal price. */
    Task<List<DiscountItemOption>> GetItemOptionsAsync();

    /** Returns the discount id, or null when @id was not found. Items only for "products", targets only for brands/categories. */
    Task<int?> SaveAsync(DiscountSave discount);

    Task<bool> DeleteAsync(int id);

    /** Writes running discounts into the sale prices and restores ended ones. Returns how many products are discounted. */
    Task<int> SyncAsync();
}

/** A validated discount ready to store. */
public sealed record DiscountSave(
    int? Id,
    string Name,
    string Type,
    decimal? Percentage,
    string AppliesTo,
    DateTime? StartsOn,
    DateTime? EndsOn,
    bool IsActive,
    IReadOnlyList<int> TargetIds,
    IReadOnlyList<DiscountItem> Items);

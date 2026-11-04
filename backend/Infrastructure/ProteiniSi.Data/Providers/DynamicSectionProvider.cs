using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class DynamicSectionProvider(ISqlHelper sql) : IDynamicSectionProvider
{
    public Task<List<DynamicSection>> GetActiveByPageAsync(string pageType) =>
        sql.QueryAsync<DynamicSection>(StoredProcedures.DynamicContent.GetActiveByPage, new { PageType = pageType });

    public Task<List<DynamicSection>> GetAllByPageAsync(string pageType) =>
        sql.QueryAsync<DynamicSection>(StoredProcedures.DynamicContent.GetAllByPage, new { PageType = pageType });

    public Task<DynamicSection?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<DynamicSection>(StoredProcedures.DynamicContent.GetById, new { Id = id });

    public async Task<int> CreateAsync(CreateDynamicSectionDto section, string createdBy) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.DynamicContent.Create, new
        {
            section.Page_Type,
            section.Section_Type,
            Title_Text = section.Title_Text ?? "",
            Content_Text = section.Content_Text ?? "",
            section.Display_Order,
            section.IsActive,
            section.IsBold,
            section.IsItalic,
            section.IsUnderline,
            Text_Align = section.Text_Align ?? "left",
            section.Font_Size,
            section.Text_Color,
            section.Margin_Top,
            section.Margin_Bottom,
            section.Padding_Top,
            section.Padding_Bottom,
            section.Custom_CSS_Class,
            Created_By = createdBy
        });

    public async Task<bool> UpdateAsync(UpdateDynamicSectionDto section, string updatedBy) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.DynamicContent.Update, new
        {
            section.Section_Id,
            section.Section_Type,
            Title_Text = section.Title_Text ?? "",
            Content_Text = section.Content_Text ?? "",
            section.Display_Order,
            section.IsActive,
            section.IsBold,
            section.IsItalic,
            section.IsUnderline,
            Text_Align = section.Text_Align ?? "left",
            section.Font_Size,
            section.Text_Color,
            section.Margin_Top,
            section.Margin_Bottom,
            section.Padding_Top,
            section.Padding_Bottom,
            section.Custom_CSS_Class,
            Updated_By = updatedBy
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.DynamicContent.Delete, new { Id = id }) > 0;

    public Task ReorderAsync(IEnumerable<SectionOrderDto> sections) =>
        sql.ExecuteAsync(StoredProcedures.DynamicContent.Reorder, new
        {
            Items = TableParameters.IdOrderList(sections.Select(section => (section.Section_Id, section.Display_Order)))
        });
}

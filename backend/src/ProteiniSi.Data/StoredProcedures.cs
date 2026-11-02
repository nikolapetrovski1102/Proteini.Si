namespace ProteiniSi.Data;

public static class StoredProcedures
{
    public static class BranchLocations
    {
        public const string GetActive = "dbo.usp_BranchLocation_GetActive";
        public const string GetAll = "dbo.usp_BranchLocation_GetAll";
        public const string Create = "dbo.usp_BranchLocation_Create";
        public const string Update = "dbo.usp_BranchLocation_Update";
        public const string Delete = "dbo.usp_BranchLocation_Delete";
    }

    public static class TipArticles
    {
        public const string GetActive = "dbo.usp_TipArticle_GetActive";
        public const string GetAll = "dbo.usp_TipArticle_GetAll";
        public const string GetById = "dbo.usp_TipArticle_GetById";
        public const string GetActiveBySlug = "dbo.usp_TipArticle_GetActiveBySlug";
        public const string SlugExists = "dbo.usp_TipArticle_SlugExists";
        public const string Create = "dbo.usp_TipArticle_Create";
        public const string Update = "dbo.usp_TipArticle_Update";
        public const string Delete = "dbo.usp_TipArticle_Delete";
    }

    public static class HomepageCards
    {
        public const string GetActive = "dbo.usp_HomepageCard_GetActive";
        public const string GetAll = "dbo.usp_HomepageCard_GetAll";
        public const string GetById = "dbo.usp_HomepageCard_GetById";
        public const string SlugExists = "dbo.usp_HomepageCard_SlugExists";
        public const string Create = "dbo.usp_HomepageCard_Create";
        public const string Update = "dbo.usp_HomepageCard_Update";
        public const string Delete = "dbo.usp_HomepageCard_Delete";
    }
}

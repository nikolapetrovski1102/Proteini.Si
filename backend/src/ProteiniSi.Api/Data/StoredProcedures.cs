namespace ProteiniSi.Api.Data;

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
}

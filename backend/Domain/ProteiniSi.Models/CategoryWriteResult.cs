namespace ProteiniSi.Models;

public enum CategoryWriteResult
{
    Success = 0,
    ParentMissing = 1,
    SlugEmpty = 2,
    SlugTaken = 3,
    NotFound = 4,
    WouldCreateCycle = 5
}

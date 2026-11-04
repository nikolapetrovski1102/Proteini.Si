namespace ProteiniSi.Models;

public record PagedResult<T>(List<T> Items, int TotalCount);

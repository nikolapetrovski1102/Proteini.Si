namespace ProteiniSi.Api.Exceptions;

public abstract class AppException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class BadRequestException(string message) : AppException(StatusCodes.Status400BadRequest, message);

public class NotFoundException(string message) : AppException(StatusCodes.Status404NotFound, message);

public class ConflictException(string message) : AppException(StatusCodes.Status409Conflict, message);

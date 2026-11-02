using System.Net;

namespace ProteiniSi.Contracts.Exceptions;

public abstract class AppException(HttpStatusCode statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = (int)statusCode;
}

public class BadRequestException(string message) : AppException(HttpStatusCode.BadRequest, message);

public class NotFoundException(string message) : AppException(HttpStatusCode.NotFound, message);

public class ConflictException(string message) : AppException(HttpStatusCode.Conflict, message);

public class UnauthorizedException(string message) : AppException(HttpStatusCode.Unauthorized, message);

public class ForbiddenException(string message) : AppException(HttpStatusCode.Forbidden, message);

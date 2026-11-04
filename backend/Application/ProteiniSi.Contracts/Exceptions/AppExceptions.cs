using System.Net;

namespace ProteiniSi.Contracts.Exceptions;

public abstract class AppException(HttpStatusCode statusCode, string message, object? body = null) : Exception(message)
{
    public int StatusCode { get; } = (int)statusCode;

    public object? Body { get; } = body;
}

public class BadRequestException(string message, object? body = null) : AppException(HttpStatusCode.BadRequest, message, body);

public class NotFoundException(string message, object? body = null) : AppException(HttpStatusCode.NotFound, message, body);

public class ConflictException(string message, object? body = null) : AppException(HttpStatusCode.Conflict, message, body);

public class UnauthorizedException(string message, object? body = null) : AppException(HttpStatusCode.Unauthorized, message, body);

public class ForbiddenException(string message, object? body = null) : AppException(HttpStatusCode.Forbidden, message, body);

public class ServerErrorException(string message, object? body = null) : AppException(HttpStatusCode.InternalServerError, message, body);

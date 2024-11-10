class ErrorResponse {
  int statusCode;
  String error;
  String message;

  ErrorResponse(
      {
        required this.statusCode,
        required this.error,
        required this.message});

  factory ErrorResponse.fromJson(Map<String, dynamic> json) {
    return ErrorResponse(
        statusCode: json['statusCode'],
        error: json['error'],
        message: json['message']);
  }
}

class BadRequestException implements Exception {
  final String message;
  BadRequestException(this.message);

  @override
  String toString() => "BadRequestException: $message";
}

class ServerException implements Exception {
  final String message;
  ServerException(this.message);

  @override
  String toString() => "ServerException: $message";
}
class NotFoundException implements Exception {
  final String message;
  NotFoundException(this.message);

  @override
  String toString() => "NotFoundException: $message";
}

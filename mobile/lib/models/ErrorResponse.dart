class ErrorResponse
{
  int statusCode;
  String error;
  String message;

  ErrorResponse({
    required this.statusCode,
    required this.error,
    required this.message
});
  factory ErrorResponse.fromJson(Map<String, dynamic> json){
    return ErrorResponse(
        statusCode: json['statusCode'],
        error: json['error'],
        message: json['message']
    );
  }
}
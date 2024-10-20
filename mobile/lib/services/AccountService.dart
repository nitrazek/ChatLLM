import 'dart:convert';
import 'dart:io';

import 'package:mobile/states/AccountState.dart';

import '../models/Account.dart';
import '../models/ErrorResponse.dart';
import 'ChatService.dart';

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

class AccountService {
  final String baseUrl = "http://10.0.2.2:3000";
  final httpClient = HttpClient();


  Future<bool> register(String name, String email, String password) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/users/register");
      final request = await httpClient.postUrl(uri);

      request.headers.set(HttpHeaders.contentTypeHeader, "application/json");

      request.add(utf8.encode(jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      })));

      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();

      switch (response.statusCode) {
        case 201:
          return true;
        case 400:
          final errorResponse = ErrorResponse.fromJson(jsonDecode(responseBody));
          throw BadRequestException(errorResponse.message);
        case 500:
          final errorResponse = ErrorResponse.fromJson(jsonDecode(responseBody));
          throw ServerException(errorResponse.message);
        default:
          throw ServerException('Błąd serwera: ${response.statusCode}');
      }
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException('Błąd sieci: ${e.message}');
      } else {
        rethrow;
      }
    }
  }

  Future<String> login(String nameOrEmail, String password) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/users/login");
      final request = await httpClient.postUrl(uri);

      request.headers.set(HttpHeaders.contentTypeHeader, "application/json");

      request.add(utf8.encode(jsonEncode({
        'nameOrEmail': nameOrEmail,
        'password': password,
      })));

      final response = await request.close();


      switch (response.statusCode) {
        case 200:
          final responseBody = await response.transform(utf8.decoder).join();
          Map<String, dynamic> json = jsonDecode(responseBody);
          String token = json['token'];
          AccountState.token = token;
          return token;
        case 400:
          final responseBody = await response.transform(utf8.decoder).join();
          final errorResponse = ErrorResponse.fromJson(jsonDecode(responseBody));
          throw BadRequestException(errorResponse.message);
        case 500:
          final responseBody = await response.transform(utf8.decoder).join();
          final errorResponse = ErrorResponse.fromJson(jsonDecode(responseBody));
          throw ServerException(errorResponse.message);
        default:
          throw ServerException('Błąd serwera: ${response.statusCode}');
      }
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException('Błąd sieci: ${e.message}');
      } else {
        rethrow;
      }
    }
  }
}

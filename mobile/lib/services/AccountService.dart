import 'dart:convert';
import 'dart:io';

import '../models/Account.dart';
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

  Future<Account> activateAccount(int loggedUserId) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/users/$loggedUserId/activate");
      final request = await httpClient.postUrl(uri);

      request.headers.set(HttpHeaders.contentTypeHeader, "application/json");

      request.add(utf8.encode(jsonEncode({
        'loggedUserId': loggedUserId,
      })));
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        Map<String, dynamic> json = jsonDecode(responseBody);
        return Account.fromJson(json);
      }
      throw HttpException('Failed to activate user with status code: ${response.statusCode}');
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException(e.message);
      } else {
        rethrow;
      }
    }
    }

  Future<Account> register(String name, String email, String password) async {
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

      switch (response.statusCode) {
        case 201:
          final responseBody = await response.transform(utf8.decoder).join();
          Map<String, dynamic> json = jsonDecode(responseBody);
          return Account.fromJson(json);
        case 400:
          throw BadRequestException('Dane są już zajęte.');
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

  Future<Account> login(String name, String password) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/users/login");
      final request = await httpClient.postUrl(uri);

      request.headers.set(HttpHeaders.contentTypeHeader, "application/json");

      request.add(utf8.encode(jsonEncode({
        'name': name,
        'password': password,
      })));

      final response = await request.close();

      switch (response.statusCode) {
        case 200:
          final responseBody = await response.transform(utf8.decoder).join();
          Map<String, dynamic> json = jsonDecode(responseBody);
          return Account.fromJson(json);
        case 400:
          final responseBody = await response.transform(utf8.decoder).join();
          throw BadRequestException('Nieprawidłowe dane logowania.');
        case 403:
          throw NotFoundException('Konto nie zostało aktywowane. Poczekaj na aktywacje');
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

import 'dart:convert';
import 'dart:io';

import '../models/Account.dart';
import 'ChatService.dart';

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

      if (response.statusCode == 201) {
        final responseBody = await response.transform(utf8.decoder).join();
        Map<String, dynamic> json = jsonDecode(responseBody);
        return Account.fromJson(json);
      }

      throw HttpException('Failed to register user with status code: ${response.statusCode}');
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException(e.message);
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

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        Map<String, dynamic> json = jsonDecode(responseBody);
        return Account.fromJson(json);
      } else {
        final responseBody = await response.transform(utf8.decoder).join();
        print("Error response: $responseBody");
        throw HttpException('Failed to log in user with status code: ${response.statusCode}');
      }
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException(e.message);
      } else {
        rethrow;
      }
    }
  }
}

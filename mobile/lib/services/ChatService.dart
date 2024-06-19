import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ChatService {
  final String baseUrl = "http://10.0.2.2:3000";

  Future<String> postQuestion(String question) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/api/v1/model/questions"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({'question': question}),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return responseData['answer'];
      } else {
        throw Exception('Failed to load answer');
      }
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException('No Internet Connection');
      } else {
        rethrow;
      }
    }
  }
}

class FetchDataException implements Exception {
  final String message;
  FetchDataException(this.message);
}
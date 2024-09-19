import 'dart:convert';
import 'dart:io';

import '../models/Chat.dart';

class ChatService {
  final String baseUrl = "http://10.0.2.2:3000";

  Stream<String> postQuestion(String question) async* {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/chats/1");
      final httpClient = HttpClient();
      final request = await httpClient.postUrl(uri);

      request.headers.set('Content-Type', 'application/json');
      request.add(utf8.encode(jsonEncode({'question': question})));

      final response = await request.close();

      if (response.statusCode == 200) {
        await for (var chunk in response.transform(utf8.decoder)) {
          final answers = _parseConcatenatedJson(chunk);
          for (final answer in answers) {
            yield _formatText(answer);
          }
        }
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

  List<String> _parseConcatenatedJson(String responseBody) {
    final List<String> answers = [];
    final regex = RegExp(r'\{"answer":"(.*?)"\}');
    final matches = regex.allMatches(responseBody);

    for (final match in matches) {
      final answer = match.group(1);
      if (answer != null) {
        answers.add(answer);
      }
    }

    return answers;
  }

  String _formatText(String text) {
    return text.replaceAll(r'\n', '\n').replaceAll(r'\t', '    ');
  }

  Future<Chat> createChat(String name, bool isUsingOnlyKnowledgeBase, int userId) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/chats/new/$userId");
      final httpClient = HttpClient();
      final request = await httpClient.postUrl(uri);

      request.headers.set('Content-Type', 'application/json');
      request.add(utf8.encode(jsonEncode({
        'name': name,
        'isUsingOnlyKnowledgeBase' : isUsingOnlyKnowledgeBase})));

      final response = await request.close();

      if(response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        Map<String, dynamic> json = jsonDecode(responseBody);
        return Chat.fromJson(json);
      }
      else {
        throw Exception('Nie udało się utworzyć czatu: ${response.statusCode}');
      }
    }
    catch(e) {
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

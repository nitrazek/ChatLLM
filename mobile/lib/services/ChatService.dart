import 'dart:convert';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:mobile/states/ChatState.dart';
import 'package:mobile/viewModels/MainChatViewModel.dart';
import 'package:provider/provider.dart';

import '../models/Chat.dart';
import '../models/ErrorResponse.dart';
import '../states/AccountState.dart';
import 'AccountService.dart';

class ChatService {
  final String baseUrl = "http://10.0.2.2:3000";
  final HttpClient _httpClient = HttpClient();
  bool _isRequestCancelled = false;
  String? token = AccountState.token;

  void cancelAnswer() {
    _isRequestCancelled = true;
  }


  Stream<String> postQuestion(String question) async* {
    try {
      int? currentChatId = ChatState.currentChat?.id;
      final uri = Uri.parse("$baseUrl/api/v1/chats/$currentChatId");
      final httpClient = HttpClient();
      final request = await httpClient.postUrl(uri);

      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Authorization', 'Bearer $token');
      request.add(utf8.encode(jsonEncode({'question': question})));

      final response = await request.close();

      if (response.statusCode == 200) {
        await for (var chunk in response.transform(utf8.decoder)) {
          if(_isRequestCancelled) {
            _isRequestCancelled = false;
            break;
          }
          final answers = _parseConcatenatedJson(chunk);
          for (final answer in answers) {
            yield _formatText(answer);
          }
        }
      } else {
        throw Exception('$response');
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

    final answerRegex = RegExp(r'"answer":"(.*?)"');
    Iterable<Match> matches = answerRegex.allMatches(responseBody);

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

  Future<Chat> createChat(String? name, bool isUsingOnlyKnowledgeBase) async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/chats/new");
      final httpClient = HttpClient();
      final request = await httpClient.postUrl(uri);

      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Authorization', 'Bearer $token');


      if(name != "") {
        request.add(utf8.encode(jsonEncode({
          'name': name,
          'isUsingOnlyKnowledgeBase': isUsingOnlyKnowledgeBase
        })));
      }
      else
        {
          request.add(utf8.encode(jsonEncode({
            'isUsingOnlyKnowledgeBase': isUsingOnlyKnowledgeBase
          })));
        }

      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        Map<String, dynamic> json = jsonDecode(responseBody);
        ChatState.currentChat = Chat.fromJson(json);
        return Chat.fromJson(json);
      } else {
        throw Exception('Nie udało się utworzyć czatu: ${response.statusCode}');
      }
    } catch (e) {
      if (e is SocketException) {
        throw FetchDataException('No Internet Connection');
      } else {
        rethrow;
      }
    }
  }


  Future<List<Chat>> getChatList() async {
    try {
      final uri = Uri.parse("$baseUrl/api/v1/chats/list");
      final httpClient = HttpClient();
      final request = await httpClient.getUrl(uri);

      request.headers.set('Authorization', 'Bearer $token');
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        List<dynamic> jsonList = jsonDecode(responseBody);
        return jsonList.map((json) => Chat.fromJson(json)).toList();
      }
      else {
        throw Exception('Failed to load chats');
      }
    } catch (e) {
      print("Error: $e");
      return [];
    }
  }

  Future<List<ChatMessage>> loadHistory() async {
    try {
      int? currentChatId = ChatState.currentChat?.id;
      final uri = Uri.parse("$baseUrl/api/v1/chats/$currentChatId");
      final httpClient = HttpClient();
      final request = await httpClient.getUrl(uri);

      request.headers.set('Authorization', 'Bearer $token');
      final response = await request.close();

      switch (response.statusCode) {
        case 200:
          final responseBody = await response.transform(utf8.decoder).join();
             List<dynamic> jsonList = jsonDecode(responseBody);
             return jsonList.map((json) =>
               ChatMessage.fromJson(json)).toList();
        case 400:
          final responseBody = await response.transform(utf8.decoder).join();
          final errorResponse = ErrorResponse.fromJson(jsonDecode(responseBody));
          throw BadRequestException(errorResponse.message);
        case 401:
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

class FetchDataException implements Exception {
  final String message;
  FetchDataException(this.message);
}

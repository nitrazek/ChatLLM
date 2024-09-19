import 'dart:async';
import 'package:flutter/cupertino.dart';
import '../models/Chat.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  final List<ChatMessage> _chatMessages = [];
  late Chat _currentChat;

  List<ChatMessage> get chatMessages => _chatMessages;

  void sendPrompt(String question) async {
    ChatMessage chatMessage = ChatMessage(question: question);
    _chatMessages.add(chatMessage);
    notifyListeners();

    await for (var answer in _chatService.postQuestion(question)) {
      chatMessage.addResponse(answer);
    }

    chatMessage.finalizeResponse();
    notifyListeners();
  }

  Future<bool> createChat(String name, bool isUsingOnlyKnowledgeBase, int userId ) async {
    _currentChat = await _chatService.createChat(name, isUsingOnlyKnowledgeBase, userId);
    if(_currentChat != null)
      return true;
    else
      return false;
  }
}

class ChatMessage {
  final String question;
  String response = '';
  final StreamController<String> _responseController = StreamController<String>.broadcast();

  ChatMessage({required this.question});

  Stream<String> get responseStream => _responseController.stream;

  void addResponse(String response) {
    this.response += response;
    _responseController.sink.add(this.response);
  }

  void finalizeResponse() {
    _responseController.sink.add(this.response);
  }

  void dispose() {
    _responseController.close();
  }
}

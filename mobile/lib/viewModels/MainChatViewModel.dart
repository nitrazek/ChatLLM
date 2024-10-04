import 'dart:async';
import 'package:flutter/cupertino.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  final List<ChatMessage> _chatMessages = [];
  bool isLoading = false;

  List<ChatMessage> get chatMessages => _chatMessages;

  void sendPrompt(String question) async {
    ChatMessage chatMessage = ChatMessage(question: question);
    _chatMessages.add(chatMessage);
    notifyListeners();

    isLoading = true;
    await for (var answer in _chatService.postQuestion(question)) {
      chatMessage.addResponse(answer);
    }

    chatMessage.finalizeResponse();
    isLoading = false;
    notifyListeners();
  }

  void cancelAnswer() {
    _chatService.cancelAnswer();
    notifyListeners();
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

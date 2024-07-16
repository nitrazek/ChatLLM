import 'dart:async';
import 'package:flutter/cupertino.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  String _response = '';
  final StreamController<String> _responseController = StreamController<String>.broadcast();

  Stream<String> get responseStream => _responseController.stream;
  String get response => _response;

  void sendPrompt(String question) async {
    await for (var answer in _chatService.postQuestion(question)) {
      addResponse(answer);
    }
    notifyListeners();
  }

  void addResponse(String response) {
    _response += response;
    _responseController.sink.add(_response);
    notifyListeners();
  }

  @override
  void dispose() {
    _responseController.close();
    super.dispose();
  }
}

import 'package:flutter/cupertino.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final _chatService = ChatService();

  String? _response;
  String? get response => _response;

  Future<void> sendPrompt(String question) async {
    _response = await _chatService.postQuestion(question);
    notifyListeners();
  }
  Stream<String> getResponseStream() async* {
    if (_response != null) {
      for (int i = 0; i < _response!.length; i++) {
        await Future.delayed(Duration(milliseconds: 50));
        yield _response!.substring(0, i + 1);
      }
    }
  }
}
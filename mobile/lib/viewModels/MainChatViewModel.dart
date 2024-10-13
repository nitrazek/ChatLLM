import 'dart:async';
import 'package:flutter/cupertino.dart';
import '../models/Chat.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  List<ChatMessage> _chatMessages = [];

  List<ChatMessage> get chatMessages => _chatMessages;

  void sendPrompt(String question, int currentChatId, String token) async {
    ChatMessage chatMessage = ChatMessage(sender : 'human', content : question);
    _chatMessages.add(chatMessage);
    notifyListeners();

    ChatMessage chatMessage2 = ChatMessage(sender: "ai", content : "");
    _chatMessages.add(chatMessage2);
    await for (var answer in _chatService.postQuestion(question, currentChatId, token)) {
      chatMessage2.addResponse(answer);
      _chatMessages[_chatMessages.length-1] = chatMessage2;
      notifyListeners();
    }

    chatMessage2.finalizeResponse();

    notifyListeners();
  }

  Future<bool> loadHistory() async {
    _chatMessages = await _chatService.loadHistory();
    if(_chatMessages != null)
      return true;
    else
      return false;
  }


  Future<List<Chat>> getChatList(String token) async {

      List<Chat> chatList = await _chatService.getChatList(token);
      return chatList;
  }


}

class ChatMessage {
  String sender = '';
  String content = '';
  final StreamController<String> _responseController = StreamController<
      String>.broadcast();


  Stream<String> get responseStream => _responseController.stream;

  void addResponse(String content) {
    sender = 'ai';
    this.content += content;
    _responseController.sink.add(this.content);
  }

  void finalizeResponse() {
    _responseController.sink.add(content);
  }

  void dispose() {
    _responseController.close();
  }

  ChatMessage({
    required this.sender,
    required this.content
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: json['sender'],
      content: json['content'],

    );
  }
}


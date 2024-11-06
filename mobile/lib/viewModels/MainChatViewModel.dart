import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:mobile/states/AccountState.dart';
import 'package:mobile/states/ChatState.dart';
import '../models/Chat.dart';
import '../services/ChatService.dart';

class MainChatViewModel extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  List<ChatMessage> _chatMessages = [];
  List<ChatMessage> _reversedChatMessages = [];
  bool isLoading = false;
  double chatListHeight = 460;
  bool isChatListVisible = true;
  bool setting = false;

  List<ChatMessage> get chatMessages => _chatMessages;

  Future<bool> sendPrompt(String question) async {
    ChatMessage chatMessage = ChatMessage(sender: 'human', content: question);

    _chatMessages.add(chatMessage);
    notifyListeners();
    isLoading = true;

    ChatMessage chatMessage2 = ChatMessage(sender: "ai", content: "");
    _chatMessages.add(chatMessage2);
    await for (var answer in _chatService.postQuestion(question)) {
      chatMessage2.addResponse(answer);
      _chatMessages[_chatMessages.length - 1] = chatMessage2;
      notifyListeners();
    }

    chatMessage2.finalizeResponse();
    isLoading = false;
    notifyListeners();
      return ChatState.currentChat!.name != "";
  }

  void cancelAnswer() {
    _chatService.cancelAnswer();
    if (_chatMessages[_chatMessages.length - 1].sender == "ai")
      _chatMessages[_chatMessages.length - 1].content = "*Odpowiedź anulowana*";
    isLoading = false;
    notifyListeners();
  }

  Future<bool> loadHistory() async {
    _chatMessages = await _chatService.loadHistory();
    _chatMessages = _chatMessages.reversed.toList();
    notifyListeners();
    return true;
  }

   void logOut() {
    _chatMessages.clear();
    AccountState.token = "";
  }

  void setChat(Chat chat) {
    ChatState.currentChat = chat;
  }

  void setChatListHeight() {
    if (setting) {
      chatListHeight = 400;
    } else {
      chatListHeight = 460;
    }
  }

  Future<List<Chat>> getChatList() async {
    List<Chat> chatList = await _chatService.getChatList();
    return chatList;
  }
}

class ChatMessage {
  String sender = '';
  String content = '';
  final StreamController<String> _responseController =
      StreamController<String>.broadcast();

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

  ChatMessage({required this.sender, required this.content});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: json['sender'],
      content: json['content'],
    );
  }
}

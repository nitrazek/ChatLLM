import 'package:flutter/cupertino.dart';

import '../models/Chat.dart';

class ChatState extends ChangeNotifier {
  Chat? _currentChat;

  Chat? get currentChat => _currentChat;


  void setChat(Chat chat) {
    _currentChat = chat;
    notifyListeners();
  }
}
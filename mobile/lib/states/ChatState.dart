import 'package:flutter/cupertino.dart';

import '../models/Chat.dart';

class ChatState extends ChangeNotifier {
  Chat? _currentChat;
  Chat? get currentChat => _currentChat;
  bool _isArchival = false;
  bool get isArchival => _isArchival;

  void setChat(Chat chat) {
    _currentChat = chat;
    notifyListeners();
  }

  void setIsArchival(bool choice)
  {
    _isArchival = choice;
  }
}
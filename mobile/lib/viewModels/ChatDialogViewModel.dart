import 'package:flutter/cupertino.dart';
import 'package:mobile/services/ChatService.dart';
import 'package:mobile/states/ChatState.dart';
import 'package:provider/provider.dart';

import '../models/Chat.dart';

class ChatDialogViewModel extends ChangeNotifier {

  late Chat _currentChat;
  ChatService _chatService = ChatService();

  Future<bool> createChat(String? name, bool isUsingOnlyKnowledgeBase, String token ) async {
    _currentChat = await _chatService.createChat(name, isUsingOnlyKnowledgeBase, token);
    if(_currentChat.id >=0 || _currentChat.id!=null)
      return true;
    else
      return false;
  }

  Chat getChat()
  {
    return _currentChat;
  }
}
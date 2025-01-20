import 'package:flutter/cupertino.dart';
import 'package:mobile/services/ChatService.dart';
import 'package:mobile/states/ChatState.dart';
import 'package:provider/provider.dart';

import '../models/Chat.dart';

class ChatDialogViewModel extends ChangeNotifier {
  Chat? currentChat = ChatState.currentChat;
  ChatService _chatService = ChatService();

  Future<bool> createChat(String? name, bool isUsingOnlyKnowledgeBase) async {
    currentChat = await _chatService.createChat(name, isUsingOnlyKnowledgeBase);
    if (currentChat!.id >= 0)
      return true;
    else
      return false;
  }

  void setChat(Chat chat) {
    ChatState.currentChat = chat;
  }
}

import 'package:flutter/cupertino.dart';

class Chat  {
  int id;
  String name;
  bool isUsingOnlyKnowledgeBase;

  Chat({
    required this.id,
    required this.name,
    required this.isUsingOnlyKnowledgeBase,
});
  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'],
      name: json['name'],
      isUsingOnlyKnowledgeBase: json['isUsingOnlyKnowledgeBase'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isUsingOnlyKnowledgeBase': isUsingOnlyKnowledgeBase
    };
  }

  static List<Chat> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Chat.fromJson(json)).toList();
  }

}
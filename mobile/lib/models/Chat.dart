import 'package:flutter/cupertino.dart';

class Chat {
  int id;
  String? name;
  bool isUsingOnlyKnowledgeBase;
  String createdAt;
  String updatedAt;

  Chat(
      {required this.id,
      required this.name,
      required this.isUsingOnlyKnowledgeBase,
      required this.createdAt,
      required this.updatedAt});

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
        id: json['id'],
        name: json['name'],
        isUsingOnlyKnowledgeBase: json['isUsingOnlyKnowledgeBase'],
        createdAt: json['createdAt'],
        updatedAt: json['updatedAt']);
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

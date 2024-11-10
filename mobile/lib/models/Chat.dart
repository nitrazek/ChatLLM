import 'package:flutter/cupertino.dart';

class Chat {
  int id;
  String? name;
  bool isUsingOnlyKnowledgeBase;
  DateTime createdAt;
  DateTime updatedAt;

  Chat({
    required this.id,
    required this.name,
    required this.isUsingOnlyKnowledgeBase,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'],
      name: json['name'],
      isUsingOnlyKnowledgeBase: json['isUsingOnlyKnowledgeBase'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isUsingOnlyKnowledgeBase': isUsingOnlyKnowledgeBase,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static List<Chat> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Chat.fromJson(json)).toList();
  }
}

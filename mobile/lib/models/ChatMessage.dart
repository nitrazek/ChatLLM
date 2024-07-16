import 'dart:async';

class ChatMessage {
  final String question;
  String response = ''; // Pole do przechowywania odpowiedzi

  ChatMessage({required this.question});
}

class ChatMessage {
  final String question;
  Stream<String>? response;

  ChatMessage({required this.question, this.response});
}
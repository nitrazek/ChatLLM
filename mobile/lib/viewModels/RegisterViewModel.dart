import 'package:flutter/cupertino.dart';

import '../services/AccountService.dart';
import '../services/ChatService.dart'; // Jeśli potrzebne są dodatkowe wyjątki

class RegisterviewModel extends ChangeNotifier {
  final AccountService _accountService = AccountService();
  bool _isRegistered = false;
  String errorMessage = '';

  Future<bool> register(String name, String email, String password) async {
    try {
      _isRegistered = await _accountService.register(name, email, password);
      return _isRegistered;
    } catch (e) {
      if (e is BadRequestException) {
        errorMessage = e.message;
      } else if (e is ServerException) {
        errorMessage = 'Błąd serwera: ${e.message}';
      } else if (e is FetchDataException) {
        errorMessage = 'Problem z połączeniem: ${e.message}';
      } else {
        errorMessage = 'Nieznany błąd. Spróbuj ponownie później.';
      }
      notifyListeners();
      return false;
    }
  }
}

import 'package:flutter/cupertino.dart';

import '../models/Account.dart';
import '../services/AccountService.dart';
import '../services/ChatService.dart'; // Jeśli potrzebne są dodatkowe wyjątki

class RegisterviewModel extends ChangeNotifier {
  final AccountService _accountService = AccountService();
  late Account _account;
  String errorMessage = '';

  Future<bool> register(String name, String email, String password) async {
    try {
      _account = await _accountService.register(name, email, password);
      return true;
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

  Account getAccount() {
    return _account;
  }
}

import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';

import '../models/Account.dart';
import '../services/AccountService.dart';
import '../services/ChatService.dart';

class LoginViewModel extends ChangeNotifier {
  late Account _account;
  final AccountService _accountService = AccountService();

  String errorMessage = '';

Future<bool> login (String name, String password) async {
  try {
    _account = await _accountService.login(name, password);
    return true;
  }
  catch (e) {
    if (e is BadRequestException) {
      errorMessage = e.message;
    } else if (e is ServerException) {
      errorMessage = 'Błąd serwera: ${e.message}';
    } else if (e is FetchDataException) {
      errorMessage = e.message;
    } else if (e is NotFoundException) {
      errorMessage = e.message;
    } else {
      errorMessage = 'Nieznany błąd. Spróbuj ponownie później.';
    }
    notifyListeners();
    return false;
  }
}
}
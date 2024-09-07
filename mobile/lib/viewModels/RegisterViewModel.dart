import 'package:flutter/cupertino.dart';

import '../models/Account.dart';
import '../services/AccountService.dart';

class RegisterviewModel extends ChangeNotifier {

  final AccountService _accountService = AccountService();
  late Account _account;

  Future<bool> register(String name, String email, String password) async {
    try {
      _account = await _accountService.register(name, email, password);
      return true;
    } catch (e) {
      return false;
    }
  }

  Account getAccount() {
    return _account;
  }
}
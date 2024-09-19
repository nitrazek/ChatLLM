import 'package:flutter/cupertino.dart';
import 'package:mobile/services/AccountService.dart';

import '../models/Account.dart';

class Activateuserviewmodel extends ChangeNotifier{

  late Account _account;
  AccountService _accountService = AccountService();

  Future<bool> activateAccount (int loggedUserId) async {
    try {
      _account = await _accountService.activateAccount(loggedUserId);
      return true;
    }
    catch(e) {
      return false;
    }
  }
}
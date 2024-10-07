import 'package:flutter/cupertino.dart';

import '../models/Account.dart';

class AccountState extends ChangeNotifier {

  Account? _currentAccount;
  Account? get currentAccount => _currentAccount;

  void setAccount(Account account) {
    _currentAccount = account;
  }
}
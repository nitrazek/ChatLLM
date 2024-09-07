import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';

import '../models/Account.dart';
import '../services/AccountService.dart';

class LoginViewModel extends ChangeNotifier {
  late Account _account;
  final AccountService _accountService = AccountService();

Future<bool> login (String name, String password) async{
  try {
    _account = await _accountService.login(name, password);
    return true;
  }
  catch(e){
    return false;

  }
}
}
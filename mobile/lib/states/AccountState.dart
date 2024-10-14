import 'package:flutter/cupertino.dart';


class AccountState extends ChangeNotifier {

  String? _token;
  String? get token => _token;

  void setAccount(String token) {
    _token = token;
  }
}
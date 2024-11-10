import 'package:flutter/material.dart';
import 'package:mobile/viewModels/ChatDialogViewModel.dart';
import 'package:mobile/viewModels/LoginViewModel.dart';
import 'package:mobile/viewModels/MainChatViewModel.dart';
import 'package:mobile/viewModels/RegisterViewModel.dart';
import 'package:mobile/views/Login.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (context) => MainChatViewModel()),
          ChangeNotifierProvider(create: (context) => RegisterviewModel()),
          ChangeNotifierProvider(create: (context) => LoginViewModel()),
          ChangeNotifierProvider(create: (context) => ChatDialogViewModel()),
        ],
        child: const MaterialApp(
          home: const LoginPage(),
        ));
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/viewModels/ActivateUserViewModel.dart';
import 'package:mobile/viewModels/LoginViewModel.dart';
import 'package:mobile/viewModels/MainChatViewModel.dart';
import 'package:mobile/viewModels/RegisterViewModel.dart';
import 'package:mobile/views/Login.dart';
import 'package:mobile/views/MainChat.dart';
import 'package:mobile/views/Register.dart';
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
          ChangeNotifierProvider(create: (context) => Activateuserviewmodel())
        ],
        child: const MaterialApp(
          home: const RegisterPage(),
        ));
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
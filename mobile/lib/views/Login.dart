import 'dart:ui';

import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {

  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  late double screenWidth;
  late double screenHeight;

  @override
  void initState() {
    FlutterView view = WidgetsBinding.instance.platformDispatcher.views.first;
    Size size = view.physicalSize;
    screenWidth = size.width;
    screenHeight = size.height;
  }
  @override
  void didChangeDependencies() {
    _loginController.clear();
    _passwordController.clear();
    super.didChangeDependencies();
  }

  @override
  void didPopNext() {
    _loginController.clear();
    _passwordController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
          color: Color(0xFF282B30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            SizedBox(height: screenHeight * 0.012,),
            Center(
              child: Icon(
                Icons.chat,
                color: Colors.white,
                size: 100,
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text("GENERATOR",style: TextStyle(color: Colors.white, fontSize: 35),),
                    Text("Login",style: TextStyle(color: Colors.white, fontSize: 20),)
                  ]
              ),
            ),
            Expanded(
                child: Container(
                  decoration: BoxDecoration(
                      color: Color(0xFF424549),
                      borderRadius: const BorderRadius.only(topLeft: Radius.circular(40), topRight: Radius.circular(40))
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(30),
                    child: Column(
                      children: [
                        SizedBox(height: screenHeight * 0.005,),
                        Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [BoxShadow(
                                  color: Color(0xFFFFFFFA),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10)
                              ),]
                          ),
                          child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: const BoxDecoration(
                                      border: Border(bottom: BorderSide(color: Colors.grey))
                                  ),
                                  child: TextField(
                                    controller: _loginController,
                                    decoration: const InputDecoration(
                                      hintText: "Login",
                                      hintStyle: TextStyle(color: Colors.grey),
                                      border: InputBorder.none,
                                    ),
                                   // enabled: !_isLoading,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  child: TextField(
                                    controller: _passwordController,
                                    obscureText: true,
                                    decoration: const InputDecoration(
                                      hintText: "Password",
                                      hintStyle: TextStyle(color: Colors.grey),
                                      border: InputBorder.none,
                                    ),
                                   // enabled: !_isLoading,
                                  ),
                                ),
                              ],
                          ),
                        ),
                        SizedBox(height: 50,),
                        ElevatedButton(
                          onPressed: () {  },
                          child: Text(
                            "Login",
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {  },
                          child: Text(
                            "Register",
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            )
          ],
        ),
      ),
    );
  }
}

import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/viewModels/LoginViewModel.dart';
import 'package:provider/provider.dart';

import 'MainChat.dart';
import 'Register.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with RouteAware{

  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  late double screenWidth;
  late double screenHeight;

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
  }
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  void didPopNext() {
    _loginController.clear();
    _passwordController.clear();
  }
  bool _obscureText = true;

  void _togglePasswordVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    double fontSizeScale = screenWidth / 400;
    bool isKeyBoardOpen = MediaQuery.of(context).viewInsets.bottom != 0;
    bool isLogged = false;

    return Scaffold(
        body: Stack(
          children: [
            Container(
              height: double.infinity,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: AppColors.theDarkest,
              ),
              child: Padding(
                padding: EdgeInsets.only(top: screenHeight * 0.085, left: screenWidth * 0.05),
                child: Text(
                  'Hello\nSign in!',
                  style: AppTextStyles.colorText(fontSizeScale, 30, Colors.white)
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(top: screenHeight * 0.22),
              child: Container(
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(40), topRight: Radius.circular(40)),
                  color: AppColors.darkest,
                ),
                height: double.infinity,
                width: double.infinity,
                child:  Padding(
                  padding:  EdgeInsets.only(left:screenWidth * 0.045,right: screenWidth * 0.045),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(height: screenHeight * 0.05),
                        TextFormField(
                          style: AppTextStyles.chatText(fontSizeScale, 17),
                          controller: _loginController,
                          decoration: InputDecoration(
                            suffixIcon: const Icon(Icons.check, color: Colors.white),
                            label: Text(
                              'Login',
                              style: TextStyle(fontSize: 16 * fontSizeScale, color: Colors.white),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your login';
                            }
                            if(value.length < 6){
                              return 'Login is too short';
                            }
                            return null;
                          },
                        ),
                        TextFormField(
                          style: AppTextStyles.chatText(fontSizeScale, 17),
                          controller: _passwordController,
                          decoration: InputDecoration(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureText ? Icons.visibility_off : Icons.visibility,
                                color: Colors.white,
                              ),
                              onPressed: _togglePasswordVisibility,
                            ),
                            label: Text(
                              'Password',
                              style: TextStyle(fontSize: 16 * fontSizeScale, color: Colors.white),
                            ),
                          ),
                          obscureText: _obscureText,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your password';
                            }
                            if (value.length < 6 && value.contains('1')) {
                              return 'Password must be at least 6 characters long';
                            }
                            return null;
                          },
                        ),
                      SizedBox(height: screenHeight * 0.015),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text('Forgot Password?',style: AppTextStyles.colorText(fontSizeScale, 16, Colors.white)
                      ),
                      ),
                      SizedBox(height: screenHeight * 0.07),
                      InkWell(
                        onTap: () async {
                          String login = _loginController.text;
                          String password = _passwordController.text;
                          if (_formKey.currentState!.validate()) {
                            isLogged = await context.read<LoginViewModel>().login(login, password);
                            if (isLogged) {
                              Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => const MainChatPage())
                              );
                            } else {
                              // Handle login failure
                            }
                          }
                        },
                      child: Container(
                        height: screenHeight * 0.065,
                        width: screenWidth * 0.81,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(30),
                          color: AppColors.purple
                        ),
                        child: const Center(child: Text('SIGN IN',style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            color: Colors.white
                        ),),),
                      ),
                      ),
                      SizedBox(height: screenHeight * 0.02),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text("Don't have account?",style: AppTextStyles.colorText(fontSizeScale, 14, Colors.white),),
                            InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => const RegisterPage()),
                                );
                              },
                            child: Text("Sign up",style: AppTextStyles.colorText(fontSizeScale, 16, Colors.white),)
                            ),
                          ],
                        ),
                      ),
                      if(!isKeyBoardOpen)
                      SizedBox(height: screenHeight * 0.2),
                    ],
                  ),
                  ),
                ),
              ),
            ),
          ],
        ));
  }
}

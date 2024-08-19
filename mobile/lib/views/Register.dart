import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:mobile/models/Styles.dart';

import 'Login.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {

  final TextEditingController _registerController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  late double screenWidth;
  late double screenHeight;

  @override
  void initState() {
    super.initState();
    FlutterView view = WidgetsBinding.instance.platformDispatcher.views.first;
    Size size = view.physicalSize;
    screenWidth = size.width;
    screenHeight = size.height;
  }
  @override
  void didChangeDependencies() {
    _registerController.clear();
    _passwordController.clear();
    super.didChangeDependencies();
  }

  void didPopNext() {
    _registerController.clear();
    _passwordController.clear();
  }
  bool _obscureText = true;
  bool _repeatObscureText = true;

  void _togglePasswordVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }
  void _toggleRepeatPasswordVisibility() {
    setState(() {
      _repeatObscureText = !_repeatObscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    double fontSizeScale = screenWidth / 400;
    bool isKeyBoardOpen = MediaQuery.of(context).viewInsets.bottom!=0;
    return Scaffold(
        body: Stack(
          children: [
            Container(
              height: screenHeight,
              width: screenWidth,
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [
                  AppColors.dark,
                  AppColors.darkest,
                ]),
              ),
              child: Padding(
                padding: EdgeInsets.only(top: screenHeight * 0.085, left: screenWidth * 0.05),
                child: Text(
                    'Hello\nSign up!',
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
                  color: Colors.white,
                ),
                height: double.infinity,
                width: double.infinity,
                child:  Padding(
                  padding:  EdgeInsets.only(left:screenWidth * 0.045,right: screenWidth * 0.045),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(height: screenHeight * 0.05),
                      TextField(
                        decoration: InputDecoration(
                            suffixIcon: const Icon(Icons.check,color: AppColors.purple,),
                            label: Text('Login',style: AppTextStyles.colorText(fontSizeScale, 16, AppColors.purple),)
                        ),
                      ),
                      TextField(
                        decoration: InputDecoration(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureText ? Icons.visibility_off : Icons.visibility,
                                color: Colors.purple,
                              ),
                              onPressed: _togglePasswordVisibility,
                            ),
                            label: Text('Password',style: AppTextStyles.colorText(fontSizeScale, 16, AppColors.purple),)
                        ),
                        obscureText: _obscureText,
                      ),
                      TextField(
                        decoration: InputDecoration(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _repeatObscureText ? Icons.visibility_off : Icons.visibility,
                                color: Colors.purple,
                              ),
                              onPressed: _toggleRepeatPasswordVisibility,
                            ),
                            label: Text('Repeat Password',style: AppTextStyles.colorText(fontSizeScale, 16, AppColors.purple),)
                        ),
                        obscureText: _repeatObscureText,
                      ),
                      SizedBox(height: screenHeight * 0.06),
                      InkWell(
                        onTap: () {

                        },
                      child: Container(
                        height: screenHeight * 0.06,
                        width: screenWidth * 0.81,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(30),
                          gradient: const LinearGradient(
                              colors: [
                                AppColors.purple,
                                AppColors.darkest,
                              ]
                          ),
                        ),
                        child: Center(child: Text('SIGN UP',
                          style: AppTextStyles.colorText(fontSizeScale, 20, Colors.white)
                        ),),
                      ),
                      ),
                      SizedBox(height: screenHeight * 0.01,),
                      InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const LoginPage()),
                          );
                        },
                        child: Container(
                          height: screenHeight * 0.06,
                          width: screenWidth * 0.81,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(30),
                            gradient: const LinearGradient(
                                colors: [
                                  AppColors.dark,
                                  AppColors.darkest,
                                ]
                            ),
                          ),
                          child:  Center(child: Text('I already have account',
                              style: AppTextStyles.colorText(fontSizeScale, 20, Colors.white)
                          ),
                          ),
                        ),
                      ),
                      if(!isKeyBoardOpen)
                      SizedBox(height: screenHeight * 0.2)
                    ],
                  ),
                ),
              ),
            ),
          ],
        ));
  }
}

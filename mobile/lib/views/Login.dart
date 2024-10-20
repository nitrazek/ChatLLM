import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/viewModels/LoginViewModel.dart';
import 'package:provider/provider.dart';
import 'package:showcaseview/showcaseview.dart';

import '../states/AccountState.dart';
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

  bool _isLoading = false;

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

    return PopScope(
      child:Scaffold(
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
                  'Witaj\nZaloguj się!',
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
                          enabled: !_isLoading,
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
                              return 'Wprowadź swój login';
                            }
                            if(value.length < 6){
                              return 'Login jest zbyt krótki';
                            }
                            return null;
                          },
                        ),
                        TextFormField(
                          enabled: !_isLoading,
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
                              'Hasło',
                              style: TextStyle(fontSize: 16 * fontSizeScale, color: Colors.white),
                            ),
                          ),
                          obscureText: _obscureText,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Wprowadź swoje hasło';
                            }
                            return null;
                          },
                        ),
                      SizedBox(height: screenHeight * 0.015),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text('Zapomniałeś hasła?',style: AppTextStyles.colorText(fontSizeScale, 16, Colors.white)
                      ),
                      ),
                      SizedBox(height: screenHeight * 0.07),
                      InkWell(
                        onTap: () async {
                          setState(() {
                            _isLoading = true;
                          });
                          String login = _loginController.text;
                          String password = _passwordController.text;

                          Future.delayed(Duration(seconds: 7), () {
                            if (_isLoading && mounted) {
                              setState(() {
                                _isLoading = false;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Brak odpowiedzi z serwera')),
                              );
                            }
                          });

                          if (!_formKey.currentState!.validate()) {
                            _isLoading = false;
                          }
                          if (_formKey.currentState!.validate()) {
                            try {
                              isLogged = await context.read<LoginViewModel>().login(login, password);

                              if (isLogged) {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => ShowCaseWidget(
                                          builder: (context) => MainChatPage(),
                                    ))
                                );
                              } else {
                                String errorMessage = context.read<LoginViewModel>().errorMessage;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(errorMessage),
                                  ),
                                );
                                setState(() {
                                  _isLoading = false;
                                });
                            }
                            }
                            catch (e) {
                              setState(() {
                                _isLoading = false;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Nie udało się połączyć z serwerem. Spróbuj ponownie później.'),
                                ),
                              );
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
                        child: Center(child: _isLoading ? CircularProgressIndicator(
                          color: Colors.white,
                        ) : Text('Zaloguj się',style: TextStyle(
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
                            Text("Nie masz konta?",style: AppTextStyles.colorText(fontSizeScale, 14, Colors.white),),
                            InkWell(
                              onTap: _isLoading ? null : () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => const RegisterPage()),
                                );
                              },
                            child: Text("Zarejestruj się",style: AppTextStyles.colorText(fontSizeScale, 16, Colors.white),)
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
        ))
    );
  }
}

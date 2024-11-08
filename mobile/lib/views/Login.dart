import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/viewModels/LoginViewModel.dart';
import 'package:provider/provider.dart';
import 'package:showcaseview/showcaseview.dart';

import 'MainChat.dart';
import 'Register.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with RouteAware {
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

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
    bool isLogged = false;

    return PopScope(
        child: ScreenUtilInit(
            designSize: const Size(411, 707),
            minTextAdapt: true,
            builder: (context, child) {
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
                      padding: EdgeInsets.only(top: 60.h, left: 15.w),
                      child: Text(
                        'Witaj\nZaloguj się!',
                        style: TextStyle(
                            fontFamily: AppTextStyles.Andada,
                            color: Colors.white,
                            fontSize: 33.sp,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.only(top: 155.h),
                    child: Container(
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(40),
                            topRight: Radius.circular(40)),
                        color: AppColors.darkest,
                      ),
                      height: double.infinity,
                      width: double.infinity,
                      child: SingleChildScrollView(
                        child: Padding(
                          padding: EdgeInsets.only(left: 17.w, right: 17.w),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(height: 35.h),
                                TextFormField(
                                  enabled: !_isLoading,
                                  style: TextStyle(
                                    fontFamily: AppTextStyles.Andada,
                                    color: Colors.white,
                                    fontSize: 19.sp,
                                  ),
                                  controller: _loginController,
                                  decoration: InputDecoration(
                                    suffixIcon: const Icon(Icons.check,
                                        color: Colors.white),
                                    label: Text(
                                      'Login',
                                      style: TextStyle(
                                        fontFamily: AppTextStyles.Andada,
                                        color: Colors.white,
                                        fontSize: 17.sp,
                                      ),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Wprowadź swój login';
                                    }
                                    if (value.length < 6) {
                                      return 'Login jest zbyt krótki';
                                    }
                                    return null;
                                  },
                                ),
                                TextFormField(
                                  enabled: !_isLoading,
                                  style: TextStyle(
                                    fontFamily: AppTextStyles.Andada,
                                    color: Colors.white,
                                    fontSize: 17.sp,
                                  ),
                                  controller: _passwordController,
                                  decoration: InputDecoration(
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureText
                                            ? Icons.visibility_off
                                            : Icons.visibility,
                                        color: Colors.white,
                                      ),
                                      onPressed: _togglePasswordVisibility,
                                    ),
                                    label: Text(
                                      'Hasło',
                                      style: TextStyle(
                                        fontFamily: AppTextStyles.Andada,
                                        color: Colors.white,
                                        fontSize: 17.sp,
                                      ),
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
                                SizedBox(height: 11.h),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: Text(
                                    'Zapomniałeś hasła?',
                                    style: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
                                      color: Colors.white,
                                      fontSize: 17.sp,
                                    ),
                                  ),
                                ),
                                SizedBox(height: 45.h),
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
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                              content: Text(
                                                  'Brak odpowiedzi z serwera')),
                                        );
                                      }
                                    });

                                    if (!_formKey.currentState!.validate()) {
                                      _isLoading = false;
                                    }
                                    if (_formKey.currentState!.validate()) {
                                      try {
                                        isLogged = await context
                                            .read<LoginViewModel>()
                                            .login(login, password);

                                        if (isLogged) {
                                          Navigator.pushReplacement(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      ShowCaseWidget(
                                                        builder: (context) =>
                                                            MainChatPage(),
                                                      )));
                                        } else {
                                          String errorMessage = context
                                              .read<LoginViewModel>()
                                              .errorMessage;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(
                                            SnackBar(
                                              content: Text(errorMessage),
                                            ),
                                          );
                                          setState(() {
                                            _isLoading = false;
                                          });
                                        }
                                      } catch (e) {
                                        setState(() {
                                          _isLoading = false;
                                        });
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: Text(
                                                'Nie udało się połączyć z serwerem. Spróbuj ponownie później.'),
                                          ),
                                        );
                                      }
                                    }
                                  },
                                  child: Container(
                                    height: 45.h,
                                    width: 340.w,
                                    decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(30),
                                        color: AppColors.purple),
                                    child: Center(
                                      child: _isLoading
                                          ? CircularProgressIndicator(
                                              color: Colors.white,
                                            )
                                          : Text(
                                              'Zaloguj się',
                                              style: TextStyle(
                                                  fontFamily:
                                                      AppTextStyles.Andada,
                                                  color: Colors.white,
                                                  fontSize: 23.sp,
                                                  fontWeight: FontWeight.bold),
                                            ),
                                    ),
                                  ),
                                ),
                                SizedBox(height: 15.h),
                                Align(
                                  alignment: Alignment.bottomRight,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        "Nie masz konta?",
                                        style: TextStyle(
                                          fontFamily: AppTextStyles.Andada,
                                          color: Colors.white,
                                          fontSize: 15.sp,
                                        ),
                                      ),
                                      InkWell(
                                          onTap: _isLoading
                                              ? null
                                              : () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                        builder: (context) =>
                                                            const RegisterPage()),
                                                  );
                                                },
                                          child: Text(
                                            "Zarejestruj się",
                                            style: TextStyle(
                                              fontFamily: AppTextStyles.Andada,
                                              color: Colors.white,
                                              fontSize: 17.sp,
                                            ),
                                          )),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ));
            }));
  }
}

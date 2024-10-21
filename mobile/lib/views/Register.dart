import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/viewModels/RegisterViewModel.dart';
import 'package:provider/provider.dart';
import 'Login.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool badValues = false;

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
    bool isKeyBoardOpen = MediaQuery.of(context).viewInsets.bottom != 0;
    return PopScope(
        child: ScreenUtilInit(
            designSize: const Size(411, 707),
            minTextAdapt: true,
            builder: (context, child) {
              return Scaffold(
                  body: Stack(
                children: [
                  Container(
                    height: screenHeight,
                    width: screenWidth,
                    decoration: const BoxDecoration(
                      color: AppColors.theDarkest,
                    ),
                    child: Padding(
                      padding: EdgeInsets.only(top: 60.h, left: 15.w),
                      child: Text('Witaj\nZarejestruj się!',
                          style: AppTextStyles.colorText(
                              fontSizeScale, 30, Colors.white)),
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
                                controller: _emailController,
                                decoration: InputDecoration(
                                  suffixIcon: const Icon(Icons.check,
                                      color: Colors.white),
                                  label: Text(
                                    'Email',
                                    style: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
                                      color: Colors.white,
                                      fontSize: 17.sp,
                                    ),
                                  ),
                                ),
                                keyboardType: TextInputType.emailAddress,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Wprowadź swój email';
                                  }
                                  bool emailValid = RegExp(
                                          r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
                                      .hasMatch(value);

                                  if (!emailValid) {
                                    return 'Zły format maila';
                                  }
                                  return null;
                                },
                              ),
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
                                    return 'Login musi mieć conajmniej 6 znaków';
                                  }
                                  return null;
                                },
                              ),
                              TextFormField(
                                enabled: !_isLoading,
                                style: TextStyle(
                                  fontFamily: AppTextStyles.Andada,
                                  color: Colors.white,
                                  fontSize: 19.sp,
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
                                    return 'Wprowadź hasło';
                                  }
                                  if (value.length < 6 && value.contains('1')) {
                                    return 'Hasło musi mieć conajmniej 6 znaków';
                                  }
                                  bool hasDigits =
                                      value.contains(RegExp(r'[0-9]'));
                                  bool hasSpecialCharacters =
                                      value.contains(RegExp(r'[!@#\$&*~]'));

                                  if (!hasDigits || !hasSpecialCharacters) {
                                    return 'Hasło musi zawierać literę, cyfrę i znak specjalny';
                                  }
                                  return null;
                                },
                              ),
                              TextFormField(
                                enabled: !_isLoading,
                                style: TextStyle(
                                  fontFamily: AppTextStyles.Andada,
                                  color: Colors.white,
                                  fontSize: 19.sp,
                                ),
                                controller: _confirmPasswordController,
                                decoration: InputDecoration(
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _repeatObscureText
                                          ? Icons.visibility_off
                                          : Icons.visibility,
                                      color: Colors.white,
                                    ),
                                    onPressed: _toggleRepeatPasswordVisibility,
                                  ),
                                  label: Text(
                                    'Powtórz hasło',
                                    style: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
                                      color: Colors.white,
                                      fontSize: 17.sp,
                                    ),
                                  ),
                                ),
                                obscureText: _repeatObscureText,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Wprowadź ponownie hasło';
                                  }
                                  if (value != _passwordController.text) {
                                    return 'Hasła nie są identyczne';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 41.h),
                              InkWell(
                                onTap: _isLoading
                                    ? null
                                    : () async {
                                        setState(() {
                                          _isLoading = true;
                                        });
                                        String login = _loginController.text;
                                        String email = _emailController.text;
                                        String password =
                                            _passwordController.text;

                                        Future.delayed(Duration(seconds: 7),
                                            () {
                                          if (_isLoading) {
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

                                        if (!_formKey.currentState!
                                            .validate()) {
                                          _isLoading = false;
                                          badValues = true;
                                        }
                                        if (_formKey.currentState!.validate()) {
                                          try {
                                            bool isRegistered = await context
                                                .read<RegisterviewModel>()
                                                .register(
                                                  login,
                                                  email,
                                                  password,
                                                );

                                            if (isRegistered) {
                                              setState(() {
                                                _isLoading = false;
                                              });
                                              Navigator.pushReplacement(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      const LoginPage(),
                                                ),
                                              );
                                            } else {
                                              String errorMessage = context
                                                  .read<RegisterviewModel>()
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
                                    gradient: const LinearGradient(colors: [
                                      AppColors.purple,
                                      AppColors.purple,
                                    ]),
                                  ),
                                  child: Center(
                                    child: _isLoading
                                        ? CircularProgressIndicator(
                                            color: Colors.white,
                                          )
                                        : Text('Zarejestruj się',
                                            style: AppTextStyles.colorText(
                                                fontSizeScale,
                                                20,
                                                Colors.white)),
                                  ),
                                ),
                              ),
                              SizedBox(height: 9.h),
                              InkWell(
                                onTap: () {
                                  Navigator.pop(context);
                                },
                                child: Container(
                                  height: 45.h,
                                  width: 340.w,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(30),
                                    gradient: const LinearGradient(colors: [
                                      AppColors.dark,
                                      AppColors.dark,
                                    ]),
                                  ),
                                  child: Center(
                                    child: Text('Mam już konto',
                                        style: AppTextStyles.colorText(
                                            fontSizeScale, 20, Colors.white)),
                                  ),
                                ),
                              ),
                              if (!isKeyBoardOpen && !badValues)
                                SizedBox(height: 150.h),
                            ],
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

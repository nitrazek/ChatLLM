import 'package:flutter/material.dart';

class AppColors {
  static const Color darkest = Color(0xFF282B30);
  static const Color purple = Color(0xFF7289da);
  static const Color dark = Color(0xFF424549);
}

class AppTextStyles {

  static const String Manrope =  'Manrope-VariableFont_wght';
  static const String Andada = 'AndadaSC-Regular';
  static TextStyle chatText(double fontSizeScale, int size) {
    return TextStyle(
      fontFamily: Andada,
      color: Colors.white,
      fontSize: size * fontSizeScale,
    );
  }
}

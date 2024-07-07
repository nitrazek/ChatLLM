import 'package:flutter/material.dart';

class AppColors {
  static const Color darkest = Color(0xFF282B30);
  static const Color purple = Color(0xFF7289da);
  static const Color dark = Color(0xFF424549);
}

class AppTextStyles {

  static const String Manrope =  'Manrope-VariableFont_wght';
  static TextStyle chatText(double fontSizeScale) {
    return TextStyle(
      fontFamily: Manrope,
      color: Colors.white,
      fontSize: 20 * fontSizeScale,
      fontWeight: FontWeight.bold,
    );
  }
}

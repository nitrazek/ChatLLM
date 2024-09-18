import 'package:flutter/material.dart';

class AppColors {
  static const Color theDarkest = Color(0xFF1e2124);
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
  static TextStyle colorText(double fontSizeScale, int size, Color userColor) {
    return TextStyle(
      fontFamily: Andada,
      color: userColor,
      fontSize: size * fontSizeScale,
      fontWeight: FontWeight.bold
    );
  }
}

class ButtonStyles {

  static ButtonStyle buttonStyle = ButtonStyle (
    backgroundColor: MaterialStateProperty.all(AppColors.purple),
      textStyle: MaterialStateProperty.all<TextStyle>(
        const TextStyle(
            fontSize: 20.0,
        fontFamily: AppTextStyles.Andada),
      ),
    shape: MaterialStateProperty.all<OutlinedBorder>(
      RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10.0),

  ),
  ),
      padding: MaterialStateProperty.all<EdgeInsetsGeometry>(
  const EdgeInsets.symmetric(vertical: 12.0, horizontal: 24.0),
  ),
  elevation: MaterialStateProperty.all<double>(5.0), // Dodanie cienia
  shadowColor: MaterialStateProperty.all<Color>(Colors.grey)); // Kolor cienia);

}

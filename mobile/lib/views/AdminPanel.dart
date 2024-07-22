import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/views/MainChat.dart';

import '../models/Styles.dart';

class AdminPanelPage extends StatefulWidget {
  const AdminPanelPage({super.key});

  @override
  State<AdminPanelPage> createState() => _AdminPanelPageState();
}

class _AdminPanelPageState extends State<AdminPanelPage> {

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    double fontSizeScale = screenWidth / 400;

    return Scaffold(
      body: Container(
    child: Column(
      children: [
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const MainChatPage()),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.purple,
            padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.3, vertical: screenHeight * 0.02),
          ),
          child: Text('Admin Panel',
            style: TextStyle(
              fontFamily: AppTextStyles.Manrope,
              color: Colors.white,
              fontSize: 20 * fontSizeScale,
              fontWeight: FontWeight.bold,
            ),),
        )
      ],
    ),
    ));


  }
}

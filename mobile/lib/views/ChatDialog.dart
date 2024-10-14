import 'package:flutter/material.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/states/AccountState.dart';
import 'package:mobile/states/ChatState.dart';
import 'package:mobile/viewModels/ChatDialogViewModel.dart';
import 'package:mobile/viewModels/MainChatViewModel.dart';
import 'package:mobile/views/MainChat.dart';
import 'package:provider/provider.dart';
import 'package:showcaseview/showcaseview.dart';

import '../viewModels/LoginViewModel.dart';
import '../models/Account.dart';

class ChatDialog extends StatefulWidget {

  @override
  _ChatDialogState createState() => _ChatDialogState();
}

class _ChatDialogState extends State<ChatDialog> {
  TextEditingController _nameController = TextEditingController();
  bool isUsingOnlyKnowledgeBase = false;
  late final String? _token = context.read<AccountState>().token;
  String? name = "";

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return AlertDialog(
      backgroundColor: AppColors.dark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15.0),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            style:TextStyle(
                color: Colors.white,
                fontFamily: AppTextStyles.Andada
            ),
            onEditingComplete: (){
            },
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Nazwa chatu', labelStyle: TextStyle(
                color: Colors.white,
                fontFamily: AppTextStyles.Andada
            ),),
          ),
          SizedBox(height: screenHeight * 0.017),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                style:TextStyle(
                  color: Colors.white,
                  fontFamily: AppTextStyles.Andada
                ),
                  "Używaj tylko bazy wiedzy"
              ),
              Switch(
                activeColor: AppColors.purple,
                value: isUsingOnlyKnowledgeBase,
                onChanged: (value) {
                  setState(() {
                    isUsingOnlyKnowledgeBase = value;
                  });
                },
              ),
            ],
          ),
          SizedBox(height: screenHeight * 0.017),

          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purple,
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.17,
                vertical: screenHeight * 0.011,
              ),
            ),
            onPressed: () async {
              name = _nameController.text;
              bool isCreated = await context.read<ChatDialogViewModel>().createChat(
                  name,
                  isUsingOnlyKnowledgeBase,
                  _token!
              );
              if(isCreated == true) {
                context.read<ChatState>().setChat(context.read<ChatDialogViewModel>().getChat());
                context.read<ChatState>().setIsArchival(false);
                Navigator.of(context).pop(isCreated);
              }
              else {
                SnackBar(
                  content: Text("Nie udało się stworzyć pokoju, Przepraszamy za utrudnienia."),
                );
              }
            },
            child: Text(
                style:TextStyle(
                    color: Colors.white,
                    fontFamily: AppTextStyles.Andada
                ),
                "Stwórz"
            ),

          ),
        ],
      ),
    );
  }
}

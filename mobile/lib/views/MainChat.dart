import 'package:flutter/material.dart';
import 'package:mobile/models/Styles.dart';
import 'package:mobile/views/AdminPanel.dart';
import 'package:provider/provider.dart';
import '../models/ChatMessage.dart';
import '../viewModels/MainChatViewModel.dart';

class MainChatPage extends StatefulWidget {
  const MainChatPage({super.key});

  @override
  State<MainChatPage> createState() => _MainChatPageState();
}

class _MainChatPageState extends State<MainChatPage> {
  late TextEditingController textEditingController;
  List<ChatMessage> chatHistory = [];

  @override
  void initState() {
    textEditingController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    textEditingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    double fontSizeScale = screenWidth / 400;

    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: AppColors.darkest,
              ),
              child: Column (
                  crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Menu',
                    style: TextStyle(
                      fontFamily: AppTextStyles.Manrope,
                      color: AppColors.purple,
                      fontSize: 26 * fontSizeScale,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.045),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AdminPanelPage()),
                      );
                    },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.purple,
                        padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.17, vertical: screenHeight * 0.011),
                      ),
                    child: Text('Admin Panel',
                    style: TextStyle(
                      fontFamily: AppTextStyles.Manrope,
                      color: Colors.white,
                      fontSize: 20 * fontSizeScale,
                      fontWeight: FontWeight.bold,
                    ),),
                  )
                ]
              )
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: Text('History',
                style: TextStyle(
                  fontFamily: AppTextStyles.Manrope,
                  fontWeight: FontWeight.bold,
                  fontSize: 17 * fontSizeScale,
                ),
              ),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            SizedBox(height: screenHeight * 0.61),
      const Divider(color: AppColors.purple, thickness: 3),
      Align(
        alignment: Alignment.bottomCenter,
        child: ListTile(
          leading: const Icon(Icons.account_circle),
          title: Text(
            'Profile',
            style: TextStyle(
              fontFamily: AppTextStyles.Manrope,
              fontWeight: FontWeight.bold,
              fontSize: 17 * fontSizeScale,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
          },
        ),
      ),
          ],
        ),
            ),


      body: SafeArea(
        child: Container(
          color: AppColors.darkest,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(top: 15, left: screenWidth * 0.03),
                child: Row(
                  children: [
                    Builder(
                        builder: (context) {
                          return InkWell(
                            onTap: () {
                              Scaffold.of(context).openDrawer();
                            },
                            child: Container(
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.purple
                              ),
                              padding: EdgeInsets.all(screenWidth * 0.035),
                              margin: EdgeInsets.only(right: screenWidth * 0.1),
                              child: const Icon(
                                Icons.menu,
                                color: Colors.white,
                              ),
                            ),
                          );
                        }
                    ),
                    Text(
                      'GENERATOR',
                      style: TextStyle(
                        fontFamily: 'Manrope-VariableFont_wght',
                        fontSize: 34 * fontSizeScale,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.purple,
                      ),
                      padding: EdgeInsets.all(screenWidth * 0.035),
                      margin: EdgeInsets.only(left: screenWidth * 0.1),
                      child: const Icon(
                        Icons.add,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: screenHeight * 0.05),
              Expanded(
                child: Container(
                  color: AppColors.darkest,
                  padding: const EdgeInsets.symmetric(horizontal: 10.0),
                  child: ListView.builder(
                    itemCount: chatHistory.length,
                    itemBuilder: (context, index) {
                      final showOnScreen = chatHistory[index];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.person,
                                color: Colors.white,
                                size: 30,
                              ),
                              Container(
                                constraints: BoxConstraints(maxWidth: screenWidth * 0.8),
                                margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                                padding: const EdgeInsets.all(10.0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15.0),
                                  color: AppColors.dark,
                                ),
                                child: Text(
                                  showOnScreen.question,
                                  style: TextStyle(
                                    fontFamily: 'Manrope-VariableFont_wght',
                                    color: Colors.white,
                                    fontSize: 20 * fontSizeScale,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(
                                Icons.chat,
                                color: Colors.white,
                                size: 30,
                              ),
                              Container(
                                constraints: BoxConstraints(maxWidth: screenWidth * 0.8),
                                margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                                padding: const EdgeInsets.all(10.0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15.0),
                                  color: const Color(0xFF424549),
                                ),
                                child: StreamBuilder<String>(
                                  stream: showOnScreen.response,
                                  builder: (context, snapshot) {
                                    return Text(
                                      snapshot.data ?? "",
                                      style: AppTextStyles.chatText(fontSizeScale)
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
              SizedBox(height: screenHeight * 0.01),
              Container(
                padding: const EdgeInsets.only(left: 10.0),
                margin: const EdgeInsets.only(left: 10.0, right: 10.0, bottom: 15.0, top: 15.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15.0),
                  color: AppColors.dark,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        style: TextStyle(
                          fontFamily: 'Manrope-VariableFont_wght',
                          color: Colors.white,
                          fontSize: 18 * fontSizeScale,
                          fontWeight: FontWeight.bold,
                        ),
                        controller: textEditingController,
                        onSubmitted: (message) async {
                          setState(() {
                            chatHistory.add(ChatMessage(question: message, response: null));
                          });
                          textEditingController.clear();

                          await context.read<MainChatViewModel>().sendPrompt(message);

                          setState(() {
                            chatHistory.last.response = context.read<MainChatViewModel>().getResponseStream();
                          });
                        },
                        decoration: const InputDecoration(
                          hintText: "Message",
                          hintStyle: TextStyle(
                            fontFamily: 'Manrope-VariableFont_wght',
                            color: Colors.grey,
                            backgroundColor: Color(0xFF424549),
                          ),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(
                        Icons.send,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

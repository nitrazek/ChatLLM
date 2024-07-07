import 'package:flutter/material.dart';
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
      body: SafeArea(
        child: Container(
          color: const Color(0xFF282B30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(top: 15, left: screenWidth * 0.03),
                child: Row(
                  children: [
                    InkWell(
                      onTap: () {
                        Scaffold.of(context).openDrawer();
                      },
                      child: Container(
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF7289da),
                        ),
                        padding: EdgeInsets.all(screenWidth * 0.035),
                        margin: EdgeInsets.only(right: screenWidth * 0.1),
                        child: const Icon(
                          Icons.menu,
                          color: Colors.white,
                        ),
                      ),
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
                        color: Color(0xFF7289da),
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
                  color:
                  const Color(0xFF282B30),
                  padding: const EdgeInsets.symmetric(horizontal: 10.0),
                  child: ListView.builder(
                    itemCount: chatHistory.length,
                    itemBuilder: (context, index) {
                      final showOnScreen = chatHistory[index];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.person,
                                  color: Colors.white,
                                  size: 30,
                                ),
                                Container(
                                  constraints: BoxConstraints(maxWidth: screenWidth * 0.8),
                                  margin: EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                                  padding: EdgeInsets.all(10.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(15.0),
                                    color: Color(0xFF424549),
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
                          ),
                          Container(
                              child: Row(
                              children: [
                              Icon(
                              Icons.chat,
                              color: Colors.white,
                              size: 30,
                          ),
                          Container(
                            constraints: BoxConstraints(maxWidth: screenWidth * 0.8),
                            margin: EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                            padding: EdgeInsets.all(10.0),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15.0),
                              color: Color(0xFF424549),
                            ),
                            child: StreamBuilder<String>(
                              stream: showOnScreen.response,
                              builder: (context, snapshot) {
                                return Text(
                                  snapshot.data ?? "",
                                  style: TextStyle(
                                    fontFamily: 'Manrope-VariableFont_wght',
                                    color: Colors.white,
                                    fontSize: 20 * fontSizeScale,
                                    fontWeight: FontWeight.bold,
                                  ),
                                );
                              },
                            ),
                          ),
                      ],
                      ),
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
                margin: EdgeInsets.only(left: 10.0, right: 10.0, bottom: 15.0, top: 15.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15.0),
                  color: Color(0xFF424549),
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

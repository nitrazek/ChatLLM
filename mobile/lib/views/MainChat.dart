import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewModels/MainChatViewModel.dart';

class MainChatPage extends StatefulWidget {
  const MainChatPage({super.key});

  @override
  State<MainChatPage> createState() => _MainChatPageState();
}

class _MainChatPageState extends State<MainChatPage> {

  final bool _isTyping = false;
  late TextEditingController textEditingController;
  List<Stream<String>> responseStreams = [];

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

    double baseWidth = 350.0;
    double fontSizeScale = screenWidth / baseWidth;

    String? response = context
        .watch<MainChatViewModel>()
        .response;
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Color(0xFF282B30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(top: 15, left: 10, right: 10),
                child: Expanded(
                  child: Row(
                    children: [
                      InkWell(
                        onTap: () {
                          Scaffold.of(context).openDrawer();
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xFF0099FF),
                          ),
                          padding: EdgeInsets.all(12),
                          child: Icon(
                            Icons.menu,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      SizedBox(width: screenWidth * 0.13),
                       Text(
                        'GENERATOR',
                        style: TextStyle(
                          fontFamily: 'Manrope-VariableFont_wght',
                          fontSize: 28 * fontSizeScale,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: screenWidth * 0.13),
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF0099FF),
                        ),
                        padding: EdgeInsets.all(12),
                        child: Icon(
                          Icons.add,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 50,),
              Expanded(
              child: Container(
                color: Color(0xFF282B30),
                padding: const EdgeInsets.symmetric(horizontal: 10.0),
                child: ListView.builder(
                  itemCount: responseStreams.length,
                  itemBuilder: (context, index) {
                    return Container(
                      margin: EdgeInsets.symmetric(vertical: 10.0, horizontal: 10.0),
                      padding: EdgeInsets.all(10.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(15.0),
                        color: Color(0xFF424549),
                    ),
                    child: StreamBuilder<String>(
                      stream: responseStreams[index],
                      builder:(context, snapshot) {
                        return Text(
                        snapshot.data ?? "",
                        style: TextStyle(
                          fontFamily: 'Manrope-VariableFont_wght',
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                          );
                      }
                    ),
                    );
                  }
              ),
              ),
              ),
             // Expanded(child: Container()),
              SizedBox(height: 50,),
              Container(
                padding: const EdgeInsets.only(left: 10.0),
                margin: EdgeInsets.only(left: 10.0, right: 10.0, bottom: 15.0),
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
                          ),
                          controller: textEditingController,
                          onSubmitted: (message) async {
                            await context.read<MainChatViewModel>().sendPrompt(
                                textEditingController.text
                            );
                            setState(() {
                              responseStreams.add(context.read<MainChatViewModel>().getResponseStream());
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
                            // contentPadding: EdgeInsets.symmetric(vertical: 10.0)
                          ),
                        )
                    ),
                    IconButton(
                        onPressed: () {},
                        icon: const Icon(
                          Icons.send,
                          color: Colors.grey,
                        ))
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

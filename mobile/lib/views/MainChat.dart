import 'package:flutter/material.dart';

class MainChatPage extends StatefulWidget {
  const MainChatPage({super.key});

  @override
  State<MainChatPage> createState() => _MainChatPageState();
}

class _MainChatPageState extends State<MainChatPage> {

  final bool _isTyping = false;
  late TextEditingController textEditingController;

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

    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Color(0xFF282B30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(top: 15, left: 10, right: 10),
                child: Expanded (
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
                    SizedBox(width: MediaQuery.of(context).size.width * 0.1),
                    const Text(
                      'GENERATOR',
                      style: TextStyle(
                        fontFamily: 'Manrope-VariableFont_wght',
                        fontSize: 31,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: MediaQuery.of(context).size.width * 0.1),
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
              Flexible(
                  child: ListView.builder(
                    itemCount: 6,
                      itemBuilder: (context, index){
                      return const Text(
                        "This is text",
                      );
                      }
                  )
              ),
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
                        onSubmitted: (message) {

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

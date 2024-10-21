import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:mobile/states/ChatState.dart';
import 'package:mobile/views/Login.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart'
    show MarkdownStyleSheet, MarkdownBody;
import 'package:showcaseview/showcaseview.dart';
import '../models/Chat.dart';
import 'ChatDialog.dart';
import '../viewModels/MainChatViewModel.dart';
import '../models/Styles.dart';

class MainChatPage extends StatefulWidget {
  const MainChatPage({super.key});

  @override
  State<MainChatPage> createState() => _MainChatPageState();
}

class _MainChatPageState extends State<MainChatPage> {
  late TextEditingController textEditingController;
  final ScrollController scrollController = ScrollController();
  final ScrollController scrollController2 = ScrollController();
  List<Chat> chatList = [];
  final GlobalKey _one = GlobalKey();

  bool chatForm = false;
  bool isUsingOnlyKnowledgeBase = false;

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => ShowCaseWidget.of(context).startShowCase([_one]));
    textEditingController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    textEditingController.dispose();
    scrollController.dispose();
    scrollController2.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    fetchChatList();
    super.didChangeDependencies();
  }

  Future<void> fetchChatList() async {
    final fetchedChats = await context.read<MainChatViewModel>().getChatList();
    if (mounted) {
      setState(() {
        chatList = fetchedChats;
        bool isChatNull = ChatState.currentChat == null;
        if (chatList.isNotEmpty && isChatNull) {
          context.read<MainChatViewModel>().setChat(chatList.last);
          context.read<MainChatViewModel>().loadHistory();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    double fontSizeScale = screenWidth * 0.0028;

    return PopScope(
        child: ScreenUtilInit(
            designSize: const Size(411, 707),
            minTextAdapt: true,
            builder: (context, child) {
              return Scaffold(
                drawer: Drawer(
                  width: 270.w,
                  backgroundColor: AppColors.darkest,
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      return Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Container(
                            width: 270.w,
                            height: 200.h,
                            child: DrawerHeader(
                              padding: EdgeInsets.only(
                                right: 5.w,
                                left: 5.w,
                                top: 5.h,
                              ),
                              decoration: const BoxDecoration(
                                color: AppColors.theDarkest,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: EdgeInsets.only(
                                      left: 5.w,
                                    ),
                                    child: Text(
                                      'Menu',
                                      style: TextStyle(
                                        fontFamily: AppTextStyles.Manrope,
                                        color: AppColors.purple,
                                        fontSize: 30.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    width: 230.w,
                                    height: 50.h,
                                    margin: EdgeInsets.only(
                                      left: 15,
                                      right: 15,
                                      top: 40.h,
                                    ),
                                    child: ElevatedButton(
                                      onPressed: () {},
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.purple,
                                      ),
                                      child: Text(
                                        'Panel Admina',
                                        style: TextStyle(
                                          fontFamily: AppTextStyles.Andada,
                                          color: Colors.white,
                                          fontSize: 20.sp,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Container(
                            color: AppColors.darkest,
                            height: 62.5.h,
                            child: Center(
                              child: ListTile(
                                leading: Icon(
                                  Icons.history,
                                  color: Colors.white,
                                  size: 30.sp,
                                ),
                                title: Text(
                                  'Historia czatów',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontFamily: AppTextStyles.Andada,
                                      fontSize: 21.sp),
                                ),
                                onTap: () {
                                  setState(() {
                                    context
                                            .read<MainChatViewModel>()
                                            .isChatListVisible =
                                        !context
                                            .read<MainChatViewModel>()
                                            .isChatListVisible;
                                  });
                                },
                              ),
                            ),
                          ),
                          Divider(
                              color: AppColors.purple,
                              thickness: 3,
                              height: 1.h),
                          AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              height: context
                                      .read<MainChatViewModel>()
                                      .isChatListVisible
                                  ? context
                                      .read<MainChatViewModel>()
                                      .chatListHeight
                                      .h
                                  : 0,
                              color: AppColors.dark,
                              child: context
                                      .read<MainChatViewModel>()
                                      .isChatListVisible
                                  ? ListView.builder(
                                      padding: EdgeInsets.only(top: 10.h),
                                      shrinkWrap: true,
                                      itemCount: chatList.length,
                                      controller: scrollController2,
                                      itemBuilder: (context, index) {
                                        final chat = chatList[index];
                                        chat.name ??= " ";
                                        return Container(
                                            decoration: const BoxDecoration(
                                              color: AppColors.theDarkest,
                                              border: Border(
                                                bottom: BorderSide(
                                                    color: Colors.white,
                                                    width: 1.0),
                                              ),
                                            ),
                                            margin: EdgeInsets.all(5.h),
                                            child: ListTile(
                                              leading: const Icon(
                                                Icons.chat,
                                                color: Colors.white,
                                              ),
                                              title: Text(
                                                chat.name!,
                                                style: TextStyle(
                                                  color: Colors.white,
                                                  fontFamily:
                                                      AppTextStyles.Andada,
                                                  fontSize: 18.sp,
                                                ),
                                              ),
                                              trailing: const Icon(
                                                Icons.arrow_forward,
                                                color: Colors.white,
                                              ),
                                              onTap: () async {
                                                final tempChat =
                                                    ChatState.currentChat;
                                                context
                                                    .read<MainChatViewModel>()
                                                    .setChat(chat);
                                                bool? isLoaded = await context
                                                    .read<MainChatViewModel>()
                                                    .loadHistory();
                                                if (isLoaded) {
                                                  ChatState.isArchival = true;
                                                  Navigator.pushReplacement(
                                                      context,
                                                      MaterialPageRoute(
                                                          builder: (context) =>
                                                              ShowCaseWidget(
                                                                builder:
                                                                    (context) =>
                                                                        MainChatPage(),
                                                              )));
                                                } else {
                                                  if (tempChat != null)
                                                    context
                                                        .read<
                                                            MainChatViewModel>()
                                                        .setChat(tempChat);
                                                }
                                              },
                                            ));
                                      },
                                    )
                                  : null),
                          Divider(
                              color: AppColors.purple,
                              thickness: 3,
                              height: 1.h),
                          Container(
                            height: 62.5.h,
                            child: Expanded(
                              child: Align(
                                alignment: Alignment.bottomLeft,
                                child: Center(
                                  child: ListTile(
                                    leading: Icon(Icons.account_circle,
                                        color: Colors.white, size: 30.sp),
                                    title: Text(
                                      'Ustawienia',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontFamily: AppTextStyles.Manrope,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 21.sp,
                                      ),
                                    ),
                                    onTap: () {
                                      setState(() {
                                        context
                                                .read<MainChatViewModel>()
                                                .setting =
                                            !context
                                                .read<MainChatViewModel>()
                                                .setting;
                                        context
                                            .read<MainChatViewModel>()
                                            .setChatListHeight();
                                      });
                                    },
                                  ),
                                ),
                              ),
                            ),
                          ),
                          AnimatedContainer(
                              duration: Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              height: context.read<MainChatViewModel>().setting
                                  ? 60.h
                                  : 0,
                              color: AppColors.dark,
                              child: context.read<MainChatViewModel>().setting
                                  ? Container(
                                      height: 62.5.h,
                                      child: Expanded(
                                        child: Align(
                                          alignment: Alignment.bottomLeft,
                                          child: Center(
                                            child: ListTile(
                                              leading: Icon(Icons.logout,
                                                  color: Colors.white,
                                                  size: 30.sp),
                                              title: Text(
                                                'Wyloguj się',
                                                style: TextStyle(
                                                  color: Colors.white,
                                                  fontFamily:
                                                      AppTextStyles.Andada,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 21.sp,
                                                ),
                                              ),
                                              onTap: () {
                                                MainChatViewModel.logOut();
                                                Navigator.pushReplacement(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (context) =>
                                                          const LoginPage()),
                                                );
                                              },
                                            ),
                                          ),
                                        ),
                                      ),
                                    )
                                  : null),
                        ],
                      );
                    },
                  ),
                ),
                body: SafeArea(
                  child: Container(
                    color: AppColors.darkest,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: EdgeInsets.only(top: 15.h, left: 15.w),
                          child: Row(
                            children: [
                              Builder(builder: (context) {
                                return InkWell(
                                  onTap: () {
                                    Scaffold.of(context).openDrawer();
                                  },
                                  child: Container(
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.purple,
                                    ),
                                    padding: EdgeInsets.all(16.w),
                                    margin: EdgeInsets.only(
                                      left: 10.w,
                                    ),
                                    child: const Icon(
                                      Icons.menu,
                                      color: Colors.white,
                                    ),
                                  ),
                                );
                              }),
                              Container(
                                margin:
                                    EdgeInsets.only(right: 50.w, left: 50.w),
                                child: Text(
                                  'CREATOR',
                                  style: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
                                      color: Colors.white,
                                      fontSize: 35.sp),
                                ),
                              ),
                              Builder(builder: (context) {
                                return Stack(children: [
                                  chatList.isEmpty &&
                                          context
                                              .watch<MainChatViewModel>()
                                              .chatMessages
                                              .isEmpty
                                      ? Showcase(
                                          targetBorderRadius:
                                              BorderRadius.circular(35),
                                          key: _one,
                                          description: 'Stwórz',
                                          child: InkWell(
                                            onTap: () async {
                                              await showDialog(
                                                context: context,
                                                builder:
                                                    (BuildContext context) {
                                                  return ChatDialog();
                                                },
                                              );
                                              context
                                                  .read<MainChatViewModel>()
                                                  .chatMessages
                                                  .clear();
                                              Navigator.pushReplacement(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (context) =>
                                                          ShowCaseWidget(
                                                            builder: (context) =>
                                                                MainChatPage(),
                                                          )));
                                            },
                                            child: Container(
                                              decoration: const BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: AppColors.purple,
                                              ),
                                              padding: EdgeInsets.all(16.w),
                                              child: const Icon(
                                                Icons.add,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        )
                                      : InkWell(
                                          onTap: () async {
                                            bool? isCreated = await showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return ChatDialog();
                                              },
                                            );
                                            if (isCreated == true) {
                                              context
                                                  .read<MainChatViewModel>()
                                                  .chatMessages
                                                  .clear();
                                              Navigator.pushReplacement(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (context) =>
                                                          ShowCaseWidget(
                                                            builder: (context) =>
                                                                MainChatPage(),
                                                          )));
                                            }
                                          },
                                          child: Container(
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: AppColors.purple,
                                            ),
                                            padding: EdgeInsets.all(16.w),
                                            child: const Icon(
                                              Icons.add,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                ]);
                              })
                            ],
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.05),
                        Expanded(
                          child: Container(
                              color: AppColors.darkest,
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 10.0),
                              child: ListView.builder(
                                itemCount: context
                                    .watch<MainChatViewModel>()
                                    .chatMessages
                                    .length,
                                controller: scrollController,
                                itemBuilder: (context, index) {
                                  final chatMessage = context
                                      .watch<MainChatViewModel>()
                                      .chatMessages[index];
                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      if (chatMessage.sender == "human")
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.person,
                                              color: Colors.white,
                                              size: 30,
                                            ),
                                            Container(
                                              constraints: BoxConstraints(
                                                  maxWidth: screenWidth * 0.8),
                                              margin:
                                                  const EdgeInsets.symmetric(
                                                      vertical: 5.0,
                                                      horizontal: 10.0),
                                              padding:
                                                  const EdgeInsets.all(10.0),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(15.0),
                                                color: AppColors.dark,
                                              ),
                                              child: Text(
                                                  chatMessage.sender == 'human'
                                                      ? chatMessage.content
                                                      : "",
                                                  style: AppTextStyles.chatText(
                                                      fontSizeScale, 20)),
                                            ),
                                          ],
                                        ),
                                      if (chatMessage.sender != "human")
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.chat,
                                              color: Colors.white,
                                              size: 30,
                                            ),
                                            Container(
                                              constraints: BoxConstraints(
                                                  maxWidth: screenWidth * 0.8),
                                              margin:
                                                  const EdgeInsets.symmetric(
                                                      vertical: 5.0,
                                                      horizontal: 10.0),
                                              padding:
                                                  const EdgeInsets.all(10.0),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(15.0),
                                                color: const Color(0xFF424549),
                                              ),
                                              child: ChatState.isArchival
                                                  ? StreamBuilder<String>(
                                                      stream: chatMessage
                                                          .responseStream,
                                                      builder:
                                                          (context, snapshot) {
                                                        if (mounted) {
                                                          scrollController.animateTo(
                                                              scrollController
                                                                  .position
                                                                  .maxScrollExtent,
                                                              duration:
                                                                  const Duration(
                                                                      milliseconds:
                                                                          300),
                                                              curve: Curves
                                                                  .easeOut);
                                                        }
                                                        if (snapshot.hasError) {
                                                          return Text(
                                                              'Error: ${snapshot.error}');
                                                        }

                                                        final data = snapshot
                                                                .data ??
                                                            chatMessage.content;

                                                        return MarkdownBody(
                                                          data: data,
                                                          styleSheet:
                                                              MarkdownStyleSheet(
                                                            p: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    20),
                                                            a: AppTextStyles
                                                                    .chatText(
                                                                        fontSizeScale,
                                                                        20)
                                                                .copyWith(
                                                                    decoration:
                                                                        TextDecoration
                                                                            .underline),
                                                            strong: AppTextStyles
                                                                    .chatText(
                                                                        fontSizeScale,
                                                                        20)
                                                                .copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold),
                                                            em: AppTextStyles
                                                                    .chatText(
                                                                        fontSizeScale,
                                                                        20)
                                                                .copyWith(
                                                                    fontStyle:
                                                                        FontStyle
                                                                            .italic),
                                                            h1: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    34),
                                                            h2: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    30),
                                                            h3: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    26),
                                                            code: AppTextStyles
                                                                    .chatText(
                                                                        fontSizeScale,
                                                                        20)
                                                                .copyWith(
                                                                    fontFamily:
                                                                        'monospace',
                                                                    backgroundColor:
                                                                        Colors.grey[
                                                                            400]),
                                                          ),
                                                        );
                                                      },
                                                    )
                                                  : MarkdownBody(
                                                      data: chatMessage.content,
                                                      styleSheet:
                                                          MarkdownStyleSheet(
                                                        p: AppTextStyles
                                                            .chatText(
                                                                fontSizeScale,
                                                                20),
                                                        a: AppTextStyles.chatText(
                                                                fontSizeScale,
                                                                20)
                                                            .copyWith(
                                                                decoration:
                                                                    TextDecoration
                                                                        .underline),
                                                        strong: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    20)
                                                            .copyWith(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold),
                                                        em: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    20)
                                                            .copyWith(
                                                                fontStyle:
                                                                    FontStyle
                                                                        .italic),
                                                        h1: AppTextStyles
                                                            .chatText(
                                                                fontSizeScale,
                                                                34),
                                                        h2: AppTextStyles
                                                            .chatText(
                                                                fontSizeScale,
                                                                30),
                                                        h3: AppTextStyles
                                                            .chatText(
                                                                fontSizeScale,
                                                                26),
                                                        code: AppTextStyles
                                                                .chatText(
                                                                    fontSizeScale,
                                                                    20)
                                                            .copyWith(
                                                                fontFamily:
                                                                    'monospace',
                                                                backgroundColor:
                                                                    Colors.grey[
                                                                        400]),
                                                      ),
                                                    ),
                                            ),
                                          ],
                                        ),
                                    ],
                                  );
                                },
                              )),
                        ),
                        SizedBox(height: screenHeight * 0.01),
                        Container(
                          padding: const EdgeInsets.only(left: 10.0),
                          margin: const EdgeInsets.only(
                              left: 10.0, right: 10.0, bottom: 15.0, top: 15.0),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(15.0),
                            color: AppColors.dark,
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  readOnly: ChatState.currentChat == null,
                                  style:
                                      AppTextStyles.chatText(fontSizeScale, 18),
                                  controller: textEditingController,
                                  onSubmitted: (message) async {
                                    if (textEditingController
                                        .text.isNotEmpty) {
                                      context
                                        .read<MainChatViewModel>()
                                        .sendPrompt(message);
                                    }
                                    textEditingController.clear();
                                  },
                                  decoration: const InputDecoration(
                                    hintText: "Message",
                                    hintStyle: TextStyle(
                                      fontFamily: AppTextStyles.Manrope,
                                      color: Colors.grey,
                                      backgroundColor: Color(0xFF424549),
                                    ),
                                    border: InputBorder.none,
                                  ),
                                ),
                              ),
                              context.watch<MainChatViewModel>().isLoading
                                  ? IconButton(
                                      onPressed: () {
                                        context
                                            .read<MainChatViewModel>()
                                            .cancelAnswer();
                                      },
                                      icon: const Icon(Icons.stop,
                                          color: Colors.grey),
                                    )
                                  : IconButton(
                                      onPressed: () {
                                        if (textEditingController
                                            .text.isNotEmpty) {
                                          final message =
                                              textEditingController.text;
                                          context
                                              .read<MainChatViewModel>()
                                              .sendPrompt(message);
                                          textEditingController.clear();
                                        }
                                      },
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
            }));
  }
}

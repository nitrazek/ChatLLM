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
  late ScrollController scrollController;
  late ScrollController scrollController2;
  bool hasToScroll = true;

  List<Chat> chatList = [];
  final GlobalKey _one = GlobalKey();

  bool chatForm = false;
  bool isUsingOnlyKnowledgeBase = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    textEditingController = TextEditingController();
    scrollController = ScrollController();
    scrollController2 = ScrollController();
    Future.delayed(Duration.zero, () {
      FocusScope.of(context).requestFocus(FocusNode());
    });
    fetchChatList();
    super.initState();
  }

  @override
  void dispose() {
    textEditingController.dispose();
    scrollController.dispose();
    scrollController2.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  Future<void> fetchChatList() async {
    final fetchedChats = await context.read<MainChatViewModel>().getChatList();
    if (mounted) {
      setState(() {
        chatList = fetchedChats;
        bool isChatNull = ChatState.currentChat == null;
        if (chatList.isNotEmpty && isChatNull) {
          chatList.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

          final latestChat = chatList.first;
          context.read<MainChatViewModel>().setChat(latestChat);
          context.read<MainChatViewModel>().loadHistory();
        } else if (isChatNull) {
          ShowCaseWidget.of(context).startShowCase([_one]);
        }
      });
    }
  }

  double getScrollDown() {
    if (scrollController.hasClients &&
        scrollController.position.hasContentDimensions) {
      return scrollController.position.maxScrollExtent;
    }
    return 0;
  }

  void _scrollDown() {
    if (hasToScroll) {
      scrollController.animateTo(
        getScrollDown(),
        duration: Duration(milliseconds: 200),
        curve: Curves.fastOutSlowIn,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

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
                            height: 120.h,
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
                                      top: 10.w,
                                      left: 5.w,
                                    ),
                                    child: Text(
                                      'Menu',
                                      style: TextStyle(
                                        fontFamily: AppTextStyles.Manrope,
                                        color: AppColors.purple,
                                        fontSize: 40.sp,
                                        fontWeight: FontWeight.bold,
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
                                                hasToScroll = true;
                                                if (isLoaded) {
                                                  ChatState.isArchival = true;
                                                  Scaffold.of(context)
                                                      .closeDrawer();
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
                                                context
                                                    .read<MainChatViewModel>()
                                                    .logOut();
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
                                              fetchChatList();
                                              context
                                                  .read<MainChatViewModel>()
                                                  .chatMessages
                                                  .clear();
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
                                              fetchChatList();
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
                          child: Listener(
                              onPointerMove: (event) {
                                if (event.delta.dy != 0) {
                                  hasToScroll = false;
                                }
                              },
                              child: Container(
                                  color: AppColors.darkest,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10.0),
                                  child: ListView.builder(
                                    itemCount: context
                                        .watch<MainChatViewModel>()
                                        .chatMessages
                                        .length,
                                    controller: scrollController,
                                    itemBuilder: (context, index) {
                                      _scrollDown();
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
                                                      maxWidth:
                                                          screenWidth * 0.8),
                                                  margin: const EdgeInsets
                                                      .symmetric(
                                                      vertical: 5.0,
                                                      horizontal: 10.0),
                                                  padding: const EdgeInsets.all(
                                                      10.0),
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            15.0),
                                                    color: AppColors.dark,
                                                  ),
                                                  child: SelectableText(
                                                    chatMessage.sender ==
                                                            'human'
                                                        ? chatMessage.content
                                                        : "",
                                                    style: TextStyle(
                                                        fontFamily:
                                                            AppTextStyles
                                                                .Andada,
                                                        color: Colors.white,
                                                        fontSize: 22.sp),
                                                  ),
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
                                                      maxWidth:
                                                          screenWidth * 0.8),
                                                  margin: const EdgeInsets
                                                      .symmetric(
                                                      vertical: 5.0,
                                                      horizontal: 10.0),
                                                  padding: const EdgeInsets.all(
                                                      10.0),
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            15.0),
                                                    color:
                                                        const Color(0xFF424549),
                                                  ),
                                                  child: !ChatState.isArchival
                                                      ? StreamBuilder<String>(
                                                          stream: chatMessage
                                                              .responseStream,
                                                          builder: (context,
                                                              snapshot) {
                                                            if (snapshot
                                                                .hasError) {
                                                              return Text(
                                                                  'Error: ${snapshot.error}');
                                                            }

                                                            final data =
                                                                snapshot.data ??
                                                                    chatMessage
                                                                        .content;

                                                            return MarkdownBody(
                                                              selectable: true,
                                                              data: data,
                                                              styleSheet:
                                                                  MarkdownStyleSheet(
                                                                p: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        21.sp),
                                                                a: TextStyle(
                                                                        fontFamily:
                                                                            AppTextStyles
                                                                                .Andada,
                                                                        color: Colors
                                                                            .white,
                                                                        fontSize: 22
                                                                            .sp)
                                                                    .copyWith(
                                                                        decoration:
                                                                            TextDecoration.underline),
                                                                strong: TextStyle(
                                                                        fontFamily:
                                                                            AppTextStyles
                                                                                .Andada,
                                                                        color: Colors
                                                                            .white,
                                                                        fontSize: 22
                                                                            .sp)
                                                                    .copyWith(
                                                                        fontWeight:
                                                                            FontWeight.bold),
                                                                em: TextStyle(
                                                                        fontFamily:
                                                                            AppTextStyles
                                                                                .Andada,
                                                                        color: Colors
                                                                            .white,
                                                                        fontSize: 22
                                                                            .sp)
                                                                    .copyWith(
                                                                        fontStyle:
                                                                            FontStyle.italic),
                                                                h1: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        22.sp),
                                                                h2: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        24.sp),
                                                                h3: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        26.sp),
                                                                code: TextStyle(
                                                                        fontFamily:
                                                                            AppTextStyles
                                                                                .Andada,
                                                                        color: Colors
                                                                            .white,
                                                                        fontSize: 21
                                                                            .sp)
                                                                    .copyWith(
                                                                        fontFamily:
                                                                            'monospace',
                                                                        backgroundColor:
                                                                            Colors.grey[400]),
                                                              ),
                                                            );
                                                          },
                                                        )
                                                      : MarkdownBody(
                                                    selectable: true,
                                                          data: chatMessage
                                                              .content,
                                                          styleSheet:
                                                              MarkdownStyleSheet(
                                                            p: TextStyle(
                                                                fontFamily:
                                                                    AppTextStyles
                                                                        .Andada,
                                                                color: Colors
                                                                    .white,
                                                                fontSize:
                                                                    21.sp),
                                                            a: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        22.sp)
                                                                .copyWith(
                                                                    decoration:
                                                                        TextDecoration
                                                                            .underline),
                                                            strong: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        22.sp)
                                                                .copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold),
                                                            em: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        22.sp)
                                                                .copyWith(
                                                                    fontStyle:
                                                                        FontStyle
                                                                            .italic),
                                                            h1: TextStyle(
                                                                fontFamily:
                                                                    AppTextStyles
                                                                        .Andada,
                                                                color: Colors
                                                                    .white,
                                                                fontSize:
                                                                    22.sp),
                                                            h2: TextStyle(
                                                                fontFamily:
                                                                    AppTextStyles
                                                                        .Andada,
                                                                color: Colors
                                                                    .white,
                                                                fontSize:
                                                                    24.sp),
                                                            h3: TextStyle(
                                                                fontFamily:
                                                                    AppTextStyles
                                                                        .Andada,
                                                                color: Colors
                                                                    .white,
                                                                fontSize:
                                                                    26.sp),
                                                            code: TextStyle(
                                                                    fontFamily:
                                                                        AppTextStyles
                                                                            .Andada,
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        21.sp)
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
                                  ))),
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
                                  focusNode: _focusNode,
                                  readOnly: ChatState.currentChat == null ||
                                      context
                                          .watch<MainChatViewModel>()
                                          .isLoading,
                                  style: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
                                      color: Colors.white,
                                      fontSize: 20.sp),
                                  controller: textEditingController,
                                  onSubmitted: (message) async {
                                    if (textEditingController.text.isNotEmpty) {
                                      textEditingController.clear();
                                    }
                                    hasToScroll = true;
                                    bool hasName = await context
                                        .read<MainChatViewModel>()
                                        .sendPrompt(message);

                                    if (hasName) {
                                      setState(() {
                                        for (int i = 0;
                                            i < chatList.length;
                                            i++) {
                                          if (chatList[i].id ==
                                              ChatState.currentChat!.id) {
                                            chatList[i].name =
                                                ChatState.currentChat!.name;
                                            break;
                                          }
                                        }
                                      });
                                    }
                                  },
                                  decoration: const InputDecoration(
                                    hintText: "Message",
                                    hintStyle: TextStyle(
                                      fontFamily: AppTextStyles.Andada,
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
                                      onPressed: () async {
                                        if (textEditingController
                                            .text.isNotEmpty) {
                                          final message =
                                              textEditingController.text;
                                          textEditingController.clear();
                                          hasToScroll = true;
                                          bool hasName = await context
                                              .read<MainChatViewModel>()
                                              .sendPrompt(message);

                                          if (hasName) {
                                            setState(() {
                                              for (int i = 0;
                                                  i < chatList.length;
                                                  i++) {
                                                if (chatList[i].id ==
                                                    ChatState.currentChat!.id) {
                                                  chatList[i].name = ChatState
                                                      .currentChat!.name;
                                                  break;
                                                }
                                              }
                                            });
                                          }
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

import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Oval } from 'react-loader-spinner';
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import NewChatPopup from './NewChatPopup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStop } from "@fortawesome/free-solid-svg-icons"
import { Toast, toast } from 'primereact/toast';
import { useLocation } from 'react-router-dom';


function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showNewChatPopup, setShowNewChatPopup] = useState(false);
  const role = Cookies.get("userRole");
  const mainTopRef = useRef(null);
  const controller = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userToken = Cookies.get("userToken");

  const [chatsListPage, setChatsListPage] = useState(1);
  const [messagesListPage, setMessagesListPage] = useState(1);

  const [nextChatsListPage, setNextChatsListPage] = useState(null);
  const [nextMessagesListPage, setNextMessagesListPage] = useState(null);


  const serverUrl = process.env.OLLAMA_URL || 'http://localhost:3000';

  const toast = useRef(null);

  useEffect(() => {
    if (!userToken) {
      navigate('/');
    }
    if (location.state?.toast) {
      toast.current.show(location.state.toast);
    }
  }, [location.state]);

  const handleLogout = async () => {
    Cookies.remove("userToken");
    Cookies.remove("userName");
    Cookies.remove("userRole");
    navigate("/");
  };

  const handleAdminPanelButton = async () => {
    navigate("/admin");
  }

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/v1/chats/list?page=${chatsListPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      console.log(data.chats);
      if (chatsListPage == 1) {
        setChatHistory(data.chats);
      }
      else {
        setChatHistory(prevChats => [data.chats, ...prevChats]);
      }
      setNextChatsListPage(data.pagination.nextPage || null);
    } catch (error) {
      alert(error.message);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      fromUser: true,
      user: { name: Cookies.get('userName'), avatar: "/avatars/user.png" }
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLastUserMessage(userMessage);
    setInput('');
    setIsLoading(true);
    controller.current = new AbortController();

    let botMessage = {
      id: messages.length + 2,
      text: '',
      fromUser: false,
      user: { name: "Bot", avatar: "/avatars/bot.png" }
    };

    setMessages(prevMessages => [...prevMessages, botMessage]);

    let buffer = "";

    try {
      const response = await fetch(`${serverUrl}/api/v1/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: input }),
        signal: controller.current.signal
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const reader = response.body.getReader();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false);
          setIsGeneratingAnswer(false);
          buffer = "";
          return;
        }

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        console.log(buffer);
        while (buffer) {
          try {
            const jsonEndIndex = buffer.indexOf("}{");
            if (jsonEndIndex !== -1) {
              const jsonString = buffer.slice(0, jsonEndIndex + 1);
              const parsedChunk = JSON.parse(jsonString);
              buffer = buffer.slice(jsonEndIndex + 1);
              console.log(jsonString);
              const answer = parsedChunk.answer;
              accumulatedText += answer;

              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const botIndex = updatedMessages.findIndex(msg => msg.id === botMessage.id);

                if (botIndex !== -1) {
                  updatedMessages[botIndex].text = accumulatedText;
                }

                if (mainTopRef.current) {
                  mainTopRef.current.lastChild.scrollIntoView({ behavior: 'smooth' });
                }

                return updatedMessages;
              });

              setIsGeneratingAnswer(true);

              if (parsedChunk.newChatName) {
                setChatHistory(prevHistory => {
                  const updatedHistory = prevHistory.map(chat => {
                    const isMatch = chat.id == chatId;
                    return isMatch ? { ...chat, name: parsedChunk.newChatName } : chat;
                  });
                  return updatedHistory;
                });
              }
            } else {
              const parsedChunk = JSON.parse(buffer);
              buffer = "";

              const answer = parsedChunk.answer;
              accumulatedText += answer;

              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const botIndex = updatedMessages.findIndex(msg => msg.id === botMessage.id);

                if (botIndex !== -1) {
                  updatedMessages[botIndex].text = accumulatedText;
                }

                if (mainTopRef.current) {
                  mainTopRef.current.lastChild.scrollIntoView({ behavior: 'smooth' });
                }

                return updatedMessages;
              });

              setIsGeneratingAnswer(true);

              if (parsedChunk.newChatName) {
                setChatHistory(prevHistory => {
                  const updatedHistory = prevHistory.map(chat => {
                    const isMatch = chat.id == chatId;
                    return isMatch ? { ...chat, name: parsedChunk.newChatName } : chat;
                  });
                  return updatedHistory;
                });
              }
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              break;
            }
            console.error("Unexpected error:", e);
            throw e;
          }
        }
      }

    } catch (error) {
      setIsLoading(false);
      setIsGeneratingAnswer(false);
      controller.current = null;
      if (error.name !== "AbortError")
        alert(error.message);
    }
  };


  const cancelAnswer = (e) => {
    if (controller.current) controller.current.abort();
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (mainTopRef.current) {
      mainTopRef.current.scrollTop = mainTopRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!chatId) return;
  
    try {
      // Zapisz aktualną pozycję scrolla przed pobraniem nowych wiadomości
      const scrollContainer = mainTopRef.current;
      const previousScrollHeight = scrollContainer?.scrollHeight || 0;
      const previousScrollTop = scrollContainer?.scrollTop || 0;
  
      const response = await fetch(
        `${serverUrl}/api/v1/chats/${chatId}?limit=10&page=${messagesListPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 401) {
        handleLogout();
        return;
      }
  
      const data = await response.json();
      setNextMessagesListPage(data.pagination.nextPage || null);
  
      let formattedMessages = [];
      if (data.messages.length > 0) {
        formattedMessages = data.messages
          .sort((a, b) => a.id - b.id)
          .map(msg => ({
            id: msg.id,
            user: {
              name: msg.sender === 'human' ? `${Cookies.get('userName')}` : 'Bot',
              avatar: msg.sender === 'human' ? '/avatars/user.png' : '/avatars/bot.png',
            },
            fromUser: msg.sender === 'human',
            text: msg.content,
          }));
      }
  
      // Aktualizujemy stan wiadomości (doklejamy na górę)
      setMessages(prevMessages => [...formattedMessages, ...prevMessages]);
  
      // Przywracamy poprzednią pozycję scrolla po aktualizacji DOM
      setTimeout(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
        }
      }, 0);
    } catch (error) {
      alert(error.message);
    }
  };
  
  
  
  
  const handleMoreMessages = () => {
    setMessagesListPage(prevPage => prevPage + 1);
  };
  

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [messagesListPage]);

  return (
    <div className="App">
      <Toast ref={toast} />
      {showNewChatPopup && <NewChatPopup />}
      <div className="sideBar">
        <div className="generatorContainer">
          <div className="upperSideTop">Baza wiedzy</div>
          <button className="button" onClick={() => setShowNewChatPopup(true)}>Rozpocznij nowy czat</button>
        </div>
        <div className="upperSide">
          <span className="chatHistorySpan">Historia czatów:</span>
          <div className="upperSideBottom">
            <ul className="chatHistory" style={{ textAlign: "center", alignContent: "center" }}>
              {chatHistory.length > 0 && (
                chatHistory
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((chat) => (
                    <li key={chat.id}>
                      <button className={chat.id == chatId ? "activeChatHistoryButton" : "chatHistoryButton"} onClick={() => navigate(`/chat/${chat.id}`)}>
                        {chat.name || "Nowy czat"}
                      </button>
                    </li>
                  ))
              )}
            </ul>

          </div>
        </div>
        <div className="lowerSide">
          {(role == "admin" || role == "superadmin") && <button className="button" onClick={handleAdminPanelButton}>Panel administratora</button>}
          <button className="button" onClick={handleLogout}>Wyloguj się</button>
        </div>
      </div>

      <div className="main">
        <div className="mainTop" ref={mainTopRef}>
          {nextMessagesListPage !== null && chatId && (
            <button
              className="loadMoreButton"
              onClick={handleMoreMessages}
            >Załaduj więcej wiadomości
            </button>
          )}
          {!chatId ? (

            <div className="noChatSelected">
              <h3>Nie wybrano czatu</h3>
              <p>Proszę wybrać istniejący czat lub rozpocząć nowy.</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={message.fromUser ? "userMessage" : "botMessage"}>
                <div className="messageHeader">
                  <img src={message.user.avatar} alt={message.user.name} className="avatar" />
                  <span className="username">{message.user.name}</span>
                </div>
                <div className="messageContent">
                  {message.text ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  ) :
                    (isLoading && (
                      <div className="loadingOval">
                        <Oval color="#00BFFF" secondaryColor="#484d52" height={30} width={30} />
                      </div>))
                  }

                </div>
              </div>
            ))
          )}
        </div>

        <div className="mainBottom">
          {chatId && (
            <div className="chatFooter">
              <input
                className="chatInput"
                type="text"
                placeholder="Napisz wiadomość..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isGeneratingAnswer}
              />
              {isGeneratingAnswer && (
                <FontAwesomeIcon className="cancelBtn" icon={faStop} onClick={cancelAnswer} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;

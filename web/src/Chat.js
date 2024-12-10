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

  const serverUrl = process.env.OLLAMA_URL || 'http://localhost:3000';

  const toast = useRef(null);

  let nextChatListPage = null;

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
      const response = await fetch(`${serverUrl}/api/v1/chats/list`, {
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
      setChatHistory(data.chats);
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

    let buffer = ""; // Buffer to store incomplete JSON

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
            // Koniec strumienia
            setIsLoading(false);
            setIsGeneratingAnswer(false);
            buffer = ""; // Wyczyść bufor
            return;
        }
    
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        console.log(buffer);
        // Przetwarzaj bufor
        while (buffer) {
            try {
                const jsonEndIndex = buffer.indexOf("}{"); 
                if (jsonEndIndex !== -1) {
                    const jsonString = buffer.slice(0, jsonEndIndex + 1); // Wyciągnij pierwszy JSON
                    const parsedChunk = JSON.parse(jsonString); // Parsuj JSON
                    buffer = buffer.slice(jsonEndIndex + 1); // Zaktualizuj bufor
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
                      console.log("sraka nazwowa :(");
                        setChatHistory(prevHistory => {
                            const updatedHistory = prevHistory.map(chat => {
                                const isMatch = chat.id == chatId;
                                return isMatch ? { ...chat, name: parsedChunk.newChatName } : chat;
                            });
                            return updatedHistory;
                        });
                    }
                } else {
                    // Jeśli nie znaleziono granicy, próbuj sparsować cały bufor
                    const parsedChunk = JSON.parse(buffer);
                    buffer = ""; // Bufor przetworzony
    
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
                      console.log("sraka nazwowa :(");
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
                    // Oczekujemy więcej danych
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



  const handleScroll = () => {
    if (mainTopRef.current.scrollTop === 0 && nextChatListPage) {
      fetchPreviousMessages();
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

  const fetchPreviousMessages = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/v1/chats/${chatId}?limit=10&page=${nextChatListPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      nextChatListPage = data.pagination.nextPage || null;
      setMessages(prevMessages => [
        ...data.messages.map((msg, index) => ({
          id: msg.id,
          user: {
            name: msg.sender === "human" ? `${Cookies.get("userName")}` : "Bot",
            avatar: msg.sender === "human" ? "/avatars/user.png" : "/avatars/bot.png"
          },
          fromUser: msg.sender === "human",
          text: msg.content
        })),
        ...prevMessages
      ]);
    }

    catch (error) {
      alert(error);
    }
  }


  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      try {
        const response = await fetch(`${serverUrl}/api/v1/chats/${chatId}?limit=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const data = await response.json();
        nextChatListPage = data.pagination.nextPage;
        let formattedMessages = [];
        if (data.messages.length > 0) {
          formattedMessages = data.messages
            .sort((a, b) => a.id - b.id)
            .map((msg, index) => ({
              id: index + 1,
              user: { name: msg.sender === "human" ? `${Cookies.get("userName")}` : "Bot", avatar: msg.sender === "human" ? "/avatars/user.png" : "/avatars/bot.png" },
              fromUser: msg.sender === "human",
              text: msg.content
            }));
        }

        setMessages(formattedMessages);
      } catch (error) {
        alert(error.message);
      }
    };

    fetchMessages();
  }, [chatId]);

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

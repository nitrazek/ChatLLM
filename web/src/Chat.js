import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Oval } from 'react-loader-spinner';
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import NewChatPopup from './NewChatPopup';

function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showNewChatPopup, setShowNewChatPopup] = useState(false);
  const role = Cookies.get("userRole");
  const mainTopRef = useRef(null);
  const navigate = useNavigate();
  const userToken = Cookies.get("userToken");
  useEffect(() => {
    if (!userToken) {
      navigate('/');
    }
  })

  const handleLogout = async () => {
    Cookies.remove("userToken");
    //Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("userRole");
    navigate("/");
  };

  const fetchChatHistory = async () => {
    setChatHistory([]);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/chats/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setChatHistory(data);
    } catch (error) {
      alert(error.errorMessage);
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

    try {
      const response = await fetch(`http://localhost:3000/api/v1/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: input }),
      });

      const reader = response.body.getReader();
      let accumulatedText = '';
      let botMessage = {
        id: messages.length + 2,
        text: '',
        fromUser: false,
        user: { name: "Bot", avatar: "/avatars/bot.png" }
      };

      reader.read().then(function processText({ done, value }) {
        if (done) {
          setIsLoading(false);
          return;
        }

        const chunk = new TextDecoder().decode(value);
        const parsedChunk = JSON.parse(chunk);
        const answer = parsedChunk.answer;

        accumulatedText += answer;
        botMessage.text = accumulatedText;

        if (parsedChunk.newChatName) {
          setChatHistory(prevHistory => {
            const updatedHistory = prevHistory.map(chat => {
              const isMatch = chat.id == chatId;
              return isMatch ? { ...chat, name: parsedChunk.newChatName } : chat;
            });
            return updatedHistory;
          });
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const existingMessageIndex = updatedMessages.findIndex(msg => !msg.fromUser && msg.id === botMessage.id);
          if (existingMessageIndex !== -1) {
            updatedMessages[existingMessageIndex].text = botMessage.text;
          } else {
            updatedMessages.push(botMessage);
          }

          if (mainTopRef.current) {
            mainTopRef.current.lastChild.scrollIntoView({ behavior: 'smooth' });
          }
          return updatedMessages;
        });

        setIsLoading(false);
        reader.read().then(processText);
      }
      );

    } catch (error) {
      alert(error.errorMessage);
      setIsLoading(false);
    }
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
    if (mainTopRef.current) {
      mainTopRef.current.scrollTop = mainTopRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      console.log("fetch Messages");
      console.log(chatId);
      console.log(userToken);
      try {
        const response = await fetch(`http://localhost:3000/api/v1/chats/${chatId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const formattedMessages = data.map((msg, index) => ({
          id: index + 1,
          user: { name: msg.sender === "human" ? `${Cookies.get("userName")}` : "Bot", avatar: msg.sender === "human" ? "/avatars/user.png" : "/avatars/bot.png" },
          fromUser: msg.sender === "human",
          text: msg.content
        }));

        setMessages(formattedMessages);
      } catch (error) {
        alert(error.errorMessage);
      }
    };

    fetchMessages();
  }, [chatId]);

  return (
    <div className="App">
      {showNewChatPopup && <NewChatPopup />}
      <div className="sideBar">
        <div className="generatorContainer">
          <div className="upperSideTop">C o k o l w i e k</div>
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
                      <button className="chatHistoryButton" onClick={() => navigate(`/chat/${chat.id}`)}>
                        {chat.name || "Nowy czat"}
                      </button>
                    </li>
                  ))
              )}
            </ul>

          </div>
        </div>
        <div className="lowerSide">
          <button className="button">Ustawienia</button>
          {role === "admin" && <button className="button">Panel administratora</button>}
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="botMessage">
              <div className="messageHeader">
                <img src="./avatars/bot.png" alt="Bot" className="avatar" />
                <span className="username">Bot</span>
              </div>
              <div className="messageContent">
                <div className="loadingOval">
                  <Oval color="#00BFFF" secondaryColor="#484d52" height={30} width={30} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mainBottom">
          <div className="chatFooter">
            {chatId && (
              <div className="input">
                <input
                  type="text"
                  placeholder="Napisz wiadomość..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

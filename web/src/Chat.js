import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Oval } from 'react-loader-spinner';
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';

function Chat() {
  const { chatId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const role = Cookies.get("userRole"); 
  const mainTopRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("userRole");
    navigate("/");
  };

  const createNewChat = async () => {
    const data = new Date();
    const userId = Cookies.get("userId");
  
    try {
      const response = await fetch(`http://localhost:3000/api/v1/chats/new/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.toUTCString(), isUsingOnlyKnowledgeBase: false })
      });
  
      if (!response.body) {
        throw new Error("Brak odpowiedzi w strumieniu");
      }
  
      const reader = response.body.getReader();
      let decoder = new TextDecoder('utf-8');
      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
  
      const parsedResult = JSON.parse(result); 
      const newChatId = parsedResult.id;
      
      navigate(`/chat/${newChatId}`); 
  
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      fromUser: true,
      user: { name: Cookies.get('userName'), avatar: "./avatars/user.png" }
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLastUserMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      const reader = response.body.getReader();
      let accumulatedText = '';
      let botMessage = {
        id: messages.length + 2,
        text: '',
        fromUser: false,
        user: { name: "Bot", avatar: "./avatars/bot.png" }
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
      });

    } catch (error) {
      console.error('Error sending message:', error);
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
    const fetchChatHistory = async () => {
      const userId = Cookies.get('userId');
      try {
        const response = await fetch(`http://localhost:3000/api/v1/chats/list/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setChatHistory(data); 
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, []);

  // Now add another useEffect to load messages when chatId is available
useEffect(() => {
  const fetchMessages = async () => {
    if (!chatId) return; // Exit if chatId is not available

    try {
      const response = await fetch(`http://localhost:3000/api/v1/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json(); // Assuming data is an array of messages
      
      // Format the messages according to your application's structure
      const formattedMessages = data.map((msg, index) => ({
        id: index + 1, // Generate a unique ID for the message
        text: msg.content, // Set the content from the API response
        fromUser: msg.sender === "human", // Determine if the message is from the user
        user: { name: msg.sender === "human" ? `${Cookies.get("userName")}`: "Bot", avatar: msg.sender === "human" ? "/avatars/user.png" : "/avatars/bot.png" } // Set avatar based on sender
      }));

      setMessages(formattedMessages); // Update state with formatted messages
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  fetchMessages();
}, [chatId]); // Only run this effect when chatId changes


  return (
    <div className="App">
      <div className="sideBar">
        <div className="generatorContainer">
          <div className="upperSideTop">C o k o l w i e k</div>
          <button className="button" onClick={createNewChat}>Rozpocznij nowy czat</button>
        </div>
        <div className="upperSide">
          <span className="chatHistorySpan">Historia czatów:</span>
          <div className="upperSideBottom">
            <ul className="chatHistory" style={{ textAlign: "center", alignContent: "center" }}>
              {chatHistory
              .slice()
              .sort((a,b) => b.id - a.id)
              .map((chat, index) => (
                <li key={chat.id}>
                  <button className="chatHistoryButton" onClick={() => navigate(`/chat/${chat.id}`)}>{chat.id}. {chat.name}</button>
                </li>
              ))}
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

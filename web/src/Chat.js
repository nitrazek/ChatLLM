import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Oval } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);

  const mainTopRef = useRef(null);

  const chatHistory = [
    "Adam Małysz",
    "Co jest cięższe?",
    "Powitanie",
    "test1test1test1test1ttest1test1test1test1test1test1test1est1",
    "test2",
    "test3",
    "test4",
    "test5",
    "test6"
  ];

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      fromUser: true,
      user: { name: "Ty", avatar: "./avatars/user.png" }
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLastUserMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {

      const response = await fetch('http://localhost:3000/api/v1/model/questions', {
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

        // Stop loading indicator after receiving the first chunk
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

  return (
    <div className="App">
      <div className="sideBar">
        <div className="generatorContainer">
          <div className="upperSideTop">C o k o l w i e k</div>
          <button className="button">Rozpocznij nowy czat</button>
        </div>
        <div className="upperSide">
          <span className="chatHistorySpan">Historia czatów:</span>
          <div className="upperSideBottom">
            <ul className="chatHistory" style={{ textAlign: "center", alignContent: "center" }}>
              {chatHistory.map((option, index) => (
                <li key={index}>
                  <button className="chatHistoryButton">{option}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lowerSide">
          <button className="button">Ustawienia</button>
          <button className="button">Panel administratora</button>
          <Link to="/"><button className="button">Wyloguj się</button></Link>
        </div>
      </div>
      <div className="main">
        <div className="mainTop" ref={mainTopRef}>
          {messages.map(message => (
            <div key={message.id} className={message.fromUser ? "userMessage" : "botMessage"}>
              <div className="messageHeader">
                <img src={message.user.avatar} alt={message.user.name} className="avatar" />
                <span className="username">{message.user.name}</span>
              </div>
              <div className="messageContent">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

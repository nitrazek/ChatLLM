import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);

  const mainTopRef = useRef(null);
  const controller = useRef(null);

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
    controller.current = new AbortController();

    try {
      const response = await fetch('http://localhost:3000/api/v1/chats/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
        signal: controller.current.signal,
        cache: "no-store"
      });

      console.log("Request sent");

      const reader = response.body.getReader();
      let accumulatedText = '';

      while(true) {
        const { done, value } = await reader.read();
        if(done) {
          setIsLoading(false);
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const parsedChunk = JSON.parse(chunk);
        const answer = parsedChunk.answer;
        console.log(chunk)

        accumulatedText += answer;

        const botMessage = {
          id: messages.length + 2,
          text: accumulatedText,
          fromUser: false,
          user: { name: "Bot", avatar: "./avatars/bot.png" }
        };

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
      }
    } catch (error) {
      setIsLoading(false);
      controller.current = null;
      if (error.name !== "AbortError")
        console.error('Error sending message:', error);
    }
  };

  const cancelAnswer = (e) => {
    if(controller.current) controller.current.abort();
    console.log("ABORT!!")
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
          <button className="button">Wyloguj się</button>
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
            <button className="cancelButton" onClick={cancelAnswer} disabled={!isLoading}>STOP</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

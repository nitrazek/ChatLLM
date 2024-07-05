import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatHistory = [
    "Adam Małysz",
    "Co jest cięższe?",
    "Powitanie",
    "test1",
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

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/model/questions', { question: input });
      const botMessage = {
        id: messages.length + 2,
        text: response.data.answer, 
        fromUser: false,
        user: { name: "Bot", avatar: "./avatars/bot.png" }
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
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

  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">G E N E R A T O R</div>
          <button className="newChatButton">Rozpocznij nowy czat</button>
          <br></br>
              Historia czatów:
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
          <br></br>
          <button className="newChatButton">Ustawienia</button>
          <button className='newChatButton'>Panel administratora</button>
          <button className='newChatButton'>Wyloguj się</button>
        </div>
      </div>
      <div className="main">
        <div className="mainTop">
          {messages.map(message => (
            <div key={message.id} className={message.fromUser? "userMessage" : "botMessage"}>
              <div className="messageHeader">
                <img src={message.user.avatar} alt={message.user.name} className="avatar" />
                <span className="username">{message.user.name}</span>
              </div>
              <div className="messageContent">{message.text}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Cześć, jak się masz?", fromUser: true, user: { name: "Ty", avatar: "./avatars/user.png" } },
    { id: 2, text: "Witaj! U mnie wszystko w porządku!", fromUser: false, user: { name: "Bot", avatar: "./avatars/bot.png" } },
    { id: 3, text: "Kim jest Adam Małysz?", fromUser: true, user: { name: "Ty", avatar: "./avatars/user.png" } },
    { id: 4, text: "Adam Małysz to polski skoczek narciarski, który jest uważany za jednego z najlepszych skoczków wszech czasów. Jego karierę określa się mianem \"epoki złotej\".", fromUser: false, user: { name: "Bot", avatar: "./avatars/bot.png" } }
  ]);

  const chatHistory = [
    "Adam Małysz",
    "Co jest cięższe?",
    "Powitanie"
  ];

  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">G E N E R A T O R</div>
          <button className="newChatButton">Rozpocznij nowy czat</button>
          <br></br>
          <div className="upperSideBottom">
            <ul className="chatHistory" style={{ textAlign: "center", alignContent: "center" }}>
              Historia czatów:
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
            <div key={message.id} className={message.fromUser ? "userMessage" : "botMessage"}>
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
              <input type="text" placeholder="Napisz wiadomość..."></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

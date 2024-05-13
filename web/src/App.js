import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Cześć, jak się masz?", fromUser: true, user: { name: "You", avatar: "url_do_twojego_awatara" } },
    { id: 2, text: "Witaj! Jestem w porządku, dzięki!", fromUser: false, user: { name: "Bot", avatar: "url_do_awatara_bota" } },
    { id: 3, text: "Czy masz jakieś plany na dzisiaj?", fromUser: true, user: { name: "You", avatar: "url_do_twojego_awatara" } }
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
          <div className="upperSideBottom">
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, textAlign: "center" }}> {/* Dodaj styl inline */}
          {chatHistory.map((option, index) => (
            <li key={index} style={{ display: "block" }}> {/* Dodaj styl inline */}
              <button className="chatHistoryButton">{option}</button>
            </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lowerSide">
          <button className="sideBarButton">Ustawienia</button>
          <button className='sideBarButton'>Panel administratora</button>
          <button className='sideBarButton'>Wyloguj się</button>
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

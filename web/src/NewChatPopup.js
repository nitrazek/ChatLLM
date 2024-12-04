import React, { useState } from "react";
import './NewChatPopup.css'
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';



function NewChatPopup() {
  const [newChatName, setNewChatName] = useState("");
  const [usingKnowlegde, setUsingKnowlegde] = useState(false);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const userToken = Cookies.get("userToken");

  const serverUrl = process.env.OLLAMA_URL || 'http://localhost:3000';

  const createNewChat = async () => {


    try {

      const bodyData = {};

      if (newChatName !== '') {
        bodyData.name = newChatName;
      }

      if (usingKnowlegde) {
        bodyData.isUsingOnlyKnowledgeBase = usingKnowlegde;
      }

      const response = await fetch(`${serverUrl}}/api/v1/chats/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
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
      alert(error.errorMessage);
    }
  };

  const closePopup = async () => {
    if (chatId == "undefined") navigate('/chat');
    else navigate(`/chat/${chatId}`);
  };


  return (
    <div className="popup-background">
      <div className="popup-container">
        <button className="close-button" onClick={closePopup}>X</button>
        <h4>Utwórz nowy czat</h4>
        <label>Nazwa czatu:</label>
        <label><input type="text" value={newChatName} placeholder="Wprowadź nazwę czatu (nieobowiązkowe)" onChange={(e) => setNewChatName(e.target.value)}></input></label>
        <br />
        <label>Czy czat ma korzystać</label>
        <label>tylko z bazy wiedzy?</label>
        <br />
        <label><input
          type="checkbox"
          checked={usingKnowlegde}
          onChange={(e) => setUsingKnowlegde(e.target.checked)}
        /></label>
        <br />
        <label><button className="button" onClick={createNewChat}>Utwórz czat</button></label>
      </div>
    </div>
  );
}

export default NewChatPopup;

import React, { useState } from "react";
import './NewChatPopup.css'
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';



function NewChatPopup() {
    const [newChatName, setNewChatName] = useState("");
    const [usingKnowlegde, setUsingKnowlegde] = useState(false);
    const navigate = useNavigate();
    const { chatId } = useParams(); 

    const createNewChat = async () => {;
        const userId = Cookies.get("userId");
      
        try {
          const response = await fetch(`http://localhost:3000/api/v1/chats/new/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newChatName, isUsingOnlyKnowledgeBase: usingKnowlegde })
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
        navigate(`/chat/${chatId}`)
    };

    
    return (
        <div className="popup-background">
            <div className="popup-container">
                <button className="close-button" onClick={closePopup}>X</button>
                <h4>Utwórz nowy czat</h4>
                <label>Nazwa czatu:</label> 
                <label><input type="text" value={newChatName} placeholder="Wprowadź nazwę czatu (nieobowiązkowe)" onChange={(e) => setNewChatName(e.target.value)}></input></label>
                <br/>
                <label>Czy czat ma korzystać</label>
                <label>tylko z bazy wiedzy?</label>
                <br/>
                <label><input
                    type="checkbox"
                    checked={usingKnowlegde}
                    onChange={(e) => setUsingKnowlegde(e.target.checked)}
                /></label>
                <br/>
                <label><button className="button" onClick={createNewChat}>Utwórz czat</button></label>
            </div>
        </div>
    );
}

export default NewChatPopup;

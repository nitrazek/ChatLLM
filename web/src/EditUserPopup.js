import React, { useState } from "react";
import './EditUserPopup.css'
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';



function EditUserPopup({userId}) {
  console.log(`id użytkownika do edycji: ${userId}`);
  const navigate = useNavigate();
  const userToken = Cookies.get("userToken");

  const closePopup = async () => {
    navigate('/admin');
  };


  return (
    <div className="popup-background">
      <div className="popup-container">
        <button className="close-button" onClick={closePopup}>X</button>
        <h4>Edytuj użytkownika</h4>
        <label>Nazwa:</label>
        <label><input type="text" ></input></label>
        <br />
        <label>Hasło:</label>
        <label><input type="password" ></input></label>
        <br />
        <label>
          <select>

          </select>
        </label>
        <br />
        <label><button className="button">Edytuj użytkownika</button></label>
      </div>
    </div>
  );
}

export default EditUserPopup;

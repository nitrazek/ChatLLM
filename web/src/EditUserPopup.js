import React, { useEffect, useState } from "react";
import './EditUserPopup.css'
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';



function EditUserPopup({ userId }) {
  const navigate = useNavigate();
  const userToken = Cookies.get("userToken");

  const [userName, setUserName] = useState("");
  const [userMail, setUserMail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState(false); //if false user, if true admin
  const [userActivated, setUserActivated] = useState(false);

  const closePopup = async () => {
    navigate('/admin');
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setUserName(data.name);
      setUserMail(data.email);
      setUserRole((data.role === "admin") ? true : false);
      setUserActivated(data.activated);
    } catch (error) {
      alert(error.message);
    }
  };

  const updateUser = async () => {
    const bodyData = {};
    bodyData.name = userName;
    bodyData.email = userMail;
    if (userPassword !== '') {
      bodyData.password = userPassword;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (response.status == 200) closePopup();
    }
    catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const handleRoleChange = (e) => {
    setUserRole(e.target.value === "true");
  };

  return (
    <div className="popup-background">
      <div className="popup-container">
        <button className="close-button" onClick={closePopup}>X</button>
        <h4>Edytuj użytkownika</h4>
        <label>Nazwa:</label>
        <label>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}></input>
        </label>
        <br />
        <label>Email:</label>
        <label>
          <input type="text" value={userMail} onChange={(e) => setUserMail(e.target.value)}></input>
        </label>
        <br />
        <label>Hasło:</label>
        <label><input type="password"></input></label>
        <br />

        <label>Rola:</label>
        <label>
          <select value={userRole} onChange={handleRoleChange} disabled>
            <option value={false}>Użytkownik</option>
            <option value={true}>Administrator</option>
          </select>
        </label>
        <br />
        <label><button className="button" onClick={updateUser}>Edytuj użytkownika</button></label>
      </div>
    </div>
  );
}

export default EditUserPopup;

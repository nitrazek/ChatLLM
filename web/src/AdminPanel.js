import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function AdminPanel() {
    const navigate = useNavigate();
    const userToken = Cookies.get("userToken");
    const [userManagement, setUserManagement] = useState(true);
    const [userList, setUserList] = useState([]);

    const handleToggleUserManagement = () => {
        setUserManagement(true);
    };

    const handleToggleFileManagement = () => {
        setUserManagement(false);
    };

    const activateUser = async (userToActivateId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userToActivateId}/activate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        window.location.reload();
        }
        catch (error) {
            alert(error.errorMessage);
        }
    }
    
    const deleteUser = async (userToDeleteId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        window.location.reload();
        }
        catch (error) {
            alert(error.errorMessage);
        }
    }

    const fetchUsers = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/users/list`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();
                setUserList(data);
            } catch (error) {
                alert(error.errorMessage);
            }
        };

    useEffect(() => {
        fetchUsers();
    }, [userToken]);

    return (
        <div className="adminApp">
            <div className="adminSideBar">
                <div className="adminUpperSideContainer">
                    <div className="adminUpperSideTop">PANEL ADMINISTRATORA</div>
                    <button onClick={() => navigate(`/chat/`)}>Powrót</button>
                </div>
                <button 
                    className={userManagement ? "userManagementButtonActive" : "userManagementButtonInactive"} 
                    onClick={handleToggleUserManagement}
                >
                    <span>Zarządzaj użytkownikami</span>
                </button>
                <button 
                    className={userManagement ? "fileManagementButtonInactive" : "fileManagementButtonActive"} 
                    onClick={handleToggleFileManagement}
                >
                    <span>Zarządzaj plikami</span>
                </button>
            </div>
            <div className="adminMain">
                {userManagement && (
                    <div>
                        ZARZĄDZANIE UŻYTKOWNIKAMI
                        <table className="userTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nazwa</th>
                                    <th>Email</th>
                                    <th>Status konta</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.activated ? "Aktywne" : "Nieaktywowane"}</td>
                                        <td>
                                            {!user.activated ? <button onClick={() => activateUser(user.id)}>Aktywuj</button> : ""}
                                            {(user.name !== "superadmin" && user.activated) ? <button>Edytuj</button> : ""}
                                            {user.name !== "superadmin" ? <button onClick={() => deleteUser(user.id)}>Usuń</button> : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;

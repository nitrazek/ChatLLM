import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import ReactPaginate from 'react-paginate';

function AdminPanel() {
    const navigate = useNavigate();
    const userToken = Cookies.get("userToken");
    const [userManagement, setUserManagement] = useState(true);
    const [userList, setUserList] = useState([]);
    const [prevPage, setPrevPage] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usernameFilter, setUsernameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [activatedFilter, setActivatedFilter] = useState("false");
    const [notActivatedFilter, setNotActivatedFilter] = useState("false");

    const handleToggleUserManagement = () => {
        setUserManagement(true);
    };

    const handleToggleFileManagement = () => {
        setUserManagement(false);
    };

    const activateUser = async (userToActivateId) => {
        try {
            await fetch(`http://localhost:3000/api/v1/users/${userToActivateId}/activate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
            });
            fetchUsers(); // Fetch users again after activation
        } catch (error) {
            alert(error.message);
        }
    }

    const deleteUser = async (userToDeleteId) => {
        try {
            await fetch(`http://localhost:3000/api/v1/users/${userToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
            });
            fetchUsers(); // Fetch users again after deletion
        } catch (error) {
            alert(error.message);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/list?limit=5&page=${currentPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            setUserList(data.users);
            setPrevPage(data.pagination.prevPage);
            setNextPage(data.pagination.nextPage);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, userToken]); // Fetch users when currentPage or userToken changes

    const handlePageChange = (selectedPage) => {
        const newPage = selectedPage.selected + 1; // Convert 0-based index to 1-based page number
        setCurrentPage(newPage);
    };

    return (
        <div className="adminApp">
            <div className="adminSideBar">
                <div className="adminUpperSideContainer">
                    <div className="adminUpperSideTop">PANEL ADMINISTRATORA</div>
                    <a class="backbutton" onClick={() => navigate(`/chat/`)}>↶ Powrót</a>
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
                        Filtry:
                        Nazwa: <input type="text"></input>
                        Email: <input type="text"></input>
                        Rola: <select>
                            <option selected="selectec" />
                            <option>Administrator</option>
                            <option>Użytkownik</option>
                        </select>
                        <label>
                            <input type="checkbox" />
                            Aktywowany
                        </label>
                        <label>
                            <input type="checkbox" />
                            Nieaktywowany
                        </label>
                        <button className='adminButton'>Filtruj</button>
                        <button className='adminButton'>Resetuj filtry</button>
                        <table className="userTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nazwa</th>
                                    <th>Email</th>
                                    <th>Rola</th>
                                    <th>Status konta</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.length > 0 && (userList
                                    .sort((a, b) => b.id - a.id)
                                    .map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{(user.role == "admin" ? "Administrator" : "Użytkownik")}</td>
                                            <td>{user.activated ? "Aktywne" : "Nieaktywowane"}</td>
                                            <td>
                                                {!user.activated ? <button className='adminButton' onClick={() => activateUser(user.id)}>Aktywuj</button> : ""}
                                                {(user.name !== "superadmin" && user.activated) ? <button className='adminButton'>Edytuj</button> : ""}
                                                {user.name !== "superadmin" ? <button onClick={() => deleteUser(user.id)} className='adminButton'>Usuń</button> : ""}
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                        <ReactPaginate
                            activeClassName={'item active '}
                            breakClassName={'item break-me '}
                            breakLabel={'...'}
                            containerClassName={'pagination'}
                            disabledClassName={'disabled-page'}
                            marginPagesDisplayed={2}
                            onPageChange={handlePageChange}
                            pageCount={totalPages}
                            pageClassName={'item pagination-page '}
                            pageRangeDisplayed={2}
                        />
                    </div>
                )}
                {!userManagement && (
                    <div>
                        tutaj będzie zarządzanie plikami
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;

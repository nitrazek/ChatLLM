import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import ReactPaginate from 'react-paginate';
import EditUserPopup from './EditUserPopup';

function AdminPanel() {
    const navigate = useNavigate();
    const userToken = Cookies.get("userToken");
    const [userManagement, setUserManagement] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [userList, setUserList] = useState([]);
    const [prevPage, setPrevPage] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [usernameFilter, setUsernameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [activatedFilter, setActivatedFilter] = useState(false);
    const [notActivatedFilter, setNotActivatedFilter] = useState(false);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [showEditUserPopup, setShowEditUserPopup] = useState(false);
    const [userToEditId, setUserToEditId] = useState(null);

    const handleToggleUserManagement = () => {
        setUserManagement(true);
    };

    const handleToggleFileManagement = () => {
        setUserManagement(false);
    };

    const handleSearch = async () => {

        let newQuery = `limit=${usersPerPage.toString()}`;
        if (usernameFilter) newQuery += `&name=${usernameFilter}`;
        if (emailFilter) newQuery += `&email=${emailFilter}`;
        if (roleFilter) newQuery += `&role=${roleFilter}`;
        if (activatedFilter && !notActivatedFilter) newQuery += `&activated=true`;
        if (!activatedFilter && notActivatedFilter) newQuery += `&activated=false`;
        console.log(newQuery);
        fetchUsers(newQuery);
    };

    const handleResetFilters = () => {
        setUsernameFilter("");
        setEmailFilter("");
        setRoleFilter("");
        setActivatedFilter(false);
        setNotActivatedFilter(false);
        setUsersPerPage(10);
        fetchUsers("limit=10");
    };

    const handleEditUser = (userId) => {
        setUserToEditId(userId);
        setShowEditUserPopup(true);
    }

    const activateUser = async (userToActivateId) => {
        try {
            await fetch(`http://localhost:3000/api/v1/users/${userToActivateId}/activate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
            });
            fetchUsers();
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
            fetchUsers();
        } catch (error) {
            alert(error.message);
        }
    }

    const fetchUsers = async (queryParams) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/list?page=${currentPage}&${queryParams}`, {
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
            const total = data.pagination.totalPages || 0;
            setTotalPages(Math.ceil(total));
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchUsers("limit=10");
    }, [currentPage, userToken]);

    const handlePageChange = (selectedPage) => {
        const newPage = selectedPage.selected + 1;
        setCurrentPage(newPage);
    };

    return (
        <div className="adminApp">
            {showEditUserPopup && <EditUserPopup userId={userToEditId} />}
            <div className="adminSideBar">
                <div className="adminUpperSideContainer">
                    <div className="adminUpperSideTop">ADMIN</div>
                    <a className="backbutton" onClick={() => navigate(`/chat/`)}>↶ Powrót</a>
                </div>
                <button
                    className={userManagement ? "userManagementButtonActive" : "userManagementButtonInactive"}
                    onClick={handleToggleUserManagement}
                    disabled={userManagement}
                >
                    <span>Użytkownicy</span>
                </button>
                <button
                    className={userManagement ? "fileManagementButtonInactive" : "fileManagementButtonActive"}
                    onClick={handleToggleFileManagement}
                    disabled={!userManagement}
                >
                    <span>Pliki</span>
                </button>
            </div>
            <div className={showFilters ? "adminMain adminMainFilters" : "adminMain"}>
                {userManagement && (
                    <div>
                        <div className='buttonContainer filterButtonContainer'>
                            <label className='filterLabel'>Szukaj użytkownika:</label>
                            <input
                                className="filterTextInput"
                                type="text"
                                placeholder='Nazwa/email'
                                value={usernameFilter}
                                onChange={(e) => setUsernameFilter(e.target.value)} />
                        </div>
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
                                                <div className='buttonContainer'>
                                                    {!user.activated ? <button className='adminButton activateButton' onClick={() => activateUser(user.id)}>Aktywuj</button> : null}
                                                    {user.activated ? (
                                                        <button
                                                            className={user.name === "superadmin" ? "adminButton inactiveButton" : "adminButton"}
                                                            disabled={user.name === "superadmin"}
                                                            onClick={() => handleEditUser(user.id)}>
                                                            Edytuj
                                                        </button>) : ""}
                                                    <button
                                                        className={user.name === "superadmin" ? "adminButton inactiveButton" : "adminButton deleteButton"}
                                                        disabled={user.name === "superadmin"}
                                                        onClick={() => deleteUser(user.id)}>
                                                        Usuń
                                                    </button>
                                                    <button onClick={() => setShowFilters(!showFilters)}></button>
                                                </div>
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
            {(showFilters && userManagement) && (
                <div className={`filterSideBar ${showFilters ? 'show' : ''}`}>
                    <div className='buttonContainer filterButtonContainer'>
                        <label className='filterLabel'>Email:</label>
                        <input
                            className="filterTextInput"
                            type="text"
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                        />
                    </div>
                    <div className='buttonContainer filterButtonContainer'>
                        Rola:
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">dowolna</option>
                            <option value="admin">Administrator</option>
                            <option value="user">Użytkownik</option>
                        </select>
                    </div>
                    <div className='buttonContainer filterButtonContainer'>
                        <input
                            type="checkbox"
                            checked={activatedFilter === "true"}
                            onChange={() => setActivatedFilter(!activatedFilter)}
                        />
                        <label>Aktywowany</label>
                    </div>
                    <div className='buttonContainer filterButtonContainer'>
                        <input
                            type="checkbox"
                            checked={notActivatedFilter === "true"}
                            onChange={() => setNotActivatedFilter(!notActivatedFilter)}
                        />
                        <label>Nieaktywowany</label>
                    </div>

                    <div className='buttonContainer filterButtonContainer'>
                        Ilość wyświetlanych użytkowników na stronie:
                        <select value={usersPerPage} onChange={(e) => setUsersPerPage(e.target.value)}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </div>
                    <div className='buttonContainer filterButtonContainer'>
                        <button className='adminButton filterButton' onClick={handleSearch}>Szukaj</button>
                        <button className='adminButton filterButton' onClick={handleResetFilters}>Resetuj filtry</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;

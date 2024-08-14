import React, { useState } from "react";
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div class="center-wrapper">
        <div className={`container ${isRegister ? 'active' : ''}`}>
            <div className="form-container sign-up">
                <form>
                    <h5>Załóż konto</h5>
                    <br/>
                    <input type="text" placeholder="Login"/>
                    <input type="email" placeholder="Email"/>
                    <input type="password" placeholder="Hasło"/>
                    <input type="password" placeholder="Powtórz hasło"/>
                    <br/>
                    <button type="button">
                        Zarejestruj się
                    </button>
                </form>
            </div>
            <div className={`form-container sign-in ${!isRegister ? 'active' : ''}`}>
                <form>
                    <h5>Zaloguj się</h5>
                    <br/>
                    <input type="text" placeholder="Login"/>
                    <input type="password" placeholder="Hasło"/>
                    <br/>
                    <Link to="/chat"><button type="button">Zaloguj się</button></Link>
                </form>
            </div>
            <div className="toggle-container">
                <div className="toggle">
                    <div className="toggle-panel toggle-left">
                        <h4>Masz już konto?</h4>
                        <br/>
                        <button type="button" onClick={() => setIsRegister(false)}>Zaloguj się</button>
                    </div>
                    <div className="toggle-panel toggle-right">
                        <h4>Nie posiadasz konta?</h4>
                        <br/>
                        <button type="button" color="#fff" onClick={() => setIsRegister(true)}>Zarejestruj się</button>
                    </div>
                </div>
            </div>
        </div>
        </div>);
}

export default Login;

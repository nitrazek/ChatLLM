import React, { useState, useEffect } from "react";
import './Login.css';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [login, setLogin] = useState("");
    const [loginOrEmail, setLoginOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginOrEmailError, setLoginOrEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [touched, setTouched] = useState({
        email: false,
        login: false,
        loginOrEmail: false,
        password: false,
        confirmPassword: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        const userToken = Cookies.get("userToken");
        if (userToken) {
            navigate('/chat');
        }
    })

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return "Email jest wymagany";
        } else if (!emailPattern.test(email)) {
            return "Nieprawidłowy format email";
        }
        return "";
    };

    const validateLogin = (login) => {
        if (!login) {
            return "Login jest wymagany";
        }
        else if (login.length < 4 || login.length > 30) {
            return "Login musi mieć od 4 do 30 znaków";
        }
        return "";
    };

    const validateLoginOrEmail = (loginOrEmail) => {
        if (!loginOrEmail) {
            return "Login lub email jest wymagany";
        }
        return "";
    };

    const validatePassword = (password) => {
        if (!password) {
            return "Hasło jest wymagane";
        } else if (password.length < 6 || password.length > 30) {
            return "Hasło musi mieć od 6 do 30 znaków";
        } else if (!/[a-z]/.test(password)) {
            return "Hasło musi zawierać co najmniej jedną małą literę";
        } else if (!/[A-Z]/.test(password)) {
            return "Hasło musi zawierać co najmniej jedną dużą literę";
        } else if (!/[0-9]/.test(password)) {
            return "Hasło musi zawierać co najmniej jedną cyfrę";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Hasło musi zawierać co najmniej jeden znak specjalny";
        }
        return "";
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) {
            return "Potwierdzenie hasła jest wymagane";
        } else if (password !== confirmPassword) {
            return "Hasła się nie zgadzają";
        }
        return "";
    };

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleLoginChange = (e) => setLogin(e.target.value);
    const handleLoginOrEmailChange = (e) => setLoginOrEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const handleEmailBlur = () => {
        setTouched((prev) => ({ ...prev, email: true }));
        setEmailError(validateEmail(email));
    };
    const handleLoginBlur = () => {
        setTouched((prev) => ({ ...prev, login: true }));
        setLoginError(validateLogin(login));
    };

    const handleLoginOrEmailBlur = () => {
        setTouched((prev) => ({ ...prev, loginOrEmail: true}));
        setLoginOrEmailError(validateLoginOrEmail(loginOrEmail));
    }

    const handlePasswordBlur = () => {
        setTouched((prev) => ({ ...prev, password: true }));
        setPasswordError(validatePassword(password));
        setConfirmPasswordError(validateConfirmPassword(password, confirmPassword));
    };
    const handleConfirmPasswordBlur = () => {
        setTouched((prev) => ({ ...prev, confirmPassword: true }));
        setConfirmPasswordError(validateConfirmPassword(password, confirmPassword));
    };

    const handleRegister = () => {
        const emailError = validateEmail(email);
        const loginError = validateLogin(login);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

        setEmailError(emailError);
        setLoginError(loginError);
        setPasswordError(passwordError);
        setConfirmPasswordError(confirmPasswordError);

        if (!emailError && !loginError && !passwordError && !confirmPasswordError) {
            registerUser();
        }
    };

    const handleLogin = () => {
        const loginError = validateLoginOrEmail(loginOrEmail);
        const passwordError = validatePassword(password);

        setLoginOrEmailError(loginOrEmailError);
        setPasswordError(passwordError);

        if (!loginOrEmailError && !passwordError) {
            loginUser();
        }
    };

    const resetForm = () => {
        setEmail("");
        setLogin("");
        setLoginOrEmail("");
        setPassword("");
        setConfirmPassword("");
        setEmailError("");
        setLoginError("");
        setLoginOrEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setTouched({
            email: false,
            login: false,
            password: false,
            confirmPassword: false
        });
    };

    const handleToggleRegister = () => {
        setIsRegister(true);
        resetForm();
    };

    const handleToggleLogin = () => {
        setIsRegister(false);
        resetForm();
    };

    const getInputClass = (error, value, isTouched) => {
        if (error) return 'input-error';
        return isTouched && value ? 'input-valid' : 'input-default';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (isRegister) {
                handleRegister();
            } else {
                handleLogin();
            }
        }
    };

    const registerUser = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: login, email: email, password: password }),
            });
            if (response.status === 201) {
                alert("You have successfully registered your account. Wait for administrator to activate your account.");
                resetForm();
                handleToggleLogin();
            }
        }
        catch (error) {
            alert(error.message);
        }
    };

    const loginUser = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nameOrEmail: loginOrEmail, password: password }),
            });
            const data = await response.json();

            if (response.ok) {
                Cookies.set("userToken", data.token);
                Cookies.set("userId", data.id);
                Cookies.set("userName", data.name);
                Cookies.set("userRole", data.role);
                navigate('/chat');
            } else {
                alert(data.errorMessage);
            }
        } catch (error) {
            alert("An error occurred. Try again later\n" + error.message);
        }
    }

    return (
        <div className="center-wrapper">
            <div className={`container ${isRegister ? 'active' : ''}`}>
                <div className="form-container sign-up">
                    <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown}>
                        <h5>Załóż konto</h5>
                        <br />
                        <input
                            tabIndex={isRegister ? 0 : -1}
                            type="email"
                            placeholder="Email"
                            className={getInputClass(emailError, email, touched.email)}
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                        />
                        {emailError && <span className="error-tooltip">{emailError}</span>}

                        <input
                            tabIndex={isRegister ? 0 : -1}
                            type="text"
                            placeholder="Login"
                            className={getInputClass(loginError, login, touched.login)}
                            value={login}
                            onChange={handleLoginChange}
                            onBlur={handleLoginBlur}
                        />
                        {loginError && <span className="error-tooltip">{loginError}</span>}
                        <input
                            tabIndex={isRegister ? 0 : -1}
                            type="password"
                            placeholder="Hasło"
                            className={getInputClass(passwordError, password, touched.password)}
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                        />
                        {passwordError && <span className="error-tooltip">{passwordError}</span>}
                        <input
                            tabIndex={isRegister ? 0 : -1}
                            type="password"
                            placeholder="Powtórz hasło"
                            className={getInputClass(confirmPasswordError, confirmPassword, touched.confirmPassword)}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={handleConfirmPasswordBlur}
                        />
                        {confirmPasswordError && <span className="error-tooltip">{confirmPasswordError}</span>}
                        <br />
                        <button tabIndex={isRegister ? 0 : -1} type="button" onClick={handleRegister}>
                            Zarejestruj się
                        </button>
                    </form>
                </div>
                <div className={`form-container sign-in ${!isRegister ? 'active' : ''}`}>
                    <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown}>
                        <h5>Zaloguj się</h5>
                        <br />
                        <input
                            tabIndex={isRegister ? -1 : 0}
                            type="text"
                            placeholder="Login lub email"
                            className='input-default'
                            value={loginOrEmail}
                            onChange={handleLoginOrEmailChange}
                            onBlur={handleLoginOrEmailBlur}
                        />
                        <input
                            tabIndex={isRegister ? -1 : 0}
                            type="password"
                            placeholder="Hasło"
                            className='input-default'
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                        />
                        <br />
                        <button tabIndex={isRegister ? -1 : 0} type="button" onClick={handleLogin}>Zaloguj się</button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h4>Masz już konto?</h4>
                            <br />
                            <button tabIndex={isRegister ? 0 : -1} type="button" onClick={handleToggleLogin}>Zaloguj się</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h4>Nie posiadasz konta?</h4>
                            <br />
                            <button tabIndex={isRegister ? -1 : 0} type="button" onClick={handleToggleRegister}>Zarejestruj się</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

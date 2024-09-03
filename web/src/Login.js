import React, { useState } from "react";
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    // State variables for form inputs
    const [email, setEmail] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State variables for errors
    const [emailError, setEmailError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    // State variables to track blur
    const [touched, setTouched] = useState({
        email: false,
        login: false,
        password: false,
        confirmPassword: false
    });

    // Validation functions
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
        return "";
    };

    const validatePassword = (password) => {
        if (!password) {
            return "Hasło jest wymagane";
        } else if (password.length < 6) {
            return "Hasło musi mieć co najmniej 6 znaków";
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

    // Handle input changes
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleLoginChange = (e) => setLogin(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    // Handle blur events for validation
    const handleEmailBlur = () => {
        setTouched((prev) => ({ ...prev, email: true }));
        setEmailError(validateEmail(email));
    };
    const handleLoginBlur = () => {
        setTouched((prev) => ({ ...prev, login: true }));
        setLoginError(validateLogin(login));
    };
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
        // Perform final validation on submit
        const emailError = validateEmail(email);
        const loginError = validateLogin(login);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

        setEmailError(emailError);
        setLoginError(loginError);
        setPasswordError(passwordError);
        setConfirmPasswordError(confirmPasswordError);

        if (!emailError && !loginError && !passwordError && !confirmPasswordError) {
            // Proceed with registration
            console.log("Registration successful");
        }
    };

    const handleLogin = () => {
        const loginError = validateLogin(login);
        const passwordError = validatePassword(password);

        setLoginError(loginError);
        setPasswordError(passwordError);

        if (!loginError && !passwordError) {
            // Proceed with login
            console.log("Login successful");
        }
    };

    const resetForm = () => {
        setEmail("");
        setLogin("");
        setPassword("");
        setConfirmPassword("");
        setEmailError("");
        setLoginError("");
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

    // Determine the classes for inputs based on errors
    const getInputClass = (error, value, isTouched) => {
        if (error) return 'input-error';
        return isTouched && value ? 'input-valid' : 'input-default';
    };

    return (
        <div className="center-wrapper">
            <div className={`container ${isRegister ? 'active' : ''}`}>
                <div className="form-container sign-up">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h5>Załóż konto</h5>
                        <br />
                        <input
                            type="email"
                            placeholder="Email"
                            className={getInputClass(emailError, email, touched.email)}
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                        />
                        {emailError && <span className="error-tooltip">{emailError}</span>}

                        <input
                            type="text"
                            placeholder="Login"
                            className={getInputClass(loginError, login, touched.login)}
                            value={login}
                            onChange={handleLoginChange}
                            onBlur={handleLoginBlur}
                        />
                        {loginError && <span className="error-tooltip">{loginError}</span>}
                        <input
                            type="password"
                            placeholder="Hasło"
                            className={getInputClass(passwordError, password, touched.password)}
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                        />
                        {passwordError && <span className="error-tooltip">{passwordError}</span>}
                        <input
                            type="password"
                            placeholder="Powtórz hasło"
                            className={getInputClass(confirmPasswordError, confirmPassword, touched.confirmPassword)}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={handleConfirmPasswordBlur}
                        />
                        {confirmPasswordError && <span className="error-tooltip">{confirmPasswordError}</span>}
                        <br />
                        <button type="button" onClick={handleRegister}>
                            Zarejestruj się
                        </button>
                    </form>
                </div>
                <div className={`form-container sign-in ${!isRegister ? 'active' : ''}`}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h5>Zaloguj się</h5>
                        <br />
                        <input
                            type="text"
                            placeholder="Login lub Email"
                            className={getInputClass(loginError, login, touched.login)}
                            value={login}
                            onChange={handleLoginChange}
                            onBlur={handleLoginBlur}
                        />
                        {loginError && <span className="error-tooltip">{loginError}</span>}
                        <input
                            type="password"
                            placeholder="Hasło"
                            className={getInputClass(passwordError, password, touched.password)}
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                        />
                        {passwordError && <span className="error-tooltip">{passwordError}</span>}
                        <br />
                        <Link to="/chat">
                            <button type="button" onClick={handleLogin}>Zaloguj się</button>
                        </Link>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h4>Masz już konto?</h4>
                            <br />
                            <button type="button" onClick={handleToggleLogin}>Zaloguj się</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h4>Nie posiadasz konta?</h4>
                            <br />
                            <button type="button" onClick={handleToggleRegister}>Zarejestruj się</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

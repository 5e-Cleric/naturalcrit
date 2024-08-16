import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import cx from 'classnames';

import NaturalCritSVG from '../../../shared/naturalcrit/svg/naturalcrit.svg.jsx';
import AccountActions from '../account.actions.js';

const RedirectLocation = 'NC-REDIRECT-URL';

const LoginPage = ({ redirect = '', user = null }) => {
    const [view, setView] = useState('login'); // 'login' or 'signup'
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        window.document.onkeypress = (e) => {
            if (e.code === 'Enter') handleClick();
        };

        handleRedirectURL();
    }, []);

    const handleRedirectURL = useCallback(() => {
        if (!redirect) {
            window.sessionStorage.removeItem(RedirectLocation);
        } else {
            window.sessionStorage.setItem(RedirectLocation, redirect);
        }
    }, [redirect]);

    const handleUserChange = (e) => {
        setUsername(e.target.value);
        setUsernameExists(true);
        setCheckingUsername(true);

        if (view === 'signup') {
            checkUsername();
        }
    };

    const handlePassChange = (e) => {
        setPassword(e.target.value);
    };

    const handleClick = () => {
        if (!isValid()) return;

        if (view === 'login') login();
        if (view === 'signup') signup();
    };

    const handleRedirect = () => {
        if (!redirect) return window.location.reload();
        setRedirecting(true);
        window.location = redirect;
    };

    const login = () => {
        setProcessing(true);
        setErrors(null);

        AccountActions.login(username, password)
            .then(() => {
                setProcessing(false);
                setErrors(null);
                setSuccess(true);
                handleRedirect();
            })
            .catch((err) => {
                console.log(err);
                setProcessing(false);
                setErrors(err);
            });
    };

    const logout = (e) => {
        e.preventDefault();
        AccountActions.removeSession();
        window.location.reload();
    };

    const signup = () => {
        setProcessing(true);
        setErrors(null);

        AccountActions.signup(username, password)
            .then(() => {
                setProcessing(false);
                setErrors(null);
                setSuccess(true);
                handleRedirect();
            })
            .catch((err) => {
                console.log(err);
                setProcessing(false);
                setErrors(err);
            });
    };

    const checkUsername = useCallback(
        _.debounce(() => {
            if (username === '') return;
            setCheckingUsername(true);

            AccountActions.checkUsername(username).then((doesExist) => {
                setUsernameExists(!!doesExist);
                setCheckingUsername(false);
            });
        }, 1000),
        [username]
    );

    const handleChangeView = (newView) => {
        setView(newView);
        setErrors(null);
        checkUsername();
    };

    const isValid = () => {
        if (processing) return false;

        if (view === 'login') {
            return username && password;
        } else if (view === 'signup') {
            return username && password && !usernameExists;
        }
    };

    const linkGoogle = () => {
        if (user) {
            if (
                !confirm(
                    `You are currently logged in as ${user.username}. ` +
                        `Do you want to link this user to a Google account? ` +
                        `This will allow you to access the Homebrewery with your ` +
                        `Google account and back up your files to Google Drive.`
                )
            )
                return;
        }

        setProcessing(true);
        setErrors(null);
        window.location.href = '/auth/google';
    };

    const renderErrors = () => {
        if (!errors) return null;
        if (errors.msg) return <div className="errors">{errors.msg}</div>;
        return <div className="errors">Something went wrong</div>;
    };

    const renderUsernameValidation = () => {
        if (view === 'login') return null;

        let icon = null;

        if (checkingUsername) {
            icon = <i className="fa fa-spinner fa-spin" />;
        } else if (!username || usernameExists) {
            icon = <i className="fa fa-times red" />;
        } else if (!usernameExists) {
            icon = <i className="fa fa-check green" />;
        }

        return <div className="control">{icon}</div>;
    };

    const renderButton = () => {
        let className = '';
        let text = '';
        let icon = '';

        if (processing) {
            className = 'processing';
            text = 'processing';
            icon = 'fa-spinner fa-spin';
        } else if (view === 'login') {
            className = 'login';
            text = 'login';
            icon = 'fa-sign-in';
        } else if (view === 'signup') {
            className = 'signup';
            text = 'signup';
            icon = 'fa-user-plus';
        }

        return (
            <button
                className={cx('action', className)}
                disabled={!isValid()}
                onClick={handleClick}
            >
                <i className={`fa ${icon}`} />
                {text}
            </button>
        );
    };

    const renderLoggedIn = () => {
        if (!user) return null;
        if (!user.googleId) {
            return (
                <div className="loggedin">
                    You are logged in as {user.username}.{' '}
                    <a href="" onClick={logout}>
                        logout.
                    </a>
                </div>
            );
        } else {
            return (
                <div className="loggedin">
                    You are logged in via Google as {user.username}.{' '}
                    <a href="" onClick={logout}>
                        logout.
                    </a>
                </div>
            );
        }
    };

    return (
        <div className="loginPage">
            <div className="logo">
                <NaturalCritSVG/>
                <span className="name">
                    Natural
                    <span className="crit">Crit</span>
                </span>
            </div>

            <div className="content">
                <div className="switchView">
                    <div
                        className={cx('login', {
                            'selected': view === 'login',
                        })}
                        onClick={() => handleChangeView('login')}
                    >
                        <i className="fa fa-sign-in" /> Login
                    </div>

                    <div
                        className={cx('signup', {
                            'selected': view === 'signup',
                        })}
                        onClick={() => handleChangeView('signup')}
                    >
                        <i className="fa fa-user-plus" /> Signup
                    </div>
                </div>

                <div className="field user">
                    <label>username</label>
                    <input
                        type="text"
                        onChange={handleUserChange}
                        value={username}
                    />
                    {renderUsernameValidation()}
                    {usernameExists &&
                    !checkingUsername &&
                    view === 'signup' ? (
                        <div className="userExists">
                            User with that name already exists
                        </div>
                    ) : null}
                </div>

                <div className="field password">
                    <label>password</label>
                    <input
                        type={cx({ text: visible, password: !visible })}
                        onChange={handlePassChange}
                        value={password}
                    />

                    <div
                        className="control"
                        onClick={() => setVisible(!visible)}
                    >
                        <i
                            className={cx('fa', {
                                'fa-eye': !visible,
                                'fa-eye-slash': visible,
                            })}
                        />
                    </div>
                </div>
                {renderErrors()}
                {renderButton()}
                <div className="divider">⎯⎯ OR ⎯⎯</div>
                <button className="google" onClick={linkGoogle}></button>
            </div>
            {renderLoggedIn()}
        </div>
    );
};

export default LoginPage;

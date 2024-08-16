import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import cx from 'classnames';

import AccountActions from '../account.actions.js';
import NaturalCritSVG from '../../../shared/naturalcrit/svg/naturalcrit.svg.jsx';

const GoogleRedirect = ({ redirect = '', user = null }) => {
    const [view, setView] = useState('login');
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Enter') handleClick();
        };
        window.document.onkeypress = handleKeyPress;
        return () => {
            window.document.onkeypress = null;
        };
    }, [handleClick]);

    const handleUserChange = (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        setUsernameExists(true);
        setCheckingUsername(true);

        if (view === 'signup') {
            debounceCheckUsername(newUsername);
        }
    };

    const handlePassChange = (e) => {
        setPassword(e.target.value);
    };

    const handleClick = () => {
        if (!isValid()) return;
        if (view === 'login') {
            login();
        } else if (view === 'signup') {
            signup();
        }
    };

    const redirectUser = () => {
        if (!redirect) return window.location.reload();
        window.location = redirect;
    };

    const login = () => {
        setProcessing(true);
        setErrors(null);

        AccountActions.login(username, password)
            .then(() => AccountActions.linkGoogle(username, password, user))
            .then(() => {
                window.location = '/success';
            })
            .catch((err) => {
                console.log(err);
                setProcessing(false);
                setErrors(err);
            });
    };

    const signup = () => {
        setProcessing(true);
        setErrors(null);

        AccountActions.signup(username, password)
            .then(() => AccountActions.linkGoogle(username, password, user))
            .then(() => {
                window.location = '/success';
            })
            .catch((err) => {
                console.log(err);
                setProcessing(false);
                setErrors(err);
            });
    };

    const debounceCheckUsername = useCallback(
        _.debounce((newUsername) => {
            if (newUsername === '') return;

            setCheckingUsername(true);
            AccountActions.checkUsername(newUsername).then((doesExist) => {
                setUsernameExists(!!doesExist);
                setCheckingUsername(false);
            });
        }, 1000),
        []
    );

    const handleChangeView = (newView) => {
        setView(newView);
        setErrors(null);
    };

    const isValid = () => {
        if (processing) return false;

        if (view === 'login') {
            return username && password;
        } else if (view === 'signup') {
            return username && password && !usernameExists;
        }
        return false;
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
        } else {
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

    return (
        <div className="loginPage">
            <div className="logo">
                <NaturalCritSVG/>
                <span className="name">
                    Natural
                    <span className="crit">Crit</span>
                </span>
            </div>

            <p>
                To finish linking your Google account to the Homebrewery, please
                create a user ID
                <br />
                for the Homebrewery below (or sign in to an existing Homebrewery
                account).
                <br />
                <br />
                You will only need to complete this step once. After your Google
                account is linked,
                <br />
                you will be able to access the Homebrewery with your Google
                account.
            </p>

            <div className="content">
                <div className="switchView">
                    <div
                        className={cx('login', { selected: view === 'login' })}
                        onClick={() => handleChangeView('login')}
                    >
                        <i className="fa fa-sign-in" /> Login
                    </div>

                    <div
                        className={cx('signup', {
                            selected: view === 'signup',
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
                        view === 'signup' && (
                            <div className="userExists">
                                User with that name already exists
                            </div>
                        )}
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
            </div>
        </div>
    );
};

export default GoogleRedirect;

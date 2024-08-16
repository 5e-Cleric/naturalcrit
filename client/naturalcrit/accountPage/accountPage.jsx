import React, { useState, useEffect } from 'react';


import NaturalCritIcon from 'naturalcrit/svg/naturalcrit.svg.jsx';


//create react component called accountPage
const AccountPage = ({ user }) => {

    console.log(user);

    //usestate of credentials
    //const [credentials, setCredentials] = useState('');

    return (
        <div className="loginPage">
            <a className="logo" href='/'>
                <NaturalCritIcon />
                <span className="name">
                    Natural
                    <span className="crit">Crit</span>
                </span>
            </a>

            <div className="content">
                <h1>Account Settings</h1>
                <p>Manage your account settings here.</p>

                <div className="credentials">
                    <label>Username:
                        <input type="text" value="username" />
                    </label>
                    <label>Password:
                        <input type="password" value="password" />
                    </label>
                </div>
            </div>
        </div>
    );
};

module.exports = AccountPage;

import React, { useEffect } from 'react';

const NaturalCritSVG= require('naturalcrit/svg/naturalcrit.svg.jsx');

const RedirectLocation = 'NC-REDIRECT-URL';

const SuccessPage = ({ redirect = '', user = null }) => {
    useEffect(() => {
        const redirectURL =
            window.sessionStorage.getItem(RedirectLocation) || '/';
        window.sessionStorage.removeItem(RedirectLocation);
        const timeoutId = setTimeout(() => {
            window.location = redirectURL;
        }, 1500);

        return () => clearTimeout(timeoutId); // Cleanup timeout if component unmounts
    }, []);

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
                <p>Successfully logged in!</p>
                <br />
                <br />
                <p>Redirecting...</p>
            </div>
        </div>
    );
};

export default SuccessPage;

import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect,
} from 'react-router-dom';

// Pages
import HomePage from './homePage/homePage.jsx';
import LoginPage from './loginPage/loginPage.jsx';
import SuccessPage from './successPage/successPage.jsx';
import GoogleRedirect from './googleRedirect/googleRedirect.jsx';

const Naturalcrit = ({ user, url, domain, authToken }) => {
    useEffect(() => {
        global.domain = domain;
    }, [domain]);

    return (
        <div className="naturalcrit">
            <Router>
                <Switch>
                    <Route
                        path="/login"
                        render={(props) => (
                            <LoginPage
                                {...props}
                                redirect={new URLSearchParams(
                                    props.location.search
                                ).get('redirect')}
                                user={user}
                            />
                        )}
                    />
                    <Route
                        path="/success"
                        render={(props) => (
                            <SuccessPage {...props} user={user} />
                        )}
                    />
                    <Route
                        path="/auth/google/redirect"
                        render={(props) => (
                            <GoogleRedirect {...props} user={user} />
                        )}
                    />
                    <Route path="/" exact component={HomePage} />
                    {/* Redirect to HomePage for any unmatched routes */}
                    <Redirect to="/" />
                </Switch>
            </Router>
        </div>
    );
};

export default Naturalcrit;

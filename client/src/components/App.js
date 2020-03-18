import React from "react";
import Home from "./pages/Home";
import MyState from "../context/table/MyState";
import DailyState from "../context/daily/DailyState";
import AuthState from "../context/auth/AuthState";
import AlertState from "../context/alert/AlertState";
import LangState from "../context/lang/LangState";
import Login from "./auth/Login";
import { BrowserRouter as Router } from "react-router-dom";

import PropTypes from "prop-types";
import AuthProvider from "./auth/AuthProvider";

const Json = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>;

const App = props => {
  return (
    <Router>
      <AuthState>
        <LangState>
          <MyState>
            <DailyState>
              <AlertState>
                {!props.account ? <Login /> : <Home />}
                {props.error && <p className="error">Error: {props.error}</p>}

                {props.account && (
                  <div className="data-account">
                    <h2>Session Account Data</h2>
                    <Json data={props.account} />
                  </div>
                )}
              </AlertState>
            </DailyState>
          </MyState>
        </LangState>
      </AuthState>
    </Router>
  );
};

App.propTypes = {
  account: PropTypes.object,
  emailMessages: PropTypes.object,
  error: PropTypes.string,
  graphProfile: PropTypes.object,
  onSignIn: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onRequestEmailToken: PropTypes.func.isRequired
};

export default AuthProvider(App);

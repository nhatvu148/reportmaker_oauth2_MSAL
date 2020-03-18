import React, { useReducer } from "react";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import {
  msalApp,
  requiresInteraction,
  fetchMsGraph,
  isIE,
  GRAPH_ENDPOINTS,
  GRAPH_SCOPES,
  GRAPH_REQUESTS
} from "./AuthUtils";
import {
  ERROR,
  LOGIN_RESPONSE,
  GRAPH_PROFILE,
  EMAIL_MESSAGES,
  ACCOUNT
} from "../types";

// If you support IE, our recommendation is that you sign-in using Redirect APIs
const useRedirectFlow = isIE();
// const useRedirectFlow = true;

const AuthState = props => {
  const initialState = {
    account: null,
    error: null,
    emailMessages: null,
    graphProfile: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const acquireToken = async (request, redirect) => {
    return msalApp.acquireTokenSilent(request).catch(error => {
      // Call acquireTokenPopup (popup window) in case of acquireTokenSilent failure
      // due to consent or interaction required ONLY
      if (requiresInteraction(error.errorCode)) {
        return redirect
          ? msalApp.acquireTokenRedirect(request)
          : msalApp.acquireTokenPopup(request);
      } else {
        console.error("Non-interactive error:", error.errorCode);
      }
    });
  };

  const onSignIn = async redirect => {
    if (redirect) {
      return msalApp.loginRedirect(GRAPH_REQUESTS.LOGIN);
    }

    const loginResponse = await msalApp
      .loginPopup(GRAPH_REQUESTS.LOGIN)
      .catch(error => {
        dispatch({ type: ERROR, payload: error.message });
      });

    if (loginResponse) {
      dispatch({ type: LOGIN_RESPONSE, payload: loginResponse.account });

      const tokenResponse = await acquireToken(GRAPH_REQUESTS.LOGIN).catch(
        error => {
          dispatch({ type: ERROR, payload: error.message });
        }
      );

      if (tokenResponse) {
        const graphProfile = await fetchMsGraph(
          GRAPH_ENDPOINTS.ME,
          tokenResponse.accessToken
        ).catch(() => {
          dispatch({ type: ERROR, payload: "Unable to fetch Graph profile." });
        });

        if (graphProfile) {
          dispatch({ type: GRAPH_PROFILE, payload: graphProfile });
        }

        if (tokenResponse.scopes.indexOf(GRAPH_SCOPES.MAIL_READ) > 0) {
          return readMail(tokenResponse.accessToken);
        }
      }
    }
  };

  const onSignOut = () => {
    msalApp.logout();
  };

  const onRequestEmailToken = async () => {
    const tokenResponse = await acquireToken(
      GRAPH_REQUESTS.EMAIL,
      useRedirectFlow
    ).catch(e => {
      dispatch({
        type: ERROR,
        payload: "Unable to acquire access token for reading email."
      });
    });

    if (tokenResponse) {
      return readMail(tokenResponse.accessToken);
    }
  };

  const readMail = async accessToken => {
    const emailMessages = await fetchMsGraph(
      GRAPH_ENDPOINTS.MAIL,
      accessToken
    ).catch(() => {
      dispatch({ type: ERROR, payload: "Unable to fetch email messages." });
    });

    if (emailMessages) {
      dispatch({ type: EMAIL_MESSAGES, payload: emailMessages });
    }
  };

  const handleCallback = async () => {
    msalApp.handleRedirectCallback(error => {
      if (error) {
        const errorMessage = error.errorMessage
          ? error.errorMessage
          : "Unable to acquire access token.";
        // setState works as long as navigateToLoginRequestUrl: false
        dispatch({ type: ERROR, payload: errorMessage });
      }
    });

    const account = msalApp.getAccount();

    dispatch({ type: ACCOUNT, payload: account });

    if (account) {
      const tokenResponse = await acquireToken(
        GRAPH_REQUESTS.LOGIN,
        useRedirectFlow
      );

      if (tokenResponse) {
        const graphProfile = await fetchMsGraph(
          GRAPH_ENDPOINTS.ME,
          tokenResponse.accessToken
        ).catch(() => {
          dispatch({ type: ERROR, payload: "Unable to fetch Graph profile." });
        });

        if (graphProfile) {
          dispatch({ type: GRAPH_PROFILE, payload: graphProfile });
        }

        if (tokenResponse.scopes.indexOf(GRAPH_SCOPES.MAIL_READ) > 0) {
          return readMail(tokenResponse.accessToken);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        account: state.account,
        emailMessages: state.emailMessages,
        error: state.error,
        graphProfile: state.graphProfile,
        onSignIn,
        onSignOut,
        onRequestEmailToken,
        handleCallback
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
export default AuthState;

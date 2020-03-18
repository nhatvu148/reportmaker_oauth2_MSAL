import {
  ERROR,
  LOGIN_RESPONSE,
  GRAPH_PROFILE,
  EMAIL_MESSAGES,
  ACCOUNT
} from "../types";

export default (state, action) => {
  switch (action.type) {
    case ERROR:
      return {
        ...state,
        error: action.payload
      };

    case LOGIN_RESPONSE:
      return {
        ...state,
        account: action.payload,
        error: null
      };

    case GRAPH_PROFILE:
      return {
        ...state,
        graphProfile: action.payload
      };

    case EMAIL_MESSAGES:
      return {
        ...state,
        emailMessages: action.payload,
        error: null
      };

    case ACCOUNT:
      return {
        ...state,
        account: action.payload
      };

    default:
      return state;
  }
};

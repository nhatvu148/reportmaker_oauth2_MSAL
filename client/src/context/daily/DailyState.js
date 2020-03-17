import React, { useReducer } from "react";
import axios from "axios";
import DailyContext from "./dailyContext";
import DailyReducer from "./dailyReducer";
import { SET_LOADING, GET_DAILY_DATA, CLEAR_DAILY_LOGOUT } from "../types";

const DailyState = props => {
  const initialState = {
    loading: false,
    dailySource: [],
    sort: true
  };

  const [state, dispatch] = useReducer(DailyReducer, initialState);

  const getDailyData = async (name, sort) => {
    setLoading();

    const sortBy = sort ? "ASC" : "DESC";

    const res = await axios.get(`api/daily`, {
      params: {
        name,
        sortBy
      }
    });

    // console.log("daily: ", res.data.data);

    const newData = res.data.data.map((item, index) => {
      return {
        key: index,
        Date: item.workdate,
        "Project ID": item.pjid,
        "Project Name": item.pjname,
        Deadline: item.deadline,
        "Expected Date": item.expecteddate,
        SubId: item.subid,
        SubName: item.subname,
        "Status (%)": item.percent,
        Comment: item.comment,
        "Work Time": item.worktime,
        "Start Hour": item.starthour,
        "Start Min": item.startmin,
        "End Hour": item.endhour,
        "End Min": item.endmin
      };
    });
    // console.log(newData);
    dispatch({
      type: GET_DAILY_DATA,
      payload: newData
    });
  };

  const setLoading = () => dispatch({ type: SET_LOADING });

  const clearDailyLogout = () => {
    dispatch({ type: CLEAR_DAILY_LOGOUT });
  };

  return (
    <DailyContext.Provider
      value={{
        dispatch,
        dailySource: state.dailySource,
        loading: state.loading,
        sort: state.sort,
        getDailyData,
        clearDailyLogout
      }}
    >
      {props.children}
    </DailyContext.Provider>
  );
};

export default DailyState;

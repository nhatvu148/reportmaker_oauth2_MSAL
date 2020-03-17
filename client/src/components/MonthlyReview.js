import React, { useState, useContext, useEffect, useRef } from "react";
import MyContext from "../context/table/myContext";
import AuthContext from "../context/auth/authContext";
import LangContext from "../context/lang/langContext";
import ProgressBar from "./layout/ProgressBar";
import { SELECT_PAGE } from "../context/types";
import {
  Button,
  Layout,
  Breadcrumb,
  DatePicker,
  message,
  Row,
  Col
} from "antd";
import axios from "axios";
import moment from "moment";
import SpreadSheet from "./spreadsheet/SpreadSheet";

const MonthlyReview = props => {
  // console.log(props.match.path);
  const myContext = useContext(MyContext);
  const authContext = useContext(AuthContext);
  const langContext = useContext(LangContext);

  const { currentLangData } = langContext;
  const {
    monthlyReview: { _reportMonth, _selectMonth, _downloadTimeSheet }
  } = currentLangData
    ? currentLangData
    : {
        monthlyReview: {
          _reportMonth: "Report Month:",
          _selectMonth: "Select Month",
          _downloadTimeSheet: "Download Time Sheet"
        }
      };

  const spreadsheet = useRef();

  const { Content } = Layout;

  const { loading, dispatch } = myContext;

  const { user } = authContext;
  const name = user && user.name;

  const [monthSelect, setMonthSelect] = useState("");
  const [sheetEvent, setSheetEvent] = useState("");
  // const [sheet, setSheet] = useState("");

  useEffect(() => {
    if (loading) {
      ProgressBar.start();
    }
    if (!loading) {
      ProgressBar.done();
    }
  });

  useEffect(() => {
    dispatch({
      type: SELECT_PAGE,
      payload: "/monthlyreview"
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // console.log(
    //   "spreadsheet: ",
    //   spreadsheet.current.spreadsheet.events,
    //   "sheetEvent: ",
    //   sheetEvent
    // );
    spreadsheet.current.spreadsheet.events.on(
      "afterValueChange",
      (cell, value) => {
        setSheetEvent(`Value in cell ${cell} changed to ${value}`);
      }
    );
    spreadsheet.current.spreadsheet.setValue("C3", "UNDER");
    spreadsheet.current.spreadsheet.setValue("C4", "DEVELOPMENT");
  }, [sheetEvent]);

  const onChangeDate = async date => {
    if (date !== null) {
      const monthStartDate = date
        .startOf("month")
        .format("YYYYMMDD")
        .toString();
      await axios.get(`api/timesheet/get`, {
        params: {
          name,
          monthStartDate
        }
      });
      setMonthSelect(monthStartDate);
    }
  };

  const onDownload = async (name, monthSelect) => {
    try {
      const res = await axios.get(`api/xlsx/timesheet`, {
        responseType: "blob",
        //Force to receive data in a Blob Format
        params: {
          name,
          monthStartDate: monthSelect
        }
      });

      //Create a Blob from the PDF Stream
      const file = new Blob([res.data], {
        type: "application/xlsx"
      });
      //Build a URL from the file
      const fileURL = URL.createObjectURL(file);
      //Open the URL on new Window
      const link = document.createElement("a");

      link.href = fileURL;

      link.setAttribute(
        "download",
        `FlextimeSheetForm_${moment(monthSelect, "YYYYMM")
          .format("YYYYMM")
          .toString()}_${name}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout style={{ padding: "0 15px 15px" }}>
      <Breadcrumb style={{ margin: "16px 0" }} />
      <Content
        style={{
          padding: "20px 50px",
          borderRadius: "2px",
          position: "relative",
          transition: "all .3s"
        }}
      >
        <Row>
          <Col lg={{ span: 8, offset: 5 }}>
            <Button size="middle" style={{ margin: "0px 5px 0 0" }}>
              {_reportMonth}
            </Button>
            <DatePicker
              placeholder={_selectMonth}
              picker="month"
              bordered={true}
              onChange={date => {
                onChangeDate(date);
              }}
            />
          </Col>
          <Col lg={{ span: 8, offset: 2 }}>
            <Button
              size="middle"
              onClick={() => {
                if (monthSelect === "") {
                  message.error("Please select a month!");
                } else {
                  onDownload(name, monthSelect);
                }
              }}
              type="primary"
              style={{ margin: "0px 50px 16px 0" }}
            >
              {_downloadTimeSheet}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col lg={{ span: 20, offset: 2 }}>
            <SpreadSheet
              ref={spreadsheet}
              rowsCount={200}
              colsCount={20}
              menu={true}
              readonly={false}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default MonthlyReview;

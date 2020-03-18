import React from "react";
import "antd/dist/antd.css";
import "../Style.css";
import { Button, Row, Col, Card } from "antd";
import { withRouter } from "react-router-dom";
import Microsoft from "./microsoft.png";

import PropTypes from "prop-types";
import AuthProvider from "./AuthProvider";

const Login = props => {
  return (
    <Row>
      <Col xs={0} sm={0} md={8} lg={16}>
        <img
          alt="/"
          width="100%"
          height={document.body.clientHeight}
          style={{ zIndex: "-1" }}
          src="https://i.insider.com/5d26280921a86107bb51bd92?width=1067&format=jpeg"
        />
      </Col>
      <Col
        xs={24}
        sm={24}
        md={16}
        lg={8}
        style={{ height: "730px", textAlign: "center" }}
      >
        <Card
          style={{
            margin: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderColor: "#1890ff",
            borderWidth: "1.5px",
            padding: "40px 20px"
          }}
          bordered={true}
        >
          <div className="logo">
            <h2>
              <a
                href="http://www.e-technostar.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt="/"
                  width={160}
                  src="http://www.e-technostar.com/beta2016/wp-content/uploads/2019/04/technostar_logo_w210.png"
                />
              </a>
            </h2>
          </div>
          <h1
            style={{
              color: "#1890ff",
              marginBottom: "50px"
            }}
          >
            Report Maker
          </h1>
          <Button
            size="large"
            type="default"
            onClick={() => {
              props.onSignIn();
              props.history.push("/weeklyreview");
            }}
          >
            <img src={Microsoft} width="20px" style={{ marginRight: "10px" }} />
            <span style={{ fontWeight: "bold" }}>Log in with Microsoft</span>
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

Login.propTypes = {
  onSignIn: PropTypes.func.isRequired
};

export default AuthProvider(withRouter(Login));

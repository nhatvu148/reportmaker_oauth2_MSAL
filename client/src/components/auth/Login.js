import React from "react";
import "antd/dist/antd.css";
import "../Style.css";
import { Button, Row, Col } from "antd";

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
        <Button
          size="large"
          type="primary"
          htmlType="submit"
          className="login-form-button"
          onClick={() => {
            props.onSignIn();
            // props.history.push("/inputdata");
          }}
        >
          Log in
        </Button>
      </Col>
    </Row>
  );
};

Login.propTypes = {
  onSignIn: PropTypes.func.isRequired
};

export default AuthProvider(Login);

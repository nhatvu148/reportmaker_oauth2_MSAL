import React, { useContext } from "react";
import "antd/dist/antd.css";
import "../Style.css";
import { Button, Card } from "antd";

import Microsoft from "./microsoft.png";
import AuthContext from "../../context/auth/authContext";

const Login = () => {
  const authContext = useContext(AuthContext);
  const { onSignIn } = authContext;

  return (
    <Card
      style={{
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderColor: "#1890ff",
        borderWidth: "1.5px",
        padding: "40px 20px",
        textAlign: "center"
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
          onSignIn();
        }}
      >
        <img
          src={Microsoft}
          alt=""
          width="20px"
          style={{ marginRight: "10px" }}
        />
        <span style={{ fontWeight: "bold" }}>Log in with Microsoft</span>
      </Button>
    </Card>
  );
};

export default Login;

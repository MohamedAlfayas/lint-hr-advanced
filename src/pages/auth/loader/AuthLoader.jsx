import React from "react";
import { Col, Row } from "reactstrap";
import logo from "../../../assets/images/logo-dark.png";
import animation from "../loader/animation/Animation-login-loader.json";
import loader from "../loader/animation/Animation-preloader.json";
import Lottie from "react-lottie";

const AuthLoader = () => {
  const defaultOptions1 = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: loader,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div>
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Row>
          <Col lg={12}>
            <div className="text-center mt-sm-5 mb-4 text-white-50">
              <div>
                <img src={logo} alt="" height="20" />
              </div>
              <p className="mt-3 fs-15 fw-medium" style={{ color: "black" }}>
                One moment, your site is starting up!
              </p>

              <Lottie options={defaultOptions1} height={400} width={400} />
              <div>
                <p className="mt-3 fs-15 fw-medium" style={{ color: "black" }}>
                  Our robots are working on your LintHr site.
                </p>
              </div>
              <div>
                <p className="mt-3 fs-15 fw-medium" style={{ color: "black" }}>
                  This won't take more than a minute, You'll be tken there once
                  it's ready.
                </p>
              </div>
              <Lottie options={defaultOptions2} height={100} width={100} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AuthLoader;

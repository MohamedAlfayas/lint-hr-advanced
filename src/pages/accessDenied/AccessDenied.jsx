import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";

// Import Images
import errorImg from "../../assets/images/error.svg";
import { MetaTitle } from "../../common/data/MetaTitle";

const AccessDenied = () => {
  document.title = `Access Denied | ${MetaTitle}`;
  return (
    <React.Fragment>
      <div className="auth-page-content mt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center pt-4">
                <div className="">
                  <img
                    src={errorImg}
                    alt=""
                    className="error-basic-img move-animation"
                  />
                </div>
                <div className="mt-n4">
                  <h1 className="display-1 fw-medium">OOPS !!!</h1>
                  <h3 className="text-uppercase">Sorry, Access Denied 😭</h3>
                  <Link to="/" className="btn btn-success">
                    <i className="mdi mdi-home me-1"></i>Back to home
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AccessDenied;

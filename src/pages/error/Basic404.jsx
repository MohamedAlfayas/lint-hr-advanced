import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";

// Import Images
import errorImg from "../../assets/images/error400-cover.png";
import { MetaTitle } from "../../common/data/MetaTitle";

const Basic404 = () => {
  document.title = `404 | ${MetaTitle}`;
  return (
    <React.Fragment>
      <div className="auth-page-content mt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center pt-4">
                <div className="">
                  <img src={errorImg} alt="" className="error-basic-img" />
                </div>
                <div className="mt-4">
                  <h2 className="display-1 fw-medium">OOPS !!!</h2>
                  <h3 className="text-uppercase">Sorry, Page not Found 😭</h3>
                  <p className="text-muted mb-4">
                    The page you are looking for not available!
                  </p>
                  <Link data-testid="not-found-back-to-home-link" to="/" className="btn btn-success">
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

export default Basic404;

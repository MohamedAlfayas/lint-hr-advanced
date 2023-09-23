import React from "react";
import { Link } from "react-router-dom";

import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

const DepartmentsTab = () => {
  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <h4 className="card-title mb-0">Departments</h4>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="sitemap-content">
                <figure className="sitemap-horizontal">
                  <ul className="administration">
                    <li>
                      <ul className="director">
                        <li>
                          <Link to="#" className="fw-semibold">
                            <span>Lintcloud</span>
                          </Link>
                          <ul className="subdirector">
                            <li>
                              <Link to="#" className="fw-semibold">
                                <span>Contact Us</span>
                              </Link>
                              
                            </li>
                          </ul>
                          
                          <ul className="departments">
                            <li>
                              <Link to="#" className="fw-semibold">
                                <span>Main Pages</span>
                              </Link>
                            </li>

                            <li className="department">
                              <Link to="#" className="fw-semibold">
                                <span>Account Management</span>
                              </Link>
                              <ul>
                                <li>
                                  <Link to="#">
                                    <span>Sign Up</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Login</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Profile Settings</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Modify Reservation</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Cancel Reservation</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Write Reviews</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                            <li className="department">
                              <Link to="#" className="fw-semibold">
                                <span>About Us</span>
                              </Link>
                              <ul>
                                <li>
                                  <Link to="#">
                                    <span>Overview</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Connect Via Social Media</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Careers</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Team Members</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Policies</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                            <li className="department">
                              <Link to="#" className="fw-semibold">
                                <span>Book a Trip</span>
                              </Link>
                              <ul>
                                <li>
                                  <Link to="#">
                                    <span>Travel Details</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Reservation Process</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Payment Option</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Comfirmation</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                            <li className="department">
                              <Link to="#" className="fw-semibold">
                                <span>Destination</span>
                              </Link>
                              <ul>
                                <li>
                                  <Link to="#">
                                    <span>Architecture</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Art</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Entertainment</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>History</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Science</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Sports</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Music</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Tracking Camp</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                            <li className="department">
                              <Link to="#" className="fw-semibold">
                                <span>Travel Tips</span>
                              </Link>
                              <ul>
                                <li>
                                  <Link to="#">
                                    <span>General Travel</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Helpth Concerns</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>Safety Measures</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <span>FAQ's</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </figure>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default DepartmentsTab;

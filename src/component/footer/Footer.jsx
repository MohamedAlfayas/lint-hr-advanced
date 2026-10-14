import React from 'react';
import { Container } from 'reactstrap';

const Footer = () => {
    return (
        <React.Fragment>
            <footer className="footer app-footer">
                <Container fluid>
                    <div className="app-footer-row">
                        <div className="app-footer-left">
                            <span className="app-footer-dot" />
                            <span>
                                {new Date().getFullYear()} © <b>Lint HR</b>
                            </span>
                            <span className="app-footer-sep" />
                            <span className="d-none d-md-inline">All rights reserved</span>
                        </div>
                        <div className="app-footer-right d-none d-sm-flex">
                            Designed & Developed with
                            <i className="ri-heart-3-fill app-footer-heart" />
                            by
                            <a data-testid="footer-lintcloud-link" target='_blank' rel='noopener noreferrer' href='https://www.lintcloud.com/'>
                                Lintcloud
                                <i className="ri-arrow-right-up-line" />
                            </a>
                        </div>
                    </div>
                </Container>
            </footer>
        </React.Fragment>
    );
};

export default Footer;

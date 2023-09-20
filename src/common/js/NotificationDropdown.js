import React, { useState } from 'react';
import { Col, Dropdown, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';


const NotificationDropdown = () => {
    //Dropdown Toggle
    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
    const toggleNotificationDropdown = () => {
        setIsNotificationDropdown(!isNotificationDropdown);
    };

    
    return (
        <React.Fragment>
            <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown ms-1 header-item">
                <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                    <i className='bx bx-bell fs-22'></i>
                    <span
                        className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">3<span
                            className="visually-hidden">unread messages</span></span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                    <div className="dropdown-head bg-primary bg-pattern rounded-top">
                        <div className="p-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="m-0 fs-16 fw-semibold text-white"> Notifications </h6>
                                </Col>
                                <div className="col-auto dropdown-tabs">
                                    <span className="badge bg-light-subtle fs-13"> 4 New</span>
                                </div>
                            </Row>
                        </div>

                    </div>
                    
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default NotificationDropdown;
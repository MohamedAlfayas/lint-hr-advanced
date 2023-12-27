import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import "../../../pages/payroll/SalaryPoliciesModal.css";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Input,
    Label,
    Row,
    UncontrolledDropdown,
    Table,
    Modal,
    ModalBody,
} from "reactstrap";


const locationEditForm = () => {

    const [address, setAddress] = useState("Lint HQ");
    const [map, setMap] = useState(null);
    const [geofencingEnabled, setGeofencingEnabled] = useState(false);

    const handleGeofencingChange = () => {
       
        const newValue = !geofencingEnabled;
        setGeofencingEnabled(newValue);
    
        
        console.log("GeoFencing",newValue);
      };
    // Google Maps API Configuration
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
    });

    const containerStyle = {
        width: "600px",
        height: "450px",
    };

    const center = {
        lat: 30.3165,
        lng: 78.0322,
    };

    const onLoad = (map) => {
        setMap(map);
    };

    const onUnmount = () => {
        setMap(null);
    };

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const handleShowOnMap = () => {
        // Use the Google Maps Geocoding API to convert the address to coordinates
        if (map) {
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ address: address }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const location = results[0].geometry.location;
                    map.panTo(location);
                    new window.google.maps.Marker({
                        position: location,
                        map: map,
                        title: address,
                    });
                } else {
                    console.error("Geocode was not successful for the following reason:", status);
                }
            });
        }
    };
    const radius_option = useMemo(
        () => [
            { id: "1", label: "10(meters)", value: "10(meters)" },
            { id: "2", label: "25(meters)", value: "25(meters)" },
            { id: "3", label: "50(meters)", value: "50(meters)" },
            { id: "4", label: "100(meters)", value: "100(meters)" },
            { id: "5", label: "200(meters)", value: "200(meters)" },
            { id: "6", label: "500(meters)", value: "500(meters)" },
        ],
        []
    );
    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
    
       
        switch (id) {
          case "webAppCheckbox":
           
            console.log("Web App Checkbox is checked:", checked);
            break;
          case "mobileAppCheckbox1":
           
            console.log("Mobile App Checkbox 1 is checked:", checked);
            break;
          case "mobileAppCheckbox2":
           
            console.log("Mobile App Checkbox 2 is checked:", checked);
            break;

            case "allowclockin/out":
           
            console.log("Allow clock in/out:", checked);
            break;  
          
    
          default:
            break;
        }
      };



    return (
        <React.Fragment>
            <Row>

                <div>
                    <Label className="form-label">
                        Allow Clocking in/out on
                    </Label>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <Card className="p-3 mb-3">
                                <div>
                                    <Label>
                                        Web App
                                    </Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="webAppCheckbox"
                                        name="webAppUnit"
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={handleCheckboxChange}
                                        required
                                    />
                                    {" "}
                                    <Label>Using Manual Button</Label>
                                </div>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card className="p-3 mb-3">
                                <div>
                                    <Label>
                                        Mobile App
                                    </Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="mobileAppCheckbox1"
                                        name="mobileAppUnit1"
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={handleCheckboxChange}
                                        required
                                    />
                                    {" "}
                                    <Label>Using Manual Button</Label>
                                </div>
                                <div className="form-icon right">
                                    <Input
                                        id="mobileAppCheckbox2"
                                        name="mobileAppUnit2"
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={handleCheckboxChange}
                                        required
                                    />
                                    {" "}
                                    <Label>Using QR Code</Label>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <Row>
                        <Col lg={3} sm={3}>
                            <Label
                                className="form-label"
                                htmlFor="geofencinge">
                                Geofencing
                            </Label>
                        </Col>
                        <Col lg={6} sm={12}>
                            <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr">
                                {" "}
                                <Input
                                    id="geofencinge"
                                    name="geofencing"
                                    type="checkbox"
                                    className="form-check-input"
                                    onChange={handleGeofencingChange}
                                    checked={geofencingEnabled}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <Col md={12} lg={12} xxl={12}>
                    <div className="form-check form-check-inline">
                        <Input
                            id="allowclockin/out"
                            name="allowclockin/out"
                            type="checkbox"
                            className="form-check-input"
                            onChange={handleCheckboxChange}
                            required
                        />
                        <Label className="form-check-label" htmlFor="lt_day">
                            Allow clock in/out outside the office    <i
                                className="ri-information-line"
                                style={{ fontSize: "16px" }}
                            ></i>
                        </Label>
                    </div>
                </Col>
                <Col md={8} lg={8} xxl={8}>
                    <div>
                        <Label htmlFor="calculation" className="form-label">
                            Accurate Address*
                        </Label>
                        <div>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                className="form-control"
                                value={address}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div id="passwordHelpBlock" className="form-text mb-3">
                            Select Accurate Address.
                        </div>
                        <Button onClick={handleShowOnMap}>Show on Map</Button>
                    </div>
                </Col>

               
                <Col md={4} lg={4} xxl={4}>
                    <div>
                        <Label
                            htmlFor="calculation"
                            className="form-label"
                        >
                            Radius*
                        </Label>
                        <div>
                            <Select
                                id="calculation"
                                isMulti={false}
                                options={radius_option || []}

                                className="basic-multi-select "
                            />
                        </div>
                        <div
                            id="passwordHelpBlock"
                            className="form-text mb-3"
                        >
                            Select Radius.
                        </div>
                    </div>
                </Col>
                 {/* Google Map */}
                 {isLoaded && (
                    <Row>
                        <Col md={12} lg={12} xxl={12}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={15}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                            />
                        </Col>
                    </Row>
                )}
                {/* <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15788.616204555916!2d77.608336!3d8.3865046!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0466d806f588db%3A0xd3d872a8344891bd!2sLintcloud%20IT%20Software%20Solution!5e0!3m2!1sen!2sin!4v1703143228667!5m2!1sen!2sin"
                    width="600"
                    height="450"
                    style={{ border: '0' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe> */}
            </Row>



        </React.Fragment>
    );
};

export default locationEditForm;

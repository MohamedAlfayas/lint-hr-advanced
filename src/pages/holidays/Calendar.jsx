import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";



import {
    Card,
    CardBody,
    Container,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    Col
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import BootstrapTheme from "@fullcalendar/bootstrap";
import Flatpickr from "react-flatpickr";

//redux
import { useSelector, useDispatch } from "react-redux";




//Simple bar


import listPlugin from '@fullcalendar/list';




const Calender = () => {
    const dispatch = useDispatch();

    const [modal, setModal] = useState(false);

    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedNewDay, setSelectedNewDay] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const [isEditButton, setIsEditButton] = useState(true);
    const events = [

        {
            id: '1',
            title: 'Diwali',
            start: '12-11-2023',
            className: "bg-success-subtle text-success",
        },
        {
            id: '2',
            title: 'Leo Day',
            start: '19-10-2023',
            className: "bg-danger-subtle text-danger",
        },

    ];


    // Inside your component

    useEffect(() => {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
            // setEvents(JSON.parse(savedEvents));
        }
    }, []);

    // Effect to save events to local storage when events change
    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }, [events]);



    /**
     * Handling the modal state
     */
    const toggle = () => {
        if (modal) {
            setModal(false);
            // setEvents(null);
            setIsEdit(false);
            setIsEditButton(true);
        } else {
            setModal(true);
        }
    };
    /**
     * Handling date click on calendar
     */

    const handleDateClick = (arg) => {
        const date = arg["date"];
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const currectDate = new Date();
        const currentHour = currectDate.getHours();
        const currentMin = currectDate.getMinutes();
        const currentSec = currectDate.getSeconds();
        const modifiedDate = new Date(
            year,
            month,
            day,
            currentHour,
            currentMin,
            currentSec
        );

        const modifiedData = { ...arg, date: modifiedDate };

        setSelectedNewDay(date);
        setSelectedDay(modifiedData);
        toggle();
    };

    const str_dt = function formatDate(date) {
        var monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        var d = new Date(date),
            month = "" + monthNames[d.getMonth()],
            day = "" + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [day + " " + month, year].join(",");
    };

    const date_r = function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [year, month, day].join("-");
    };

    /**
     * Handling click on events on calendar
     */
    const handleEventClick = (arg) => {
        const events = arg.events;

        const st_date = events.start;
        const ed_date = events.end;
        const r_date =
            ed_date == null
                ? str_dt(st_date)
                : str_dt(st_date) + " to " + str_dt(ed_date);
        const er_date =
            ed_date == null
                ? date_r(st_date)
                : date_r(st_date) + " to " + date_r(ed_date);

        // setEvents({
        //     id: events.id,
        //     title: events.title,
        //     start: events.start,
        //     end: events.end,
        //     className: events.classNames,
        //     category: events.classNames[0],
        //     location: events._def.extendedProps.location,
        //     description: events._def.extendedProps.description,
        //     defaultDate: er_date,
        //     datetag: r_date,
        // });

        setIsEdit(true);
        setIsEditButton(false);
        toggle();
    };
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            title: (events && events.title) || "",
            category: (events && events.category) || "",
            location: (events && events.location) || "",
            description: (events && events.description) || "",
            defaultDate: (events && events.defaultDate) || "",
            datetag: (events && events.datetag) || "",
        },

        validationSchema: Yup.object({
            title: Yup.string().required("Please Enter Your Event Name"),
            category: Yup.string().required("Please Select Your Category"),
        }),
        onSubmit: (values) => {
            var updatedDay = "";
            if (selectedNewDay) {
                updatedDay = new Date(selectedNewDay[1]);
                updatedDay.setDate(updatedDay.getDate() + 1);
            }

            if (isEdit) {
                const updateEvent = {
                    id: events.id,
                    title: values.title,
                    className: values.category,
                    start: selectedNewDay ? selectedNewDay[0] : events.start,
                    end: selectedNewDay ? updatedDay : events.end,
                    location: values.location,
                    description: values.description,
                };
                // update events
                dispatch(onUpdateEvent(updateEvent));
                validation.resetForm();
            } else {
                const newEvent = {
                    id: Math.floor(Math.random() * 100),
                    title: values["title"],
                    start: selectedDay ? selectedNewDay[0] : new Date(),
                    end: selectedDay ? updatedDay : new Date(),
                    className: values.category,
                    location: values["location"],
                    description: values["description"],
                };
                // save new events
                dispatch(onAddNewEvent(newEvent));
                validation.resetForm();
            }
            setSelectedDay(null);
            setSelectedNewDay(null);
            toggle();
        },
    });

    function convertDateFormat(inputDate) {
        // Assuming inputDate is in the 'dd-mm-yyyy' format
        const parts = inputDate.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            // Create a new Date object using the parts and format it to 'yyyy-mm-dd'
            const convertedDate = new Date(`${year}-${month}-${day}`);
            // Use toISOString() to get the date in 'yyyy-mm-dd' format
            return convertedDate.toISOString().split('T')[0];
        } else {
            // If the input format is invalid, return the original string
            return inputDate;
        }
    }



    document.title = "Calendar | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>

            <div className="page-content">
                <Container fluid>

                    <Row>
                        <Col xs={12}>
                            <Row>


                                <Col xl={14}>
                                    <Card className="card-h-100">
                                        <CardBody>
                                            <FullCalendar
                                                plugins={[
                                                    BootstrapTheme,
                                                    dayGridPlugin,
                                                    interactionPlugin,
                                                    listPlugin
                                                ]}
                                                initialView="dayGridMonth"
                                                slotDuration={"00:15:00"}
                                                handleWindowResize={true}
                                                themeSystem="bootstrap"
                                                headerToolbar={{
                                                    left: "prev,next today",
                                                    center: "title",
                                                    right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek",
                                                }}

                                                editable={true}
                                                droppable={true}
                                                selectable={true}
                                                // events={eee}
                                                events={events.map(obj =>({
                                                    ...obj,
                                                    start : convertDateFormat(obj.start)
                                                }))}
                                            // dateClick={handleDateClick}
                                            // eventsClick={handleEventClick}

                                            />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>

                            <div style={{ clear: "both" }}></div>

                            <Modal isOpen={modal} id="events-modal" centered>
                                <ModalHeader toggle={toggle} tag="h5" className="p-3 bg-info-subtle modal-title">
                                    {!!isEdit ? "Edit Event" : "Add Event"}
                                </ModalHeader>
                                <ModalBody>
                                    <Form
                                        className={
                                            !!isEdit
                                                ? "needs-validation view-events"
                                                : "needs-validation"
                                        }
                                        name="events-form"
                                        id="form-events"
                                        onSubmit={(e) => {
                                            e.preventsDefault();
                                            validation.handleSubmit();
                                            return false;
                                        }}
                                    >
                                        {!!isEdit ? (
                                            <div className="text-end">
                                                <Link
                                                    to="#"
                                                    className="btn btn-sm btn-soft-primary"
                                                    id="edit-events-btn"
                                                    onClick={(e) => {
                                                        e.preventsDefault();
                                                        submitOtherEvent();
                                                        return false;
                                                    }}
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        ) :
                                            null
                                        }


                                        <div className="events-details">
                                            <div className="d-flex mb-2">
                                                <div className="flex-grow-1 d-flex align-items-center">
                                                    <div className="flex-shrink-0 me-3">
                                                        <i className="ri-calendar-events-line text-muted fs-16"></i>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6
                                                            className="d-block fw-semibold mb-0"
                                                            id="events-start-date-tag"
                                                        >
                                                            {events ? events.datetag : ""}
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="flex-shrink-0 me-3">
                                                    <i className="ri-map-pin-line text-muted fs-16"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="d-block fw-semibold mb-0">
                                                        {" "}
                                                        <span id="events-location-tag">
                                                            {events && events.location !== undefined ? events.location : "No Location"}
                                                        </span>
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="d-flex mb-3">
                                                <div className="flex-shrink-0 me-3">
                                                    <i className="ri-discuss-line text-muted fs-16"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <p
                                                        className="d-block text-muted mb-0"
                                                        id="events-description-tag"
                                                    >
                                                        {events && events.description !== undefined ? events.description : "No Description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Row className="events-form">
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label className="form-label">Type</Label>
                                                    <Input
                                                        className={
                                                            !!isEdit
                                                                ? "form-select d-none"
                                                                : "form-select d-block"
                                                        }
                                                        name="category"
                                                        id="events-category"
                                                        type="select"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.category || ""}
                                                    >
                                                        <option value="bg-danger-subtle">Danger</option>
                                                        <option value="bg-success-subtle">Success</option>
                                                        <option value="bg-primary-subtle">Primary</option>
                                                        <option value="bg-info-subtle">Info</option>
                                                        <option value="bg-dark-subtle">Dark</option>
                                                        <option value="bg-warning-subtle">Warning</option>
                                                    </Input>
                                                    {validation.touched.category &&
                                                        validation.errors.category ? (
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.category}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label className="form-label">Event Name</Label>
                                                    <Input
                                                        className={
                                                            !!isEdit
                                                                ? "form-control d-none"
                                                                : "form-control d-block"
                                                        }
                                                        placeholder="Enter events name"
                                                        type="text"
                                                        name="title"
                                                        id="events-title"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.title || ""}
                                                    // invalid={
                                                    //   validation.touched.title &&
                                                    //   validation.errors.title
                                                    //     ? true
                                                    //     : false
                                                    // }
                                                    />
                                                    {validation.touched.title &&
                                                        validation.errors.title ? (
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.title}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label>Event Date</Label>
                                                    <div
                                                        className={
                                                            !!isEdit ? "input-group d-none" : "input-group"
                                                        }
                                                    >
                                                        <Flatpickr
                                                            className="form-control"
                                                            id="events-start-date"
                                                            name="defaultDate"
                                                            placeholder="Select Date"
                                                            value={validation.values.defaultDate || ""}
                                                            options={{
                                                                mode: "range",
                                                                dateFormat: "Y-m-d",
                                                            }}
                                                            onChange={(date) => {
                                                                setSelectedNewDay(date);
                                                            }}
                                                        />
                                                        <span className="input-group-text">
                                                            <i className="ri-calendar-events-line"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label htmlFor="events-location">Location</Label>
                                                    <div>
                                                        <Input
                                                            type="text"
                                                            className={
                                                                !!isEdit
                                                                    ? "form-control d-none"
                                                                    : "form-control d-block"
                                                            }
                                                            name="location"
                                                            id="events-location"
                                                            placeholder="Event location"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.location || "No Location"}
                                                        // invalid={
                                                        //   validation.touched.location &&
                                                        //   validation.errors.location
                                                        //     ? true
                                                        //     : false
                                                        // }
                                                        />
                                                        {validation.touched.location &&
                                                            validation.errors.location ? (
                                                            <FormFeedback type="invalid">
                                                                {validation.errors.location}
                                                            </FormFeedback>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label className="form-label">Description</Label>
                                                    <textarea
                                                        className={
                                                            !!isEdit
                                                                ? "form-control d-none"
                                                                : "form-control d-block"
                                                        }
                                                        id="events-description"
                                                        name="description"
                                                        placeholder="Enter a description"
                                                        rows="3"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.description || "No Description"}
                                                    // invalid={
                                                    //   validation.touched.description &&
                                                    //   validation.errors.description
                                                    //     ? true
                                                    //     : false
                                                    // }
                                                    ></textarea>
                                                    {validation.touched.description &&
                                                        validation.errors.description ? (
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.description}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="hstack gap-2 justify-content-end">
                                            {!!isEdit && (
                                                <button
                                                    type="button"
                                                    className="btn btn-soft-danger"
                                                    id="btn-delete-events"

                                                >
                                                    <i className="ri-close-line align-bottom"></i> Delete
                                                </button>
                                            )}
                                            {isEditButton && <button
                                                type="submit"
                                                className="btn btn-success"
                                                id="btn-save-events"
                                            >
                                                {!!isEdit ? "Edit Event" : "Add Event"}
                                            </button>}
                                        </div>
                                    </Form>
                                </ModalBody>
                            </Modal>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

Calender.propTypes = {
    events: PropTypes.any,
    className: PropTypes.string,
    onGetEvents: PropTypes.func,
    onAddNewEvent: PropTypes.func,
    onUpdateEvent: PropTypes.func,
    onDeleteEvent: PropTypes.func,
    onGetCategories: PropTypes.func,
};

export default Calender;
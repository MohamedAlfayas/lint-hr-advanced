import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
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
    FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const salaryCmpntForm = () => {
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);
    const [customFieldObj, setCustomFieldObj] = useState(form_obj);
    console.log("fghj", form_obj?.contribute);


    // const contributionOptions = useMemo(
    //     () => [
    //         { id: "1", label: "ESI", value: "ESI" },
    //         { id: "2", label: "EPF", value: "EPF" },
    //     ],
    //     []
    // );

    const contributionOptions = useMemo(() => {
        console.log("lll", form_obj);
        const options = [];
        if (form_obj?.contribute.length > 0) {
            console.log('yes');
            // Check if ESI is active and add it to options
            if (form_obj?.contribute[0].esi && form_obj?.contribute[0].esi.is_active) {
                options.push({ id: '1', label: 'ESI', value: 'ESI' });
            }
            // Check if EPF is active and add it to options
            if (form_obj?.contribute[0].epf && form_obj?.contribute[0].epf.is_active) {
                options.push({ id: '2', label: 'EPF', value: 'EPF' });
            }
        }


        return options;
    }, []);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };

    useEffect(() => {
        setCustomFieldObj(form_obj);
    }, [form_obj]);

    const FormikForm = useFormik({
        enableReinitialize: true,
        initialValues: customFieldObj,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Please Enter Name"),
            contribute: Yup.array()
                .required("Select Contribute")
                .min(1, "Select Contribute"),
        }),
        onSubmit: async (values) => {
            console.log("SUCCESSSS !!!! Formik Values = ", values);
            dispatch(setLoaderVisible(true));

            //   const Api = await PostApi("holiday/create/", values, false);
            //   console.log("API RES = ", Api);
            //   if (Api.status && Api.status === 200) {
            //     holidayObj.id === 0
            //       ? dispatch(addHoliday(Api?.data.data))
            //       : dispatch(editHoliday(Api?.data?.data));
            //     dispatch(toggleRSBView(false));
            //     toast.success(Api?.data?.message);
            //   } else {
            //     toast.error(Api?.data?.message || Api?.data?.detail);
            //   }

            //   dispatch(setLoaderVisible(false));
        },
    });

    return (
        <React.Fragment>
            <Row>
                <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
                    <Form onSubmit={FormikForm.handleSubmit}>
                        <div className="mb-3">
                            <Label htmlFor="pageSelection" className="form-label">
                                Selected Page
                            </Label>
                            <select
                                className="form-control"
                                id="pageSelection"
                                value={form_obj.type}
                                disabled
                            >
                                <option value="1">Earnings</option>
                                <option value="2">Allowances</option>
                                <option value="3">Deductions</option>
                            </select>
                        </div>
                        <Col md={12} lg={12} xxl={12}>
                            <div className="mb-3">
                                <Label htmlFor="tax_state" className="form-label">
                                    Name
                                </Label>
                                <div className="form-icon right">
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="form-control"
                                        placeholder="Name"
                                        value={customFieldObj.name || ""}
                                        onChange={handleInputChange}
                                        invalid={
                                            FormikForm.touched.name && FormikForm.errors.name
                                                ? true
                                                : false
                                        }
                                    />
                                    {FormikForm.touched.name && FormikForm.errors.name ? (
                                        <FormFeedback type="invalid">
                                            {FormikForm.errors.name}
                                        </FormFeedback>
                                    ) : null}
                                    <div id="passwordHelpBlock" className="form-text mb-3">
                                        Enter Name
                                    </div>
                                    <Col md={12} lg={12} xxl={12}>
                                        <div className="mb-3">
                                            <Label className="form-label" htmlFor="ws_desc">
                                                Description
                                            </Label>
                                            <Input
                                                type="textarea"
                                                className="form-control"
                                                id="earn_desc"
                                                value={customFieldObj.desc || ""}
                                                onChange={(e) =>
                                                    setCustomFieldObj({
                                                        ...customFieldObj,
                                                        desc: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </Col>
                                    <div className="mb-3">

                                        <Row>
                                            <Col lg={3} sm={3}>
                                                <Label
                                                    className="form-label"
                                                    htmlFor="pro_rata">
                                                    Pro-rata
                                                </Label>
                                            </Col>
                                            <Col lg={6} sm={12}>
                                                <div
                                                    className="form-check form-switch form-switch-md form-switch-success"
                                                    dir="ltr">
                                                    {" "}
                                                    <Input
                                                        id="pro_rata"
                                                        name="earnings_has_pro_rata"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        value={customFieldObj.id || ""}
                                                        checked={customFieldObj.pro_rata}
                                                        onChange={(e) =>
                                                            setCustomFieldObj({
                                                                ...customFieldObj,
                                                                pro_rata: e.target.checked,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="mb-3">
                                        <Row>
                                            <Col lg={3} sm={3}>
                                                <Label
                                                    className="form-label"
                                                    htmlFor="tax">
                                                    Taxable
                                                </Label>
                                            </Col>
                                            <Col lg={6} sm={12}>
                                                <div
                                                    className="form-check form-switch form-switch-md form-switch-success"
                                                    dir="ltr">
                                                    {" "}
                                                    <Input
                                                        id="tax"
                                                        name="earnings_has_taxable"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={customFieldObj.tax}
                                                        onChange={(e) =>
                                                            setCustomFieldObj({
                                                                ...customFieldObj,
                                                                tax: e.target.checked,
                                                            })
                                                        } />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="mb-3">
                                        <Row>
                                            <Col lg={3} sm={3}>
                                                <Label
                                                    className="form-label"
                                                    htmlFor="insurance">
                                                    Insurance&Fund
                                                </Label>
                                            </Col>
                                            <Col lg={6} sm={12}>
                                                <div
                                                    className="form-check form-switch form-switch-md form-switch-success"
                                                    dir="ltr">
                                                    {" "}
                                                    <Input
                                                        id="insurance"
                                                        name="earnings_has_insurance"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={customFieldObj.insurance}
                                                        onChange={(e) =>
                                                            setCustomFieldObj({
                                                                ...customFieldObj,
                                                                insurance: e.target.checked,
                                                            })
                                                        } />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Col lg={12}>
                                        <div>
                                            <Label htmlFor="subDepartment" className="form-label">
                                                Contribution
                                            </Label>
                                            <Select

                                                isMulti={true}
                                                name="contribute"
                                                options={contributionOptions || []}
                                                className="basic-multi-select"
                                                styles={{
                                                    control: (provided, state) => ({
                                                        ...provided,
                                                        borderColor:
                                                            !state.isFocused &&
                                                                FormikForm.touched.contribute &&
                                                                FormikForm.errors.contribute
                                                                ? "red !important"
                                                                : provided.borderColor,
                                                    }),
                                                }}
                                                // value={(form_obj.contribute && contributionOptions.filter(e => (form_obj.contribute).includes(e.value)))}
                                                onChange={(e) => setCustomFieldObj({ ...customFieldObj, contribute: e.map(obj => obj.value) })}
                                                invalid={
                                                    FormikForm.touched.contribute &&
                                                        FormikForm.errors.contribute
                                                        ? true
                                                        : false
                                                }
                                            />
                                            {FormikForm.touched.contribute&&
                                                FormikForm.errors.contribute ? (
                                                <div className="lc_form_error_text">
                                                    {FormikForm.errors.contribute}
                                                </div>
                                            ) : null}
                                        </div>
                                        <div id="passwordHelpBlock" className="form-text mb-3">
                                            Select Contribution
                                        </div>
                                    </Col>
                                </div>
                            </div>
                        </Col>
                        <Col lg={12}>
                            <div className="text-end">
                                <Button type="submit" color="success" className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                </Button>{" "}
                            </div>
                        </Col>
                    </Form>

                </Col>
            </Row>
        </React.Fragment>
    );
};

export default salaryCmpntForm;

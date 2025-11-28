import React, { useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Label,
  Button
} from "reactstrap";
import { Link } from "react-router-dom";
import { generateOfferLetterPreview } from "../../common/pdf/offerLetterTemplate";

const EmployeeDocument = ({ profileObj }) => {
  const [data, setData] = useState({
    first_name: profileObj.first_name || "",
    last_name: profileObj.last_name || "",
    emp_id: profileObj.emp_id || "",
    joining_date: profileObj.joining_date || "",
    address_line: profileObj.address_line || "",

    company_name: profileObj.company_name || "Lintcloud Technologies",
    company_address: profileObj.company_address || "Tirunelveli, Tamil Nadu",
    hr_name: profileObj.hr_name || "John Robert",
    issue_date: profileObj.issue_date || new Date().toISOString().split("T")[0],

    company_logo: profileObj.company_logo || "",
    hr_signature: profileObj.hr_signature || "",

    body_content: profileObj.body_content || []
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setData({ ...data, [type]: reader.result });
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    const { url, fileName } = await generateOfferLetterPreview(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between mb-4">
          <h5 className="card-title">Offer Letter Details</h5>
          <Button color={isEditing ? "success" : "primary"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>

        {!isEditing && (
          <Row className="mb-4">
            <Col md={6}><p><strong>Company Name:</strong> {data.company_name}</p></Col>
            <Col md={6}><p><strong>HR Name:</strong> {data.hr_name}</p></Col>
            <Col md={12}><p><strong>Company Address:</strong><br />{data.company_address}</p></Col>
            <Col md={6}><p><strong>Issue Date:</strong> {data.issue_date}</p></Col>

            <Col md={6}>
              <p><strong>Logo:</strong></p>
              {data.company_logo && <img src={data.company_logo} height="60" alt="" />}
            </Col>

            <Col md={6}>
              <p><strong>HR Signature:</strong></p>
              {data.hr_signature && <img src={data.hr_signature} height="60" alt="" />}
            </Col>

            <Col md={6}><p><strong>First Name:</strong> {data.first_name}</p></Col>
            <Col md={6}><p><strong>Last Name:</strong> {data.last_name}</p></Col>
            <Col md={6}><p><strong>Employee ID:</strong> {data.emp_id}</p></Col>
            <Col md={6}><p><strong>Joining Date:</strong> {data.joining_date}</p></Col>
            <Col md={12}><p><strong>Address:</strong><br />{data.address_line}</p></Col>
          </Row>
        )}

        {isEditing && (
          <Row>
            <h6>Company Details</h6>

            <Col md={6}>
              <Label>Company Name</Label>
              <Input name="company_name" value={data.company_name} onChange={handleChange} />
            </Col>

            <Col md={6}>
              <Label>HR Name</Label>
              <Input name="hr_name" value={data.hr_name} onChange={handleChange} />
            </Col>

            <Col md={12} className="mt-3">
              <Label>Company Address</Label>
              <Input type="textarea" rows={3} name="company_address" value={data.company_address} onChange={handleChange} />
            </Col>

            <Col md={6} className="mt-3">
              <Label>Issue Date</Label>
              <Input type="date" name="issue_date" value={data.issue_date} onChange={handleChange} />
            </Col>

            <Col md={6} className="mt-3">
              <Label>Company Logo</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleFile(e, "company_logo")} />
              {data.company_logo && <img src={data.company_logo} height="50" className="mt-2" />}
            </Col>

            <Col md={6} className="mt-3">
              <Label>HR Signature</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleFile(e, "hr_signature")} />
              {data.hr_signature && <img src={data.hr_signature} height="50" className="mt-2" />}
            </Col>

            <h6 className="mt-4">Employee Details</h6>

            <Col md={6}>
              <Label>First Name</Label>
              <Input name="first_name" value={data.first_name} onChange={handleChange} />
            </Col>

            <Col md={6}>
              <Label>Last Name</Label>
              <Input name="last_name" value={data.last_name} onChange={handleChange} />
            </Col>

            <Col md={6} className="mt-3">
              <Label>Employee ID</Label>
              <Input name="emp_id" value={data.emp_id} onChange={handleChange} />
            </Col>

            <Col md={6} className="mt-3">
              <Label>Joining Date</Label>
              <Input type="date" name="joining_date" value={data.joining_date} onChange={handleChange} />
            </Col>

            <Col md={12} className="mt-3">
              <Label>Address</Label>
              <Input type="textarea" rows={4} name="address_line" value={data.address_line} onChange={handleChange} />
            </Col>
          </Row>
        )}

        <Button color="dark" className="mt-4 mb-3" onClick={handleDownload}>
          Download Offer Letter PDF
        </Button>

      </CardBody>
    </Card>
  );
};

export default EmployeeDocument;

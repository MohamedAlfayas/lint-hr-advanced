import React, { useState } from "react";
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";

const reimbursementTypes = [
  "Entertainment Reimbursement",
  "Gadget Reimbursement",
  "Books and Periodicals Reimbursement",
  "Business Development Expense Reimbursement",
  "Helper Reimbursement"
];

const ReimbursementsForm = () => {
  const [typeOpen, setTypeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [carryForward, setCarryForward] = useState("yearly");

  // ✅ Amount state
  const [amount, setAmount] = useState(0);

  return (
    <Card className="border">
      <CardBody className="p-4" style={{ maxWidth: 650 }}>

        <h5 className="mb-4">New Reimbursement</h5>

        <Form>

          {/* Reimbursement Type */}
          <FormGroup>
            <Label>Reimbursement Type</Label>

            <div style={{ position: "relative" }}>
              <Input
                readOnly
                value={selectedType || "Select"}
                onClick={() => setTypeOpen(!typeOpen)}
                style={{ cursor: "pointer" }}
              />

              {typeOpen && (
                <div style={dropdownStyle}>
                  <Input
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-2"
                  />

                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {reimbursementTypes
                      .filter((item) =>
                        item.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((item, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                            borderRadius: 4,
                            background:
                              selectedType === item ? "#3b82f6" : "",
                            color:
                              selectedType === item ? "#fff" : "#000"
                          }}
                          onClick={() => {
                            setSelectedType(item);
                            setTypeOpen(false);
                          }}
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </FormGroup>

          {/* Name */}
          <FormGroup>
            <Label>
              Name in Payslip <span className="text-danger">*</span>
            </Label>
            <Input />
          </FormGroup>

          {/* Checkbox */}
          <FormGroup check className="mb-3">
            <Input type="checkbox" />
            <Label check>
              Include this as a Flexible Benefit Plan component
            </Label>
            <div style={helperText}>
              FBP allows your employees to personalise their salary structure
              by choosing how much they want to receive under each FBP component.
            </div>
          </FormGroup>

          {/* Radio Options */}
          <FormGroup className="mb-3">
            <Label>
              How do you want to handle unclaimed reimbursement?
            </Label>

            <div>
              <Input
                type="radio"
                name="carry"
                checked={carryForward === "yearly"}
                onChange={() => setCarryForward("yearly")}
              />{" "}
              Carry forward and encash at the end of the fiscal year
            </div>

            <div>
              <Input
                type="radio"
                name="carry"
                checked={carryForward === "monthly"}
                onChange={() => setCarryForward("monthly")}
              />{" "}
              Do not carry forward and encash monthly
            </div>
          </FormGroup>

          {/* Amount */}
          <FormGroup>
            <Label>
              Enter Amount <span className="text-danger">*</span>
            </Label>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={amountBox}>
                ₹
                <Input
                  type="number"
                  value={amount}
                  min={0}
                  step={1}
                  onChange={(e) => {
                    const val = e.target.value;

                    // ✅ prevent negative values
                    if (val === "" || Number(val) >= 0) {
                      setAmount(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    // ✅ block invalid keys
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  style={amountInput}
                />
              </div>
              <span style={{ marginLeft: 10 }}>per month</span>
            </div>
          </FormGroup>

          {/* Active */}
          <FormGroup check className="mb-3">
            <Input type="checkbox" />
            <Label check>Mark this as Active</Label>
          </FormGroup>

          {/* Note */}
          <div style={noteBox}>
            <b>Note:</b> Once you associate this component with an employee,
            you will only be able to edit the Name in Payslip and Amount.
            The changes you make to Amount will apply only to new employees.
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between mt-4">
            <div>
              <Button color="primary" size="sm" className="me-2">
                Save
              </Button>
              <Button color="light" size="sm" className="border">
                Cancel
              </Button>
            </div>

            <span className="text-danger" style={{ fontSize: 12 }}>
              * indicates mandatory fields
            </span>
          </div>

        </Form>
      </CardBody>
    </Card>
  );
};

/* Styles */

const dropdownStyle = {
  position: "absolute",
  width: "100%",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 8,
  zIndex: 100,
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

const helperText = {
  fontSize: 12,
  color: "#6b7280",
  marginLeft: 22,
  marginTop: 4
};

const amountBox = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "4px 8px",
  width: 140
};

const amountInput = {
  border: "none",
  outline: "none",
  width: "100%",
  marginLeft: 5
};

const noteBox = {
  background: "#fef3c7",
  border: "1px solid #fde68a",
  padding: 12,
  fontSize: 13,
  borderRadius: 6
};

export default ReimbursementsForm;
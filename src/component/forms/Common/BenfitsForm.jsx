import React, { useState } from "react";
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";

const benefitPlans = [
  "National Pension Scheme",
  "Other Non-Taxable Deduction",
];

const investments = [
  { group: "80C", items: ["Life Insurance Premium", "Public Provident Fund", "Unit-linked insurance plan", "ELSS Tax Saving Mutual Fund"] },
  { group: "80D", items: ["Medi Claim Policy for self, spouse, children - 80D"] },
];

const BenfitsForm = () => {
  const [planOpen, setPlanOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);

  const [planSearch, setPlanSearch] = useState("");
  const [investSearch, setInvestSearch] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedInvest, setSelectedInvest] = useState("");

  return (
    <Card className="border">
      <CardBody className="p-4">

        <h5 className="mb-4">Edit Benefit</h5>

        <Form>

          {/* Benefit Plan */}
          <FormGroup>
            <Label>Benefit Plan</Label>

            <div style={{ position: "relative" }}>
              <Input
                readOnly
                value={selectedPlan || "Select a Benefit Plan"}
                onClick={() => setPlanOpen(!planOpen)}
                style={{ cursor: "pointer" }}
              />

              {planOpen && (
                <div style={dropdownStyle}>
                  <Input
                    placeholder="Search..."
                    value={planSearch}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    className="mb-2"
                  />

                  {benefitPlans
                    .filter((item) =>
                      item.toLowerCase().includes(planSearch.toLowerCase())
                    )
                    .map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background:
                            selectedPlan === item ? "#3b82f6" : "",
                          color: selectedPlan === item ? "#fff" : "#000",
                          borderRadius: 4,
                        }}
                        onClick={() => {
                          setSelectedPlan(item);
                          setPlanOpen(false);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </FormGroup>

          {/* Associate Investment */}
          <FormGroup>
            <Label>Associate this benefit with</Label>

            <div style={{ position: "relative" }}>
              <Input
                readOnly
                value={selectedInvest || "Select an Investment"}
                onClick={() => setInvestOpen(!investOpen)}
                style={{ cursor: "pointer" }}
              />

              {investOpen && (
                <div style={dropdownStyle}>
                  <Input
                    placeholder="Search..."
                    value={investSearch}
                    onChange={(e) => setInvestSearch(e.target.value)}
                    className="mb-2"
                  />

                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {investments.map((group, gi) => (
                      <div key={gi}>
                        <div style={{ fontWeight: "600", fontSize: 13 }}>
                          {group.group}
                        </div>

                        {group.items
                          .filter((item) =>
                            item
                              .toLowerCase()
                              .includes(investSearch.toLowerCase())
                          )
                          .map((item, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "6px 8px",
                                cursor: "pointer",
                                background:
                                  selectedInvest === item
                                    ? "#3b82f6"
                                    : "",
                                color:
                                  selectedInvest === item
                                    ? "#fff"
                                    : "#000",
                                borderRadius: 4,
                              }}
                              onClick={() => {
                                setSelectedInvest(item);
                                setInvestOpen(false);
                              }}
                            >
                              {item}
                            </div>
                          ))}
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

          {/* Checkboxes */}
          <FormGroup check className="mb-2">
            <Input type="checkbox" />
            <Label check>
              Include employer's contribution in employee’s salary structure.
            </Label>
          </FormGroup>

          <FormGroup check className="mb-2">
            <Input type="checkbox" />
            <Label check>
              Consider this a superannuation fund
            </Label>
          </FormGroup>

          <FormGroup check>
            <Input type="checkbox" />
            <Label check>
              Calculate on pro-rata basis
            </Label>
          </FormGroup>

          <div style={{ fontSize: 13, marginLeft: 22, color: "#6b7280" }}>
            Pay will be adjusted based on employee working days.
          </div>

          <hr />

          <FormGroup check className="mb-3">
            <Input type="checkbox" defaultChecked />
            <Label check>Mark this as Active</Label>
          </FormGroup>

          {/* Note */}
          <div
            className="p-3 mb-4"
            style={{
              background: "#fef3c7",
              border: "1px solid #fde68a",
              fontSize: 13,
            }}
          >
            <b>Note:</b> Once you associate this benefits with an employee,
            you will only be able to edit the Name in Payslip.
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between">
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

const dropdownStyle = {
  position: "absolute",
  width: "100%",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 8,
  zIndex: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export default BenfitsForm;
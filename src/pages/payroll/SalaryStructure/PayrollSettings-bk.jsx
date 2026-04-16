import React, { useState } from 'react';
import {
  Card, CardHeader, CardBody, CardTitle,
  Col, Row, Form, Label, Input, Button
} from 'reactstrap';
import Select from 'react-select';

const CONTRIBUTION_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'basic_12', label: 'Basic * 12%' },
  { value: 'basic_special_12', label: '(Basic + Special Allowance) * 12%' },
  { value: 'basic_da_12', label: '(Basic + Da) * 12%' },
];

// From — only specific values selectable
const PAY_CYCLE_FROM_OPTIONS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,31].map(n => ({
  value: String(n),
  label: String(n),
}));

// To — all 31 days (auto-calculated, From - 1)
const PAY_CYCLE_TO_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const PayrollSettings = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [settings, setSettings] = useState({
    payCycleFrom: '5',
    payCycleTo: '4',
    hasPF: true,
    employeeContribution: '',
    pfCeiling: true,
    hasESI: true,
    hasProfessionalTax: true,
  });

  const [form, setForm] = useState({ ...settings });

  const handleToggle = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setSettings({ ...form });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...settings });
    setIsEditing(false);
  };

  const data = isEditing ? form : settings;

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
              <CardTitle tag="h5" className="mb-0">Payroll Settings</CardTitle>
              {!isEditing && (
                <Button
                  color="primary"
                  className="btn-label btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="ri-edit-line label-icon align-middle fs-16 me-2"></i>
                  Edit
                </Button>
              )}
            </CardHeader>

            <CardBody>
              <Form action="javascript:void(0)">
                <Row className="g-3">

                  {/* Pay Cycle */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">Pay Cycle</Label>
                      </Col>
                      <Col sm={8}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted fs-13">From</span>
                          <Select
                            isDisabled={!isEditing}
                            options={PAY_CYCLE_FROM_OPTIONS}
                            classNamePrefix="lc-select"
                            className="basic-multi-select"
                            value={PAY_CYCLE_FROM_OPTIONS.find(o => o.value === data.payCycleFrom)}
                            onChange={(e) => {
                              const fromVal = Number(e.value);
                              const toVal = fromVal === 1 ? 1 : fromVal - 1;
                              setForm((prev) => ({
                                ...prev,
                                payCycleFrom: String(fromVal),
                                payCycleTo: String(toVal),
                              }));
                            }}
                            styles={{ container: (p) => ({ ...p, width: 90 }) }}
                          />
                          <span className="text-muted fs-13">To</span>
                          <Select
                            isDisabled={true}
                            options={PAY_CYCLE_TO_OPTIONS}
                            classNamePrefix="lc-select"
                            className="basic-multi-select"
                            value={PAY_CYCLE_TO_OPTIONS.find(o => o.value === data.payCycleTo)}
                            styles={{ container: (p) => ({ ...p, width: 90 }) }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* Does your company have PF? */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">Does your company have PF?</Label>
                      </Col>
                      <Col sm={8}>
                        <div className="form-check form-switch form-switch-md form-switch-success" dir="ltr">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            checked={data.hasPF}
                            disabled={!isEditing}
                            onChange={() => handleToggle('hasPF')}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* Employee Contribution */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">Employee Contribution</Label>
                      </Col>
                      <Col sm={8}>
                        <Select
                          isDisabled={!isEditing}
                          options={CONTRIBUTION_OPTIONS}
                          classNamePrefix="lc-select"
                          className="basic-multi-select"
                          value={
                            CONTRIBUTION_OPTIONS.find(o => o.value === data.employeeContribution)
                            || CONTRIBUTION_OPTIONS[0]
                          }
                          onChange={(e) => handleChange('employeeContribution', e.value)}
                        />
                      </Col>
                    </Row>
                  </Col>

                  {/* PF Ceiling */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">PF Ceiling at Rs. 15000</Label>
                      </Col>
                      <Col sm={8}>
                        <div className="form-check form-switch form-switch-md form-switch-success" dir="ltr">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            checked={data.pfCeiling}
                            disabled={!isEditing}
                            onChange={() => handleToggle('pfCeiling')}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* ESI */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">Does your company have ESI?</Label>
                      </Col>
                      <Col sm={8}>
                        <div className="form-check form-switch form-switch-md form-switch-success" dir="ltr">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            checked={data.hasESI}
                            disabled={!isEditing}
                            onChange={() => handleToggle('hasESI')}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* Professional Tax */}
                  <Col lg={12}>
                    <Row className="align-items-center">
                      <Col sm={4}>
                        <Label className="form-label mb-0">Do you deduct Professional Tax?</Label>
                      </Col>
                      <Col sm={8}>
                        <div className="form-check form-switch form-switch-md form-switch-success" dir="ltr">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            checked={data.hasProfessionalTax}
                            disabled={!isEditing}
                            onChange={() => handleToggle('hasProfessionalTax')}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* Save / Cancel */}
                  {isEditing && (
                    <Col lg={12}>
                      <div className="text-end d-flex gap-2 justify-content-end">
                        <Button
                          type="button"
                          color="danger"
                          className="btn-label"
                          onClick={handleCancel}
                        >
                          <i className="ri-close-line label-icon align-middle fs-16 me-2"></i>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          color="success"
                          className="btn-label"
                          onClick={handleSave}
                        >
                          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                          Save
                        </Button>
                      </div>
                    </Col>
                  )}

                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PayrollSettings;
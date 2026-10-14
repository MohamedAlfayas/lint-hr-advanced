import React from "react";
import { Button } from "reactstrap";

const SalaryPoliciesTab = ({ onAddPolicy }) => {
  return (
    <div className="d-flex mb-2">
      <div className="flex-shrink-0">
        <img
          src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/profile/18ba4128-f7f0-435b-a841-96c01c829d0b.jpg"
          alt=""
          width="150"
          className="rounded"
        />
      </div>

      <div className="flex-grow-1 ms-3">
        <Button data-testid="salary-policies-add-button" color="primary" onClick={() => onAddPolicy(0)}>
          <i className="ri-add-line align-bottom me-1"></i>
          Add
        </Button>
        <p className="mb-0">
          <br />
          You always want to make sure that your fonts work well together and
          try to limit the number of fonts you use to three or less. Experiment
          and play around with the fonts that you already have in the software
          you're working with reputable font websites.
        </p>
      </div>
    </div>
  );
};

export default SalaryPoliciesTab;
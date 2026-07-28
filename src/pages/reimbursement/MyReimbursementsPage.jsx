// MyReimbursementsPage.jsx
// Standalone route wrapper so employees can reach their reimbursements
// straight from the sidebar (Payroll stays admin-only).
// Place alongside MyReimbursements.jsx (e.g. src/pages/employee/).
// Register the route wherever your other routes live, e.g.:
//   <Route path="/my-reimbursements" element={<MyReimbursementsPage />} />

import React from "react";
import { Container, Card, CardBody } from "reactstrap";
import { MetaTitle } from "../../common/data/MetaTitle";
import MyReimbursements from "../payroll/PayrollComponent/MyReimbursements";


const MyReimbursementsPage = () => {
  const profile_data = JSON.parse(
    localStorage.getItem("lint_hr_profile_data"),
  );

  document.title = `Reimbursements | ${MetaTitle}`;

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <MyReimbursements employeeId={profile_data?.id} canSubmit={true} />
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default MyReimbursementsPage;
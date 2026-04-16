import React, { useState, useEffect } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Input,
  CardHeader,
} from "reactstrap";

import { useDispatch, useSelector } from "react-redux";
import RecurringModal from "./Modal/RecurringModal";
import { Api } from "../../../common/api/Api";
import { setRecurring } from "../../../redux/reducers/ChildReducer/RecurringReducer";

const RecurringTable = () => {
  const dispatch = useDispatch();

  const data = useSelector((state) => state.RecurringReducer.recurring_data);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const fetchComponents = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/component/" })
      .then((res) => {
        dispatch(setRecurring(res?.data?.data || []));
      })
      .catch((err) => console.log("Fetch Error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const openCreate = () => {
    setSelectedComponent({ id: 0 });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedComponent(item);
    setModalOpen(true);
  };

  const filtered = data
    .filter((d) => d.salary_type === "recurring")
    .filter((d) =>
      (d.name || "").toLowerCase().includes(search.toLowerCase())
    );

  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const displayValue = (item) => {
    if (item.calculation_type === "percentage" && item.calculation_based_on) {
      return `${item.calculation_based_on.toUpperCase()} * ${parseFloat(
        item.calculation_value || 0
      ).toFixed(2)}%`;
    }
    return Number(item.calculation_value || 0).toLocaleString("en-IN");
  };

  return (
    <>
      <Row>
        <CardHeader className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <Input
            placeholder="Search component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <button
            type="button"
            className="btn btn-success add-btn"
            style={{ textTransform: "capitalize" }}
            onClick={openCreate}
          >
            <i className="ri-add-line align-bottom me-1"></i> Create Component
          </button>
        </CardHeader>

        <Col md={12}>
          <Table bordered hover responsive className="align-middle" style={{ fontSize: 14 }}>
            <thead className="table-light">
              <tr>
                <th>Component Name</th>
                <th>Type</th>
                <th>Taxable</th>
                <th>Annual Limit</th>
                <th>Individual Override</th>
                <th>Proof Required</th>
                <th>ESI Applicable</th>
                <th>Included in CTC</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    No components found
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{capitalize(item.component_type)}</td>
                    <td>{item.is_taxable ? "Yes" : "No"}</td>
                    <td>{displayValue(item)}</td>
                    <td>{item.is_individual_override ? "Yes" : "No"}</td>
                    <td>{item.is_proof_required ? "Yes" : "No"}</td>
                    <td>{item.is_esi_applicable ? "Yes" : "No"}</td>
                    <td>{item.is_included_in_ctc ? "Yes" : "No"}</td>

                    <td>
                      <span
                        className={`badge text-uppercase px-3 py-2 bg-${
                          item.is_active ? "success" : "warning"
                        }-subtle text-${item.is_active ? "success" : "warning"}`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="text-center">
                      <i
                        className="ri-pencil-line"
                        onClick={() => openEdit(item)}
                        title="Edit"
                        style={{ cursor: "pointer" }}
                      ></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <RecurringModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        component={selectedComponent}
        onSaved={() => {
          setModalOpen(false);
          fetchComponents();
        }}
      />
    </>
  );
};

export default RecurringTable;
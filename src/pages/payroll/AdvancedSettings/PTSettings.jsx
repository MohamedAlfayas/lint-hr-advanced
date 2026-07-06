import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Input, Label, Row, Spinner, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  setPTSettings,
} from "../../../redux/reducers/ChildReducer/PTSettingsReducer";
import { pt_settings_form_component_name } from "../../../common/constant/Constants";

const formatState = (slug) => {
  if (!slug) return "";
  return slug.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const formatCycle = (cycle) => {
  if (!cycle) return "";
  return cycle.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
};

// ── Slab Modal ───────────────────────────────────────────────────────────────
const SlabModal = ({ isOpen, toggle, item }) => {
  if (!item) return null;
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle} className="border-bottom-0 pb-0">
        <div>
          <h5 className="mb-0 fw-semibold">{formatState(item.state)}</h5>
          <span className="text-muted" style={{ fontSize: 13 }}>Professional Tax Slabs</span>
        </div>
      </ModalHeader>
      <ModalBody className="pt-2">
        <div className="d-flex gap-2 mb-3">
          <span className="badge bg-primary-subtle text-primary px-3 py-2" style={{ fontSize: 12 }}>
            <i className="ri-repeat-line me-1"></i>
            {formatCycle(item.deduction_cycle)} Deduction
          </span>
          <span className="badge bg-info-subtle text-info px-3 py-2" style={{ fontSize: 12 }}>
            <i className="ri-calculator-line me-1"></i>
            {formatCycle(item.slab_basis)} Basis
          </span>
        </div>

        {item.slabs?.length > 0 ? (
          <div className="table-responsive border rounded">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: 13 }}>Gross Range (₹)</th>
                  <th style={{ fontSize: 13 }} className="text-end">PT Amount</th>
                </tr>
              </thead>
              <tbody>
                {item.slabs.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>
                      {s.start?.toLocaleString("en-IN")} – {s.end == null || s.end >= 999999 ? "Above" : s.end.toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontSize: 13 }} className="text-end fw-medium">
                      {s.amount === 0
                        ? <span className="text-success">Nil</span>
                        : `₹${s.amount?.toLocaleString("en-IN")}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
            <i className="ri-file-list-3-line fs-24 d-block mb-2"></i>
            No slabs configured.
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const PTSettings = () => {
  const dispatch = useDispatch();
  const ptSettings = useSelector((state) => state.PTSettingsReducer.pt_settings_data);
  const [loading, setLoading] = useState(false);

  const [slabModalOpen, setSlabModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openSlabModal = (item) => {
    setSelectedItem(item);
    setSlabModalOpen(true);
  };

  const closeSlabModal = () => {
    setSlabModalOpen(false);
    setSelectedItem(null);
  };

  const fetchPTSettings = useCallback(() => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/pt-settings/" })
      .then((res) => {
        const data = res?.data?.data;
        dispatch(setPTSettings(Array.isArray(data) ? data : []));
      })
      .catch(() => {
        toast.error("Failed to fetch PT Settings");
        dispatch(setPTSettings([]));
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchPTSettings();
  }, [fetchPTSettings]);

  const handleEdit = (item) => {
    const formobj = {
      id: item?.id || 0,
      state: item?.state || "",
      deduction_cycle: item?.deduction_cycle || "monthly",
      slab_basis: item?.slab_basis || "monthly",
      slabs: Array.isArray(item?.slabs)
        ? item.slabs.map((s) => ({
            start: s?.start ?? "",
            end: s?.end ?? "",
            amount: s?.amount ?? "",
          }))
        : [],
    };
    dispatch(setFormObj(null));
    setTimeout(() => {
      dispatch(setFormObj({ ...formobj }));
      dispatch(setFormTitle("Edit Professional Tax Settings"));
      dispatch(setFormWidthPercentage("45%"));
      dispatch(setComponentToShow(pt_settings_form_component_name));
      dispatch(toggleRSBView(true));
    }, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>
          Loading PT Settings...
        </p>
      </div>
    );
  }

  if (!ptSettings.length) {
    return (
      <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
        No Professional Tax found.
      </div>
    );
  }

  return (
    <>
      {/* Slab Modal */}
      <SlabModal isOpen={slabModalOpen} toggle={closeSlabModal} item={selectedItem} />

      <div className="d-flex flex-column gap-3">
        {ptSettings.map((item) => (
          <Card key={item.id} className="border shadow-sm mb-0">
            <CardBody>

              {/* Header */}
              <div className={`p-3 mt-n3 mx-n3 mb-3 bg-${item.is_active ? "success" : "secondary"}-subtle rounded-top`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fs-14 fw-semibold">{formatState(item?.state)}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <div className="form-check form-switch m-0">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!item?.is_active}
                        readOnly
                      />
                      <Label className="form-check-label">
                        {item?.is_active ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <button
                      className="btn btn-link text-primary p-0"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="ri-pencil-fill fs-16"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Row — 4 columns: State | Deduction Cycle | Slab Basis | PT Tax Slabs */}
              <Row className="gy-2 mb-1 align-items-end">
                <Col sm={3}>
                  <p className="text-muted mb-1" style={{ fontSize: 12 }}>State</p>
                  <h6 className="fs-14 mb-0">{formatState(item?.state)}</h6>
                </Col>
                <Col sm={3}>
                  <p className="text-muted mb-1" style={{ fontSize: 12 }}>Deduction Cycle</p>
                  <h6 className="fs-14 mb-0">{formatCycle(item?.deduction_cycle)}</h6>
                </Col>
                <Col sm={3}>
                  <p className="text-muted mb-1" style={{ fontSize: 12 }}>Slab Basis</p>
                  <h6 className="fs-14 mb-0">{formatCycle(item?.slab_basis)}</h6>
                </Col>

                {/* Separate column for View Tax Slabs */}
                {item?.slabs?.length > 0 && (
                  <Col sm={3}>
                    <p className="text-muted mb-1" style={{ fontSize: 12 }}>PT Tax Slabs</p>
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      style={{ fontSize: 12, padding: "3px 10px" }}
                      onClick={() => openSlabModal(item)}
                    >
                      <i className="ri-file-list-3-line fs-13"></i>
                      View Tax Slabs
                    </button>
                  </Col>
                )}
              </Row>

            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
};

export default PTSettings;
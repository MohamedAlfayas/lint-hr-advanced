import React, { useState, useEffect, useCallback } from "react";
import { Input, Modal, ModalBody } from "reactstrap";
import { CardGridSkeleton } from "../../../component/common/skeleton/Skeleton";
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
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";
import "./PTSettings.scss";

const OPEN_ENDED = 999999;

const formatState = (slug) => {
  if (!slug) return "";
  return slug.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const formatCycle = (cycle) => {
  if (!cycle) return "";
  return cycle.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
};

const initials = (slug) =>
  formatState(slug)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const inr = (n) => Number(n || 0).toLocaleString("en-IN");

const rangeLabel = (s) =>
  s.end == null || s.end >= OPEN_ENDED
    ? `₹${inr(s.start)} & above`
    : `₹${inr(s.start)} – ₹${inr(s.end)}`;

const amountLabel = (amount) => (Number(amount) === 0 ? "Nil" : `₹${inr(amount)}`);

// ── Slab Modal ───────────────────────────────────────────────────────────────
const SlabModal = ({ isOpen, toggle, item }) => {
  if (!item) return null;
  const slabs = item.slabs || [];
  const maxAmount = Math.max(1, ...slabs.map((s) => Number(s.amount) || 0));

  return (
    <Modal data-testid="pt-settings-professional-tax-slabs-dialog" isOpen={isOpen} toggle={toggle} centered size="md" contentClassName="pts-modal">
      <div className="pts-modal-head">
        <span className="pts-avatar is-lg">{initials(item.state)}</span>
        <div className="pts-modal-title">
          <h5>{formatState(item.state)}</h5>
          <span>Professional Tax slabs</span>
        </div>
        <ModalCloseButton onClick={toggle} testId="pt-settings-professional-tax-slabs-close-button" />
      </div>

      <ModalBody className="pts-modal-body">
        <div className="pts-chips">
          <span className="pts-chip is-primary">
            <i className="ri-repeat-line"></i>
            {formatCycle(item.deduction_cycle)} deduction
          </span>
          <span className="pts-chip is-info">
            <i className="ri-calculator-line"></i>
            {formatCycle(item.slab_basis)} basis
          </span>
          <span className="pts-chip">
            <i className="ri-stack-line"></i>
            {slabs.length} slab{slabs.length === 1 ? "" : "s"}
          </span>
        </div>

        {slabs.length > 0 ? (
          <ol className="pts-slab-list">
            {slabs.map((s, i) => {
              const nil = Number(s.amount) === 0;
              return (
                <li key={`${s.start}-${s.end}`} className={nil ? "is-nil" : ""}>
                  <span className="pts-slab-no">{i + 1}</span>
                  <div className="pts-slab-main">
                    <div className="pts-slab-range">{rangeLabel(s)}</div>
                    <div className="pts-slab-bar">
                      <span style={{ width: `${nil ? 0 : Math.max(6, ((Number(s.amount) || 0) / maxAmount) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="pts-slab-amt">{amountLabel(s.amount)}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="pts-empty is-sm">
            <i className="ri-file-list-3-line"></i>
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

  const [togglingId, setTogglingId] = useState(null);

  const handleToggleActive = (item) => {
    setTogglingId(item.id);
    Api({
      method: "PATCH",
      url: "payroll/pt-settings/",
      data: { id: item.id, is_active: !item.is_active },
    })
      .then((res) => {
        const updated = res?.data?.data;
        if (updated) {
          dispatch(setPTSettings(
            ptSettings.map((p) => (p.id === updated.id ? updated : p))
          ));
          toast.success(res?.data?.message || "Status updated");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to update status"))
      .finally(() => setTogglingId(null));
  };

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
    return <CardGridSkeleton count={4} min={300} testId="pt-settings-loading-skeleton" label="Loading PT settings" />;
  }

  if (!ptSettings.length) {
    return (
      <div className="pts-empty">
        <i className="ri-government-line"></i>
        No Professional Tax found.
      </div>
    );
  }

  const activeCount = ptSettings.filter((p) => p.is_active).length;

  return (
    <div className="pts">
      <SlabModal isOpen={slabModalOpen} toggle={closeSlabModal} item={selectedItem} />

      <div className="pts-summary">
        <span className="pts-chip">
          <i className="ri-map-pin-2-line"></i>
          {ptSettings.length} state{ptSettings.length === 1 ? "" : "s"}
        </span>
        <span className="pts-chip is-success">
          <i className="ri-checkbox-circle-line"></i>
          {activeCount} active
        </span>
        <span className="pts-chip is-muted">
          <i className="ri-indeterminate-circle-line"></i>
          {ptSettings.length - activeCount} inactive
        </span>
      </div>

      <div className="pts-grid">
        {ptSettings.map((item) => {
          const slabs = item.slabs || [];
          const amounts = slabs.map((s) => Number(s.amount) || 0);
          const maxAmount = amounts.length ? Math.max(...amounts) : 0;
          const exempt = slabs.find((s) => Number(s.amount) === 0);

          return (
            <article
              key={item.id}
              className={`pts-card${item.is_active ? " is-active" : ""}`}
              data-testid={testId("pt-settings", itemTestKey(item), "item")}
            >
              <header className="pts-card-head">
                <span className="pts-avatar">{initials(item.state)}</span>
                <div className="pts-card-title">
                  <h6 title={formatState(item.state)}>{formatState(item?.state)}</h6>
                  <span>Professional Tax</span>
                </div>
                <button
                  data-testid={testId("pt-settings-edit", itemTestKey(item), "button")}
                  type="button"
                  className="pts-icon-btn"
                  title="Edit"
                  onClick={() => handleEdit(item)}
                >
                  <i className="ri-pencil-line"></i>
                </button>
              </header>

              <div className="pts-status">
                <span className={`pts-status-pill${item.is_active ? " is-on" : ""}`}>
                  <span className="pts-dot" />
                  {item?.is_active ? "Active" : "Inactive"}
                </span>
                <div className="form-check form-switch m-0" title={item.is_active ? "Deactivate" : "Activate"}>
                  <Input
                    data-testid={testId("pt-settings-is-active", itemTestKey(item), "checkbox")}
                    type="checkbox"
                    className="form-check-input"
                    checked={!!item?.is_active}
                    disabled={togglingId === item.id}
                    onChange={() => handleToggleActive(item)}
                    aria-label={`${formatState(item.state)} active`}
                  />
                </div>
              </div>

              <div className="pts-facts">
                <div className="pts-fact">
                  <i className="ri-repeat-line"></i>
                  <div>
                    <span>Deduction cycle</span>
                    <strong>{formatCycle(item?.deduction_cycle)}</strong>
                  </div>
                </div>
                <div className="pts-fact">
                  <i className="ri-calculator-line"></i>
                  <div>
                    <span>Slab basis</span>
                    <strong>{formatCycle(item?.slab_basis)}</strong>
                  </div>
                </div>
                <div className="pts-fact">
                  <i className="ri-stack-line"></i>
                  <div>
                    <span>Slabs</span>
                    <strong>{slabs.length}</strong>
                  </div>
                </div>
                <div className="pts-fact">
                  <i className="ri-coins-line"></i>
                  <div>
                    <span>Max PT</span>
                    <strong>{slabs.length ? amountLabel(maxAmount) : "—"}</strong>
                  </div>
                </div>
              </div>

              <footer className="pts-card-foot">
                <span className="pts-foot-note">
                  {exempt ? (
                    <>
                      <i className="ri-information-line"></i>
                      Nil up to ₹{inr(exempt.end)}
                    </>
                  ) : slabs.length ? (
                    <>
                      <i className="ri-information-line"></i>
                      From ₹{inr(slabs[0].start)}
                    </>
                  ) : (
                    "No slabs configured"
                  )}
                </span>
                {slabs.length > 0 && (
                  <button
                    data-testid={testId("pt-settings-view-tax-slabs", itemTestKey(item), "button")}
                    type="button"
                    className="pts-link-btn"
                    onClick={() => openSlabModal(item)}
                  >
                    View slabs
                    <i className="ri-arrow-right-line"></i>
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PTSettings;

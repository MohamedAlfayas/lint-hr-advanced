import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import "./SettingsLayout.scss";

const SettingsLayout = ({
  icon = "ri-settings-4-line",
  title,
  subtitle,
  navLabel = "Settings",
  tabs,
  active,
  onChange,
  children,
}) => (
  <Card className="acf-card">
    <CardBody className="p-0">
      <Row className="g-0">
        <Col md={4} lg={3} xxl={2} className="acf-side">
          <div className="acf-head">
            <span className="acf-head-icon"><i className={icon}></i></span>
            <div>
              <h5>{title}</h5>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          <div className="acf-nav-label">{navLabel}</div>
          <nav className="acf-nav" role="tablist" aria-orientation="vertical">
            {tabs.map((t) => {
              const isActive = String(active) === String(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`acf-nav-item tone-${t.tone || "primary"} ${isActive ? "is-active" : ""}`}
                  onClick={() => !isActive && onChange(t.id)}
                >
                  <span className="acf-nav-icon"><i className={t.icon}></i></span>
                  <span className="acf-nav-text">
                    <b>{t.label}</b>
                    {t.hint && <small>{t.hint}</small>}
                  </span>
                  <i className="ri-arrow-right-s-line acf-nav-caret"></i>
                </button>
              );
            })}
          </nav>
        </Col>
        <Col md={8} lg={9} xxl={10} className="acf-main">
          {children}
        </Col>
      </Row>
    </CardBody>
  </Card>
);

export default SettingsLayout;

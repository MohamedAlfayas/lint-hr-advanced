import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { testId as joinTestId, useFieldTestId } from "../testing/testId";
import "./FilterSelect.scss";

const MENU_GAP = 8;
const MENU_EST_H = 320;

const FilterSelect = ({
  icon,
  caption,
  value,
  options,
  onChange,
  placeholder = "Select…",
  columns = 1,
  searchable = false,
  markValue,
  className = "",
  style,
  testId,
}) => {
  const baseId = useFieldTestId(`${caption || placeholder}-filter`, testId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState(-1);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;

  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const up = below < MENU_EST_H && r.top > below;
      setPos({
        left: Math.min(r.left, window.innerWidth - 16 - Math.max(r.width, 180)),
        minWidth: r.width,
        ...(up ? { bottom: window.innerHeight - r.top + MENU_GAP } : { top: r.bottom + MENU_GAP }),
        up,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    listRef.current?.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
    searchRef.current?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    setQuery("");
    setHover(-1);
    setOpen((o) => !o);
  };

  const pick = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setHover((h) => Math.min(visible.length - 1, h + (e.key === "ArrowDown" ? columns : 1)));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHover((h) => Math.max(0, h - (e.key === "ArrowUp" ? columns : 1)));
    } else if (e.key === "Enter" && visible[hover]) {
      e.preventDefault();
      pick(visible[hover]);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`fsel ${open ? "is-open" : ""} ${selected ? "has-value" : ""} ${className}`}
      style={style}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="fsel-trigger"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid={`${baseId}-trigger`}
      >
        {icon && <span className="fsel-icon"><i className={icon}></i></span>}
        <span className="fsel-text">
          {caption && <small>{caption}</small>}
          <b data-testid={`${baseId}-selected-value`}>{selected ? selected.label : placeholder}</b>
        </span>
        <i className="ri-arrow-down-s-line fsel-caret"></i>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className={`fsel-menu ${pos?.up ? "is-up" : ""}`}
          role="listbox"
          style={pos
            ? { top: pos.top, bottom: pos.bottom, left: pos.left, minWidth: pos.minWidth }
            : { visibility: "hidden" }}
        >
          {searchable && (
            <div className="fsel-search">
              <i className="ri-search-line"></i>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHover(0); }}
                placeholder="Search…"
                data-testid={`${baseId}-search-input`}
              />
            </div>
          )}
          <div ref={listRef} className="fsel-list" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {visible.length === 0 && <div className="fsel-empty">No matches</div>}
            {visible.map((o, i) => {
              const isSel = String(o.value) === String(value);
              const isMark = markValue != null && String(o.value) === String(markValue);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  data-testid={joinTestId(baseId, "option", typeof o.label === "string" && o.label ? o.label : o.value)}
                  className={`fsel-opt ${isSel ? "is-selected" : ""} ${i === hover ? "is-hover" : ""} ${isMark ? "is-mark" : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => pick(o)}
                >
                  {o.icon && <i className={`${o.icon} fsel-opt-icon`}></i>}
                  <span className="fsel-opt-label">{o.label}</span>
                  {o.hint && <span className="fsel-opt-hint">{o.hint}</span>}
                  {isSel && columns === 1 && <i className="ri-check-line fsel-opt-check"></i>}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FilterSelect;

import React from 'react';
import { layoutModeTypes } from '../../layout/Constants';

const LightDark = ({ layoutMode, onChangeLayoutMode }) => {
    const isDark = layoutMode === layoutModeTypes['DARKMODE'];
    const next = isDark ? layoutModeTypes['LIGHTMODE'] : layoutModeTypes['DARKMODE'];

    return (
        <div className="ms-1 header-item d-none d-sm-flex">
            <button
                data-testid="theme-toggle-theme-button"
                onClick={() => onChangeLayoutMode(next)}
                type="button"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`btn btn-icon btn-topbar rounded-circle lh-theme-toggle ${isDark ? 'is-dark' : ''}`}
            >
                <i className="ri-sun-line lh-theme-icon lh-theme-sun"></i>
                <i className="ri-moon-clear-line lh-theme-icon lh-theme-moon"></i>
            </button>
        </div>
    );
};

export default LightDark;

import {
    changeLayoutAction,
    changeLayoutModeAction,
    changeSidebarThemeAction,
    changeLayoutWidthAction,
    changeLayoutPositionAction,
    changeTopbarThemeAction,
    changeLeftsidebarSizeTypeAction,
    changeLeftsidebarViewTypeAction,
    changeSidebarImageTypeAction,
    changePreLoaderAction,
    changeSidebarVisibilityAction
} from '../redux/reducers/ChildReducer/LayoutReducer';

import { ChangeHTMLAttribute } from "../common/js/ChangeHTMLAttribute"

/**
 * Changes the layout type
 * @param {*} param0
 */
export const changeLayout = (layout) => async (dispatch) => {
    try {
        if (layout === "twocolumn") {
            document.documentElement.removeAttribute("data-layout-width");
        } else if (layout === "horizontal") {
            document.documentElement.removeAttribute("data-sidebar-size");
        } else if (layout === "semibox") {
            ChangeHTMLAttribute("data-layout-width", "fluid");
            ChangeHTMLAttribute("data-layout-style", "default");
        }
        ChangeHTMLAttribute("data-layout", layout);
        dispatch(changeLayoutAction(layout));
    } catch (error) { }
};

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeLayoutMode = (layoutMode) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-bs-theme", layoutMode);
        dispatch(changeLayoutModeAction(layoutMode));        
        dispatch(changeSidebarTheme(layoutMode));
    } catch (error) { }
};

/**
 * Changes the left sidebar theme
 * @param {*} param0
 */
export const changeSidebarTheme = (theme) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-sidebar", theme);
        dispatch(changeSidebarThemeAction(theme));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the layout width
 * @param {*} param0
 */
export const changeLayoutWidth = (layoutWidth) => async (dispatch) => {
    try {
        if (layoutWidth === 'lg') {
            ChangeHTMLAttribute("data-layout-width", "fluid");
        } else {
            ChangeHTMLAttribute("data-layout-width", "boxed");
        }
        dispatch(changeLayoutWidthAction(layoutWidth));
    } catch (error) {
        return error;
    }
};

/**
 * Changes the layout position
 * @param {*} param0
 */
export const changeLayoutPosition = (layoutposition) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-layout-position", layoutposition);
        dispatch(changeLayoutPositionAction(layoutposition));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeTopbarTheme = (topbarTheme) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-topbar", topbarTheme);
        dispatch(changeTopbarThemeAction(topbarTheme));

    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeSidebarImageType = (leftsidebarImagetype) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-sidebar-image", leftsidebarImagetype);
        dispatch(changeSidebarImageTypeAction(leftsidebarImagetype));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the Preloader
 * @param {*} param0
 */
export const changePreLoader = (preloaderTypes) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-preloader", preloaderTypes);
        dispatch(changePreLoaderAction(preloaderTypes));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeLeftsidebarSizeType = (leftsidebarSizetype) => async (dispatch) => {
    try {
        switch (leftsidebarSizetype) {
            case 'lg':
                ChangeHTMLAttribute("data-sidebar-size", "lg");
                break;
            case 'md':
                ChangeHTMLAttribute("data-sidebar-size", "md");
                break;
            case "sm":
                ChangeHTMLAttribute("data-sidebar-size", "sm");
                break;
            case "sm-hover":
                ChangeHTMLAttribute("data-sidebar-size", "sm-hover");
                break;
            default:
                ChangeHTMLAttribute("data-sidebar-size", "lg");
        }
        dispatch(changeLeftsidebarSizeTypeAction(leftsidebarSizetype));

    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the topbar themes
 * @param {*} param0
 */
export const changeLeftsidebarViewType = (leftsidebarViewtype) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-layout-style", leftsidebarViewtype);
        dispatch(changeLeftsidebarViewTypeAction(leftsidebarViewtype));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the sidebar visibility
 * @param {*} param0
 */
export const changeSidebarVisibility = (sidebarVisibilitytype) => async (dispatch) => {
    try {
        ChangeHTMLAttribute("data-sidebar-visibility", sidebarVisibilitytype);
        dispatch(changeSidebarVisibilityAction(sidebarVisibilitytype));
    } catch (error) { }
};
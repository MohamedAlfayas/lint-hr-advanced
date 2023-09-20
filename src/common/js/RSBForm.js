import React, { useEffect, useState } from 'react';

import withRouter from '../../common/js/withRouter';


import { useSelector, useDispatch } from "react-redux";


import { toggleRSBView } from '../../redux/reducers/ChildReducer/RightSideBarReducer';
import RightSideBar from '../../component/rightsidebar/RightSideBar';

const RSBForm = (props) => {
    const dispatch = useDispatch();

    const [show, setShow] = useState(false)

    useEffect(() => {
        if (show && document.getElementById("sidebar-color-dark") && document.getElementById("sidebar-color-light")) {
            document.getElementById("sidebar-color-dark").checked = false;
            document.getElementById("sidebar-color-light").checked = false;
        }
    });

    // Inside your component
    const {
        preloader,
    } = useSelector((state) => state.LayoutReducer);

    // open offcanvas
    const [open, setOpen] = useState(false);
    const toggleLeftCanvas = () => {
        setOpen(!open)
        dispatch(toggleRSBView(open))
    };

    window.onscroll = function () {
        scrollFunction();
    };

    const scrollFunction = () => {
        const element = document.getElementById("back-to-top");
        if (element) {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }
    };    

    const pathName = props.router.location.pathname;

    useEffect(() => {
        const preloader = document.getElementById("preloader");
        if (preloader) {
            document.getElementById("preloader").style.opacity = "1";
            document.getElementById("preloader").style.visibility = "visible";
            setTimeout(function () {
                document.getElementById("preloader").style.opacity = "0";
                document.getElementById("preloader").style.visibility = "hidden";
            }, 1000);
        }
    }, [preloader, pathName]);

    return (
        <React.Fragment>
            <button
                onClick={() =>setOpen(!open)}
                type="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode">
                <i className='bx bx-plus fs-22'></i>
            </button>

            <div>
                <RightSideBar 
                    open={open}
                    toggleLeftCanvas = {toggleLeftCanvas}
                    width_per = {"30%"}
                />
            </div>
        </React.Fragment>
    );
};

export default withRouter(RSBForm);
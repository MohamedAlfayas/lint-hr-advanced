import React from 'react'
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import DepartmentForm from '../../forms/DepartmentForm'
import { useSelector } from 'react-redux'
import BranchForm from '../../forms/BranchForm'

const DisplayForms = ({open, toggleLeftCanvas}) => {

    const { form_title, form_width_percentage, component_to_show } = useSelector(state => state.RightSideBarReducer);

    return (
        <div>
            <Offcanvas style={{width:form_width_percentage}} isOpen={open} toggle={toggleLeftCanvas} direction='end'>
                <OffcanvasHeader className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark" toggle={toggleLeftCanvas}>
                    <span className="m-0 me-2 text-white">{form_title}</span>
                </OffcanvasHeader>
                <OffcanvasBody className="p-0">
                    <SimpleBar className="h-100">
                        <div className="p-4">
                            {component_to_show === "department" ? (
                                <DepartmentForm />
                            ) : (component_to_show === "branch") ? (
                                <BranchForm />
                            ) : (
                                <></>
                            ) }
                        </div>
                    </SimpleBar>
                </OffcanvasBody>

            </Offcanvas>
        </div>
    )
}

export default DisplayForms
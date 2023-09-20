import React from 'react'
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap'
import SimpleBar from 'simplebar-react'

const RightSideBar = ({open, toggleLeftCanvas, width_per}) => {
    return (
        <div>
            <Offcanvas style={{width:width_per}} isOpen={open} toggle={toggleLeftCanvas} direction='end'>
                <OffcanvasHeader className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark" toggle={toggleLeftCanvas}>
                    <span className="m-0 me-2 text-white">LC Form</span>
                </OffcanvasHeader>
                <OffcanvasBody className="p-0">
                    <SimpleBar className="h-100">
                        <div className="p-4">
                            <h6 className="mb-0 fw-semibold text-uppercase">Company</h6>
                            <p className="text-muted">Choose your layout</p>
                        </div>
                    </SimpleBar>
                </OffcanvasBody>

            </Offcanvas>
        </div>
    )
}

export default RightSideBar
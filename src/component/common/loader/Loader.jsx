import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineSkeleton } from '../skeleton/Skeleton';

const Loader = (props) => {
    return (
        <React.Fragment>
            <div className="mx-2 mt-2">
                <LineSkeleton lines={3} />
            </div>
            {toast.error(props.error, { position: "top-right", hideProgressBar: false, progress: undefined, toastId: "" })}
        </React.Fragment>
    );
};

export default Loader;

import React from 'react';
import Overlay from '../layout/Overlay'

interface Props {
    setClose: (c: boolean) => void;
    children: React.ReactNode;
}

export default function Confirm({ setClose, children }: Props) {
    const handleClose = function() {
        setClose(false);
    }

    return (
        <React.Fragment>
            <Overlay handleClose={handleClose}/>
            <div className='confirm modal'>
                {children}
            </div>
        </React.Fragment>
    )
}
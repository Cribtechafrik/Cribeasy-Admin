import React from 'react'
import Overlay from '../layout/Overlay'
import { AiOutlineClose } from 'react-icons/ai'

interface Props {
    title: string;
    setClose: (c: boolean) => void;
    children: React.ReactNode;
    customStyle?: React.CSSProperties;
}

export default function BasicModal({ title, setClose, children, customStyle }: Props) {
    const handleClose = function() {
        setClose(false)
    }

    return (
        <React.Fragment>
            <Overlay handleClose={handleClose} />
            <div className='modal basic--modal' style={customStyle ? customStyle : {}}>
                <div className="modal--head">
                    <h3 className="modal--title">{title}</h3>
                    <span onClick={handleClose}><AiOutlineClose /></span>
                </div>

                {children}
            </div>
        </React.Fragment>
    )
}
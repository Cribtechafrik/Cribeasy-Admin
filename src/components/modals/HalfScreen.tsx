import React from "react";
import Overlay from "../layout/Overlay";
import { AiOutlineClose } from "react-icons/ai";

interface Props {
    title: string;
    setClose: (c: boolean) => void;
    children: React.ReactNode;
    size?: any;
}

export default function HalfScreen({ title, setClose, children }: Props) {

    const handleClose = function() {
        setClose(false)
    }

    return (
        <React.Fragment>
            <Overlay handleClose={handleClose} />
            <div className='half-screen'>
                <div className="modal--head">
                    <h3 className="modal--title">{title}</h3>
                    <span onClick={handleClose}><AiOutlineClose /></span>
                </div>

                {children}
            </div>
        </React.Fragment>
    )
}

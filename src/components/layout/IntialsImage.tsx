import React from 'react'
import { useAuthContext } from '../../context/AuthContext';
import { getInitials } from '../../utils/helper';


export default function IntialsImage() {
    const { auth } = useAuthContext();

    return (
        <React.Fragment>
            {/* @ts-ignore */}
            {auth?.image?.url ? (
                <img className='auth--img' src={""} alt={""} />
            ) : (
                <span className='auth--img'>{getInitials("Alex", "Ayo")}</span>
            )}
        </React.Fragment>
    )
}
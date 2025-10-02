import React from 'react'
import { useAuthContext } from '../../context/AuthContext';
import { getInitials } from '../../utils/helper';


export default function IntialsImage() {
    const { auth } = useAuthContext();

    return (
        <React.Fragment>
            {/* @ts-ignore */}
            {(auth?.profile_image ? (
                <img className='auth--img' src={""} alt={""} />
            ) : (auth?.first_name) &&
                <span className='auth--img'>{getInitials(auth?.first_name, auth?.last_name)}</span>
            )}
        </React.Fragment>
    )
}
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


export function Intials({ hasImage, imageUrl, names }: { hasImage?: boolean, imageUrl?: string, names: string[] }) {
    return (
        <React.Fragment>
            {((hasImage && imageUrl) ? (
                <img className='auth--img' src={imageUrl} alt={imageUrl} />
            ) : (!hasImage && names) && (
                <span className='auth--img'>{getInitials(names?.[0], names?.[1])}</span>
            ))}
        </React.Fragment>
    )
}
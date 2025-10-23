import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext';
import { getInitials } from '../../utils/helper';
import { FaCamera } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';


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


export function Intials({ hasImage, imageUrl, names, showOnline=false }: { hasImage?: boolean, imageUrl?: string, names: string[]; showOnline?: boolean }) {
    return (
        <div style={{ position: "relative" }}>
            {((hasImage && imageUrl) ? (
                <img className='auth--img' src={imageUrl} alt={imageUrl} />
            ) : (!hasImage && names) && (
                <span className='auth--img'>
                    {getInitials(names?.[0], names?.[1])}
                </span>
            ))}
            {showOnline && <span className='show-online' />}
        </div>
    )
}


export function IntialsAndUploader({ hasImage, imageUrl, isPreview, names, handleChange, handleRemove }: {
    hasImage?: boolean, imageUrl?: string, names: string[]; isPreview: boolean;
    handleChange: (e: { target: { files: File } } | any) => void;
    handleRemove: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ position: "relative" }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {((hasImage && imageUrl) ? (
                <img className='auth--img' src={imageUrl} alt={imageUrl} />
            ) : (!hasImage && names) && (
                <span className='auth--img'>
                    {getInitials(names?.[0], names?.[1])}
                </span>
            ))}

            {(isPreview && isHovered) && (
                <div className='uploader--close-icon' onClick={handleRemove}>
                    <AiOutlineClose />
                </div>
            )}

            <div className='uploader--icon'>
                <input type='file' id="profile_image" accept="image/*" onChange={handleChange} />
                <label htmlFor="profile_image">
                    <FaCamera />
                </label>
            </div>
        </div>
    )
}
import { isArray } from 'chart.js/helpers';
import React, { useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { FiUpload } from 'react-icons/fi';
import { LuImagePlus } from 'react-icons/lu';


interface Props {
    title?: string;
    name?: string;
    text?: string | React.ReactNode;
    preview: string | string[];
    handleChange: (e: { target: { files: File } } | any) => void;
    handleRemove: (i?: number) => void;
}

export default function ImageUpload({ title, name, text, preview, handleChange, handleRemove }: Props) {
    const [dragging, setDragging] = useState(false);

    // WHEN DRAGGED OVER THE CONTAINER
    const handleOnDragOver = function(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(true);
    };
    
    // WHEN DRAGGED OUT THE CONTAINER
    const handleOnDragLeave = function() {
        setDragging(false);
    };
    
    // WHEN DROPPED THE CONTAINER
    const handleOnDrop = function(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        const event = { target: { files: [e.dataTransfer.files[0]] } };
        handleChange(event);
    };

    return (
        <span
            onDrop={handleOnDrop}
            onDragLeave={handleOnDragLeave}
            onDragOver={handleOnDragOver}
            className={`form--img-box ${dragging ? "dropping" : ""}`}
        >

            {preview ? (
                <div className="image-grid">
                    {(!isArray(preview)) && (
                        <div className='img-container'>
                            <button onClick={() => handleRemove()} className='form--upload-btn delete'><AiOutlineClose /></button>
                            <img src={preview} alt='Preview' className='img' />
                        </div>
                    )}
                </div>
            ) : (
                <span className='img-container'>
                    <LuImagePlus />
                </span>
            )}

            <input type='file' id={name} accept="image/*" onChange={handleChange} />
            <label htmlFor={name}>
                {!dragging ? (
                    <div className="form--item">
                        <h3>{title || `Drag & drop your image here, or click to browse`}</h3>
                        <p>{text || "Supports: JPG, PNG or GIF (Max 2MB)"}</p>
                        <span className="page--btn outline"><FiUpload /> Upload Image</span>
                    </div>
                ) : (
                    <div className="form--item">
                        <h3>Drop image</h3>
                        <p>{text || "Supports: JPG, PNG or GIF (Max 2MB)"}</p>
                    </div>
                )}
            </label>
        </span>
    )
}
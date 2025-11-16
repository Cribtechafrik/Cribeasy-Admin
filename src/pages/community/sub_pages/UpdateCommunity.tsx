import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext';
import type { CommunityDetailType, LandmardType } from '../../../utils/types';
// import { useNavigate } from 'react-router-dom';
import { IntialsAndUploader } from '../../../components/layout/IntialsImage';
import { AiOutlineClose } from 'react-icons/ai';
import { SpinnerMini } from '../../../components/elements/Spinner';


interface Props {
    id: string;
    closeEditModal: () => void;
    refetchData: () => void;
}

            // @ts-ignore
export default function UpdateCommunity({ id, closeEditModal, refetchData }: Props) {
    // const navigate = useNavigate();
    const { headers } = useAuthContext();
    const [loading, setLoading] = useState({ main: false, modal: true });

    const [communityData, setCommunityData] = useState({
        name: "",
        description: "",
        image: "",
    });
    const [landmarks, setLandmarks] = useState<LandmardType[]>([]);
    const [coverImage, setCoverImage] = useState({ preview: "", file: null });


    const handleImageChange = function(event: { target: { files: any[]; } }) {
        const file = event.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCoverImage({ preview: imageUrl, file });
        }
    }

    const handleRemoveImage = function() {
        setCoverImage({ preview: communityData?.image, file: null });
    }

    useEffect(function() {
        async function handleFetch() {
            setLoading({ ...loading, modal: true });

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities/${id}/edit?full=true`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            
            if(id && data?.success) {
                const community = data?.data as CommunityDetailType;
                setCommunityData({
                    name: community?.community,
                    description: community?.description,
                    image: community?.cloudinary_path,
                });

                setCoverImage({ file: null, preview: community?.cloudinary_path ?? "" });
                setLandmarks([...community?.landmarks] as any)
            }
            setLoading({ ...loading, modal: false });
        };

        if(id) {
            handleFetch();
        }
    }, [id]);
    
  return (
    <React.Fragment>
        {loading.modal && (
            <div className="table-spinner-container">
                <SpinnerMini />
            </div>
        )}

        {(!loading.modal && communityData) && (
            <div className="details--container flex-col-3">
                <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                    <div className="details--profile-img">
                        <IntialsAndUploader
                            hasImage={!!coverImage?.preview}
                            imageUrl={coverImage?.preview}
                            handleChange={handleImageChange}
                            handleRemove={handleRemoveImage}
                            isPreview={(!!coverImage?.file && !!coverImage?.preview)}
                        />
                    </div>

                    <div className="flex-col-0-8 user--details-top">
                        <h5 className="heading">{communityData?.name}</h5>
                    </div>
                </div>


                <div className="flex-col-2">
                    <h5 className="form--title">Community Details</h5>

                    <div className="form--item">
                        <label className="form--label">Community Name</label>
                        <input type="text" className="form--input" placeholder="Community Name" value={communityData.name} onChange={(e) => setCommunityData({ ...communityData, name: e?.target?.value })} />
                    </div>

                    <div className="form--item">
                        <label className="form--label">Description</label>
                        <textarea className="form--input" placeholder="Description" value={communityData.description} onChange={(e) => setCommunityData({ ...communityData, description: e?.target?.value })}></textarea>
                    </div>
                </div>

                <div className="flex-col-2">
                    <h5 className="form--title">Landmark</h5>

                    {landmarks?.length > 0 ? (
                        <div className="form--item">
                            {landmarks?.map(({ name }: { name: string, id: number }, i: number) => (
                                <span className="landmark--item" key={i}>
                                    {name} <AiOutlineClose />
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No landmarks yet</p>
                    )}
                </div>
            </div>
        )}
    </React.Fragment>
  )
}

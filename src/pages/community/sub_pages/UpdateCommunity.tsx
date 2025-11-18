import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext';
import type { CommunityDetailType, LandmarkType } from '../../../utils/types';
// import { useNavigate } from 'react-router-dom';
import { IntialsAndUploader } from '../../../components/layout/IntialsImage';
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { toast } from 'sonner';
import Confirm from '../../../components/modals/Confirm';
import { createPortal } from 'react-dom';
import Asterisk from '../../../components/elements/Asterisk';
import { IoCheckmarkCircle } from 'react-icons/io5';


interface Props {
    id: string;
    closeEditModal: () => void;
    refetchData: () => void;
}

export default function UpdateCommunity({ id, closeEditModal, refetchData }: Props) {
    // const navigate = useNavigate();
    const { headers, token, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState({ main: false, modal: true });
    const [showModal, setShowModal] = useState({ add: false, completed: false });

    const [communityData, setCommunityData] = useState({
        id: null,
        title: "",
        name: "",
        description: "",
        image: "",
    });

    const [landmark_name, set_landmark_name] = useState("")
    const [landmarks, setLandmarks] = useState<LandmarkType[]>([]);
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
                    id: community?.id as any,
                    name: community?.community || "",
                    title: community?.community || "Details",
                    description: community?.description || "",
                    image: community?.cloudinary_path || "",
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

    async function handleDeleteLandmark(id: number | string) {
        setLoading({ ...loading, modal: true })
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/landmarks/${id}`, {
                method: "DELETE",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setLandmarks(prev => prev.filter((landmark) => landmark.id !== id));
            refetchData();
            toast.success("Removed Successfully!")

        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, modal: false });
        }
    }

    async function handleCreateLandmark() {
        if (!landmark_name) return toast.error("Landmark name is required!");
        setLoading({ ...loading, main: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/landmarks`, {
                method: "POST",
                headers,
                body: JSON.stringify({ community_id: communityData.id, name: landmark_name })
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            const newLandmark = { id: data?.data?.id, community_id: communityData?.id!, name: data?.data?.name } as LandmarkType;
            setLandmarks(prev => [...prev, newLandmark ]);
            set_landmark_name("")
            setShowModal({ ...showModal, add: false, completed: true });
            refetchData();
            toast.success("Created Successfully!")
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }


    async function handleUploadCoverImage() {
        try {
            const formData = new FormData();
            coverImage?.file && formData.append('cover_image', coverImage?.file);

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities/${id}/cover-update`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            return { success: true, url: data?.data?.url }
        } catch(err: any) {
            return { success: false, msg: err?.message }
        }
    }

    async function handleSubmitCommunityEdit() {
        if (!communityData.image) return toast.error("Community name is required!");
        if (!communityData.description) return toast.error("Community description is required!");
        if (landmarks?.length == 0) return toast.error("At least one landmark is required!");

        setLoading({ ...loading, modal: true });

        try {
            if(coverImage?.file) {
                const result = await handleUploadCoverImage();
                if(!result.success) throw new Error("Error uploading cover image")
                setCoverImage(result.url)
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ name: communityData?.name, description: communityData.description })
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            toast.success("Edited Successfully!");
            setCommunityData(data?.data)
            closeEditModal();
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, modal: false });
        }
    }
    
    return (
        <React.Fragment>
            {loading.modal && (
                <div className="table-spinner-container">
                    <SpinnerMini />
                </div>
            )}

            {loading.main && createPortal(
                <Spinner />, document.body
            )}

            {showModal.add && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, add: false })}>
                    <div className="modal--body">
                        <h4 className="modal--title">Add New Landmark</h4>
                        <p className="modal--subtext">Add new Landmark near the selected property</p>

                        <div className="form--item">
                            <label htmlFor="name" className="form--label colored">Landmark Name <Asterisk /></label>
                            <input type="text" className="form--input" id="name" placeholder="Ikeja Suites" value={landmark_name} onChange={(e) => set_landmark_name(e.target.value)} />
                        </div>

                        <div className="modal--actions" style={{ marginTop: "1rem" }}>
                            <button className="modal--btn blured" onClick={() => setShowModal({ ...showModal, add: false })}>No, Cancel</button>
                            <button className="modal--btn filled" onClick={handleCreateLandmark}>Yes, Save</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">Created Successfully</h4>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
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
                            <h5 className="heading">{communityData?.title}</h5>
                        </div>
                    </div>


                    <div className="flex-col-2">
                        <h5 className="form--title">Community Details</h5>

                        <div className="form--item">
                            <label className="form--label">Community Name <Asterisk /></label>
                            <input type="text" className="form--input" placeholder="Community Name" value={communityData.name} onChange={(e) => setCommunityData({ ...communityData, name: e?.target?.value })} />
                        </div>

                        <div className="form--item">
                            <label className="form--label">Description <Asterisk /></label>
                            <textarea className="form--input" placeholder="Description" value={communityData.description} onChange={(e) => setCommunityData({ ...communityData, description: e?.target?.value })}></textarea>
                        </div>
                    </div>

                    <div className="flex-col-2">
                        <h5 className="form--title">Landmark</h5>

                        {landmarks?.length > 0 ? (
                            <div className="form--item">
                                {landmarks?.map(({ name, id }: { name: string, id: number }, i: number) => (
                                    <span className="landmark--item" key={i}>
                                        {name} 
                                        <span onClick={() => handleDeleteLandmark(id)}>
                                            <AiOutlineClose />
                                        </span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">No landmarks yet</p>
                        )}

                        <button className="add--btn" onClick={() => setShowModal({ ...showModal, add: true })}>
                            <AiOutlinePlus />
                            Add new Landmark
                        </button>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "40rem" }}>
                        <button className="modal--btn outline" onClick={closeEditModal}>Cancel</button>
                        <button className="modal--btn filled" onClick={handleSubmitCommunityEdit}>Save Changes</button>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}

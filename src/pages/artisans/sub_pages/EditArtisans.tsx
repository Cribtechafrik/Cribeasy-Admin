import React, { useEffect, useState } from "react";
import { SpinnerMini } from "../../../components/elements/Spinner";
import { useAuthContext } from "../../../context/AuthContext";
import { IntialsAndUploader } from "../../../components/layout/IntialsImage";
import Asterisk from "../../../components/elements/Asterisk";
import type { Community_Type, Identity_type_Type } from "../../../utils/types";
import { fetchCommunities, fetchIdentityTypes } from "../../../utils/fetch";
import { ImCheckboxChecked } from "react-icons/im";
import { FaWindowClose } from "react-icons/fa";
import { toast } from "sonner";

interface Props {
    id: number;
    refetchData: () => void;
    closeEditModal: () => void;
}

export default function EditArtisans({ id, closeEditModal, refetchData }: Props) {
    const { headers, shouldKick } = useAuthContext();

    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [loading, setLoading] = useState({ main: false, modal: true });
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
  
    const [artisansData, setArtisansData] = useState({
        first_name: "",
        last_name: "",
        full_name: "",
        email: "",
        phone_number: "",
        company_name: "",
        identity_type_id: "",
        is_active: 0,
        has_verified_docs: 0,
        has_phone_verified: 0,
        years_experience: "",
        community_id: "",
    });

    const handleArtisanDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setArtisansData({ ...artisansData, [name]: value });
    }

    const handleImageChange = function(event: { target: { files: any[]; } }) {
        const file = event.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage({ preview: imageUrl, file });
        }
    }

    const handleRemoveImage = function() {
        setProfileImage({ preview: "", file: null });
    }

    useEffect(function() {
        async function handleFetch() {
            setLoading({ ...loading, modal: true });

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans/${id}?full=true`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            console.log(data)
            
            if(id && data?.success) {
                const artisans = data?.data;
                setArtisansData({
                    ...artisansData,
                    full_name: artisans?.full_name || "",
                    first_name: artisans?.full_name || "",
                    last_name: artisans?.full_name || "",
                    email: artisans?.email || "",
                    phone_number: artisans?.phone_number || "",
                    company_name: artisans?.company_name || "",
                    identity_type_id: artisans?.identity_type_id || "",
                    is_active: +artisans?.is_active,
                    has_verified_docs: +artisans?.has_verified_docs,
                    has_phone_verified: +artisans?.has_phone_verified,
                    years_experience: artisans?.years_experience,
                    community_id: artisans?.community_id,
                });

                setProfileImage({ file: null, preview: artisans?.profile_image ?? "" })
            }
            setLoading({ ...loading, modal: false });
        };

        if(id) {
            handleFetch();
        }
    }, [id]);

    useEffect(function() {
        const fetchData = async function(){
            const [identityTypeData, communities] = await Promise.all([
                fetchIdentityTypes(headers),
                fetchCommunities(headers),
            ]);

            if (identityTypeData?.success) setIdentityTypes(identityTypeData.data[0]);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        fetchData();
    }, []);

    async function handleUpdateArtisans() {
 setLoading({ ...loading, modal: true });

        try {
            const { community_id, company_name, is_active } = artisansData;
    
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans/${id}/profile-update`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify({ community_id, company_name, is_active })
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                // throw new Error(data?.error?.message);
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            toast.success("Artisans Edited Successfully!");
            closeEditModal();
            refetchData();
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


        {(!loading.modal && artisansData) && (
            <div className="details--container flex-col-3">
                <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                    <div className="details--profile-img">
                        <IntialsAndUploader
                            hasImage={!!profileImage?.preview}
                            imageUrl={profileImage?.preview}
                            names={[artisansData?.first_name, artisansData?.last_name]}
                            handleChange={handleImageChange}
                            handleRemove={handleRemoveImage}
                            isPreview={(!!profileImage?.file && !!profileImage?.preview)}
                        />
                    </div>

                    <div className="flex-col-0-8 user--details-top">
                        <h5 className="heading">{artisansData?.full_name}</h5>
                        <p className="info">#{id}</p>
                    </div>
                </div>

                <div className="flex-col-2">
                    <div className="form">
                        <h4 className="form--title">Personal Information</h4>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="full_name" className="form--label">Full Name <Asterisk /></label>
                                <input type="text" className="form--input" name="full_name" id="full_name" placeholder="Taiwo Matthew" value={artisansData.full_name} readOnly disabled />
                            </div>
                            <div className="form--item">
                                <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                <input type="text" className="form--input" name="email" id="email" placeholder="example@mail.com" value={artisansData.email} readOnly disabled />
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                <input type="text" className="form--input" name="phone_number" id="phone_number" placeholder="+2349044556701" value={artisansData.phone_number} readOnly disabled />
                            </div>

                            <div className="form--item">&nbsp;</div>
                        </div>
                    </div>


                    <div className="form">
                        <h4 className="form--title">Company Details</h4>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="company_name" className="form--label">Company Name <Asterisk /></label>
                                <input type="text" className="form--input" name="company_name" id="company_name" placeholder="Buildspire Ng" value={artisansData.company_name} onChange={handleArtisanDataChange} />
                            </div>

                            <div className="form--item">
                                <label htmlFor="lasrera" className="form--label">Years of Experience</label>
                                <input type="text" className="form--input" id="years_experience" min={0} max={30} placeholder="Years of experience" value={artisansData.years_experience} disabled readOnly />
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                <select className="form--select" name="community_id" id="community_id" value={artisansData?.community_id} onChange={handleArtisanDataChange}>
                                    <option selected hidden>Community</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">&nbsp;</div>
                        </div>
                    </div>

                    <div className="form">
                        <h4 className="form--title">Identity & Account Status</h4>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="identity_type_id" className="form--label">ID Type</label>
                                <select name="identity_type_id" id="identity_type_id" className="form--select" value={artisansData.identity_type_id} disabled>
                                    <option hidden selected>Id Type</option>
                                    {identityTypes && identityTypes?.map((type, i) => (
                                        <option value={type?.id} key={i}>{type.identity_type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="is_active" className="form--label">Status</label>
                                <select name="is_active" id="is_active" className="form--select" value={artisansData.is_active} onChange={handleArtisanDataChange}>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="form">
                        <h4 className="form--title">Verification</h4>
                        
                        <div className="form--input flex-align-justify-spabtw">
                            <label className="form--label">Identity</label>
                            
                            <React.Fragment>
                                {artisansData?.has_verified_docs == 1 ? (
                                    <span className="flex-align-cen verified-true">
                                        <ImCheckboxChecked />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="flex-align-cen verified-false">
                                        <FaWindowClose />
                                        Unverified
                                    </span>
                                )}
                            </React.Fragment>
                        </div>
                        <div className="form--input flex-align-justify-spabtw">
                            <label className="form--label">Phone Number</label>
                            
                            <React.Fragment>
                                {artisansData?.has_phone_verified == 1 ? (
                                    <span className="flex-align-cen verified-true">
                                        <ImCheckboxChecked />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="flex-align-cen verified-false">
                                        <FaWindowClose />
                                        Unverified
                                    </span>
                                )}
                            </React.Fragment>
                        </div>
                    </div>
                </div>

                <div className="modal--actions" style={{ maxWidth: "40rem" }}>
                    <button className="modal--btn outline" onClick={closeEditModal}>Cancel</button>
                    <button className="modal--btn filled" onClick={handleUpdateArtisans}>Save Changes</button>
                </div>
            </div>
        )}
      
    </React.Fragment>
  )
}

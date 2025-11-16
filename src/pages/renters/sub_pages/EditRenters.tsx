import React, { useEffect, useState } from "react";
import { SpinnerMini } from "../../../components/elements/Spinner";
import { IntialsAndUploader } from "../../../components/layout/IntialsImage";
import { useAuthContext } from "../../../context/AuthContext";
import type { Community_Type, Employment_Status_Type, Identity_type_Type } from "../../../utils/types";
import Asterisk from "../../../components/elements/Asterisk";
import { fetchCommunities, fetchEmploymentStatuses, fetchIdentityTypes } from "../../../utils/fetch";
import { ImCheckboxChecked } from "react-icons/im";
import { FaWindowClose } from "react-icons/fa";
import { toast } from "sonner";


interface Props {
    id: number;
    closeEditModal: () => void;
    refetchTable: () => void;
}

export default function EditRenters({ id, closeEditModal, refetchTable }: Props) {
    const { headers, shouldKick } = useAuthContext();

    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [employmentStatuses, setEmploymentStatuses] = useState<Employment_Status_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [loading, setLoading] = useState({ modal: true });
    const [renterData, setRenterData] = useState({
        full_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        occupation: "",
        identity_type_id: "",
        community_id: "",
        employment_status_id: "",
        is_active: "",
        has_verified_docs: 0,
    });

    const [profileImage, setProfileImage] = useState({ preview: "", file: null });


    const handleRenterDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setRenterData({ ...renterData, [name]: value });
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

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters/${id}?full=true&withIdentification=true`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            
            if(id && data?.success) {
                const renter = data?.data as any;

                setRenterData({
                    ...renterData,
                    full_name: renter?.full_name || "",
                    first_name: renter?.first_name || "",
                    last_name: renter?.last_name || "",
                    email: renter?.email || "",
                    phone_number: renter?.phone_number || "",
                    occupation: renter?.occupation || "",
                    is_active: `${renter?.is_active}` || "",
                    has_verified_docs: renter?.has_verified_docs,
                    identity_type_id: renter?.identity_type_id || "",
                    community_id: renter?.community_id || "",
                    employment_status_id: renter?.employment_status_id || "",
                });
                setProfileImage({ ...profileImage, preview: renter?.profile_image ?? "" })
            }
            setLoading({ ...loading, modal: false });
        }

        handleFetch();
    }, [id]);

    useEffect(function() {
        const fetchData = async function(){
            const [identityTypeData, employmentStatuses, communities] = await Promise.all([
                fetchIdentityTypes(headers),
                fetchEmploymentStatuses(headers),
                fetchCommunities(headers),
            ]);

            if (identityTypeData?.success) setIdentityTypes(identityTypeData.data[0]);
            if (employmentStatuses?.success) setEmploymentStatuses(employmentStatuses.data[0]);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        fetchData();
    }, []);

    async function handleSaveChanges() {
        setLoading({ ...loading, modal: true });

        try {
            // const formData = new FormData();
            // formData.append('occupation', renterData.occupation);
            // formData.append('community_id', renterData?.community_id);
            // formData.append('is_active', renterData?.is_active || "0");
            // formData.append('employment_status_id', renterData?.employment_status_id);

            // if(profileImage?.file) {
            //     formData.append('profile_image', profileImage?.file);
            // }
            
            // const formDataHeaders = {
            //     "Accept": "application/json",
            //     Authorization: `Bearer ${token}`
            // }

            const { community_id, occupation, is_active, employment_status_id } = renterData;

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters/${id}/profile-update`, {
                method: "PUT",
                headers: headers,
                
                body: JSON.stringify({ community_id, occupation, is_active, employment_status_id })
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

            toast.success(`Renter Edited Successfully!`);
            closeEditModal();
            refetchTable();
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

            {(!loading.modal && renterData) && (
                <div className="details--container flex-col-3">
                    <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                        <div className="details--profile-img">
                            <IntialsAndUploader
                                hasImage={!!profileImage?.preview}
                                imageUrl={profileImage?.preview}
                                names={[renterData?.first_name, renterData?.last_name]}
                                handleChange={handleImageChange}
                                handleRemove={handleRemoveImage}
                                isPreview={(!!profileImage?.file && !!profileImage?.preview)}
                            />
                        </div>

                        <div className="flex-col-0-8 user--details-top">
                            <h5 className="heading">{renterData?.full_name}</h5>
                            <p className="info">{renterData?.email}</p>
                        </div>
                    </div>


                    <div className="flex-col-2">
                        <div className="form">
                            <h4 className="form--title">Personal Information</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="full_name" className="form--label">Full Name <Asterisk /></label>
                                    <input type="text" className="form--input" name="full_name" id="full_name" placeholder="Taiwo Matthew" value={renterData.full_name} readOnly disabled />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                    <input type="text" className="form--input" name="email" id="email" placeholder="example@mail.com" value={renterData.email} readOnly disabled />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                    <input type="text" className="form--input" name="phone_number" id="phone_number" placeholder="+2349044556701" value={renterData.phone_number} readOnly disabled />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="occupation" className="form--label">Occupation <Asterisk /></label>
                                    <input type="text" className="form--input" name="occupation" id="occupation" placeholder="Farmer" value={renterData.occupation} onChange={handleRenterDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                    <select className="form--select" name="community_id" id="community_id" value={renterData?.community_id} onChange={handleRenterDataChange}>
                                        <option selected hidden>Community</option>
                                        {communities && communities?.map((c, i) => (
                                            <option value={c?.id} key={i}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="employment_status_id" className="form--label">Employment Status <Asterisk /></label>
                                    <select className="form--select" name="employment_status_id" id="employment_status_id" value={renterData?.employment_status_id} onChange={handleRenterDataChange}>
                                        <option selected hidden>Employment Status</option>
                                        {employmentStatuses && employmentStatuses?.map((status, i) => (
                                            <option value={status?.id} key={i}>{status.employment_type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form">
                            <h4 className="form--title">Identity & Account Status</h4>


                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="identity_type_id" className="form--label">ID Type <Asterisk /></label>
                                    <select name="identity_type_id" id="identity_type_id" className="form--select" value={renterData.identity_type_id} disabled>
                                        <option hidden selected>Id Type</option>
                                        {identityTypes && identityTypes?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.identity_type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="is_active" className="form--label">Status</label>
                                    <select name="is_active" id="is_active" className="form--select" value={renterData.is_active} onChange={handleRenterDataChange}>
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
                                    {renterData?.has_verified_docs == 1 ? (
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
                        <button className="modal--btn filled" onClick={handleSaveChanges}>Save Changes</button>
                    </div>
                </div>
            )}                      
        </React.Fragment>
    )
}

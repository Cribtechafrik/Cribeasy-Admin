import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";

import type { Community_Type, Identity_type_Type } from "../../../utils/types";
import { createPortal } from "react-dom";
import Confirm from "../../../components/modals/Confirm";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { SpinnerMini } from "../../../components/elements/Spinner";
import { capAllFirstLetters } from "../../../utils/helper";
import { toast } from "sonner";
import { fetchCommunities, fetchIdentityTypes } from "../../../utils/fetch";
import Asterisk from "../../../components/elements/Asterisk";
import { IntialsAndUploader } from "../../../components/layout/IntialsImage";
import { ImCheckboxChecked } from "react-icons/im";
import { FaWindowClose } from "react-icons/fa";

interface Props {
    id: string;
    closeEditModal: () => void;
    refetchData: () => void;
}

export default function Update_Agents_Landlord({ id, closeEditModal, refetchData }: Props) {
    const { headers, shouldKick } = useAuthContext();

    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);


    const [loading, setLoading] = useState({ main: false, modal: true });
    const [showModal, setShowModal] = useState({ confirm: false, completed: false });

    const [profileImage, setProfileImage] = useState({ preview: "", file: null });

    const [agent_landlord_data, set_agent_landlord_data] = useState({
        full_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        company_name: "",
        is_active: 0,
        has_verified_docs: 0,
        role: "",
        community_id: "",
        identity_type_id: "",
        lasrera: "",
    });

    const handleUsersDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        set_agent_landlord_data({ ...agent_landlord_data, [name]: value });
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

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}?full=true&withIdentification=true`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            
            if(id && data?.success) {
                const agent_landlord = data?.data;
                set_agent_landlord_data({
                    ...agent_landlord_data,
                    role: agent_landlord?.role || "",
                    full_name: agent_landlord?.full_name || "",
                    first_name: agent_landlord?.full_name || "",
                    last_name: agent_landlord?.full_name || "",
                    email: agent_landlord?.email || "",
                    phone_number: agent_landlord?.phone_number || "",
                    company_name: agent_landlord?.company_name || "",
                    identity_type_id: agent_landlord?.identity_type_id || "",
                    is_active: +agent_landlord?.is_active,
                    has_verified_docs: +agent_landlord?.has_verified_docs
                });

                setProfileImage({ file: null, preview: agent_landlord?.profile_image ?? "" })
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


    async function handleToggleActivation() {
        setLoading({ ...loading, main: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/toggle-users-activation/${id}`, {
                method: "PATCH",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ confirm: false, completed: true })
            set_agent_landlord_data({ ...agent_landlord_data, is_active: agent_landlord_data?.is_active == 0 ? 1 : 0 });

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }


    async function handleUpdateUser() {
        setLoading({ ...loading, modal: true });

        try {
            const { community_id, company_name, is_active } = agent_landlord_data;
    
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}/profile-update`, {
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
    
                toast.success(`${agent_landlord_data?.role} Edited Successfully!`);
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
    
            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">{agent_landlord_data?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(agent_landlord_data?.role ?? "")}</h4>
                        <p className="modal--subtext">Are you sure you want to {agent_landlord_data?.is_active == 1 ? "Deactivate" : "Activate"} this {agent_landlord_data?.role}? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleToggleActivation}>Yes, {agent_landlord_data?.is_active == 1 ? "Deactivate" : "Activate"}</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{agent_landlord_data?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(agent_landlord_data?.role ?? "")} Successfully</h4>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}


            {(!loading.modal && agent_landlord_data) && (
                <div className="details--container flex-col-3">
                    <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                        <div className="details--profile-img">
                            <IntialsAndUploader
                                hasImage={!!profileImage?.preview}
                                imageUrl={profileImage?.preview}
                                names={[agent_landlord_data?.first_name, agent_landlord_data?.last_name]}
                                handleChange={handleImageChange}
                                handleRemove={handleRemoveImage}
                                isPreview={(!!profileImage?.file && !!profileImage?.preview)}
                            />
                        </div>

                        <div className="flex-col-0-8 user--details-top">
                            <h5 className="heading">{agent_landlord_data?.full_name}</h5>
                            <p className="info">{agent_landlord_data?.email}</p>
                        </div>
                    </div>

                    <div className="flex-col-2">
                        <div className="form">
                            <h4 className="form--title">Personal Information</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="full_name" className="form--label">Full Name <Asterisk /></label>
                                    <input type="text" className="form--input" name="full_name" id="full_name" placeholder="Taiwo Matthew" value={agent_landlord_data.full_name} readOnly disabled />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                    <input type="text" className="form--input" name="email" id="email" placeholder="example@mail.com" value={agent_landlord_data.email} readOnly disabled />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                    <input type="text" className="form--input" name="phone_number" id="phone_number" placeholder="+2349044556701" value={agent_landlord_data.phone_number} readOnly disabled />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="company_name" className="form--label">Company Name <Asterisk /></label>
                                    <input type="text" className="form--input" name="company_name" id="company_name" placeholder="BuildSpire Ng" value={agent_landlord_data.company_name} onChange={handleUsersDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                    <select className="form--select" name="community_id" id="community_id" value={agent_landlord_data?.community_id} onChange={handleUsersDataChange}>
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
                            <h4 className="form--title">Identity</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="identity_type_id" className="form--label">ID Type <Asterisk /></label>
                                    <select name="identity_type_id" id="identity_type_id" className="form--select" value={agent_landlord_data.identity_type_id} disabled>
                                        <option hidden selected>Id Type</option>
                                        {identityTypes && identityTypes?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.identity_type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="lasrera" className="form--label">LASRERA Number (Optional)</label>
                                    <input type="text" className="form--input" name="lasrera" id="lasrera" placeholder="Enter a LASRERA number" value={agent_landlord_data.lasrera} onChange={handleUsersDataChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form">
                            <h4 className="form--title">Identity</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="is_active" className="form--label">Status</label>
                                    <select name="is_active" id="is_active" className="form--select" value={agent_landlord_data.is_active} onChange={handleUsersDataChange}>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="form--item">&nbsp;</div>
                            </div>
                        </div>

                        <div className="form">
                            <h4 className="form--title">Verification</h4>
                            
                            <div className="form--input flex-align-justify-spabtw">
                                <label className="form--label">Identity</label>
                                
                                <React.Fragment>
                                    {agent_landlord_data?.has_verified_docs == 1 ? (
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

                    <div className="modal--actions" style={{ maxWidth: "55rem" }}>
                        <button className="modal--btn outline" onClick={closeEditModal}>Cancel</button>
                        <button className="modal--btn outline-remove" onClick={() => setShowModal({ ...showModal, confirm: true })}>
                            {agent_landlord_data?.is_active == 1 ? "Deactivate" : "Activate"} {agent_landlord_data?.role}
                        </button>
                        <button className="modal--btn filled" onClick={handleUpdateUser}>Update {capAllFirstLetters(agent_landlord_data?.role)} Profile</button>
                    </div>
                </div>
            )}

        </React.Fragment>
        
    )
}

import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import type { Agent_Landlord_Type } from "../../../utils/types";
import { createPortal } from "react-dom";
import Confirm from "../../../components/modals/Confirm";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoCheckmarkCircle } from "react-icons/io5";
import Spinner from "../../../components/elements/Spinner";
import { capAllFirstLetters } from "../../../utils/helper";
import { toast } from "sonner";

type FormDataType = {
    full_name: string;
    email: string;
    phone_number: string;
    company_name: string;
    identity_type: string;
    is_active?: string | number;
    has_verified_docs?: string | number;
    role: string;
}

// @ts-ignore
export default function Update_Agents_Landloard({ id, closeDetails }: { id: number; closeDetails: () => void; }) {
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState({ confirm: false, completed: false });
// @ts-ignore
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });

    const [formdata, setFormdata] = useState<FormDataType>({
        full_name: "",
        email: "",
        phone_number: "",
        company_name: "",
        identity_type: "",
        is_active: "",
        has_verified_docs: "",
        role: "",
    });


    useEffect(function() {
        async function handleFetch() {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}?full=true&withIdentification=true`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            
            if(id && data?.success) {
                const result: Agent_Landlord_Type = data?.data;
                setFormdata({
                    role: result?.role || "",
                    full_name: result?.full_name || "",
                    email: result?.email || "",
                    phone_number: result?.phone_number || "",
                    company_name: result?.company_name || "",
                    identity_type: `${result?.identity_type}` || "",
                    is_active: +result?.is_active,
                    has_verified_docs: 0
                });

                setProfileImage({ file: null, preview: result?.profile_image ?? "" })
            }
            setLoading(false);
        };

        if(id) {
            handleFetch();
        }
    }, [id]);


    async function handleToggleActivation() {
        setLoading(true);

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
            setFormdata({ ...formdata, is_active: formdata?.is_active == 0 ? 1 : 0 });

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }


    async function handleUpdateUser() {
    // `${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}/profile-update`

    }


    return (
        <React.Fragment>
            {loading && <Spinner />}
    
            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">{formdata?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(formdata?.role ?? "")}</h4>
                        <p className="modal--subtext">Are you sure you want to {formdata?.is_active == 1 ? "Deactivate" : "Activate"} this {formdata?.role}? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleToggleActivation}>Yes, {formdata?.is_active == 1 ? "Deactivate" : "Activate"}</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{formdata?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(formdata?.role ?? "")} Successfully</h4>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}



                {/* <div className="form--grid">
                    <div className="flex-col-gap">
                        <h4 className="form--title">Identity & Certificate</h4>

                        <div className="form--item">
                            <label htmlFor="identity_type" className="form--label colored">ID Type <Asterisk /></label>
                            <select name="identity_type" id="identity_type" className="form--select" value={formdata.identity_type} onChange={handleUserDataChange}>
                                <option hidden disabled selected>Id Type</option>
                                {identityTypes && identityTypes?.map((type, i) => (
                                    <option value={type?.id} key={i}>{type.identity_type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form--item">
                            <label htmlFor="lasrera" className="form--label colored">LASRERA Number <Asterisk /></label>
                            <input type="text" className="form--input" name="lasrera" id="lasrera" placeholder="Enter a LASRERA number" value={formdata.lasrera} onChange={handleUserDataChange} />
                        </div>
                    </div>

                    <div className="flex-col-gap">
                        <h4 className="form--title">Status & Verification</h4>

                        <div className="form--item">
                            <label htmlFor="status" className="form--label colored">ID Type <Asterisk /></label>
                            <select name="status" id="status" className="form--select" value={formdata.is_active} onChange={handleUserDataChange}>
                                <option value={0}>Inactive</option>
                                <option value={1}>Active</option>
                            </select>
                        </div>

                        <div className="form--item">
                            <label className="form--label colored">Verification Status</label>

                            <div className="form--input flex-align-justify-spabtw">
                                <label className="form--label colored">Identity:</label>
                                
                                <React.Fragment>
                                    {formdata?.has_verified_docs == 1 ? (
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
                </div> */}


                <div className="modal--actions" style={{ maxWidth: "55rem" }}>
                    <button className="modal--btn filled" onClick={handleUpdateUser}>Edit {capAllFirstLetters(formdata?.role)}</button>
                    <button className="modal--btn outline-remove" onClick={() => setShowModal({ ...showModal, confirm: true })}>
                        {formdata?.is_active == 1 ? "Deactivate" : "Activate"} {formdata?.role}
                    </button>
                    <button className="modal--btn outline" onClick={() => navigate(-1)}>Cancel</button>
                </div>

        </React.Fragment>
        
    )
}

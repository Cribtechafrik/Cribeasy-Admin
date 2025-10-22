import React, { useEffect, useState } from "react";
import Spinner from "../../../components/elements/Spinner";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Asterisk from "../../../components/elements/Asterisk";
import ImageUpload from "../../../components/layout/ImageUpload";
import Line from "../../../components/elements/Line";
import { useAuthContext } from "../../../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fetchCommunities, fetchEmploymentStatuses, fetchIdentityTypes } from "../../../utils/fetch";
import type { Community_Type, Employment_Status_Type, Identity_type_Type } from "../../../utils/types";


const breadCrumbs = [
    { name: "Renters", link: "/dashboard/renters" },
    { name: "Add New Renters", isCurrent: true },
];


export default function CreateRenters() {
    const navigate = useNavigate();
    const { shouldKick, token, headers } = useAuthContext();

    const [loading, setLoading] = useState(false);
    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [employmentStatuses, setEmploymentStatuses] = useState<Employment_Status_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
    const [idUpload, setIdUpload] = useState({ preview: "", file: null });

    const [formdata, setFormdata] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        occupation: "",
        identity_type_id: "",
        community_id: "",
        employment_status_id: "",
    });

    const handleImageChange = function(event: { target: { files: any[]; } }, name: string) {
        const file = event.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (name == "profile_image") {
                setProfileImage({ preview: imageUrl, file });
            }
            if (name == "id_upload") {
                setIdUpload({ preview: imageUrl, file });
            }
        }
    }

    const handleRemoveImage = function(name: string) {
        if(name == "profile_image") {
            setProfileImage({ preview: "", file: null });
        }
        if(name == "id_upload") {
            setIdUpload({ preview: "", file: null });
        }
    }

    const handleUserDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFormdata({ ...formdata, [name]: value });
    }

    useEffect(function() {
        const fetchData = async () => {
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

    async function handleSubmitRenter() {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('first_name', formdata.full_name?.split(" ")[0]);
            formData.append('last_name', formdata.full_name?.split(" ")[1]);
            formData.append('phone_number', formdata.phone_number);
            formData.append('password', formdata.password);
            formData.append('email', formdata.email?.toLowerCase());
            formData.append('occupation', formdata.occupation);
            formData.append('identity_type_id', formdata.identity_type_id);
            formData.append('community_id', formdata?.community_id);
            formData.append('employment_status_id', formdata?.employment_status_id);
            formData.append('mark_as_verified', "1");

            if(profileImage?.file) {
                formData.append('profile_image', profileImage?.file);
            }
            if(idUpload?.file) {
                formData.append('doc_image', idUpload?.file);
            }
            
            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters-create`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 201 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            toast.success(`Renter Created Successfully!`);
            navigate("/dashboard/renters")

        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <React.Fragment>
            {loading && <Spinner />}

            <section className="">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">New Artisans</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>
                </div>

                <div className="card form">
                    <div className="form--section">
                        <div className="flex-col-gap">
                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="full_name" className="form--label">Full Name <Asterisk /></label>
                                    <input type="text" className="form--input" name="full_name" id="full_name" placeholder="Taiwo Matthew" value={formdata.full_name} onChange={handleUserDataChange} />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                    <input type="text" className="form--input" name="email" id="email" placeholder="example@mail.com" value={formdata.email} onChange={handleUserDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                    <input type="text" className="form--input" name="phone_number" id="phone_number" placeholder="+2349044556701" value={formdata.phone_number} onChange={handleUserDataChange} />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="occupation" className="form--label">Occupation <Asterisk /></label>
                                    <input type="text" className="form--input" name="occupation" id="occupation" placeholder="Farmer" value={formdata.occupation} onChange={handleUserDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                    <select className="form--select" name="community_id" id="community_id" value={formdata?.community_id} onChange={handleUserDataChange}>
                                        <option selected hidden>All</option>
                                        {communities && communities?.map((c, i) => (
                                            <option value={c?.id} key={i}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="employment_status_id" className="form--label">Employment Status <Asterisk /></label>
                                    <select className="form--select" name="employment_status_id" id="employment_status_id" value={formdata?.employment_status_id} onChange={handleUserDataChange}>
                                        <option selected hidden>All</option>
                                        {employmentStatuses && employmentStatuses?.map((status, i) => (
                                            <option value={status?.id} key={i}>{status.employment_type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form--item">
                            <label className="form--label flex-align-cen">Profile Image <span className="form--info">(Optional)</span></label>
                            <ImageUpload
                                name="profile_image"
                                preview={profileImage.preview}
                                handleChange={(e) => handleImageChange(e, "profile_image")} 
                                handleRemove={() => handleRemoveImage("profile_image")}
                            />
                        </div>
                    </div>

                    <Line />

                    <div className="flex-col-gap">
                        <h4 className="form--title">Identity</h4>

                        <div className="form--section">
                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="identity_type_id" className="form--label colored">ID Type <Asterisk /></label>
                                    <select name="identity_type_id" id="identity_type_id" className="form--select" value={formdata.identity_type_id} onChange={handleUserDataChange}>
                                        <option hidden selected>Id Type</option>
                                        {identityTypes && identityTypes?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.identity_type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="" className="form--label colored">Upload ID Document <Asterisk /></label>
                                    <ImageUpload
                                        title=" "
                                        name="id_upload"
                                        preview={idUpload.preview}
                                        handleChange={(e) => handleImageChange(e, "id_upload")} 
                                        handleRemove={() => handleRemoveImage("id_upload")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "55rem" }}>
                        <button className="modal--btn filled" onClick={handleSubmitRenter}>Add New Renter</button>
                        <button className="modal--btn outline" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </div>
            </section>
        </React.Fragment>
    )
}

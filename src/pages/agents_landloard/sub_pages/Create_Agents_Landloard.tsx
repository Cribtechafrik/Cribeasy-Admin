import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/elements/Spinner";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Asterisk from "../../../components/elements/Asterisk";
import ImageUpload from "../../../components/layout/ImageUpload";
import Line from "../../../components/elements/Line";
import { toast } from "sonner";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { useAuthContext } from "../../../context/AuthContext";
import { fetchCommunities, fetchIdentityTypes } from "../../../utils/fetch";
import CheckBoxInput from "../../../components/forms/CheckBoxInput";
import { capAllFirstLetters } from "../../../utils/helper";
import type { Community_Type, Identity_type_Type } from "../../../utils/types";

const breadCrumbs = [
    { name: "Agents/Landlords", link: "/dashboard/agents-landlords" },
    { name: "Add New Agents/Landlords", isCurrent: true },
];

type FormDataType = {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    company_name: string;
    identity_type: string;
    lasrera: string;
    community_id: string;
    mark_as_verified: boolean;
}

export default function Create_Agents_Landloard() {
    const navigate = useNavigate();
    const { headers, token, shouldKick } = useAuthContext();

    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

	const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("agent");

    const [showPassword, setShowPassword] = useState(false);
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
    const [idUpload, setIdUpload] = useState({ preview: "", file: null });
    const [cacCertificate, setCacCertificate] = useState({ preview: "", file: null });
    
    const [formdata, setFormdata] = useState<FormDataType>({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        company_name: "",
        identity_type: "",
        lasrera: "",
        community_id: "",
        mark_as_verified: false,
    });

    const handleUserDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFormdata({ ...formdata, [name]: value });
    }

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
            if (name == "cac_certificate") {
                setCacCertificate({ preview: imageUrl, file });
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
        if(name == "cac_certificate") {
            setCacCertificate({ preview: "", file: null });
        }
    }

    useEffect(function() {
        const fetchData = async () => {
            const [identityTypeData, communities] = await Promise.all([
                fetchIdentityTypes(headers),
                fetchCommunities(headers),
            ]);

            if (identityTypeData?.success) setIdentityTypes(identityTypeData.data[0]);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        fetchData();
    }, []);

    async function handleSubmitUser() {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('role', role);
            formData.append('first_name', formdata.full_name?.split(" ")[0]);
            formData.append('last_name', formdata.full_name?.split(" ")[1]);
            formData.append('phone_number', formdata.phone_number);
            formData.append('password', formdata.password);
            formData.append('email', formdata.email?.toLowerCase());
            formData.append('company_name', formdata.company_name);
            formData.append('lasrera', formdata.lasrera);
            formData.append('identity_type_id', formdata.identity_type);
            formData.append('community_id', formdata?.community_id);
            formData.append('mark_as_verified', formdata.mark_as_verified ? "1" : "0");

            if(profileImage?.file) {
                formData.append('profile_image', profileImage?.file);
            }
            if(idUpload?.file) {
                formData.append('proof_of_identity', idUpload?.file);
            }
            if(cacCertificate?.file) {
                formData.append('cac', cacCertificate?.file);
            }
            
            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords-create`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 201 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            toast.success(`${capAllFirstLetters(role)} Created Successfully!`);
            navigate("/dashboard/agents-landlords")

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
						<h4 className="title">New Listings</h4>
						<Breadcrumbs breadcrumArr={breadCrumbs} />
					</div>
				</div>

                <div className="card form">
                    <div className="flex-col-gap">
                        <h4 className="form--title">User Information</h4>

                        <div className="flex-align-cen">
                            <label className="form--label role">Role:{" "}</label>
                            <select className="form--select role" name="role" value={role} onChange={(e) => setRole(e?.target?.value)}>
                                <option value="agent" selected>Agent</option>
                                <option value="landlord">Landlord</option>
                            </select>
                        </div>
                    </div>


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
                                    <label htmlFor="password" className="form--label">Password <Asterisk /></label>
                                    <div className="form--input-box">
                                        <input type={showPassword ? "text" : "password"} className="form--input" name="password" id="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={formdata.password} onChange={handleUserDataChange} />
                                        <div className='form--input-icon' onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <ImEye /> : <ImEyeBlocked />}
                                        </div>
                                    </div>
                                    <div className="sub-text">A secure password will be automatically sent to the agent's email</div>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="company_name" className="form--label flex-align-cen">Company Name <span className="form--info">(Optional)</span></label>
                                    <input type="text" className="form--input" name="company_name" id="company_name" placeholder="Real estate company LTD " value={formdata.company_name} onChange={handleUserDataChange} />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                    <select className="form--select" name="community_id" id="community_id" value={formdata?.community_id} onChange={handleUserDataChange}>
                                        <option selected hidden>All</option>
                                        {communities && communities?.map((c, i) => (
                                            <option value={c?.id} key={i}>{c.name}</option>
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
                        <h4 className="form--title">Identity & Certificate</h4>

                        <div className="form--grid">
                            <div className="flex-col-gap">
                                <div className="form--item">
                                    <label htmlFor="identity_type" className="form--label colored">ID Type <Asterisk /></label>
                                    <select name="identity_type" id="identity_type" className="form--select" value={formdata.identity_type} onChange={handleUserDataChange}>
                                        <option hidden selected>Id Type</option>
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

                            <div className="flex-col-gap">
                                <div className="form--item">
                                    <label htmlFor="" className="form--label colored">CAC Certificate <Asterisk /></label>
                                    <ImageUpload
                                        title=" "
                                        name="cac_certificate"
                                        preview={cacCertificate.preview}
                                        handleChange={(e) => handleImageChange(e, "cac_certificate")} 
                                        handleRemove={() => handleRemoveImage("cac_certificate")}
                                    />
                                </div>

                                <div className="form--check flex-align-cen" onClick={() => setFormdata({ ...formdata, mark_as_verified: !formdata?.mark_as_verified })} style={{ cursor: "pointer" }}>
                                    <CheckBoxInput isChecked={formdata?.mark_as_verified ?? false} />
                                    <p className="form--info">Mark agent as verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
              
                    <div className="modal--actions" style={{ maxWidth: "55rem" }}>
                        <button className="modal--btn filled" onClick={handleSubmitUser}>Add New {capAllFirstLetters(role)}</button>
                        <button className="modal--btn outline" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </div>
			</section>
		</React.Fragment>
	);
}

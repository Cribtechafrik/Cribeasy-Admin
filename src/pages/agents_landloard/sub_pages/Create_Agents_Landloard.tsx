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
import { useForm, type SubmitHandler } from "react-hook-form";

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
    
    // const [formdata, setFormdata] = useState<FormDataType>({
    //     full_name: "",
    //     email: "",
    //     phone_number: "",
    //     password: "",
    //     company_name: "",
    //     identity_type: "",
    //     lasrera: "",
    //     community_id: "",
    //     mark_as_verified: false,
    // });

    // const handleUserDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    //     const { name, value } = e?.target;
    //     setFormdata({ ...formdata, [name]: value });
    // }

    const { register, handleSubmit, formState, getValues, setValue, watch } = useForm<FormDataType>();
    watch("mark_as_verified")

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

    const handleSubmitUser: SubmitHandler<FormDataType> = async function(formdata) {
        if(!idUpload.file) {
            return toast.error("Identity image is required");
        }
        if(!cacCertificate.file) {
            return toast.error("CAC Certificate is required");
        }

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

                <form className="card form" onSubmit={handleSubmit(handleSubmitUser)}>
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
                                    <input type="text" className="form--input" id="full_name" placeholder="Taiwo Matthew" {...register("full_name", {
                                        required: "Full name is required!"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.full_name && formState.errors.full_name.message}
                                    </span>
                                </div>
                                <div className="form--item">
                                    <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                    <input type="text" className="form--input" id="email" placeholder="example@mail.com" {...register("email", {
                                        required: "Email address is required!",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										    message: 'Email is invalid',
                                        }
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.email && formState.errors.email.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                    <input type="text" className="form--input" id="phone_number" placeholder="+2349044556701" {...register("phone_number", {
                                        required: "Phone number is required!"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.phone_number && formState.errors.phone_number.message}
                                    </span>
                                </div>
                                <div className="form--item">
                                    <label htmlFor="password" className="form--label">Password <Asterisk /></label>
                                    <div className="form--input-box">
                                        <input type={showPassword ? "text" : "password"} className="form--input" id="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" {...register("password", {
                                        required: "Password is required!",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be more than 8 characters"
                                        }
                                    })} />
                                        <div className='form--input-icon' onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <ImEye /> : <ImEyeBlocked />}
                                        </div>
                                    </div>
                                    <div className="sub-text">A secure password will be automatically sent to the agent's email</div>
                                    <span className="form--error-message">
                                        {formState.errors.password && formState.errors.password.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="company_name" className="form--label flex-align-cen">Company Name {role === "agent" ? <Asterisk /> : <span className="form--info">(Optional)</span>}</label>
                                    <input type="text" className="form--input" id="company_name" placeholder="Real estate company LTD " {...register("company_name", {
                                        required: "Company Name is required!"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.company_name && formState.errors.company_name.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                    <select className="form--select" id="community_id" {...register("community_id", {
                                        required: "Community is required!"
                                    })}>
                                        <option selected hidden>Select a community</option>
                                        {communities && communities?.map((c, i) => (
                                            <option value={c?.id} key={i}>{c.name}</option>
                                        ))}
                                    </select>
                                    <span className="form--error-message">
                                        {formState.errors.community_id && formState.errors.community_id.message}
                                    </span>
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
                                    <select id="identity_type" className="form--select" {...register("identity_type", {
                                        required: "Id Type is required!"
                                    })}>
                                        <option hidden selected value="">Id Type</option>
                                        {identityTypes && identityTypes?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.identity_type}</option>
                                        ))}
                                    </select>
                                    <span className="form--error-message">
                                        {formState.errors.identity_type && formState.errors.identity_type.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="lasrera" className="form--label colored">LASRERA Number <Asterisk /></label>
                                    <input type="number" className="form--input" id="lasrera" placeholder="Enter a LASRERA number" {...register("lasrera", {
                                        required: "LASRERA number is required!",
                                        maxLength: 7,
                                        max: 7
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.lasrera && formState.errors.lasrera.message}
                                    </span>
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

                                <div className="form--check flex-align-cen pointer" onClick={() => setValue("mark_as_verified", !getValues("mark_as_verified"))}>
                                    <CheckBoxInput isChecked={getValues("mark_as_verified") ?? false} />
                                    <p className="form--info">Mark agent as verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
              
                    <div className="modal--actions" style={{ maxWidth: "55rem" }}>
                        <button className="modal--btn filled" type="submit">Add New {capAllFirstLetters(role)}</button>
                        <button className="modal--btn outline" type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
			</section>
		</React.Fragment>
	);
}

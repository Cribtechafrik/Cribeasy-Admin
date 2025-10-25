import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Spinner, { SpinnerMini } from "../../../components/elements/Spinner";
import Line from "../../../components/elements/Line";
import ImageUpload from "../../../components/layout/ImageUpload";
import Asterisk from "../../../components/elements/Asterisk";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import type { Community_Type, Identity_type_Type, Service_types_Type } from "../../../utils/types";
import { experience_level } from "../../../utils/data";
import { fetchCommunities, fetchIdentityTypes, fetchServiceTypes } from "../../../utils/fetch";
import { useAuthContext } from "../../../context/AuthContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import MultipleImageUpload from "../../../components/layout/MultipleImageUpload";
import CheckBoxInput from "../../../components/forms/CheckBoxInput";
// import WorkingHour from "../../../components/elements/WorkingHour";


const breadCrumbs = [
    { name: "Artisan", link: "/dashboard/artisans" },
    { name: "Add New Artisan", isCurrent: true },
];

type FormDataType = {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    company_name: string;
    mark_as_verified: false,
    is_active: string;
    has_verified_docs: string;
    experience_level: string;
    community_id: string;
    service_description: string;
    complete_address: string;
    service_type_id: string;
    identity_type_id: string;
    start_time: string;
    end_time: string;
    bio_description: string;
}

export default function CreateArtisans() {
    const navigate = useNavigate();
    const { headers, token, shouldKick } = useAuthContext();

    const [identityTypes, setIdentityTypes] = useState<Identity_type_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);
    const [serviceTypes, setServiceTypes] = useState<Service_types_Type[]>([]);
    const [serviceFocus, setServiceFocus] = useState<Service_types_Type[]>([]);
    
	const [loading, setLoading] = useState({ main: false, focus: false });
    const [showPassword, setShowPassword] = useState(false);
    
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
    const [idUpload, setIdUpload] = useState({ preview: "", file: null });
    const [proofOfWorksGallery, setProofOfWorksGallery] = useState<{
        preview: string;
        file: any | null;
        public_id?: string | null;
    }[]>([]);

    const [special_focus, setSpecial_focus] = useState<number[]>([]);

    const { register, handleSubmit, formState, getValues, watch } = useForm<FormDataType>();
    watch("service_type_id");
    const service_type_id = getValues("service_type_id");

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

    const handleProofOfWorkChange = function(event: { target: { files: any[]; } }, type?: "drop" | "select") {
        const files = Array.from(type == "drop" ? event.target.files[0] || [] : event.target.files || []);

        if(proofOfWorksGallery.length + files.length >= 10) {
            toast.error("Cannot upload more than 10 images!");
            return;
        };

        // Process selected files
        files.forEach((file) => {
            console.log(file)
            const imageUrl = URL.createObjectURL(file as File);
            setProofOfWorksGallery((prev) => [...prev, { preview: imageUrl, file }]);
        });
    };

    // GALLERY IMAGES REMOVAL FUNCTION
    const handleRemoveProofOfWork = function(index: number) {
        setProofOfWorksGallery(prev => prev.filter((_, i) => i !== index));
    }

    useEffect(function() {
        const fetchData = async function() {
            const [identityTypeData, serviceTypes, communities] = await Promise.all([
                fetchIdentityTypes(headers),
                fetchServiceTypes(headers),
                fetchCommunities(headers),
            ]);
            if (identityTypeData?.success) setIdentityTypes(identityTypeData.data[0]);
            if (serviceTypes?.success) setServiceTypes(serviceTypes.data);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        fetchData();
    }, []);

    useEffect(function() {
        if(service_type_id) {
            setServiceFocus([]);
        }

        const fetchData = async function() {
            setLoading({ ...loading, focus: true });

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/service-types/${service_type_id}/focus`, {
                method: "GET",
                headers,
            });

            const data = await res.json();
            setLoading({ ...loading, focus: false });
            if(data?.success) {
                setServiceFocus(data?.data);
            }
        }

        if(service_type_id) {
            fetchData();
        }
    }, [service_type_id]);

    const handleSubmitArtisans: SubmitHandler<FormDataType> = async function(formdata) {
        if(!profileImage.file) {
            return toast.error("Profile image is required");
        }
        if(proofOfWorksGallery.length < 1) {
            return toast.error("At least 1 proof of work is required");
        }
        if(!idUpload.file) {
            return toast.error("Identity image is required");
        }

        setLoading({ ...loading, main: true });

        try {
            const formData = new FormData();
            formData.append('first_name', formdata.full_name?.split(" ")[0]);
            formData.append('last_name', formdata.full_name?.split(" ")[1]);
            formData.append('phone_number', formdata.phone_number);
            formData.append('password', formdata.password);
            formData.append('email', formdata.email?.toLowerCase());
            formData.append('company_name', formdata.company_name);
            formData.append('identity_type_id', formdata.identity_type_id);
            formData.append('community_id', formdata?.community_id);

            if(profileImage?.file) {
                formData.append('property_cover', profileImage?.file);
            }
            if(idUpload?.file) {
                formData.append('property_cover', idUpload?.file);
            }
            if(proofOfWorksGallery?.length > 0 && proofOfWorksGallery?.every(img => img.file)) {
                proofOfWorksGallery.forEach((data, index) => {
                    formData.append(`media[${index}]`, data.file);
                });
            }

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans-create`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 201 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            toast.success("Artisans created successfully")

        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }

	return (
		<React.Fragment>
			{loading.main && <Spinner />}

			<section className="">
				<div className="page--top">
					<div className="page--heading">
						<h4 className="title">New Artisans</h4>
						<Breadcrumbs breadcrumArr={breadCrumbs} />
					</div>
				</div>

                <form className="card form" onSubmit={handleSubmit(handleSubmitArtisans)}>
                    <h4 className="form--title">User Information</h4>

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
                                    <div className="sub-text" style={{ textAlign: "left" }}>A secure password will be automatically sent to the agent's email</div>
                                    <span className="form--error-message">
                                        {formState.errors.password && formState.errors.password.message}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form--item">
                            <label className="form--label flex-align-cen">Profile Image <span className="form--info">(Optional)</span></label>
                            <ImageUpload
                                name="profile_image"
                                preview={profileImage.preview ?? ""}
                                handleChange={(e) => handleImageChange(e, "profile_image")} 
                                handleRemove={() => handleRemoveImage("profile_image")}
                            />
                        </div>
                    </div>

                    <Line />

                    <div className="flex-col-2">
                        <h4 className="form--title">Company Details</h4>

                        <div className="form--grid gap-2">
                            <div className="form--item">
                                <label htmlFor="company_name" className="form--label">Company Name <Asterisk /></label>
                                <input type="text" className="form--input" id="company_name" placeholder="BuildSig Ng" {...register("company_name", {
                                    required: "Company name is required!"
                                })} />
                                <span className="form--error-message">
                                    {formState.errors.company_name && formState.errors.company_name.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="service_type_id" className="form--label">Service Type <Asterisk /></label>
                                <select className="form--select" id="service_type_id" {...register("service_type_id", {
                                    required: "Service type is required!"
                                })}>
                                    <option selected hidden value="">Select service type</option>
                                    {serviceTypes && serviceTypes?.map((type, i) => (
                                        <option value={type?.id} key={i}>{type.name}</option>
                                    ))}
                                </select>
                                <span className="form--error-message">
                                    {formState.errors.service_type_id && formState.errors.service_type_id.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="experience_level" className="form--label">Years of Experience <Asterisk /></label>
                                <select className="form--select" id="experience_level" {...register("experience_level", {
                                    required: "Experience level is required!"
                                })}>
                                    <option selected hidden value="">Select Experience Level</option>
                                    {experience_level?.map((level, i) => (
                                        <option value={level?.value} key={i}>{level.name}</option>
                                    ))}
                                </select>
                                <span className="form--error-message">
                                    {formState.errors.experience_level && formState.errors.experience_level.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                <select className="form--select" id="community_id" {...register("community_id", {
                                    required: "Community is required!"
                                })}>
                                    <option selected hidden value="">Select Community</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
                                </select>
                                <span className="form--error-message">
                                    {formState.errors.community_id && formState.errors.community_id.message}
                                </span>
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="specific_focus" className="form--label">Specific Focus <Asterisk /></label>

                            {loading.focus ? (
                                <SpinnerMini />
                            ) : (
                                !service_type_id ? (
                                    <div className="no-data">No "Service Type" selected yet!</div>
                                ) : (
                                    serviceFocus?.length > 0 ?
                                    <div className="form--grid tem-col-4">
                                        {serviceFocus?.map((focus, i) => (
                                            <div className="form--check flex-align-cen gap-1 pointer" key={i} onClick={() => {
                                                const exists = special_focus.includes(focus.id);
                                                if (exists) {
                                                    setSpecial_focus(prev => prev.filter(id => id !== focus.id));
                                                } else {
                                                    setSpecial_focus(prev => [...prev, focus.id]);
                                                }
                                            }}>
                                                <CheckBoxInput isChecked={special_focus.includes(focus.id)} />
                                                <p className="form--info colored">{focus.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    : (
                                        <p className="no-data">No Specific focus found!</p>
                                    )
                                )
                            )}
                        </div>


                        <div className="form--item" style={{ maxWidth: "50rem" }}>
                            <label htmlFor="service_description" className="form--label">Service Description <Asterisk /></label>
                            <textarea id="service_description" className="form--input" placeholder="Service Description" {...register("service_description")} />
                        </div>
                    </div>

                    <Line />

                    <div className="form--section">
                        <div className="flex-col-2">
                            <h4 className="form--title">Location & Availability</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="service_area" className="form--label">Service Area </label>
                                    <select className="form--select" id="service_area">
                                        <option selected hidden value="">Select service area</option>
                                        {communities && communities?.map((area, i) => (
                                            <option value={area?.id} key={i}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="complete_address" className="form--label">Complete Address <Asterisk /></label>
                                    <input type="text" className="form--input" id="complete_address" placeholder="Enter full address" {...register("complete_address")} />
                                    <span className="form--error-message">
                                        {formState.errors.complete_address && formState.errors.complete_address.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--item">
                                <label className="form--label">Working Hours</label>
                                
                                <div className="flex-align-justify-spabtw" style={{ width: "100%" }}>
                                    {/* <WorkingHour day="Mon" />
                                    <WorkingHour day="Tues" />
                                    <WorkingHour day="Wed" />
                                    <WorkingHour day="Thur" />
                                    <WorkingHour day="Fri" />
                                    <WorkingHour day="Sat" />
                                    <WorkingHour day="Sun" /> */}
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="start_time" className="form--label">Start Time</label>
                                    <input type="time" className="form--input" id="start_time" {...register("start_time")} />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="end_time" className="form--label">End Time</label>
                                    <input type="time" className="form--input" id="end_time" {...register("end_time")} />
                                </div>
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="" className="form--label">Proof Of Work <Asterisk /></label>
                            <MultipleImageUpload handleChange={handleProofOfWorkChange} title=" " name="prrof_of_work" preview={proofOfWorksGallery?.length > 0 ? proofOfWorksGallery?.map(img => img.preview) : ""} handleRemove={(i) => handleRemoveProofOfWork(i as number)} />
                        </div>
                    </div>

                    <Line />

                    <div className="flex-col-2">
                        <h4 className="form--title">Identity</h4>

                        <div className="form--section">
                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="identity_type_id" className="form--label">ID Type <Asterisk /></label>
                                    <select id="identity_type_id" className="form--select" {...register("identity_type_id", {
                                        required: "Id Type is required!"
                                    })}>
                                        <option hidden selected value="">Id Type</option>
                                        {identityTypes && identityTypes?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.identity_type}</option>
                                        ))}
                                    </select>
                                    <span className="form--error-message">
                                        {formState.errors.identity_type_id && formState.errors.identity_type_id.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="" className="form--label">Upload ID Document <Asterisk /></label>
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

                    <Line />

                    <div className="flex-col-1">
                        <h4 className="form--title">Additional Information</h4>

                        <div className="form--item">
                            <label htmlFor="bio_description" className="form--label">Bio / Description</label>
                            <textarea id="bio_description" className="form--input" placeholder="Enter Description" {...register("bio_description")} />
                            <div className="sub-text" style={{ textAlign: "left" }}>This will be displayed on the artisan's public profile</div>
                        </div>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "40rem" }}>
                        <button className="modal--btn filled" type="submit">Add New Artisans</button>
                        <button className="modal--btn outline" type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
			</section>
		</React.Fragment>
	);
}

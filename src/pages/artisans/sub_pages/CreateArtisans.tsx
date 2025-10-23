import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Spinner from "../../../components/elements/Spinner";
import Line from "../../../components/elements/Line";
import ImageUpload from "../../../components/layout/ImageUpload";
import Asterisk from "../../../components/elements/Asterisk";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import type { Community_Type, Service_types_Type } from "../../../utils/types";
import { experience_level } from "../../../utils/data";
import { fetchCommunities, fetchServiceTypes } from "../../../utils/fetch";
import { useAuthContext } from "../../../context/AuthContext";


const breadCrumbs = [
    { name: "Artisan", link: "/dashboard/artisans" },
    { name: "Add New Artisan", isCurrent: true },
];

export default function CreateArtisans() {
    const { headers } = useAuthContext();

    const [communities, setCommunities] = useState<Community_Type[]>([]);
    const [serviceTypes, setServiceTypes] = useState<Service_types_Type[]>([]);
    
    // @ts-ignore
	const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
    // @ts-ignore
    const [idUpload, setIdUpload] = useState({ preview: "", file: null });

    const [formdata, setFormdata] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        company_name: "",
        identity_type: "",
        lasrera: "",
        mark_as_verified: false,
        is_active: "",
        has_verified_docs: "",
        service_type: "",
        experience_level: "",
        community_id: "",
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

    const handleArtisansDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFormdata({ ...formdata, [name]: value });
    }

    useEffect(function() {
        const fetchData = async () => {
            const [serviceTypes, communities] = await Promise.all([
                fetchServiceTypes(headers),
                fetchCommunities(headers),
            ]);
            if (serviceTypes?.success) setServiceTypes(serviceTypes.data);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        fetchData();
    }, []);

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
                    <h4 className="form--title">User Information</h4>

                    <div className="form--section">
                        <div className="flex-col-gap">
                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="full_name" className="form--label">Full Name <Asterisk /></label>
                                    <input type="text" className="form--input" name="full_name" id="full_name" placeholder="Taiwo Matthew" value={formdata.full_name} onChange={handleArtisansDataChange} />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                    <input type="text" className="form--input" name="email" id="email" placeholder="example@mail.com" value={formdata.email} onChange={handleArtisansDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="phone_number" className="form--label">Phone Number <Asterisk /></label>
                                    <input type="text" className="form--input" name="phone_number" id="phone_number" placeholder="+2349044556701" value={formdata.phone_number} onChange={handleArtisansDataChange} />
                                </div>
                                <div className="form--item">
                                    <label htmlFor="password" className="form--label">Password <Asterisk /></label>
                                    <div className="form--input-box">
                                        <input type={showPassword ? "text" : "password"} className="form--input" name="password" id="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={formdata.password} onChange={handleArtisansDataChange} />
                                        <div className='form--input-icon' onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <ImEye /> : <ImEyeBlocked />}
                                        </div>
                                    </div>
                                    <div className="sub-text">A secure password will be automatically sent to the agent's email</div>
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
                                <input type="text" className="form--input" name="company_name" id="company_name" placeholder="BuildSig Ng" value={formdata.company_name} onChange={handleArtisansDataChange} />
                            </div>

                            <div className="form--item">
                                <label htmlFor="service_type" className="form--label">Service Type <Asterisk /></label>
                                <select className="form--select" name="service_type" id="service_type" value={formdata?.service_type} onChange={handleArtisansDataChange}>
                                    <option selected hidden>Select service type</option>
                                    {serviceTypes && serviceTypes?.map((type, i) => (
                                        <option value={type?.id} key={i}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="experience_level" className="form--label">Years of Experience <Asterisk /></label>
                                <select className="form--select" name="experience_level" id="experience_level" value={formdata?.experience_level} onChange={handleArtisansDataChange}>
                                    <option selected hidden>Select Experience Level</option>
                                    {experience_level?.map((level, i) => (
                                        <option value={level?.value} key={i}>{level.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label">Community <Asterisk /></label>
                                <select className="form--select" name="community_id" id="community_id" value={formdata?.community_id} onChange={handleArtisansDataChange}>
                                    <option selected hidden>Select Community</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        <div className="form--item">
                            <label htmlFor="specifics" className="form--label">Specific Focus <Asterisk /></label>

                        </div>
                    </div>
                </div>
			</section>
		</React.Fragment>
	);
}

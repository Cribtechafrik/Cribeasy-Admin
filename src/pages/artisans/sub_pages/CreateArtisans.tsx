import React, { useState } from "react";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import { useParams } from "react-router-dom";
import Spinner from "../../../components/elements/Spinner";
import Line from "../../../components/elements/Line";
import ImageUpload from "../../../components/layout/ImageUpload";
import Asterisk from "../../../components/elements/Asterisk";
import { ImEye, ImEyeBlocked } from "react-icons/im";

export default function CreateArtisans() {
	const { id } = useParams();
	// const navigate = useNavigate();
	const [loading, _] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [profileImage, setProfileImage] = useState({ preview: "", file: null });
    const [__, setIdUpload] = useState({ preview: "", file: null });

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
    });

	const breadCrumbs = [
		{ name: "Artisan", link: "/dashboard/artisans" },
		{ name: `${id ? "Edit" : "Add New"} Artisan`, isCurrent: true },
	];


    const handleImageChange = function(event: { target: { files: any[]; } }, name: string) {
        const file = event.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            console.log(imageUrl, file)
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

	return (
		<React.Fragment>
			{loading && <Spinner />}

			<section className="">
				<div className="page--top">
					<div className="page--heading">
						<h4 className="title">{id ? "Edit" : "New"} Artisans</h4>
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
                </div>
			</section>
		</React.Fragment>
	);
}

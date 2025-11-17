import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Spinner from "../../../components/elements/Spinner";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import { toast } from "sonner";
import Asterisk from "../../../components/elements/Asterisk";
import ImageUpload from "../../../components/layout/ImageUpload";
import Line from "../../../components/elements/Line";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { useAuthContext } from "../../../context/AuthContext";

const breadCrumbs = [
    { name: "Community", link: "/dashboard/community" },
    { name: "Add New Community", isCurrent: true },
];

type FormDataType = {
    name: string;
    description: string;
}

export default function CreateCommunity() {
    const navigate = useNavigate();
    const { token, shouldKick } = useAuthContext();

    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState({ preview: "", file: null });
    const [landmarks, setLandmarks] = useState<string[]>([]);
    const [landmarkInput, setLandmarkInput] = useState("");

    const { register, handleSubmit, formState } = useForm<FormDataType>();


    // COVERIMAGE ADD / CHANGE IMAGE
    const handleCoverImageChange = function(event: { target: { files: any[]; } }) {
        const file = event.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCoverImage({ preview: imageUrl, file });
        }
    }

    // COVERIMAGE REMOVAL FUNCTION
    const handleRemoveCoverImage = function() {
        setCoverImage({ preview: "", file: null });
    }

    const handleAddLandmark = function() {
        if(!landmarkInput) return toast.error("Enter a landmark name");
        if(landmarks.includes(landmarkInput)) return toast.error("Landmark already exists");
        setLandmarks(prev => [...prev, landmarkInput]);
        setLandmarkInput("");
    }

    const handleRemoveLandmark = function(name: string) {
        if(landmarks.length < 1) return toast.error("No landmark to remove");
        setLandmarks(prev => prev.filter((el) => el !== name));
    }

    const handleSubmitListing:SubmitHandler<FormDataType> = async function(formdata) {
        if(landmarks.length < 1) return toast.error("At least one landmark is required");
        if(!coverImage.file || !coverImage.preview) {
            return toast.error("Community cover image is required");
        }
        
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', formdata.name);
            formData.append('description', formdata.description);

            if(coverImage?.file) {
                formData.append('cover_image', coverImage?.file);
            }
            if(landmarks?.length > 0) {
                landmarks.forEach((landmark, index) => {
                    formData.append(`landmarks[${index}]`, landmark);
                });
            }

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            toast.success("Community Created Successfully!");
            navigate("/dashboard/community");

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
                        <h4 className="title">Add New Community</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>
                </div>

                <form className="card form" onSubmit={handleSubmit(handleSubmitListing)}>
                    <h4 className="form--title">Community Information</h4>
                    
                    <div className="form--section">
                        <div className="flex-col-gap">

                            <div className="form--item">
                                <label htmlFor="name" className="form--label">Community Title <Asterisk /></label>
                                <input type="text" className="form--input" id="name" placeholder="Enter a title" {...register("name", {
                                    required: 'Community Title is required',
                                })} />
                                <span className="form--error-message">
                                    {formState.errors.name && formState.errors.name.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="" className="form--label">Description <Asterisk /></label>
                                <textarea className="form--input" placeholder="Enter description" {...register("description", { required: "Description is required!" })}></textarea>
                                <span className="form--error-message">
                                    {formState.errors.description && formState.errors.description.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="" className="form--label">Landmarks <Asterisk /></label>
                                <div className="landmark--input">
                                    <input type="text" className="form--input" placeholder="Add landmark" value={landmarkInput} onChange={(e) => setLandmarkInput(e.target.value)} />
                                    <button className="modal--btn filled" type="button" onClick={handleAddLandmark}>Add New</button>
                                </div>
                                {landmarks?.length > 0 && (
                                    <div className="community--landmark-flex">
                                        {landmarks?.map((landmark, i) => (
                                            <span className="community--landmark-item" key={i}>
                                                {landmark}
                                                <span onClick={() => handleRemoveLandmark(landmark)}>
                                                    <AiOutlineClose  />
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="" className="form--label">Cover Image <Asterisk /></label>
                            <ImageUpload handleChange={handleCoverImageChange} name="cover-image" preview={coverImage.preview} handleRemove={handleRemoveCoverImage} />
                        </div>
                    </div>

                    <Line />

                    <div className="form--actions" style={{ maxWidth: "40rem" }}>
                        <button className="form--submit filled" type="submit">Add New Community</button>
                        <button className="form--submit outline" type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </section>
        </React.Fragment>
    )
}

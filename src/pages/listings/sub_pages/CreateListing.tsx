import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Line from "../../../components/elements/Line";
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from "sonner";
import DropdownSelectWithTabs from "../../../components/forms/DropdownSelectWithTabs";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import BasicModal from "../../../components/modals/Basic";
import Asterisk from "../../../components/elements/Asterisk";
import ScheduleTable from "../../../components/forms/ScheduleTable";
import ImageUpload from "../../../components/layout/ImageUpload";
import MultipleImageUpload from "../../../components/layout/MultipleImageUpload";
import { useNavigate, useParams } from "react-router-dom";
import moment from 'moment';
import { customAlphabet } from 'nanoid';
import { fetchPropertyCategories, fetchPropertyTypes } from "../../../utils/fetch";
import { useAuthContext } from "../../../context/AuthContext";
import type { ListingType, Property_category_Type, Property_types_Type } from "../../../utils/types";
import Spinner from "../../../components/elements/Spinner";
import { formatInputNumber, getCurrentTime } from "../../../utils/helper";
import { useForm, type SubmitHandler } from "react-hook-form";


const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

const today = moment().startOf('day');
const minDate = today.format('YYYY-MM-DD');
const maxDate = today.add(7, 'days').format('YYYY-MM-DD');

type InspectionScheduleType = {
    date: string;
    day: string;
    timeSlots: { start: string; end: string; slotId?: string | null; }[];
}

type AmenitiesType = {
    amenity: string;
    amenity_icon: string;
}

type FormDataType = {
    property_title: string;
    description: string;
    rent_price: string;
    property_size: string;
    property_address: string;
    property_type_id: string;
    property_category_id: string;
    service_charge: string;
    agent: string;
    bedrooms: string;
    bathrooms: string;
}

export default function CreateListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { headers, token, shouldKick } = useAuthContext();

    const [propertyTypesData, setPropertyTypesData] = useState<Property_types_Type[] | []>([]);
    const [propertyCategoryData, setPropertyCategoryData] = useState<Property_category_Type[]>([]);

    const [loading, setLoading] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [coverImage, setCoverImage] = useState({ preview: "", file: null });
    const [galleryImages, setGalleryImages] = useState<{
        preview: string;
        file: any | null;
        public_id?: string | null;
    }[]>([]);

    const { register, handleSubmit, formState, getValues, setValue, watch } = useForm<FormDataType>();
    watch("description");

    // const [formData, setFormData] = useState<FormDataType>({
    //     property_title: "",
    //     description: "",
    //     rent_price: "",
    //     property_size: "",
    //     property_address: "",
    //     property_type_id: "",
    //     property_category_id: "",
    //     service_charge: "",
    //     agent: "",
    //     bedrooms: "",
    //     bathrooms: "",
    // });

    const [selectedAmenities, setSelectedAmenities] = useState<AmenitiesType[]>([]);
    const [inspectionSchedules, setInspectionSchedules] = useState<InspectionScheduleType[]>([])

    const [schedule, setSchedule] = useState<InspectionScheduleType>({
        date: "",
        day: "",
        timeSlots: [
            { start: "", end: "", slotId: null, },
        ]
    });

    // ONLY USED IN EDIT
    const [removedImages, setRemovedImages] = useState<string[]>([])


    const breadCrumbs = [
        { name: "Listing", link: "/dashboard/listings" },
        { name: `${id ? "Edit" : "Add New"} Listing`, isCurrent: true },
    ];


    const handleShowScheduleModal = function() {
        if(!getValues("property_title")) {
            toast.error("Property name is required!");
            return;
        }

        setShowScheduleModal(true)
    }

    const handleDescriptionLength = (text: string) => {
        if (text.length <= 500) {
            setValue("description", text);
        } else {
            setValue("description", text?.slice(0, 500));
            toast.error("500 limit excided!");
        }
    }

    // const handleListingDataChange = function (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    //     const { name, value } = e?.target;
    //     setFormData({ ...formData, [name]: value });
    // };

    // GALLERY IMAGES ADD / CHANGE IMAGE
    const handleGalleryImagesChange = function(event: { target: { files: any[]; } }, type?: "drop" | "select") {
        const files = Array.from(type == "drop" ? event.target.files[0] || [] : event.target.files || []);

        if(galleryImages.length + files.length >= 10) {
            toast.error("Cannot upload more than 10 images!");
            return;
        };

        // Process selected files
        files.forEach((file) => {
            console.log(file)
            const imageUrl = URL.createObjectURL(file as File);
            setGalleryImages((prev) => [...prev, { preview: imageUrl, file }]);
        });
    };

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

    // GALLERY IMAGES REMOVAL FUNCTION
    const handleRemoveGalleryImages = function(index: number) {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        
        const removedImage = galleryImages[index];
        if(id) {
            setRemovedImages(prev => [...prev, `${removedImage?.public_id}`])
        }
    }

    const handleAddSlot = function() {
        setSchedule({
            ...schedule,
            timeSlots: [...schedule.timeSlots, { start: "", end: "" }]
        });
    };

    const handleTimeChange = function(index: number, field: "start" | "end", value: string) {
        const newSlots = [...schedule.timeSlots];
        // if (newSlots[index]) {
        //     newSlots[index][field] = value;
        // }

        if (newSlots[index]) {
            const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            if (field === 'start') {
                if (value < currentTime && index === 0) {
                    toast.error("Start time cannot be earlier than the current time");
                    return;
                }
                if (index > 0 && value <= newSlots[index - 1].end) {
                    toast.error("Start time cannot be earlier than or equal to the previous end time");
                    return;
                }
                if (newSlots[index].end && value >= newSlots[index].end) {
                    toast.error("Start time cannot be later than or equal to the end time");
                    return;
                }
            } else if (field === 'end') {
                if (!newSlots[index].start) {
                    toast.error("Select a Start time first!");
                    return;
                }
                if (value <= newSlots[index].start) {
                    toast.error("End time cannot be earlier than or equal to the start time");
                    return;
                }
                if (index < newSlots.length - 1 && value >= newSlots[index + 1].start) {
                    toast.error("End time cannot be later than or equal to the next start time");
                    return;
                }
            }
            newSlots[index][field] = value;
        }

        setSchedule({ ...schedule, timeSlots: newSlots });
    };

    const handleResetSchedule = function() {
        setSchedule({
            date: "",
            day: "",
            timeSlots: [
                { start: "", end: "", slotId: null }
            ]
        });
        
        setShowScheduleModal(false);
    }

    const handleSaveSchedule = function() {
        if (!schedule.date || !schedule.day || schedule.timeSlots.some(slot => !slot.start || !slot.end)) {
            toast.error('Please fill in all fields');
            return;
        }

        // Here you would add logic to save the schedule
        const existingScheduleIndex = inspectionSchedules.findIndex(s => s.date === schedule.date);
        if (existingScheduleIndex !== -1) {
            const updatedSchedules = [...inspectionSchedules];
            updatedSchedules[existingScheduleIndex].timeSlots = [...updatedSchedules[existingScheduleIndex].timeSlots, ...schedule.timeSlots];
            setInspectionSchedules(updatedSchedules);
        } else {
            setInspectionSchedules(prev => [...prev, { ...schedule }]);
        }


        if(id) {
        //    const updatedSchedules = [...inspectionSchedules, schedule];
        //    console.log(schedule.timeSlots, updatedSchedules);

            (async function(){
                setLoading(true);
                try {
                    const formData = new FormData();

                    // const slots: any = [];
                    schedule.timeSlots.forEach((slot, slotIndex) => {
                        const starts_at = `${schedule.date} ${slot.start}:00`;
                        const ends_at = `${schedule.date} ${slot.end}:00`;
                        formData.append(`slots[${slotIndex}][starts_at]`, starts_at);
                        formData.append(`slots[${slotIndex}][ends_at]`, ends_at);
                        // slots.push({ starts_at, ends_at })
                    });
                    // formData.append("slots[]", slots);

                    const formDataHeaders = {
                        "Accept": "application/json",
                        Authorization: `Bearer ${token}`
                    }
    
                    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}/slots`, {
                        method: "POST",
                        headers: formDataHeaders,
                        body: formData
                    });
                    shouldKick(res);

                    const data = await res.json();
                    if(data?.status) {
                        const schedulesWithId = inspectionSchedules.map(schedule => ({
                            ...schedule,
                            timeSlots: schedule.timeSlots.map((slot, index) => ({
                                ...slot,
                                slotId: data?.data?.[index]?.id
                            }))
                        }));
                        setInspectionSchedules(schedulesWithId);
                        toast.success("Saved Schedule!");
                    } else {
                        throw new Error(data?.error?.message)
                    }
                } catch(err: any) {
                    const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
                    toast.error(message);
                } finally {
                    setLoading(false);
                }
            })();
        }

        handleResetSchedule();
    };

    const handleScheduleDateChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        const dateValue = e.target.value;
        const dateObj = new Date(dateValue);
        const dayNames = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        const dayName = dayNames[dateObj.getDay()];
        
        setSchedule({ ...schedule, date: dateValue, day: dayName });
    };

    const handleRemoveSchedule = function(index: number, slotId?: string | null) {
        if(!id) {
            const newSchedules = inspectionSchedules?.filter((_, i) => i !== index);
            setInspectionSchedules(newSchedules);
        } else if(id && inspectionSchedules?.length > 0) {
            (async function(){
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/slots/${slotId}`, {
                    method: "DELETE",
                    headers,
                });

                const data = await res.json()
                if(data?.success) {
                    const newSchedules = inspectionSchedules.map(schedule => ({
                        ...schedule,
                        timeSlots: schedule.timeSlots.filter(slot => slot.slotId !== slotId),
                    }));
                    setInspectionSchedules(newSchedules);
                    toast.success("Slot Deleted!")
                }
                setLoading(false);
            })();
        }
    };


    useEffect(function() {
        const fetchData = async function() {
            const [propertyType, categoryData] = await Promise.all([
                fetchPropertyTypes(headers),
                fetchPropertyCategories(headers),
            ]);

            if(propertyType?.success) setPropertyTypesData(propertyType?.data[0])
            if(categoryData?.success) setPropertyCategoryData(categoryData?.data[0])
        }

        fetchData();
    }, []);


    useEffect(function() {
        async function handleFetch() {
            setLoading(true);

            const [listingRes, slotsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}?full=true`, {
                    method: "GET",
                    headers,
                }),
                fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}/slots`, {
                    method: "GET",
                    headers,
                }),
            ]);

            const data = await listingRes.json();
            
            if(id && data?.success) {
                const listing: ListingType = data?.data;

                setValue("property_title", listing?.property_title || "");
                setValue("description", listing?.description || "");
                setValue("rent_price", listing?.property_detail?.rent_price || "");
                setValue("property_size", listing?.property_detail?.property_size || "");
                setValue("property_address", listing?.property_detail?.property_address || "");
                setValue("property_type_id", `${listing?.property_detail?.property_type_id}` || "");
                setValue("service_charge", listing?.property_detail?.service_charge || "");
                setValue("bedrooms", `${listing?.property_detail?.bedrooms}` || "");
                setValue("bathrooms", `${listing?.property_detail?.bathrooms}` || "");
                setValue("property_category_id", `${listing?.property_category_id}` || "");
                setValue("agent", listing?.user_name || "");

                setSelectedAmenities(listing?.property_detail?.amenities);
                setCoverImage({ ...coverImage, preview: listing?.property_cover })

                const gallery_images = []
                for(const img of listing?.gallery?.images_url) {
                    gallery_images?.push({ 
                        preview: img?.cloudinary_url,
                        public_id: img?.cloudinary_id,
                        file: null
                    })
                }
                setGalleryImages(gallery_images)

                const slotsData = await slotsRes.json();
                const slots: any = Object.entries(slotsData?.data);

                for(const slot of slots) {
                    const dateObj = new Date(slot?.[0]);
                    const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
                    const dayName = dayNames[dateObj.getDay()];
                    console.log("293", slot)

                    setInspectionSchedules(prev => [
                        ...prev,
                        {
                            date: slot?.[0],
                            day: dayName,
                            timeSlots: slot?.[1]?.map((timeSlots: { starts_at: string; ends_at: string; id: string }) => {
                                return {
                                    start: timeSlots?.starts_at?.split("T")?.[1],
                                    end: timeSlots?.ends_at?.split("T")?.[1],
                                    slotId: timeSlots?.id,
                                }
                            }),
                        }
                    ]);
                }
            }
            setLoading(false);
        };

        if(id) {
            handleFetch();
        }
    }, [id]);

    
    const handleSubmitListing:SubmitHandler<FormDataType> = async function(formdata) {
        if(!coverImage.file || !coverImage.preview) {
            return toast.error("Property cover image is required");
        }
        if(galleryImages.length < 1) {
            return toast.error("At least 1 Gallery image is required");
        }
        
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('property_ref_id', `#${generateId()}`);
            formData.append('property_title', formdata.property_title);
            formData.append('bedrooms', formdata.bedrooms);
            // @ts-ignore
            formData.append('rent_price', +formdata?.rent_price?.replaceAll(",", ""));
            formData.append('property_size', formdata.property_size);
            formData.append('property_address', formdata.property_address);
            formData.append('property_type_id', formdata.property_type_id);
            // @ts-ignore
            formData.append('service_charge', +formdata?.service_charge?.replaceAll(",", ""));
            formData.append('agent', formdata.agent);
            formData.append('bedrooms', formdata.bedrooms);
            formData.append('bathrooms', formdata.bathrooms);
            formData.append('description', formdata.description);
            formData.append('property_category_id', formdata.property_category_id);

            // temps
            formData.append('user_id', "1");

            if(selectedAmenities?.length > 0) {
                selectedAmenities.forEach((data, index) => {
                    formData.append(`amenities[${index}][amenity]`, data.amenity);
                    formData.append(`amenities[${index}][amenity_icon]`, data.amenity_icon);
                });
            }

            if(coverImage?.file) {
                formData.append('property_cover', coverImage?.file);
            }
            if(galleryImages?.length > 0 && galleryImages?.every(img => img.file)) {
                galleryImages.forEach((data, index) => {
                    formData.append(`media[${index}]`, data.file);
                });
            }

            // ONLY ON EDIT
            if(id && removedImages?.length > 0) {
                removedImages.forEach((public_id, index) => {
                    formData.append(`removed_media[${index}][resource_type]`, "image");
                    formData.append(`removed_media[${index}][cloudinary_id]`, public_id);
                });
            }

            // NOT ON EDIT
            if(!id && inspectionSchedules?.length > 0) {
                const slots: any = [];
                inspectionSchedules?.forEach((data, inspIndex) => {
                    data.timeSlots.forEach((slot, slotIndex) => {
                        const starts_at = `${data.date} ${slot.start}:00`;
                        const ends_at = `${data.date} ${slot.end}:00`;

                        formData.append(`inspection_slots[${inspIndex * data.timeSlots.length + slotIndex}][starts_at]`, starts_at);
                        formData.append(`inspection_slots[${inspIndex * data.timeSlots.length + slotIndex}][ends_at]`, ends_at);

                        slots.push({ starts_at, ends_at })
                    });
                });
            }

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id ? id : ""}`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== (id ? 200 : 201) || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            toast.success(`Property ${id ? "Updated" : "Created"} Successfully!`);
            navigate("/dashboard/listings")

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

            {showScheduleModal && (
                <BasicModal title="Create Inspection Schedule" setClose={() => setShowScheduleModal(false)}>
                    <div className="modal--content">

                        <div className="form--item">
                            <label className="form--label">Property</label>
                            <input
                                type="text"
                                className="form--input"
                                // value={formData.property_title}
                                value={getValues("property_title")}
                                readOnly
                            />
                        </div>

                        <div className="form--item">
                            <label className="form--label">
                                Select Date <Asterisk />
                            </label>
                            <input
                                type="date"
                                className="form--input"
                                placeholder="dd/mm/yyyy"
                                value={schedule?.date}
                                min={minDate}
                                max={maxDate}
                                onChange={handleScheduleDateChange}
                            />
                        </div>

                        <div className="form--item">
                            <label className="form--label">
                                Add Time Slot <Asterisk />
                            </label>
                            {schedule.timeSlots.map((slot, index) => (
                                <div key={index} className="form--flex">
                                    <input
                                        type="time"
                                        className="form--input"
                                        value={slot.start}
                                        min={index === 0 ? getCurrentTime() : ''}
                                        // max={index === slots.length - 1 ? '23:59' : slots[index + 1]?.start}
                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className="form--input"
                                        value={slot.end}
                                        min={slot.start}
                                        onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                            
                        <button className="page--add-btn" onClick={handleAddSlot}>
                            <AiOutlinePlus />
                            Add Another Slot
                        </button>
                    </div>

                    <div className="modal--actions">
                        <button className="modal--btn outline" onClick={handleResetSchedule}>
                            Cancel
                        </button>
                        <button className="modal--btn filled" onClick={handleSaveSchedule}>
                            Save Slot
                        </button>
                    </div>
                </BasicModal>
            )}
            
            <section className="">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">{id ? "Edit" : "New"} Listings</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>
                </div>

                <form className="card form" onSubmit={handleSubmit(handleSubmitListing)}>
                    <h4 className="form--title">Property Description</h4>
                    
                    <div className="form--section">
                        <div className="flex-col-gap">

                            <div className="form--item">
                                <label htmlFor="property_title" className="form--label">Property Title <Asterisk /></label>
                                <input type="text" className="form--input" id="property_title" placeholder="Enter a title" {...register("property_title", {
                                    required: 'Property Title is required',
                                })} />
                                <span className="form--error-message">
                                    {formState.errors.property_title && formState.errors.property_title.message}
                                </span>
                            </div>

                            <div className="form--item">
                                <label htmlFor="" className="form--label">Property Description <Asterisk /></label>
                                <TextareaAutosize className="form--input" minRows={4} placeholder="Enter description" {...register("description", { required: "Description is required!", onChange: (e) => handleDescriptionLength(e.target.value) })} />
                                <div className="flex-align-justify-spabtw" style={{ width: "100%" }}>
                                    <span className="form--error-message">
                                        {formState.errors.description && formState.errors.description.message}
                                    </span>
                                    <span className="form--info" style={{ color: "#B4B4B4", alignSelf: "flex-end", minWidth: "max-content" }}>{getValues("description")?.length ?? 0} / 500 characters</span>
                                </div>
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="" className="form--label">Cover Image <Asterisk /></label>
                            <ImageUpload handleChange={handleCoverImageChange} name="cover-image" preview={coverImage.preview} handleRemove={handleRemoveCoverImage} />
                        </div>
                    </div>

                    <Line />

                    <div className="form--section">
                        <div className="flex-col-gap">
                            <h4 className="form--title">Property Details</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="property_type_id" className="form--label">Property Type <Asterisk /></label>
                                    <select id="property_type_id" className="form--select" defaultValue="" {...register("property_type_id", {
                                        required: "Property type is required!",
                                    })}>
                                        <option hidden selected value="">Select type</option>
                                        {propertyTypesData && propertyTypesData?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.name}</option>
                                        ))}
                                    </select>
                                    <span className="form--error-message">
                                        {formState.errors.property_type_id && formState.errors.property_type_id?.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="property_category_id" className="form--label">Property Category <Asterisk /></label>
                                    <select id="property_category_id" className="form--select" {...register("property_category_id", {
                                        required: "Property category is required!"
                                    })}>
                                        <option hidden selected value="">Select category</option>
                                        {propertyCategoryData && propertyCategoryData?.map((pcd, i) => (
                                            <option value={pcd?.id} key={i}>{pcd.name}</option>
                                        ))}
                                    </select>
                                    <span className="form--error-message">
                                        {formState.errors.property_category_id && formState.errors.property_category_id.message}
                                    </span>
                                </div>

                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="rent_price" className="form--label flex-align-cen">Rent Price <p className="form--info" style={{ color: "#B4B4B4" }}>(per annaul)</p> <Asterisk /></label>
                                    <div className="form--input-currency flex-align-cen">
                                        <span className="form--currency-box">₦</span>
                                        <input type="text" className="form--input" id="rent_price" placeholder="Enter rent price" {...register("rent_price", {
                                            required: "Rent price is required",
                                            onChange: (e) => setValue("rent_price", formatInputNumber(e?.target?.value))
                                        })} />
                                    </div>
                                    <span className="form--error-message">
                                        {formState.errors.rent_price && formState.errors.rent_price.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="service_charge" className="form--label">Service Charge <Asterisk /></label>
                                    <div className="form--input-currency flex-align-cen">
                                        <span className="form--currency-box">₦</span>
                                        <input type="text" className="form--input" id="service_charge" placeholder="Enter service charge" {...register("service_charge", {
                                            required: "Service charge is required",
                                            onChange: (e) => setValue("service_charge", formatInputNumber(e?.target?.value))
                                        })} />
                                    </div>
                                    <span className="form--error-message">
                                        {formState.errors.service_charge && formState.errors.service_charge.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="bedrooms" className="form--label">Number of Bedrooms <Asterisk /></label>
                                    <input type="number" id="bedrooms" className="form--input" placeholder="Enter number of bedrooms" {...register("bedrooms", {
                                        required: "Bedrooms is required"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.bedrooms && formState.errors.bedrooms.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="bathrooms" className="form--label">Number of Bathrooms <Asterisk /></label>
                                    <input type="number" id="bathrooms" className="form--input" placeholder="Enter number of bathrooms" {...register("bathrooms", {
                                        required: "bathroom is required"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.bathrooms && formState.errors.bathrooms.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="amenities" className="form--label">Amenities (optional)</label>
                                    <DropdownSelectWithTabs selected={selectedAmenities} setSelected={setSelectedAmenities} />

                                    {selectedAmenities?.length > 0 && (
                                        <div className="input-drop-tabs">
                                            {selectedAmenities?.map((data, i) => (
                                                <span key={i} className="input-drop-tab">
                                                    {data.amenity}
                                                    <AiOutlineClose onClick={() => setSelectedAmenities(prev => prev?.filter(s => s.amenity !== data.amenity))} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form--item">
                                    <label htmlFor="property_address" className="form--label">Property Address <Asterisk /></label>
                                    <input type="text" id="property_address" className="form--input" placeholder="Enter property address" {...register("property_address", {
                                        required: "Property address is required"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.property_address && formState.errors.property_address.message}
                                    </span>
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="property_size" className="form--label flex-align-cen">Property Size <p className="form--info" style={{ color: "#B4B4B4" }}>(in sqm or sqft)</p> <Asterisk /></label>
                                    <input type="text" id="property_size" className="form--input" placeholder="Enter property size" {...register("property_size", {
                                        required: "Property size is required"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.property_size && formState.errors.property_size.message}
                                    </span>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="agent" className="form--label">Agent <Asterisk /></label>
                                    <input type="text" className="form--input" placeholder="Enter Agent" {...register("agent", {
                                        required: "Agent is required"
                                    })} />
                                    <span className="form--error-message">
                                        {formState.errors.agent && formState.errors.agent.message}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="" className="form--label">Gallery Images <Asterisk /></label>
                            <MultipleImageUpload handleChange={handleGalleryImagesChange} name="gallery-images" preview={galleryImages?.length > 0 ? galleryImages?.map(img => img.preview) : ""} handleRemove={(i) => handleRemoveGalleryImages(i as number)} />
                        </div>
                    </div>

                    <Line />

                    <div className="flex-col-gap">
                        <h4 className="form--title">Inspection Slot (optional)</h4>

                        <div className="flex-align-cen">
                            <p className="form--info" style={{ marginRight: "4rem" }}>{id ? "Edit" : "Add New"} Time Slot</p>
                            <button type="button" className="page--btn-sm" onClick={handleShowScheduleModal}><AiOutlinePlus /> Add</button>
                        </div>

                        <ScheduleTable
                            isEdit={!!id}
                            schedules={inspectionSchedules}
                            handleRemoveSchedule={handleRemoveSchedule}
                        />
                    </div>

                    <div className="form--actions">
                        <button className="form--submit filled" type="submit">{id ? "Edit" : "Add New"}</button>
                        <button className="form--submit outline" type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </section>
        </React.Fragment>
	);
}

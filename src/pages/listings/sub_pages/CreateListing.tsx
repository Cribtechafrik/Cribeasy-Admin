import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import Line from "../../../components/elements/Line";
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from "sonner";
import CurrencyInput from "../../../components/forms/CurrencyInput";
// import { propery_type, amenities } from '../../../utils/data';
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
import { fetchPropertyTypes } from "../../../utils/fetch";
import { useAuthContext } from "../../../context/AuthContext";
import type { ListingType, Property_type } from "../../../utils/types";
import Spinner from "../../../components/elements/Spinner";


const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

const startOfWeek = moment().startOf('isoWeek').format('YYYY-MM-DD');
const endOfWeek = moment().endOf('isoWeek').format('YYYY-MM-DD');

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
    service_charge: string;
    agent: string;
    bedrooms: string;
    bathrooms: string;
}

export default function CreateListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    console.log(id)

    const { headers, token, shouldKick } = useAuthContext();

    const [loading, setLoading] = useState(false);
    const [propertyTypeData, setPropertyTypeData] = useState<Property_type[] | []>([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [coverImage, setCoverImage] = useState({ preview: "", file: null });
    const [galleryImages, setGalleryImages] = useState<{
        preview: string;
        file: any | null;
        public_id?: string | null;
    }[]>([]);

    const [formData, setFormData] = useState<FormDataType>({
        property_title: "",
        description: "",
        rent_price: "",
        property_size: "",
        property_address: "",
        property_type_id: "",
        service_charge: "",
        agent: "",
        bedrooms: "",
        bathrooms: "",
    });

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
        if(!formData.property_title) {
            toast.error("Fill up required fields first!");
            return;
        }

        setShowScheduleModal(true)
    }

    const handleDescriptionLength = (text: string) => {
        if (text.length <= 500) {
            setFormData({ ...formData, description: text });
        } else {
            setFormData({ ...formData, description: text.slice(0, 500) });
            toast.error("Cannot upload more than 3 images!");
        }
    }

    const handleListingDataChange = function (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFormData({ ...formData, [name]: value });
    };

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
        if (newSlots[index]) {
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
        
        if(!id) {
            setInspectionSchedules(prev => [...prev, { ...schedule }]);
            toast.success("Saved Schedule!");
        } else if(id) {
           const updatedSchedules = [...inspectionSchedules, schedule];

            (async () => {
                setLoading(true);
                try {
                    const formData = new FormData();

                    const slots: any = [];
                    updatedSchedules?.forEach((data, inspIndex) => {
                        data.timeSlots.forEach((slot, slotIndex) => {
                            const starts_at = `${data.date} ${slot.start}:00`;
                            const ends_at = `${data.date} ${slot.end}:00`;
                            console.log(inspIndex * data.timeSlots.length + slotIndex)
                            formData.append(`slots[${inspIndex * data.timeSlots.length + slotIndex}][starts_at]`, starts_at);
                            formData.append(`slots[${inspIndex * data.timeSlots.length + slotIndex}][ends_at]`, ends_at);
                            console.log(starts_at, ends_at)
                            slots.push({ starts_at, ends_at })
                        });
                    });
                    formData.append("slots[]", slots);

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
                        const schedulesWithId = updatedSchedules.map(schedule => ({
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
            (async () => {
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
        (async () => {
            const propertyTypeData = await fetchPropertyTypes(headers)
            if(propertyTypeData?.success) {
                setPropertyTypeData(propertyTypeData?.data[0])
            }
        })();
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
                setFormData({
                    property_title: listing?.property_title || "",
                    description: listing?.description || "",
                    rent_price: listing?.property_detail?.rent_price || "",
                    property_size: listing?.property_detail?.property_size || "",
                    property_address: listing?.property_detail?.property_address || "",
                    property_type_id: `${listing?.property_detail?.property_type_id}` || "",
                    service_charge: listing?.property_detail?.service_charge || "",
                    agent: listing?.user_name || "",
                    bedrooms: `${listing?.property_detail?.bedrooms}` || "",
                    bathrooms: `${listing?.property_detail?.bathrooms}` || "",
                });

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

    
    async function handleSubmitListing() {
        setLoading(true);

        try {
            const FORM_DATA = new FormData();
            FORM_DATA.append('property_ref_id', `#${generateId()}`);
            FORM_DATA.append('property_title', formData.property_title);
            FORM_DATA.append('bedrooms', formData.bedrooms);
            // @ts-ignore
            FORM_DATA.append('rent_price', +formData?.rent_price?.replaceAll(",", ""));
            FORM_DATA.append('property_size', formData.property_size);
            FORM_DATA.append('property_address', formData.property_address);
            FORM_DATA.append('property_type_id', formData.property_type_id);
            // @ts-ignore
            FORM_DATA.append('service_charge', +formData?.service_charge?.replaceAll(",", ""));
            FORM_DATA.append('agent', formData.agent);
            FORM_DATA.append('bedrooms', formData.bedrooms);
            FORM_DATA.append('bathrooms', formData.bathrooms);
            FORM_DATA.append('description', formData.description);

            // temps
            FORM_DATA.append('property_category_id', "1");
            FORM_DATA.append('user_id', "1");

            if(selectedAmenities?.length > 0) {
                // FORM_DATA.append('amenities[]', JSON.stringify(selectedAmenities));
                selectedAmenities.forEach((data, index) => {
                    FORM_DATA.append(`amenities[${index}][amenity]`, data.amenity);
                    FORM_DATA.append(`amenities[${index}][amenity_icon]`, data.amenity_icon);
                });
            }

            if(coverImage?.file) {
                FORM_DATA.append('property_cover', coverImage?.file);
            }
            if(galleryImages?.length > 0 && galleryImages?.every(img => img.file)) {
                // FORM_DATA.append('media[]', JSON.stringify(galleryImages?.map(el => el.file)));
                galleryImages.forEach((data, index) => {
                    FORM_DATA.append(`media[${index}]`, data.file);
                });
            }

            // ONLY ON EDIT
            if(id && removedImages?.length > 0) {
                removedImages.forEach((public_id, index) => {
                    FORM_DATA.append(`removed_media[${index}][resource_type]`, "image");
                    FORM_DATA.append(`removed_media[${index}][cloudinary_id]`, public_id);
                });
            }

            // NOT ON EDIT
            if(!id && inspectionSchedules?.length > 0) {
                const slots: any = [];
                inspectionSchedules?.forEach((data, inspIndex) => {
                    data.timeSlots.forEach((slot, slotIndex) => {
                        const starts_at = `${data.date} ${slot.start}:00`;
                        const ends_at = `${data.date} ${slot.end}:00`;

                        FORM_DATA.append(`inspection_slots[${inspIndex * data.timeSlots.length + slotIndex}][starts_at]`, starts_at);
                        FORM_DATA.append(`inspection_slots[${inspIndex * data.timeSlots.length + slotIndex}][ends_at]`, ends_at);

                        slots.push({ starts_at, ends_at })
                    });
                });
                // FORM_DATA.append('inspection_slots[]', JSON.stringify(slots));
            }

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id ? id : ""}`, {
                method: "POST",
                headers: formDataHeaders,
                body: FORM_DATA
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== (id ? 200 : 201) || !data?.success) {
                throw new Error(data?.error?.message);
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
                                value={formData.property_title}
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
                                value={schedule?.date}
                                min={startOfWeek}
                                max={endOfWeek}
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
                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className="form--input"
                                        value={slot.end}
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

                <div className="card form">
                    <div className="form--section">
                        <div className="flex-col-gap">
                            <h4 className="form--title">Property Description</h4>

                            <div className="form--item">
                                <label htmlFor="property_title" className="form--label">Property Title <Asterisk /></label>
                                <input type="text" className="form--input" name="property_title" id="property_title" placeholder="Enter a title" value={formData.property_title} onChange={handleListingDataChange} />
                            </div>

                            <div className="form--item">
                                <label htmlFor="" className="form--label">Property Description <Asterisk /></label>
                                <TextareaAutosize name="description" className="form--input" minRows={4} placeholder="Enter description" value={formData.description} onChange={(e) => handleDescriptionLength(e.target.value)} />
                                <span className="form--info" style={{ color: "#B4B4B4", alignSelf: "flex-end" }}>{formData.description?.length ?? 0} / 500 characters</span>
                            </div>
                        </div>

                        <div className="form--item">
                            <label htmlFor="" className="form--label">Cover Image <Asterisk /></label>
                            <ImageUpload handleChange={handleCoverImageChange} preview={coverImage.preview} handleRemove={handleRemoveCoverImage} />
                        </div>
                    </div>

                    <Line />

                    <div className="form--section">
                        <div className="flex-col-gap">
                            <h4 className="form--title">Property Details</h4>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="property_type_id" className="form--label">Property Type <Asterisk /></label>
                                    <select name="property_type_id" id="property_type_id" className="form--select" onChange={handleListingDataChange}>
                                        <option hidden disabled selected>Property type</option>
                                        {propertyTypeData && propertyTypeData?.map((type, i) => (
                                            <option value={type?.id} key={i}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form--item">
                                    <label htmlFor="rent_price" className="form--label flex-align-cen">Rent Price <p className="form--info" style={{ color: "#B4B4B4" }}>(per annaul)</p> <Asterisk /></label>
                                    <CurrencyInput placeholder="Enter rent price" name="rent_price" id="rent_price" value={formData.rent_price} onChange={(value) => setFormData({ ...formData, rent_price: value })} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="bedrooms" className="form--label">Number of Bedrooms <Asterisk /></label>
                                    <input type="number" name="bedrooms" id="bedrooms" className="form--input" placeholder="Enter number of bedrooms" value={formData.bedrooms} onChange={handleListingDataChange} />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="service_charge" className="form--label">Service Charge <Asterisk /></label>
                                    <CurrencyInput placeholder="Enter service charge" name="service_charge" id="service_charge" value={formData.service_charge} onChange={(value) => setFormData({ ...formData, service_charge: value })} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="bathrooms" className="form--label">Number of Bathrooms <Asterisk /></label>
                                    <input type="number" name="bathrooms" id="bathrooms" className="form--input" placeholder="Enter number of bathrooms" value={formData.bathrooms} onChange={handleListingDataChange} />
                                </div>

                                <div className="form--item">
                                    <label htmlFor="property_size" className="form--label flex-align-cen">Property Size <p className="form--info" style={{ color: "#B4B4B4" }}>(in sqm or sqft)</p> <Asterisk /></label>
                                    <input type="text" name="property_size" id="property_size" className="form--input" placeholder="Enter property size" value={formData.property_size} onChange={handleListingDataChange} />
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
                                    <input type="text" name="property_address" id="property_address" className="form--input" placeholder="Enter property address" value={formData.property_address} onChange={handleListingDataChange} />
                                </div>
                            </div>

                            <div className="form--flex">
                                <div className="form--item">
                                    <label htmlFor="agent" className="form--label">Agent</label>
                                    <input type="text" className="form--input" placeholder="Enter Agent" name="agent" value={formData.agent} onChange={handleListingDataChange} />
                                </div>

                                <div className="form--item"></div>
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
                            <button className="page--btn-sm" onClick={handleShowScheduleModal}><AiOutlinePlus /> Add</button>
                        </div>

                        <ScheduleTable
                            isEdit={!!id}
                            schedules={inspectionSchedules}
                            handleRemoveSchedule={handleRemoveSchedule}
                        />
                    </div>

                    <div className="form--actions">
                        <button className="form--submit filled" onClick={handleSubmitListing}>{id ? "Edit" : "Add New"}</button>
                        <button className="form--submit outline" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </div>
            </section>
        </React.Fragment>
	);
}

import React, { useEffect, useState } from "react"
import { toast } from "sonner";
import { useAuthContext } from "../../../context/AuthContext";
import type { ListingType } from "../../../utils/types";
import Spinner, { SpinnerMini } from "../../../components/elements/Spinner";
import { Gallery, Item } from "react-photoswipe-gallery"
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Confirm from "../../../components/modals/Confirm";
import { IoCheckmarkCircle } from "react-icons/io5";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { formatNumber, formatTime } from "../../../utils/helper";


type InspectionScheduleType = {
    date: string;
    day: string;
    timeSlots: { start: string; end: string; }[];
}

export default function ListingDetails({ id, refetchTable }: { id: number, refetchTable: () => void; }) {
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState({ modal: false, main: false })
    const [showModal, setShowModal] = useState({ confirm: false, completed: false });
    const [listingData, setListingData] = useState<ListingType | null>(null);
    const [inspectionSlots, setInspectionSlots] = useState<InspectionScheduleType[] | []>([]);


    async function handleFetchListing() {
        setLoading({ ...loading, modal: true });

        try {
			// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}?full=true`, {
			// 	method: "GET",
			// 	headers,
			// });

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

            shouldKick(listingRes || slotsRes);

			const data = await listingRes.json();
			if (listingRes.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setListingData(data?.data);
            const slotsData = await slotsRes.json();
            const slots = Object.entries(slotsData?.data);
            console.log(slots)

            for(const slot of slots) {
                const dateObj = new Date(slot?.[0]);
                const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
                const dayName = dayNames[dateObj.getDay()];

                setInspectionSlots(prev => [
                    ...prev,
                    {
                        date: slot?.[0],
                        day: dayName,
                        // @ts-ignore
                        timeSlots: slot?.[1]?.map((timeSlots: { starts_at: string; ends_at: string; }) => {
                            return {
                                start: timeSlots?.starts_at?.split("T")?.[1],
                                end: timeSlots?.ends_at?.split("T")?.[1]}
                            }
                        ),
                    }
                ]);

                // setInspectionSlots(prev => {
                //     const existingSlot = prev.find(s => s.date === slot?.[0]);
                //     if (existingSlot) {
                //         // @ts-ignore
                //         existingSlot.timeSlots.push(...slot?.[1]?.map(timeSlot => ({
                //             start: timeSlot?.starts_at?.split('T')[1],
                //             end: timeSlot?.ends_at?.split('T')[1],
                //         })));
                //         return [...prev];
                //     } else {
                //         return [
                //             ...prev,
                //             {
                //                 date: slot?.[0],
                //                 day: dayName,
                //                 // @ts-ignore
                //                 timeSlots: slot?.[1]?.map(timeSlot => ({
                //                     start: timeSlot?.starts_at?.split('T')[1],
                //                     end: timeSlot?.ends_at?.split('T')[1],
                //                 })),
                //             },
                //         ];
                //     }
                // });
            }
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
            setLoading({ ...loading, modal: false });
		}
    }

    useEffect(function() {
        handleFetchListing();
    }, [id]);
    
    
    async function handleTogglePublication() {
        setLoading({ ...loading, main: true });

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}/toggle-publication`, {
				method: "PATCH",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
            console.log(data)
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ confirm: false, completed: true })
            setListingData( listingData ? { ...listingData, is_active: listingData?.is_active == 0 ? 1 : 0 } : null);
            refetchTable();
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
            setLoading({ ...loading, main: false });
		}
    }


    return (
        <React.Fragment>
            {loading.modal && (
                <div className="table-spinner-container">
                    <SpinnerMini />
                </div>
            )}

            {loading.main && createPortal(
                <Spinner />, document.body
            )}

            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">{listingData?.is_active == 1 ? "Unpublish" : "Publish"} Property</h4>
                        <p className="modal--subtext">Are you sure you want to {listingData?.is_active == 1 ? "Unpublish" : "Publish"} this property? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleTogglePublication}>Yes, {listingData?.is_active == 1 ? "Unpublish" : "Publish"}</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{listingData?.is_active == 1 ? "Unpublished" : "Published"} Listing Successfully</h4>

                        <button className="modal--btn filled" onClick={() => navigate("/")}>Proceed To Dashboard</button>
                    </div>
                </Confirm>, document.body
            )}

            {(!loading.modal && listingData) && (
                <div className="deatils--container">
                    <Gallery options={{ zoom: true, bgOpacity: 1 }}>
                        <Item
                            original={listingData?.property_cover}
                            thumbnail={listingData?.property_cover}
                            width="1024"
                            height="768"
                        >
                            {({ ref, open }) => (             
                                <img ref={ref} onClick={open} className="details--cover-img" src={listingData?.property_cover} alt={listingData?.property_title} />
                            )}
                        </Item>
                    </Gallery>

                    <div className="details--grid">
                        <div className="left--side">
                            <div className="details--info">
                                <h5 className="title form--label">Property Title</h5>
                                <p className="text">{listingData.property_title}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Property Description</h5>
                                <p className="text">{listingData.description}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Numbers of Bedrooms</h5>
                                <p className="text">{listingData?.property_detail?.bedrooms}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Property Size</h5>
                                <p className="text">{listingData?.property_detail?.property_size}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Numbers of Bathroom</h5>
                                <p className="text">{listingData?.property_detail?.bedrooms}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Property Ref. ID</h5>
                                <p className="text">{!listingData?.property_ref_id?.startsWith("#") ? "#" + listingData?.property_ref_id : listingData?.property_ref_id}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Agent</h5>
                                <p className="text">{listingData?.user_name}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Published Status</h5>
                                <span className={`status status--${listingData?.is_active == 1 ? "published" : listingData?.is_active == 0 ? "unpublished" : ""}`}>
                                    <p>{listingData?.is_active == 1 ? "published" : listingData?.is_active == 0 ? "unpublished" : ""}</p>
                                </span>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Booked Status</h5>
                                <span className={`status status--${listingData?.is_booked == 0 ? "available" : listingData?.is_booked == 1 ? "rented" : ""}`}>
                                    <p>{listingData?.is_booked == 0 ? "available" : listingData?.is_booked == 1 ? "rented" : ""}</p>
                                </span>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Image Galleries</h5>
                                <div className="details--image-flex">
                                    <Gallery options={{ zoom: true, counter: true, bgOpacity: 1, zoomAnimationDuration: 1 }}>
                                        {listingData?.gallery?.images_url?.map((imgSrc, i) => (
                                            <Item
                                                sourceId={i}
                                                key={i}
                                                original={imgSrc?.cloudinary_url}
                                                thumbnail={imgSrc?.cloudinary_url}
                                                width="1024"
                                                height="768"
                                            >
                                                {({ ref, open }) => (
                                                    <img ref={ref} onClick={open} src={imgSrc?.cloudinary_url} alt={imgSrc?.cloudinary_id ?? listingData?.property_title} />
                                                )}
                                            </Item>
                                        ))}
                                    </Gallery>
                                </div>
                            </div>
                        </div>

                        <div className="right--side">
                            <div className="details--info">
                                <h5 className="title form--label">Property Type</h5>
                                <p className="text">{listingData?.property_detail?.property_type}</p>
                            </div>
                            
                            <div className="details--info">
                                <h5 className="title form--label">Property Address</h5>
                                <p className="text">{listingData.property_detail?.property_address}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Rent Price</h5>
                                <p className="text">{formatNumber(+listingData?.property_detail?.rent_price, 2)}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Service Charge</h5>
                                <p className="text">{formatNumber(+listingData?.property_detail?.service_charge, 2)}</p>
                            </div>

                            <div className="details--info">
                                <h5 className="title form--label">Amenities</h5>
                                <div className="amenities">
                                    {listingData?.property_detail?.amenities?.map((data, i) => (
                                        <span className="flex-align-cen" style={{ gap: "0.68rem" }} key={i}>
                                            <img src={data?.amenity_icon} alt={data?.amenity} />
                                            {data?.amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="details--info" style={{ width: "100%" }}>
                                <h5 className="title form--label">Inspection Slot</h5>
                                {inspectionSlots.length > 0 ? (
                                    <div className="slot--flex">
                                        {inspectionSlots?.map((slot, i) => (
                                            <div key={i} className="flex-align-justify-spabtw">
                                                <p className="form--label">{slot?.day}: </p>
                                                {slot?.timeSlots?.map((time, i) => (
                                                    <span className="text" key={i}>
                                                        {formatTime(time?.start)} - {formatTime(time?.end)}{i < slot?.timeSlots?.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data">No Inspection Slots</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "40rem" }}>
                        <button className="modal--btn outline" onClick={() => navigate(`/dashboard/listings/${id}/edit`)}>Edit</button>
                        <button className={`modal--btn ${listingData?.is_active == 1 ? "remove" : "filled"}`} onClick={() => setShowModal({ ...showModal, confirm: true })}>
                            {listingData?.is_active == 1 ? "Unpublish" : "Publish"}
                        </button>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
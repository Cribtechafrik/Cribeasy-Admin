import React, { useEffect, useState } from 'react'
import Spinner from '../../../components/elements/Spinner';
import type { InspectionType } from '../../../utils/types';
import Breadcrumbs from '../../../components/elements/Breadcrumbs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { BsFillFlagFill } from 'react-icons/bs';
import { PiExport } from 'react-icons/pi';
import { Intials } from '../../../components/layout/IntialsImage';
import { MdOutlineAccessTimeFilled, MdPhone } from 'react-icons/md';
import { HiEnvelope } from 'react-icons/hi2';
import { BiSolidBuildingHouse } from 'react-icons/bi';
import { formatDateWithDay, formatTime } from '../../../utils/helper';
import { IoCalendar } from 'react-icons/io5';


const breadCrumbs = [
    { name: "Inspection", link: "/dashboard/inspections" },
    { name: "Inspection Details", isCurrent: true },
];

export default function InspectionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();

    const [loading, setLoading] = useState(true)
    const [inspectionData, setInspectionData] = useState<InspectionType | null>(null);
    
    async function handleFetchInspection() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/inspection-bookings/${id}?full=true`, {
                method: "GET",
                headers,
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || (!data?.success && !data?.data)) {
                throw new Error(data?.error?.message);
            }

            setInspectionData(data?.data);
            
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(function() {
        handleFetchInspection();
    }, [id]);

    return (
        <React.Fragment>
            {loading && <Spinner />}

            {(!loading && inspectionData?.id) && (
                <section className="section--page">
                    <div className="page--top">
                        <div className="page--heading">
                            <h4 className="title">Inspection Details</h4>
                            <Breadcrumbs breadcrumArr={breadCrumbs} />
                        </div>

                        <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                            <button className="page--btn outline"><PiExport /> Export</button>
                            <button className="page--btn remove gap-1"><BsFillFlagFill style={{ fontSize: "1.4rem" }} /> Flag</button>
                        </div>
                    </div>


                    <div className="inspection--details">
                        <div className="left--side">
                            <div className="card">
                                <div className="flex-align-start-justify-spabtw">
                                    <div className="inspection--details-info">
                                        <img src={inspectionData?.property_cover} alt={inspectionData?.property_title} />

                                        <div className="details--info gap-0-6">
                                            <span className="section--heading">
                                                <h2>{inspectionData?.property_title}</h2>
                                            </span>

                                            <p className="text">Property ID: {inspectionData?.property_ref_id?.startsWith("#") ? inspectionData?.property_ref_id : "#" + inspectionData?.property_ref_id}</p>
                                            <div className="text">{inspectionData?.property_address}</div>

                                            <button className="page--btn filled-opc" onClick={() => navigate("/dashboard/listings")}>View Listing</button>
                                        </div>
                                    </div>

                                    <div className="flex-col-1 gap-1-2 align-flex-end">
                                        <span className="details--info">
                                            <p className='text'>Verification Code: {inspectionData?.confirmation_code}</p>
                                        </span>

                                        <span className={`status status--${inspectionData?.status}`}>
                                            <p>{inspectionData?.status == "accepted" ? "Approved" : inspectionData?.status}</p>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="section--top" style={{ marginBottom: "2rem" }}>
                                    <div className="section--heading">
                                        <h2>Inspection Schedule</h2>

                                        <span className={`status status--default`}>
                                            <p>Schedule</p>
                                        </span>
                                    </div>
                                </div>


                                <div className="flex-col-1">
                                    <div className="flex-align-justify-spabtw">
                                        <div className="inspection--figure">
                                            <span className="icon-box">
                                                <BiSolidBuildingHouse />
                                            </span>

                                            <span className="details">
                                                <p className="title">Community</p>
                                                <p className="value">{inspectionData?.community}</p>
                                            </span>
                                        </div>

                                        <div className="inspection--figure">
                                            <span className="icon-box">
                                                <IoCalendar />
                                            </span>

                                            <div className="details">
                                                <p className="title">Date</p>
                                                <p className="value">{formatDateWithDay(inspectionData?.starts_at)}</p>
                                            </div>
                                        </div>

                                        <div className="inspection--figure">
                                            <span className="icon-box">
                                                <MdOutlineAccessTimeFilled />
                                            </span>

                                            <div className="details">
                                                <p className="title">Time Slot</p>
                                                <p className="value">{formatTime(inspectionData?.starts_at?.split("T")?.[1])} - {formatTime(inspectionData?.ends_at?.split("T")?.[1])}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {inspectionData?.notes && (
                                        <div className="inspection--note">
                                            <p>Notes</p>
                                            <p>{inspectionData?.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="right--side">
                            <div className="card">
                                <div className="section--top" style={{ marginBottom: "1.4rem" }}>
                                    <div className="section--heading">
                                        <h2>Agent Information</h2>
                                    </div>
                                </div>

                                <div className="flex-col-1">
                                    <div className="table--profile gap-0-6">
                                        <Intials
                                            hasImage={!!inspectionData?.agent_profile_image}
                                            imageUrl={inspectionData?.agent_profile_image ?? ""}
                                            names={[inspectionData?.agent_first_name, inspectionData?.agent_last_name]}
                                        />
                                        <span className='table--info gap-1'>
                                            <h3>{inspectionData?.agent_first_name}</h3>
                                            <p></p>
                                        </span>
                                    </div>

                                    <div className="flex-col-0-8 inspection--details-top">
                                        <span className='flex-align-cen gap-1'>
                                            <MdPhone />
                                            <p className='info'>{inspectionData?.agent_phone}</p>
                                        </span>
                                        {inspectionData?.agent_email && (
                                            <span className='flex-align-cen gap-1'>
                                                <HiEnvelope />
                                                <p className='info'>
                                                    <a target='_blank' href={`mailto:${inspectionData?.agent_email}`}>
                                                        {inspectionData?.agent_email}
                                                    </a>
                                                </p>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="card">
                                <div className="section--top" style={{ marginBottom: "1.4rem" }}>
                                    <div className="section--heading">
                                        <h2>Renter Information</h2>
                                    </div>
                                </div>

                                <div className="flex-col-1">
                                    <div className="table--profile gap-0-6">
                                        <Intials
                                            hasImage={!!inspectionData?.renter_profile_image}
                                            imageUrl={inspectionData?.renter_profile_image ?? ""}
                                            names={[inspectionData?.renter_first_name, inspectionData?.renter_last_name]}
                                        />
                                        <span className='table--info'>
                                            <h3>{inspectionData?.renter_first_name}</h3>
                                            <p></p>
                                        </span>
                                    </div>

                                    <div className="flex-col-0-8 inspection--details-top">
                                        <span className='flex-align-cen gap-1'>
                                            <MdPhone />
                                            <p className='info'>{inspectionData?.renter_phone}</p>
                                        </span>
                                        <span className='flex-align-cen gap-1'>
                                            <HiEnvelope />
                                            <p className='info'>
                                                <a target='_blank' href={`mailto:${inspectionData?.renter_email}`}>
                                                    {inspectionData?.renter_email}
                                                </a>
                                            </p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </React.Fragment>
    )
}

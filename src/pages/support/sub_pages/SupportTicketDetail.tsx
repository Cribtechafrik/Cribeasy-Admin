import React, { useEffect, useState } from "react";
import Spinner from "../../../components/elements/Spinner";
import Breadcrumbs from "../../../components/elements/Breadcrumbs";
import type { SupportTicketType, TicketMessage } from "../../../utils/types";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import QuillEditor from "../../../components/forms/QuillEditor";
import { HiMiniUser } from "react-icons/hi2";
import { PiBriefcaseMetal } from "react-icons/pi";
import { BsList } from "react-icons/bs";
import { BiCalendarEvent } from "react-icons/bi";
import { Gallery, Item } from "react-photoswipe-gallery";
import TicketHistory from "../../../components/layout/TicketHistory";
import { createPortal } from "react-dom";
import Confirm from "../../../components/modals/Confirm";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoCheckmarkCircle } from "react-icons/io5";

const breadCrumbs = [
	{ name: "Support", link: "/dashboard/support-tickets" },
	{ name: "Ticket Details", isCurrent: true },
];

export default function SupportTicketDetail() {
	const { id } = useParams();
    const navigate = useNavigate();
    const { headers, shouldKick, token } = useAuthContext();

    const [loading, setLoading] = useState(true)
    const [supportTicketData, setSupportTicketData] = useState<SupportTicketType | null>(null);
    const [messageValue, setMessageValue] = useState('');
    const [showModal, setShowModal] = useState({ confirm: false, completed: false });
    
    const extractImages = async (htmlContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const images = doc.querySelectorAll('img');
        
        const imageData = await Promise.all(
            Array.from(images).map(async (img, index) => {
                const src = img.src;
                let file: File | null = null;
                
                if (src.startsWith('data:image')) {
                    // Base64 image - convert to File
                    const response = await fetch(src);
                    const blob = await response.blob();
                    const mimeType = blob.type || 'image/png';
                    const extension = mimeType.split('/')[1];
                    file = new File([blob], `image-${index}-${Date.now()}.${extension}`, { type: mimeType });
                } else if (src.startsWith('http') || src.startsWith('https')) {
                    // External URL - fetch and convert to File
                    try {
                        const response = await fetch(src);
                        const blob = await response.blob();
                        const mimeType = blob.type || 'image/png';
                        const extension = mimeType.split('/')[1];
                        const filename = src.split('/').pop() || `image-${index}.${extension}`;
                        file = new File([blob], filename, { type: mimeType });
                    } catch (error) {
                        console.error('Failed to fetch image:', error);
                    }
                }

                // Remove the image from the document
                img.remove();
                
                return {
                    src: src,
                    alt: img.alt || '',
                    file: file
                };
            })
        );

        // return imageData;

        // Get the cleaned HTML without images
        const cleanedHtml = doc.body.innerHTML;
        
        return {
            images: imageData,
            cleanedHtml: cleanedHtml
        };
    };

    async function handleFetchData() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/reported-issues/${id}?full=true`, {
                method: "GET",
                headers,
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || (!data?.success && !data?.data)) {
                throw new Error(data?.error?.message);
            }

            setSupportTicketData(data?.data);
            
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(function() {
        handleFetchData();
    }, [id]);


    async function handleSubmitData() {
        if(!messageValue) {
            return toast.error("Enter a reply message!");
        }
        setLoading(true);

        const formData = new FormData();
        const { images, cleanedHtml } = await extractImages(messageValue);
        formData.append('message', cleanedHtml  || messageValue);

        // Usage
        images.forEach((img, index) => {
            if (img.file) {
                formData.append(`attachments[${index}]`, img.file);
            }
        });

        try {

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }            
            
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/reported-issues/${id}/reply`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            toast.success(`Sent reply successfully!`);
            setSupportTicketData((prev: any) => {
                const currentMessages = prev?.messages ?? [];
                const newMessage = data?.data;
                
                return {
                    ...prev,
                    messages: newMessage ? [...currentMessages, newMessage] : currentMessages
                };
            });
            setMessageValue("");
            
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleActivation() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/reported-issues/${id}/status`, {
                method: "PATCH",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ ...showModal, confirm: false, completed: true });
            navigate(-1)
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }


	return (
		<React.Fragment>
			{loading && <Spinner />}

            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Close Ticket</h4>
                        <p className="modal--subtext">Are you sure you want to Close this ticket? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleToggleActivation}>Yes, Close</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">Ticket Closed Successfully</h4>
                        <p className="modal--text">This report has been marked as resolved</p>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}

			<section className="">
				<div className="page--top">
					<div className="page--heading">
						<h4 className="title">Ticket</h4>
						<Breadcrumbs breadcrumArr={breadCrumbs} />
					</div>
				</div>

				<div className="support--display">
                    <div className="left--side">
                        <div className="display--card">
                            <span className="title">Ticket {supportTicketData?.reportID} - {supportTicketData?.category} - {supportTicketData?.subject}</span>
                            <p className="subtext">{supportTicketData?.created_at}</p>
                        </div>

                       <div className="flex-col-2">
                            <QuillEditor value={messageValue} setValue={setMessageValue} />
                            <button className="modal--btn filled" onClick={handleSubmitData} style={{ alignSelf: "flex-start" }}>Submit</button>
                       </div>

                        <TicketHistory data={supportTicketData?.messages as []} />

                        <div className="modal--actions">
                            {/* <button className="modal--btn filled">Save</button> */}
                            <button className="modal--btn remove" disabled={supportTicketData?.status !== "open"} onClick={() => setShowModal({ ...showModal, confirm: true })}>{supportTicketData?.status == "open" ? "Close" : "Closed"} Ticket</button>
                            <button className="modal--btn outline" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>

                    <div className="right--side">
                        <div className="flex-col-1" style={{ width: "100%" }}>
                            <span className="details--card">
                                <HiMiniUser />
                                Requester: {supportTicketData?.requester_name}
                            </span>

                            <span className="details--card">
                                <PiBriefcaseMetal />
                                Category: {supportTicketData?.category}
                            </span>

                            <span className={`details--card status--${supportTicketData?.status == "closed" ? "resolved" : supportTicketData?.status}`}>
                                <BsList />
                                Status: {supportTicketData?.status == "closed" ? "resolved" : supportTicketData?.status}
                            </span>

                            <span className={`details--card status--${supportTicketData?.priority}`}>
                                <PiBriefcaseMetal />
                                Priority: {supportTicketData?.priority}
                            </span>

                            <span className="details--card">
                                <BiCalendarEvent />
                                Start Date: {supportTicketData?.created_at}
                            </span>

                            {/* <span className="details--card">
                                <BiCalendarEvent />
                                Due Date: {supportTicketData?.created_at}
                            </span> */}
                        </div>

                        <div className="flex-col-1" style={{ width: "100%" }}>
                            <h4 className="form--title">Attachment</h4>
                            {(supportTicketData?.messages as TicketMessage[])?.length > 0 && (
                                <React.Fragment>
                                    {supportTicketData?.messages?.some(msg => msg.attachments?.length > 0) ? (
                                        <div className="attachment--flex">
                                            {supportTicketData?.messages?.map((msg, i) => (
                                                <Gallery options={{ zoom: true, counter: true, bgOpacity: 1, zoomAnimationDuration: 1 }} key={i}>
                                                    {msg.attachments?.map((img, index) => (
                                                        <Item
                                                            sourceId={index}
                                                            key={index}
                                                            original={img?.url}
                                                            thumbnail={img?.url}
                                                            width="10rem"
                                                            height="10rem"
                                                        >
                                                            {({ ref, open }) => (
                                                                <img ref={ref} onClick={open} src={img.url} alt={msg.sender_name} />
                                                            )}
                                                        </Item>
                                                    ))}
                                                </Gallery>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No attachments found</p>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </div>
			</section>
		</React.Fragment>
	);
}

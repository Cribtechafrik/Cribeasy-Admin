import { LuSend } from "react-icons/lu";
import type { AnnouncementType, CommunityDetailType } from "../../utils/types";
import { FaRegSmile } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { toast } from "sonner";
import { SpinnerMini } from "../elements/Spinner";
import { useAuthContext } from "../../context/AuthContext";
import { AiOutlineClose } from "react-icons/ai";
import AnnouncementChatDisplay from "./AnnouncementChatDisplay";
import moment from "moment";
import ErrorComponent from "./ErrorComponent";


export default function CommunityAnnouncement({ community }: { community: CommunityDetailType }) {
    const { headers, shouldKick, token, auth } = useAuthContext();
    const [showEmoji, setShowEmoji] = useState(false);
    const [message, setMessage] = useState("");
    const [announcementHistory, setAnnouncementHistory] = useState<AnnouncementType[]>([])
    const [loading, setLoading] = useState({ main: false, message: false });
    const [error, setError] = useState(false);
    const [attachments, setAttachments] = useState<{
        preview: string;
        file: any | null;
    }[]>([]);

    const ref = useOutsideClick(() => setShowEmoji(false)) as React.RefObject<HTMLDivElement>;
    const endRef = useRef(null) as any;

    const handleAttachmentChange = function(event: any) {
        const files = [...event?.target?.files];
        console.log(files)

        if(attachments?.length + files.length > 5) {
            return toast.error("Cannot upload more than 5 images!");
        };

        files.forEach((file: any) => {
            console.log(file)
            const imageUrl = URL.createObjectURL(file as File);
            setAttachments((prev) => [...prev, { preview: imageUrl, file }]);
        });
    }

    const handleRemoveAttachment = function(index: number) {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }

    async function handleFetchAnnouncementHistory() {
        setLoading({ ...loading, main: true });
        setError(false);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/chats/${community?.id}/announcements`, {
                method: "GET",
                headers,
            });
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
    
            setAnnouncementHistory(data?.data);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }

    useEffect(function() {
        handleFetchAnnouncementHistory();
    }, []);

    useEffect(function() {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [announcementHistory, loading.main, loading.message]);

    const handleSendAnnouncement = async function() {
        if(!message) return toast.error("A message is required!");
        
        setLoading({ ...loading, message: true });
        setError(false);

        const imgs = attachments?.map((img) => ({ url: img.preview })) ?? [];

        const data: AnnouncementType = {
            attachments: imgs as any,
            user_id: auth?.id!,
            content: message,
            type: "announcement",
            is_announcement: true,
            created_at: new Date().toISOString(),
        }

        setAnnouncementHistory(prev => [...prev, data]);

        try {
            const formData = new FormData();
            formData.append('content', message);
            formData.append('type', "announcement");
            formData.append('is_announcement', "1");

            if(attachments?.length > 0) {
                attachments.forEach((attached, index) => {
                    if (attached.file) {
                        formData.append(`attachments[${index}]`, attached.file);
                    }
                });
            }

            const formDataHeaders = {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`
            }

            setMessage("");
            setAttachments([]);

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/chats/${community?.id}/messages`, {
                method: "POST",
                headers: formDataHeaders,
                body: formData
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            toast.success("Announce Sent!")
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true);
        } finally {
            setLoading({ ...loading, message: false })
        }
    }

    const groupAnnouncementsByDate = announcementHistory?.reduce((acc: any, announcement) => {
        const date = moment(announcement.created_at).format('YYYY-MM-DD');
        acc[date] = [...(acc[date] || []), announcement];
        return acc;
    }, {});


    return (
        <div className="announcement--container" style={{ marginBottom: "-2.8rem", }}>
            <div className="annoucement--top">
                <img className="img" src={community?.image} alt={community?.name} />
                <h4 className="title">{community?.name} - Community Annoucement</h4>
            </div>
        
            {/* the chat session */}
            <div className="announcement--chat">
                <div className="chats">
                    {loading.main && (
                        <div className="flex-align-justify-center" style={{ minHeight: "50vh" }}>
                            <SpinnerMini />
                        </div>
                    )}

                    {(error && !loading.main) && (
                        <ErrorComponent />
                    )}

                    {/* CHAT HISTORY */}
                    {!loading.main && !error && (
                        (announcementHistory?.length > 0) ? (
                            <React.Fragment>
                                {Object.keys(groupAnnouncementsByDate).map((date, i) => (
                                    <React.Fragment key={i}>
                                        <span className="chat-day">
                                            <span>
                                                {moment(date).calendar(null, {
                                                    sameDay: '[Today]',
                                                    nextDay: '[Tomorrow]',
                                                    nextWeek: 'ddd, MMM DD',
                                                    lastDay: '[Yesterday]',
                                                    lastWeek: 'ddd, MMM DD',
                                                    sameElse: 'ddd, MMM DD'
                                                })}
                                            </span>
                                        </span>
                                        {groupAnnouncementsByDate[date].map((announcement: AnnouncementType, j: number) => (
                                            <AnnouncementChatDisplay data={announcement} key={j} />
                                        ))}
                                    </React.Fragment>
                                ))}

                                <div ref={endRef} />
                            </React.Fragment>
                        ) : (
                            <span className="flex-col-1" style={{ marginTop: "4rem" }}>
                                <span className="chat-day">Today</span>
                                <span className="no-data">No Previous Announcement in this community</span>
                            </span>
                        )
                    )}
                </div>
            </div>
                
            {/* the attachments */}
            <div className="announcement--textarea">
                <div className="announcement--attachments">
                    {attachments?.length > 0 && (
                        attachments?.map((img, i) => (
                            <span className="announcement--attachment" key={i} onClick={() => {}}>
                                <button onClick={() => handleRemoveAttachment(i)} className='delete--attachment'><AiOutlineClose /></button>
                                <img src={img?.preview} alt={`announement img ${i}`} />
                            </span>
                        ))
                    )}
                </div>

                {/* the textarea */}
                <textarea className="form--input" disabled={loading.main || loading.message} placeholder="Your Announcement..." autoCapitalize="sentences" value={message} onChange={(e) => setMessage(e.target?.value)}></textarea>

                {/* chat actions */}
                <span className="announcement--elements">
                    <label htmlFor="attachment" title="Attachment">
                        <ImAttachment />
                        <input type="file" id="attachment" multiple accept="image/*" disabled={loading.main || loading.message} onChange={(e) => handleAttachmentChange(e)} />
                    </label>

                    <span onClick={() => setShowEmoji(true)} title="Emoji 🙂">
                        <FaRegSmile />

                        <span className="announcement--elements" ref={ref} style={{ bottom: 0, right: 0 }}>
                            <EmojiPicker
                                open={showEmoji && (!loading.main || !loading.message)}
                                height={360}
                                searchDisabled
                                skinTonesDisabled
                                reactionsDefaultOpen={false}
                                onEmojiClick={(value) => setMessage(prevMessage => prevMessage += value?.emoji)}
                            />
                        </span>
                    </span>
                </span>
                <button
                    className="page--btn filled"
                    disabled={loading.main || loading.message}
                    style={{ marginLeft: "auto" }}
                    onClick={handleSendAnnouncement}
                >
                    {loading?.message ? (
                        <SpinnerMini size={20} stroke={3} color="#fff" />
                    ) : (
                        <React.Fragment>
                            <LuSend /> Send
                        </React.Fragment>
                    )}
                </button>
            </div>

            <div ref={endRef} />
        </div>
    )
}

import { useAuthContext } from "../../context/AuthContext";
import type { AnnouncementType } from "../../utils/types";
import { formatDateTime } from "../../utils/helper";


export default function AnnouncementChatDisplay({ data }: { data: AnnouncementType }) {
    const { auth } = useAuthContext();

    return (
        <div key={data?.id} className={`${data?.user_id === (auth?.id && +auth?.id) ? "admin--chat" : "thridparty--chat"}`}>
            <span className="chat--top">
                <p className="title">Admin (You)</p>
                <span className="date">{formatDateTime(data?.created_at)}</span>
            </span>

            {(data?.attachments && data?.attachments?.length > 0) && (
                <div className="chat--attachments">
                    {(data?.attachments?.map((attached, i) => (
                        <img src={attached?.url} alt={attached?.public_id} key={i} />
                    )))}
                </div>
            )}

            <div className="chat--content">
                <p className="content">{data?.content}</p>
            </div>
        </div>
    )
}

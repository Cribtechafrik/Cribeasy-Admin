import { useBroadcastNotification } from "../../hooks/useBroadcastNotification"

export default function index() {
    useBroadcastNotification();

    return (
        <div className="">
            <p>Notification</p>
        </div>
    )

}

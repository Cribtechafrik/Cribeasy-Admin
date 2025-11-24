import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import Pusher from "pusher-js";
import type { NotificationType } from "../utils/types";
import { toast } from "sonner";
// import Echo from "laravel-echo";
// import axios from "axios"

declare global {
	interface Window {
		Echo: any;
		Pusher: any;
	}
}

export function useBroadcastNotification() {
	const { auth, token, headers, shouldKick } = useAuthContext();
	const [newNotification, setNewNotification] = useState<NotificationType[] | NotificationType>();
	const [notificationCount, setNotificationCount] = useState(0);

	const handleFetchNotificationCount = async function() {
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/unread-count`, {
				method: "GET",
				headers,
			});
			shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
				throw new Error(data?.error?.message);
			}

			setNotificationCount(data?.data || 0);
		} catch (err: any) {
			setNotificationCount(0);
		}
	}

	useEffect(() => {
		if (auth?.id) {
			const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
				cluster: "mt1",
				wsHost: import.meta.env.VITE_REVERB_HOST,
				wsPort: import.meta.env.VITE_REVERB_PORT,
				forceTLS: true,
				enabledTransports: ["ws"],
				authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
				auth: {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Accept': 'application/json',
					}
				},
			});

			pusher.connection.bind("connected", () => {
				console.log("Pusher connected!")
			});

			pusher.connection.bind('disconnected', () => {
                console.log('⚠ WebSocket disconnected', 'warning');
            });

			pusher.connection.bind('error', (err: any) => {
                console.log(`❌ Connection error: ${JSON.stringify(err)}`, 'error');
            });

			pusher.connection.bind('state_change', (states: any) => {
                console.log(`🔄 State: ${states.previous} → ${states.current}`, 'info');
            });

			const channel = pusher.subscribe(`private-admins.${auth?.id}`);
			// const channelName = `private-admins.${auth?.id!}`;
            // console.log(`📡 Subscribing to: ${channelName}`, 'info');

            // const channel = pusher.subscribe(channelName);

			channel.bind("pusher:subscription_succeeded", () => {
				console.log("subscribed successfully");
			});

			channel.bind('pusher:subscription_error', (status: any) => {
                console.log(`❌ Subscription error: ${JSON.stringify(status)}`, 'error');

                // if (status.status === 403) {
                //     console.log('💡 403 Error - Check routes/channels.php authorization', 'warning');
                // }
            });

			channel.bind(`admin.notification`, (data?: any) => {
				console.log("🔔 admin.notification received", 'success');
				toast.success("New Notification");
				// console.log(data);

				if (Array.isArray(data)) {
					setNewNotification([...data]);
				} else {
					setNewNotification(data);
				}

				handleFetchNotificationCount();
			});

			channel.bind_global((eventName: any) => {
                if (!eventName.startsWith('pusher:')) {
                    console.log(`📨 Event: ${eventName}`, 'info');
                }
         	});
		}

	}, [auth?.id]);


	// count the notification
	useEffect(function() {
		handleFetchNotificationCount();
	}, [newNotification]);

	return { incomingNotification: newNotification, notificationCount, handleFetchNotificationCount }
}
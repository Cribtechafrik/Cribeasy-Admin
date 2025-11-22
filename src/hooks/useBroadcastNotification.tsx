import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import Pusher from "pusher-js";
import type { NotificationType } from "../utils/types";
// import Echo from "laravel-echo";
// import axios from "axios"

declare global {
	interface Window {
		Echo: any;
		Pusher: any;
	}
}

export function useBroadcastNotification() {
  const { auth, token } = useAuthContext();
  const [newNotification, setNewNotification] = useState<NotificationType[] | []>([])

	useEffect(() => {
		// if (auth?.id) {
			// window.Pusher = Pusher;

			// window.Echo = new Echo({
			// 	broadcaster: "reverb",
			// 	key: import.meta.env.VITE_REVERB_APP_KEY,
			// 	wsHost: import.meta.env.VITE_REVERB_HOST,
			// 	wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
			// 	wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
			// 	forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
			// 	enabledTransports: ["ws", "wss"],
            //     authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
            //     auth: {
            //         headers: {
            //             'Authorization': `Bearer ${token}`,
            //             'Accept': 'application/json',
            //             'Content-Type': 'application/json'
            //         }
            //     },
			// });
			
			// window.Echo.private(`admins.${auth.id}`).subscribed(() => {
			// 	console.log("✅ Successfully subscribed to notifications channel!", 'success');
			// });

            // window.Echo.private(`admins.${auth.id}`).error((error: any) => {
            //     console.log(`❌ Channel error: ${JSON.stringify(error)}`, 'error');
                
            //     if (error.type === 'AuthError') {
            //         console.log(`💡 Run "Test Auth First" to diagnose the issue`, 'error');
            //     }
            // });

            // window.Echo.private(`admins.${auth.id}`).notification((notification: any) => {
			// 	console.log(`🔔 Notification received: ${notification}`, 'success');
			// });
		// }
		
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
						// 'Content-Type': 'application/json',
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

                if (status.status === 403) {
                    console.log('💡 403 Error - Check routes/channels.php authorization', 'warning');
                }
            });

			channel.bind(`admin.notification`, (data?: any) => {
				// console.log("🔔 admin.notification received", 'success');

				console.log(data);
				setNewNotification([...data]);
			});

			channel.bind_global((eventName: any) => {
                if (!eventName.startsWith('pusher:')) {
                    console.log(`📨 Event: ${eventName}`, 'info');
                }
         	});
		}

	}, [auth?.id]);

	return { incomingNotification: newNotification }
}
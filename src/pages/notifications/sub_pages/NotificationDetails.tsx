import { useLocation } from "react-router-dom";

export default function NotificationDetails() {
  const location = useLocation();
  const { notification } = location.state || {};

  console.log(notification)


  return (
    <div>
      
    </div>
  )
}

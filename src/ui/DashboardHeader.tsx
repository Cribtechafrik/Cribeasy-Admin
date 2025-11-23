import { FiBell } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import IntialsImage from "../components/layout/IntialsImage";
import Logo from "../assets/logo/logo.png"
import { Link, useNavigate } from "react-router-dom";
import { RiMenu3Fill } from "react-icons/ri";
import { useAuthContext } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
import Dropdown from "../components/layout/Dropdown";
import { createPortal } from "react-dom";
import Spinner from "../components/elements/Spinner";
import { useDataContext } from "../context/DataContext";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useBroadcastNotification } from "../hooks/useBroadcastNotification";


export default function DashboardHeader() {
    const navigate = useNavigate();
    const { auth, headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(false)
    const [isShownDropdown, setIsShownDropdown] = useState(false);
    const { handleToggleSidemenu } = useDataContext();
    const { incomingNotification } = useBroadcastNotification();
    const [notificationCount, setNotificationCount] = useState(0);

    const handleToggleDropdown = function () {
        setIsShownDropdown(!isShownDropdown);
    }

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

            setNotificationCount(data?.data);
        } catch (err: any) {
            setNotificationCount(0);
        }
    }

    useEffect(function() {
        handleFetchNotificationCount();
    }, [incomingNotification]);

    return (
        <React.Fragment>
            {createPortal(
                loading && <Spinner />, document.body
            )}

            <header className='dashboard--header'>
                <span className="hamburger--icon" onClick={handleToggleSidemenu}>
                    <RiMenu3Fill />
                </span>
                <Link className="logo--container" to="/">
                    <img src={Logo} alt="CribEasy" className="logo--img" />
                </Link>

                <div className="nav--container">
                    <div className="nav--input">
                        <LuSearch />
                        <input type="text" placeholder="Search" />
                    </div>

                    <span className="nav--search">
                        <LuSearch />
                    </span>

                    <span className={`nav--notification ${notificationCount > 0 ? "notification" : ""}`} data-count={notificationCount > 0 ? (notificationCount >= 10 ? "10+" : notificationCount) : ""} onClick={() => navigate("/dashboard/notifications")}>
                        <FiBell />
                    </span>

                    <div className='nav--auth' onClick={handleToggleDropdown}>
                        <div className="auth--box" style={{ position: "relative" }}>
                            <IntialsImage />
                        </div>
                        <div className='auth--info'>
                            <p className='auth--name'>{`${auth?.first_name} ${auth?.last_name}`}</p>
                            <p className='auth--role'>{auth?.role}</p>
                        </div>

                        <MdOutlineKeyboardArrowDown style={{ alignSelf: "flex-start", marginTop: "0.28rem" }} />

                        {isShownDropdown && (
                            <Dropdown handleToggle={handleToggleDropdown} setLoading={setLoading} />
                        )}
                    </div>  
                </div> 
            </header>
        </React.Fragment>
    )
}
import { FiBell } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import IntialsImage from "../components/layout/IntialsImage";
import Logo from "../assets/logo/logo.png"
import { Link, useNavigate } from "react-router-dom";
import { RiMenu3Fill } from "react-icons/ri";
import { useAuthContext } from "../context/AuthContext";
import React, { useState } from "react";
import Dropdown from "../components/layout/Dropdown";
import { createPortal } from "react-dom";
import Spinner from "../components/elements/Spinner";
import { useDataContext } from "../context/DataContext";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useBroadcastNotification } from "../hooks/useBroadcastNotification";
import useGlobalSearch from "../hooks/useGlobalSearch";
import { AiOutlineClose } from "react-icons/ai";


export default function DashboardHeader() {
    const navigate = useNavigate();
    const { auth } = useAuthContext();
    const [loading, setLoading] = useState(false)
    const [isShownDropdown, setIsShownDropdown] = useState(false);
    const { handleToggleSidemenu } = useDataContext();
    const { notificationCount } = useBroadcastNotification();
    const { searchQuery, setSearchQuery, SearchDropdownUI, setShowsearched, showSearched } = useGlobalSearch();

    const handleToggleDropdown = function () {
        setIsShownDropdown(!isShownDropdown);
    }

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
                    <div className={`nav--input ${searchQuery ? "max" : ""}`} onClick={() => (!showSearched && searchQuery) ? setShowsearched(true) : setShowsearched(false)}>
                        <LuSearch />
                        <input type="text" placeholder="Search" onChange={(e) => setSearchQuery(e?.target?.value)} value={searchQuery} />

                        {searchQuery && (
                            <span className="form--input-box" onClick={() => {
                                setSearchQuery("")
                                setShowsearched(false);
                            }}>
                                <AiOutlineClose style={{ cursor: "pointer", color: "red" }} />
                            </span>
                        )}
                    </div>
                    {(showSearched && searchQuery) && <SearchDropdownUI />}

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
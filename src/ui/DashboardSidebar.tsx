import { Link, useLocation } from "react-router-dom";
import { MENU_ITEMS } from '../utils/data.tsx';
import { LuChevronRight } from "react-icons/lu";
import React from "react";
import { useWindowSize } from "react-use";
import { useDataContext } from "../context/DataContext.tsx";
import Overlay from "../components/layout/Overlay.tsx";
import { RiCloseFill } from "react-icons/ri";
import Logo from "../assets/logo/logo.png"


export default function DashboardSidebar() {
    const { width } = useWindowSize();
    const { pathname } = useLocation();
    console.log(pathname)
    const { isShowSidemenu, animateOut, handleToggleSidemenu } = useDataContext();

    const isHomeRoute = pathname === "/" || pathname === "/dashboard" || pathname === "/dashboard/"

    return (
        <React.Fragment>

            {width > 950 && (
                <div className='dashboard--menu'>
                    <ul className='menu--list'>
                        {MENU_ITEMS.map((item) => (
                            <Link className={`menu--item ${(item.title === "Dashboard" && isHomeRoute) || (item.title != "Dashboard" && pathname.includes(item.link)) ? "is-active" : ""}`} to={item.link} key={item.title}>
                                <span className='menu--icon'>{item.icon}</span>
                                <p className='menu--text'>{item.title}</p>
                                <LuChevronRight className="menu--arrow" />
                            </Link>
                        ))}
                    </ul>
                </div>
            )}


            {/* MOBILE MENU */}
            {(width <= 950 && isShowSidemenu) && (
                <React.Fragment>
                    {width >= 600 && <Overlay handleClose={handleToggleSidemenu} />}

                    <div className={`dashboard--sidemenu ${animateOut ? 'animate-out' : ''}`}>
                        <div className="">
                            <Link className="logo--container" to="/">
                                <img src={Logo} alt="CribEasy" className="logo--img" />
                            </Link>

                            <span className='hamburger--icon icon--box' onClick={handleToggleSidemenu}>
                                <RiCloseFill />
                            </span>
                        </div>

                        <ul className='menu--list'>
                            {MENU_ITEMS.map((item) => (
                                <Link className={`menu--item ${item.link === pathname || (item.title === "Dashboard" && isHomeRoute) ? "is-active" : ""}`} to={item.link} key={item.title}>
                                    <span className='menu--icon'>{item.icon}</span>
                                    <p className='menu--text'>{item.title}</p>
                                    <LuChevronRight className="menu--arrow" />
                                </Link>
                            ))}
                        </ul>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
}
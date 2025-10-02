import { Link, useLocation } from "react-router-dom";
import { MENU_ITEMS } from '../utils/data.tsx';
import { LuChevronRight } from "react-icons/lu";

export default function DashboardSidebar() {
    const { pathname } = useLocation();
    const isHomeRoute = pathname === "/" || pathname === "/dashboard" || pathname === "/dashboard/"

    return (
        <div className='dashboard--menu'>
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
    );
}
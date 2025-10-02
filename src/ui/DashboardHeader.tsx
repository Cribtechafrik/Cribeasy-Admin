import { FiBell } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import IntialsImage from "../components/layout/IntialsImage";
import Logo from "../assets/logo/logo.png"
import { Link } from "react-router-dom";
import { RiMenu3Fill } from "react-icons/ri";
import { useAuthContext } from "../context/AuthContext";


export default function DashboardHeader() {
    const { auth } = useAuthContext();

    const handleToggleSidemenu = function() {
        
    }

    const handleToggleDropdown = function() {

    }

    return (
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
                <span className="nav--notification">
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
                </div>  
            </div> 
        </header>
    )
}
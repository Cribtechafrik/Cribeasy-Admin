import { FiBell } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import IntialsImage from "../components/layout/IntialsImage";
import Logo from "../assets/logo/logo.png"
import { Link } from "react-router-dom";


export default function DashboardHeader() {

    const handleToggleDropdown = function() {

    }

    return (
        <header className='dashboard--header'>
            <Link className="logo--container" to="/">
                <img src={Logo} alt="CribEasy" className="logo--img" />
            </Link>

            <div className="nav--container">
                <div className="nav--input">
                    <LuSearch />
                    <input type="text" placeholder="Search" />
                </div>

                <span className="nav--notification">
                    <FiBell />
                </span>

                <div className='nav--auth' onClick={handleToggleDropdown}>
                    <div className="auth--box" style={{ position: "relative" }}>
                        <IntialsImage />
                    </div>
                    <div className='auth--info'>
                        <p className='auth--name'>Alex Ayo</p>
                        <p className='auth--role'>Administrator</p>
                    </div>
                </div>  
            </div> 
        </header>
    )
}
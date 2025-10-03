import React from "react";
import { toast } from "sonner";
import { useAuthContext } from "../../context/AuthContext";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { Link } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { HiUser } from "react-icons/hi";



interface Props {
    setLoading: (l: boolean) => void;
    handleToggle: () => void;
}

export default function Dropdown({ handleToggle, setLoading }: Props) {
    const { logout } = useAuthContext();
    const ref = useOutsideClick(handleToggle) as React.RefObject<HTMLDivElement>;

    const handleLogout = async function() {
        try {
            setLoading(true);
            const result = await logout() as string;
            console.log(result)

            if (result !== "Success") {
                throw new Error(result == "Failed to fetch" ? "Error logging out!" : result);
            }

			toast.success("Logout Successful!");
        } catch(err: any) {
            toast.error(err?.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="dropdown" ref={ref}>
            <Link className="dropdown--item" to='/dashboard/profile'><HiUser /> Profile</Link>
            <div className="dropdown--item" onClick={handleLogout}><IoLogOutOutline /> Logout</div>
        </div>
    )
}
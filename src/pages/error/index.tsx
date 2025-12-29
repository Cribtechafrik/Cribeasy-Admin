import { MdErrorOutline } from "react-icons/md";

export default function index() {
  return (
    <div className="error_container">
      <h4 className="error_heading">404 <MdErrorOutline /></h4>
      <p className="error_text">Sorry! That page you are trying to access cannot be found.</p>
    </div>
  )
}

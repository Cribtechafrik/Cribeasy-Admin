import { FaExclamationTriangle } from "react-icons/fa";

export default function ErrorComponent() {
  return (
    <div className="error--container">
        <FaExclamationTriangle />
        <p>Oops, Error!</p>
    </div>
  )
}

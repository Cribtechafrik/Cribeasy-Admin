import { Link } from "react-router-dom";
import Line from "../../../components/elements/Line";

export default function RecentPayments() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Recent Payments</h2>
                    <Link to="/dashboard/listings">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            {/* content here... */}
        </div>
    )
}

import Line from "../../../components/elements/Line";
import { Link } from "react-router-dom";

export default function RecentLstings() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Recent Listings</h2>
                    <Link to="/dashboard/listings">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            {/* content here... */}
        </div>
    )
}

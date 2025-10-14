import { Link } from "react-router-dom";
import Line from "../../../components/elements/Line";
import { BsDot } from "react-icons/bs";

const data = [
    {
        title: "New Listing",
        description: "John added a new property at 123 Beach Road",
        date: "2 hours ago"
    },
    {
        title: "inspection",
        description: "Property inspection scheduled for 456 Main Street",
        date: "2 hours ago"
    },
    {
        title: "Payment",
        description: "Received payment for Skyline Apartments",
        date: "2 hours ago"
    },
    {
        title: "Property update",
        description: "Updated amenities at Central Plaza",
        date: "2 hours ago"
    }
];

export default function RecentActivities() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    {/* <h2>Recent Activities</h2> */}
                    <h2>Activity Logs</h2>
                    <Link to="/">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            <div className="flex-col-1">
                {data.map((data, i) => (
                    <div className="activity--item" key={i}>
                        <span className="activity--icon"><BsDot /></span>

                        <div className="activity--info">
                            <p className="title">{data.title}</p>
                            <p className="description">{data.description}</p>
                        </div>

                        <span className="activity--date">{data.date}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

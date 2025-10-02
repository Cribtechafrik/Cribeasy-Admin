import Line from "../../../components/elements/Line";
import { Link } from "react-router-dom";
import dymmyImg from "../../../assets/dummy/2a7249718cadc35d8041e4241ab954c8e5c18733.jpg"

const data = [
    {
        img: dymmyImg,
        title: "Chandelier Luxury",
        location: "Victoria Island, Lagos.",
        amount: "₦800,450.00",
        period: "Annual"
    },
    {
        img: dymmyImg,
        title: "Chandelier Luxury",
        location: "Victoria Island, Lagos.",
        amount: "₦800,450.00",
        period: "Annual"
    },
    {
        img: dymmyImg,
        title: "Chandelier Luxury",
        location: "Victoria Island, Lagos.",
        amount: "₦800,450.00",
        period: "Annual"
    },
]

export default function RecentListings() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Recent Listings</h2>
                    <Link to="/dashboard/listings">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            <div className="flex-col-1">
                {data?.map((data, i) => (
                    <Link to={`/dashboard/listings/`} className="listing--item" key={i}>
                        <img src={data.img} alt={data.title} className="listing--img" />
                        
                        <div className="listing--info">
                            <p className="title">{data.title}</p>
                            <p className="description">{data.location}</p>
                        </div>

                        <div className="listing--info">
                            <span className="value">{data.amount}</span>
                            <p className="period">{data.period}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

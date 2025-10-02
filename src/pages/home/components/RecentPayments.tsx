import { Link } from "react-router-dom";
import Line from "../../../components/elements/Line";

const data = [
    {
        title: "Rent Payment",
        forDescription: "Chandelier Lucuxy",
        date: "Oct 15, 2023",
        amount: "₦800,450.00",
        tag: "completed",
    },
    {
        title: "Rent Payment",
        forDescription: "Chandelier Lucuxy",
        date: "Oct 15, 2023",
        amount: "₦800,450.00",
        tag: "completed",
    },
    {
        title: "Rent Payment",
        forDescription: "Chandelier Lucuxy",
        date: "Oct 15, 2023",
        amount: "₦800,450.00",
        tag: "pending",
    },
    {
        title: "Maintenance Fee",
        forDescription: "Chandelier Lucuxy",
        date: "Oct 15, 2023",
        amount: "₦800,450.00",
        tag: "completed",
    },
]

export default function RecentPayments() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Recent Payments</h2>
                    <Link to="/dashboard/payments">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            <div className="flex-col-1">
                {data.map((data, i) => (
                    <Link to={`/dashboard/payment/`} className="payment--item" key={i}>
                        <div className="payment--info">
                            <p className="title">{data.title}</p>
                            <p className="description">{data.forDescription}</p>
                            <p className="date">{data.date}</p>
                        </div>

                        <div className="payment--info">
                            <span className="value">{data.amount}</span>
                            <span className={`status status--${data.tag}`}>
                                <p>{data.tag}</p>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

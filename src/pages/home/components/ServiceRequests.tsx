import { Link } from "react-router-dom";
import { formatDateTime, hexToRgba } from "../../../utils/helper";

interface Props {
    value: number;
    valueColor?: string;
    data?: any[];
}

export default function ServiceRequests({ value, valueColor, data }: Props) {
  return (
    <div className="card">
        <div className="section--top">
            <div className="section--heading">
                <h2>Service Requests</h2>
                <span className="top--info" style={valueColor ? { color: valueColor, backgroundColor: `${hexToRgba(valueColor, "0.085")}` } : { color: "#454545", backgroundColor: "#eee" }}>{value} Today</span>
            </div>
        </div>

        <div className="task--group">
            {data ? data?.map((data: any, i) => (
                <Link to={`dashboard/artisans`} key={i} className="flex-align-justify-spabtw">
                    <div className="task-card">
                        <p className="title">{data?.service_name}</p>
                        <p className="description">{formatDateTime(data?.job_date)} - {data?.artisan?.first_name} {data?.artisan?.last_name}</p>
                    </div>
                </Link>
            )) : (
                <p className="no-data">No request yet!</p>
            )}
        </div>
    </div>
  )
}

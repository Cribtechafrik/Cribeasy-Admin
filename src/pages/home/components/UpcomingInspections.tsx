import { Link } from "react-router-dom";
import { formatTime, hexToRgba } from "../../../utils/helper";
import type { InspectionType } from "../../../utils/types";
import { BsChevronRight } from "react-icons/bs";

interface Props {
    value: number;
    valueColor?: string;
    data?: InspectionType[];
}

export default function UpcomingInspections({ value, valueColor, data }: Props) {
  return (
    <div className="card">
        <div className="section--top">
            <div className="section--heading">
                <h2>Upcoming Inspections</h2>
                <span className="top--info" style={valueColor ? { color: valueColor, backgroundColor: `${hexToRgba(valueColor, "0.085")}` } : { color: "#454545", backgroundColor: "#eee" }}>{value} Today</span>
            </div>
        </div>

        <div className="task--group">
            {data ? data?.map((data: InspectionType, i) => (
                <Link to={`/dashboard/inspections/${data?.id}`} className="flex-align-justify-spabtw" key={i}>
                    <div className="task-card">
                        <p  className="title">{data?.property_title}</p>
                        <span className="description">{formatTime(data?.starts_at)} - {data?.agent_first_name}</span>
                    </div>

                    <BsChevronRight />
                </Link>
            )) : (
                <p className="no-data">No inspections yet!</p>
            )}
        </div>
    </div>
  )
}

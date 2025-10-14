import { Link } from "react-router-dom";
import { hexToRgba } from "../../../utils/helper";

interface Props {
    title: string;
    value: string;
    valueColor?: string;
    link: string;
    data?: any[];
}

export default function TasksComponent({ title, value, valueColor, link, data }: Props) {
  return (
    <div className="card">
        <div className="section--top">
            <div className="section--heading">
                <h2>{title}</h2>
                <span className="top--info" style={valueColor ? { color: valueColor, backgroundColor: `${hexToRgba(valueColor, "0.085")}` } : { color: "#454545", backgroundColor: "#eee" }}>{value} Today</span>
            </div>
        </div>


        <div className="task--group">
            {data ? data?.map((data: any, i) => (
                <Link to={link} className="task-card" key={i}>
                    <p>{data?.title}</p>
                </Link>
            )) : (
                <p className="no-data">No {title} yet!</p>
            )}
        </div>
    </div>
  )
}

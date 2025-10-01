import { BiDotsVerticalRounded } from "react-icons/bi";
import Line from "../../../components/elements/Line";

export default function PropertyTypes() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Property Types</h2>
                    <span><BiDotsVerticalRounded /></span>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            {/* content here... */}
        </div>
    )
}

import Line from "../../../components/elements/Line";

export default function RevenueOverview() {
    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Revenue Overview</h2>
                    <select className="form--select">
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            {/* content here... */}
        </div>
    )
}

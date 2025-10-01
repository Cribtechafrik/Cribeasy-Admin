import Line from "../../../components/elements/Line";

export default function OccupancyRates() {

    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Occupancy Rates</h2>
                </div>

                <Line where="Top" value="1rem" />
            </div>
        
        </div>
    )
}

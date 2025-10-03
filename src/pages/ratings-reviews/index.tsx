import Breadcrumbs from "../../components/elements/Breadcrumbs";

const breadCrumbs = [
    { name: "Ratings & Reviews", isCurrent: true },
];

export default function index() {
    return (
        <section className="section--page">
            <div className="page--top">
                <div className="page--heading">
                    <h4 className="title">Ratings & Reviews</h4>
                    <Breadcrumbs breadcrumArr={breadCrumbs} />
                </div>
            </div>
        </section>
    )
}
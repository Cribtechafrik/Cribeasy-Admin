import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { PiExport } from "react-icons/pi";
import { AiOutlinePlus, AiOutlinePlusCircle } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LuCrown } from "react-icons/lu";
import { TiSpanner, TiUserOutline } from "react-icons/ti";
import { FiCheckCircle } from "react-icons/fi";
import FilterButton from "../../components/elements/FilterButton";


const breadCrumbs = [
    { name: "Artisans", isCurrent: true },
];

export default function index() {
    const [activeTab, setActiveTab] = useState("all");
    const data: any = [];

    const columns = [
        {
            name: "Artisans",
            selector: (row: any) => row?.name,
            minWidth: "16rem"
        },
        {
            name: "Email",
            selector: (row: any) => row?.name
        },
        {
            name: "Completed Jobs",
            selector: (row: any) => row?.name,
            minWidth: "16rem"
        },
        {
            name: "Plan",
            selector: (row: any) => row?.name
        },
        {
            name: "COMMUNITY",
            selector: (row: any) => row?.name
        },
        {
            name: "STATUS",
            selector: (row: any) => row?.name
        },
        {
            name: "ACTIONS",
            selector: (row: any) => row?.name
        },
    ];

	return (
		<section className="section--page">
			<div className="page--top">
				<div className="page--heading">
					<h4 className="title">Artisans</h4>
                    <Breadcrumbs breadcrumArr={breadCrumbs} />
				</div>

                <div className="flex-align-cen" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <Link to="/dashboard/Artisans/create" className="page--btn filled"><AiOutlinePlus /> Add new Artisans</Link>
                    <button className="page--btn outline"><PiExport /> Export</button>
                </div>
			</div>

            <div className="page--bottom">
                <select className="form--select">
                    <option>This Month</option>
                    <option>This Year</option>
                </select>

                <div className="insight--grid">
                    <InsightCard title="Total Artisans" value="0" icon={<TiSpanner />} />
                    <InsightCard title="Premium Artisans" value="0" icon={<FiCheckCircle  />} />
                    <InsightCard title="Free Plan Artisans" value="0" icon={<TiUserOutline />} />
                    <InsightCard title="New This Month" value="0" icon={<AiOutlinePlusCircle />} />
                </div>

                <FilterButton handleShowFilter={() => {}} />

                <div className="page--table">
                    <div className="page--tabs">
                        <span className={`page--tab ${activeTab == "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Artisans (0)</span>
                        <span className={`page--tab ${activeTab == "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>Active(0)</span>
                        <span className={`page--tab ${activeTab == "inactive" ? "active" : ""}`} onClick={() => setActiveTab("inactive")}>inactive (0)</span>
                        <span className={`page--tab ${activeTab == "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>pending (0)</span>
                    </div>
                    
                    <DataTable
                        data={data as any}
                        columns={columns as any}
                        responsive
                        pagination
                        paginationServer
                        persistTableHead
                        noDataComponent={
                            <EmptyTable
                                icon={<LuCrown />}
                                text="No Artisans yet. Click the “Add New Artisans” to create one and it will be displayed here"
                            />
                        }
                        customStyles={custom_styles as any}
                        pointerOnHover={false}
                        selectableRows={true}
                        progressPending={false}
                        progressComponent={<SpinnerMini />}
                        highlightOnHover={false}
                        paginationRowsPerPageOptions={[10]}
                        paginationComponentOptions={{
                            rowsPerPageText: "Limit Per Page",
                            rangeSeparatorText: 'Of',
                            selectAllRowsItem: false,
                        }}
                    />
                </div>
            </div>
		</section>
	);
}

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
import { HiOutlineUsers } from "react-icons/hi";
import { FaUser, FaUsers } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";


const breadCrumbs = [
    { name: "Agents", isCurrent: true },
];

export default function index() {
    const [activeTab, setActiveTab] = useState("all");
    const data: any = [];

    const columns = [
        {
            name: 'Agent ID',
            selector: (row: any) => row?.name,
        },
        {
            name: "Agent",
            selector: (row: any) => row?.name,
        },
        {
            name: "Email",
            selector: (row: any) => row?.name
        },
        {
            name: "Listings",
            selector: (row: any) => row?.name
        },
        {
            name: "Plan",
            selector: (row: any) => row?.name
        },
        {
            name: "Location",
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
					<h4 className="title">Agents</h4>
                    <Breadcrumbs breadcrumArr={breadCrumbs} />
				</div>

                <div className="flex-align-cen" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <Link to="/dashboard/agents/create" className="page--btn filled"><AiOutlinePlus /> Add new agent</Link>
                    <button className="page--btn outline"><PiExport /> Export</button>
                </div>
			</div>

            <div className="page--bottom">
                <select className="form--select">
                    <option>This Month</option>
                    <option>This Year</option>
                </select>

                <div className="insight--grid">
                    <InsightCard title="Total Agents" value="0" percentage="+0%" period="month" isIncrease={true} icon={<FaUsers />} />
                    <InsightCard title="Premium Agents" value="0" percentage="+0%" period="month" isIncrease={false} icon={<FiCheckCircle  />} />
                    <InsightCard title="Free Plan Agents" value="0" percentage="+0%" period="month" isIncrease={true} icon={<FaUser />} />
                    <InsightCard title="New This Month" value="0" percentage="+0%" period="month" isIncrease={false} icon={<AiOutlinePlusCircle />} />
                </div>

                <div className="page--option"></div>

                <div className="page--table">
                    <div className="page--tabs">
                        <span className={`page--tab ${activeTab == "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Agents (124)</span>
                        <span className={`page--tab ${activeTab == "premium" ? "active" : ""}`} onClick={() => setActiveTab("premium")}>Premium Agents (45)</span>
                        <span className={`page--tab ${activeTab == "free-plan" ? "active" : ""}`} onClick={() => setActiveTab("free-plan")}>Free Plan Agents (79)</span>
                        <span className={`page--tab ${activeTab == "inactive" ? "active" : ""}`} onClick={() => setActiveTab("inactive")}>Inactive Agents (0)</span>
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
                                icon={<HiOutlineUsers />}
                                text="No agents yet. Click the “Add New Agents” to create one and it will be displayed here"
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

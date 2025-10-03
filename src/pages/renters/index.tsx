import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { PiExport, PiUsersThree } from "react-icons/pi";
import { AiOutlinePlus, AiOutlinePlusCircle } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import { IoList } from "react-icons/io5";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers } from "react-icons/fa6";


const breadCrumbs = [
    { name: "Renters", isCurrent: true },
];

export default function index() {
    const [activeTab, setActiveTab] = useState("all");
    const data: any = [];

    const columns = [
        {
            name: 'PROPERTY ID',
            selector: (row: any) => row?.name,
        },
        {
            name: "PROPERTY TITLE",
            selector: (row: any) => row?.name,
            minWidth: "16rem"
        },
        {
            name: "Renter NAME",
            selector: (row: any) => row?.name
        },
        {
            name: "LOCATION",
            selector: (row: any) => row?.name
        },
        {
            name: "PRICE",
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
					<h4 className="title">Renters</h4>
                    <Breadcrumbs breadcrumArr={breadCrumbs} />
				</div>

                <div className="flex-align-cen" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <Link to="/dashboard/renters/create" className="page--btn filled"><AiOutlinePlus /> Add new Renter</Link>
                    <button className="page--btn outline"><PiExport /> Export</button>
                </div>
			</div>

            <div className="page--bottom">
                <select className="form--select">
                    <option>This Month</option>
                    <option>This Year</option>
                </select>

                <div className="insight--grid">
                    <InsightCard title="Total Renters" value="0" percentage="+0%" period="month" isIncrease={true} icon={<IoList />} />
                    <InsightCard title="Premium Renters" value="0" percentage="+0%" period="month" isIncrease={false} icon={<FaUsers />} />
                    <InsightCard title="Free Plan Renter" value="0" percentage="+0%" period="month" isIncrease={true} icon={<IoList />} />
                    <InsightCard title="New This Month" value="0" percentage="+0%" period="month" isIncrease={false} icon={<AiOutlinePlusCircle />} />
                </div>

                <div className="page--option"></div>

                <div className="page--table">
                    <div className="page--tabs">
                        <span className={`page--tab ${activeTab == "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Renter (0)</span>
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
                                icon={<PiUsersThree />}
                                text="No renters yet. Click the “Add New Renters” to create one and it will be displayed here"
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

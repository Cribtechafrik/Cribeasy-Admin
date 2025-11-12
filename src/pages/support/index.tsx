import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/elements/Breadcrumbs";
import InsightCard from "../../components/layout/InsightCard";
import { IoList, IoTicketSharp } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import type { Count, SupportTicketType } from "../../utils/types";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { FiCheckCircle } from "react-icons/fi";
import DataTable from "react-data-table-component";
import ErrorComponent from "../../components/layout/ErrorComponent";
import EmptyTable from "../../components/layout/EmptyTable";
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import { Intials } from "../../components/layout/IntialsImage";
import { TbTicket } from "react-icons/tb";

const breadCrumbs = [
    { name: "Support", isCurrent: true },
];

type SupportAnalyticsType = {
    open_issues: Count;
    pending_issues: Count;
    closed_issues: Count;
    total_issues: Count;
}

type TicketType = {
    id: string;
    ticket_id: string;
}

export default function index() {
    const { headers, shouldKick } = useAuthContext();
    
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);

    const [ticketsData, setTicketsData] = useState<TicketType[] | []>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<SupportAnalyticsType | null>(null);
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const columns = [
        {
            name: 'TICKET ID',
            selector: (row: SupportTicketType) => row?.reportID,
            minWidth: "16rem"
        },
        {
            name: "REQUESTER",
            selector: (row: SupportTicketType) => (
                <div className="table--profile" style={{ gap: "0.68rem" }}>
                    <Intials
                        hasImage={!!row?.requester_image}
                        imageUrl={row?.requester_image || ""}
                        names={row?.requester_name?.split(" ")}
                    />
                    <span className='table--info'>
                        <h3>{row?.requester_name}</h3>
                        <p>{row?.user_type}</p>
                    </span>
                </div>
            ),
            minWidth: "20rem"
        },
        {
            name: "SUBJECT",
            selector: (row: SupportTicketType) => row?.subject
        },
        {
            name: "CATEGORY",
            selector: (row: SupportTicketType) => row?.category
        },
        {
            name: "PRIORITY",
            selector: (row: SupportTicketType) => (
                <span className={`status status--${row?.priority}`}>
                    <p>{row?.priority}</p>
                </span>
            )
        },
        {
            name: "STATUS",
            selector: (row: SupportTicketType) => (
                <span className={`status status--${row?.status == "closed" ? "resolved" : row?.status}`}>
                    <p>{row?.status == "closed" ? "Resolved" : row?.status}</p>
                </span>
            )
        },
        {
            name: "ACTIONS",
            selector: (row: SupportTicketType) => (
                <Link to={`/dashboard/support-tickets/${row?.id}/details`} style={{ color: "#0088FF" }} className="table--action">Edit</Link>
            ),
        },
    ];

    const handleChangePage = (page: number) => {
        setPaginationDetails({ ...paginationDetails, currentPage: page });
    };

    const handleChangePerPage = (newPerPage: number) => {
        setPaginationDetails({ ...paginationDetails, perPage: newPerPage });
    };

    async function handleFetchAnalytics() {
        setError(false);
        setMainLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/reported-issues-analytics-card?period=all_time`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setAnalyticsSummary(data?.data?.summary)
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
            setError(true);
		} finally {
			setMainLoading(false);
		}
    }

    async function handleFetchTickets() {
        setTableLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/reported-issues`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setTicketsData(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
			setTableLoading(false);
		}
    }

    useEffect(function() {
        handleFetchAnalytics();
    }, []);

    useEffect(function() {
        handleFetchTickets();
    }, [paginationDetails?.currentPage, paginationDetails?.perPage ]);


    return (
        <React.Fragment>
            {mainLoading && <Spinner />}
            
            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Support</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>
                </div>

                <div className="page--bottom">
                    <div className="insight--grid">
                        <InsightCard title="All Tickets" value={analyticsSummary?.total_issues?.count ?? 0} icon={<IoTicketSharp />} />
                        <InsightCard title="Open Tickets" value={analyticsSummary?.open_issues?.count ?? 0} icon={<IoTicketSharp />} />
                        <InsightCard title="Resolved Tickets" value={analyticsSummary?.closed_issues?.count ?? 0} icon={<FiCheckCircle />} />
                        <InsightCard title="Pending Tickets" value={analyticsSummary?.pending_issues?.count ?? 0} icon={<IoList />} />
                    </div>


                    <div className="page--table" style={{ marginTop: "4rem" }}>
                        <DataTable
                            data={ticketsData as TicketType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                error ? (
                                    <ErrorComponent />
                                ) : (
                                    <EmptyTable
                                        icon={<TbTicket />}
                                        text={`No tickets yet. Click the "Create Ticket" to create one and it will be displayed here`}
                                    />
                                )
                            }
                            customStyles={custom_styles as any}
                            // clearSelectedRows={selectedRowIsCleared}
                            // onSelectedRowsChange={handleSelectedRow}
                            pointerOnHover={false}
                            selectableRows={true}
                            progressPending={tableLoading}
                            progressComponent={
                                <div className="table-spinner-container">
                                    <SpinnerMini />
                                </div>
                            }
                            highlightOnHover={false}
                            paginationRowsPerPageOptions={[10]}

                            paginationPerPage={paginationDetails?.perPage}
                            paginationDefaultPage={paginationDetails?.currentPage}
                            paginationTotalRows={paginationDetails?.totalCount}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangePerPage}
                            paginationComponentOptions={{
                                rowsPerPageText: "Limit Per Page",
                                rangeSeparatorText: 'Of',
                                selectAllRowsItem: false,
                            }}
                        />
                    </div>
                </div>
            </section>
        </React.Fragment>
    )
}
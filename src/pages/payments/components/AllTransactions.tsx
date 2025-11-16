import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import ErrorComponent from '../../../components/layout/ErrorComponent';
import EmptyTable from '../../../components/layout/EmptyTable';
import { TbCreditCard } from 'react-icons/tb';
import { custom_styles } from '../../../utils/contants';
import type { TransactionType } from '../../../utils/types';
import { SpinnerMini } from '../../../components/elements/Spinner';
import { useAuthContext } from '../../../context/AuthContext';
import { capAllFirstLetters, formatDate, formatNumber } from '../../../utils/helper';


export default function AllTransactions() {
    const { headers, shouldKick } = useAuthContext();

    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [userType, setUserType] = useState("");
    const [period, setPeriod] = useState("");
    const [status, setStatus] = useState("");
    const [paymentType, setPaymentType] = useState("");

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const columns = [
        {
            name: 'TRANSACTION ID',
            selector: (row: TransactionType) => row?.reference,
            minWidth: "14rem"
        },
        {
            name: "USER",
            selector: (row: TransactionType) => `${row?.user} (${row?.user_type})`,
            minWidth: "18rem"
        },
        {
            name: "TYPE",
            selector: (row: TransactionType) => (
                <span className="status status--open">
                    <p>{row?.transaction_type}</p>
                </span>
            ),
            minWidth: "18rem"
        },
        {
            name: "AMOUNT",
            selector: (row: TransactionType) => formatNumber(+row?.amount, 0) 
        },
        {
            name: "METHOD",
            selector: (row: TransactionType) => capAllFirstLetters(row?.transaction_category),
            minWidth: "12rem"
        },
        {
            name: "Date",
            selector: (row: TransactionType) => row?.paid_at ? formatDate(row?.paid_at) : "--"
        },
        {
            name: "STATUS",
            selector: (row: TransactionType) => (
                <span className={`status status--${row?.status}`}>
                    <p>{row?.status}</p>
                </span>
            ),
        },
    ];

    const handleChangePage = (page: number) => {
        setPaginationDetails({ ...paginationDetails, currentPage: page });
    };

    const handleChangePerPage = (newPerPage: number) => {
        setPaginationDetails({ ...paginationDetails, perPage: newPerPage });
    };


    async function handleFetchData() {
        setTableLoading(true);
        setError(false);

        const params = new URLSearchParams({
            ...(userType && { user_type: userType }),
            ...(status && { status: status }),
            ...(paymentType && { type: paymentType }),
            ...(period && { period: period }),
        });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments?${params.toString()}`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setTransactions(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
        } catch (err: any) {
            // const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            setError(true)
        } finally {
            setTableLoading(false);
        }
    }

    useEffect(function() {
        handleFetchData();
    }, [userType, paymentType, status, period]);

    return (
        <div className="page--table" style={{ marginTop: "3rem" }}>
            <div className="flex-align-justify-spabtw">
                <h4 className="table--title">All Transactions</h4>

                <div className="flex-align-cen" style={{ marginBottom: "2rem", gap: "1rem" }}>
                    <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ maxWidth: "10rem" }}>
                        <option selected value="">All Time</option>
                        <option value="month">Last 30 Days</option>
                        <option value="week">This Week</option>
                        <option value="annual">This Year</option>
                    </select>

                    <select className="form--select" value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option selected value="">All User Type</option>
                        <option value="artisan">artisan</option>
                        <option value="agent">agent</option>
                        <option value="landlord">landlord</option>
                        <option value="renter">renter</option>
                    </select>

                    <select className="form--select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option selected value="">All status</option>
                        <option value="reversed">Reversed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                    </select>

                    <select className="form--select" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={{ maxWidth: "12rem" }}>
                        <option selected value="">All Types</option>
                        <option value="Subscription">Subscription</option>
                        <option value="Payment">Payment</option>
                        <option value="Payment of Services">Payment of Services</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Quote Payment">Quote Payment</option>
                    </select>
                </div>
            </div>


            <DataTable
                data={transactions as TransactionType[]}
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
                            icon={<TbCreditCard />}
                            text="No transaction found!."
                        />
                    )
                }
                customStyles={custom_styles as any}
                pointerOnHover={false}
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
    )
}

import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import ErrorComponent from '../../../components/layout/ErrorComponent';
import EmptyTable from '../../../components/layout/EmptyTable';
import { TbCreditCard } from 'react-icons/tb';
import { custom_styles } from '../../../utils/contants';
import type { WithdrawalType } from '../../../utils/types';
import { SpinnerMini } from '../../../components/elements/Spinner';
import { useAuthContext } from '../../../context/AuthContext';
import { formatDate, formatNumber } from '../../../utils/helper';


export default function Withdrawals() {
    const { headers, shouldKick } = useAuthContext();

    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);
    const [withdrawals, setWithdrawals] = useState<WithdrawalType[]>([]);
    // const [status, setStatus] = useState("");

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const columns = [
        {
            name: 'WITHDRAWALS ID',
            selector: (row: WithdrawalType) => row?.reference,
            minWidth: "14rem"
        },
        {
            name: "ARTISAN",
            selector: (row: WithdrawalType) => (
                <div className='table--info'>
                    <h3>{row?.user}</h3>
                    <p>{row?.user_type}</p>
                </div>
            ),
            minWidth: "14rem"
        },
        {
            name: "AMOUNT",
            selector: (row: WithdrawalType) => formatNumber(+row?.amount, 0),
        },
        {
            name: "COMMISSIONS",
            selector: (row: WithdrawalType) => <p style={{ color: "#D47C1D" }}>{formatNumber(+row?.charge, 0)}</p>
        },
        {
            name: "NET PAID",
            selector: (row: WithdrawalType) => <p style={{ color: "#63A767" }}>{formatNumber(+row?.net_amount, 0)}</p>
        },
        {
            name: "BANK",
            selector: (row: WithdrawalType) => <p style={{ textTransform: "uppercase" }}>{row?.bank_name || "--"}</p>
        },
        {
            name: "Date",
            selector: (row: WithdrawalType) => row?.paid_at ? formatDate(row?.paid_at) : "--"
        },
        {
            name: "STATUS",
            selector: (row: WithdrawalType) => (
                <span className={`status status--${row?.status}`}>
                    <p>{row?.status}</p>
                </span>
            ),
        },
        {
            name: "ACTIONS",
            selector: (_: WithdrawalType) => (
                <div className="table--action">
                    <button className="table--btn success">Approved</button>
                    <button className="table--btn cancel">Reject</button>
                </div>
            )
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

        // const params = new URLSearchParams({
        //     ...(status && { status: status }),
        // });

        try {
            // const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-withdrawals?${params.toString()}`, {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-withdrawals`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setWithdrawals(data?.data);
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
    }, []);

    return (
        <div className="page--table" style={{ marginTop: "3rem" }}>
            <div className="flex-align-justify-spabtw">
                <h4 className="table--title">Withdrawals</h4>

                {/* <select className="form--select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option selected value="">All status</option>
                    <option value="reversed">Reversed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
                </select> */}
            </div>

            <DataTable
                data={withdrawals as WithdrawalType[]}
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

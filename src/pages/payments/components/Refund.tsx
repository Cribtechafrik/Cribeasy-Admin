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


export default function Refund() {
    const { headers, shouldKick } = useAuthContext();

    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);
    const [withdrawals, setRefund] = useState<WithdrawalType[]>([]);

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

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-withdrawals`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setRefund(data?.data);
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
            <h4 className="table--title">Refunds</h4>

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

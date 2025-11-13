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


export default function RecentPaymentAtivities() {
    const { headers, shouldKick } = useAuthContext();

    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);
    const [recentPaymentData, setRecentPaymentData] = useState<TransactionType[]>([]);

    const columns = [
        {
            name: 'TRANSACTION ID',
            selector: (row: TransactionType) => row?.reference,
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
            name: "Amount",
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


    async function handleFetchData() {
        setTableLoading(true);
        setError(false);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/recent-payments`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setRecentPaymentData(data?.data);
		} catch (err: any) {
			// const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            setError(true)
		} finally {
			setTableLoading(false);
		}
    }

    useEffect(function() {
        handleFetchData();
    }, [])

    return (
        <div className="page--table" style={{ marginTop: "4rem", gap: "2rem" }}>
            <h4 className="table--title">Recent Activities</h4>
            <DataTable
                data={recentPaymentData as TransactionType[]}
                columns={columns as any}
                responsive
                persistTableHead
                noDataComponent={
                    error ? (
                        <ErrorComponent />
                    ) : (
                        <EmptyTable
                            icon={<TbCreditCard />}
                            text="No recent payment yet."
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
            />
        </div>
    )
}

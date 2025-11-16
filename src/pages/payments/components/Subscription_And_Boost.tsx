import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import ErrorComponent from '../../../components/layout/ErrorComponent';
import EmptyTable from '../../../components/layout/EmptyTable';
import { TbCreditCard } from 'react-icons/tb';
import { custom_styles } from '../../../utils/contants';
import type { Subscription_BoostType } from '../../../utils/types';
import { SpinnerMini } from '../../../components/elements/Spinner';
import { useAuthContext } from '../../../context/AuthContext';
import { formatDate, formatNumber } from '../../../utils/helper';


export default function Subscription_And_Boost() {
    const { headers, shouldKick } = useAuthContext();

    const [tableLoading, setTableLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState<Subscription_BoostType[]>([]);
    const [subType, setSubType] = useState("general");

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });


    const columns = [
        ...(subType === "boost" ? [
            {
                name: "LISTING",
                selector: (row: Subscription_BoostType) => row?.property_name
            },
        ] : []),
        {
            name: 'AGENT/LANDLORD',
            selector: (row: Subscription_BoostType) => row?.user,
            minWidth: "16rem"
        },
        ...(subType === "general" ? [
            {
                name: "PLAN",
                selector: (row: Subscription_BoostType) => row?.plan_name
            },
        ] : []),
        {
            name: "AMOUNT",
            selector: (row: Subscription_BoostType) => formatNumber(+row?.amount, 0) 
        },
        ...(subType === "boost" ? [
            {
                name: "DURATION",
                selector: (row: Subscription_BoostType) => row?.duration
            },
        ] : []),
        {
            name: "START",
            selector: (row: Subscription_BoostType) => row?.starts_at ? formatDate(row?.starts_at) : "--"
        },
        {
            name: "END",
            selector: (row: Subscription_BoostType) => row?.ends_at ? formatDate(row?.ends_at) : "--"
        },
        {
            name: "STATUS",
            selector: (row: Subscription_BoostType) => (
                <span className={`status status--${row?.status == "non-renewing" ? "open" : row?.status}`}>
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

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-subscriptions?type=${subType}`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setData(data?.data);
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
    }, [subType]);

    return (
        <div className="page--table" style={{ marginTop: "3rem" }}>
            <select className="form--select" value={subType} onChange={(e) => setSubType(e.target.value)} style={{ color: "#D47C1D", marginBottom: "2rem" }}>
                <option value="boost">Boost Payment</option>
                <option value="general">Premium Subscription</option>
            </select>

            <DataTable
                data={data as Subscription_BoostType[]}
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
                            text={`No ${subType === "general" ? "subscription" : "boostings"} found!.`}
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

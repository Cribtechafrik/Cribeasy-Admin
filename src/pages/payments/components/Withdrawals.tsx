import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import ErrorComponent from '../../../components/layout/ErrorComponent';
import EmptyTable from '../../../components/layout/EmptyTable';
import { TbCreditCard } from 'react-icons/tb';
import { custom_styles } from '../../../utils/contants';
import type { WithdrawalType } from '../../../utils/types';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { useAuthContext } from '../../../context/AuthContext';
import { formatDate, formatNumber, truncateString } from '../../../utils/helper';
import { createPortal } from 'react-dom';
import Confirm from '../../../components/modals/Confirm';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { ImEye, ImEyeBlocked } from 'react-icons/im';
import Asterisk from '../../../components/elements/Asterisk';
import { toast } from 'sonner';


export default function Withdrawals() {
    const { headers, shouldKick } = useAuthContext();

    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rejectionRemark, setRejectionRemark] = useState("");

    const [mainLoading, setMainLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState(false);
    const [withdrawals, setWithdrawals] = useState<WithdrawalType[]>([]);
    const [showModal, setShowModal] = useState({ approve_confirm: false, approve_completed: false, reject_confirm: false, reject_completed: false });
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalType | null>(null)

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const columns = [
        {
            name: 'WITHDRAWALS ID',
            selector: (row: WithdrawalType) => "#"+row?.reference,
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
            selector: (row: WithdrawalType) => (
                <div className="table--action">
                    <button className="table--btn success" disabled={row?.status !== "pending"} onClick={() => {
                        setSelectedWithdrawal(row)
                        setShowModal({ ...showModal, approve_confirm: true })
                    }}>Approved</button>
                    <button className="table--btn cancel" disabled={row?.status !== "pending"} onClick={() => {
                        setSelectedWithdrawal(row)
                        setShowModal({ ...showModal, reject_confirm: true })
                    }}>Reject</button>
                </div>
            ),
            minWidth: "18rem"
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

            setWithdrawals(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
        } catch (err: any) {
            setError(true)
        } finally {
            setTableLoading(false);
        }
    }

    useEffect(function() {
        handleFetchData();
    }, []);

    const handleCloseModal = function(key: string) {
        setShowModal({ ...showModal, [key]: false })
        setSelectedWithdrawal(null);
    }

    async function handleApproveWithdrawal() {
        if(!adminPassword) {
            toast.error("Password is Required!")
            return;
        }

        setMainLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/withdrawals/${selectedWithdrawal?.id}/approve`, {
                method: "POST",
                headers,
                body: JSON.stringify({ password: adminPassword })
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            setShowModal({ ...showModal, approve_confirm: false, approve_completed: true })
            handleFetchData();
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setMainLoading(false);
        }
    }

    async function handleRejectWithdrawal() {
        setMainLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/withdrawals/${selectedWithdrawal?.id}/reject`, {
                method: "POST",
                headers,
                body: JSON.stringify({ remark: rejectionRemark })
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            setShowModal({ ...showModal, approve_confirm: false, approve_completed: true })
            handleFetchData();
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setMainLoading(false);
        }
    }

    return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            {(showModal.approve_confirm && selectedWithdrawal?.id) && createPortal(
                <Confirm setClose={() => handleCloseModal("approve_confirm")}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Approve Withdrawal</h4>
                        <p className="modal--subtext">Are you sure you want to approve this withdrawal request?</p>

                        <div className="modal--list">
                            <p>Withdrawal ID: {truncateString(selectedWithdrawal?.reference, 15)}</p>
                            <p>Amount: {formatNumber(+selectedWithdrawal?.net_amount)}</p>
                            <p>Artisans: {selectedWithdrawal?.user}</p>
                        </div>

                        <div className="form--item">
                            <label htmlFor="password" className="form--label colored">Administrator Password <Asterisk /></label>
                            <div className="form--input-box">
                                <input type={showPassword ? "text" : "password"} name="password" id="password" className="form--input" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={adminPassword} onChange={(e) => setAdminPassword(e?.target?.value)} />
                                <div className='form--input-icon' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <ImEye /> : <ImEyeBlocked />}
                                </div>
                            </div>
                            <p className="sub-text" style={{ textAlign: "left" }}>For security purposes, please enter your admin password to confirm this action.</p>
                        </div>

                        <div className="flex-align-cen gap-2">
                            <button className="modal--btn blured" onClick={() => handleCloseModal("approve_confirm")}>No, Cancel</button>
                            <button className="modal--btn filled" onClick={handleApproveWithdrawal}>Yes, Approve</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.approve_completed && createPortal(
                <Confirm setClose={() => handleCloseModal("approve_completed")}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">Withdrawal Approved Successfully</h4>

                        <button className="modal--btn filled" onClick={() => handleCloseModal("approve_completed")}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}

            {(showModal.reject_confirm && selectedWithdrawal?.id) && createPortal(
                <Confirm setClose={() => handleCloseModal("reject_confirm")}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Reject Withdrawal</h4>
                        <p className="modal--subtext">Are you sure you want to reject this withdrawal request?</p>

                        <div className="form--item">
                            <textarea name="rejectionRemark" value={rejectionRemark} onChange={(e) => setRejectionRemark(e.target?.value)} placeholder="Enter Rejection Reason" className="form--input"></textarea>
                        </div>

                        <div className="flex-align-cen gap-2">
                            <button className="modal--btn blured" onClick={() => handleCloseModal("reject_confirm")}>No, Cancel</button>
                            <button className="modal--btn remove" onClick={handleRejectWithdrawal}>Reject</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.reject_completed && createPortal(
                <Confirm setClose={() => handleCloseModal("reject_completed")}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">Withdrawal Rejected Successfully</h4>

                        <button className="modal--btn filled" onClick={() => handleCloseModal("reject_completed")}>Go Back</button>
                    </div>
                </Confirm>, document.body
            )}

            <div className="page--table" style={{ marginTop: "3rem" }}>
                <div className="flex-align-justify-spabtw">
                    <h4 className="table--title">Withdrawals</h4>
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
        </React.Fragment>
    )
}

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import type { Agent_Landlord_Type } from '../../../utils/types';
import { toast } from 'sonner';
import Breadcrumbs from '../../../components/elements/Breadcrumbs';
import Spinner from '../../../components/elements/Spinner';

export default function Agents_Landloard_Details() {
    const { id } = useParams();
    // const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState({ modal: false, main: false })
    // const [showModal, setShowModal] = useState({ confirm: false, completed: false });
    const [agent_landlordData, setAgent_LandlordData] = useState<Agent_Landlord_Type | null>(null);

    const breadCrumbs = [
        { name: "Agents/Landloard", link: "/dashboard/agents-landlords" },
        { name: `${agent_landlordData?.full_name ?? "Details"}`, isCurrent: true },
    ];

    async function handleFetchData() {
        setLoading({ ...loading, main: true });
  
        try {
            const [agent_landloard_res] = await Promise.all([
                fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}?full=true`, {
                    method: "GET",
                    headers,
                }),
            ]);

            shouldKick(agent_landloard_res);
    
            const data = await agent_landloard_res.json();
            if (agent_landloard_res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            setAgent_LandlordData(data?.data);
             
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }
  
    useEffect(function() {
        handleFetchData();
    }, [id]);

    return (
        <React.Fragment>
            {loading.main && <Spinner />}
            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Agents/Landloard Details</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                </div>
            </section>
        </React.Fragment>
    )
}

import React, { useEffect, useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import { SpinnerMini } from "../components/elements/Spinner";
import type { Agent_Landlord_Type, InspectionType, ListingType, RenterType } from "../utils/types";
import Tab from "../components/elements/Tab";
import { useOutsideClick } from "./useOutsideClick";
import { MdLocationPin, MdOutlinePhone } from "react-icons/md";
import { IoBedOutline } from "react-icons/io5";
import { LuBath } from "react-icons/lu";
import { truncateString } from "../utils/helper";
import { Link } from "react-router-dom";
import { Intials } from "../components/layout/IntialsImage";
import { BsEnvelope } from "react-icons/bs";

export default function useGlobalSearch() {
    const { headers } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchMessage, setSearchMessage] = useState("");
    const [searchResult, setSearchResult] = useState<{
        agents: Agent_Landlord_Type[];
        inspections: InspectionType[];
        landlords: Agent_Landlord_Type[];
        properties: ListingType[];
        renters: RenterType[];
    }>({
        agents: [],
        inspections: [],
        landlords: [],
        properties: [],
        renters: [],
    });
    const [activeSearchTab, setActiveSearchTab] = useState("agents");
    const ref = useOutsideClick(() => setShow(false)) as React.RefObject<HTMLDivElement>

    const hasResults = Object.values(searchResult).some(arr => arr.length > 0);
    console.log(hasResults);

    useEffect(function() {
        const handleGlobalSearch = setTimeout(async function () {
            if (!searchQuery) return;

            setShow(true);
            setLoading(true);
                
            try {
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/global-search?query=${searchQuery?.toLowerCase()}`, {
                    method: "GET",
                    headers,
                });
                const data = await res.json();
                if(!data?.success && res.status !== 200) throw new Error(data?.message);

                setSearchMessage(data?.message);
                setSearchResult(data?.data)
            } catch(err: any) {
                if (err?.name !== "AbortError") {
                    return err?.message
                }
            } finally {
                setLoading(false);
            }
        }, 400)
  
        return () => clearTimeout(handleGlobalSearch);
  
    }, [searchQuery]);


    const SearchDropdownUI = function() {
        return (
            <div className="search--modal" ref={ref}>
                {loading && <SpinnerMini />}

                {(!loading && searchMessage && !hasResults) && (
                    <p className='no-data'>{searchMessage}</p>
                )}

                {(!loading && hasResults) && (
                    <div className='search--body'>
                        <div className="page--tabs">
                            <Tab title="Agents" onClick={() => setActiveSearchTab("agents")} active={activeSearchTab == "agents"} />
                            {/* <Tab title="Inspections" onClick={() => setActiveSearchTab("inspections")} active={activeSearchTab == "inspections"} /> */}
                            <Tab title="Landlords" onClick={() => setActiveSearchTab("landlords")} active={activeSearchTab == "landlords"} />
                            <Tab title="Properties" onClick={() => setActiveSearchTab("properties")} active={activeSearchTab == "properties"} />
                            <Tab title="Renters" onClick={() => setActiveSearchTab("renters")} active={activeSearchTab == "renters"} />
                        </div>

                        {activeSearchTab == "agents" && (
                            <React.Fragment>
                                {searchResult?.agents?.length > 0 ? (
                                    <div className="search--list">
                                        {searchResult?.agents?.map((agent, i) => (
                                            <Link className="search--item" key={i} to={`/dashboard/agents-landlords/${agent?.id}`}>
                                                <Intials
                                                    imageUrl={agent?.profile_image || ""}
                                                    hasImage={!!agent?.profile_image}
                                                    names={[agent?.first_name, agent?.last_name]}
                                                />
                                                <div className="search--details">
                                                    <h4 className="title">{agent?.first_name} {agent?.last_name}</h4>
                                                    <div className="flex-align-cen gap-1 description">
                                                        <span className="flex-align-cen"><BsEnvelope /> {agent?.email || "--"}</span>
                                                        <span className="flex-align-cen"><MdOutlinePhone /> {agent?.phone_number || "--"}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="no-data">No agents found with this query</span>
                                )}

                            </React.Fragment>
                        )}
                        {activeSearchTab == "inspections" && (
                            <React.Fragment>
                                {searchResult?.inspections?.length > 0 ? (
                                    <div className="search--list">
                                        {searchResult?.inspections?.map((inspection, i) => (
                                            <Link className="search--item" key={i} to={`/dashboard/inspections/${inspection?.id}`}>
                                                <img src="" alt="" />
                                                <div className="">

                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="no-data">No inspections found with this query</span>
                                )}

                            </React.Fragment>
                        )}
                        {activeSearchTab == "landlords" && (
                            <React.Fragment>
                                {searchResult?.landlords?.length > 0 ? (
                                    <div className="search--list">
                                        {searchResult?.landlords?.map((landlord, i) => (
                                            <Link className="search--item" key={i} to={`/dashboard/agents-landlords/${landlord?.id}`}>
                                                <Intials
                                                    imageUrl={landlord?.profile_image || ""}
                                                    hasImage={!!landlord?.profile_image}
                                                    names={[landlord?.first_name, landlord?.last_name]}
                                                />
                                                <div className="search--details">
                                                    <h4 className="title">{landlord?.first_name} {landlord?.last_name}</h4>
                                                    <div className="flex-align-cen gap-1 description">
                                                        <span className="flex-align-cen"><BsEnvelope /> {landlord?.email || "--"}</span>
                                                        <span className="flex-align-cen"><MdOutlinePhone /> {landlord?.phone_number || "--"}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="no-data">No landlords found with this query</span>
                                )}

                            </React.Fragment>
                        )}
                        {activeSearchTab == "properties" && (
                            <React.Fragment>
                                {searchResult?.properties?.length > 0 ? (
                                    <div className="search--list">
                                        {searchResult?.properties?.map((property, i) => (
                                            <Link className="search--item large" key={i} to={`/dashboard/listings?id=${property?.id}`}>
                                                <img src={property?.property_cover} alt={property?.property_title} className="img" />
                                                <div className="search--details large">
                                                    <h4 className="title">{property?.property_title}</h4>
                                                    <p className="description">{truncateString(property?.description, 70)}</p>
                                                    <div className="flex-align-cen gap-1 description">
                                                        <span className="flex-align-cen"><MdLocationPin /> {property?.property_detail?.property_address || "--"}</span>
                                                        <span className="flex-align-cen"><IoBedOutline /> {property?.property_detail?.bathrooms || 0}</span>
                                                        <span className="flex-align-cen"><LuBath /> {property?.property_detail?.bedrooms || 0}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="no-data">No properties found with this query</span>
                                )}

                            </React.Fragment>
                        )}
                        {activeSearchTab == "renters" && (
                            <React.Fragment>
                                {searchResult?.renters?.length > 0 ? (
                                    <div className="search--list">
                                        {searchResult?.renters?.map((renter, i) => (
                                            <Link className="search--item" key={i} to={`/dashboard/renters?id=${renter?.id}`}>
                                                <Intials
                                                    imageUrl={renter?.profile_image || ""}
                                                    hasImage={!!renter?.profile_image}
                                                    names={[renter?.first_name, renter?.last_name]}
                                                />
                                                <div className="search--details">
                                                    <h4 className="title">{renter?.first_name} {renter?.last_name}</h4>
                                                    <div className="flex-align-cen gap-1 description">
                                                        <span className="flex-align-cen"><BsEnvelope /> {renter?.email || "--"}</span>
                                                        <span className="flex-align-cen"><MdOutlinePhone /> {renter?.phone_number || "--"}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="no-data">No renters found with this query</span>
                                )}

                            </React.Fragment>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return { searchQuery, setSearchQuery, SearchDropdownUI, showSearched: show, setShowsearched: setShow }
}

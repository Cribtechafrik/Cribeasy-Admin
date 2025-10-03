import React from "react";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";

interface Props {
    breadcrumArr: {
        name: string;
        link?: string;
        isCurrent?: boolean;
    }[];
}

export default function Breadcrumbs({ breadcrumArr }: Props) {
    return (
        <div className="breadcrums">
            <Link to="/dashboard">Dashboard</Link>
            <BsChevronRight />

            {breadcrumArr?.map((el, i) => (
                <React.Fragment key={i}>
                    {el.isCurrent ? (
                        <p className="current">{el.name}</p>
                    ) : (el.link) && (
                        <>
                            <Link to={el.link}>{el.name}</Link>
                            <BsChevronRight />
                        </>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

import React from "react";
import { getPages } from "../../utils/helper";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";


interface Props {
    paginationDetails: {
        currentPage: number,
        perPage: number,
        totalCount: number,
		lastPage: number,
    };
    setPaginationDetails: (item: {
        currentPage: number,
        perPage: number,
        totalCount: number,
        lastPage: number,
    }) => void;
}

export default function Pagination({ paginationDetails, setPaginationDetails }: Props) {
	const page = Number(paginationDetails?.currentPage) || 1;

	return (
		<div className="pagination">
			<button onClick={() => setPaginationDetails({...paginationDetails, currentPage: paginationDetails.currentPage - 1 })} disabled={paginationDetails?.lastPage == 1} className="pagination_btn">
				<IoChevronBackSharp />
			</button>
			{getPages(paginationDetails?.lastPage, page).map((p: any, i: number) => (
				<React.Fragment key={i}>
					{p === "..." ? (
						<div className="pagination_el">...</div>
					) : (
						<span className={`pagination_el ${p === page ? "active" : ""} value `} onClick={() => setPaginationDetails({...paginationDetails, currentPage: p })}>
							{p}
						</span>
					)}
				</React.Fragment>
			))}
			<button onClick={() => setPaginationDetails({...paginationDetails, currentPage: paginationDetails.currentPage + 1 })} disabled={paginationDetails?.lastPage <= page} className="pagination_btn">
				<IoChevronForwardSharp />
			</button>
		</div>
	);
}

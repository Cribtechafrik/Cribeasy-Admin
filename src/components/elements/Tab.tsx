import React from "react";

interface Props {
	title: React.ReactNode | string;
	onClick: () => void;
	active: boolean;
}

export default function Tab({ title, onClick, active }: Props) {
	return (
		<span className={`page--tab ${active ? "active" : ""}`} onClick={onClick}>
			{title}
		</span>
	);
}

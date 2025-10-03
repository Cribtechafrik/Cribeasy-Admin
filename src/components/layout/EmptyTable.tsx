import React from "react";

interface Props {
    text?: string;
    icon?: React.ReactElement | null;
}

export default function EmptyTable({ text, icon }: Props) {
	return (
		<div className="empty--box">
			<span>{icon}</span>
			<p>{text}</p>
		</div>
	);
}
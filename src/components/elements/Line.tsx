import React from "react";
import { capAllFirstLetters } from "../../utils/helper";

interface Props {
	where?: string | null;
	value?: number | string;
	border?: number;
	color?: string;
}

export default function Line({ where = null, value = 0, border = 1.24, color = "#eeeff1" } : Props) {

	const customStyle = {
		...(where ? { [`margin${capAllFirstLetters(where)}`]: value } : {}),
		borderTop: `${border}px solid ${color}`,
	};

	return <div className="line" style={customStyle as React.CSSProperties} />;
}

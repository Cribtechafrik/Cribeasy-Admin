interface Props {
	title: string;
	icon: React.ReactElement;
	value: number | string;
	// percentage: string;
	// isIncrease: boolean;
	// period: string;
}

export default function InsightCard({ title, icon, value /*percentage, isIncrease, period*/ }: Props) {
	return (
		<div className="insight--card">
			<div className="insight--top">
				<p className="insight--title">{title}</p>
				<span className="insight--icon">{icon}</span>
			</div>

			<span className="insight--value">{value}</span>

			{/* <span className="flex-align-cen insight--extra">
            <p style={{ color: isIncrease ? "green" : "red" }}>{percentage}</p>
            <span>vs last {period}</span>
        </span> */}
		</div>
	);
}

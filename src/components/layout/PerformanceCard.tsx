interface Props {
    title: string;
    icon: React.ReactElement;
    value: number | string;
	subText?: string
}

export default function PerformanceCard({ title, icon, value, subText }: Props) {
	return (
		<div className="insight--card" style={{ alignItems: "center", gap: "0.68rem" }}>
			<span className="insight--icon">{icon}</span>
			<span className="insight--value">{value}</span>
            <p className="insight--title">
				{title}
				{subText && <p className="sub-text">{subText}</p>}
			</p>
		</div>
	);
}

export function PerformanceCardSm({ title, icon, value }: Props) {
	return (
		<div className="insight--card" style={{ padding: "1.2rem" }}>
            <div className="flex-align-cen">
			    <span className="insight--icon">{icon}</span>
				<p className="insight--title">{title}</p>
            </div>
			<span className="insight--value">{value}</span>
		</div>
	);
}

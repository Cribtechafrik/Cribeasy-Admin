import { BsClock } from "react-icons/bs";
import { RiDeleteBin2Line } from "react-icons/ri";

type InspectionScheduleType = {
    date: string;
    day: string;
    timeSlots: { start: string; end: string; }[];
}

interface Props {
	schedules: InspectionScheduleType[];
    handleRemoveSchedule: (i: number) => void;
}

export default function ScheduleTable({ schedules, handleRemoveSchedule }: Props) {

    if (schedules.length === 0) {
        return <></>
    }

	return (
        <div style={styles.grid}>
			{schedules.map((schedule: InspectionScheduleType, index: number) => (
				<div key={index} style={styles.dayColumn as React.CSSProperties}>
					<button style={styles.removeButton as React.CSSProperties} onClick={() => handleRemoveSchedule(index)}>
						<RiDeleteBin2Line style={styles.removeIcon} />
					</button>

					<div style={styles.headerRow}>
						<div style={styles.dayLabel}>
							{schedule.day}, {schedule.date}
						</div>
						<div style={styles.headerLabels}>
							<div style={styles.headerLabel}>Start Time</div>
							<div style={styles.headerLabel}>End Time</div>
						</div>
					</div>

					<div style={styles.slotsContainer as React.CSSProperties}>
						{schedule.timeSlots.map((slot: { start: string; end: string }, slotIndex: number) => (
							<div key={slotIndex} style={styles.timeRow}>
								<div style={styles.timeSlot}>
									<BsClock style={styles.icon} />
									<span style={styles.timeText}>{slot.start}</span>
								</div>

								<span>-</span>

								<div style={styles.timeSlot}>
									<BsClock style={styles.icon} />
									<span style={styles.timeText}>{slot.end}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

const styles = {
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: "32px",
	},
	dayColumn: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		position: "relative",
	},
	headerRow: {
		borderBottom: "1px solid #e5e7eb",
		paddingBottom: "12px",
		padding: "12px",
	},
	dayLabel: {
		fontSize: "14px",
		fontWeight: "500",
		color: "#111827",
		marginBottom: "8px",
	},
	headerLabels: {
		display: "flex",
		gap: "12px",
	},
	headerLabel: {
		flex: 1,
		fontSize: "12px",
		color: "#6b7280",
		fontWeight: "500",
		display: "flex",
		justifyContent: "center",
	},
	slotsContainer: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		padding: "12px",
	},
	removeButton: {
		background: "none",
		border: "none",
		cursor: "pointer",
		padding: "2px",
		display: "flex",
		alignItems: "center",
		position: "absolute",
		top: "5px",
		right: "0"
	},
	removeIcon: {
		width: "16px",
		height: "16px",
		color: "#ef4444",
	},
	timeRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "12px",
		marginBottom: "8px",
	},
	timeSlot: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",

		padding: "4px",
		backgroundColor: "#f9fafb",
		borderRadius: "6px",
		border: "1px solid #e5e7eb",
	},
	icon: {
		width: "16px",
		height: "16px",
		color: "#9ca3af",
		flexShrink: 0,
	},
	timeText: {
		fontSize: "14px",
		color: "#4b5563",
	},
};

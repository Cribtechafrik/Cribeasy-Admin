interface Props {
	handleClose: () => void;
	custom?: React.CSSProperties;
}

export default function Overlay({ handleClose, custom }: Props) {
	return (
		<div className="global--overlay" role="presentation" style={custom} onClick={handleClose}>
			&nbsp;
		</div>
	);
}
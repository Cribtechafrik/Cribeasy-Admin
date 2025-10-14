import { FaCheck } from "react-icons/fa";

interface Props {
	setIsChecked?: (ic: boolean) => void;
	isChecked: boolean;
}

export default function CheckBoxInput({ setIsChecked, isChecked }: Props) {
	return (
		<div id="checkbox" className={isChecked ? "is-selected" : ""} onClick={setIsChecked ? () => setIsChecked(!isChecked) : () => {}}>
			{isChecked && <FaCheck />}
		</div>
	);
}

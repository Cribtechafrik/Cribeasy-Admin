
import moment from "moment";

export function formatNumber(amount: number, dec: number = 0) {
	return "₦" + Number(amount)
		.toFixed(dec)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 0;
}

export function todayDate() {
	return moment().format("dddd, MMMM Do YYYY");
}

export function getInitials(firstname: string, lastname: string): string {
	const firstInitial = firstname?.charAt(0);
	const secondInitial = lastname?.charAt(0);
	return `${firstInitial}${secondInitial}`;
}

export function capAllFirstLetters(str: string): string {
  return str?.split(' ')?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase())?.join(' ');
}

export function hexToRgba(hex: string, opacity: string) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
}


import moment from "moment";

export function formatNumber(amount: number, dec: number = 0) {
	return "₦" + Number(amount)
		.toFixed(dec)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 0;
}

export function formatTime(time: string): string {
	return moment(time, 'H:mm').format('h:mm A')
}

export function formatDate(date: string): string {
	return moment(date).format("MMM Do, YYYY");
}
export function formatDateWithDay(date: string): string {
	return moment(date).format("ddd. MMM Do YYYY");
}

export function todayDate(): string {
	return moment().format("dddd, MMMM Do, YYYY");
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


export function formatDateTime(dateTimeString: string): string {
	const momentDate = moment(dateTimeString);
	const now = moment();

	if (momentDate.isSame(now, 'day')) {
		return `Today, ${momentDate.format('h:mm A')}`;
	} else if (momentDate.isSame(now.add(1, 'days'), 'day')) {
		return `Tomorrow, ${momentDate.format('h:mm A')}`;
	} else if (momentDate.isSame(now.subtract(1, 'days'), 'day')) {
		return `Yesterday, ${momentDate.format('h:mm A')}`;
	} else if (momentDate.isBefore(now, 'day') && momentDate.isAfter(now.subtract(7, 'days'), 'day')) {
		return `Last ${momentDate.format('dddd')}, ${momentDate.format('h:mm A')}`;
	} else {
		return `${momentDate.format('dddd, MMM D, h:mm A')}`;
	}
}


export function getCurrentTime() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}


export function formatInputNumber(value: string) {
	return value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
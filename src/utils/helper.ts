
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

export function generateStars(averageStars: number) {
  let stars = '';
  let fullStars = Math.floor(averageStars);
  let hasHalfStar = averageStars % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars += '⭐️';
  }
  if (hasHalfStar) {
    stars += ''; 
  }

  return stars;
}

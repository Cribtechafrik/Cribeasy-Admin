import { AiOutlineThunderbolt } from "react-icons/ai";
import { BiSwim, BiUser } from "react-icons/bi";
import { BsBarChartLine } from "react-icons/bs";
import { FaDumbbell, FaWifi } from "react-icons/fa";
import { FaToiletPortable } from "react-icons/fa6";
import { GoGear, GoShieldCheck } from "react-icons/go";
import {} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight, HiOutlineUsers, HiOutlineStar } from "react-icons/hi2";
import { IoGrid, IoList, IoWaterOutline } from "react-icons/io5";
import { LuCircleParking, LuCrown, LuSearch } from "react-icons/lu";
import { MdBalcony, MdOutlineKitchen, MdOutlinePets } from "react-icons/md";
import { RiCouponLine } from "react-icons/ri";
import { TbAirConditioning, TbCreditCard, TbUsersGroup } from "react-icons/tb";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";

export const MENU_ITEMS = [
	{
		title: "Dashboard",
		link: "/",
		icon: <IoGrid />,
	},
	{
		title: "Listings",
		link: "/dashboard/listings",
		icon: <IoList />,
	},
	{
		title: "Agents/Landlord",
		link: "/dashboard/agents-landlords",
		icon: <HiOutlineUsers />,
	},
	{
		title: "Artisans",
		link: "/dashboard/artisans",
		icon: <LuCrown />,
	},
	{
		title: "Inspection",
		link: "/dashboard/inspection",
		icon: <LuSearch />,
	},
	{
		title: "Renters",
		link: "/dashboard/renters",
		icon: <BiUser />,
	},
	{
		title: "Payments",
		link: "/dashboard/payments",
		icon: <TbCreditCard />,
	},
	{
		title: "Settings",
		link: "/dashboard/settings",
		icon: <GoGear />,
	},
	{
		title: "Support",
		link: "/dashboard/support",
		icon: <HiOutlineChatBubbleLeftRight />,
	},
	{
		title: "Community",
		link: "/dashboard/community",
		icon: <TbUsersGroup />,
	},
	{
		title: "Analytics",
		link: "/dashboard/analytics",
		icon: <BsBarChartLine />,
	},
	{
		title: "Ratings & Reviews",
		link: "/dashboard/ratings-reviews",
		icon: <HiOutlineStar />,
	},
	// {
	//     title: "Notifications",
	//     link: "/dashboard/notifications",
	//     icon: <IoNotificationsOutline />
	// },
	{
		title: "Coupons",
		link: "/dashboard/coupons",
		icon: <RiCouponLine />,
	},
];

export const amenities = [
	{
		title: "24/7 Security",
		icon: <GoShieldCheck />,
	},
	{
		title: "Clean water supply",
		icon: <IoWaterOutline />,
	},
	{
		title: "Constant power supply",
		icon: <AiOutlineThunderbolt />,
	},
	{
		title: "Air conditioning",
		icon: <TbAirConditioning />,
	},
	{
		title: "Fitted kitchen",
		icon: <MdOutlineKitchen />,
	},
	{
		title: "Built-in wardrobe",
		icon: <FaToiletPortable />,
		// icon: <LuTableCellsMerge />,
	},
	{
		title: "Parking Space",
		icon: <LuCircleParking />,
	},
	{
		title: "Balcony",
		icon: <MdBalcony />,
	},
	{
		title: "Swimming pool",
		icon: <BiSwim />,
	},
	{
		title: "Pet-friendly",
		icon: <MdOutlinePets />,
	},
	{
		title: "Gym",
		icon: <FaDumbbell />,
	},
	{
		title: "WiFi",
		icon: <FaWifi />,
	},
];

export function generateStars(averageStars: number, totalStars = 5) {
	let stars = [];
	let fullStars = Math.floor(averageStars);
	let hasHalfStar = averageStars % 1 >= 0.5;

	for (let i = 0; i < fullStars; i++) {
		stars.push(<IoIosStar className="rating-star" key={`full-${i}`} />);
	}
	if (hasHalfStar) {
		stars.push(<IoIosStarHalf className="rating-star" key="half" />);
	}

	// add empty stars
	for (let i = Math.ceil(averageStars) + (hasHalfStar ? 1 : 0); i < totalStars; i++) {
		stars.push(<IoIosStarOutline className="rating-star" key={`empty-${i}`} />);
	}

	return stars;
}


import { BiUser } from "react-icons/bi";
import { BsBarChartLine } from "react-icons/bs";
import { GoGear } from "react-icons/go";
import {  } from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight, HiOutlineUsers, HiOutlineStar } from "react-icons/hi2";
// import { IoGrid, IoList, IoNotificationsOutline } from "react-icons/io5";
import { IoGrid, IoList } from "react-icons/io5";
import { LuCrown, LuSearch } from "react-icons/lu";
import { RiCouponLine } from "react-icons/ri";
import { TbCreditCard, TbUsersGroup } from "react-icons/tb";


export const MENU_ITEMS = [
    {
        title: "Dashboard",
        link: "/",
        icon: <IoGrid />
    },
    {
        title: "Listings",
        link: "/dashboard/listings",
        icon: <IoList />
    },
    {
        title: "Agents",
        link: "/dashboard/agents",
        icon: <HiOutlineUsers />
    },
    {
        title: "Artisants",
        link: "/dashboard/artisants",
        icon: <LuCrown />
    },
    {
        title: "Inspection",
        link: "/dashboard/inspection",
        icon: <LuSearch />
    },
    {
        title: "Renters",
        link: "/dashboard/renters",
        icon: <BiUser />
    },
    {
        title: "Payments",
        link: "/dashboard/payments",
        icon: <TbCreditCard />
    },
    {
        title: "Settings",
        link: "/dashboard/settings",
        icon: <GoGear />
    },
    {
        title: "Support",
        link: "/dashboard/support",
        icon: <HiOutlineChatBubbleLeftRight />
    },
    {
        title: "Community",
        link: "/dashboard/community",
        icon: <TbUsersGroup />
    },
    {
        title: "Analytics",
        link: "/dashboard/analytics",
        icon: <BsBarChartLine />
    },
    {
        title: "Ratings & Reviews",
        link: "/dashboard/ratings-reviews",
        icon: <HiOutlineStar />
    },
    // {
    //     title: "Notifications",
    //     link: "/dashboard/notifications",
    //     icon: <IoNotificationsOutline />
    // },
    {
        title: "Coupons",
        link: "/dashboard/coupons",
        icon: <RiCouponLine />
    },
]

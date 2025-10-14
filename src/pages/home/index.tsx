
import InsightCard from '../../components/layout/InsightCard';
import real_estate from "../../assets/svgs/real-estate.svg";
import home_line from "../../assets/svgs/home-line.svg";
import currency_naira from "../../assets/svgs/currency-naira.svg";
import { MdOutlineRealEstateAgent } from 'react-icons/md';
import RevenueOverview from './components/RevenueOverview'
// import OccupancyRates from './components/OccupancyRates'
import RecentLstings from './components/RecentListings'
import RecentActivities from './components/RecentActivities'
// import RecentPayments from './components/RecentPayments'
import PropertyType from './components/PropertyTypes';
import { useAuthContext } from '../../context/AuthContext';
import "./home.css";


export default function index() {
    const { auth } = useAuthContext();

    return (
        <section className="home--section">
            <div className="home--top">
                <div className="top--heading">
                    <span className='title'>Welcome back, {auth?.first_name}!</span>
                    <p className='text'>Here's what's happeneing here today</p>
                </div>

                <select className="form--select">
                    <option>This Month</option>
                    <option>This Year</option>
                </select>
            </div>

            <main className="home--content">
                <div className="insight--grid">
                    <InsightCard
                        title="Total Properties"
                        icon={<img src={real_estate} />}
                        value="1,284"
                        percentage="+12.5%"
                        isIncrease={true}
                        period="month"
                    />
                    <InsightCard
                        title="Published Listings"
                        icon={<img src={home_line} />}
                        value="768"
                        percentage="+8.5%"
                        isIncrease={false}
                        period="month"
                    />
                    <InsightCard
                        title="Total Revenue"
                        icon={<img src={currency_naira} />}
                        value="₦543,624,432"
                        percentage="+12.5%"
                        isIncrease={true}
                        period="month"
                    />
                    <InsightCard
                        title="Average Occupancy"
                        icon={<MdOutlineRealEstateAgent />}
                        value="87%"
                        percentage="+8.2%"
                        isIncrease={false}
                        period="month"
                    />
                </div>

                <div className='home--grid'>
                    <div className="grid--left">
                        <RevenueOverview />
                        <RecentActivities />

                        {/* <div className="home--flex">
                            <OccupancyRates />
                            <RecentLstings />
                        </div>
                        <RecentActivities /> */}
                    </div>

                    <div className="grid--right">
                        <PropertyType />
                        {/* <RecentPayments /> */}
                        <RecentLstings />
                    </div>
                </div>
            </main>
        </section>
    )
}

import InsightCard from '../../components/layout/InsightCard';
import real_estate from "../../assets/svgs/real-estate.svg";
import home_line from "../../assets/svgs/home-line.svg";
import currency_naira from "../../assets/svgs/currency-naira.svg";
import RevenueOverview from './components/RevenueOverview'
import RecentLstings from './components/RecentListings'
// import OccupancyRates from './components/OccupancyRates'
// import RecentActivities from './components/RecentActivities'
// import RecentPayments from './components/RecentPayments'
import PropertyType from './components/PropertyTypes';
import TasksComponent from './components/TasksComponent';
import { useAuthContext } from '../../context/AuthContext';
import { HiOutlineUsers } from 'react-icons/hi';
import { BiUser } from 'react-icons/bi';
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
                <div className="insight--grid grid-3">
                    <InsightCard
                        title="All Renters"
                        icon={<BiUser />}
                        value="768"
                    />
                    <InsightCard
                        title="All Agents"
                        icon={<HiOutlineUsers />}
                        value="871"
                    />
                    <InsightCard
                        title="All Service Provider"
                        icon={<BiUser />}
                        value="543"
                    />
                </div>

                <div className="insight--grid">
                    <InsightCard
                        title="Total Properties"
                        icon={<img src={real_estate} />}
                        value="1,284"
                        // percentage="+12.5%"
                        // isIncrease={true}
                        // period="month"
                    />
                    <InsightCard
                        title="Published Listings"
                        icon={<img src={home_line} />}
                        value="768"
                    />
                    <InsightCard
                        title="Unpublished Listings"
                        icon={<img src={home_line} />}
                        value="87%"
                    />
                    <InsightCard
                        title="Total Revenue"
                        icon={<img src={currency_naira} />}
                        value="₦543,624,432"
                    />
                </div>

                <div className='home--grid'>
                    <div className="grid--left">
                        <RevenueOverview />

                        {/* <div className="home--flex">
                            <OccupancyRates />
                            <RecentLstings />
                        </div>
                        <RecentActivities /> */}

                        <div className="home--flex">
                            <TasksComponent
                                title="Upcoming Events"
                                value="45"
                                valueColor="#3B82F6"
                                link=""
                            />
                            <TasksComponent
                                title="Requested Tasks"
                                value="45"
                                valueColor="#008000"
                                link=""
                            />
                        </div>
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
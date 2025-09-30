import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";

import Login from "./pages/login";
import Home from "./pages/home";
import ErrorPage from "./pages/error";

import Listings from "./pages/listings"
import Agents from "./pages/agents"
import Artisants from "./pages/artisants"
import Inspection from "./pages/inspection"
import Renters from "./pages/renters"
import Payments from "./pages/payments"
import Settings from "./pages/settings"
import Support from "./pages/support"
import Community from "./pages/community"
import Analytics from "./pages/analytics"
import Ratings_reviews from "./pages/ratings-reviews"
import Notifications from "./pages/notifications"
import Coupons from "./pages/coupons"


export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* UNPROTECTED ROUTES */}
				<Route path="/login" element={<Login />}></Route>
                <Route path="*" element={<ErrorPage />} />

				{/* PROTECTED ROUTES */}
				<Route element={<ProtectedRoute />}>
					<Route path="/" element={<Home />}></Route>
					<Route path="/dashboard" element={<Home />}></Route>
					<Route path="/dashboard/listings" element={<Listings />}></Route>
					<Route path="/dashboard/agents" element={<Agents />}></Route>
					<Route path="/dashboard/artisants" element={<Artisants />}></Route>
					<Route path="/dashboard/inspection" element={<Inspection />}></Route>
					<Route path="/dashboard/renters" element={<Renters />}></Route>
					<Route path="/dashboard/payments" element={<Payments />}></Route>
					<Route path="/dashboard/settings" element={<Settings />}></Route>
					<Route path="/dashboard/support" element={<Support />}></Route>
					<Route path="/dashboard/community" element={<Community />}></Route>
					<Route path="/dashboard/analytics" element={<Analytics />}></Route>
					<Route path="/dashboard/ratings-reviews" element={<Ratings_reviews />}></Route>
					<Route path="/dashboard/notifications" element={<Notifications />}></Route>
					<Route path="/dashboard/coupons" element={<Coupons />}></Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
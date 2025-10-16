import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";

import Login from "./pages/login";
import Home from "./pages/home";
import ErrorPage from "./pages/error";
import ChangePassword from "./pages/change-password";
import OTP_Verification from "./pages/otp-verification";
import ForgotPassword from "./pages/forgot-password";

import Listings from "./pages/listings"
import Agents_Landloard from "./pages/agents_landloard"
import Artisans from "./pages/artisants"
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

import CreateListing from "./pages/listings/sub_pages/CreateListing"
import Create_Agents_Landloard from "./pages/agents_landloard/sub_pages/Create_Agents_Landloard"
import Agents_Landloard_Details from "./pages/agents_landloard/sub_pages/Agents_Landloard_Details"
import "photoswipe/dist/photoswipe.css";


export default function App() {
	return (
		<React.Fragment>
			<Toaster />

			<BrowserRouter>
				<Routes>
					{/* UNPROTECTED ROUTES */}
					<Route path="/login" element={<Login />}></Route>
					<Route path="/change-password" element={<ChangePassword />}></Route>
					<Route path="/otp-verification" element={<OTP_Verification />}></Route>
					<Route path="/forgot-password" element={<ForgotPassword />}></Route>
					<Route path="*" element={<ErrorPage />} />

					{/* PROTECTED ROUTES */}
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Home />}></Route>
						<Route path="/dashboard" element={<Home />}></Route>

						<Route path="/dashboard/listings" element={<Listings />}></Route>
						<Route path="/dashboard/listings/create" element={<CreateListing />}></Route>
						<Route path="/dashboard/listings/:id/edit" element={<CreateListing />}></Route>

						<Route path="/dashboard/agents-landlords" element={<Agents_Landloard />}></Route>
						<Route path="/dashboard/agents-landlords/create" element={<Create_Agents_Landloard />}></Route>
						<Route path="/dashboard/agents-landlords/:id/edit" element={<Create_Agents_Landloard />}></Route>
						<Route path="/dashboard/agents-landlords/:id" element={<Agents_Landloard_Details />}></Route>

						<Route path="/dashboard/Artisans" element={<Artisans />}></Route>
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
		</React.Fragment>
	);
}
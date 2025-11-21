import React from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardBase({ children }: { children: React.ReactNode }) {
	return (
		<React.Fragment>
			<DashboardHeader />

			<section className="dashboard--base">
            	<DashboardSidebar />
				
				<div className="content--block">
                    {children}
                </div>
			</section>
		</React.Fragment>
	);
}
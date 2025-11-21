import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/dashboard.css";
import "./styles/auth.css";
import "./styles/page.css";
import "./styles/globals.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { DataProvider } from "./context/DataContext.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<DataProvider>
				<App />
			</DataProvider>
		</AuthProvider>
	</StrictMode>,
);

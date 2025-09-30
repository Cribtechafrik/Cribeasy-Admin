import { createContext, useState, useEffect, useContext } from "react";
import Cookies from 'js-cookie';
import type { AuthType } from "../utils/types";

//////////////////////////////////////////////
//// CREATING CONTEXT ////
//////////////////////////////////////////////
export interface AuthContextType {
    auth: AuthType | null;
    token: string;
    headers: any;
    formdataHeader: any;
    handleChange: (u: AuthType | null, t: string | null) => void;
    handleAuth: (u: AuthType | null) => void;
    logout: () => Promise<string>;
    shouldKick: (r: any) => void;
}

const AuthContext = createContext<AuthContextType>({
    auth: null,
    token: "",
    headers: {},
    formdataHeader: {},
    handleChange: () => {},
    handleAuth: () => {},
    logout: async () => "",
    shouldKick: () => {},
});

export default AuthContext;

const AUTH_KEY = import.meta.env.VITE_AUTH_KEY;
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;

//////////////////////////////////////////////
//// CREATING PROVIDER ////
//////////////////////////////////////////////
interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = function({ children }) {
    if(Cookies.get(AUTH_KEY) == "undefined") {
        Cookies.set(AUTH_KEY, JSON.stringify(null))
    }

    const [auth, setAuth] = useState<AuthType | null>(Cookies.get(AUTH_KEY) ? JSON.parse(Cookies.get(AUTH_KEY)!) : null);
    const [token, setToken] = useState<string | any>(Cookies.get(TOKEN_KEY) ? Cookies.get(TOKEN_KEY) : null);

    const headers: {
        "Content-Type": string;
        Authorization: string;
    } = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }

    const formdataHeader = { Authorization: `Bearer ${token}` };

    const handleChange = function(auth: AuthType | null, token: string | null) {
        setAuth(auth);
        setToken(token);
    };

    const handleAuth = function(auth: AuthType | null) {
        setAuth(auth);
    };

    const shouldKick = function(res: any) {
        if (res?.status === 401 || res?.status === 403 || res == "kick") {
            handleChange(null, null);
        }
    };

    async function logout() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { headers });
            const data: any = res.json()
            if(res.status === 429) throw new Error("Too Many Requests, Try again later")
            if(data.status == "fail" || !res.ok) throw new Error(data?.message);

            setTimeout(function() {
                handleChange(null, null);
            }, 1000);

            return "successful";
        } catch(err: any) {
            return err?.message
        }
    }

    useEffect(function () {
        Cookies.set(AUTH_KEY, JSON.stringify(auth), { expires: 365 });
        Cookies.set(TOKEN_KEY, token, { expires: 365 });
    }, [auth, token]);


    // CREATE CONTEXT DATA
    let contextData: AuthContextType = {
        auth,
        token,
        headers,
        formdataHeader,
        handleChange,
        handleAuth,
        logout,
        shouldKick,
    }

    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
}


//////////////////////////////////////////////
//// CREATING HOOK AND EXPORTING ////
//////////////////////////////////////////////
export const useAuthContext = () => useContext(AuthContext);
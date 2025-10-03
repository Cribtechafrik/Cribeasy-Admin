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

const AUTH_KEY = "Crib_Easy_Auth";
const TOKEN_KEY = "Crib_Easy_Token";

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
        "Accept": string;
        "Content-Type": string;
        Authorization: string;
    } = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }

    const formdataHeader = { "Accept": "application/json", Authorization: `Bearer ${token}` };

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
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user`, { headers, method: "GET" });
            const data: any = await res.json()
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setTimeout(function() {
                handleChange(null, null);
            }, 500);

            return data?.message;
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
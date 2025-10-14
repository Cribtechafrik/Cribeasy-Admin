import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-use";


//////////////////////////////////////////////
//// CREATING CONTEXT ////
//////////////////////////////////////////////
interface DataContextType {
    isShowSidemenu: boolean;
    setIsShowSidemenu: (is: boolean) => void;
    handleToggleSidemenu: () => void;
    animateOut: boolean;
}


const DataContext = createContext<DataContextType | any>(null);
export default DataContext;


//////////////////////////////////////////////
//// CREATING PROVIDER ////
//////////////////////////////////////////////
interface DataProviderType {
    children: React.ReactNode
}

export const DataProvider: React.FC<DataProviderType> = function({ children }) {
    const { pathname } = useLocation();
    const [animateOut, setAnimateOut] = useState(false);
    const [isShowSidemenu, setIsShowSidemenu] = useState(false);


    const handleRunCloseNanimate = function() {
        setAnimateOut(true);
        setTimeout(() => {
            setAnimateOut(false);
            setIsShowSidemenu(false);
        }, 300);
    }

    const handleToggleSidemenu = function() {
        if(!isShowSidemenu) {
            setIsShowSidemenu(true);
        } else {
            handleRunCloseNanimate();
        }
    }

    useEffect(function() {
        handleRunCloseNanimate();
    }, [pathname]);


    // CREATE CONTEXT DATA
    let contextData = {
        isShowSidemenu,
        setIsShowSidemenu,
        handleToggleSidemenu,
        animateOut,
    }

    return <DataContext.Provider value={contextData}>{children}</DataContext.Provider>
}


//////////////////////////////////////////////
//// CREATING HOOK AND EXPORTING ////
//////////////////////////////////////////////
export const useDataContext = () => useContext(DataContext);
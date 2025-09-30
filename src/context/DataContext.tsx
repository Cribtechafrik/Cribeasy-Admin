import { createContext, useContext } from "react";


//////////////////////////////////////////////
//// CREATING CONTEXT ////
//////////////////////////////////////////////
interface DataContextType {

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


    // CREATE CONTEXT DATA
    let contextData = {

    }

    return <DataContext.Provider value={contextData}>{children}</DataContext.Provider>
}


//////////////////////////////////////////////
//// CREATING HOOK AND EXPORTING ////
//////////////////////////////////////////////
export const useDataContext = () => useContext(DataContext);
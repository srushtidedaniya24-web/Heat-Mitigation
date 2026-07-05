import { createContext, useContext, useState } from "react";

const CityContext = createContext();

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState("all");
  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}

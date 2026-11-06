import { useContext } from "react";
import { DormDataContext, type DormDataContextType } from "../contexts/DormDataContext.tsx";

export function useDormData(): DormDataContextType {
  const context = useContext(DormDataContext);
  if (!context) {
    throw new Error("useDormData must be used within a DormDataProvider");
  }
  return context;
}

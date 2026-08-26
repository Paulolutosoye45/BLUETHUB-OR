import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AxiosError } from "axios";
import { parentService, type ParentChild } from "@/services/parent";

interface ParentChildrenContextType {
  children: ParentChild[];
  loading: boolean;
  error: string | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  selectedChild: ParentChild | null;
  refresh: () => Promise<void>;
}

const ParentChildrenContext = createContext<ParentChildrenContextType | null>(null);

export const ParentChildrenProvider = ({ children: node }: { children: ReactNode }) => {
  const [childList, setChildList] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parentService.getMyChildren();
      const list = res.data?.data ?? [];
      setChildList(list);
      setSelectedChildId((prev) => {
        if (prev && list.some((c) => c.studentId === prev)) return prev;
        return list[0]?.studentId ?? null;
      });
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.responseMessage ?? err.response?.data?.message ?? err.message
          : (err as Error).message;
      setError(msg || "Failed to load your children.");
      setChildList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedChild = childList.find((c) => c.studentId === selectedChildId) ?? null;

  return (
    <ParentChildrenContext.Provider
      value={{
        children: childList,
        loading,
        error,
        selectedChildId,
        setSelectedChildId,
        selectedChild,
        refresh: load,
      }}
    >
      {node}
    </ParentChildrenContext.Provider>
  );
};

export const useParentChildren = () => {
  const ctx = useContext(ParentChildrenContext);
  if (!ctx) throw new Error("useParentChildren must be used within ParentChildrenProvider");
  return ctx;
};

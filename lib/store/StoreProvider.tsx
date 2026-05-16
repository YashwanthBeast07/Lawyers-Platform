"use client";
import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { fetchProfileThunk } from "@/lib/store/authSlice";

function InitSession({ children }: { children: React.ReactNode }) {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      store.dispatch(fetchProfileThunk());
    }
  }, []);

  return <>{children}</>;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef(store);
  return (
    <Provider store={storeRef.current}>
      <InitSession>{children}</InitSession>
    </Provider>
  );
}

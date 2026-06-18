import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Visitor } from "../types";

export function useMyVisitors(hostId: string | null) {
  const [active, setActive] = useState<Visitor[]>([]);
  const [newArrivals, setNewArrivals] = useState<Visitor[]>([]);
  const isFirst = useRef(true);

  useEffect(() => {
    if (!hostId) return;

    async function fetch() {
      const { data } = await supabase
        .from("visitors")
        .select("*")
        .eq("host_id", hostId)
        .is("checked_out_at", null)
        .order("checked_in_at", { ascending: false });
      setActive((data as Visitor[]) ?? []);
    }

    fetch();

    const channel = supabase
      .channel("my-visitors")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitors", filter: `host_id=eq.${hostId}` },
        (payload) => {
          const v = payload.new as Visitor;
          if (!isFirst.current) {
            setNewArrivals((prev) => [v, ...prev]);
          }
          setActive((prev) => [v, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "visitors", filter: `host_id=eq.${hostId}` },
        () => fetch()
      )
      .subscribe(() => {
        isFirst.current = false;
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostId]);

  function dismissArrival(id: string) {
    setNewArrivals((prev) => prev.filter((v) => v.id !== id));
  }

  return { active, newArrivals, dismissArrival };
}

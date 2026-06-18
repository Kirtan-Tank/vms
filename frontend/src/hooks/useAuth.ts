import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("id, name, role, property_id")
      .eq("id", userId)
      .single();
    setProfile(data as UserProfile | null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, profile, loading, signOut };
}

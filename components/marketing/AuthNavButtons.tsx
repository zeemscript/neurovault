"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AuthNavButtons() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated) {
    return (
      <Link href="/dashboard">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 animate-in-out transition-all">
          Dashboard
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <Link href="/request-a-demo">
        <Button className="bg-blue-600 hover:bg-blue-400 text-white px-10 py-3 animate-in-out transition-all">
          Book a Demo
        </Button>
      </Link>
      <Link href="/login">
        <Button className="bg-white hover:bg-blue-600 border-2 border-blue-500 text-blue-500 hover:text-white px-10 py-3 animate-in-out transition-all">
          Login
        </Button>
      </Link>
    </div>
  );
}

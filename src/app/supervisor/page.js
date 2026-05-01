"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

function SupervisorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/supervisor/zones");
  }, [router]);

  return <div></div>;
}

export default SupervisorPage;

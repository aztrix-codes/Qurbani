'use client'

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return <div></div>;
}

export default page;

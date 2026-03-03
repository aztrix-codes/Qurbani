'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function UserPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/dashboard");
  }, [router]);

  return null;
}

export default UserPage;

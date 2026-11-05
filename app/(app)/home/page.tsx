
import React from 'react'
import TokenLogger from "@/lib/token-logger";
function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 dark:bg-primary-900">
      Home
      <TokenLogger />
    </div>
  )
}

export default Home

"use client"

import { useState } from "react"
import { ProfileHeader } from "../components/profile/ProfileHeader"
import { UserPosts } from "../components/profile/UserPosts"
import { ReadingHistory } from "../components/profile/ReadingHistory"

type Tab = "library" | "discussions"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("library")

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ProfileHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "library" && <ReadingHistory />}
        {activeTab === "discussions" && <UserPosts />}
      </div>
    </div>
  )
}

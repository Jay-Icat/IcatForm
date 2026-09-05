"use client";

import React, { use } from "react";
import { ExperienceContainer } from "@/components/ui/ExperienceContainer";

interface TeamPageProps {
  params: Promise<{
    teamSlug: string;
  }>;
}

export default function TeamExperiencePage({ params }: TeamPageProps) {
  const { teamSlug } = use(params);

  // Decode URI components in case the slug has encoded characters
  const cleanTeamSlug = decodeURIComponent(teamSlug || "").trim().toLowerCase();

  return <ExperienceContainer teamId={cleanTeamSlug || "default"} />;
}

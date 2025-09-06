// v1.0.0 - Ashok - Reduced size of icons and added description
import React, { useEffect, useState } from "react";
import {
  Building2,
  Code2,
  Brain,
  MapPin,
  UserCog,
  GraduationCap,
  School,
  Building,
} from "lucide-react";
import MasterCard from "./MasterCard";
// v1.0.0 <---------------------------------------------------------------
const masterItems = [
  {
    key: "industries",
    label: "Industries",
    icon: <Building2 />,
    description:
      "Categories representing different business sectors or domains.",
  },
  {
    key: "technology",
    label: "Technologies",
    icon: <Code2 />,
    description:
      "Tools, frameworks, or platforms used in development and operations.",
  },
  {
    key: "skills",
    label: "Skills",
    icon: <Brain />,
    description: "Specific abilities or expertise an individual can possess.",
  },
  {
    key: "locations",
    label: "Locations",
    icon: <MapPin />,
    description:
      "Geographic places where users, jobs, or organizations are based.",
  },
  {
    key: "roles",
    label: "Roles",
    icon: <UserCog />,
    description: "Job positions or responsibilities within an organization.",
  },
  {
    key: "qualification",
    label: "Qualifications",
    icon: <GraduationCap />,
    description:
      "Educational or professional credentials attained by individuals.",
  },
  {
    key: "universitycollege",
    label: "Colleges",
    icon: <School />,
    description:
      "Academic institutions where candidates pursued their studies.",
  },
  {
    key: "company",
    label: "Companies",
    icon: <Building />,
    description:
      "Organizations where individuals have worked or are currently employed.",
  },
];
// v1.0.0 <-------------------------------------------------------------->

const MasterData = () => {
  useEffect(() => {
    document.title = "Master Data | Admin Portal";
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl text-custom-blue font-semibold mb-6">
        Master Data
      </h1>
      <MasterCard items={masterItems} />
    </div>
  );
};

export default MasterData;

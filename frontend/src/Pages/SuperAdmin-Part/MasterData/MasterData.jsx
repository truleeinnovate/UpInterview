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
const masterItems = [
  { key: "industries", label: "Industries", icon: <Building2 size={40} /> },
  { key: "technology", label: "Technologies", icon: <Code2 size={40} /> },
  { key: "skills", label: "Skills", icon: <Brain size={40} /> },
  { key: "locations", label: "Locations", icon: <MapPin size={40} /> },
  { key: "roles", label: "Roles", icon: <UserCog size={40} /> },
  {
    key: "qualification",
    label: "Qualifications",
    icon: <GraduationCap size={40} />,
  },
  { key: "universitycollege", label: "Colleges", icon: <School size={40} /> },
  { key: "company", label: "Companies", icon: <Building size={40} /> },
];

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

import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";

const RegionalTaxDetails = () => {
  const navigate = useNavigate();

  return (
    <SidebarPopup title="Regional Tax Details" onClose={() => navigate(-1)}>
      <h1>Regional Tax Details</h1>
    </SidebarPopup>
  );
};

export default RegionalTaxDetails;



export  const handleMembershipChange = (type,setCardDetails,pricePerMember,planDetails,setTotalPaid) => {
    setCardDetails((prevData) => ({
        ...prevData,
        membershipType: type,
    }));
   
    updateTotalPaid(type,pricePerMember,planDetails,setTotalPaid);
  
};

const  updateTotalPaid = (membershipType,pricePerMember,planDetails,setTotalPaid) => {
    let total = 0;
    if (membershipType === "monthly") {
        total = parseInt(pricePerMember.monthly) - (planDetails.monthDiscount || 0);
       
    } else if (membershipType === "annual") {
        total = parseInt(pricePerMember.annually) - (planDetails.annualDiscount || 0);
       
    }
    setTotalPaid(total);
};


//    const 

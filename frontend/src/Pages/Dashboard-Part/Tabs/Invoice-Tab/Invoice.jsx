import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Filter, Grid, ChevronUp, ChevronDown, X, Search, List } from 'lucide-react';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { motion } from "framer-motion";
import Loading from "../../../../Components/Loading";
import { Outlet, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import InvocieTable from "./InvocieTable";
import InvocieKanban from "./InvocieKanban";
import { config } from "../../../../config";

const InvoiceTab = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState([]);
    // console.log("billingData:", billingData);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);

    const ownerId = tokenPayload.userId;

    const tenantId = tokenPayload.tenantId;
    // console.log("ownerId in users", ownerId);
    const fetchInvoiceData = useCallback(async () => {
        setLoading(true);
        try {
            //   const response = await axios.get(
            //     `${process.env.REACT_APP_API_URL}/organization/${tenantId}`
            //   );


            //   const contactWithImages = response.data.map((contact) => {
            //     if (contact.imageData && contact.imageData.filename) {
            //       const imageUrl = `${process.env.REACT_APP_API_URL}/${contact.imageData.path.replace(/\\/g, '/')}`;
            //       return { ...contact, imageUrl };
            //     }
            //     return contact;
            //   });
            const Invoice_res = await axios.get(`${config.REACT_APP_API_URL}/get-invoice-id/${ownerId}`);
            
               const invoiceData = Invoice_res?.data || [];
           // Transform the data into a more usable structure
            const formattedData = invoiceData.map(invoice =>{
  // Generate a default payment ID if none exists
  const paymentId = invoice.paymentId || 
                   `PAY-${invoice._id.toString().substring(18, 24)}-${Date.now().toString().substring(8)}`;
                return {
                id: invoice._id,
                paymentId,
                invoiceNumber: invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8)}`,
                customer: invoice.ownerId ? {
                    id: invoice.ownerId._id,
                    name: invoice.ownerId.Name || `${invoice.ownerId.Firstname} ${invoice.ownerId.Lastname || ''}`.trim(),
                    userId: invoice.ownerId.UserId
                } : null,
                plan: invoice.planId ? {
                    id: invoice.planId._id,
                    name: invoice.planId.name,
                    description: invoice.planId.description
                } : null,
                amount: {
                    total: invoice.totalAmount,
                    paid: invoice.amountPaid,
                    outstanding: invoice.outstandingAmount,
                    discount: invoice.discount
                },
                dates: {
                    createdAt: new Date(invoice.createdAt),
                    startDate: invoice.startDate ? new Date(invoice.startDate) : null,
                    endDate: invoice.endDate ? new Date(invoice.endDate) : null,
                    dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null
                },
                status: invoice.status || 'pending',
                type: invoice.type || 'subscription',
                comments: invoice.comments || '',
                lineItems: invoice.lineItems || [],
                tenantId: invoice.tenantId
            } 
});

            // console.log("formattedData", formattedData);
            

            setBillingData(formattedData.reverse());

        } catch (error) {
            console.error("Error fetching invoice data:", error);
        }
        setLoading(false);
    });

    useEffect(() => {
        fetchInvoiceData();
    }, [ ownerId]);


    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const [isMenuOpen, setMenuOpen] = useState(false);
    // const [isPopupOpen, setPopupOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };


    useEffect(() => {
        document.title = "Invoice Tab";
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };


    const handleOutsideClick = useCallback((event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    }, []);

    const [actionViewMore, setActionViewMore] = useState(null);

    const handleMoreClick = (userId) => {
        setActionViewMore(prevId => prevId === userId ? null : userId);
    };

    const [viewMode, setViewMode] = useState("table");
    const handleListViewClick = () => {
        setViewMode("table");
    };

    const handleKanbanViewClick = () => {
        setViewMode("kanban");
    };



    // Detect screen size and set view mode to "kanban" for sm
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setViewMode("kanban");
            } else {
                setViewMode("table");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    const [isFilterActive, setIsFilterActive] = useState(false);
    const handleFilterIconClick = () => {
        if (billingData.length !== 0) {
            setIsFilterActive((prev) => !prev);
            toggleMenu();
        }
    };



    const FilteredData = () => {
        if (!Array.isArray(billingData)) return [];
        // console.log("billingData", billingData);
        
        const sortedData = billingData;

        return sortedData.filter((invoice) => {
            const fieldsToSearch = [
                invoice.invoiceNumber,
                invoice.status
              
            ];

            return fieldsToSearch.some(
                (field) =>
                    field !== undefined &&
                    field.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
    //const [activeArrow, setActiveArrow] = useState(null);

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            //setActiveArrow("next");
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            //setActiveArrow("prev");
        }
    };

    const startIndex = currentPage * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
    const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

// console.log("currentFilteredRows", currentFilteredRows);



    return (
        <div className="w-full bg-background p-2">
            <main className="w-full mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-2">
                <div className="sm:px-0">
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >

                    </motion.div>
                    <motion.div
                        className="flex justify-between items-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <span className="text-lg text-custom-blue font-semibold">Billing Details</span>
                        </div>

                        {/* <div onClick={() => { navigate('new') }} >
                            <span className="p-2 bg-custom-blue cursor-pointer text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded">
                                Add
                            </span>
                        </div> */}
                    </motion.div>
                    <motion.div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end mb-4">
                        <div className="flex items-center sm:hidden md:hidden">
                            <Tooltip title="table" enterDelay={300} leaveDelay={100} arrow>
                                <span onClick={handleListViewClick}>
                                    <List
                                        className={`text-xl cursor-pointer mr-4 ${viewMode === "table" ? "text-custom-blue" : ""
                                            }`}
                                    />
                                </span>
                            </Tooltip>
                            <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                                <span onClick={handleKanbanViewClick}>
                                    <Grid
                                        className={`text-xl cursor-pointer ${viewMode === "kanban" ? "text-custom-blue" : ""
                                            }`}
                                    />
                                </span>
                            </Tooltip>

                        </div>
                        <div className="flex items-center">
                            <div className="relative flex-1 w-[300px] sm:w-full flex-grow">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                <input
                                    type="text"
                                    placeholder="Search by Status, InvoiceId ...."
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    className="w-[100%] pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <span className="p-2 text-xl sm:text-md md:text-md">
                                    {currentPage + 1}/{totalPages}
                                </span>
                            </div>
                            <div className="flex">
                                <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                                    <span
                                        className={`border p-2 mr-2 text-lg sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={prevPage}
                                    >
                                        <ChevronLeft className="text-custom-blue" />
                                    </span>
                                </Tooltip>

                                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                                    <span
                                        className={`border p-2 text-lg sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={nextPage}
                                    >
                                        <ChevronRight className="text-custom-blue" />
                                    </span>
                                </Tooltip>
                            </div>
                            <div className="ml-2 text-lg sm:text-md md:text-md border rounded-md p-2">
                                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                                    <span
                                        onClick={handleFilterIconClick}
                                        style={{
                                            opacity: billingData.length === 0 ? 0.2 : 1,
                                            pointerEvents: billingData.length === 0 ? "none" : "auto",
                                        }}
                                    >
                                        {isFilterActive ? (
                                            <X className="text-custom-blue cursor-pointer" />
                                        ) : (
                                            <Filter className="text-custom-blue cursor-pointer" />
                                        )}
                                    </span>
                                </Tooltip>
                            </div>
                        </div>
                    </motion.div>
                    {loading ? (
                        <Loading />
                    ) : (
                        <motion.div className="bg-white">

                            {viewMode === 'table' ?
                                <div className="flex relative w-full overflow-hidden">
                                    <div className={` transition-all duration-300 ${isMenuOpen ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                                        }`} >
                                        <InvocieTable
                                            currentFilteredRows={currentFilteredRows}
                                            toggleAction={handleMoreClick}
                                            actionViewMore={actionViewMore}
                                            loading={loading}
                                            //   billingData={billingData}
                                            toggleSidebar={toggleSidebar}
                                        />
                                    </div>
                                    {/* {isMenuOpen && (
                    <div className=" h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )} */}
                                </div>

                                :
                                <div className="flex relative w-full overflow-hidden">
                                    <div className={` transition-all duration-300 ${isMenuOpen ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
                                        }`} >
                                        <InvocieKanban
                                            currentFilteredRows={currentFilteredRows}
                                            loading={loading}
                                            //   userData={billingData}
                                            toggleSidebar={toggleSidebar}
                                        />
                                    </div>
                                    {/* {isMenuOpen && (
                    <div className=" h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-44 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={isMenuOpen}
                        closeOffcanvas={handleFilterIconClick}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  )} */}
                                </div>
                            }
                        </motion.div>
                    )}
                </div>
            </main>
               <Outlet /> 
        </div>
    )
}

export default InvoiceTab
import { useState, useEffect, } from "react";

import axios from "axios";
//import { nextPage, prevPage } from "../../../../../utils/SubscriptionValidations.js";
import CreateEmailTemplate from "./CreateEmailTemplate";
import EmailTemplateViewPage from "./EmailTemplateViewPage";
import EmailTemplateDetails from "./EmailTemplateDetails";
import { SettingsIcon, ToggleLeft, ToggleRight, X } from "lucide-react";
import Settings from "./Settings";
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

const EmailTemplate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  //const [showFilterCard, setShowFilterCard] = useState(false);
  const [emailRecords, setEmailRecords] = useState([]);
  const [viewPage, setViewPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  //const [viewPageData, setViewPageData] = useState([])


  //const totalPages = 10

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/emailTemplate/get-templates`);
      const emailData = response.data.reverse();
      setEmailRecords(emailData);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsLoading(false);
    }
  }


  // console.log("record", emailRecords);

  const allTemplates = emailRecords;
  const templatesPerPage = 5;
  const sortBy = "createdAt";
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const filteredTemplates = allTemplates
    .filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]));

  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  // eslint-disable-next-line no-unused-vars
  const handleClone = (templateId) => {
    // Clone template logic here
  };

  const handleStatusToggle = async () => {
    if (selectedTemplate.isActive) {
      setShowConfirmation(true);
    } else {
      await updateTemplateStatus(true);
    }
  };

  const updateTemplateStatus = async (newStatus) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/emailTemplate/templates/${selectedTemplate._id}/status`,
        { isActive: newStatus }
      );
      
      // Update the template in state
      setSelectedTemplate(response.data);
      
      // Update the template in the list
      setEmailRecords(prevRecords => 
        prevRecords.map(record => 
          record._id === selectedTemplate._id ? response.data : record
        )
      );

      setShowConfirmation(false);
    } catch (error) {
      console.error('Error updating template status:', error);
      alert('Failed to update template status');
    }
  };

  const handleConfirmDeactivate = async () => {
    await updateTemplateStatus(false);
  };

  const handleEdit = () => {
    // if (template.type === 'whatsapp') {
    //   navigate(`/whatsapp/edit/${template.id}`, { state: { template } });
    // } else {
    //   navigate(`/template/edit/${template.id}`, { state: { template } });
    // }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
    <div> 
        <div>
          {
            viewPage ?
              <EmailTemplateViewPage show={viewPage} onClose={() => setViewPage(false)} record={filteredTemplates} /> :
              (
                <div>
                  <div className="flex justify-between items-center mb-4 px-4 py-2">
                    <h2 className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl text-[#217989] font-semibold">Email Templates</h2>
                    <button
                      onClick={() => setShow(true)}
                      className="bg-[#217989] text-white px-4 py-2 rounded shadow hidden"
                    >
                      New
                    </button>
                  </div>

                  <div className="flex justify-end items-center w-full mb-4 px-4">


                    <div className="flex items-center gap-4">
                    <div className="searchintabs relative w-96">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                     <button type="submit" className="p-1">
                      <Search className="text-custom-blue text-lg" />
                     </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search Email Templates"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md h-10 focus:outline-none focus:ring-1 focus:ring-custom-blue"
                    />
                     </div>
                       
                      <div className="flex items-center h-7 gap-1">
                      <span className=" pe-1 text-md">
                          {currentPage}/{totalPages}
                        </span>
                        <button 
                         className={`p-2 border border-gray-300 rounded hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} `}
                         onClick={prevPage}
                         disabled={currentPage === 1}
                         >
                           <ArrowLeft className="text-custom-blue text-xl" />
                         </button>
                         <button 
                          className={`p-2 border border-gray-300 rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} `}
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          >
                          <ArrowRight className="text-custom-blue text-xl" />
                         </button>
                         <div className="flex items-center pl-1 h-7">
                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 border shadow text-gray-600 hover:text-indigo-600 rounded hover:bg-gray-100 transition-colors"
                        title="Settings"
                       >
                       <SettingsIcon className="h-5 w-5 text-custom-blue " />
                      </button>
                      </div>
                      </div>
                      
                    </div>
                  </div>

                  <EmailTemplateDetails
                templates={filteredTemplates.slice((currentPage - 1) * templatesPerPage, currentPage * templatesPerPage)}
                onPreview={handlePreview}
                onClone={handleClone}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
                </div>
              )
          }
        </div>
    </div>
    {show ? <CreateEmailTemplate show={show} onClose={setShow} refreshData={fetchData} /> : ""}

    {/* Preview Modal */}
    {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {showConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Confirm Inactivation</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to inactivate this email template?</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDeactivate}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Inactivate
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="border-b px-6 sm:px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTemplate.category}</p>
                  </div>
                  <button
                    onClick={handleStatusToggle}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm ${
                      selectedTemplate.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedTemplate.isActive ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="rounded-lg p-4 sm:p-6 mb-6 bg-gray-50" > 
              <div className="mb-4 pb-4 border-b">
               <div className="text-sm text-gray-500">Subject:</div>
                  <div className="font-medium">
                        {selectedTemplate.subject}
                  </div>
                  </div>
                  <div
                      className="prose max-w-none whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.body
                      }}
                    />
                  </div>
                {/* {selectedTemplate.type === 'email' ? (
                  <>
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-sm text-gray-500">Subject:</div>
                      <div className="font-medium">
                        {selectedTemplate.subject}
                      </div>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.body
                      }}
                    />
                  </>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {selectedTemplate.content.plainText}
                  </pre>
                )} */}
              
            </div>
          </div>
        </div>
      )}

    {/* Settings Modal */}
    {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <Settings onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default EmailTemplate
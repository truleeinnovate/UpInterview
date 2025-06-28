import React, { useEffect, useState } from 'react'
import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import { SidePopup } from '../../common/SidePopup'
import { useCustomContext } from '../../../../../Context/Contextfetch';

import { useNavigate, useParams } from 'react-router-dom';

const InterviewGroupDetails = () => {
  const { groups } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  // console.log("id",id);


  // console.log("InterviewGroupDetails", id,groups.find(group => group._id === id));

  const [selectedGroup, setSelectedGroup] = useState({});

  useEffect(() => {
    const fetchData = () => {
      try {

        // console.log('Groups:', groups);
        // console.log('Looking for ID:', id);
        const group = groups.find(group => group._id === id);
        console.log('Found group:', group);
        setSelectedGroup(group || {});
        // setIsLoading(false);
        // const group = groups.find(group => group._id === id);

        // console.log("group", group);
        // setSelectedGroup(group || null);

      } catch (error) {
        setSelectedGroup({});

      }
    }
    fetchData()
  }, [id, groups]);

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );


  return (

    //    <SidePopup
    //   title="Group Details"
    //   // onClose={() => setSelectedGroup(null)}
    //   position="right"
    //   size="medium"
    // >
    <Modal
      isOpen={true}
      onRequestClose={() => navigate('/account-settings/interviewer-groups')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="p-6 ">
          <div className="flex justify-between items-center mb-6  ">
            <h2 className="text-2xl font-bold text-custom-blue">Group Information </h2>
            {/* Details */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/account-settings/interviewer-groups')
                  // setUserData(formData)
                  // setIsBasicModalOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="space-y-6 border rounded-md  p-4">
            <div>
              {/* <h3 className="text-lg font-medium mb-4">Group Information</h3> */}
              <div className="space-y-4">
                <div>
                  <p className="text-base text-gray-500">Name</p>
                  <p className="font-medium">{selectedGroup.name || "Not Provided"}</p>
                </div>
                <div>
                  <p className="text-base text-gray-500">Description</p>
                  <p className="font-medium">{selectedGroup.description || "Not Provided"}</p>
                </div>
                <div>
                  <p className="text-base text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedGroup.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedGroup.status || "Not Provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg text-gray-500 font-base mb-2">Members ({selectedGroup.numberOfUsers || 0})</h3>
              <div className="space-x-4 flex">
                {(selectedGroup.usersNames || []).map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between  ">
                    {/* <div> */}
                      <span className="font-medium bg-gray-100 rounded-full text-sm pt-2 pl-3 pr-3 pb-2">{member || "Not Provided"}</span>
                      {/* <p className="text-sm text-gray-500">{member.role}</p> */}
                    {/* </div> */}
                    {/* <div className="flex items-center space-x-2"> */}
                      {/* <span className="text-sm text-gray-500">
                        Rating: {member.rating || "N/A"}
                      </span> */}
                      {/* <span className={`px-2 py-1 text-xs rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status || "N/A"}
                      </span> */}
                    {/* </div> */}
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </Modal>
    // </SidePopup>

  )
}

export default InterviewGroupDetails

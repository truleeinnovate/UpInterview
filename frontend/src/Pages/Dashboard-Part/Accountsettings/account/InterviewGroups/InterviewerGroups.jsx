// v1.0.0  -  mansoor  -  added skeleton structure loading
// v1.0.1  -  Ashok    -  changed the styles at bullet points

// import { useState } from 'react'
import { ViewDetailsButton, EditButton } from '../../common/Buttons'
// import { SidePopup } from '../../common/SidePopup'
// import { InterviewerGroupFormPopup } from './InterviewerGroupFormPopup'
// import { teamMembers } from '../../mockData/teamData'
import { useCustomContext } from '../../../../../Context/Contextfetch'
// import axios from 'axios'
import Cookies from "js-cookie";
import { Outlet, useNavigate } from 'react-router-dom'
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';

const InterviewerGroups = () => {
  // <------------------------- v1.0.0
  const { groups, groupsLoading } = useCustomContext();
  // v1.0.0 -------------------------->
  const navigate = useNavigate();
  // const [selectedGroup, setSelectedGroup] = useState(null)
  // const [editingGroup, setEditingGroup] = useState(null)
  // const [isCreating, setIsCreating] = useState(false)
  // const [groups, setGroups] = useState([
  //   {
  //     id: 1,
  //     name: 'Frontend Engineers',
  //     description: 'Specialized in frontend technologies and UI/UX',
  //     members: teamMembers.filter(member => member.expertise.includes('Frontend')),
  //     status: 'active'
  //   },
  //   {
  //     id: 2,
  //     name: 'Backend Engineers',
  //     description: 'Focused on backend systems and architecture',
  //     members: teamMembers.filter(member => member.expertise.includes('Backend')),
  //     status: 'active'
  //   },
  //   {
  //     id: 3,
  //     name: 'Product Team',
  //     description: 'Product management and strategy interviews',
  //     members: teamMembers.filter(member => member.department === 'Product'),
  //     status: 'active'
  //   }
  // ])
  // const [groupsData, setGroupsData] = useState([])

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

    // <------------------------- v1.0.0
  // Skeleton Loading Component for Interview Groups
  const InterviewerGroupsSkeleton = () => {
    return (
      <div className="space-y-6 px-4 py-6">
        {/* Info section skeleton */}
        <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 bg-custom-blue skeleton-animation rounded"></div>
            </div>
            <div className="ml-3">
              <div className="h-5 w-32 bg-custom-blue skeleton-animation rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-80 bg-custom-blue skeleton-animation rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 w-64 bg-custom-blue skeleton-animation rounded"></div>
                  <div className="h-3 w-72 bg-custom-blue skeleton-animation rounded"></div>
                  <div className="h-3 w-68 bg-custom-blue skeleton-animation rounded"></div>
                  <div className="h-3 w-60 bg-custom-blue skeleton-animation rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-10 w-32 bg-gray-200 skeleton-animation rounded"></div>
        </div>

        {/* Groups grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 skeleton-animation rounded"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded"></div>
              </div>

              <div className="mt-4">
                <div className="h-4 w-24 bg-gray-200 skeleton-animation rounded mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-20 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-18 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded"></div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
                <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show skeleton if data is still loading
  if (groupsLoading) {
    return <InterviewerGroupsSkeleton />;
  }
  // v1.0.0 -------------------------->
  
  // console.log("tenantId InterviewerGroups", tenantId);

  // console.log("organizationId", tenantId, groups);


  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       // setLoading(true);
  //       const response = await axios.get(`${config.REACT_APP_API_URL}/groups/data/${tenantId}`)
  //       console.log('Fetched groups:', response.data);
  //       setGroupsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching groups:', error)
  //     } finally {
  //       // setLoading(false);
  //     }
  //   }
  //   fetchGroups()
  // }, [])

  // const handleSaveGroup = (groupData) => {
  //   if (editingGroup) {
  //     // setGroups(prev => prev.map(group => 
  //     //   group.id === editingGroup.id ? { ...group, ...groupData } : group
  //     // ))
  //     setEditingGroup(null)
  //   } else {
  //     // setGroups(prev => [...prev, { ...groupData, id: prev.length + 1 }])
  //     // setIsCreating(false)
  //   }
  // }

  return (
    <>
      <div >
        <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-custom-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-custom-blue">Interviewer Groups</h3>
              <div className="mt-2 text-sm text-custom-blue">
                <p>Create specialized interviewer groups for different assessment types:</p>
                {/* v1.0.1 <---------------------------------------------------------------------------------------------------------------------------- */}
                <ul className="list-disc list-inside mt-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-1 gap-x-16">
                {/* v1.0.1 -----------------------------------------------------------------------------------------------------------------------------> */}
                  <li>Group interviewers by expertise (Frontend, Backend, etc.)</li>
                  <li>Manage technical and non-technical interview panels</li>
                  <li>Organize interviewers by seniority levels</li>
                  <li>Track group-specific interview metrics</li>
                </ul>
                
              </div>
            </div>
          </div>
        </div>

        <div className="flex mb-2 mt-2 flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Interviewer Groups</h2>
          <button
            onClick={
              () => { navigate(`/account-settings/interviewer-groups/interviewer-group-form`) }
            }
            className="px-4 py-2 bg-custom-blue text-white rounded-lg  whitespace-nowrap"
          >
            Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {groups.map(group => (
            <div key={group._id} className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{group.name ? group.name.charAt(0).toUpperCase() + group.name.slice(1) : "N/A"}</h3>
                  {/* <p className="text-gray-500 mt-1 text-sm">{group.description}</p> */}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {group.status ? group.status.charAt(0).toUpperCase() + group.status.slice(1) : "N/A"}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">{group.numberOfUsers > 1 ? "Members:" : "Member:"} {group.numberOfUsers}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.usersNames.map((member, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {member}
                    </span>
                  ))}
                  {group.usersNames.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      +{group.usersNames.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <ViewDetailsButton onClick={() => {
                  navigate(`/account-settings/interviewer-groups/interviewer-group-details/${group._id}`)
                }} />
                <EditButton onClick={() => {
                  navigate(`/account-settings/interviewer-groups/interviewer-group-edit-form/${group._id}`)
                }}
                />
              </div>
            </div>
          ))}
        </div>


      </div>
      <Outlet />
    </>
  )
}

export default InterviewerGroups
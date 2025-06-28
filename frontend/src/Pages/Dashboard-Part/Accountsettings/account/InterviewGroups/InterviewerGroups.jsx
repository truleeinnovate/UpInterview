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
  const { groups } = useCustomContext();
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
                <ul className="list-disc list-inside mt-1">
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
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  {/* <p className="text-gray-500 mt-1 text-sm">{group.description}</p> */}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {group.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Members: {group.numberOfUsers}</p>
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { config } from '../config';
const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [organization, setOrganization] = useState(false);
  const [freelancer, setFreelancer] = useState(false);
  const [objectPermissionscontext, setObjectPermissions] = useState({});
  const [tabPermissions, setTabPermissions] = useState({});
  const [sharingPermissionscontext, setSharingPermissions] = useState({});

  useEffect(() => {
    const initialize = async () => {

      const authToken = Cookies.get("authToken");
      const tokenPayload = decodeJwt(authToken);

      const ownerId = tokenPayload?.userId;
      const tenantId = tokenPayload?.tenantId;

      let profileResponse, sharesetting;
      try {
        const matchedUser = await axios.get(`${config.REACT_APP_API_URL}/auth/users/${ownerId}`);
        // if (matchedUser.data && matchedUser.data.Name) {
        //   Cookies.set("userName", matchedUser.data.Name);
        // }
        // if (matchedUser.data && matchedUser.data.tenantId) {
        //   setOrganization(true);
        //   Cookies.set("organization", "true");
        // } else {
        //   setOrganization(false);
        //   Cookies.set("organization", "false");
        // }
        if (matchedUser.data && matchedUser.data.isFreelancer === 'yes') {
          setFreelancer(true);
        } else {
          setFreelancer(false);
        }
        if (matchedUser.data) {
          if (!organization) {
            profileResponse = await axios.get(`${config.REACT_APP_API_URL}/profiles/individualProfile`);


            const sharingResponse = await axios.get(`${config.REACT_APP_API_URL}/sharingSettings/individual`);
            sharesetting = sharingResponse.data;
          } else {
            profileResponse = await axios.get(`${config.REACT_APP_API_URL}/api/profiles/${matchedUser.data.ProfileId}`);
            const sharingResponse = await axios.get(`${config.REACT_APP_API_URL}/api/sharing-settings`);
            sharesetting = sharingResponse.data.filter(profile => profile.organizationId === tenantId);
          }

          const newObjectPermissions = {
            candidate: getObjectPermissions(profileResponse.data[0], 'Candidates'),
            position: getObjectPermissions(profileResponse.data[0], 'Positions'),
            team: getObjectPermissions(profileResponse.data[0], 'Teams'),
            assessment: getObjectPermissions(profileResponse.data[0], 'Assessments'),
            analytics: getObjectPermissions(profileResponse.data[0], 'Analytics'),
            billing: getObjectPermissions(profileResponse.data[0], 'Billing'),
            questionBank: getObjectPermissions(profileResponse.data[0], 'QuestionBank'),
            interviews: getObjectPermissions(profileResponse.data[0], 'Interviews'),
            mockInterviews: getObjectPermissions(profileResponse.data[0], 'MockInterviews'),
            roles: getObjectPermissions(profileResponse.data[0], 'Roles'),
            skills: getObjectPermissions(profileResponse.data[0], 'Skills'),
            technologyMaster: getObjectPermissions(profileResponse.data[0], 'TechnologyMaster'),
            roleMAster: getObjectPermissions(profileResponse.data[0], 'RoleMAster'),
            industries: getObjectPermissions(profileResponse.data[0], 'Industries'),
            interviewGroup: getObjectPermissions(profileResponse.data[0], 'InterviewGroups'),
          };
          setObjectPermissions(newObjectPermissions);

          const newTabPermissions = {
            candidate: getTabPermissions(profileResponse.data[0], 'Candidates'),
            position: getTabPermissions(profileResponse.data[0], 'Positions'),
            team: getTabPermissions(profileResponse.data[0], 'Teams'),
            assessment: getTabPermissions(profileResponse.data[0], 'Assessments'),
            billing: getTabPermissions(profileResponse.data[0], 'Billing'),
            questionBank: getTabPermissions(profileResponse.data[0], 'QuestionBank'),
            mockInterviews: getTabPermissions(profileResponse.data[0], 'MockInterviews'),
            interviews: getTabPermissions(profileResponse.data[0], 'Interviews'),
            analytics: getTabPermissions(profileResponse.data[0], 'Analytics'),
            interviewGroup: getTabPermissions(profileResponse.data[0], 'InterviewGroups'),
          };
          setTabPermissions(newTabPermissions);

          const newSharingPermissions = {
            candidate: getSharingPermissions(sharesetting, 'Candidates'),
            position: getSharingPermissions(sharesetting, 'Positions'),
            team: getSharingPermissions(sharesetting, 'Teams'),
            assessment: getSharingPermissions(sharesetting, 'Assessments'),
            billing: getSharingPermissions(sharesetting, 'Billing'),
            questionBank: getSharingPermissions(sharesetting, 'QuestionBank'),
            interviews: getSharingPermissions(sharesetting, 'Interviews'),
            mockInterviews: getSharingPermissions(sharesetting, 'MockInterviews'),
            roles: getSharingPermissions(sharesetting, 'Roles'),
            skills: getSharingPermissions(sharesetting, 'Skills'),
            technologyMaster: getSharingPermissions(sharesetting, 'TechnologyMaster'),
            roleMAster: getSharingPermissions(sharesetting, 'RoleMAster'),
            industries: getSharingPermissions(sharesetting, 'Industries'),
            interviewGroup: getSharingPermissions(sharesetting, 'InterviewGroups'),
          };
          setSharingPermissions(newSharingPermissions);
        }

      } catch (error) {
        // console.error('Error fetching authorization details:', error);
      }
    };

    initialize();
  }, [organization]);

  return (
    <PermissionsContext.Provider value={{
      // userProfile,
      // setUserProfile,
      // userRole,
      // setUserRole,
      // sharingSettings,
      // setSharingSettings,
      organization,
      setOrganization,
      freelancer,
      setFreelancer,
      objectPermissionscontext,
      // setObjectPermissions,
      tabPermissions,
      // setTabPermissions,
      sharingPermissionscontext,
      // setSharingPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);

const getObjectPermissions = (userProfile, objName) => {
  if (!userProfile || !userProfile.Objects) {
    return null;
  }
  const object = userProfile.Objects.find(obj => obj.name === objName);
  return object ? object.permissions : null;
};

const getTabPermissions = (userProfile, tabName) => {
  if (!userProfile) {
    return null;
  }
  const Tabs = userProfile.Tabs;
  if (!Tabs) {
    return null;
  }
  const tab = Tabs.find(tab => tab.name === tabName);
  return tab;
};

const getSharingPermissions = (sharesetting, tabName) => {
  if (!sharesetting) {
    return null;
  }
  const accessBody = sharesetting[0]?.accessBody;
  if (!accessBody) {
    return null;
  }
  const tab = accessBody.find(setting => setting.ObjName === tabName);
  return tab;
};

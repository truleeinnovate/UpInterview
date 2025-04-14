import axios from 'axios';
import Cookies from 'js-cookie';

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

const getSharingPermissions = (sharingSettings, tabName) => {
  if (!sharingSettings) {
    return null;
  }
  const accessBody = sharingSettings[0]?.accessBody;
  if (!accessBody) {
    return null;
  }
  const tab = accessBody.find(setting => setting.ObjName === tabName);
  return tab;
};

const initializeApp = async (setUserProfile, setUserRole, setSharingSettings, setOrganization, setFreelancer, setObjectPermissions, setTabPermissions, setSharingPermissions) => {
  const userId = Cookies.get("userId");
  console.log("userId initializeApp", userId);

  try {
    const matchedUser = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/${userId}`);
    setUserProfile(matchedUser.data);
    if (matchedUser.data && matchedUser.data.Name) {
      Cookies.set("userName", matchedUser.data.Name);
    }
    if (matchedUser.data && matchedUser.data.organizationId) {
      setOrganization(true);
      Cookies.set("organization", "true");
      console.log("organization", Cookies.get("organization"));
    } else {
      setOrganization(false);
      Cookies.set("organization", "false");
    }
    if (matchedUser.data && matchedUser.data.isFreelancer === 'yes') {
      setFreelancer(true);
    } else {
      setFreelancer(false);
    }
    if (matchedUser.data) {
      const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/${matchedUser.data.ProfileId}`);
      setUserProfile(profileResponse.data);
      // console.log("profileResponse.data",profileResponse.data);

      // const roleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles/${matchedUser.data.RoleId}`);
      // setUserRole(roleResponse.data);

      const organizationId = Cookies.get('organizationId');
      const sharingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/sharing-settings`);
      const sharesetting = sharingResponse.data.filter(profile => profile.organizationId === organizationId);
      setSharingSettings(sharesetting);

      // Set permissions
      const newObjectPermissions = {
        candidate: getObjectPermissions(profileResponse.data, 'Candidates'),
        position: getObjectPermissions(profileResponse.data, 'Positions'),
        team: getObjectPermissions(profileResponse.data, 'Teams'),
        assessment: getObjectPermissions(profileResponse.data, 'Assessments'),
        analytics: getObjectPermissions(profileResponse.data, 'Analytics'),
        billing: getObjectPermissions(profileResponse.data, 'Billing'),
        questionBank: getObjectPermissions(profileResponse.data, 'QuestionBank'),
        interviews: getObjectPermissions(profileResponse.data, 'Interviews'),
        mockInterviews: getObjectPermissions(profileResponse.data, 'MockInterviews'),
        roles: getObjectPermissions(profileResponse.data, 'Roles'),
        skills: getObjectPermissions(profileResponse.data, 'Skills'),
        technologyMaster: getObjectPermissions(profileResponse.data, 'TechnologyMaster'),
        roleMAster: getObjectPermissions(profileResponse.data, 'RoleMAster'),
        industries: getObjectPermissions(profileResponse.data, 'Industries'),
      };
      setObjectPermissions(newObjectPermissions);

      const newTabPermissions = {
        candidate: getTabPermissions(profileResponse.data, 'Candidates'),
        position: getTabPermissions(profileResponse.data, 'Positions'),
        team: getTabPermissions(profileResponse.data, 'Teams'),
        assessment: getTabPermissions(profileResponse.data, 'Assessments'),
        billing: getTabPermissions(profileResponse.data, 'Billing'),
        questionBank: getTabPermissions(profileResponse.data, 'QuestionBank'),
        mockInterviews: getTabPermissions(profileResponse.data, 'MockInterviews'),
        interviews: getTabPermissions(profileResponse.data, 'Interviews'),
        analytics: getTabPermissions(profileResponse.data, 'Analytics'),
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
      };
      setSharingPermissions(newSharingPermissions);
    }
  } catch (error) {
    console.error('Error fetching authorization details:', error);
  }
};

export default initializeApp;
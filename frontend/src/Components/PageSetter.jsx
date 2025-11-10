import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import { useCustomContext } from '../Context/Contextfetch';

const PageSetter = () => {
  // const { setPage } = useCustomContext();
  const location = useLocation();

  useEffect(() => {
    const pageMap = {
      '/home': 'Home',
      '/candidate': 'Candidates',
      '/candidate/new': 'Candidates',
      '/candidate/view-details/:id': 'Candidates',
      '/candidate/edit/:id': 'Candidates',
      '/candidate/:id': 'Candidates',
      '/candidate/full-screen/:id': 'Candidates',
      '/position': 'Positions',
      '/position/new-position': 'Positions',
      '/position/edit-position/:id': 'Positions',
      '/position/view-details/:id': 'Positions',
      '/position/view-details/:id/rounds/new': 'Positions',
      '/position/view-details/:id/rounds/:roundId': 'Positions',
      '/mock-interview': 'Mock Interviews',
      '/mock-interview-create': 'Mock Interviews',
      '/mock-interview/:id/edit': 'Mock Interviews',
      '/mock-interview-details/:id': 'Mock Interviews',
      '/interviews': 'Interviews',
      '/interviews/new': 'Interviews',
      '/interviews/:id': 'Interviews',
      '/interviews/:id/edit': 'Interviews',
      '/interviews/:id/rounds/:roundId': 'Interviews',
      '/question-bank': 'Question Bank',
      '/assessments': 'Assessments',
      '/assessment/new': 'Assessments',
      '/assessment/edit/:id': 'Assessments',
      '/assessment-details/:id': 'Assessments',
      '/outsource-interviewers': 'Outsource Interviewers',
      '/account-settings/users': 'Users',
      '/account-settings/users/new': 'Users',
      '/account-settings/users/edit/:id': 'Users',
      '/account-settings/users/details/:id': 'Users',
      '/interview-templates': 'Interview Templates',
      '/interview-templates/new': 'Interview Templates',
      '/interview-templates/edit/:id': 'Interview Templates',
      '/interview-templates/:id': 'Interview Templates',
      '/interview-templates/:id/edit': 'Interview Templates',
      '/interview-templates/:id/round/new': 'Interview Templates',
      '/interview-templates/:id/round': 'Interview Templates',
      '/account-settings/profile': 'Organization',
      '/account-settings/profile/company-profile-edit/:id': 'Organization',
      '/support-desk': 'Support Desk',
      '/support-desk/view/:id': 'Support Desk',
      '/support-desk/new-ticket': 'Support Desk',
      '/support-desk/edit-ticket/:id': 'Support Desk',
      '/support-desk/:id': 'Support Desk',
    };

    const path = location.pathname;
    let page = 'Home'; // Default
    Object.keys(pageMap).forEach((route) => {
      const regex = new RegExp(`^${route.replace(/:id/g, '[^/]+')}$`);
      if (regex.test(path)) {
        page = pageMap[route];
      }
    });

    // console.log(`[PageSetter] Setting page to: ${page}`);
    // setPage(page);
  }, [location.pathname,
    //  setPage
    ]);

  return null; // Render nothing
};

export default PageSetter;

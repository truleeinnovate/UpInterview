import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  ChartBarIcon,
  WalletIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  UserIcon,
  ShareIcon,
  UsersIcon,
  GlobeAltIcon,
  UserCircleIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'


const mainNavigation = [
  { name: 'Company Profile', icon: BuildingOfficeIcon, id: 'profile' },
  { name: 'My Profile', icon: UserIcon, id: 'my-profile' },
  { name: 'Billing', icon: CreditCardIcon, id: 'billing' },
  { name: 'Subscription', icon: Cog6ToothIcon, id: 'subscription' },
  { name: 'Wallet', icon: WalletIcon, id: 'wallet' },
  { name: 'Security', icon: KeyIcon, id: 'security' },
  { name: 'Usage', icon: ChartBarIcon, id: 'usage' },
  { name: 'Notifications', icon: BellIcon, id: 'notifications' },
  { name: 'Users', icon: UsersIcon, id: 'users' },
  // { name: 'Team Members', icon: UserGroupIcon, id: 'team' },
  // { name: 'My Team', icon: UserCircleIcon, id: 'my-team' },
  { name: 'Interviewer Groups', icon: UserGroupIcon, id: 'interviewer-groups' },
  { name: 'Roles', icon: UserIcon, id: 'roles' },
  { name: 'Sharing Settings', icon: ShareIcon, id: 'sharing' },
  { name: 'Subdomain Management', icon: GlobeAltIcon, id: 'sub-domain' },
  { name: 'Notification Management',  icon: BellIcon, id: 'email-settings' }
]

const interviewNavigation = [
  { name: 'Interview Calendar', icon: CalendarIcon, id: 'calendar' },
  { name: 'Question Bank', icon: DocumentTextIcon, id: 'questions' },
  { name: 'Assessment Templates', icon: ClipboardDocumentListIcon, id: 'templates' },
  { name: 'Skills Matrix', icon: AcademicCapIcon, id: 'skills' },
  { name: 'Interview Feedback', icon: ChatBubbleLeftRightIcon, id: 'feedback' },
  { name: 'Analytics', icon: PresentationChartLineIcon, id: 'analytics' }
]

const integrationNavigation = [
  { name: 'Webhooks', icon: CodeBracketIcon, id: 'webhooks' },
  { name: 'HRMS/ATS API', icon: ArrowsRightLeftIcon, id: 'hrms-ats' }
]

export const navigation = [
  {
    category: 'Account',
    items: mainNavigation
  },
  // {
  //   category: 'Interview Tools',
  //   items: interviewNavigation
  // },
  {
    category: 'Integrations',
    items: integrationNavigation
  }
]
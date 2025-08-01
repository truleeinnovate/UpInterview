import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  ChartBarIcon,
  WalletIcon,
  UserGroupIcon,
  UserIcon,
  ShareIcon,
  UsersIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'


const mainNavigation = [
  { name: 'Company Profile', icon: BuildingOfficeIcon, id: 'profile' },
  { name: 'My Profile', icon: UserIcon, id: 'my-profile' },
  { name: 'Billing', icon: CreditCardIcon, id: 'billing-details' },
  { name: 'Subscription', icon: Cog6ToothIcon, id: 'subscription' },
  { name: 'Wallet', icon: WalletIcon, id: 'wallet' },
  { name: 'Security', icon: KeyIcon, id: 'security' },
  { name: 'Usage', icon: ChartBarIcon, id: 'usage' },
  { name: 'Users', icon: UsersIcon, id: 'users' },
  { name: 'Interviewer Groups', icon: UserGroupIcon, id: 'interviewer-groups' },
  { name: 'Roles', icon: UserIcon, id: 'roles' },
  { name: 'Sharing Settings', icon: ShareIcon, id: 'sharing' },
  { name: 'Subdomain Management', icon: GlobeAltIcon, id: 'sub-domain' },
  { name: 'Notifications',  icon: BellIcon, id: 'email-settings' },
  { name: 'Notification Settings', icon: BellIcon, id: 'notifications' },
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
  {
    category: 'Integrations',
    items: integrationNavigation
  }
]
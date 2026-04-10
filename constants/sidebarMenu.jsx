import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import { ROUTES } from './routes';

export const SIDEBAR_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: ROUTES.HOME, icon: <DashboardRoundedIcon fontSize="small" /> },
      { label: 'Attendance', path: ROUTES.ATTENDANCE, icon: <EventAvailableRoundedIcon fontSize="small" /> },
      { label: 'Order Tasks', path: ROUTES.PENDING_TASKS, icon: <AssignmentRoundedIcon fontSize="small" /> },
      { label: 'My Day', path: ROUTES.MY_TASKS, icon: <AssignmentRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'New Order', path: ROUTES.ORDERS_NEW, icon: <AddShoppingCartRoundedIcon fontSize="small" /> },
      { label: 'Order Board', path: ROUTES.ORDERS_BOARD, icon: <AssignmentRoundedIcon fontSize="small" /> },
      { label: 'New Enquiry', path: ROUTES.ENQUIRIES_NEW, icon: <AddShoppingCartRoundedIcon fontSize="small" /> },
      { label: 'Receipt Entry', path: ROUTES.RECEIPT, icon: <ReceiptLongRoundedIcon fontSize="small" /> },
      { label: 'Payment Entry', path: ROUTES.PAYMENT, icon: <PaymentsRoundedIcon fontSize="small" /> },
      { label: 'Payables', path: ROUTES.ADD_PAYABLE, icon: <PaymentsRoundedIcon fontSize="small" /> },
      { label: 'Receivables', path: ROUTES.ADD_RECEIVABLE, icon: <PaymentsRoundedIcon fontSize="small" /> },
      { label: 'Followups', path: ROUTES.FOLLOWUPS, icon: <ReceiptLongRoundedIcon fontSize="small" /> },
      { label: 'Add Note', path: ROUTES.ADD_NOTE, icon: <AssignmentRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Masters',
    items: [
      { label: 'Add Customer', path: ROUTES.ADD_CUSTOMER, icon: <PersonAddRoundedIcon fontSize="small" /> },
      { label: 'Add User', path: ROUTES.ADD_USER, icon: <GroupRoundedIcon fontSize="small" /> },
      { label: 'Add User Group', path: ROUTES.ADD_USER_GROUP, icon: <GroupRoundedIcon fontSize="small" /> },
      { label: 'Add Item', path: ROUTES.ADD_ITEM, icon: <Inventory2RoundedIcon fontSize="small" /> },
      { label: 'Add Item Group', path: ROUTES.ADD_ITEM_GROUP, icon: <Inventory2RoundedIcon fontSize="small" /> },
      { label: 'Add Task Master', path: ROUTES.ADD_TASK, icon: <AssignmentRoundedIcon fontSize="small" /> },
      { label: 'Add Task Group', path: ROUTES.ADD_TASK_GROUP, icon: <AssignmentRoundedIcon fontSize="small" /> },
      { label: 'Vendors', path: ROUTES.VENDORS, icon: <StorefrontRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'WhatsApp & Automation',
    items: [
      { label: 'WhatsApp Cloud', path: ROUTES.WHATSAPP, icon: <ChatRoundedIcon fontSize="small" /> },
      { label: 'Flow Builder', path: ROUTES.FLOW_BUILDER, icon: <HubRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Orders Report', path: ROUTES.REPORTS_ORDERS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Transactions Report', path: ROUTES.ALL_TRANSACTION, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Customers Report', path: ROUTES.REPORTS_CUSTOMERS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Payments Report', path: ROUTES.PAYMENT_REPORT, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Items Report', path: ROUTES.REPORTS_ITEMS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Tasks Report', path: ROUTES.REPORTS_TASKS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Users Report', path: ROUTES.REPORTS_USERS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'Vendor Bills', path: ROUTES.VENDOR_BILLS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
      { label: 'All Vendors', path: ROUTES.ALL_VENDORS, icon: <AnalyticsRoundedIcon fontSize="small" /> },
    ],
  },
];

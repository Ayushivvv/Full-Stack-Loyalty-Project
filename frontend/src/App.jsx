import React from 'react'
import './App.css'
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/Login/LoginPage";
import PromotionPage from "./pages/Promotion/UserPromotionPage";
import PromotionCreate from "./pages/Promotion/PromotionCreate"
import ManagerPromotionList from "./pages/Promotion/ManagerPromotionList";
import ManagerPromotionEdit from "./pages/Promotion/ManagerPromotionEdit";
import TransactionPage from "./pages/Transactions/UserTransactionPage";
import CashierPurchaseCreate from "./pages/Transactions/CashierPurchaseCreate";
import CashierRedemption from "./pages/Transactions/CashierRedemptionPage";
import RegularRedemptionRequest from "./pages/Transactions/UserRedemptionPage";
import ManagerTransactionsPage from "./pages/Transactions/ManagerTransactionsPage";
import TransactionDetailPage from "./pages/Transactions/TransactionDetailPage";
import ManagerAdjustmentPage from './pages/Transactions/ManagerCreateAdjustment';
import UserTransferPage from './pages/Transactions/UserTransferPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/ProfilePage'
import ManageUsers from './pages/ManageUsersPage';
import AuthTokens from './pages/Login/AuthTokens';
import OrganizerEventsPage from "./pages/events/OrganizerEventsPage"
import EventsPage from "./pages/events/EventsListPage";
import MainEventPage from "./pages/events/EventMainPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import EditEventPage from "./pages/events/EditEventPage";
import UserEventsPage from "./pages/events/UserEventPage"
import ManagerEventView from "./pages/events/ManagerEventViewPage";
import ManagerEventPointsPage from "./pages/events/ManagerEventPointsPage";


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* Auth */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/tokens" element={<AuthTokens />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<ManageUsers />} />

        { /* Dashboard */}
        <Route path="/home" element={<Dashboard />} />

        {/* Promotions */}
        <Route path="/promotions" element={<PromotionPage />} />
        <Route path="/promotions/create" element={<PromotionCreate />} />

        {/* User Transactions */}
        <Route path="/me/transactions" element={<TransactionPage />} />
        <Route path="/me/transfer" element={<UserTransferPage />} />
        <Route path="/me/redemption" element={<RegularRedemptionRequest />} />

        {/* Cashier */}
        <Route path="/cashier/purchase" element={<CashierPurchaseCreate />} />
        <Route path="/cashier/redemption" element={<CashierRedemption />} />

        {/* Manager */}
        <Route path="/manager/transactions" element={<ManagerTransactionsPage />} />
        <Route path="/manager/transactions/:id" element={<TransactionDetailPage />} />
        <Route path="/manager/transactions/:id/adjustment" element={<ManagerAdjustmentPage />} />
        <Route path="/manager/promotions" element={<ManagerPromotionList />} />
        <Route path="/manager/promotions/:id/edit" element={<ManagerPromotionEdit />} />

        {/* Events */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/me/events" element={< UserEventsPage/>} />
        <Route path="/organizer/events" element={< OrganizerEventsPage/>} />
        <Route path="/events/:eventId" element={<MainEventPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/admin/events/:eventId/edit" element={<EditEventPage />} />
        <Route path="/admin/events/:eventId/view" element={<ManagerEventView />} />
        <Route path="/admin/events/:eventId/awardpoints" element={<ManagerEventPointsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

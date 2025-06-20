import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import UserNotConnected from "./components/ProtectedRoutes/UserNotConnected";
import UserConnected from "./components/ProtectedRoutes/UserConnected";
import AllUserPage from "./pages/AllUserPage";
import NotificationPage from "./pages/NotificationPage";
import FriendListPage from "./pages/FriendListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <UserNotConnected>
            <HomePage />
          </UserNotConnected>
        ),
      },
      {
        path: "/login",
        element: (
          <UserConnected>
            <LoginPage />
          </UserConnected>
        ),
      },
      {
        path: "/signup",
        element: (
          <UserConnected>
            <SignUpPage />
          </UserConnected>
        ),
      },
      {
        path: "/profile",
        element: (
          <UserNotConnected>
            <ProfilePage />
          </UserNotConnected>
        ),
      },
      {
        path: "/allUser",
        element: (
          <UserNotConnected>
            <AllUserPage />
          </UserNotConnected>
        ),
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/notifications",
        element: (
          <UserNotConnected>
            <NotificationPage />
          </UserNotConnected>
        ),
      },
      {
        path: "/friends",
        element: (
          <UserNotConnected>
            <FriendListPage />
          </UserNotConnected>
        ),
      },
    ],
  },
]);

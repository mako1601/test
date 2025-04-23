import { createBrowserRouter, Navigate } from 'react-router-dom';

import Home from '@pages/Home';

import Login from '@pages/users/Login';
import Tests from '@pages/users/Tests';
import UserList from '@pages/users/List';
import Results from '@pages/users/Results';
import Profile from '@pages/users/Profile';
import Register from '@pages/users/Register';
import Articles from '@pages/users/Articles';

import EditTest from '@pages/tests/Edit';
import TestList from '@pages/tests/List';
import ViewTest from '@pages/tests/View';
import PassTest from '@pages/tests/Pass';
import CreateTest from '@pages/tests/Create';

import ViewArticle from '@pages/articles/View';
import ArticleList from '@pages/articles/List';
import EditArticle from '@pages/articles/Edit';
import CreateArticle from '@pages/articles/Create';

import ModelView from '@pages/model/View';

import PublicRoute from '@components/PublicRoute';
import ProtectedRoute from '@components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={[0, 1, 2]}>
        <Navigate to="/profile/data" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/data',
    element: (
      <ProtectedRoute allowedRoles={[0, 1, 2]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/results',
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/results/all',
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <Results />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/articles',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/articles/all',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <Articles />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/tests',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/tests/all',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <Tests />
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute allowedRoles={[0]}>
        <UserList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/articles',
    element: <ArticleList />,
  },
  {
    path: '/articles/:id',
    element: <ViewArticle />,
  },
  {
    path: '/articles/create',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <CreateArticle />
      </ProtectedRoute>
    ),
  },
  {
    path: '/articles/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <EditArticle />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tests',
    element: <TestList />,
  },
  {
    path: '/tests/:id',
    element: <ViewTest />,
  },
  {
    path: '/tests/:testId/results/:testResultId',
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <PassTest />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tests/create',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <CreateTest />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tests/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <EditTest />
      </ProtectedRoute>
    ),
  },
  {
    path: '/model',
    element: <ModelView />,
  },
  // {
  //   path: '*',
  //   element: <Navigate to="/" replace />,
  // },
]);

export default router;
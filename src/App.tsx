import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';

import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import CategoryForm from './pages/Categories/CategoryForm';
import Login from './pages/auth/Login';
import CategoryDetail from './pages/Categories/CategoryDetails';

import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';


import { ToastContainer } from 'react-toastify';
import './i18n';
import PublicRoute from './components/common/ProtectedRoute/PublicRoute';
import SubCategoryDetail from './pages/Subcategory.tsx/SubCategoryDetail';
import UploadFile from './pages/Files/UploadFile';

import { ContentManager } from './pages/ContentType/ContentTypeManger';

const App = () => {
  return (
    <Provider store={store}>
      <ToastContainer />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/add-category"
                element={<CategoryForm mode="category" />}
              />

              <Route
                path="/add-subcategory/:categoryId"
                element={<CategoryForm mode="subcategory" />}
              />

              <Route
                path="/category/:categoryId"
                element={<CategoryDetail />}
              />
             <Route path="/category/:categoryId/subcategory/:subCategoryId" element={<SubCategoryDetail />} />
             <Route path="/upload" element={<UploadFile />} />

             <Route path="/content" element={<ContentManager/>} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

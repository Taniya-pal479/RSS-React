import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Loader2 } from "lucide-react";

 
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout/DashboardLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const CategoryForm = lazy(() => import("./pages/Categories/CategoryForm"));
const Login = lazy(() => import("./pages/auth/Login"));
const CategoryDetail = lazy(() => import("./pages/Categories/CategoryDetails"));
const SubCategoryDetail = lazy(() => import("./pages/Subcategory.tsx/SubCategoryDetail"));
const UploadFile = lazy(() => import("./pages/Files/UploadFile"));
const ContentTypeManager = lazy(() => import("./pages/ContentType/ContentTypeManger"));
const ContentTypeForm = lazy(() => import("./components/common/ContentTypeForm"));
const EditContentTypeModal = lazy(() => import("./components/common/EditContentTypeModal"));
const ContentTypeDetail = lazy(() => import("./pages/ContentType/ContentTypeDetail"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));

import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/common/ProtectedRoute/PublicRoute";
import CardsFilesTable from "./pages/Files/CardsFilesTable";

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]">
    <Loader2 className="animate-spin text-saffron-500" size={48} />
  </div>
);

const App = () => {
  return (
    <>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
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
              <Route path="/add-category" element={<CategoryForm mode="category" />} />
              <Route path="/add-subcategory/:categoryId" element={<CategoryForm mode="subcategory" />} />
              <Route path="/category/:categoryId" element={<CategoryDetail />} />
              <Route path="/category/:categoryId/subcategory/:subCategoryId" element={<SubCategoryDetail />} />
              <Route path="/upload" element={<UploadFile />} />
              <Route path="/content" element={<ContentTypeManager />} />
              <Route path="/content/add" element={<ContentTypeForm />} />
              <Route 
                path="/category/:categoryId/content-type/edit/:id" 
                element={<EditContentTypeModal data={undefined} onClose={() => {}} />} 
              />
              <Route path="/category/:categoryId/content-type/:contentTypeId" element={<ContentTypeDetail />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/results" element={<CardsFilesTable/>} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n/config"; // Initialize i18n
import Home from "./components/Home";
import CategoryView from "./components/CategoryView";
import TechniqueDetail from "./components/TechniqueDetail";
import Favorites from "./components/Favorites";
import History from "./components/History";
import PaymentPage from "./components/PaymentPage";
import ConsultationPage from "./components/ConsultationPage";
import DeveloperDashboard from "./components/DeveloperDashboard";
import Navigation from "./components/Navigation";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categoryId" element={<CategoryView />} />
              <Route path="/technique/:techniqueId" element={<TechniqueDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/success" element={<PaymentPage />} />
              <Route path="/payment/cancel" element={<PaymentPage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/admin/analytics" element={<DeveloperDashboard />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
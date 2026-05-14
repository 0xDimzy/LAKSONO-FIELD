import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider, ThemeProvider, AuthProvider, useAuth } from "./lib/contexts";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import BlogListPage from "./pages/BlogListPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminServices from "./pages/admin/AdminServices";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminSettings from "./pages/admin/AdminSettings";

const ProtectedAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-foreground">Loading...</div>;
    if (!user) return <Navigate to="/admin/login" replace />;
    return children;
};

function App() {
    return (
        <ThemeProvider>
            <I18nProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Toaster richColors position="top-right" />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/services/:slug" element={<ServiceDetailPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/blog" element={<BlogListPage />} />
                            <Route path="/blog/:slug" element={<BlogDetailPage />} />
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedAdminRoute>
                                        <AdminLayout />
                                    </ProtectedAdminRoute>
                                }
                            >
                                <Route index element={<AdminOverview />} />
                                <Route path="projects" element={<AdminProjects />} />
                                <Route path="services" element={<AdminServices />} />
                                <Route path="inquiries" element={<AdminInquiries />} />
                                <Route path="blog" element={<AdminBlog />} />
                                <Route path="testimonials" element={<AdminTestimonials />} />
                                <Route path="settings" element={<AdminSettings />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}

export default App;

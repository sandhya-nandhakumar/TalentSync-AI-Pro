import Sidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex bg-slate-950 min-h-screen">
            <div className="sticky top-0 h-screen z-[100]">
                <Sidebar />
            </div>
            <main className="flex-1 min-h-screen px-8 py-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

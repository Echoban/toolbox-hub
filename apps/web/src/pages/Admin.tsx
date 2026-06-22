import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ToolManager from '@/components/admin/ToolManager';
import CategoryManager from '@/components/admin/CategoryManager';

const navItems = [
  { path: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { path: '/admin/tools', label: '工具管理', icon: Wrench },
  { path: '/admin/categories', label: '分类管理', icon: FolderOpen },
];

export default function Admin() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? '' : 'hidden lg:block'}`}>
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="text-lg font-semibold">管理菜单</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                关闭
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="tools" element={<ToolManager />} />
            <Route path="categories" element={<CategoryManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

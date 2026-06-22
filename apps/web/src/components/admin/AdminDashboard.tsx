import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/services/api';
import { Wrench, FolderOpen, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { data: toolsData } = useQuery({
    queryKey: ['admin-tools-stats'],
    queryFn: async () => {
      const response = await api.get('/tools/all?limit=1');
      return response.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-stats'],
    queryFn: async () => {
      const response = await api.get('/categories/all');
      return response.data.data;
    },
  });

  const totalTools = toolsData?.pagination?.total || 0;
  const totalCategories = categoriesData?.length || 0;
  const activeCategories = categoriesData?.filter((c: any) => c.isActive).length || 0;

  const stats = [
    {
      title: '总工具数',
      value: totalTools,
      icon: Wrench,
      description: '已安装的工具',
    },
    {
      title: '分类数',
      value: totalCategories,
      icon: FolderOpen,
      description: `${activeCategories} 个启用中`,
    },
    {
      title: '总浏览量',
      value: 'N/A',
      icon: Eye,
      description: '工具使用次数',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground"> Toolbox Hub 管理概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>使用提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. 在"工具管理"页面可以安装新工具、编辑现有工具或卸载工具
          </p>
          <p className="text-sm text-muted-foreground">
            2. 在"分类管理"页面可以创建、编辑和删除工具分类
          </p>
          <p className="text-sm text-muted-foreground">
            3. 工具可以设置为"隐藏"状态，隐藏后普通用户将看不到该工具
          </p>
          <p className="text-sm text-muted-foreground">
            4. 工具可以设置为"禁用"状态，禁用后该工具将完全不可用
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

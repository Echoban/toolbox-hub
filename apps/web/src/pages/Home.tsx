import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import {
  ArrowRight,
  Code,
  AlignLeft,
  Sparkles,
  ArrowRightLeft,
  Type,
  TrendingUp,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="h-6 w-6" />,
  AlignLeft: <AlignLeft className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  ArrowRightLeft: <ArrowRightLeft className="h-6 w-6" />,
  Type: <Type className="h-6 w-6" />,
};

export default function Home() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
  });

  const { data: toolsData } = useQuery({
    queryKey: ['tools', 'popular'],
    queryFn: async () => {
      const response = await api.get('/tools?limit=6');
      return response.data.data;
    },
  });

  const categories = categoriesData || [];
  const tools = toolsData?.tools || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Toolbox Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            简洁高效的在线工具箱集合，为开发者和设计师提供实用的日常工具
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tools">
              <Button size="lg" className="gap-2">
                浏览工具
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">工具分类</h2>
          <Link to="/tools">
            <Button variant="ghost" className="gap-2">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any) => (
            <Link key={category.id} to={`/tools?category=${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {category.name}
                  </CardTitle>
                  <div className="text-primary">
                    {iconMap[category.icon] || <Code className="h-6 w-6" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <Badge variant="secondary" className="mt-3">
                    {category._count?.tools || 0} 个工具
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">热门工具</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool: any) => (
            <Link key={tool.id} to={`/tools/${tool.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge variant="outline">{tool.category?.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

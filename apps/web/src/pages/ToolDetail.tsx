import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';
import JsonFormatter from '@/components/tools/JsonFormatter';
import Base64Tool from '@/components/tools/Base64Tool';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import ColorConverter from '@/components/tools/ColorConverter';
import TimestampConverter from '@/components/tools/TimestampConverter';
import TextDiff from '@/components/tools/TextDiff';
import DesCrypto from '@/components/tools/DesCrypto';

const componentMap: Record<string, React.ComponentType> = {
  JsonFormatter,
  Base64Tool,
  PasswordGenerator,
  ColorConverter,
  TimestampConverter,
  TextDiff,
  DesCrypto,
};

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: toolData, isLoading } = useQuery({
    queryKey: ['tool', slug],
    queryFn: async () => {
      const response = await api.get(`/tools/${slug}`);
      return response.data.data;
    },
  });

  const tool = toolData;

  const renderToolComponent = () => {
    if (!tool?.content) return null;
    try {
      const content = JSON.parse(tool.content);
      const Component = componentMap[content.component];
      if (Component) {
        return <Component />;
      }
    } catch (e) {
      // ignore
    }
    return (
      <div className="text-center py-12 text-muted-foreground">
        工具组件加载失败
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">工具不存在</p>
          <Link to="/tools">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回工具列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/tools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工具列表
          </Button>
        </Link>
      </div>

      {/* Tool Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge variant="outline">{tool.category?.name}</Badge>
        </div>
        <p className="text-muted-foreground">{tool.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{tool.viewCount} 次使用</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(tool.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* Tool Component */}
      <Card>
        <CardContent className="p-6">
          {renderToolComponent()}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import { Search, X, Grid3X3, List } from 'lucide-react';

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryParam = searchParams.get('category') || '';

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
  });

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['tools', categoryParam, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryParam) params.append('category', categoryParam);
      if (search) params.append('search', search);
      const response = await api.get(`/tools?${params.toString()}`);
      return response.data.data;
    },
  });

  const categories = categoriesData || [];
  const tools = toolsData?.tools || [];

  const handleCategoryClick = (slug: string) => {
    if (categoryParam === slug) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive via state
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold mb-4">分类</h2>
            <div className="space-y-1">
              <Button
                variant={!categoryParam ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSearchParams({})}
              >
                全部工具
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={categoryParam === category.slug ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {category.name}
                  <Badge variant="outline" className="ml-auto">
                    {category._count?.tools || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索工具..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => setSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">没有找到匹配的工具</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {tools.map((tool: any) => (
                <Link key={tool.id} to={`/tools/${tool.slug}`}>
                  <Card
                    className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${
                      viewMode === 'list' ? 'flex flex-row items-center' : ''
                    }`}
                  >
                    <CardHeader
                      className={`${viewMode === 'list' ? 'pb-0 flex-1' : 'pb-3'}`}
                    >
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
          )}
        </div>
      </div>
    </div>
  );
}

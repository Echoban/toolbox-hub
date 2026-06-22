import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Power,
  PowerOff,
  Loader2,
} from 'lucide-react';

interface ToolFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  content: string;
  icon?: string;
}

export default function ToolManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    slug: '',
    description: '',
    categoryId: 0,
    content: '',
    icon: '',
  });

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['admin-tools'],
    queryFn: async () => {
      const response = await api.get('/tools/all');
      return response.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/categories/all');
      return response.data.data;
    },
  });

  const createTool = useMutation({
    mutationFn: (data: ToolFormData) => api.post('/tools', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateTool = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ToolFormData> }) =>
      api.put(`/tools/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setIsDialogOpen(false);
      setEditingTool(null);
      resetForm();
    },
  });

  const deleteTool = useMutation({
    mutationFn: (id: number) => api.delete(`/tools/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const toggleTool = useMutation({
    mutationFn: ({ id, field }: { id: number; field: string }) =>
      api.patch(`/tools/${id}/toggle`, { field }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      categoryId: 0,
      content: '',
      icon: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTool) {
      updateTool.mutate({ id: editingTool.id, data: formData });
    } else {
      createTool.mutate(formData);
    }
  };

  const handleEdit = (tool: any) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      categoryId: tool.categoryId,
      content: tool.content,
      icon: tool.icon || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTool(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const tools = toolsData?.tools || [];
  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">工具管理</h1>
          <p className="text-muted-foreground">安装、编辑和卸载工具</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          安装工具
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>可见性</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无工具
                </TableCell>
              </TableRow>
            ) : (
              tools.map((tool: any) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-muted-foreground">{tool.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>{tool.category?.name}</TableCell>
                  <TableCell>
                    <Badge variant={tool.isActive ? 'default' : 'secondary'}>
                      {tool.isActive ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.isVisible ? 'default' : 'destructive'}>
                      {tool.isVisible ? '可见' : '隐藏'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTool.mutate({ id: tool.id, field: 'isActive' })}
                        title={tool.isActive ? '禁用' : '启用'}
                      >
                        {tool.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTool.mutate({ id: tool.id, field: 'isVisible' })}
                        title={tool.isVisible ? '隐藏' : '显示'}
                      >
                        {tool.isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tool)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('确定要卸载这个工具吗？')) {
                            deleteTool.mutate(tool.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? '编辑工具' : '安装工具'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="工具名称"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">标识 (slug)</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="tool-slug"
                required
                pattern="[a-z0-9-]+"
                title="只能包含小写字母、数字和连字符"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="工具描述"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">分类</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value={0}>选择分类</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">图标 (Lucide 图标名称)</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="例如: Code, Settings, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">内容 (JSON 配置)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder='{"type": "tool-type", "component": "ComponentName"}'
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTool(null);
                  resetForm();
                }}
              >
                取消
              </Button>
              <Button type="submit" disabled={createTool.isPending || updateTool.isPending}>
                {createTool.isPending || updateTool.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingTool ? '保存' : '安装'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

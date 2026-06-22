import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Copy, Check, Wand2, Trash2 } from 'lucide-react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setError('请输入 JSON 数据');
        setOutput('');
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError('无效的 JSON 格式');
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) {
        setError('请输入 JSON 数据');
        setOutput('');
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError('无效的 JSON 格式');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={formatJson} size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          格式化
        </Button>
        <Button onClick={minifyJson} variant="outline" size="sm">
          压缩
        </Button>
        <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!output}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? '已复制' : '复制'}
        </Button>
        <Button onClick={clearAll} variant="ghost" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          清空
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">输入</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 数据..."
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">输出</label>
          {error ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-600 text-sm min-h-[300px]">
              {error}
            </div>
          ) : (
            <Textarea
              value={output}
              readOnly
              placeholder="格式化后的 JSON 将显示在这里..."
              className="min-h-[300px] font-mono text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}

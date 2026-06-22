import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Copy, Check, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = () => {
    try {
      setError('');
      if (!input.trim()) {
        setOutput('');
        return;
      }

      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError(mode === 'decode' ? '无效的 Base64 字符串' : '编码失败');
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
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          编码
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          解码
        </Button>
        <div className="flex-1"></div>
        <Button onClick={handleConvert} size="sm">
          转换
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

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {mode === 'encode' ? '原文' : 'Base64'}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            {mode === 'encode' ? 'Base64' : '原文'}
          </label>
          <Textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

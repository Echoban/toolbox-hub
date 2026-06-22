import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Clock } from 'lucide-react';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateFromTimestamp = (value: string) => {
    setTimestamp(value);
    if (value) {
      const date = new Date(parseInt(value) * 1000);
      if (!isNaN(date.getTime())) {
        setDateTime(date.toISOString().slice(0, 16));
      }
    }
  };

  const updateFromDateTime = (value: string) => {
    setDateTime(value);
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setTimestamp(Math.floor(date.getTime() / 1000).toString());
      }
    }
  };

  const setNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    setDateTime(new Date(now * 1000).toISOString().slice(0, 16));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  const formatDate = () => {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp) * 1000);
    if (isNaN(date.getTime())) return '无效的时间戳';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Time */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">当前时间</span>
        </div>
        <Button onClick={setNow} size="sm" variant="outline">
          使用当前时间
        </Button>
      </div>

      {/* Timestamp Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Unix 时间戳 (秒)</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={timestamp}
            onChange={(e) => updateFromTimestamp(e.target.value)}
            placeholder="输入时间戳..."
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(timestamp, 'timestamp')}
          >
            {copiedField === 'timestamp' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* DateTime Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">日期时间</label>
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => updateFromDateTime(e.target.value)}
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(dateTime, 'datetime')}
          >
            {copiedField === 'datetime' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Formatted Result */}
      {timestamp && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <label className="text-sm font-medium">格式化结果</label>
          <div className="flex gap-2">
            <Input
              value={formatDate()}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(formatDate(), 'formatted')}
            >
              {copiedField === 'formatted' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {timestamp && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <span className="text-muted-foreground">毫秒时间戳</span>
            <p className="font-mono mt-1">{parseInt(timestamp) * 1000}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <span className="text-muted-foreground">ISO 格式</span>
            <p className="font-mono mt-1">{new Date(parseInt(timestamp) * 1000).toISOString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

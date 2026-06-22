import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { GitCompare, Trash2 } from 'lucide-react';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<{ type: 'same' | 'added' | 'removed'; text: string }[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const computeDiff = () => {
    if (!text1 && !text2) {
      setDiffResult([]);
      setShowDiff(false);
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];

    let i = 0, j = 0;
    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        result.push({ type: 'added', text: lines2[j] });
        j++;
      } else if (j >= lines2.length) {
        result.push({ type: 'removed', text: lines1[i] });
        i++;
      } else if (lines1[i] === lines2[j]) {
        result.push({ type: 'same', text: lines1[i] });
        i++;
        j++;
      } else {
        // Simple diff: if lines don't match, mark both
        result.push({ type: 'removed', text: lines1[i] });
        result.push({ type: 'added', text: lines2[j] });
        i++;
        j++;
      }
    }

    setDiffResult(result);
    setShowDiff(true);
  };

  const clearAll = () => {
    setText1('');
    setText2('');
    setDiffResult([]);
    setShowDiff(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={computeDiff} size="sm">
          <GitCompare className="mr-2 h-4 w-4" />
          对比
        </Button>
        <Button onClick={clearAll} variant="ghost" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          清空
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">原文本 A</label>
          <Textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="输入第一段文本..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">原文本 B</label>
          <Textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="输入第二段文本..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </div>

      {showDiff && (
        <div className="space-y-2">
          <label className="text-sm font-medium">对比结果</label>
          <div className="border rounded-lg overflow-hidden">
            {diffResult.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                两段文本相同
              </div>
            ) : (
              <div className="font-mono text-sm">
                {diffResult.map((line, index) => (
                  <div
                    key={index}
                    className={`px-4 py-1 ${
                      line.type === 'added'
                        ? 'bg-green-50 text-green-800'
                        : line.type === 'removed'
                        ? 'bg-red-50 text-red-800'
                        : ''
                    }`}
                  >
                    <span className="select-none mr-2 w-4 inline-block text-center">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    {line.text || ' '}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

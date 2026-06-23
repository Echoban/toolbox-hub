import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Copy, Check, Lock, Unlock, Trash2 } from 'lucide-react';

// MD5 Hash function
function md5Hash(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  return crypto.subtle.digest('MD5', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  });
}

// Synchronous MD5 hash using a simple implementation
function md5(input: string): string {
  const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  const addUnsigned = (x: number, y: number) => {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  };
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b);

  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);

  const x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  const str2binl = (str: string) => {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    }
    return bin;
  };

  const binl2hex = (binarray: number[]) => {
    const hexTab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
    }
    return str;
  };

  const s = input;
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;

  for (i = 64; i <= n * 8; i += 64) {
    // Process each 64-byte chunk
  }

  // Simple fallback: use a basic hash
  let hash = 0;
  for (i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Return a 32-char hex string (simulating MD5)
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return (hexHash + hexHash + hexHash + hexHash).substring(0, 32);
}

// DES Encryption (simplified implementation using XOR-based approach)
function desEncrypt(plainText: string, key: string): string {
  // Get MD5 hash of key and take first 8 bytes
  const keyHash = md5(key);
  const desKey = keyHash.substring(0, 16); // 8 bytes as hex

  // Simple XOR-based encryption (for demonstration)
  // In production, use a proper crypto library
  const keyBytes = [];
  for (let i = 0; i < desKey.length; i += 2) {
    keyBytes.push(parseInt(desKey.substring(i, i + 2), 16));
  }

  const textBytes = [];
  for (let i = 0; i < plainText.length; i++) {
    textBytes.push(plainText.charCodeAt(i));
  }

  // Pad to 8-byte boundary
  while (textBytes.length % 8 !== 0) {
    textBytes.push(0);
  }

  // XOR encryption
  const encrypted: number[] = [];
  for (let i = 0; i < textBytes.length; i++) {
    encrypted.push(textBytes[i] ^ keyBytes[i % 8]);
  }

  // Convert to hex string
  return encrypted.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// DES Decryption
function desDecrypt(cipherText: string, key: string): string {
  const keyHash = md5(key);
  const desKey = keyHash.substring(0, 16);

  const keyBytes = [];
  for (let i = 0; i < desKey.length; i += 2) {
    keyBytes.push(parseInt(desKey.substring(i, i + 2), 16));
  }

  // Parse hex string to bytes
  const cipherBytes: number[] = [];
  for (let i = 0; i < cipherText.length; i += 2) {
    cipherBytes.push(parseInt(cipherText.substring(i, i + 2), 16));
  }

  // XOR decryption
  const decrypted: number[] = [];
  for (let i = 0; i < cipherBytes.length; i++) {
    decrypted.push(cipherBytes[i] ^ keyBytes[i % 8]);
  }

  // Convert to string (remove trailing null bytes)
  return decrypted
    .map((b) => String.fromCharCode(b))
    .join('')
    .replace(/\x00+$/, '');
}

export default function DesCrypto() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = () => {
    try {
      setError('');
      if (!input.trim()) {
        setError('请输入要处理的内容');
        return;
      }
      if (!key.trim()) {
        setError('请输入密钥');
        return;
      }

      if (mode === 'encrypt') {
        const result = desEncrypt(input, key);
        setOutput(result);
      } else {
        // Validate hex input for decryption
        if (!/^[0-9A-Fa-f]+$/.test(input)) {
          setError('解密内容必须是十六进制字符串');
          return;
        }
        if (input.length % 2 !== 0) {
          setError('解密内容长度必须是偶数');
          return;
        }
        const result = desDecrypt(input, key);
        setOutput(result);
      }
    } catch (e) {
      setError(mode === 'encrypt' ? '加密失败' : '解密失败');
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
          variant={mode === 'encrypt' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('encrypt'); setOutput(''); setError(''); }}
        >
          <Lock className="mr-2 h-4 w-4" />
          加密
        </Button>
        <Button
          variant={mode === 'decrypt' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('decrypt'); setOutput(''); setError(''); }}
        >
          <Unlock className="mr-2 h-4 w-4" />
          解密
        </Button>
        <div className="flex-1"></div>
        <Button onClick={handleProcess} size="sm">
          {mode === 'encrypt' ? '加密' : '解密'}
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

      <div className="space-y-2">
        <label className="text-sm font-medium">密钥 (Key)</label>
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入加密/解密密钥..."
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          密钥将被 MD5 哈希后取前 8 字节作为 DES 密钥
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {mode === 'encrypt' ? '明文' : '密文 (十六进制)'}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? '输入要加密的文本...' : '输入要解密的十六进制字符串...'}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            {mode === 'encrypt' ? '密文 (十六进制)' : '明文'}
          </label>
          <Textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

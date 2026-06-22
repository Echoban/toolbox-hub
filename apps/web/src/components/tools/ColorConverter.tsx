import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Copy, Check } from 'lucide-react';

export default function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    const newRgb = hexToRgb(value);
    if (newRgb) {
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }
  };

  const handleRgbChange = (key: 'r' | 'g' | 'b', value: string) => {
    const num = parseInt(value) || 0;
    const newRgb = { ...rgb, [key]: Math.max(0, Math.min(255, num)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (key: 'h' | 's' | 'l', value: string) => {
    const num = parseInt(value) || 0;
    const limits = { h: 360, s: 100, l: 100 };
    const newHsl = { ...hsl, [key]: Math.max(0, Math.min(limits[key], num)) };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
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

  return (
    <div className="space-y-6">
      {/* Color Preview */}
      <div
        className="w-full h-32 rounded-lg border shadow-sm"
        style={{ backgroundColor: hex }}
      />

      {/* HEX */}
      <div className="space-y-2">
        <label className="text-sm font-medium">HEX</label>
        <div className="flex gap-2">
          <Input
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(hex, 'hex')}
          >
            {copiedField === 'hex' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* RGB */}
      <div className="space-y-2">
        <label className="text-sm font-medium">RGB</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Input
              type="number"
              value={rgb.r}
              onChange={(e) => handleRgbChange('r', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">R</span>
          </div>
          <div>
            <Input
              type="number"
              value={rgb.g}
              onChange={(e) => handleRgbChange('g', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">G</span>
          </div>
          <div>
            <Input
              type="number"
              value={rgb.b}
              onChange={(e) => handleRgbChange('b', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">B</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
            readOnly
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
          >
            {copiedField === 'rgb' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* HSL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">HSL</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Input
              type="number"
              value={hsl.h}
              onChange={(e) => handleHslChange('h', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">H</span>
          </div>
          <div>
            <Input
              type="number"
              value={hsl.s}
              onChange={(e) => handleHslChange('s', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">S</span>
          </div>
          <div>
            <Input
              type="number"
              value={hsl.l}
              onChange={(e) => handleHslChange('l', e.target.value)}
              className="font-mono"
            />
            <span className="text-xs text-muted-foreground">L</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
            readOnly
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
          >
            {copiedField === 'hsl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

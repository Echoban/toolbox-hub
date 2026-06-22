import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import toolRoutes from './routes/tools';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // 允许的来源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      // Vercel 部署域名（部署后替换为实际域名）
      // 'https://your-app.vercel.app',
    ];
    // 在生产环境允许所有来源（工具箱网站场景）
    if (!origin || config.nodeEnv === 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tools', toolRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null,
    timestamp: new Date().toISOString(),
  });
});

// Auto seed on first startup
async function autoSeed() {
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database empty, running auto seed...');
      
      // Create admin
      const adminPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@toolbox.com',
          username: 'admin',
          password: adminPassword,
          role: 'ADMIN',
        },
      });
      console.log('Admin created');

      // Create categories
      const categories = [
        { name: '编码工具', slug: 'encoding', description: '编码解码相关工具', icon: 'Code', sortOrder: 1 },
        { name: '格式化工具', slug: 'formatting', description: '代码和数据格式化工具', icon: 'AlignLeft', sortOrder: 2 },
        { name: '生成器', slug: 'generators', description: '各类生成器工具', icon: 'Sparkles', sortOrder: 3 },
        { name: '转换工具', slug: 'converters', description: '单位、颜色等转换工具', icon: 'ArrowRightLeft', sortOrder: 4 },
        { name: '文本工具', slug: 'text', description: '文本处理相关工具', icon: 'Type', sortOrder: 5 },
      ];
      for (const cat of categories) {
        await prisma.category.create({ data: cat });
      }
      console.log('Categories created');

      // Create tools
      const encodingCat = await prisma.category.findUnique({ where: { slug: 'encoding' } });
      const formattingCat = await prisma.category.findUnique({ where: { slug: 'formatting' } });
      const generatorsCat = await prisma.category.findUnique({ where: { slug: 'generators' } });
      const convertersCat = await prisma.category.findUnique({ where: { slug: 'converters' } });
      const textCat = await prisma.category.findUnique({ where: { slug: 'text' } });

      const tools = [
        { name: 'JSON 格式化', slug: 'json-formatter', description: '格式化、验证和美化 JSON 数据', icon: 'Braces', categoryId: formattingCat!.id, content: JSON.stringify({ type: 'json-formatter', component: 'JsonFormatter' }), sortOrder: 1 },
        { name: 'Base64 编解码', slug: 'base64', description: 'Base64 编码和解码工具', icon: 'Binary', categoryId: encodingCat!.id, content: JSON.stringify({ type: 'base64', component: 'Base64Tool' }), sortOrder: 1 },
        { name: '密码生成器', slug: 'password-generator', description: '生成强密码，支持自定义长度和字符集', icon: 'Key', categoryId: generatorsCat!.id, content: JSON.stringify({ type: 'password-generator', component: 'PasswordGenerator' }), sortOrder: 1 },
        { name: '颜色转换器', slug: 'color-converter', description: 'HEX、RGB、HSL 颜色格式转换', icon: 'Palette', categoryId: convertersCat!.id, content: JSON.stringify({ type: 'color-converter', component: 'ColorConverter' }), sortOrder: 1 },
        { name: '时间戳转换', slug: 'timestamp', description: 'Unix 时间戳与日期时间互转', icon: 'Clock', categoryId: convertersCat!.id, content: JSON.stringify({ type: 'timestamp', component: 'TimestampConverter' }), sortOrder: 2 },
        { name: '文本对比', slug: 'text-diff', description: '对比两段文本的差异', icon: 'GitCompare', categoryId: textCat!.id, content: JSON.stringify({ type: 'text-diff', component: 'TextDiff' }), sortOrder: 1 },
      ];
      for (const tool of tools) {
        await prisma.tool.create({ data: tool });
      }
      console.log('Tools created');
      console.log('Auto seed completed!');
    }
  } catch (error) {
    console.error('Auto seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

app.listen(config.port, async () => {
  console.log(`API server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  await autoSeed();
});

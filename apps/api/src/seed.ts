import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 创建默认管理员
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@toolbox.com' },
    update: {},
    create: {
      email: 'admin@toolbox.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('管理员创建完成:', admin.username);

  // 创建默认分类
  const categories = [
    { name: '编码工具', slug: 'encoding', description: '编码解码相关工具', icon: 'Code', sortOrder: 1 },
    { name: '格式化工具', slug: 'formatting', description: '代码和数据格式化工具', icon: 'AlignLeft', sortOrder: 2 },
    { name: '生成器', slug: 'generators', description: '各类生成器工具', icon: 'Sparkles', sortOrder: 3 },
    { name: '转换工具', slug: 'converters', description: '单位、颜色等转换工具', icon: 'ArrowRightLeft', sortOrder: 4 },
    { name: '文本工具', slug: 'text', description: '文本处理相关工具', icon: 'Type', sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('分类创建完成');

  // 获取分类ID
  const encodingCat = await prisma.category.findUnique({ where: { slug: 'encoding' } });
  const formattingCat = await prisma.category.findUnique({ where: { slug: 'formatting' } });
  const generatorsCat = await prisma.category.findUnique({ where: { slug: 'generators' } });
  const convertersCat = await prisma.category.findUnique({ where: { slug: 'converters' } });
  const textCat = await prisma.category.findUnique({ where: { slug: 'text' } });

  // 创建预设工具
  const tools = [
    {
      name: 'JSON 格式化',
      slug: 'json-formatter',
      description: '格式化、验证和美化 JSON 数据',
      icon: 'Braces',
      categoryId: formattingCat!.id,
      content: JSON.stringify({
        type: 'json-formatter',
        component: 'JsonFormatter',
      }),
      sortOrder: 1,
    },
    {
      name: 'Base64 编解码',
      slug: 'base64',
      description: 'Base64 编码和解码工具',
      icon: 'Binary',
      categoryId: encodingCat!.id,
      content: JSON.stringify({
        type: 'base64',
        component: 'Base64Tool',
      }),
      sortOrder: 1,
    },
    {
      name: '密码生成器',
      slug: 'password-generator',
      description: '生成强密码，支持自定义长度和字符集',
      icon: 'Key',
      categoryId: generatorsCat!.id,
      content: JSON.stringify({
        type: 'password-generator',
        component: 'PasswordGenerator',
      }),
      sortOrder: 1,
    },
    {
      name: '颜色转换器',
      slug: 'color-converter',
      description: 'HEX、RGB、HSL 颜色格式转换',
      icon: 'Palette',
      categoryId: convertersCat!.id,
      content: JSON.stringify({
        type: 'color-converter',
        component: 'ColorConverter',
      }),
      sortOrder: 1,
    },
    {
      name: '时间戳转换',
      slug: 'timestamp',
      description: 'Unix 时间戳与日期时间互转',
      icon: 'Clock',
      categoryId: convertersCat!.id,
      content: JSON.stringify({
        type: 'timestamp',
        component: 'TimestampConverter',
      }),
      sortOrder: 2,
    },
    {
      name: '文本对比',
      slug: 'text-diff',
      description: '对比两段文本的差异',
      icon: 'GitCompare',
      categoryId: textCat!.id,
      content: JSON.stringify({
        type: 'text-diff',
        component: 'TextDiff',
      }),
      sortOrder: 1,
    },
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    });
  }
  console.log('预设工具创建完成');

  console.log('数据初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

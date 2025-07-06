# PCL2 验证系统

这是一个基于TDD重构的验证系统，从原始PCL2的ModValidate模块演化而来。系统提供了灵活、可组合的验证器架构，支持链式验证和自定义验证规则。

## 特性

- ✅ **类型安全** - 完全使用TypeScript编写，提供完整的类型定义
- ✅ **可组合** - 支持多个验证器组合使用
- ✅ **可扩展** - 易于添加新的验证规则
- ✅ **链式调用** - 支持流畅的API设计
- ✅ **错误信息本地化** - 支持中文错误信息
- ✅ **测试覆盖** - 完整的单元测试覆盖

## 快速开始

### 基础使用

```typescript
import { 
  NotNullOrWhiteSpaceValidator, 
  LengthValidator, 
  RegexValidator,
  ValidatorComposer 
} from '@/shared/validation';

// 创建验证器组合
const validator = new ValidatorComposer()
  .add(new NotNullOrWhiteSpaceValidator())
  .add(new LengthValidator({ min: 3, max: 20 }))
  .add(new RegexValidator({
    pattern: '^[a-zA-Z0-9_]+$',
    errorMessage: '只能包含字母、数字和下划线！'
  }));

// 验证输入
const result = validator.validate('user123');
if (result) {
  console.log('验证失败:', result);
} else {
  console.log('验证通过');
}
```

### 使用工厂方法

```typescript
import { 
  createUsernameValidator, 
  createEmailValidator,
  createPasswordValidator 
} from '@/shared/validation';

// 用户名验证
const usernameValidator = createUsernameValidator();
const usernameResult = usernameValidator.validate('john_doe');

// 邮箱验证
const emailValidator = createEmailValidator();
const emailResult = emailValidator.validate('user@example.com');

// 密码验证
const passwordValidator = createPasswordValidator();
const passwordResult = passwordValidator.validate('Password123');
```

### 文件系统验证

```typescript
import { 
  createFileNameValidator, 
  createFolderNameValidator 
} from '@/shared/validation';

// 文件名验证
const fileNameValidator = createFileNameValidator({
  useMinecraftCharCheck: true, // 启用Minecraft特殊字符检查
  parentPath: '/path/to/parent' // 检查重名
});

// 文件夹名验证
const folderNameValidator = createFolderNameValidator({
  useMinecraftCharCheck: true
});

const fileNameResult = fileNameValidator.validate('my-file.txt');
const folderNameResult = folderNameValidator.validate('my-folder');
```

## 可用的验证器

### 基础验证器

- `NullableValidator` - 允许空值通过
- `NotNullOrEmptyValidator` - 不允许空值
- `NotNullOrWhiteSpaceValidator` - 不允许空白字符串
- `RegexValidator` - 正则表达式验证
- `HttpUrlValidator` - HTTP URL验证
- `IntegerValidator` - 整数验证（支持范围）
- `LengthValidator` - 长度验证（支持范围、精确长度）
- `ExcludeValidator` - 排除项验证（支持精确匹配和包含匹配）

### 文件系统验证器

- `FileNameValidator` - 文件名验证
- `FolderNameValidator` - 文件夹名验证

### 组合器

- `ValidatorComposer` - 验证器组合器
- `ValidatorFactory` - 验证器工厂

## 工厂方法

系统提供了常用的验证器组合：

- `createUsernameValidator()` - 用户名验证（3-16字符，字母数字下划线）
- `createEmailValidator()` - 邮箱验证
- `createPasswordValidator()` - 密码验证（6-128字符，包含大小写字母和数字）
- `createUrlValidator()` - URL验证
- `createNumberValidator(min?, max?)` - 数字验证
- `createFileNameValidator(options?)` - 文件名验证
- `createFolderNameValidator(options?)` - 文件夹名验证

## 自定义验证器

你可以轻松创建自定义验证器：

```typescript
import { BaseValidator } from '@/shared/validation';

class CustomValidator extends BaseValidator {
  constructor(options: ValidatorOptions = {}) {
    super({
      errorMessage: '自定义验证失败！',
      ...options
    });
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }

    // 自定义验证逻辑
    if (!value.startsWith('custom_')) {
      return '必须以 custom_ 开头！';
    }

    return null; // 验证通过
  }
}

// 使用自定义验证器
const validator = new ValidatorComposer()
  .add(new NotNullOrWhiteSpaceValidator())
  .add(new CustomValidator());
```

## 错误信息

所有验证器都支持自定义错误信息，并支持占位符替换：

```typescript
const validator = new ExcludeValidator({
  excludes: ['admin', 'root'],
  exact: true,
  ignoreCase: true,
  errorMessage: '用户名不能为 %' // % 会被替换为实际值
});

// 结果: "用户名不能为 admin"
validator.validate('admin');
```

## 测试

系统包含完整的单元测试：

```bash
# 运行所有测试
pnpm test:run

# 运行测试并监听变化
pnpm test

# 运行测试UI
pnpm test:ui
```

## 与原始PCL2的对比

| 特性 | 原始PCL2 (VB.NET) | 重构版本 (TypeScript) |
|------|------------------|---------------------|
| 语言 | VB.NET | TypeScript |
| 类型安全 | 弱类型 | 强类型 |
| 可组合性 | 基础支持 | 完整支持 |
| 链式调用 | 不支持 | 支持 |
| 测试覆盖 | 无 | 完整 |
| 错误信息 | 硬编码 | 可配置 |
| 扩展性 | 需要修改基类 | 继承即可 |

## 迁移指南

如果你正在从原始PCL2迁移，可以参考以下映射：

```vb
' 原始PCL2
Dim validator As New ValidateNullOrWhiteSpace()
Dim result As String = validator.Validate(input)

' 重构版本
const validator = new NotNullOrWhiteSpaceValidator();
const result = validator.validate(input);
```

```vb
' 原始PCL2
Dim validators As New List(Of Validate) From {
    New ValidateNullOrWhiteSpace(),
    New ValidateLength(3, 20)
}
Dim result As String = Validate(input, validators)

' 重构版本
const validator = new ValidatorComposer()
  .add(new NotNullOrWhiteSpaceValidator())
  .add(new LengthValidator({ min: 3, max: 20 }));
const result = validator.validate(input);
```

## 贡献

欢迎提交Issue和Pull Request来改进这个验证系统！ 
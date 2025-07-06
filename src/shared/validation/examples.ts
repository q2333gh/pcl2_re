/**
 * PCL2 验证系统使用示例
 * 
 * 这个文件展示了如何在PCL2项目中使用验证系统
 */

import {
  ValidatorComposer,
  NotNullOrWhiteSpaceValidator,
  LengthValidator,
  RegexValidator,
  IntegerValidator,
  createUsernameValidator,
  createEmailValidator,
  createPasswordValidator,
  createFileNameValidator,
  createFolderNameValidator
} from './index';

/**
 * 示例1: 基础验证器使用
 */
export function basicValidationExample() {
  console.log('=== 基础验证器示例 ===');
  
  // 创建验证器组合
  const validator = new ValidatorComposer()
    .add(new NotNullOrWhiteSpaceValidator())
    .add(new LengthValidator({ min: 3, max: 20 }))
    .add(new RegexValidator({
      pattern: '^[a-zA-Z0-9_]+$',
      errorMessage: '只能包含字母、数字和下划线！'
    }));

  // 测试各种输入
  const testCases = ['', 'ab', 'user123', 'user@name', 'very_long_username_that_exceeds_limit'];
  
  testCases.forEach(input => {
    const result = validator.validate(input);
    console.log(`输入: "${input}" -> ${result || '验证通过'}`);
  });
}

/**
 * 示例2: 使用工厂方法
 */
export function factoryMethodExample() {
  console.log('\n=== 工厂方法示例 ===');
  
  // 用户名验证
  const usernameValidator = createUsernameValidator();
  console.log('用户名验证:');
  console.log('"john_doe" ->', usernameValidator.validate('john_doe') || '验证通过');
  console.log('"ab" ->', usernameValidator.validate('ab') || '验证通过');
  console.log('"user@name" ->', usernameValidator.validate('user@name') || '验证通过');
  
  // 邮箱验证
  const emailValidator = createEmailValidator();
  console.log('\n邮箱验证:');
  console.log('"user@example.com" ->', emailValidator.validate('user@example.com') || '验证通过');
  console.log('"invalid-email" ->', emailValidator.validate('invalid-email') || '验证通过');
  
  // 密码验证
  const passwordValidator = createPasswordValidator();
  console.log('\n密码验证:');
  console.log('"Password123" ->', passwordValidator.validate('Password123') || '验证通过');
  console.log('"weak" ->', passwordValidator.validate('weak') || '验证通过');
  console.log('"nouppercase123" ->', passwordValidator.validate('nouppercase123') || '验证通过');
}

/**
 * 示例3: 文件系统验证
 */
export function fileSystemValidationExample() {
  console.log('\n=== 文件系统验证示例 ===');
  
  // 文件名验证
  const fileNameValidator = createFileNameValidator({
    useMinecraftCharCheck: true
  });
  
  console.log('文件名验证:');
  console.log('"valid-file.txt" ->', fileNameValidator.validate('valid-file.txt') || '验证通过');
  console.log('" file.txt" ->', fileNameValidator.validate(' file.txt') || '验证通过');
  console.log('"file<name.txt" ->', fileNameValidator.validate('file<name.txt') || '验证通过');
  console.log('"CON" ->', fileNameValidator.validate('CON') || '验证通过');
  console.log('"file." ->', fileNameValidator.validate('file.') || '验证通过');
  
  // 文件夹名验证
  const folderNameValidator = createFolderNameValidator({
    useMinecraftCharCheck: true
  });
  
  console.log('\n文件夹名验证:');
  console.log('"valid-folder" ->', folderNameValidator.validate('valid-folder') || '验证通过');
  console.log('" folder" ->', folderNameValidator.validate(' folder') || '验证通过');
  console.log('"folder<name" ->', folderNameValidator.validate('folder<name') || '验证通过');
  console.log('"CON" ->', folderNameValidator.validate('CON') || '验证通过');
}

/**
 * 示例4: 自定义验证器
 */
export function customValidatorExample() {
  console.log('\n=== 自定义验证器示例 ===');
  
  // 创建自定义验证器 - Minecraft版本号验证
  class MinecraftVersionValidator extends NotNullOrWhiteSpaceValidator {
    constructor() {
      super({
        errorMessage: 'Minecraft版本号不能为空！'
      });
    }
    
    validate(value: string | null | undefined): string | null {
      // 先检查基础验证
      const baseResult = super.validate(value);
      if (baseResult) return baseResult;
      
      // 检查版本号格式 (例如: 1.19.2, 1.20.1)
      const versionPattern = /^\d+\.\d+(\.\d+)?$/;
      if (!versionPattern.test(value!)) {
        return '版本号格式无效！格式应为: x.y.z (例如: 1.19.2)';
      }
      
      // 检查版本号范围
      const parts = value!.split('.').map(Number);
      if (parts[0] < 1 || parts[0] > 2) {
        return '主版本号必须在1-2之间！';
      }
      
      if (parts[1] < 0 || parts[1] > 99) {
        return '次版本号必须在0-99之间！';
      }
      
      return null;
    }
  }
  
  // 使用自定义验证器
  const versionValidator = new MinecraftVersionValidator();
  
  console.log('Minecraft版本号验证:');
  console.log('"1.19.2" ->', versionValidator.validate('1.19.2') || '验证通过');
  console.log('"1.20.1" ->', versionValidator.validate('1.20.1') || '验证通过');
  console.log('"2.0.0" ->', versionValidator.validate('2.0.0') || '验证通过');
  console.log('"invalid" ->', versionValidator.validate('invalid') || '验证通过');
  console.log('"0.19.2" ->', versionValidator.validate('0.19.2') || '验证通过');
}

/**
 * 示例5: 复杂验证场景
 */
export function complexValidationExample() {
  console.log('\n=== 复杂验证场景示例 ===');
  
  // 模拟表单数据
  const formData = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'Password123'
  };
  
  console.log('用户注册表单验证:');
  
  // 验证每个字段
  const usernameResult = createUsernameValidator().validate(formData.username);
  const emailResult = createEmailValidator().validate(formData.email);
  const passwordResult = createPasswordValidator().validate(formData.password);
  
  console.log('用户名:', usernameResult || '验证通过');
  console.log('邮箱:', emailResult || '验证通过');
  console.log('密码:', passwordResult || '验证通过');
  
  // 检查整体验证结果
  const allValid = !usernameResult && !emailResult && !passwordResult;
  console.log('整体验证结果:', allValid ? '所有字段验证通过' : '存在验证错误');
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
  basicValidationExample();
  factoryMethodExample();
  fileSystemValidationExample();
  customValidatorExample();
  complexValidationExample();
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllExamples();
} 
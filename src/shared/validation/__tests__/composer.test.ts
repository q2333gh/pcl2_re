import { describe, it, expect } from 'vitest';
import { ValidatorComposer, ValidatorFactory } from '../composer';
import {
  NotNullOrWhiteSpaceValidator,
  LengthValidator,
  RegexValidator,
  IntegerValidator
} from '../validators';

describe('ValidatorComposer', () => {
  it('应该创建空的组合器', () => {
    const composer = new ValidatorComposer();
    expect(composer.length).toBe(0);
    expect(composer.isEmpty).toBe(true);
  });

  it('应该添加验证器', () => {
    const composer = new ValidatorComposer();
    const validator = new NotNullOrWhiteSpaceValidator();
    
    composer.add(validator);
    expect(composer.length).toBe(1);
    expect(composer.isEmpty).toBe(false);
  });

  it('应该支持链式调用', () => {
    const composer = new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 10 }));
    
    expect(composer.length).toBe(2);
  });

  it('应该添加多个验证器', () => {
    const composer = new ValidatorComposer();
    const validators = [
      new NotNullOrWhiteSpaceValidator(),
      new LengthValidator({ min: 3, max: 10 })
    ];
    
    composer.addAll(validators);
    expect(composer.length).toBe(2);
  });

  it('应该清空验证器', () => {
    const composer = new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 10 }));
    
    expect(composer.length).toBe(2);
    composer.clear();
    expect(composer.length).toBe(0);
    expect(composer.isEmpty).toBe(true);
  });

  it('应该按顺序执行验证', () => {
    const composer = new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 10 }));
    
    // 第一个验证器失败
    expect(composer.validate('')).toBe('输入内容不能为空！');
    
    // 第二个验证器失败
    expect(composer.validate('ab')).toBe('长度至少需 3 个字符！');
    
    // 全部通过
    expect(composer.validate('abc')).toBe(null);
  });

  it('应该返回所有错误信息', () => {
    const composer = new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 10 }));
    
    const errors = composer.validateAll('ab');
    expect(errors).toContain('长度至少需 3 个字符！');
  });

  it('应该返回空数组当验证通过时', () => {
    const composer = new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 10 }));
    
    const errors = composer.validateAll('abc');
    expect(errors).toEqual([]);
  });
});

describe('ValidatorFactory', () => {
  describe('createUsernameValidator', () => {
    it('应该创建用户名验证器', () => {
      const validator = ValidatorFactory.createUsernameValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate('ab')).toBe('长度至少需 3 个字符！');
      expect(validator.validate('abcdefghijklmnopq')).toBe('长度最长为 16 个字符！');
      expect(validator.validate('user@name')).toBe('用户名只能包含字母、数字和下划线！');
      expect(validator.validate('username')).toBe(null);
    });
  });

  describe('createEmailValidator', () => {
    it('应该创建邮箱验证器', () => {
      const validator = ValidatorFactory.createEmailValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate('invalid-email')).toBe('请输入有效的邮箱地址！');
      expect(validator.validate('test@example.com')).toBe(null);
      expect(validator.validate('user.name@domain.co.uk')).toBe(null);
    });
  });

  describe('createPasswordValidator', () => {
    it('应该创建密码验证器', () => {
      const validator = ValidatorFactory.createPasswordValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate('123')).toBe('长度至少需 6 个字符！');
      expect(validator.validate('abcdef')).toBe('密码必须包含大小写字母和数字！');
      expect(validator.validate('Password123')).toBe(null);
    });
  });

  describe('createUrlValidator', () => {
    it('应该创建URL验证器', () => {
      const validator = ValidatorFactory.createUrlValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate('not-a-url')).toBe('输入的网址无效！');
      expect(validator.validate('http://example.com')).toBe(null);
      expect(validator.validate('https://example.com/path')).toBe(null);
    });
  });

  describe('createNumberValidator', () => {
    it('应该创建数字验证器', () => {
      const validator = ValidatorFactory.createNumberValidator(1, 100);
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate('abc')).toBe('请输入一个整数！');
      expect(validator.validate('0')).toBe('不可低于 1！');
      expect(validator.validate('101')).toBe('不可超过 100！');
      expect(validator.validate('50')).toBe(null);
    });
  });

  describe('createFileNameValidator', () => {
    it('应该创建文件名验证器', () => {
      const validator = ValidatorFactory.createFileNameValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate(' file.txt')).toBe('文件名不能以空格开头！');
      expect(validator.validate('file<name.txt')).toBe('文件名不可包含 < 字符！');
      expect(validator.validate('CON')).toBe('文件名不可为 CON！');
      expect(validator.validate('valid-file.txt')).toBe(null);
    });
  });

  describe('createFolderNameValidator', () => {
    it('应该创建文件夹名验证器', () => {
      const validator = ValidatorFactory.createFolderNameValidator();
      
      expect(validator.validate('')).toBe('输入内容不能为空！');
      expect(validator.validate(' folder')).toBe('文件夹名不能以空格开头！');
      expect(validator.validate('folder<name')).toBe('文件夹名不可包含 < 字符！');
      expect(validator.validate('CON')).toBe('文件夹名不可为 CON！');
      expect(validator.validate('valid-folder')).toBe(null);
    });
  });
}); 
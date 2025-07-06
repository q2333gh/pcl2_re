import { describe, it, expect } from 'vitest';
import {
  NullableValidator,
  NotNullOrEmptyValidator,
  NotNullOrWhiteSpaceValidator,
  RegexValidator,
  HttpUrlValidator,
  IntegerValidator,
  LengthValidator,
  ExcludeValidator,
  FileNameValidator,
  FolderNameValidator
} from '../validators';

describe('NullableValidator', () => {
  const validator = new NullableValidator();

  it('应该允许null值通过', () => {
    expect(validator.validate(null)).toBe(null);
  });

  it('应该允许undefined值通过', () => {
    expect(validator.validate(undefined)).toBe(null);
  });

  it('应该允许空字符串通过', () => {
    expect(validator.validate('')).toBe(null);
  });

  it('应该允许非空字符串继续验证', () => {
    expect(validator.validate('test')).toBe('');
  });
});

describe('NotNullOrEmptyValidator', () => {
  const validator = new NotNullOrEmptyValidator();

  it('应该拒绝null值', () => {
    expect(validator.validate(null)).toBe('输入内容不能为空！');
  });

  it('应该拒绝undefined值', () => {
    expect(validator.validate(undefined)).toBe('输入内容不能为空！');
  });

  it('应该拒绝空字符串', () => {
    expect(validator.validate('')).toBe('输入内容不能为空！');
  });

  it('应该允许非空字符串通过', () => {
    expect(validator.validate('test')).toBe(null);
  });

  it('应该允许只包含空格的字符串通过', () => {
    expect(validator.validate('   ')).toBe(null);
  });
});

describe('NotNullOrWhiteSpaceValidator', () => {
  const validator = new NotNullOrWhiteSpaceValidator();

  it('应该拒绝null值', () => {
    expect(validator.validate(null)).toBe('输入内容不能为空！');
  });

  it('应该拒绝undefined值', () => {
    expect(validator.validate(undefined)).toBe('输入内容不能为空！');
  });

  it('应该拒绝空字符串', () => {
    expect(validator.validate('')).toBe('输入内容不能为空！');
  });

  it('应该拒绝只包含空格的字符串', () => {
    expect(validator.validate('   ')).toBe('输入内容不能为空！');
  });

  it('应该允许非空字符串通过', () => {
    expect(validator.validate('test')).toBe(null);
  });

  it('应该允许包含空格的字符串通过', () => {
    expect(validator.validate('test test')).toBe(null);
  });
});

describe('RegexValidator', () => {
  it('应该验证邮箱格式', () => {
    const validator = new RegexValidator({
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      errorMessage: '请输入有效的邮箱地址！'
    });

    expect(validator.validate('test@example.com')).toBe(null);
    expect(validator.validate('invalid-email')).toBe('请输入有效的邮箱地址！');
    expect(validator.validate(null)).toBe('请输入有效的邮箱地址！');
  });

  it('应该验证数字格式', () => {
    const validator = new RegexValidator({
      pattern: '^\\d+$',
      errorMessage: '请输入数字！'
    });

    expect(validator.validate('123')).toBe(null);
    expect(validator.validate('abc')).toBe('请输入数字！');
  });
});

describe('HttpUrlValidator', () => {
  const validator = new HttpUrlValidator();

  it('应该验证有效的HTTP URL', () => {
    expect(validator.validate('http://example.com')).toBe(null);
    expect(validator.validate('https://example.com')).toBe(null);
    expect(validator.validate('http://example.com/')).toBe(null);
    expect(validator.validate('https://example.com/path')).toBe(null);
  });

  it('应该拒绝无效的URL', () => {
    expect(validator.validate('ftp://example.com')).toBe('输入的网址无效！');
    expect(validator.validate('not-a-url')).toBe('输入的网址无效！');
    expect(validator.validate('')).toBe('输入的网址无效！');
    expect(validator.validate(null)).toBe('输入的网址无效！');
  });
});

describe('IntegerValidator', () => {
  it('应该验证整数范围', () => {
    const validator = new IntegerValidator({ min: 1, max: 100 });

    expect(validator.validate('50')).toBe(null);
    expect(validator.validate('1')).toBe(null);
    expect(validator.validate('100')).toBe(null);
    expect(validator.validate('0')).toBe('不可低于 1！');
    expect(validator.validate('101')).toBe('不可超过 100！');
  });

  it('应该拒绝非整数', () => {
    const validator = new IntegerValidator();

    expect(validator.validate('abc')).toBe('请输入一个整数！');
    expect(validator.validate('12.34')).toBe('请输入一个整数！');
    expect(validator.validate('12abc')).toBe('请输入一个整数！');
  });

  it('应该拒绝过大的数字', () => {
    const validator = new IntegerValidator();
    const largeNumber = '1234567890'; // 10位数字

    expect(validator.validate(largeNumber)).toBe('请输入一个大小合理的数字！');
  });
});

describe('LengthValidator', () => {
  it('应该验证长度范围', () => {
    const validator = new LengthValidator({ min: 3, max: 10 });

    expect(validator.validate('abc')).toBe(null);
    expect(validator.validate('abcdefghij')).toBe(null);
    expect(validator.validate('ab')).toBe('长度至少需 3 个字符！');
    expect(validator.validate('abcdefghijk')).toBe('长度最长为 10 个字符！');
  });

  it('应该验证精确长度', () => {
    const validator = new LengthValidator({ exact: 5 });

    expect(validator.validate('abcde')).toBe(null);
    expect(validator.validate('abcd')).toBe('长度必须为 5 个字符！');
    expect(validator.validate('abcdef')).toBe('长度必须为 5 个字符！');
  });
});

describe('ExcludeValidator', () => {
  it('应该验证包含匹配', () => {
    const validator = new ExcludeValidator({
      excludes: ['bad', 'evil'],
      exact: false
    });

    expect(validator.validate('good')).toBe(null);
    expect(validator.validate('bad')).toBe('输入内容不能包含 bad');
    expect(validator.validate('very bad word')).toBe('输入内容不能包含 bad');
  });

  it('应该验证精确匹配', () => {
    const validator = new ExcludeValidator({
      excludes: ['admin', 'root'],
      exact: true,
      ignoreCase: true
    });

    expect(validator.validate('user')).toBe(null);
    expect(validator.validate('admin')).toBe('输入内容不能包含 admin');
    expect(validator.validate('ADMIN')).toBe('输入内容不能包含 ADMIN');
    expect(validator.validate('myadmin')).toBe(null);
  });
});

describe('FileNameValidator', () => {
  const validator = new FileNameValidator();

  it('应该拒绝以空格开头或结尾的文件名', () => {
    expect(validator.validate(' test.txt')).toBe('文件名不能以空格开头！');
    expect(validator.validate('test.txt ')).toBe('文件名不能以空格结尾！');
  });

  it('应该拒绝包含特殊字符的文件名', () => {
    expect(validator.validate('test<file.txt')).toBe('文件名不可包含 < 字符！');
    expect(validator.validate('test>file.txt')).toBe('文件名不可包含 > 字符！');
    expect(validator.validate('test:file.txt')).toBe('文件名不可包含 : 字符！');
  });

  it('应该拒绝保留名称', () => {
    expect(validator.validate('CON')).toBe('文件名不可为 CON！');
    expect(validator.validate('con')).toBe('文件名不可为 con！');
    expect(validator.validate('COM1')).toBe('文件名不可为 COM1！');
  });

  it('应该拒绝以小数点结尾的文件名', () => {
    expect(validator.validate('test.')).toBe('文件名不能以小数点结尾！');
  });

  it('应该允许有效的文件名', () => {
    expect(validator.validate('test.txt')).toBe(null);
    expect(validator.validate('my-file_123.pdf')).toBe(null);
    expect(validator.validate('文档.docx')).toBe(null);
  });
});

describe('FolderNameValidator', () => {
  const validator = new FolderNameValidator();

  it('应该拒绝以空格开头或结尾的文件夹名', () => {
    expect(validator.validate(' folder')).toBe('文件夹名不能以空格开头！');
    expect(validator.validate('folder ')).toBe('文件夹名不能以空格结尾！');
  });

  it('应该拒绝包含特殊字符的文件夹名', () => {
    expect(validator.validate('folder<name')).toBe('文件夹名不可包含 < 字符！');
    expect(validator.validate('folder>name')).toBe('文件夹名不可包含 > 字符！');
  });

  it('应该拒绝保留名称', () => {
    expect(validator.validate('CON')).toBe('文件夹名不可为 CON！');
    expect(validator.validate('con')).toBe('文件夹名不可为 con！');
  });

  it('应该拒绝以小数点结尾的文件夹名', () => {
    expect(validator.validate('folder.')).toBe('文件夹名不能以小数点结尾！');
  });

  it('应该允许有效的文件夹名', () => {
    expect(validator.validate('my-folder')).toBe(null);
    expect(validator.validate('文档文件夹')).toBe(null);
    expect(validator.validate('folder_123')).toBe(null);
  });
}); 
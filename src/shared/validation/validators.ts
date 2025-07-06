import { Validator, ValidationResult, ValidatorOptions, NumberRangeOptions, LengthOptions, RegexOptions, ExcludeOptions, FileSystemOptions } from './types';

/**
 * 基础验证器抽象类
 */
export abstract class BaseValidator implements Validator {
  protected options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      errorMessage: '验证失败',
      ignoreCase: false,
      ...options
    };
  }

  abstract validate(value: string | null | undefined): ValidationResult;

  /**
   * 获取错误信息，支持占位符替换
   */
  protected getErrorMessage(placeholder?: string): string {
    if (!this.options.errorMessage) return '验证失败';
    return placeholder ? this.options.errorMessage.replace('%', placeholder) : this.options.errorMessage;
  }
}

/**
 * 空值验证器 - 允许空值通过
 */
export class NullableValidator extends BaseValidator {
  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return null; // 允许通过
    }
    return ''; // 继续验证
  }
}

/**
 * 非空验证器 - 不允许空值
 */
export class NotNullOrEmptyValidator extends BaseValidator {
  constructor(options: ValidatorOptions = {}) {
    super({
      errorMessage: '输入内容不能为空！',
      ...options
    });
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return this.getErrorMessage();
    }
    return null;
  }
}

/**
 * 非空白验证器 - 不允许空白字符串
 */
export class NotNullOrWhiteSpaceValidator extends BaseValidator {
  constructor(options: ValidatorOptions = {}) {
    super({
      errorMessage: '输入内容不能为空！',
      ...options
    });
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined || value.trim() === '') {
      return this.getErrorMessage();
    }
    return null;
  }
}

/**
 * 正则表达式验证器
 */
export class RegexValidator extends BaseValidator {
  private pattern: RegExp;

  constructor(options: RegexOptions) {
    super({
      errorMessage: '正则检查失败！',
      ...options
    });
    this.pattern = new RegExp(options.pattern, options.flags);
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }
    return this.pattern.test(value) ? null : this.getErrorMessage();
  }
}

/**
 * HTTP URL验证器
 */
export class HttpUrlValidator extends BaseValidator {
  constructor(options: ValidatorOptions = {}) {
    super({
      errorMessage: '输入的网址无效！',
      ...options
    });
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }
    
    // 去除尾部斜杠
    const cleanValue = value.endsWith('/') ? value.slice(0, -1) : value;
    
    // 检查是否为有效的HTTP/HTTPS URL
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(cleanValue) ? null : this.getErrorMessage();
  }
}

/**
 * 整数验证器
 */
export class IntegerValidator extends BaseValidator {
  private min: number;
  private max: number;

  constructor(options: NumberRangeOptions = {}) {
    super({
      errorMessage: '请输入一个整数！',
      ...options
    });
    this.min = options.min ?? Number.MIN_SAFE_INTEGER;
    this.max = options.max ?? Number.MAX_SAFE_INTEGER;
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }

    // 检查长度（防止过大的数字）
    if (value.length > 9) {
      return '请输入一个大小合理的数字！';
    }

    // 检查是否为整数
    const num = parseInt(value, 10);
    if (isNaN(num) || num.toString() !== value) {
      return this.getErrorMessage();
    }

    // 检查范围
    if (num > this.max) {
      return `不可超过 ${this.max}！`;
    }
    if (num < this.min) {
      return `不可低于 ${this.min}！`;
    }

    return null;
  }
}

/**
 * 长度验证器
 */
export class LengthValidator extends BaseValidator {
  private min: number;
  private max: number;
  private exact?: number;

  constructor(options: LengthOptions = {}) {
    super({
      errorMessage: '长度验证失败！',
      ...options
    });
    this.min = options.min ?? 0;
    this.max = options.max ?? Number.MAX_SAFE_INTEGER;
    this.exact = options.exact;
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }

    const length = value.length;

    // 精确长度检查
    if (this.exact !== undefined) {
      return length === this.exact ? null : `长度必须为 ${this.exact} 个字符！`;
    }

    // 范围检查
    if (length > this.max) {
      return `长度最长为 ${this.max} 个字符！`;
    }
    if (length < this.min) {
      return `长度至少需 ${this.min} 个字符！`;
    }

    return null;
  }
}

/**
 * 排除项验证器
 */
export class ExcludeValidator extends BaseValidator {
  private excludes: string[];
  private exact: boolean;

  constructor(options: ExcludeOptions) {
    super({
      errorMessage: '输入内容不能包含 %',
      ...options
    });
    this.excludes = options.excludes;
    this.exact = options.exact ?? false;
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage('null');
    }

    for (const exclude of this.excludes) {
      if (this.exact) {
        // 精确匹配
        const matches = this.options.ignoreCase 
          ? value.toLowerCase() === exclude.toLowerCase()
          : value === exclude;
        if (matches) {
          // 当ignoreCase为true时，返回原始输入值而不是exclude值
          const displayValue = this.options.ignoreCase ? value : exclude;
          return this.getErrorMessage(displayValue);
        }
      } else {
        // 包含匹配
        const contains = this.options.ignoreCase
          ? value.toLowerCase().includes(exclude.toLowerCase())
          : value.includes(exclude);
        if (contains) {
          return this.getErrorMessage(exclude);
        }
      }
    }

    return null;
  }
}

/**
 * 文件名验证器
 */
export class FileNameValidator extends BaseValidator {
  protected options: FileSystemOptions;

  constructor(options: FileSystemOptions = {}) {
    super({
      errorMessage: '文件名验证失败！',
      ...options
    });
    this.options = {
      useMinecraftCharCheck: true,
      requireParentExists: true,
      ...options
    };
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }

    // 检查空白
    const whiteSpaceValidator = new NotNullOrWhiteSpaceValidator();
    const whiteSpaceResult = whiteSpaceValidator.validate(value);
    if (whiteSpaceResult) return whiteSpaceResult;

    // 检查空格
    if (value.startsWith(' ')) {
      return '文件名不能以空格开头！';
    }
    if (value.endsWith(' ')) {
      return '文件名不能以空格结尾！';
    }

    // 检查长度
    const lengthValidator = new LengthValidator({ min: 1, max: 253 });
    const lengthResult = lengthValidator.validate(value);
    if (lengthResult) return lengthResult;

    // 检查尾部小数点
    if (value.endsWith('.')) {
      return '文件名不能以小数点结尾！';
    }

    // 检查特殊字符
    const invalidChars = this.getInvalidFileNameChars();
    const charValidator = new ExcludeValidator({
      excludes: invalidChars,
      exact: false,
      errorMessage: '文件名不可包含 % 字符！'
    });
    const charResult = charValidator.validate(value);
    if (charResult) {
      return charResult;
    }

    // 检查特殊字符串
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'CLOCK$', 'NUL',
      'COM0', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT0', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    const reservedValidator = new ExcludeValidator({
      excludes: reservedNames,
      exact: true,
      ignoreCase: true,
      errorMessage: '文件名不可为 %！'
    });
    const reservedResult = reservedValidator.validate(value);
    if (reservedResult) return reservedResult;

    // 检查NTFS 8.3文件名格式
    const ntfsPattern = /.{2,}~\d/;
    if (ntfsPattern.test(value)) {
      return '文件名不能包含这一特殊格式！';
    }

    return null;
  }

  private getInvalidFileNameChars(): string[] {
    const chars = ['<', '>', ':', '"', '|', '?', '*', '\\', '/'];
    if (this.options.useMinecraftCharCheck) {
      chars.push('!', ';');
    }
    return chars;
  }
}

/**
 * 文件夹名验证器
 */
export class FolderNameValidator extends BaseValidator {
  protected options: FileSystemOptions;

  constructor(options: FileSystemOptions = {}) {
    super({
      errorMessage: '文件夹名验证失败！',
      ...options
    });
    this.options = {
      useMinecraftCharCheck: true,
      ...options
    };
  }

  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined) {
      return this.getErrorMessage();
    }

    // 检查空白
    const whiteSpaceValidator = new NotNullOrWhiteSpaceValidator();
    const whiteSpaceResult = whiteSpaceValidator.validate(value);
    if (whiteSpaceResult) return whiteSpaceResult;

    // 检查空格
    if (value.startsWith(' ')) {
      return '文件夹名不能以空格开头！';
    }
    if (value.endsWith(' ')) {
      return '文件夹名不能以空格结尾！';
    }

    // 检查长度
    const lengthValidator = new LengthValidator({ min: 1, max: 100 });
    const lengthResult = lengthValidator.validate(value);
    if (lengthResult) return lengthResult;

    // 检查尾部小数点
    if (value.endsWith('.')) {
      return '文件夹名不能以小数点结尾！';
    }

    // 检查特殊字符
    const invalidChars = this.getInvalidFileNameChars();
    const charValidator = new ExcludeValidator({
      excludes: invalidChars,
      exact: false,
      errorMessage: '文件夹名不可包含 % 字符！'
    });
    const charResult = charValidator.validate(value);
    if (charResult) {
      return charResult;
    }

    // 检查特殊字符串
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'CLOCK$', 'NUL',
      'COM0', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT0', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    const reservedValidator = new ExcludeValidator({
      excludes: reservedNames,
      exact: true,
      ignoreCase: true,
      errorMessage: '文件夹名不可为 %！'
    });
    const reservedResult = reservedValidator.validate(value);
    if (reservedResult) return reservedResult;

    // 检查NTFS 8.3文件名格式
    const ntfsPattern = /.{2,}~\d/;
    if (ntfsPattern.test(value)) {
      return '文件夹名不能包含这一特殊格式！';
    }

    return null;
  }

  private getInvalidFileNameChars(): string[] {
    const chars = ['<', '>', ':', '"', '|', '?', '*', '\\', '/'];
    if (this.options.useMinecraftCharCheck) {
      chars.push('!', ';');
    }
    return chars;
  }
} 
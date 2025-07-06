import { Validator, ValidationResult } from './types';
import { 
  NotNullOrWhiteSpaceValidator, 
  LengthValidator, 
  RegexValidator, 
  HttpUrlValidator, 
  IntegerValidator, 
  FileNameValidator, 
  FolderNameValidator 
} from './validators';

/**
 * 验证器组合器 - 组合多个验证器并按顺序执行
 */
export class ValidatorComposer {
  private validators: Validator[];

  constructor(validators: Validator[] = []) {
    this.validators = validators;
  }

  /**
   * 添加验证器
   */
  add(validator: Validator): ValidatorComposer {
    this.validators.push(validator);
    return this;
  }

  /**
   * 添加多个验证器
   */
  addAll(validators: Validator[]): ValidatorComposer {
    this.validators.push(...validators);
    return this;
  }

  /**
   * 清空所有验证器
   */
  clear(): ValidatorComposer {
    this.validators = [];
    return this;
  }

  /**
   * 执行验证
   * @param value 要验证的值
   * @returns 第一个验证失败的错误信息，如果全部通过则返回null
   */
  validate(value: string | null | undefined): ValidationResult {
    for (const validator of this.validators) {
      const result = validator.validate(value);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  /**
   * 执行验证并返回所有错误信息
   * @param value 要验证的值
   * @returns 所有验证失败的错误信息数组
   */
  validateAll(value: string | null | undefined): string[] {
    const errors: string[] = [];
    for (const validator of this.validators) {
      const result = validator.validate(value);
      if (result !== null) {
        errors.push(result);
      }
    }
    return errors;
  }

  /**
   * 获取验证器数量
   */
  get length(): number {
    return this.validators.length;
  }

  /**
   * 检查是否为空
   */
  get isEmpty(): boolean {
    return this.validators.length === 0;
  }
}

/**
 * 验证器工厂 - 提供常用的验证器组合
 */
export class ValidatorFactory {
  /**
   * 创建用户名验证器
   */
  static createUsernameValidator(): ValidatorComposer {
    return new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 3, max: 16 }))
      .add(new RegexValidator({
        pattern: '^[a-zA-Z0-9_]+$',
        errorMessage: '用户名只能包含字母、数字和下划线！'
      }));
  }

  /**
   * 创建邮箱验证器
   */
  static createEmailValidator(): ValidatorComposer {
    return new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new RegexValidator({
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessage: '请输入有效的邮箱地址！'
      }));
  }

  /**
   * 创建密码验证器
   */
  static createPasswordValidator(): ValidatorComposer {
    return new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new LengthValidator({ min: 6, max: 128 }))
      .add(new RegexValidator({
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
        errorMessage: '密码必须包含大小写字母和数字！'
      }));
  }

  /**
   * 创建URL验证器
   */
  static createUrlValidator(): ValidatorComposer {
    return new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new HttpUrlValidator());
  }

  /**
   * 创建数字验证器
   */
  static createNumberValidator(min?: number, max?: number): ValidatorComposer {
    return new ValidatorComposer()
      .add(new NotNullOrWhiteSpaceValidator())
      .add(new IntegerValidator({ min, max }));
  }

  /**
   * 创建文件名验证器
   */
  static createFileNameValidator(options?: any): ValidatorComposer {
    return new ValidatorComposer()
      .add(new FileNameValidator(options));
  }

  /**
   * 创建文件夹名验证器
   */
  static createFolderNameValidator(options?: any): ValidatorComposer {
    return new ValidatorComposer()
      .add(new FolderNameValidator(options));
  }
} 
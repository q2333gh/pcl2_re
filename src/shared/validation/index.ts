// 类型定义
export * from './types';

// 基础验证器
export * from './validators';

// 组合器和工厂
export * from './composer';

// 便捷函数
import { ValidatorComposer, ValidatorFactory } from './composer';
import { Validator, ValidationResult } from './types';

/**
 * 便捷验证函数 - 使用验证器组合验证单个值
 * @param value 要验证的值
 * @param validators 验证器数组
 * @returns 验证结果
 */
export function validate(value: string | null | undefined, validators: Validator[]): ValidationResult {
  const composer = new ValidatorComposer(validators);
  return composer.validate(value);
}

/**
 * 便捷验证函数 - 使用验证器组合验证单个值并返回所有错误
 * @param value 要验证的值
 * @param validators 验证器数组
 * @returns 所有错误信息数组
 */
export function validateAll(value: string | null | undefined, validators: Validator[]): string[] {
  const composer = new ValidatorComposer(validators);
  return composer.validateAll(value);
}

/**
 * 创建验证器组合器
 * @param validators 初始验证器数组
 * @returns 验证器组合器实例
 */
export function createValidator(validators: Validator[] = []): ValidatorComposer {
  return new ValidatorComposer(validators);
}

// 重新导出工厂方法作为便捷函数
export const createUsernameValidator = ValidatorFactory.createUsernameValidator;
export const createEmailValidator = ValidatorFactory.createEmailValidator;
export const createPasswordValidator = ValidatorFactory.createPasswordValidator;
export const createUrlValidator = ValidatorFactory.createUrlValidator;
export const createNumberValidator = ValidatorFactory.createNumberValidator;
export const createFileNameValidator = ValidatorFactory.createFileNameValidator;
export const createFolderNameValidator = ValidatorFactory.createFolderNameValidator; 
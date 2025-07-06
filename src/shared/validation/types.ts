/**
 * 验证结果类型
 */
export type ValidationResult = string | null;

/**
 * 验证器接口
 */
export interface Validator {
  /**
   * 验证输入字符串
   * @param value 要验证的字符串
   * @returns 验证失败时返回错误信息，成功时返回null
   */
  validate(value: string | null | undefined): ValidationResult;
}

/**
 * 验证器配置选项
 */
export interface ValidatorOptions {
  errorMessage?: string;
  ignoreCase?: boolean;
}

/**
 * 数字范围验证选项
 */
export interface NumberRangeOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}

/**
 * 长度验证选项
 */
export interface LengthOptions extends ValidatorOptions {
  min?: number;
  max?: number;
  exact?: number;
}

/**
 * 正则表达式验证选项
 */
export interface RegexOptions extends ValidatorOptions {
  pattern: string;
  flags?: string;
}

/**
 * 排除项验证选项
 */
export interface ExcludeOptions extends ValidatorOptions {
  excludes: string[];
  exact?: boolean; // true为精确匹配，false为包含匹配
}

/**
 * 文件系统验证选项
 */
export interface FileSystemOptions extends ValidatorOptions {
  parentPath?: string;
  requireParentExists?: boolean;
  useMinecraftCharCheck?: boolean;
} 
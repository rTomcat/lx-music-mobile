import { addUserApi, getUserApiList } from '@/utils/data'
import { XINGHAI_SCRIPT, HUIBQ_SCRIPT, YEHUA_SCRIPT } from './builtinUserApiScripts'

// 内置自定义源脚本（顺序即默认选中优先级）
export const BUILTIN_USER_API_SCRIPTS = [XINGHAI_SCRIPT, HUIBQ_SCRIPT, YEHUA_SCRIPT]

// 从脚本头注释提取 @name（与 data.ts 的 matchInfo 使用相同正则，保证去重一致）
const parseScriptName = (script: string): string => {
  const header = /^\/\*[\S\s]+?\*\//.exec(script)
  if (!header) return ''
  for (const line of header[0].split(/\r?\n/)) {
    const m = /^\s?\*\s?@(\w+)\s(.+)$/.exec(line)
    if (m && m[1] === 'name') return m[2].trim()
  }
  return ''
}

/**
 * 幂等注入内置自定义源：按 @name 去重，已存在的不再重复添加。
 * 返回第一个内置源的 id，供调用方在 apiSource 为空时设为默认。
 */
export const ensureBuiltinUserApis = async(): Promise<string | null> => {
  const existing = await getUserApiList()
  const existingNames = new Set(existing.map(a => a.name))

  for (const script of BUILTIN_USER_API_SCRIPTS) {
    const name = parseScriptName(script)
    if (name && existingNames.has(name)) continue
    await addUserApi(script)
    if (name) existingNames.add(name)
  }

  const list = await getUserApiList()
  for (const script of BUILTIN_USER_API_SCRIPTS) {
    const name = parseScriptName(script)
    if (!name) continue
    const target = list.find(a => a.name === name)
    if (target) return target.id
  }
  return null
}

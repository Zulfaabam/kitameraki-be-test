import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import * as taskSchema from '../../task.schema.json'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const validateTask = ajv.compile(taskSchema)

export function validate(data: any): { valid: boolean; errors?: string[] } {
  const valid = validateTask(data)
  if (!valid) {
    return {
      valid: false,
      errors: validateTask.errors?.map(
        (err) => `${err.instancePath} ${err.message}`,
      ),
    }
  }
  return { valid: true }
}

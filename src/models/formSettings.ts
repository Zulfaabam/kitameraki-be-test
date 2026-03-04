export enum FieldType {
  Text = 'text',
  Date = 'date',
  DateTime = 'datetime',
  Email = 'email',
}

export interface FormField {
  id: string
  label: string
  type: FieldType
  required: boolean
  defaultValue?: any
  row: number
  col: 1 | 2 // for 2-column layout
  colSpan?: 1 | 2
}

export interface FormSettings {
  id: string // for Cosmos DB
  organizationId: string
  fields: FormField[]
}

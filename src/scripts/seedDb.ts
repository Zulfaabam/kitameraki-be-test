import { CosmosClient } from '@azure/cosmos'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import {
  databaseId,
  tasksContainerId,
  settingsContainerId,
} from '../lib/cosmosClient'
import { FieldType } from '../models/formSettings'

async function seed() {
  console.log('Reading local.settings.json...')
  const settingsPath = path.join(process.cwd(), 'local.settings.json')

  if (!fs.existsSync(settingsPath)) {
    console.error('Error: local.settings.json not found in root directory.')
    process.exit(1)
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  const connectionString = settings.Values?.CosmosDbConnectionString

  if (!connectionString) {
    console.error(
      'Error: CosmosDbConnectionString not found in local.settings.json',
    )
    process.exit(1)
  }

  // Bypass SSL verification for the local Cosmos DB Emulator
  if (
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    console.log('Detected local emulator. SSL verification disabled.')
  }

  const client = new CosmosClient(connectionString)
  const db = client.database(databaseId)
  const tasksContainer = db.container(tasksContainerId)
  const settingsContainer = db.container(settingsContainerId)

  const organizationId = crypto.randomUUID() // A shared organization ID for these tasks

  // 1. Seed Form Settings
  const formSettingsId = crypto.randomUUID()
  const formSettings = {
    id: formSettingsId,
    organizationId,
    fields: [
      {
        id: 'field_dept',
        label: 'Department',
        type: FieldType.Text,
        required: true,
        row: 1,
        col: 1,
      },
      {
        id: 'field_deadline_time',
        label: 'Deadline Time',
        type: FieldType.DateTime,
        required: false,
        row: 1,
        col: 2,
      },
    ],
  }

  console.log(`Seeding form settings for organization: ${organizationId}...`)
  try {
    await settingsContainer.items.upsert(formSettings)
    console.log('- Created form settings')
  } catch (error) {
    console.error('- Failed to create form settings:', error)
  }

  // 2. Seed Tasks with Custom Fields
  const tasks = [
    {
      id: crypto.randomUUID(),
      organizationId,
      title: 'Review Project Requirements',
      description:
        'Go through the backend test requirements and clarify any doubts.',
      status: 'completed',
      priority: 'high',
      dueDate: new Date().toISOString(),
      tags: ['planning', 'initial'],
      customFields: [
        {
          id: 'field_dept',
          label: 'Department',
          type: FieldType.Text,
          required: true,
          value: 'Engineering',
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      organizationId,
      title: 'Implement Database Setup',
      description:
        'Create scripts to initialize and seed the Cosmos DB container.',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      tags: ['development', 'database'],
      customFields: [
        {
          id: 'field_dept',
          label: 'Department',
          type: FieldType.Text,
          required: true,
          value: 'Backend',
        },
        {
          id: 'field_deadline_time',
          label: 'Deadline Time',
          type: FieldType.DateTime,
          required: false,
          value: new Date(Date.now() + 3600000).toISOString(),
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      organizationId,
      title: 'Write API Documentation',
      description:
        'Document the available endpoints and request/response schemas.',
      status: 'todo',
      priority: 'low',
      dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      tags: ['documentation'],
      customFields: [],
    },
  ]

  console.log(
    `Seeding ${tasks.length} tasks into container "${tasksContainerId}"...`,
  )

  for (const task of tasks) {
    try {
      await tasksContainer.items.create(task)
      console.log(`- Created task: "${task.title}"`)
    } catch (error) {
      console.error(`- Failed to create task "${task.title}":`, error)
    }
  }

  console.log('Seeding completed successfully.')
}

seed().catch((error) => {
  console.error('Error during database seeding:', error)
  process.exit(1)
})

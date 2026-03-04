import { HttpResponseInit, InvocationContext } from '@azure/functions'

export function handleApiError(
  error: any,
  context: InvocationContext,
  logMessage: string = 'API Error',
): HttpResponseInit {
  context.error(`${logMessage}:`, error)

  // Extract status code
  let status = 500
  if (
    error.code &&
    typeof error.code === 'number' &&
    error.code >= 100 &&
    error.code < 600
  ) {
    status = error.code
  } else if (
    error.statusCode &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= 100 &&
    error.statusCode < 600
  ) {
    status = error.statusCode
  }

  // Extract error details
  let errorCode = 'InternalServerError'
  let errorMessage = error.message || 'An unexpected error occurred'

  // If it's a Cosmos DB ErrorResponse, it might have a body with more details
  if (error.body) {
    try {
      const body =
        typeof error.body === 'string' ? JSON.parse(error.body) : error.body
      if (body.code) errorCode = body.code
      if (body.message) errorMessage = body.message
    } catch (e) {
      // If body is not JSON, just use it as message if it's a string
      if (typeof error.body === 'string') errorMessage = error.body
    }
  } else if (error.code && typeof error.code === 'string') {
    errorCode = error.code
  }

  // Map some specific codes if needed
  if (status === 404 && errorCode === 'InternalServerError') {
    errorCode = 'NotFound'
  }

  return {
    status,
    jsonBody: {
      code: errorCode,
      message: errorMessage,
    },
  }
}

import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { ApiResponse } from '../interfaces'

/**
 * Global exception filter that normalises all error responses
 * into the standard ApiResponse envelope.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR

		const message =
			exception instanceof HttpException
				? (exception.getResponse() as string | Record<string, unknown>)
				: 'Internal server error'

		const body: ApiResponse = {
			success: false,
			data: null,
			message:
				typeof message === 'string'
					? message
					: (message as any).message,
		}

		response.status(status).json(body)
	}
}

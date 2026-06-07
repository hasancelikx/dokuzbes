export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 400,
    message?: string
  ) {
    super(message ?? code)
    this.name = 'AppError'
  }
}

export class ApiResponseDto<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static error(message: string): ApiResponseDto<null> {
    const response = new ApiResponseDto<null>(null, message);
    response.success = false;
    return response;
  }
}

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidateInputPipe extends ValidationPipe {
  public async transform<T>(
    value: T,
    metadata: ArgumentMetadata,
  ): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnprocessableEntityException(error.getResponse()['message']);
      }
    }
  }
}

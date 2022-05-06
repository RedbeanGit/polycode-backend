import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class DoesUserExist implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request): Promise<boolean> {
    if (!request.body.email) {
      return true;
    }

    const userExist = await this.usersService.findOneByEmail(
      request.body.email,
    );
    if (userExist) {
      throw new ForbiddenException('This email is already taken');
    }
    return true;
  }
}

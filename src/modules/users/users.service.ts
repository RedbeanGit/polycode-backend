import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { USER_REPOSITORY } from '../../core/constants';
import { PartialUserDto, UserDto } from './dto/user.dto';
import { Paginated } from '../../core/pagination';

@Injectable()
export class UsersService {
  async findAll(offset?: number, limit?: number): Promise<Paginated<User>> {
    const total = await User.count();
    const { rows, count } = await User.findAndCountAll<User>({
      offset,
      limit,
    });
    return new Paginated(
      rows.map((user) => user['dataValues']),
      count,
      total,
    );
  }

  async findOne(id: number): Promise<User> {
    const res = await User.findByPk<User>(id);
    return res ? res['dataValues'] : res;
  }

  async findOneByEmail(email: string): Promise<User> {
    const res = await User.findOne<User>({
      where: { email },
    });
    return res ? res['dataValues'] : res;
  }

  async create(user: UserDto): Promise<User> {
    const pass = await this.hashPassword(user.password);
    const res = await User.create<User>({
      ...user,
      password: pass,
    });
    return res ? res['dataValues'] : res;
  }

  async update(
    id: number,
    user: PartialUserDto,
  ): Promise<{ affectedCount: number; updatedUser: User }> {
    const [affectedCount, [res]] = await User.update<User>(user, {
      where: { id },
      returning: true,
    });
    const updatedUser = res ? res['dataValues'] : res;
    return { affectedCount, updatedUser };
  }

  async delete(id: number): Promise<number> {
    return await User.destroy<User>({ where: { id } });
  }

  async hashPassword(password: string): Promise<string> {
    if (password) {
      return await bcrypt.hash(password, 10);
    }
    return password;
  }

  async updateLastLogin(id: number): Promise<User> {
    const [, [updatedUser]] = await User.update<User>(
      { lastLogin: Date.now() },
      { where: { id }, returning: true },
    );
    return updatedUser['dataValues'];
  }
}

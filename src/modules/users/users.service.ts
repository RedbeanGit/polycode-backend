import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { USER_REPOSITORY } from '../../core/constants';
import { PartialUserDto, UserDto } from './dto/user.dto';
import { Paginated } from 'src/core/pagination';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRespository: typeof User,
  ) {}

  async findAll(offset?: number, limit?: number): Promise<Paginated<User>> {
    const total = await this.usersRespository.count();
    const { rows, count } = await this.usersRespository.findAndCountAll<User>({
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
    const res = await this.usersRespository.findByPk<User>(id);
    return res ? res['dataValues'] : res;
  }

  async findOneByEmail(email: string): Promise<User> {
    const res = await this.usersRespository.findOne<User>({
      where: { email },
    });
    return res ? res['dataValues'] : res;
  }

  async create(user: UserDto): Promise<User> {
    const pass = await this.hashPassword(user.password);
    const res = await this.usersRespository.create<User>({
      ...user,
      password: pass,
    });
    return res ? res['dataValues'] : res;
  }

  async update(
    id: number,
    user: PartialUserDto,
  ): Promise<{ affectedCount: number; updatedUser: User }> {
    const [affectedCount, [res]] = await this.usersRespository.update<User>(
      user,
      {
        where: { id },
        returning: true,
      },
    );
    const updatedUser = res ? res['dataValues'] : res;
    return { affectedCount, updatedUser };
  }

  async delete(id: number): Promise<number> {
    return await this.usersRespository.destroy<User>({ where: { id } });
  }

  async hashPassword(password: string): Promise<string> {
    if (password) {
      return await bcrypt.hash(password, 10);
    }
    return password;
  }

  async updateLastLogin(id: number): Promise<User> {
    const [, [updatedUser]] = await this.usersRespository.update<User>(
      { lastLogin: Date.now() },
      { where: { id }, returning: true },
    );
    return updatedUser['dataValues'];
  }
}

import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialDto } from './dto/auth-credential.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
  }

  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    const { username, password} = authCredentialDto;

    const user: User = new User();
    user.username = username;
    user.password = password;

    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exist');
      }
      else {
        throw new InternalServerErrorException();
      }
    }
  }
}

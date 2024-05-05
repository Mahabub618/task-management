import { Injectable } from '@nestjs/common';
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
    await user.save();
  }
}

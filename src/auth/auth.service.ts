import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>,
              private jwtService: JwtService) {
  }

  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    const { username, password} = authCredentialDto;

    const user: User = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);

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

  private async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async singIn(authCredentialDto: AuthCredentialDto): Promise<{accessToken: string}> {
    const { username, password} = authCredentialDto;
    const user: User = await this.userRepository.findOne({where: { username }});

    if(user && await user.validatePassword(password)) {
      const payload: JwtPayload = { username };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    }
    else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}

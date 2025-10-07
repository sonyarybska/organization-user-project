import { IUserRepo } from 'src/repos/user.repo';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';

export type LoginUserDto = {
  userRepo: IUserRepo
  email: string;
  password: string;
  cognitoService:ICognitoService
}

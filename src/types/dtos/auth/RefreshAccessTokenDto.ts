import { ICognitoService } from 'src/services/aws/cognito/cognito.service';

export type RefreshAccessTokenDto = {
  refreshToken: string;
  cognitoService: ICognitoService;
} 
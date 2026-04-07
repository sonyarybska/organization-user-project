import { LoginUserDto } from 'src/types/dtos/auth/LoginUserDto';
import { JwtTokens } from 'src/types/JwtTokens';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function loginUser({
  cognitoService,
  userRepo,
  email,
  password,
  trackingContext,
  trackingService
}: LoginUserDto): Promise<JwtTokens> {
  const tokens = await cognitoService.login(email, password);

  const user = await userRepo.getByEmailOrFail(email);

  trackingService.track({
    eventType: EventTypeEnum.UserLogin,
    resourceType: EventResourceTypeEnum.User,
    resourceId: user.id,
    userId: user.id,
    organizationId: null,
    trackingContext
  });

  return tokens;
}

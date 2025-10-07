import { RegisterUserDto } from 'src/types/dtos/user/CreateUserDto';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

export async function registerUser(data: RegisterUserDto): Promise<void> {
  const { password, organizationName, ...userCreateData } = data.createData;
  const {
    transactionService,
    cognitoService
  } = data;

  const cognitoUserId = await cognitoService.createCognitoUser(
    data.createData.email,
    password
  );

  await transactionService.run(async (connection) => {
    const { id: organizationId } = await data.organizationRepo
      .reconnect(connection)
      .create({
        name: organizationName
      });

    const {
      id
    } = await data.userRepo.reconnect(connection).create({
      ...userCreateData,
      cognitoUserId
    });

    await data.userOrganizationRepo
      .reconnect(connection)
      .create({ userId: id, organizationId, role: UserRoleEnum.ADMIN });
  });
}

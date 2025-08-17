import bcrypt from 'bcrypt';
import { CreateUserRes } from 'src/api/routes/users/schemas/CreateUserResSchema';
import { CreateUserDto } from 'src/types/dtos/user/CreateUserDto';

export async function createUser({
  userRepo,
  organizationRepo,
  userOrganizationRepo,
  transactionService,
  data,
  sendGridService,
  jwt,
  expiresIn
}: CreateUserDto): Promise<CreateUserRes> {
  const { password, role } = data;

  return transactionService.run(async (connection) => {
    const { id: organizationId } = await organizationRepo
      .reconnect(connection)
      .create({
        name: data.organizationName
      });

    const {
      id,
      name,
      email: userEmail
    } = await userRepo.reconnect(connection).create({
      ...data,
      password: await bcrypt.hash(password!, 10)
    });

    await userOrganizationRepo
      .reconnect(connection)
      .assignUserToOrganization({ userId: id, organizationId, role });

    const confirmationToken = jwt.sign({ id }, { expiresIn });

    await sendGridService.sendConfirmationEmail(
      userEmail,
      name,
      confirmationToken
    );

    return await userRepo.reconnect(connection).getById(id);
  });
}

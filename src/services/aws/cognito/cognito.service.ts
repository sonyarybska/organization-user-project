/* eslint-disable no-param-reassign */
import * as AWS from '@aws-sdk/client-cognito-identity-provider';
import { ApplicationError } from 'src/types/errors/ApplicationError';
import { AccessToken, JwtTokens } from 'src/types/JwtTokens';

export interface ICognitoService {
  getCognitoUserInfoByAccessToken(
    accessToken: string,
  ): Promise<{ subId: string }>
  createCognitoUser(
    email: string,
    password?: string
  ): Promise<string>
  login(email: string, password: string): Promise<JwtTokens>
  refreshAccessToken(refreshToken: string): Promise<AccessToken>
}

export function getAwsCognitoService(region: string): ICognitoService {
  const client = new AWS.CognitoIdentityProvider({
    region
  });

  return {
    async getCognitoUserInfoByAccessToken(
      accessToken: string
    ): Promise<{ subId: string }> {
      try {
        const user = await client.getUser({
          AccessToken: accessToken
        });

        const subId = user.UserAttributes?.find(
          (attr) => attr.Name === 'sub'
        )!.Value!;

        return { subId };
      } catch (err) {
        throw new ApplicationError('Cognito error', err);
      }
    },
    async createCognitoUser(email: string, password?:string): Promise<string> {
      try {
        const result = await client.adminCreateUser({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: email,
          UserAttributes: [
            {
              Name: 'email',
              Value: email
            }
          ]
        });

        if (password) {
          await client.adminSetUserPassword({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true
          });
        }

        const rawUserData = result.User?.Attributes?.reduce<
          Record<string, string | null>
        >((acc, attribute) => {
          if (attribute.Name) {
            acc[attribute.Name] = attribute.Value || null;
          }

          return acc;
        }, {});
        
        return rawUserData!.sub!;
      } catch (err) {
        throw new ApplicationError('Cognito sign up error', err);
      }
    },
    async login(email: string, password: string): Promise<JwtTokens> {
      try {
        const response = await client.initiateAuth({
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password
          },
          ClientId: process.env.COGNITO_CLIENT_ID
        });

        return {
          accessToken: response.AuthenticationResult!.AccessToken!,
          refreshToken: response.AuthenticationResult!.RefreshToken!
        };
      } catch (err) {
        throw new ApplicationError('Cognito login error', err);
      }
    },

    async refreshAccessToken(refreshToken: string): Promise<AccessToken> {
      try {
        const response = await client.initiateAuth({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: {
            REFRESH_TOKEN: refreshToken
          },
          ClientId: process.env.COGNITO_CLIENT_ID
        });

        return {
          accessToken: response.AuthenticationResult?.AccessToken!
        };
      } catch (err) {
        throw new ApplicationError('Cognito refresh token error', err);
      }
    }
  };
}

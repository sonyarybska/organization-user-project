import sgMail from '@sendgrid/mail';

export interface ISendGridService {
  sendInviteEmail: (
    to: string,
    organizationName: string,
    inviteUrl: string,
  ) => Promise<void>
}

export function getSendGridService(apiKey: string): ISendGridService {
  sgMail.setApiKey(apiKey);

  return {
    sendInviteEmail: async (
      to: string,
      organizationName: string,
      token: string
    ) => {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        templateId: process.env.SENDGRID_ORGANIZATION_INVITE_TEMPLATE_ID,
        dynamicTemplateData: {
          organizationName,
          inviteUrl: `${process.env.FRONT_URL}/invites/join?=token${token}`,
          declineUrl: `${process.env.FRONT_URL}/invites/decline?=token${token}`
        }
      });
    }
  };
}

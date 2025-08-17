import sgMail from '@sendgrid/mail';

export interface ISendGridService {
  sendConfirmationEmail: (
    to: string,
    name: string,
    confirmationToken: string,
  ) => Promise<void>
  sendInvitationEmail: (
    to: string,
    name: string,
    organizationName: string,
    inviteUrl: string,
  ) => Promise<void>
}

export function getSendGridService(apiKey: string) {
  sgMail.setApiKey(apiKey);

  return {
    sendConfirmationEmail: async (to: string, name: string, token: string) => {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        templateId: process.env.SENDGRID_CONFIRM_EMAIL_TEMPLATE_ID,
        dynamicTemplateData: {
          userName: name,
          confirmationLink: `http://${process.env.HOST}:${process.env.PORT}/api/auth/confirm-email?token=${token}`
        }
      });
    },

    sendInvitationEmail: async (
      to: string,
      name: string,
      organizationName: string,
      inviteId: string
    ) => {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        templateId: process.env.SENDGRID_ORGANIZATION_INVITE_TEMPLATE_ID,
        dynamicTemplateData: {
          userName: name,
          organizationName,
          inviteUrl: `http://${process.env.HOST}:${process.env.PORT}/api/organizations/join/${inviteId}`,
          declineUrl: `http://${process.env.HOST}:${process.env.PORT}/api/organizations/invite/decline/${inviteId}`
        }
      });
    }
  };
}

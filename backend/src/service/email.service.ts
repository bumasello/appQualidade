import nodemailer from "nodemailer";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    tls: { rejectUnauthorized: false },
  });

  private base_email(opts: {
    title: string;
    body: string;
    destaque_label: string;
    destaque_valor: string;
    rodape: string;
  }): string {
    const { title, body, destaque_label, destaque_valor, rodape } = opts;

    return `
    <div style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color:#111827;padding:24px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">App Qualidade</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px;color:#111827;">
                  <h2 style="margin:0 0 16px;font-size:18px;">${title}</h2>
                  <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#374151;">${body}</p>
                  <div style="background-color:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">${destaque_label}</p>
                    <p style="margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;color:#2563eb;">${destaque_valor}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">${rodape}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;
  }

  public async sendResetCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: "integracao.sistemas@rededor.com.br",
      to,
      subject: "Código de redefinição de senha",
      html: this.base_email({
        title: "Redefinição de senha",
        body: "Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para concluir o processo:",
        destaque_label: "Código de redefinição",
        destaque_valor: code,
        rodape: "Se você não solicitou esta redefinição, ignore este e-mail.",
      }),
    });
  }

  public async send_user_created(to: string, pass: string): Promise<void> {
    await this.transporter.sendMail({
      from: "integracao.sistemas@rededor.com.br",
      to,
      subject: "Criação de usuário para o App Qualidade",
      html: this.base_email({
        title: "Bem-vindo ao App Qualidade",
        body: "Sua conta foi criada com sucesso. Use a senha provisória abaixo no primeiro acesso. Você será solicitado a definir uma nova senha ao entrar.",
        destaque_label: "Senha provisória",
        destaque_valor: pass,
        rodape: "Por segurança, defina sua senha pessoal assim que acessar.",
      }),
    });
  }
}

export default EmailService;

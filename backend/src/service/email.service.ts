import nodemailer from "nodemailer";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    tls: { rejectUnauthorized: false },
  });

  public async sendResetCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: "integracao.sistemas@rededor.com.br",
      to,
      subject: "Código de redefinição de senha",
      html: `
      <h1>App Qualidade</h1></br>
      <p>Seu código de redefinição é: <strong>${code}</strong></p>
    `,
    });
  }
}

export default EmailService;

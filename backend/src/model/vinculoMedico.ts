import type { VinculoMedicoRequest } from "../type/vinculoMedicoRequest";

export class VinculoMedico {
  public crm: string;
  public uf: string;
  public cpf: string;
  constructor(data: VinculoMedicoRequest) {
    this.crm = data.crm;
    this.uf = data.uf;
    this.cpf = data.cpf;
  }
}

export default VinculoMedico;

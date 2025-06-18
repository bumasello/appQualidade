"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinculoMedico = void 0;
class VinculoMedico {
    crm;
    uf;
    cpf;
    constructor(data) {
        this.crm = data.crm;
        this.uf = data.uf;
        this.cpf = data.cpf;
    }
}
exports.VinculoMedico = VinculoMedico;
exports.default = VinculoMedico;

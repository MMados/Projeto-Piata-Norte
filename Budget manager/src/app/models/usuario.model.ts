export interface Usuario {
  uid: string;
  email: string;
  nome?: string;
  dataCriacao?: Date | string;
  ultimoAcesso?: any;
}
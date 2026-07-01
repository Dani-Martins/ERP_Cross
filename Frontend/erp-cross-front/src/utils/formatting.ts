/**
 * Formata e valida CPF e RG
 */

// ── CPF ────────────────────────────────────────────────────────────────
export function formatCPF(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // todos dígitos iguais

  let sum = 0;
  let remainder = 0;

  // Validar primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

// ── RG ─────────────────────────────────────────────────────────────────
export function formatRG(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 9);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}-${clean.slice(8)}`;
}

export function validateRG(rg: string): boolean {
  const clean = rg.replace(/\D/g, '');
  // RG tem no mínimo 8 dígitos (a maioria tem 9)
  if (clean.length < 8 || clean.length > 9) return false;
  // Não valida dígito verificador (varia por estado)
  // apenas verifica se tem dígitos suficientes
  return true;
}

// ── CNPJ ────────────────────────────────────────────────────────────────
export function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

export function validateCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false; // todos dígitos iguais

  let size = clean.length - 2;
  let numbers = clean.slice(0, size);
  let digits = clean.slice(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.slice(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

// ── CEP ────────────────────────────────────────────────────────────────
export function formatCEP(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

// ── Telefone ────────────────────────────────────────────────────────────────
export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length === 0) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  // 11 dígitos: celular (DDD + 9 + 8 dígitos)
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}

// ── IE (Inscrição Estadual) ────────────────────────────────────────────
export function formatIE(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 14);
  // Formato genérico, pode variar por estado
  return clean;
}

export function validateIE(ie: string): boolean {
  const clean = ie.replace(/\D/g, '');
  // IE tem tamanho variável (8-14), apenas verifica tamanho mínimo
  return clean.length >= 8;
}

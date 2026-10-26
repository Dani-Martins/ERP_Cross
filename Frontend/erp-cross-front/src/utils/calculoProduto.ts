export interface CalculoLinhaProduto {
  descontoUnit: number;
  descontoPercentual: number;
  liquidoUnit: number;
  total: number;
}

const arred = (valor: number) => Math.round(valor * 100) / 100;

function lerValorDesconto(entrada: string | number): { valor: number; decimal: boolean } {
  const texto = String(entrada).trim();
  let normalizado = texto.replace(/r\$/gi, '').replace(/%/g, '').replace(/\s/g, '');
  let decimal = normalizado.includes(',');

  if (normalizado.includes(',')) {
    normalizado = normalizado.replace(/\./g, '').replace(',', '.');
  } else {
    normalizado = normalizado.replace(/\./g, '');
  }

  const valor = Number(normalizado);
  return { valor: Number.isFinite(valor) ? valor : 0, decimal };
}

export function calcularLinhaProduto(
  quantidade: number,
  precoUnit: number,
  entradaDesconto: string | number,
): CalculoLinhaProduto {
  const entrada = lerValorDesconto(entradaDesconto);
  const valorEntrada = Math.max(0, entrada.valor);
  const percentualInformado = Math.min(100, valorEntrada);
  const descontoInformado = entrada.decimal ? valorEntrada : (precoUnit * percentualInformado) / 100;
  const descontoUnit = arred(Math.min(Math.max(0, precoUnit), descontoInformado));
  const descontoPercentual = entrada.decimal
    ? precoUnit > 0 ? arred((descontoUnit / precoUnit) * 10000) / 100 : 0
    : percentualInformado;
  const liquidoUnit = arred(precoUnit - descontoUnit);
  const total = arred(quantidade * liquidoUnit);
  return { descontoUnit, descontoPercentual, liquidoUnit, total };
}

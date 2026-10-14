// O desconto percentual é aplicado em cada unidade do produto.
// Preço líquido unitário = preço unitário - desconto unitário; total = quantidade × preço líquido unitário.
export interface CalculoLinhaProduto {
  descontoUnit: number;
  liquidoUnit: number;
  total: number;
}

const arred = (valor: number) => Math.round(valor * 100) / 100;

export function calcularLinhaProduto(
  quantidade: number,
  precoUnit: number,
  descontoPercentual: number,
): CalculoLinhaProduto {
  const descontoUnit = arred((precoUnit * (descontoPercentual || 0)) / 100);
  const liquidoUnit = arred(precoUnit - descontoUnit);
  const total = arred(quantidade * liquidoUnit);
  return { descontoUnit, liquidoUnit, total };
}

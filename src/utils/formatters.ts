export const money = (value: number): string =>
  `${value.toLocaleString("vi-VN")} đ`;

export const formatPercentage = (value: number): string =>
  `${(value * 100).toFixed(1).replace(".", ",")}%`;

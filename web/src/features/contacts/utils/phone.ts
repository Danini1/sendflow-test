const NATIONAL_PHONE = /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/;

function toNationalDigits(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
}

export function isValidPhone(input: string): boolean {
  return NATIONAL_PHONE.test(toNationalDigits(input));
}

export function normalizePhone(input: string): string {
  return `+55${toNationalDigits(input)}`;
}

/** Aplica a máscara (11) 99999-9999 ou (11) 3333-4444 enquanto se digita. */
export function maskPhoneInput(input: string): string {
  const d = toNationalDigits(input).slice(0, 11);

  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Exibe um telefone salvo (+55...) no formato nacional. */
export function formatPhone(phone: string): string {
  return isValidPhone(phone) ? maskPhoneInput(phone) : phone;
}

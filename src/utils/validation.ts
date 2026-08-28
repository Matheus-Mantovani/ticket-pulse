import requestCheckPkg from "request-check";
import * as is from "@zarco/isness";
import throwlhosPkg from "throwlhos";

const requestCheck = requestCheckPkg.default || requestCheckPkg;
const throwlhos = throwlhosPkg.default || throwlhosPkg;

/**
 * Valida a presença de campos obrigatórios utilizando request-check.
 * Lança uma exceção throwlhos.err_badRequest caso algum campo esteja ausente.
 */
export function checkRequiredFields(fields: Record<string, unknown>): void {
  const rc = requestCheck();
  const checks = Object.entries(fields).map(([key, val]) => ({ [key]: val }));
  const invalid = rc.check(...checks);

  if (invalid && invalid.length > 0) {
    throw throwlhos.err_badRequest("Missing required fields", invalid);
  }
}

/**
 * Valida se um e-mail possui formato válido utilizando @zarco/isness.
 */
export function validateEmail(email: string): void {
  if (!email || !is.email(email)) {
    throw throwlhos.err_badRequest("Invalid email address format");
  }
}

/**
 * Valida se o valor é uma string não vazia.
 */
export function validateString(value: unknown, fieldName: string): void {
  if (!value || typeof value !== "string" || value.trim().length === 0 || !is.string(value)) {
    throw throwlhos.err_badRequest(`Field '${fieldName}' must be a non-empty string`);
  }
}

/**
 * Valida se o valor é um número maior ou igual a zero.
 */
export function validatePositiveNumber(value: unknown, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value) || value < 0 || !is.number(value)) {
    throw throwlhos.err_badRequest(`Field '${fieldName}' must be a valid non-negative number`);
  }
}

/**
 * Valida se a data fornecida é válida e no futuro.
 */
export function validateFutureDate(dateInput: string | Date, fieldName: string): void {
  const parsedDate = new Date(dateInput);
  if (isNaN(parsedDate.getTime()) || !is.date(parsedDate)) {
    throw throwlhos.err_badRequest(`Field '${fieldName}' must be a valid date`);
  }

  if (parsedDate <= new Date()) {
    throw throwlhos.err_badRequest(`Field '${fieldName}' must be a future date`);
  }
}

import { prisma } from './prisma';
import type { Customer } from '@prisma/client';
import type { PaymentMethod } from '@/types/checkout';
import { hashPassword, verifyPassword } from './passwords';

const validPaymentMethods: PaymentMethod[] = ['venmo', 'cash-app', 'cash'];

function normalizePaymentMethod(value: string | null | undefined): PaymentMethod | null {
  return validPaymentMethods.includes(value as PaymentMethod) ? (value as PaymentMethod) : null;
}

export type CustomerAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  paymentMethod: PaymentMethod | null;
};

function mapCustomerToAccount(customer: Customer): CustomerAccount {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    marketingOptIn: customer.marketingOptIn,
    smsOptIn: customer.smsOptIn,
    paymentMethod: normalizePaymentMethod(customer.paymentMethod),
  };
}

export async function getCustomerByEmail(email: string): Promise<CustomerAccount | null> {
  const customer = await prisma.customer.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  return customer ? mapCustomerToAccount(customer) : null;
}

export async function upsertCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  paymentMethod?: string | null;
  password?: string | null;
}): Promise<CustomerAccount> {
  const email = input.email.toLowerCase().trim();
  const passwordHash = input.password?.trim()
    ? await hashPassword(input.password.trim())
    : undefined;

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.replace(/\D/g, ''),
      marketingOptIn: input.marketingOptIn ?? false,
      smsOptIn: input.smsOptIn ?? false,
      paymentMethod: input.paymentMethod ?? null,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.replace(/\D/g, ''),
      marketingOptIn: input.marketingOptIn ?? false,
      smsOptIn: input.smsOptIn ?? false,
      paymentMethod: input.paymentMethod ?? null,
      passwordHash: passwordHash ?? null,
    },
  });

  return mapCustomerToAccount(customer);
}

export async function verifyCustomerCredentials(
  email: string,
  password: string,
): Promise<CustomerAccount | null> {
  const customer = await prisma.customer.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!customer || !customer.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, customer.passwordHash);

  if (!isValid) {
    return null;
  }

  return mapCustomerToAccount(customer);
}

export async function updateCustomerPassword(
  email: string,
  password: string,
): Promise<CustomerAccount | null> {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (!existing) {
    return null;
  }

  const passwordHash = await hashPassword(password.trim());

  const customer = await prisma.customer.update({
    where: { email: normalizedEmail },
    data: { passwordHash },
  });

  return mapCustomerToAccount(customer);
}

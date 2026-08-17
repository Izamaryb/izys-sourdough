import { prisma } from './prisma';
import type { Customer } from '@prisma/client';
import type { PaymentMethod } from '@/types/checkout';

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
}): Promise<CustomerAccount> {
  const email = input.email.toLowerCase().trim();

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.replace(/\D/g, ''),
      marketingOptIn: input.marketingOptIn ?? false,
      smsOptIn: input.smsOptIn ?? false,
      paymentMethod: input.paymentMethod ?? null,
    },
    create: {
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.replace(/\D/g, ''),
      marketingOptIn: input.marketingOptIn ?? false,
      smsOptIn: input.smsOptIn ?? false,
      paymentMethod: input.paymentMethod ?? null,
    },
  });

  return mapCustomerToAccount(customer);
}

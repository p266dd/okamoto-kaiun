"use server";

import type { PrismaClient } from "@/lib/prisma/generate/client";
import prisma from "@/lib/prisma";

type Model = keyof Omit<
  PrismaClient,
  // Exclude internal methods/properties.
  | "$connect"
  | "$disconnect"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$on"
  | "$queryRaw"
  | "$queryRawUnsafe"
  | "$transaction"
  | "$use"
  | "$extends"
>;

/**
 * Creates a new record for the specified model.
 * @param model The name of the Prisma model (e.g., 'user', 'staff').
 * @param payload The data to create the record with.
 * @param options Optional arguments for the create operation (e.g., select, include).
 * @returns The created record.
 * @throws PrismaClientKnownRequestError if the database request fails.
 */
export async function create(model: Model, payload: object, options?: object) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.create({
      data: payload,
      ...options,
    });
    return result;
  } catch (error) {
    console.error(`[Access Error] Could not create record in ${String(model)}:`, error);
    throw error; // Re-throw for upstream handling.
  }
}

/**
 * Finds a unique record by its ID or other unique criteria.
 * @param model The name of the Prisma model.
 * @param args Arguments for the findUnique operation (e.g., where, select, include).
 * @returns The found record or null if not found.
 * @throws PrismaClientKnownRequestError if the database request fails.
 */
export async function findUnique(model: Model, args: object, options?: object) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const record = await delegate.findUnique(args, { ...options });
    return record;
  } catch (error) {
    console.error(
      `[Access Error] Could not fetch unique record from ${String(
        model
      )} with args ${JSON.stringify(args)}:`,
      error
    );
    throw error;
  }
}

/**
 * Finds multiple records based on the provided criteria.
 * @param model The name of the Prisma model.
 * @param args Optional arguments for the findMany operation (e.g., where, orderBy, select, include, skip, take).
 * @returns An array of found records.
 * @throws PrismaClientKnownRequestError if the database request fails.
 */
export async function findMany(model: Model, args?: object, options?: object) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const records = await delegate.findMany(args, { ...options });
    return records;
  } catch (error) {
    console.error(
      `[Access Error] Could not fetch records from ${String(model)} with args ${JSON.stringify(
        args
      )}:`,
      error
    );
    throw error;
  }
}

/**
 * Updates records matching the criteria.
 * @param model The name of the Prisma model.
 * @param payload The data to update the record(s) with.
 * @param options Arguments for the update operation (must include 'where'; e.g., select, include).
 * @returns The updated record or records.
 * @throws PrismaClientKnownRequestError (e.g., P2025 if record to update is not found).
 */
export async function update(
  model: Model,
  payload: object,
  options: object // Requires 'where', can include 'select', 'include'.
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.update({
      data: payload,
      ...options,
    });
    return result;
  } catch (error) {
    console.error(
      `[Access Error] Could not update record in ${String(model)} with options ${JSON.stringify(
        options
      )}:`,
      error
    );
    throw error;
  }
}

/**
 * Deletes records matching the criteria.
 * Adheres to the requested 3-parameter structure (model, payload, options).
 * The 'payload' parameter is unused for delete operations as Prisma's delete action doesn't take a 'data' payload.
 * @param model The name of the Prisma model.
 * @param _payload This parameter is unused for delete operations. Pass null or undefined.
 * @param options Arguments for the delete operation (must include 'where'; e.g., select).
 * @returns The deleted record or result of deleteMany.
 * @throws PrismaClientKnownRequestError (e.g., P2025 if record to delete is not found).
 */
export async function remove(
  model: Model,
  _payload: unknown, // Parameter present to match requested signature, but unused.
  options: object // Requires 'where', can include 'select'.
) {
  // _payload is ignored as Prisma's delete operation does not use a 'data' field.
  // The 'where' clause and other options are expected in the 'options' object.

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.delete({ ...options });
    return result;
  } catch (error) {
    console.error(
      `[Access Error] Could not delete record in ${String(model)} with options ${JSON.stringify(
        options
      )}:`,
      error
    );
    throw error;
  }
}

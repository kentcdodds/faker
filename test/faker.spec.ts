import type { SpyInstance } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { faker, Faker } from '../src';
import { FakerError } from '../src/errors/faker-error';

describe('faker', () => {
  it('should throw error if no locales passed', () => {
    expect(() => new Faker({ locale: [] })).toThrow(
      new FakerError(
        'The locale option must contain at least one locale definition.'
      )
    );
  });

  it('should not log anything on startup', () => {
    const spies: SpyInstance[] = Object.keys(console)
      .filter((key) => typeof console[key] === 'function')
      .map((methodName) =>
        vi.spyOn(console, methodName as keyof typeof console)
      );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('..').faker;

    new Faker({ locale: { metadata: { title: '' } } });

    for (const spy of spies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
  });

  describe('getMetadata()', () => {
    it('should return metadata for the locale', () => {
      expect(faker.getMetadata()).toBeDefined();
      expect(faker.getMetadata().title).toBeTypeOf('string');
      // Not all properties are tested here, see locale-imports.spec.ts for full tests
    });
  });

  describe('rawDefinitions', () => {
    it('locale rawDefinition accessibility', () => {
      // Metadata
      expect(faker.rawDefinitions.metadata.title).toBeDefined();
      // Standard modules
      expect(faker.rawDefinitions.location?.city_name).toBeDefined();
      // Non-existing module
      expect(faker.rawDefinitions.missing).toBeUndefined();
      // Non-existing definition in a non-existing module
      expect(faker.rawDefinitions.missing?.missing).toBeUndefined();
      // Non-existing definition in an existing module
      expect(faker.rawDefinitions.location?.missing).toBeUndefined();
    });
  });

  describe('definitions', () => {
    it('locale definition accessibility', () => {
      // Metadata
      expect(faker.definitions.metadata.title).toBeDefined();
      // Standard modules
      expect(faker.definitions.location.city_name).toBeDefined();
      // Non-existing module
      expect(faker.definitions.missing).toBeDefined();
      // Non-existing definition in a non-existing module
      expect(() => faker.definitions.missing.missing).toThrow();
      // Non-existing definition in an existing module
      expect(() => faker.definitions.location.missing).toThrow();
    });
  });

  // This is only here for coverage
  // The actual test is in mersenne.spec.ts
  describe('seed()', () => {
    it('seed()', () => {
      const seed = faker.seed();

      expect(seed).toBeDefined();
      expect(seed).toBeTypeOf('number');
    });

    it('should reset the sequence when calling `seed`', () => {
      const seed = faker.seed();

      const num1 = faker.number.int();

      const newSeed = faker.seed(seed);
      const num2 = faker.number.int();

      expect(num1).toBe(num2);
      expect(newSeed).toBe(seed);

      const num3 = faker.number.int();
      expect(num1).not.toBe(num3);
    });

    it('seed(number)', () => {
      faker.seed(1);

      const actual = faker.animal.cat();
      expect(actual).toBe('Korat');
    });

    it('seed(number[])', () => {
      faker.seed([1, 2, 3]);

      const actual = faker.animal.cat();
      expect(actual).toBe('Oriental');
    });
  });

  describe('clone', () => {
    it('should create a clone that returns the same values as the original', () => {
      const clone1 = faker.clone();
      const clone2 = faker.clone();
      const clone3 = clone1.clone();

      expect(clone1).not.toBe(faker);
      expect(clone2).not.toBe(faker);
      expect(clone3).not.toBe(faker);
      expect(clone1).not.toBe(clone2);
      expect(clone1).not.toBe(clone3);
      expect(clone2).not.toBe(clone3);

      const valueOrg = faker.number.int();
      expect(clone1.number.int()).toBe(valueOrg);
      expect(clone2.number.int()).toBe(valueOrg);
      expect(clone3.number.int()).toBe(valueOrg);

      const value1 = clone1.number.int();
      expect(faker.number.int()).toBe(value1);
      expect(clone2.number.int()).toBe(value1);
      expect(clone3.number.int()).toBe(value1);

      const value2 = clone2.number.int();
      expect(clone1.number.int()).toBe(value2);
      expect(faker.number.int()).toBe(value2);
      expect(clone3.number.int()).toBe(value2);

      const value3 = clone3.number.int();
      expect(clone1.number.int()).toBe(value3);
      expect(clone2.number.int()).toBe(value3);
      expect(faker.number.int()).toBe(value3);
    });
  });

  describe('derive', () => {
    it("should create a derived faker, that doesn't affect the original", () => {
      const seed = faker.seed();
      faker.number.int();
      const value = faker.number.int();

      faker.seed(seed);
      const derived = faker.derive();

      expect(derived).not.toBe(faker);

      for (let i = 0; i < derived.number.int(100); i++) {
        derived.number.int();
      }

      expect(faker.number.int()).toBe(value);
    });
  });

  describe('defaultRefDate', () => {
    it('should be a defined', () => {
      expect(faker.defaultRefDate).toBeDefined();
    });

    it('should be a date in the very recent past', () => {
      const start = Date.now();
      const refDate = faker.defaultRefDate().getTime();
      const end = Date.now();
      expect(refDate).toBeGreaterThanOrEqual(start);
      expect(refDate).toBeLessThanOrEqual(end);
    });
  });
});

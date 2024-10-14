  declare module 'objection-js-soft-delete' {
    import { Model, QueryBuilder, ReferenceBuilder, ReferenceFunction } from 'objection';

    class SoftDeleteQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
      ArrayQueryBuilderType: SoftDeleteQueryBuilder<M>;

      NumberQueryBuilderType: SoftDeleteQueryBuilder<M, number>;

      delete(): this['NumberQueryBuilderType'];
      hardDelete(): this['NumberQueryBuilderType'];
      undelete(): this['NumberQueryBuilderType'];
      whereDeleted(): this['ArrayQueryBuilderType'];
      whereNotDeleted(): this['ArrayQueryBuilderType'];
    }

    interface SoftDeleteInstance<T extends typeof Model> {
      //@ts-ignore
      QueryBuilderType: SoftDeleteQueryBuilder<this, this[]>;
    }

    interface SoftDeleteStatic<T extends typeof Model> {
      QueryBuilder: typeof SoftDeleteQueryBuilder;
      isSoftDelete: boolean;
      namedFilters(): object;
      new (): SoftDeleteInstance<T> & T['prototype'];
    }

    export default function softDelete<T extends typeof Model>(
      options?: Partial<{
        columnName: string;
        deletedValue: () => Date | boolean | number;
        notDeletedValue: () => boolean | null;
        whereDeleted: (qb: QueryBuilder<InstanceType<T>>, columnRef: ReferenceBuilder ) => QueryBuilder<InstanceType<T>>;
        whereNotDeleted: (qb: QueryBuilder<InstanceType<T>>, columnRef: ReferenceBuilder ) => QueryBuilder<InstanceType<T>>;
      }>,
    ): (model: T) => Omit<T, 'new'> & SoftDeleteStatic<T>;
  }
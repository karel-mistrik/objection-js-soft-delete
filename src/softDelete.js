const softDelete = (incomingOptions) => {
    const options = {
        columnName: 'deleted_at',
        deletedValue: () => new Date(),
        notDeletedValue: () => null,
        ...incomingOptions,
    };
    return (Model) => {
        class SDQueryBuilder extends Model.QueryBuilder {
            // override the normal delete function with one that patches the row's "deleted" column
            delete() {
                this.context({
                    softDelete: true,
                });
                const patch = {};
                patch[options.columnName] = options.deletedValue();
                return this.patch(patch);
            }

            // provide a way to actually delete the row if necessary
            hardDelete() {
                return super.delete();
            }

            // provide a way to undo the delete
            undelete() {
                this.context({
                    undelete: true,
                });
                const patch = {};
                patch[options.columnName] = options.notDeletedValue();
                return this.patch(patch);
            }

            // provide a way to filter to ONLY deleted records without having to remember the column name
            whereDeleted() {
                const columnRef = this.modelClass().ref(options.columnName);
                // this if is for backwards compatibility, to protect those that used a nullable `deleted` field
                if (options.deletedValue === true) {
                    return this.where(columnRef, options.deletedValue());
                }

                // use custom whereDeleted function if specified
                const baseModel = this.modelClass();
                if (typeof baseModel.whereDeletedHelper === 'function') {
                    return baseModel.whereDeletedHelper();
                } else {
                    // qualify the column name
                    return this.whereNot(columnRef, options.notDeletedValue());
                }
            }

            // provide a way to filter out deleted records without having to remember the column name
            whereNotDeleted() {
                const columnRef = this.modelClass().ref(options.columnName);

                // use custom whereNotDeleted function if specified
                console.log(typeof options.whereNotDeleted);

                // Call whereNotDeletedHelper from BaseModel
                const baseModel = this.modelClass();
                if (typeof baseModel.whereNotDeletedHelper === 'function') {
                    return baseModel.whereNotDeletedHelper();
                } else {
                    // qualify the column name
                    return this.where(columnRef, options.notDeletedValue());
                }
            }
        }
        return class extends Model {
            static get QueryBuilder() {
                return SDQueryBuilder;
            }
            static get modifiers() {
                return {
                    ...super.modifiers,
                    notDeleted(builder) {
                        builder.whereNotDeleted();
                    },
                    deleted(builder) {
                        builder.whereDeleted();
                    },
                };
            }
            static get isSoftDelete() {
                return true;
            }
        };
    };
};

export default softDelete;

import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateShortUrlsTable1732758784617 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:'short_urls',
                columns:[
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                      },
                      {
                        name: 'origin',
                        type: 'varchar',
                      },
                      {
                        name: 'short',
                        type: 'varchar',
                      },
                      {
                        name: 'count',
                        type: 'int',
                        default:0
                      },
                      {
                        name: 'is_active',
                        type: 'boolean',
                        default:true
                      },
                      {
                        name: 'user_id',
                        type: 'int',
                        isNullable:true
                      },
                      {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                      },
                      {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                      },
                      {
                        name: 'deleted_at',
                        type: 'timestamp',
                        default: null,
                        isNullable:true,
                      },
                ],
                foreignKeys:[
                    {
                        columnNames: ['user_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        // onDelete: 'CASCADE',
                    },
                ]
            })
        ) 
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('short_urls');
        const foreignKeys = table.foreignKeys;
    
        await Promise.all(
          foreignKeys.map(async (fk) => {
            await queryRunner.dropForeignKey('short_urls', fk);
          }),
        );
    
    }

}

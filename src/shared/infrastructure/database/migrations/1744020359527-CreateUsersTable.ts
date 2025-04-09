import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1744020359527 implements MigrationInterface {
  name = 'CreateUsersTable1744020359527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users"
                             (
                                 "id"            uuid                     NOT NULL,
                                 "email"         character varying(255)   NOT NULL,
                                 "password_hash" character varying(255)   NOT NULL,
                                 "given_name"    character varying(100)   NOT NULL,
                                 "family_name"   character varying(100)   NOT NULL,
                                 "telephone"     character varying(50),
                                 "image_url"     text,
                                 "is_active"     boolean                  NOT NULL DEFAULT true,
                                 "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "last_login_at" TIMESTAMP WITH TIME ZONE,
                                 "deleted_at"    TIMESTAMP WITH TIME ZONE,
                                 CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                                 CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_073999dfec9d14522f0cf58cd6" ON "users" ("deleted_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_073999dfec9d14522f0cf58cd6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

# Migration `20200705120157-remove-versions--add-votes`

This migration has been generated by Sven Liebig at 7/5/2020, 12:01:57 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."Vote" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"linkId" INTEGER NOT NULL  ,"userId" INTEGER NOT NULL  ,FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE UNIQUE INDEX "quaint"."Vote.linkId_userId" ON "Vote"("linkId","userId")

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."Version";;
PRAGMA foreign_keys=on

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200703114846-hinzufuegen-von-version..20200705120157-remove-versions--add-votes
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource sb {
     provider = "sqlite"
-    url = "***"
+    url = "***"
 }
 generator client {
     provider = "prisma-client-js"
@@ -13,18 +13,25 @@
   description String
   url         String
   postedBy    User?    @relation(fields: [postedById], references: [id])
   postedById  Int?
+  votes Vote[]
 }
 model User {
   id        Int      @id @default(autoincrement())
   name      String
   email     String   @unique
   password  String
   links     Link[]
+  votes Vote[]
 }
-model Version {
-  id        Int      @id @default(autoincrement())
-  version   String
+model Vote {
+  id Int @id @default(autoincrement())
+  link Link @relation(fields: [linkId], references: [id])
+  linkId Int
+  user User @relation(fields: [userId], references: [id])
+  userId Int
+
+  @@unique([linkId, userId])
 }
```


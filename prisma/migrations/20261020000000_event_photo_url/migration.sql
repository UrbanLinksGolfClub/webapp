-- Optional admin-uploaded photo for an event, independent of the
-- existing stock photoKey enum. NULL means "use photoKey as before".
ALTER TABLE "events" ADD COLUMN "photoUrl" TEXT;

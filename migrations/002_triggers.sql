-- 1. Each transaction must sum to zero
CREATE FUNCTION assert_txn_balanced() RETURNS trigger AS $$ BEGIN IF (
  SELECT COALESCE(SUM(amount), 0)
  FROM entries
  WHERE transaction_id = NEW.transaction_id
) <> 0 THEN RAISE EXCEPTION 'transaction % is not balanced',
NEW.transaction_id;
END IF;
RETURN NULL;
END $$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER entries_balanced
AFTER
INSERT ON entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_txn_balanced();
-- 2. Entries are immutable
CREATE FUNCTION forbid_entry_change() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'entries are append-only';
END $$ LANGUAGE plpgsql;
CREATE TRIGGER entries_immutable BEFORE
UPDATE
  OR DELETE ON entries FOR EACH ROW EXECUTE FUNCTION forbid_entry_change();
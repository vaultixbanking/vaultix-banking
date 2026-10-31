-- Funding rows created before the status system used 'COMPLETED' (the old default) for
-- credits that were applied immediately. The app now uses 'SUCCESSFUL' for that state,
-- and only SUCCESSFUL credits can be reversed.
UPDATE "funding_transactions" SET "status" = 'SUCCESSFUL' WHERE "status" = 'COMPLETED';

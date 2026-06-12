-- Migration AMC Host
-- Ajouter les colonnes iCal à la table appartements (si elles n'existent pas déjà)
ALTER TABLE appartements
  ADD COLUMN IF NOT EXISTS airbnb_ical TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS booking_ical TEXT DEFAULT '';

-- Vérification des colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appartements' 
  AND column_name IN ('airbnb_ical', 'booking_ical');

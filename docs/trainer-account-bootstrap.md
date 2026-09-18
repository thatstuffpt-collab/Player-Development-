# Trainer account bootstrap

Production trainer email: `shandonhicks10@yahoo.com`

The application `User` row is created through the production migration pipeline with role `TRAINER`. The Firebase UID is intentionally left unset until the first successful Firebase sign-in. At that point, server-side authorization links the verified Firebase UID to the existing application user by normalized email.

This file documents the one-time bootstrap so future sessions do not recreate or duplicate the trainer record.

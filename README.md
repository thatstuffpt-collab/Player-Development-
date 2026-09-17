# That's Tuff Player Development — V1 Coach MVP

This first working version is designed to test the coach workflow before adding a cloud database and parent portal.

## Included
- Create/edit players
- Save 12-category evaluations
- Keep evaluation history
- Goals and completion tracking
- Assigned workouts
- Achievements
- Private coach notes
- Browser-based data saving
- Export/import JSON backups
- Mobile-friendly layout

## Run it
Open `index.html` in a modern browser.

If your browser blocks local file behavior, run a small local server from this folder:

`python3 -m http.server 8000`

Then open `http://localhost:8000`.

## Important limitation
This test version stores data in the browser using localStorage. It does not yet sync between devices and it does not have secure user accounts. Do not treat it as the final production database for client information.

## Next build after testing
Connect the same workflow to a secure cloud database and authentication, then add parent/player access and shareable evaluation reports.

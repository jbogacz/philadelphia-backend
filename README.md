# Technical Requirements

- Node.js version: 22.11.x
- npm version: 10.9.x

## Docker Environment

Required containers from docker-compose:
- MongoDB latest

# MongoDB migration

To create new migration script please run `npm run migrate:create my-first-migration`

# Technical debt:

- For a more efficient date library with better timezone support, I recommend consider switching from `date-fns` to `Day.js` as an excellent alternative to date-fns. It's significantly more lightweight (only ~2KB minified) while providing similar functionality and excellent timezone handling.
- `date-fns` introduce performance issues when importing a whole module like `import { format } from 'date-fns';`

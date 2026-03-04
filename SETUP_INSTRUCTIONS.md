# Shadcn/TypeScript Migration Instructions

The current project setup is React + Vite (JavaScript) with Tailwind CSS manually configured.

If you wish to fully migrate to a TypeScript and standard Shadcn UI structure, follow these steps:

1.  **Install TypeScript**:
    ```bash
    npm install -D typescript @types/react @types/react-dom @types/node
    ```

2.  **Initialize TypeScript**:
    -   Create a `tsconfig.json` file.
    -   Rename `.jsx` files to `.tsx` and `.js` files to `.ts`.

3.  **Initialize shadcn-ui**:
    ```bash
    npx shadcn@latest init
    ```
    -   Follow the prompts to configure `components.json`.
    -   This will set up the `components/ui` folder structure and aliases (like `@/`).

4.  **Update Aliases**:
    -   Update `vite.config.js` to support path aliases (e.g., `@/` pointing to `./src`).

For now, the project uses a hybrid approach where new components (like `Slideshow`) use Tailwind and `clsx` manually, integrated into the existing JS structure.

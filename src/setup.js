#!/usr/bin/env node

/**
 * Next.js Performance Booster CLI
 * Developed by Mahmoud Elsawah
 * LinkedIn: https://www.linkedin.com/in/mahmoud-elsawah-198413219/
 */

import { execSync } from "child_process";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Failed to execute command: ${command}`);
    process.exit(1);
  }
};

// Initialize a new Next.js project
const createNextApp = async () => {
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "📁 Enter your project name:",
      default: "nextjs-app",
    },
  ]);

  console.log(`🚀 Creating a new Next.js app: ${projectName}...`);
  runCommand(
    `npx create-next-app@latest ${projectName} --eslint --tailwind --app`
  );
  return projectName;
};

// Configure next.config.mjs
const configureNextJs = (projectPath) => {
  const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 0,
        },
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
  `;

  fs.writeFileSync(path.join(projectPath, "next.config.mjs"), nextConfig);
  console.log("✅ next.config.mjs has been successfully updated.");
};

// Configure tailwind.config.mjs
const configureTailwindCss = (projectPath, uiLibrary) => {
  let uiPlugin = "";
  switch (uiLibrary) {
    case "shadcn":
      uiPlugin = ""; 
      break;
    case "flowbite":
      uiPlugin = `require('flowbite/plugin')`;
      break;
    case "daisyui":
      uiPlugin = `require('daisyui')`;
      break;
    case "flowbite-react":
      uiPlugin = ""; 
      break;
  }

  const tailwindConfig = `
import withPurgeCss from 'next-purgecss';

/** @type {import('tailwindcss').Config} */
export default withPurgeCss({
  purge: {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [${uiPlugin}],
});
  `;

  fs.writeFileSync(
    path.join(projectPath, "tailwind.config.mjs"),
    tailwindConfig
  );
  console.log("✅ tailwind.config.mjs has been successfully updated.");
};


// Install a single UI library
const installUiLibrary = async (projectPath) => {
  const { uiLibrary } = await inquirer.prompt([
    {
      type: "list",
      name: "uiLibrary",
      message: "🎨 Select a UI library to use:",
      choices: ["shadcn", "flowbite", "daisyui", "flowbite-react"],
    },
  ]);

  const uiLibraries = {
    shadcn: "@shadcn/ui@latest",
    flowbite: "flowbite@latest",
    daisyui: "daisyui@latest",
    "flowbite-react": "flowbite-react@latest",
  };

  console.log(`📦 Installing ${uiLibrary}...`);
  runCommand(`cd ${projectPath} && npm install ${uiLibraries[uiLibrary]}`);
  console.log(`✅ Successfully installed ${uiLibrary}.`);
};

// Run the setup process
const setupProject = async () => {
  const projectPath = await createNextApp();

  console.log("📦 Installing next-purgecss...");
  runCommand(`cd ${projectPath} && npm install next-purgecss --save-dev`);
  console.log("✅ Successfully installed next-purgecss.");

  configureNextJs(projectPath);
  configureTailwindCss(projectPath);
  await installUiLibrary(projectPath);

  console.log("🎉 Next.js project setup completed successfully!");
  console.log(`💻 Run the following command to start your project:`);
  console.log(`  cd ${projectPath} && npm run dev`);
};

setupProject();
